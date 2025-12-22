/**
 * React Native Polyfills - EAGERLY LOADED
 * This file provides polyfills that must be available BEFORE any module loads
 *
 * React Native's default polyfills are LAZY (loaded on first access)
 * but some libraries (like ws used by socketcluster-client) check for
 * setImmediate existence during module evaluation, before RN's lazy polyfills activate.
 *
 * CRITICAL: These must be set UNCONDITIONALLY to survive Hermes optimization
 */

'use strict';

// Define polyfills as named functions to prevent Hermes from optimizing them away
function setImmediatePolyfill(callback) {
    // Handle variable arguments
    var args = Array.prototype.slice.call(arguments, 1);
    return setTimeout(function() {
        callback.apply(null, args);
    }, 0);
}

function clearImmediatePolyfill(immediateId) {
    clearTimeout(immediateId);
}

function nextTickPolyfill(callback) {
    var args = Array.prototype.slice.call(arguments, 1);
    setTimeout(function() {
        callback.apply(null, args);
    }, 0);
}

// Force override - set unconditionally on ALL possible global scopes
// In bridgeless mode (new architecture), React Native expects these from C++
// but they may not be available in release builds, so we force them

// 1. Set on global object
Object.defineProperty(global, 'setImmediate', {
    value: setImmediatePolyfill,
    writable: true,
    enumerable: true,
    configurable: true
});

Object.defineProperty(global, 'clearImmediate', {
    value: clearImmediatePolyfill,
    writable: true,
    enumerable: true,
    configurable: true
});

// 2. Set up process object
if (!global.process) {
    global.process = {};
}
Object.defineProperty(global.process, 'nextTick', {
    value: nextTickPolyfill,
    writable: true,
    enumerable: true,
    configurable: true
});

// 3. For Hermes/bridgeless mode, also set on globalThis
if (typeof globalThis !== 'undefined') {
    Object.defineProperty(globalThis, 'setImmediate', {
        value: setImmediatePolyfill,
        writable: true,
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(globalThis, 'clearImmediate', {
        value: clearImmediatePolyfill,
        writable: true,
        enumerable: true,
        configurable: true
    });

    if (!globalThis.process) {
        globalThis.process = global.process;
    }
}

// Verify installation - this helps prevent dead code elimination
if (typeof global.setImmediate === 'undefined') {
    throw new Error('[rn-polyfills] CRITICAL: setImmediate polyfill failed to install!');
}

// In development, log success
if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.log('[rn-polyfills] ✓ setImmediate, clearImmediate, and process.nextTick installed');
    console.log('[rn-polyfills] typeof global.setImmediate:', typeof global.setImmediate);
    console.log('[rn-polyfills] typeof globalThis.setImmediate:', typeof globalThis?.setImmediate);
}
