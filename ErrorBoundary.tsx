import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
            errorInfo: null,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({
            error,
            errorInfo,
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <ScrollView style={styles.scrollView}>
                        <Text style={styles.title}>Something went wrong</Text>
                        <Text style={styles.subtitle}>Error Details:</Text>
                        <Text style={styles.errorText}>
                            {this.state.error?.toString()}
                        </Text>
                        {__DEV__ && (
                            <>
                                <Text style={styles.subtitle}>Stack Trace:</Text>
                                <Text style={styles.stackText}>
                                    {this.state.errorInfo?.componentStack}
                                </Text>
                            </>
                        )}
                    </ScrollView>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a',
        padding: 20,
        justifyContent: 'center',
    },
    scrollView: {
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ff6b6b',
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        marginTop: 15,
        marginBottom: 10,
    },
    errorText: {
        fontSize: 14,
        color: '#ff6b6b',
        fontFamily: 'monospace',
    },
    stackText: {
        fontSize: 12,
        color: '#ccc',
        fontFamily: 'monospace',
    },
});

export default ErrorBoundary;
