import { APP_THEME, DRIVER_NAVIGATOR_TABS, DRIVER_NAVIGATOR_DEFAULT_TAB, DEFAULT_LOCALE, LOGIN_BG_COLOR } from '@env';

// Helper functions to avoid circular dependency
function toArray(target, delimiter = ',') {
    if (Array.isArray(target)) {
        return target;
    }
    if (typeof target === 'string') {
        return target.split(delimiter);
    }
    return target ? Array.from(target) : [];
}

function mergeConfigs(defaultConfig = {}, targetConfig = {}) {
    if (typeof targetConfig !== 'object' || targetConfig === null) {
        return defaultConfig;
    }
    const result = { ...defaultConfig };
    for (const key in targetConfig) {
        if (
            typeof targetConfig[key] === 'object' &&
            targetConfig[key] !== null &&
            !Array.isArray(targetConfig[key]) &&
            typeof result[key] === 'object' &&
            result[key] !== null &&
            !Array.isArray(result[key])
        ) {
            result[key] = mergeConfigs(result[key], targetConfig[key]);
        } else {
            result[key] = targetConfig[key];
        }
    }
    return result;
}

export const DefaultConfig = {
    theme: APP_THEME || 'blue',
    driverNavigator: {
        tabs: toArray(DRIVER_NAVIGATOR_TABS || 'DriverDashboardTab,DriverTaskTab,DriverReportTab,DriverChatTab,DriverAccountTab'),
        defaultTab: toArray(DRIVER_NAVIGATOR_DEFAULT_TAB || 'DriverDashboardTab'),
    },
    defaultLocale: DEFAULT_LOCALE || 'en',
    colors: {
        loginBackground: LOGIN_BG_COLOR || '#111827',
    },
};

export function createNavigatorConfig(userConfig = {}) {
    return mergeConfigs(DefaultConfig, userConfig);
}
