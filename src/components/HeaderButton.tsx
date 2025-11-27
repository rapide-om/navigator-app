import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBolt } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from 'tamagui';

const HeaderButton = ({ icon, size = 35, onPress, bg = '$secondary', iconColor = '$textPrimary', borderWidth = 0, borderColor = '$borderColor', ...props }) => {
    const theme = useTheme();
    const backgroundColor = theme[bg]?.val ?? theme.$secondary?.val ?? '#ccc';
    const borderColorValue = theme[borderColor]?.val ?? theme.$borderColor?.val ?? 'transparent';

    const handlePress = () => {
        console.log('[HeaderButton] Button pressed, onPress type:', typeof onPress);
        if (typeof onPress === 'function') {
            console.log('[HeaderButton] Calling onPress function');
            onPress();
        } else {
            console.log('[HeaderButton] onPress is not a function');
        }
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.7}
            style={styles.touchable}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            {...props}
        >
            <View
                style={[
                    styles.button,
                    {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        backgroundColor: backgroundColor,
                        borderWidth: borderWidth,
                        borderColor: borderColorValue,
                    },
                ]}
            >
                <FontAwesomeIcon icon={icon ? icon : faBolt} color={theme[iconColor]?.val ?? theme.$textPrimary?.val ?? '#000'} />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    touchable: {
        zIndex: 9999,
    },
    button: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});


export default HeaderButton;
