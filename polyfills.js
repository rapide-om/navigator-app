/**
 * Polyfills for React Native
 * This file must be imported FIRST before any other imports
 *
 * CRITICAL: These polyfills must be set on ALL possible global scopes
 * to ensure they work in both Hermes and JSC, in both debug and release builds
 */

// Define setImmediate polyfill
const setImmediatePolyfill = function setImmediate(callback, ...args) {
    return setTimeout(callback, 0, ...args);
};

// Define clearImmediate polyfill
const clearImmediatePolyfill = function clearImmediate(immediateId) {
    clearTimeout(immediateId);
};

// Define process.nextTick polyfill
const nextTickPolyfill = function nextTick(callback, ...args) {
    setTimeout(() => callback(...args), 0);
};

// Set on all possible global scopes for maximum compatibility
// This ensures the polyfills work regardless of which global scope is accessed

// 1. Set on globalThis (standard)
if (typeof globalThis !== 'undefined') {
    if (typeof globalThis.setImmediate === 'undefined') {
        globalThis.setImmediate = setImmediatePolyfill;
    }
    if (typeof globalThis.clearImmediate === 'undefined') {
        globalThis.clearImmediate = clearImmediatePolyfill;
    }
    if (typeof globalThis.process === 'undefined') {
        globalThis.process = {};
    }
    if (typeof globalThis.process.nextTick === 'undefined') {
        globalThis.process.nextTick = nextTickPolyfill;
    }
}

// 2. Set on global (common in Node.js-style environments)
if (typeof global !== 'undefined') {
    if (typeof global.setImmediate === 'undefined') {
        global.setImmediate = setImmediatePolyfill;
    }
    if (typeof global.clearImmediate === 'undefined') {
        global.clearImmediate = clearImmediatePolyfill;
    }
    if (typeof global.process === 'undefined') {
        global.process = {};
    }
    if (typeof global.process.nextTick === 'undefined') {
        global.process.nextTick = nextTickPolyfill;
    }
}

// 3. Set on window (for web compatibility, though unlikely in RN)
if (typeof window !== 'undefined') {
    if (typeof window.setImmediate === 'undefined') {
        window.setImmediate = setImmediatePolyfill;
    }
    if (typeof window.clearImmediate === 'undefined') {
        window.clearImmediate = clearImmediatePolyfill;
    }
}

// 4. Set on self (for web workers compatibility)
if (typeof self !== 'undefined' && typeof self.setImmediate === 'undefined') {
    self.setImmediate = setImmediatePolyfill;
    self.clearImmediate = clearImmediatePolyfill;
}

// 5. Set on this (fallback for current scope)
if (typeof this !== 'undefined' && this !== null) {
    if (typeof this.setImmediate === 'undefined') {
        this.setImmediate = setImmediatePolyfill;
    }
    if (typeof this.clearImmediate === 'undefined') {
        this.clearImmediate = clearImmediatePolyfill;
    }
}

// Verify the polyfills are set correctly
const globalObj = typeof globalThis !== 'undefined' ? globalThis : global;
const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : false;

if (isDev) {
    console.log('[Polyfills] Checking installation...');
    console.log('[Polyfills] globalThis.setImmediate:', typeof globalThis?.setImmediate);
    console.log('[Polyfills] global.setImmediate:', typeof global?.setImmediate);
    console.log('[Polyfills] setImmediate (direct):', typeof setImmediate);
} else {
    // In production, just verify they exist
    if (typeof globalObj.setImmediate === 'undefined') {
        console.error('[Polyfills] CRITICAL: setImmediate polyfill failed to install!');
    }
}
