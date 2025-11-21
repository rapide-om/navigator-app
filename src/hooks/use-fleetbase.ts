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
