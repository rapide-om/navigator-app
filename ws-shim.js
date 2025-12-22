/**
 * WebSocket shim for React Native
 * This replaces the Node.js 'ws' module with React Native's native WebSocket
 */

// React Native has WebSocket built-in
module.exports = WebSocket;
module.exports.WebSocket = WebSocket;
