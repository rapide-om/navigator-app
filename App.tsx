import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { PortalProvider } from '@gorhom/portal';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TamaguiProvider, Theme } from 'tamagui';
import { Toasts } from '@backpackapp-io/react-native-toast';
import { AuthProvider } from './src/contexts/AuthContext';
import { LanguageProvider } from './src/contexts/LanguageContext';
import { NotificationProvider } from './src/contexts/NotificationContext';
import { SocketClusterProvider } from './src/contexts/SocketClusterContext';
import { ThemeProvider, useThemeContext } from './src/contexts/ThemeContext';
import { ConfigProvider } from './src/contexts/ConfigContext';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './ErrorBoundary';
import config from './tamagui.config';

function AppContent(): React.JSX.Element {
    const { appTheme } = useThemeContext();

    return (
        <TamaguiProvider config={config} theme={appTheme}>
            <Theme name={appTheme}>
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <SafeAreaProvider>
                        <BottomSheetModalProvider>
                            <ConfigProvider>
                                <NotificationProvider>
                                    <LanguageProvider>
                                        <AuthProvider>
                                            <SocketClusterProvider>
                                                <AppNavigator />
                                                <Toasts />
                                            </SocketClusterProvider>
                                        </AuthProvider>
                                    </LanguageProvider>
                                </NotificationProvider>
                            </ConfigProvider>
                        </BottomSheetModalProvider>
                    </SafeAreaProvider>
                </GestureHandlerRootView>
            </Theme>
        </TamaguiProvider>
    );
}

function App(): React.JSX.Element {
    return (
        <ErrorBoundary>
            <PortalProvider>
                <ThemeProvider>
                    <AppContent />
                </ThemeProvider>
            </PortalProvider>
        </ErrorBoundary>
    );
}

export default App;
