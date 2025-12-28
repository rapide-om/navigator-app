// index.native.tsx
// Note: rn-polyfills.js is loaded in index.js BEFORE this file

import { AppRegistry, LogBox } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import 'react-native-get-random-values';
import 'react-native-gesture-handler';

// Suppress the "remove child" error that occurs during logout navigation transitions
// This is a known issue with React Navigation's conditional rendering
LogBox.ignoreLogs([
    'Tried to remove child at index',
    'removeChildAtIndex',
]);

// Intercept console.error to suppress view hierarchy errors during logout
const originalConsoleError = console.error;
console.error = (...args) => {
    const message = args[0]?.toString() || '';

    // Suppress specific navigation-related errors during logout
    if (
        message.includes('Tried to remove child at index') ||
        message.includes('removeChildAtIndex') ||
        message.includes('child count may be incorrect')
    ) {
        // Silently ignore these errors - they're harmless navigation transition issues
        return;
    }

    // Log all other errors normally
    originalConsoleError(...args);
};

AppRegistry.registerComponent(appName, () => App);
