// index.native.tsx
// Note: rn-polyfills.js is loaded in index.js BEFORE this file

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import 'react-native-get-random-values';
import 'react-native-gesture-handler';

AppRegistry.registerComponent(appName, () => App);
