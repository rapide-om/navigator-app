import React, { useState } from 'react';
import { TextInput, Platform, StyleSheet } from 'react-native';
import { YStack, XStack, Text, Button, useTheme } from 'tamagui';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCheck, faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';

interface ReasonOption {
    label: string;
    value: string;
}

interface ActivityReasonSelectorProps {
    activityCode: 'failed' | 'rescheduled';
    onSubmit: (reason: string, customReason?: string) => void;
    onBack: () => void;
}

const FAILED_REASONS: ReasonOption[] = [
    { label: 'Customer not available', value: 'customer_not_available' },
    { label: 'Wrong address', value: 'wrong_address' },
];

const RESCHEDULED_REASONS: ReasonOption[] = [
    { label: 'Customer requested reschedule', value: 'customer_requested' },
    { label: 'Unable to deliver today', value: 'unable_to_deliver' },
];

const ActivityReasonSelector: React.FC<ActivityReasonSelectorProps> = ({
    activityCode,
    onSubmit,
    onBack,
}) => {
    const theme = useTheme();
    const [selectedReason, setSelectedReason] = useState<string | null>(null);
    const [customReason, setCustomReason] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);

    const reasons = activityCode === 'failed' ? FAILED_REASONS : RESCHEDULED_REASONS;
    const title = activityCode === 'failed' ? 'Select failure reason' : 'Select reschedule reason';

    const handleReasonSelect = (reason: string) => {
        if (reason === 'custom') {
            setShowCustomInput(true);
            setSelectedReason('custom');
        } else {
            setSelectedReason(reason);
            setShowCustomInput(false);
            setCustomReason('');
        }
    };

    const handleSubmit = () => {
        if (selectedReason === 'custom') {
            if (customReason.trim()) {
                onSubmit('custom', customReason.trim());
            }
        } else if (selectedReason) {
            onSubmit(selectedReason);
        }
    };

    const isSubmitDisabled = !selectedReason || (selectedReason === 'custom' && !customReason.trim());

    return (
        <YStack flex={1}>
            {/* Fixed Header */}
            <XStack
                alignItems='center'
                justifyContent='space-between'
                px='$3'
                py='$3'
                borderBottomWidth={1}
                borderBottomColor='$borderColor'
                bg='$background'
            >
                <Button
                    size='$3'
                    bg='transparent'
                    onPress={onBack}
                    pressStyle={{ opacity: 0.7 }}
                >
                    <Button.Icon>
                        <FontAwesomeIcon icon={faChevronLeft} color={theme['$textPrimary']?.val} size={16} />
                    </Button.Icon>
                    <Button.Text color='$textPrimary'>Back</Button.Text>
                </Button>
                <Text fontSize='$5' color='$textPrimary' fontWeight='bold'>
                    {title}
                </Text>
                <YStack width={60} />
            </XStack>

            {/* Scrollable Content */}
            <BottomSheetScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 120 }}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps='handled'
            >
                <YStack px='$3' py='$3' gap='$2'>
                    {reasons.map((reason) => (
                        <Button
                            key={reason.value}
                            size='$4'
                            onPress={() => handleReasonSelect(reason.value)}
                            bg={selectedReason === reason.value ? '$primary' : '$surface'}
                            borderWidth={1}
                            borderColor={selectedReason === reason.value ? '$primaryBorder' : '$borderColor'}
                            justifyContent='flex-start'
                            px='$3'
                            pressStyle={{ opacity: 0.8, scale: 0.98 }}
                        >
                            <XStack flex={1} alignItems='center' justifyContent='space-between'>
                                <Button.Text
                                    color={selectedReason === reason.value ? '$primaryText' : '$textPrimary'}
                                >
                                    {reason.label}
                                </Button.Text>
                                {selectedReason === reason.value && (
                                    <FontAwesomeIcon
                                        icon={faCheck}
                                        color={theme['$primaryText']?.val}
                                        size={16}
                                    />
                                )}
                            </XStack>
                        </Button>
                    ))}

                    <Button
                        size='$4'
                        onPress={() => handleReasonSelect('custom')}
                        bg={selectedReason === 'custom' ? '$primary' : '$surface'}
                        borderWidth={1}
                        borderColor={selectedReason === 'custom' ? '$primaryBorder' : '$borderColor'}
                        justifyContent='flex-start'
                        px='$3'
                        pressStyle={{ opacity: 0.8, scale: 0.98 }}
                    >
                        <XStack flex={1} alignItems='center' justifyContent='space-between'>
                            <Button.Text
                                color={selectedReason === 'custom' ? '$primaryText' : '$textPrimary'}
                            >
                                Other (custom reason)
                            </Button.Text>
                            {selectedReason === 'custom' && (
                                <FontAwesomeIcon
                                    icon={faCheck}
                                    color={theme['$primaryText']?.val}
                                    size={16}
                                />
                            )}
                        </XStack>
                    </Button>

                    {showCustomInput && (
                        <YStack mt='$2'>
                            <Text color='$textSecondary' fontSize={14} mb='$2'>
                                Enter your reason:
                            </Text>
                            <TextInput
                                placeholder='Type your reason here...'
                                placeholderTextColor={theme['$textSecondary']?.val}
                                value={customReason}
                                onChangeText={setCustomReason}
                                multiline
                                numberOfLines={3}
                                style={{
                                    color: theme['$textPrimary']?.val ?? '#000',
                                    backgroundColor: theme['$surface']?.val ?? '#fff',
                                    borderWidth: 1,
                                    borderColor: theme['$borderColor']?.val ?? '#ccc',
                                    borderRadius: 8,
                                    padding: 12,
                                    fontSize: 14,
                                    minHeight: 80,
                                    textAlignVertical: 'top',
                                }}
                            />
                        </YStack>
                    )}

                    {/* Confirm Button inside scroll */}
                    <YStack mt='$4'>
                        <Button
                            size='$5'
                            bg={isSubmitDisabled ? '$gray-400' : '$success'}
                            borderWidth={1}
                            borderColor={isSubmitDisabled ? '$gray-500' : '$successBorder'}
                            onPress={handleSubmit}
                            disabled={isSubmitDisabled}
                            opacity={isSubmitDisabled ? 0.5 : 1}
                        >
                            <Button.Icon>
                                <FontAwesomeIcon icon={faCheck} color={theme['$successText']?.val ?? '#fff'} />
                            </Button.Icon>
                            <Button.Text color='$successText' fontSize={16} fontWeight='bold'>
                                Confirm
                            </Button.Text>
                        </Button>
                    </YStack>
                </YStack>
            </BottomSheetScrollView>
        </YStack>
    );
};

export default ActivityReasonSelector;
