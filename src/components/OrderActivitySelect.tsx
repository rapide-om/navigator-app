import React, { useState, useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import { Pressable, ActivityIndicator, TextInput } from 'react-native';
import { Button, Text, YStack, XStack, useTheme } from 'tamagui';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faLightbulb, faLocationDot, faCheck, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { useNavigation } from '@react-navigation/native';
import { WaypointItem } from './OrderWaypointList';
import BottomSheet, { BottomSheetView, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Portal } from '@gorhom/portal';
import { getColorFromStatus } from '../utils/format';
import useAppTheme from '../hooks/use-app-theme';
import Spacer from './Spacer';

const ACTIVITIES_REQUIRING_REASON = ['failed', 'rescheduled'];

// Additional activities that should always be available
const FAILED_ACTIVITY = {
    code: 'failed',
    status: 'Failed',
    _resolved_status: 'Failed',
    details: 'Mark this order as failed',
    _resolved_details: 'Mark this order as failed',
    require_pod: false,
};

const RESCHEDULED_ACTIVITY = {
    code: 'rescheduled',
    status: 'Rescheduled',
    _resolved_status: 'Rescheduled',
    details: 'Reschedule this order for later',
    _resolved_details: 'Reschedule this order for later',
    require_pod: false,
};

const FAILED_REASONS = [
    { label: 'Customer not available', value: 'customer_not_available' },
    { label: 'Wrong address', value: 'wrong_address' },
];

const RESCHEDULED_REASONS = [
    { label: 'Customer requested reschedule', value: 'customer_requested' },
    { label: 'Unable to deliver today', value: 'unable_to_deliver' },
];

const OrderActivitySelect = forwardRef(({ onChange, waypoint, activities = [], snapTo = '95%', isLoading = false, activityLoading, portalHost = 'MainPortal', ...props }, ref) => {
    const theme = useTheme();
    const navigation = useNavigation();
    const { isDarkMode } = useAppTheme();
    const bottomSheetRef = useRef(null);
    const snapPoints = useMemo(() => [snapTo], [snapTo]);

    // State for expandable reason selection
    const [expandedActivity, setExpandedActivity] = useState(null);
    const [selectedReason, setSelectedReason] = useState(null);
    const [customReason, setCustomReason] = useState('');

    // Combine backend activities with always-available failed/rescheduled options
    const allActivities = useMemo(() => {
        const backendActivities = Array.isArray(activities) ? activities : [activities].filter(Boolean);

        // Filter out any existing failed/rescheduled from backend to avoid duplicates
        const filteredActivities = backendActivities.filter(
            (activity) => activity && !['failed', 'rescheduled'].includes(activity.code)
        );

        // Add failed and rescheduled at the end
        return [...filteredActivities, FAILED_ACTIVITY, RESCHEDULED_ACTIVITY];
    }, [activities]);

    // Expose methods to the parent via ref.
    useImperativeHandle(
        ref,
        () => ({
            openBottomSheet: () => {
                // Reset state when opening
                setExpandedActivity(null);
                setSelectedReason(null);
                setCustomReason('');
                bottomSheetRef.current?.snapToPosition(snapTo);
            },
            closeBottomSheet: () => bottomSheetRef.current?.close(),
            getBottomSheetRef: () => bottomSheetRef.current,
        }),
        [snapTo]
    );

    const closeBottomSheet = () => {
        bottomSheetRef.current?.close();
    };

    const handleActivitySelect = (activity) => {
        // Check if this activity requires a reason (failed or rescheduled)
        if (ACTIVITIES_REQUIRING_REASON.includes(activity.code)) {
            if (expandedActivity?.code === activity.code) {
                // Collapse if already expanded
                setExpandedActivity(null);
                setSelectedReason(null);
                setCustomReason('');
            } else {
                // Expand this activity
                setExpandedActivity(activity);
                setSelectedReason(null);
                setCustomReason('');
            }
            return;
        }

        closeBottomSheet();
        if (typeof onChange === 'function') {
            onChange(activity);
        }
    };

    const handleReasonSelect = (reason) => {
        setSelectedReason(reason);
        if (reason !== 'custom') {
            setCustomReason('');
        }
    };

    const handleConfirmWithReason = () => {
        if (expandedActivity && selectedReason && typeof onChange === 'function') {
            const activityWithReason = {
                ...expandedActivity,
                reason: selectedReason,
                customReason: selectedReason === 'custom' ? customReason.trim() : null,
            };
            onChange(activityWithReason);
        }
        setExpandedActivity(null);
        setSelectedReason(null);
        setCustomReason('');
        closeBottomSheet();
    };

    const getReasons = (activityCode) => {
        return activityCode === 'failed' ? FAILED_REASONS : RESCHEDULED_REASONS;
    };

    const isConfirmDisabled = !selectedReason || (selectedReason === 'custom' && !customReason.trim());

    const renderActivity = (activity, index) => {
        const statusColor = getColorFromStatus(activity.code);
        const backgroundColor = `$${statusColor}-${isDarkMode ? '900' : '600'}`;
        const borderColor = `$${statusColor}-${isDarkMode ? '600' : '700'}`;
        const fontColor = `$${statusColor}-100`;
        const isExpanded = expandedActivity?.code === activity.code;
        const reasons = getReasons(activity.code);

        return (
            <YStack key={index} mb='$3'>
                <Pressable onPress={() => handleActivitySelect(activity)}>
                    <YStack
                        bg={backgroundColor}
                        borderWidth={1}
                        borderColor={borderColor}
                        borderBottomWidth={isExpanded ? 0 : 1}
                        px='$3'
                        py='$3'
                        borderTopLeftRadius={12}
                        borderTopRightRadius={12}
                        borderBottomLeftRadius={isExpanded ? 0 : 12}
                        borderBottomRightRadius={isExpanded ? 0 : 12}
                    >
                        <XStack alignItems='center' justifyContent='space-between'>
                            <XStack alignItems='flex-start' flex={1}>
                                {activityLoading === activity.code && (
                                    <YStack mt='$1' mr='$2' width={20} height={20}>
                                        <ActivityIndicator size='small' color={theme[fontColor]?.val ?? '#fff'} />
                                    </YStack>
                                )}
                                <YStack flex={1} gap='$1'>
                                    <Text fontSize={16} color={fontColor} fontWeight='bold' numberOfLines={1}>
                                        {activity._resolved_status ?? activity.status}
                                    </Text>
                                    <Text color={fontColor}>{activity._resolved_details ?? activity.details}</Text>

                                    {activity.require_pod && (
                                        <XStack
                                            alignSelf='flex-start'
                                            bg='$warning'
                                            borderWidth={1}
                                            borderColor='$warningBorder'
                                            borderRadius='$4'
                                            px='$3'
                                            py='$2'
                                            mt='$2'
                                            alignItems='center'
                                            gap='$2'
                                        >
                                            <FontAwesomeIcon icon={faLightbulb} color={theme['$warningText'].val} />
                                            <Text color='$warningText'>Requires proof of delivery</Text>
                                        </XStack>
                                    )}
                                </YStack>
                            </XStack>
                            {ACTIVITIES_REQUIRING_REASON.includes(activity.code) && (
                                <YStack ml='$2'>
                                    <FontAwesomeIcon
                                        icon={isExpanded ? faChevronUp : faChevronDown}
                                        color={theme[fontColor]?.val ?? '#fff'}
                                        size={14}
                                    />
                                </YStack>
                            )}
                        </XStack>
                    </YStack>
                </Pressable>

                {/* Expanded reason selection */}
                {isExpanded && (
                    <YStack bg='$surface' borderWidth={1} borderTopWidth={0} borderColor={borderColor} px='$3' py='$3' borderTopLeftRadius={0} borderTopRightRadius={0} borderBottomLeftRadius={12} borderBottomRightRadius={12}>
                        <Text color='$textSecondary' fontSize={13} mb='$3' fontWeight='600'>
                            Select a reason:
                        </Text>

                        {reasons.map((reason) => (
                            <Pressable key={reason.value} onPress={() => handleReasonSelect(reason.value)}>
                                <XStack
                                    bg={selectedReason === reason.value ? '$primary' : '$background'}
                                    borderWidth={1}
                                    borderColor={selectedReason === reason.value ? '$primaryBorder' : '$borderColor'}
                                    px='$3'
                                    py='$3'
                                    borderRadius='$3'
                                    mb='$3'
                                    alignItems='center'
                                    justifyContent='space-between'
                                >
                                    <Text color={selectedReason === reason.value ? '$primaryText' : '$textPrimary'} fontSize={15}>
                                        {reason.label}
                                    </Text>
                                    {selectedReason === reason.value && (
                                        <FontAwesomeIcon icon={faCheck} color={theme['$primaryText']?.val} size={16} />
                                    )}
                                </XStack>
                            </Pressable>
                        ))}

                        {/* Custom reason option */}
                        <Pressable onPress={() => handleReasonSelect('custom')}>
                            <XStack
                                bg={selectedReason === 'custom' ? '$primary' : '$background'}
                                borderWidth={1}
                                borderColor={selectedReason === 'custom' ? '$primaryBorder' : '$borderColor'}
                                px='$3'
                                py='$3'
                                borderRadius='$3'
                                mb='$3'
                                alignItems='center'
                                justifyContent='space-between'
                            >
                                <Text color={selectedReason === 'custom' ? '$primaryText' : '$textPrimary'} fontSize={15}>
                                    Other (custom reason)
                                </Text>
                                {selectedReason === 'custom' && (
                                    <FontAwesomeIcon icon={faCheck} color={theme['$primaryText']?.val} size={16} />
                                )}
                            </XStack>
                        </Pressable>

                        {/* Custom reason text input */}
                        {selectedReason === 'custom' && (
                            <TextInput
                                placeholder='Type your reason here...'
                                placeholderTextColor={theme['$textSecondary']?.val}
                                value={customReason}
                                onChangeText={setCustomReason}
                                multiline
                                numberOfLines={2}
                                style={{
                                    color: theme['$textPrimary']?.val ?? '#000',
                                    backgroundColor: theme['$background']?.val ?? '#fff',
                                    borderWidth: 1,
                                    borderColor: theme['$borderColor']?.val ?? '#ccc',
                                    borderRadius: 8,
                                    padding: 12,
                                    fontSize: 14,
                                    minHeight: 70,
                                    textAlignVertical: 'top',
                                    marginBottom: 12,
                                }}
                            />
                        )}

                        {/* Confirm button */}
                        <Button
                            size='$4'
                            bg={isConfirmDisabled ? '$gray-400' : '$success'}
                            borderWidth={1}
                            borderColor={isConfirmDisabled ? '$gray-500' : '$successBorder'}
                            onPress={handleConfirmWithReason}
                            disabled={isConfirmDisabled}
                            opacity={isConfirmDisabled ? 0.5 : 1}
                        >
                            <Button.Icon>
                                <FontAwesomeIcon icon={faCheck} color={theme['$successText']?.val ?? '#fff'} size={16} />
                            </Button.Icon>
                            <Button.Text color='$successText' fontSize={15} fontWeight='600'>Confirm</Button.Text>
                        </Button>
                    </YStack>
                )}
            </YStack>
        );
    };

    return (
        <YStack>
            <Portal hostName={portalHost}>
                <BottomSheet
                    ref={bottomSheetRef}
                    index={-1}
                    snapPoints={snapPoints}
                    keyboardBehavior='extend'
                    keyboardBlurBehavior='none'
                    enableDynamicSizing={false}
                    enablePanDownToClose={true}
                    enableOverDrag={false}
                    style={{ flex: 1, width: '100%' }}
                    backgroundStyle={{ backgroundColor: isDarkMode ? theme.surface.val : theme.background.val, borderWidth: 1, borderColor: theme.borderColorWithShadow.val }}
                    handleIndicatorStyle={{ backgroundColor: theme.secondary.val }}
                >
                    <BottomSheetScrollView
                        style={{ flex: 1, backgroundColor: isDarkMode ? theme.surface.val : theme.background.val }}
                        contentContainerStyle={{ paddingBottom: 200, flexGrow: 1 }}
                        showsVerticalScrollIndicator={true}
                        keyboardShouldPersistTaps='handled'
                        nestedScrollEnabled={true}
                    >
                        <XStack alignItems='center' justifyContent='space-between' px='$5' mb='$4'>
                            <Text fontSize='$6' color='$textPrimary' fontWeight='bold'>
                                Select activity
                            </Text>
                        </XStack>
                        {waypoint && (
                            <YStack px='$3' pt='$4' mb='$4' borderTopWidth={1} borderBottomWidth={1} borderColor='$infoBorder' bg='$info'>
                                <Text color='$infoText' fontWeight='bold' mb='$2' textTransform='uppercase'>
                                    Updating activity for:
                                </Text>
                                <WaypointItem
                                    waypoint={waypoint.serialize()}
                                    icon={faLocationDot}
                                    iconColor={theme['$infoText'].val}
                                    textStyle={{ fontSize: 14, fontWeight: 'bold', color: theme['$infoText'].val }}
                                />
                            </YStack>
                        )}
                        {isLoading ? (
                            <YStack alignItems='center' justifyContent='center' height={200} width='100%'>
                                <ActivityIndicator size='large' color={theme['$textPrimary']?.val ?? '#000'} />
                            </YStack>
                        ) : (
                            <YStack px='$4'>
                                {allActivities.map((activity, index) => renderActivity(activity, index))}
                                <Spacer height={200} />
                            </YStack>
                        )}
                    </BottomSheetScrollView>
                </BottomSheet>
            </Portal>
        </YStack>
    );
});

export default OrderActivitySelect;
