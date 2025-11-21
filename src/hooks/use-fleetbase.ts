import Fleetbase from '@fleetbase/sdk';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useConfig } from '../contexts/ConfigContext';
import useStorage from './use-storage';
const useFleetbase = () => {
    const { resolveConnectionConfig } = useConfig();
    const FLEETBASE_KEY = resolveConnectionConfig('FLEETBASE_KEY');
    const FLEETBASE_HOST = resolveConnectionConfig('FLEETBASE_HOST');

    const [error, setError] = useState<Error | null>(null);
    const [authToken] = useStorage('_driver_token');
    const [fleetbase, setFleetbase] = useState<Fleetbase | null>(new Fleetbase(authToken ?? FLEETBASE_KEY, { host: FLEETBASE_HOST }));

    const hasFleetbaseConfig = useCallback(() => {
        const FLEETBASE_KEY = resolveConnectionConfig('FLEETBASE_KEY');
        const FLEETBASE_HOST = resolveConnectionConfig('FLEETBASE_HOST');

        return typeof FLEETBASE_KEY === 'string' && typeof FLEETBASE_HOST === 'string';
    }, [resolveConnectionConfig]);

    useEffect(() => {
        const HOST = resolveConnectionConfig('FLEETBASE_HOST');
        const KEY = resolveConnectionConfig('FLEETBASE_KEY');
        console.log('Initializing Fleetbase with host:', HOST, ' key:', KEY);

        try {
            const fb = new Fleetbase(KEY, { host: HOST });

            if (authToken) {
                fb.session.setToken(authToken);
            }

            // Add request interceptor for debugging
            const adapter = fb.getAdapter();
            if (adapter && adapter.client && adapter.client.interceptors) {
                adapter.client.interceptors.request.use(
                    (config) => {
                        console.log('[API REQUEST]', config.method?.toUpperCase(), config.url);
                        console.log('[API REQUEST] Base URL:', config.baseURL);
                        console.log('[API REQUEST] Data:', JSON.stringify(config.data, null, 2));
                        console.log('[API REQUEST] Headers:', JSON.stringify(config.headers, null, 2));
                        return config;
                    },
                    (error) => {
                        console.error('[API REQUEST ERROR]', error);
                        return Promise.reject(error);
                    }
                );

                adapter.client.interceptors.response.use(
                    (response) => {
                        console.log('[API RESPONSE]', response.status, response.config.url);
                        console.log('[API RESPONSE] Data:', JSON.stringify(response.data, null, 2));
                        return response;
                    },
                    (error) => {
                        console.error('[API RESPONSE ERROR]', error.config?.url, error.message);
                        console.error('[API RESPONSE ERROR] Details:', JSON.stringify(error.response?.data, null, 2));
                        return Promise.reject(error);
                    }
                );
            }

            setFleetbase(fb);
        } catch (err) {
            setError(err as Error);
        }
    }, [authToken, resolveConnectionConfig]);

    // Memoize the adapter so that its reference only changes when the fleetbase instance updates.
    const adapter = useMemo(() => {
        if (!fleetbase) return null;
        return fleetbase.getAdapter();
    }, [fleetbase, authToken]);

    // Memoize the returned object to prevent unnecessary re-renders.
    const api = useMemo(
        () => ({
            fleetbase,
            adapter,
            error,
            hasFleetbaseConfig,
        }),
        [fleetbase, adapter, error, authToken, hasFleetbaseConfig]
    );

    return api;
};

export default useFleetbase;
