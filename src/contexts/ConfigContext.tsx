import { createContext, ReactNode, useCallback, useContext, useMemo } from 'react';
import { APP_NAME, APP_IDENTIFIER, APP_LINK_PREFIX, FLEETBASE_HOST, FLEETBASE_KEY, GOOGLE_MAPS_API_KEY } from '@env';
import Config from '../../navigator.config';
import useStorage from '../hooks/use-storage';
import { config, get, navigatorConfig, toBoolean } from '../utils';

const Env = {
    APP_NAME,
    APP_IDENTIFIER,
    APP_LINK_PREFIX,
    FLEETBASE_HOST,
    FLEETBASE_KEY,
    GOOGLE_MAPS_API_KEY,
};

const ConfigContext = createContext<any>(undefined);

export const ConfigProvider = ({ children }: { children: ReactNode }) => {
    const [instanceLinkedFleetbaseHost, setInstanceLinkedFleetbaseHost] = useStorage('INSTANCE_LINK_FLEETBASE_HOST');
    const [instanceLinkedFleetbaseKey, setInstanceLinkedFleetbaseKey] = useStorage('INSTANCE_LINK_FLEETBASE_KEY');
    const [instanceLinkedSocketclusterHost, setInstanceLinkedSocketclusterHost] = useStorage('INSTANCE_LINK_SOCKETCLUSTER_HOST');
    const [instanceLinkedSocketclusterPort, setInstanceLinkedSocketclusterPort] = useStorage('INSTANCE_LINK_SOCKETCLUSTER_PORT');
    const [instanceLinkedSocketclusterSecure, setInstanceLinkedSocketclusterSecure] = useStorage('INSTANCE_LINK_SOCKETCLUSTER_SECURE');
    console.log('Env FLEETBASE_KEY:', FLEETBASE_KEY);
    console.log('Env FLEETBASE_HOST:', FLEETBASE_HOST);

    const setInstanceLinkConfig = useCallback(
        (key, value) => {
            switch (key) {
                case 'API_HOST':
                case 'FLEETBASE_HOST':
                    setInstanceLinkedFleetbaseHost(value);
                    break;
                case 'API_KEY':
                case 'FLEETBASE_KEY':
                    setInstanceLinkedFleetbaseKey(value);
                    break;
                case 'SC_HOST':
                case 'SOCKETCLUSTER_HOST':
                    setInstanceLinkedSocketclusterHost(value);
                    break;
                case 'SC_PORT':
                case 'SOCKETCLUSTER_PORT':
                    setInstanceLinkedSocketclusterPort(value);
                    break;
                case 'SC_SECURE':
                case 'SOCKETCLUSTER_SECURE':
                    setInstanceLinkedSocketclusterSecure(value);
                    break;
            }
        },
        [setInstanceLinkedFleetbaseHost, setInstanceLinkedFleetbaseKey, setInstanceLinkedSocketclusterHost, setInstanceLinkedSocketclusterPort, setInstanceLinkedSocketclusterSecure]
    );

    const getInstanceLinkConfig = useCallback(() => {
        return {
            FLEETBASE_HOST: instanceLinkedFleetbaseHost,
            FLEETBASE_KEY: instanceLinkedFleetbaseKey,
            SOCKETCLUSTER_HOST: instanceLinkedSocketclusterHost,
            SOCKETCLUSTER_PORT: instanceLinkedSocketclusterPort,
            SOCKETCLUSTER_SECURE: instanceLinkedSocketclusterSecure,
        };
    }, [instanceLinkedFleetbaseHost, instanceLinkedFleetbaseKey, instanceLinkedSocketclusterHost, instanceLinkedSocketclusterPort, instanceLinkedSocketclusterSecure]);

    const clearInstanceLinkConfig = useCallback(() => {
        setInstanceLinkedFleetbaseHost(undefined);
        setInstanceLinkedFleetbaseKey(undefined);
        setInstanceLinkedSocketclusterHost(undefined);
        setInstanceLinkedSocketclusterPort(undefined);
        setInstanceLinkedSocketclusterSecure(undefined);
    }, [setInstanceLinkedFleetbaseHost, setInstanceLinkedFleetbaseKey, setInstanceLinkedSocketclusterHost, setInstanceLinkedSocketclusterPort, setInstanceLinkedSocketclusterSecure]);

    const resolveConnectionConfig = useCallback(
        (key, defaultValue = null) => {
            const fullConfig = {
                FLEETBASE_HOST: instanceLinkedFleetbaseHost ?? config('FLEETBASE_HOST'),
                FLEETBASE_KEY: instanceLinkedFleetbaseKey ?? config('FLEETBASE_KEY'),
                SOCKETCLUSTER_HOST: instanceLinkedSocketclusterHost ?? config('SOCKETCLUSTER_HOST', 'socket.fleetbase.io'),
                SOCKETCLUSTER_PORT: parseInt(instanceLinkedSocketclusterPort ?? config('SOCKETCLUSTER_PORT', '8000')),
                SOCKETCLUSTER_SECURE: toBoolean(instanceLinkedSocketclusterSecure ?? config('SOCKETCLUSTER_SECURE', true)),
                SOCKETCLUSTER_PATH: config('SOCKETCLUSTER_PATH', '/socketcluster/'),
            };

            return get(fullConfig, key, defaultValue);
        },
        [instanceLinkedFleetbaseHost, instanceLinkedFleetbaseKey, instanceLinkedSocketclusterHost, instanceLinkedSocketclusterPort, instanceLinkedSocketclusterSecure]
    );

    const value = useMemo(() => {
        const contextValue = {
            ...Config,
            ...Env,
            navigatorConfig,
            config,
            instanceLinkConfig: getInstanceLinkConfig(),
            getInstanceLinkConfig,
            resolveConnectionConfig,
            setInstanceLinkedFleetbaseHost,
            setInstanceLinkedFleetbaseKey,
            setInstanceLinkedSocketclusterHost,
            setInstanceLinkedSocketclusterPort,
            setInstanceLinkedSocketclusterSecure,
            setInstanceLinkConfig,
            clearInstanceLinkConfig,
        };
        console.log('[ConfigContext] Context value created:', {
            hasNavigatorConfig: !!contextValue.navigatorConfig,
            hasConfig: !!contextValue.config,
            envKeys: Object.keys(Env)
        });
        return contextValue;
    }, [
        getInstanceLinkConfig,
        resolveConnectionConfig,
        setInstanceLinkedFleetbaseHost,
        setInstanceLinkedFleetbaseKey,
        setInstanceLinkedSocketclusterHost,
        setInstanceLinkedSocketclusterPort,
        setInstanceLinkedSocketclusterSecure,
        setInstanceLinkConfig,
        clearInstanceLinkConfig,
        // Instance link config values
        instanceLinkedFleetbaseHost,
        instanceLinkedFleetbaseKey,
        instanceLinkedSocketclusterHost,
        instanceLinkedSocketclusterPort,
        instanceLinkedSocketclusterSecure,
    ]);

    return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
};

export const useConfig = () => {
    const context = useContext(ConfigContext);
    if (!context) {
        throw new Error('useConfig must be used within a ConfigProvider');
    }
    return context;
};
