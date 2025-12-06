/**
 * Polyfills for React Native
 * This file must be imported FIRST before any other imports
 */

// Polyfill setImmediate and clearImmediate
// These are required for socketcluster-client and other dependencies
// that rely on Node.js globals
if (typeof global.setImmediate === 'undefined') {
    global.setImmediate = function setImmediate(callback, ...args) {
        return setTimeout(callback, 0, ...args);
    };
}

if (typeof global.clearImmediate === 'undefined') {
    global.clearImmediate = function clearImmediate(immediateId) {
        clearTimeout(immediateId);
    };
}

// Polyfill process.nextTick if needed
if (typeof global.process === 'undefined') {
    global.process = {};
}

if (typeof global.process.nextTick === 'undefined') {
    global.process.nextTick = function nextTick(callback, ...args) {
        setTimeout(() => callback(...args), 0);
    };
}

// Add __DEV__ global if not present
if (typeof global.__DEV__ === 'undefined') {
    global.__DEV__ = __DEV__;
}
