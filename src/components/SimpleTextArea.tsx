import React, { useState, useEffect } from 'react';
import { Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { YStack, Text, Button, useTheme } from 'tamagui';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faSave } from '@fortawesome/free-solid-svg-icons';

interface SimpleTextAreaProps {
    value?: string;
    onChange: (value: string) => void;
    title: string;
    placeholder?: string;
}

const SimpleTextArea: React.FC<SimpleTextAreaProps> = ({
    value = '',
    onChange,
    title,
    placeholder = 'Type here...',
}) => {
    const theme = useTheme();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [tempValue, setTempValue] = useState(value);

    const renderPlaceholder = !value && typeof placeholder === 'string';

    const handleOpen = () => {
        setTempValue(value);
        setIsModalVisible(true);
    };

    const handleSave = () => {
        setIsModalVisible(false);
    };

    useEffect(() => {
        if (typeof onChange === 'function') {
            onChange(tempValue);
        }
    }, [tempValue]);

    return (
        <>
            <Button
                alignItems='flex-start'
                justifyContent='flex-start'
                bg='$surface'
                borderWidth={1}
                borderColor='$borderColor'
                borderRadius='$5'
                py='$3'
                px='$3'
                height={80}
                onPress={handleOpen}
            >
                {renderPlaceholder && (
                    <Button.Text fontSize={14} color='$textSecondary' opacity={0.6}>
                        {placeholder}
                    </Button.Text>
                )}
                {value && (
                    <Button.Text fontSize={14} color='$textPrimary'>
                        {value}
                    </Button.Text>
                )}
            </Button>

            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={handleSave}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <YStack flex={1} bg="rgba(0,0,0,0.5)" justifyContent="flex-end">
                        <YStack
                            bg="$background"
                            borderTopLeftRadius={20}
                            borderTopRightRadius={20}
                            maxHeight="90%"
                            borderWidth={1}
                            borderColor="$borderColorWithShadow"
                            borderBottomWidth={0}
                        >
                            <YStack position="relative">
                                {title && (
                                    <YStack px="$3" pb="$3" pt="$3">
                                        <Text color="$textPrimary" fontSize={18}>
                                            {title}
                                        </Text>
                                    </YStack>
                                )}
                                <TextInput
                                    placeholder={placeholder}
                                    value={tempValue}
                                    onChangeText={setTempValue}
                                    autoCapitalize="none"
                                    autoComplete="off"
                                    autoCorrect={false}
                                    multiline={true}
                                    autoFocus={false}
                                    style={{
                                        color: theme.$textPrimary?.val ?? '#000',
                                        backgroundColor: theme.$surface?.val ?? '#fff',
                                        borderWidth: 1,
                                        borderColor: theme.$borderColorWithShadow?.val ?? '#ccc',
                                        padding: 14,
                                        fontSize: 14,
                                        marginBottom: 10,
                                        height: 300,
                                        textAlignVertical: 'top',
                                    }}
                                />
                            </YStack>
                            <YStack position="absolute" left={0} right={0} bottom={0} padding="$4">
                                <Button borderWidth={1} bg="$primary" borderColor="$primaryBorder" onPress={handleSave}>
                                    <Button.Icon>
                                        <FontAwesomeIcon icon={faSave} color={theme.$primaryText?.val ?? '#fff'} />
                                    </Button.Icon>
                                    <Button.Text color="$primaryText">Done</Button.Text>
                                </Button>
                            </YStack>
                        </YStack>
                    </YStack>
                </KeyboardAvoidingView>
            </Modal>
        </>
    );
};

export default SimpleTextArea;
