import { createContext, useContext, useEffect, useRef } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import { Notifications } from 'react-native-notifications';
import messaging from '@react-native-firebase/messaging';
import { toast as reactNativeToast, ToastPosition } from '@backpackapp-io/react-native-toast';
import useStorage from '../hooks/use-storage';

const requestAndroidNotificationPermission = async () => {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
        const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);

        return result === PermissionsAndroid.RESULTS.GRANTED;
    }

    return true;
};

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useStorage('_push_notifications', []);
    const [lastNotification, setLastNotification] = useStorage('_last_push_notification');
    const [deviceToken, setDeviceToken] = useStorage('_device_token');
    const notificationListeners = useRef([]);

    // Function to add a listener
    const addNotificationListener = (callback) => {
        notificationListeners.current.push(callback);
    };

    // Function to remove a listener
    const removeNotificationListener = (callback) => {
        notificationListeners.current = notificationListeners.current.filter((listener) => listener !== callback);
    };

    useEffect(() => {
        const registerRemoteNotifications = async () => {
            console.log('[NotificationContext] Starting FCM registration...');
            console.log('[NotificationContext] Platform:', Platform.OS, 'Version:', Platform.Version);

            const granted = await requestAndroidNotificationPermission();
            console.log('[NotificationContext] Notification permission granted:', granted);

            if (granted) {
                console.log('[NotificationContext] Calling Notifications.registerRemoteNotifications()...');
                Notifications.registerRemoteNotifications();

                // Also try Android-specific method
                if (Platform.OS === 'android') {
                    console.log('[NotificationContext] Also calling Android.registerRemoteNotifications()...');
                    try {
                        Notifications.android.registerRemoteNotifications();
                    } catch (err) {
                        console.error('[NotificationContext] Android-specific registration error:', err);
                    }
                }

                // Check if registration was successful after a delay
                setTimeout(async () => {
                    try {
                        const isRegistered = await Notifications.isRegisteredForRemoteNotifications();
                        console.log('[NotificationContext] Is registered for remote notifications:', isRegistered);

                        // If registered but no token received via callback, manually fetch it using Firebase
                        if (isRegistered && !deviceToken) {
                            console.log('[NotificationContext] ⚠️ Registered but token callback never fired. Manually fetching token via Firebase Messaging...');

                            try {
                                const fcmToken = await messaging().getToken();
                                if (fcmToken) {
                                    console.log('[NotificationContext] ✅ Got FCM token from Firebase Messaging!');
                                    console.log('[NotificationContext] Token:', fcmToken);
                                    setDeviceToken(fcmToken);
                                } else {
                                    console.error('[NotificationContext] ❌ Firebase Messaging returned null token');
                                }
                            } catch (error) {
                                console.error('[NotificationContext] ❌ Error fetching token from Firebase Messaging:', error);
                            }
                        }
                    } catch (err) {
                        console.error('[NotificationContext] Failed to check registration status:', err);
                    }
                }, 2000);
            } else {
                console.warn('[NotificationContext] Notification permission denied - FCM token will not be registered');
            }
        };

        registerRemoteNotifications();

        // FCM Foreground message handler (CRITICAL for receiving FCM messages when app is open)
        const unsubscribeForegroundMessages = messaging().onMessage(async (remoteMessage) => {
            console.log('[NotificationContext] FCM message received in foreground:', remoteMessage);

            // Convert FCM message to notification format
            const notification = {
                payload: remoteMessage.data || {},
                title: remoteMessage.notification?.title,
                body: remoteMessage.notification?.body,
                ...remoteMessage,
            };

            setLastNotification(notification);
            setNotifications((prev) => [...prev, notification]);

            // Notify all listeners
            notificationListeners.current.forEach((listener) => listener(notification, 'received'));

            // Display the notification when app is in foreground
            if (remoteMessage.notification) {
                // Show a toast notification to the user
                const notificationTitle = remoteMessage.notification.title || 'Notification';
                const notificationBody = remoteMessage.notification.body || '';

                console.log('[NotificationContext] Showing toast notification...');

                // Show toast notification with app name prefix
                reactNativeToast(`Rapide\n${notificationTitle}\n${notificationBody}`, {
                    duration: 4000,
                    position: ToastPosition.TOP,
                    styles: {
                        view: {
                            backgroundColor: '#4A5568',
                            borderRadius: 12,
                            paddingVertical: 14,
                            paddingHorizontal: 16,
                            marginTop: 50,
                            marginHorizontal: 16,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.25,
                            shadowRadius: 3.84,
                            elevation: 5,
                        },
                        text: {
                            color: '#FFFFFF',
                            fontSize: 14,
                            lineHeight: 20,
                        },
                    },
                });
                console.log('[NotificationContext] Toast notification called');

                // Also post a local notification for the notification tray
                try {
                    Notifications.postLocalNotification({
                        identifier: remoteMessage.messageId || `fcm-${Date.now()}`,
                        body: remoteMessage.notification.body || '',
                        title: remoteMessage.notification.title || '',
                        sound: 'default',
                        badge: 1,
                        type: '',
                        thread: '',
                        payload: remoteMessage.data || {},
                    });
                } catch (error) {
                    console.error('[NotificationContext] Error posting local notification:', error);
                }
            }
        });

        // Foreground notification handler (for local notifications)
        const notificationDisplayedListener = Notifications.events().registerNotificationReceivedForeground((notification, completion) => {
            console.log('[NotificationContext] Local notification received in foreground:', notification);
            setLastNotification(notification);
            setNotifications((prev) => [...prev, notification]);

            // Notify all listeners
            notificationListeners.current.forEach((listener) => listener(notification, 'received'));

            completion({ alert: true, sound: true, badge: false });
        });

        // Notification opened handler
        const notificationOpenedListener = Notifications.events().registerNotificationOpened((notification, completion, action) => {
            console.log('[NotificationContext] Notification opened:', notification);
            setLastNotification(notification);

            // Notify all listeners (optional, based on use case)
            notificationListeners.current.forEach((listener) => listener(notification, 'opened'));

            completion();
        });

        // Remote notifications registered successfully
        const registeredListener = Notifications.events().registerRemoteNotificationsRegistered((event) => {
            console.log('[NotificationContext] ✅ FCM Token Received!');
            console.log('[NotificationContext] Token:', event.deviceToken);
            setDeviceToken(event.deviceToken);
        });

        // Failed to register for remote notifications
        const registrationFailedListener = Notifications.events().registerRemoteNotificationsRegistrationFailed((error) => {
            console.error('[NotificationContext] ❌ FCM Registration Failed!');
            console.error('[NotificationContext] Error:', error);
            console.error('[NotificationContext] Error details:', JSON.stringify(error, null, 2));
        });

        // Clean up listeners on unmount
        return () => {
            unsubscribeForegroundMessages();
            notificationDisplayedListener.remove();
            notificationOpenedListener.remove();
            registeredListener.remove();
            registrationFailedListener.remove();
        };
    }, []);

    return (
        <NotificationContext.Provider value={{ notifications, lastNotification, deviceToken, addNotificationListener, removeNotificationListener }}>{children}</NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};
