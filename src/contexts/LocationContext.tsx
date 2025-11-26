import React, { createContext, useState, useEffect, useCallback, useContext, useMemo } from 'react';
import { Place, Point } from '@fleetbase/sdk';
import { isEmpty, config } from '../utils';
import { useAuth } from './AuthContext';
import useStorage from '../hooks/use-storage';
import useFleetbase from '../hooks/use-fleetbase';

// Temporary flag to disable background geolocation (set to false to enable)
const DISABLE_BACKGROUND_GEOLOCATION = true;

// Lazy load BackgroundGeolocation only when needed to avoid license validation
let BackgroundGeolocation: any = null;
let BackgroundFetch: any = null;

if (!DISABLE_BACKGROUND_GEOLOCATION) {
    BackgroundGeolocation = require('react-native-background-geolocation').default;
    BackgroundFetch = require('react-native-background-fetch').default;
}

const LocationContext = createContext({
    location: null,
    isTracking: false,
    startTracking: () => {},
    stopTracking: () => {},
    getDriverLocationAsPlace: () => null,
    trackLocation: () => {},
});

export const LocationProvider = ({ children }) => {
    const { isOnline, driver, trackDriver } = useAuth();
    const { adapter } = useFleetbase();
    const [authToken] = useStorage('_driver_token');
    const [location, setLocation] = useStorage(`${driver?.id ?? 'anon'}_location`, {});
    const [isTracking, setIsTracking] = useState(false);

    // Manually track location
    const trackLocation = useCallback(async () => {
        if (DISABLE_BACKGROUND_GEOLOCATION) {
            console.log('[LocationContext] Background geolocation is disabled');
            return;
        }
        try {
            const location = await BackgroundGeolocation.getCurrentPosition({
                samples: 3,
                desiredAccuracy: 1,
                extras: {
                    event: 'getCurrentPosition',
                },
            });
            setLocation(location);
            trackDriver(location.coords);
        } catch (error) {
            console.warn('Error attempting to track and update location:', error);
        }
    }, [trackDriver]);

    // Get the drivers location as a Place
    const getDriverLocationAsPlace = useCallback(
        (attributes = {}) => {
            const { coords } = location;

            // Return null if coords are not available
            if (!coords || !coords.latitude || !coords.longitude) {
                return null;
            }

            return new Place(
                {
                    id: 'driver',
                    name: 'Driver Location',
                    street1: 'Driver Location',
                    location: new Point(coords.latitude, coords.longitude),
                    ...attributes,
                },
                adapter
            );
        },
        [location, adapter]
    );

    // Get the HTTP configuration for background geolocation tracking
    const getHttpConfig = useCallback(() => {
        if (!adapter || !driver || !authToken) return {};

        return {
            url: `${adapter.host}/${adapter.namespace}/drivers/${driver.id}/track`,
            headers: {
                Authorization: `Bearer ${authToken}`,
                'Content-Type': 'application/json',
                'User-Agent': '@fleetbase/navigator-app',
            },
            httpRootProperty: '.',
            locationTemplate:
                '{"latitude":<%= latitude %>,"longitude":<%= longitude %>,"heading":<%= heading %>,"speed":<%= speed %>,"altitude":<%= altitude %>,"timestamp":"<%= timestamp %>","activity":"<%= activity.type %>","is_moving":<%= is_moving %>,"battery":{"level":<%= battery.level %>,"is_charging":<%= battery.is_charging %>}}',
        };
    }, [adapter, driver, authToken]);

    // Callback to handle activity updates.
    const onMotionChange = useCallback(
        (event) => {
            console.log('[BackgroundGeolocation] onMotionChange:', event);
            if (event.location) {
                onLocation(event.location);
            }
        },
        [onLocation]
    );

    // Callback to handle location updates.
    const onLocation = useCallback((location) => {
        console.log('[BackgroundGeolocation] onLocation:', location);
        setLocation(location);
    }, []);

    // Callback to handle location errors.
    const onLocationError = useCallback((error) => {
        console.warn('[BackgroundGeolocation] onLocationError:', error);
    }, []);

    // Function to start tracking.
    const startTracking = useCallback(() => {
        if (DISABLE_BACKGROUND_GEOLOCATION) {
            console.log('[LocationContext] Background geolocation is disabled, skipping start');
            return;
        }
        try {
            BackgroundGeolocation.start(() => {
                setIsTracking(true);
                console.log('[BackgroundGeolocation] Tracking started');
            });
        } catch (error) {
            console.warn('[BackgroundGeolocation] Failed to start tracking:', error);
        }
    }, []);

    // Function to stop tracking.
    const stopTracking = useCallback(() => {
        if (DISABLE_BACKGROUND_GEOLOCATION) {
            console.log('[LocationContext] Background geolocation is disabled, skipping stop');
            return;
        }
        try {
            BackgroundGeolocation.stop(() => {
                setIsTracking(false);
                console.log('[BackgroundGeolocation] Tracking stopped');
            });
        } catch (error) {
            console.warn('[BackgroundGeolocation] Failed to stop tracking:', error);
        }
    }, []);

    useEffect(() => {
        if (!driver || DISABLE_BACKGROUND_GEOLOCATION) {
            if (DISABLE_BACKGROUND_GEOLOCATION) {
                console.log('[LocationContext] Background geolocation is disabled, skipping initialization');
            }
            return;
        }

        try {
            BackgroundGeolocation.ready(
                {
                    backgroundPermissionRationale: {
                        title: `Allow ${config('APP_NAME')} to access your location`,
                        message: `${config('APP_NAME')} collects location data to update your position in real-time, even when the app is closed or running in the background. This allows dispatchers and ops teams to track your progress and provide better support while you drive.`,
                        positiveAction: 'Allow',
                        negativeAction: 'Deny',
                    },
                    desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
                    distanceFilter: 10,
                    stopOnTerminate: false,
                    startOnBoot: true,
                    stopTimeout: 1,
                    debug: false,
                    ...getHttpConfig(),
                },
                (state) => {
                    console.log('[BackgroundGeolocation] is ready:', state);
                    if (isOnline) {
                        startTracking();
                    }
                }
            );

            // Subscribe to location events.
            BackgroundGeolocation.onLocation(onLocation, onLocationError);

            // Subscribe to motion and activity events.
            BackgroundGeolocation.onMotionChange(onMotionChange);

            // Clean up the listener when unmounting.
            return () => {
                BackgroundGeolocation.removeListeners();
            };
        } catch (error) {
            console.warn('[BackgroundGeolocation] Failed to initialize (license may be missing):', error);
        }
    }, [driver, onLocation, onLocationError, onMotionChange, isOnline, getHttpConfig]);

    // Configure BackgroundFetch for periodic tasks.
    useEffect(() => {
        if (DISABLE_BACKGROUND_GEOLOCATION) {
            console.log('[LocationContext] Background geolocation is disabled, skipping BackgroundFetch');
            return;
        }
        try {
            BackgroundFetch.configure(
                {
                    minimumFetchInterval: 5,
                    stopOnTerminate: false,
                    startOnBoot: true,
                },
                async (taskId) => {
                    await trackLocation();
                    BackgroundFetch.finish(taskId);
                },
                (error) => {
                    console.warn('[BackgroundFetch] failed to configure:', error);
                }
            );
        } catch (error) {
            console.warn('[BackgroundFetch] Failed to initialize:', error);
        }
    }, [trackLocation]);

    // Toggle tracking based on the driver's online status.
    useEffect(() => {
        if (!driver) return;
        if (isOnline) {
            startTracking();
        } else {
            stopTracking();
        }

        if (isEmpty(location) && driver) {
            trackLocation();
        }
    }, [driver, isOnline, startTracking, stopTracking]);

    // Memoize the context value to prevent unnecessary re-renders.
    const value = useMemo(
        () => ({ location, isTracking, startTracking, stopTracking, getDriverLocationAsPlace, trackLocation }),
        [location, isTracking, startTracking, stopTracking, getDriverLocationAsPlace, trackLocation]
    );

    return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};

// Custom hook to use the LocationContext.
export const useLocation = () => {
    const context = useContext(LocationContext);
    if (context === undefined) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
};
