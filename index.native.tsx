// index.native.tsx
// CRITICAL: Polyfills must be imported FIRST before anything else
import './polyfills';

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import 'react-native-get-random-values';
import 'react-native-gesture-handler';

AppRegistry.registerComponent(appName, () => App);
