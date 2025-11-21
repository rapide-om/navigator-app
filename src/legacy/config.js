import { APP_NAME, APP_IDENTIFIER, APP_LINK_PREFIX, FLEETBASE_HOST, FLEETBASE_KEY, GOOGLE_MAPS_API_KEY } from '@env';
import AppConfig from '../config/app';
import InterfaceConfig from '../config/interface';

const Environment = {
    APP_NAME,
    APP_IDENTIFIER,
    APP_LINK_PREFIX,
    FLEETBASE_HOST,
    FLEETBASE_KEY,
    GOOGLE_MAPS_API_KEY,
};

/**
 * ----------------------------------------------------------
 * Storefront App Configuration
 * ----------------------------------------------------------
 *
 * Define your own custom configuration properties below.
 * @TODO Allow 3rd party configurations for plugins
 *
 * @type {object}
 */
const Config = {
    app: AppConfig,
    ui: InterfaceConfig,
    ...Environment,
};

export default Config;
