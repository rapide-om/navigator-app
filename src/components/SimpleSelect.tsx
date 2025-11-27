import React, { useState } from 'react';
import { Modal, ScrollView, TouchableWithoutFeedback } from 'react-native';
import { YStack, Text, Button, useTheme } from 'tamagui';
import { titleize } from 'inflected';

interface SimpleSelectProps {
    value?: string;
    options: any[];
    optionLabel?: string;
    optionValue?: string;
    onChange: (value: string) => void;
    title: string;
    humanize?: boolean;
    placeholder?: string;
}

const SimpleSelect: React.FC<SimpleSelectProps> = ({
    value,
    options = [],
    optionLabel = 'label',
    optionValue = 'value',
    onChange,
    title,
    humanize: shouldHumanize = false,
    placeholder = 'Select an option',
}) => {
    const theme = useTheme();
    const [isModalVisible, setIsModalVisible] = useState(false);

    const getOptionLabel = (option: any) => {
        if (typeof option === 'string') {
            return shouldHumanize ? titleize(option) : option;
        }
        const label = option[optionLabel] || option[optionValue] || '';
        return label;
    };

    const getOptionValue = (option: any) => {
        if (typeof option === 'string') return option;
        return option[optionValue] || option[optionLabel] || '';
    };

    const selectedOption = options.find((opt) => getOptionValue(opt) === value);
    const displayText = selectedOption ? getOptionLabel(selectedOption) : placeholder;

    const handleSelect = (option: any) => {
        onChange(getOptionValue(option));
        setIsModalVisible(false);
    };

    return (
        <>
            <Button
                justifyContent='flex-start'
                textAlign='left'
                onPress={() => setIsModalVisible(true)}
                bg='$surface'
                borderWidth={1}
                borderColor='$borderColor'
                borderRadius='$5'
            >
                {value ? (
                    <Button.Text color='$textPrimary' fontSize={15}>
                        {displayText}
                    </Button.Text>
                ) : (
                    <Button.Text color='$textSecondary' fontSize={15}>
                        {placeholder}
                    </Button.Text>
                )}
            </Button>

            <Modal visible={isModalVisible} animationType="slide" transparent={true} onRequestClose={() => setIsModalVisible(false)}>
                <TouchableWithoutFeedback onPress={() => setIsModalVisible(false)}>
                    <YStack flex={1} justifyContent="flex-end" bg="rgba(0,0,0,0.5)">
                        <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                            <YStack
                                bg="$background"
                                borderTopLeftRadius={20}
                                borderTopRightRadius={20}
                                maxHeight="70%"
                                borderWidth={1}
                                borderColor="$borderColorWithShadow"
                                borderBottomWidth={0}
                            >
                        {title && (
                            <YStack px="$3" py="$3" borderBottomWidth={1} borderBottomColor="$borderColor">
                                <Text color="$textPrimary" fontSize={18}>
                                    {title}
                                </Text>
                            </YStack>
                        )}

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <YStack px="$2" py="$2">
                                {options.map((option, index) => (
                                    <Button
                                        key={index}
                                        size="$4"
                                        onPress={() => handleSelect(option)}
                                        bg="$surface"
                                        justifyContent="flex-start"
                                        mb="$2"
                                        px="$3"
                                        hoverStyle={{
                                            scale: 0.975,
                                            opacity: 0.8,
                                        }}
                                        pressStyle={{
                                            scale: 0.975,
                                            opacity: 0.8,
                                        }}
                                    >
                                        <Button.Text color="$textPrimary">{getOptionLabel(option)}</Button.Text>
                                    </Button>
                                ))}
                            </YStack>
                        </ScrollView>
                            </YStack>
                        </TouchableWithoutFeedback>
                    </YStack>
                </TouchableWithoutFeedback>
            </Modal>
        </>
    );
};

export default SimpleSelect;
