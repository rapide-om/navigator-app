import { useState, useEffect, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Alert, ScrollView } from 'react-native';
import { Text, YStack, XStack, Button, Spinner, Separator, useTheme } from 'tamagui';
import { Place } from '@fleetbase/sdk';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTimes, faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Portal } from '@gorhom/portal';
import { humanize, titleize } from 'inflected';
import { formatCurrency } from '../utils/format';
import { isResource } from '../utils';
import { useTempStore } from '../contexts/TempStoreContext';
import Badge from '../components/Badge';
import LoadingOverlay from '../components/LoadingOverlay';
import HeaderButton from '../components/HeaderButton';
import PlaceMapView from '../components/PlaceMapView';
import useFleetbase from '../hooks/use-fleetbase';

const FuelReportScreen = ({ route }) => {
    const theme = useTheme();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { adapter } = useFleetbase();
    const {
        store: { fuelReport: fuelReportFromStore },
    } = useTempStore();

    // Use route params as fallback if temp store is empty
    const params = route?.params || {};
    const fuelReport = fuelReportFromStore || params.fuelReport;

    const location = fuelReport ? new Place({ id: fuelReport.id, location: fuelReport.location }) : null;
    const [isLoading, setIsLoading] = useState(false);

    // Safety check: if no fuelReport data is available, show error or go back
    if (!fuelReport) {
        return (
            <YStack flex={1} bg='$background' justifyContent='center' alignItems='center'>
                <Text color='$textPrimary' fontSize={18}>
                    Fuel Report not found
                </Text>
            </YStack>
        );
    }

    const handleDeleteFuelReport = useCallback(() => {
        const handleDelete = async () => {
            setIsLoading(true);

            try {
                await adapter.delete(`fuel-reports/${fuelReport.id}`);
                navigation.goBack();
            } catch (err) {
                console.warn('Error deleting fuel report:', err);
            } finally {
                setIsLoading(false);
            }
        };

        Alert.alert('Confirm Deletion', 'Are you sure you want to delete this Fuel Report?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete Fuel Report', onPress: handleDelete },
        ]);
    }, [adapter]);

    return (
        <YStack flex={1} bg='$background'>
            <Portal hostName='FuelReportScreenHeaderRightPortal'>
                <XStack space='$3'>
                    <HeaderButton
                        icon={faPenToSquare}
                        onPress={() => navigation.navigate('EditFuelReport', { fuelReport })}
                        bg='$info'
                        iconColor='$infoText'
                        borderWidth={1}
                        borderColor='$infoBorder'
                    />
                    <HeaderButton icon={faTrash} onPress={handleDeleteFuelReport} bg='$error' iconColor='$errorText' borderWidth={1} borderColor='$errorBorder' />
                    <HeaderButton icon={faTimes} onPress={() => navigation.goBack()} />
                </XStack>
            </Portal>
            <LoadingOverlay visible={isLoading} text='Deleting Fuel Report...' />
            <ScrollView showsVerticalScrollIndicator={false}>
                <YStack py='$3' space='$3'>
                <XStack px='$3' alignItems='center' space='$3'>
                    <YStack alignItems='flex-start'>
                        <Text color='$textSecondary' fontSize={17} fontWeight='bold'>
                            Odometer:
                        </Text>
                    </YStack>
                    <YStack flex={1} alignItems='flex-end'>
                        <Text color='$textPrimary' fontSize={17} numberOfLines={1}>
                            {fuelReport.odometer}
                        </Text>
                    </YStack>
                </XStack>
                <Separator />
                <XStack px='$3' alignItems='center' space='$3'>
                    <YStack alignItems='flex-start'>
                        <Text color='$textSecondary' fontSize={17} fontWeight='bold'>
                            Volume:
                        </Text>
                    </YStack>
                    <YStack flex={1} alignItems='flex-end'>
                        <Text color='$textPrimary' fontSize={17} numberOfLines={1}>
                            {fuelReport.volume} {fuelReport.metric_unit}
                        </Text>
                    </YStack>
                </XStack>
                <Separator />
                <XStack px='$3' alignItems='center' space='$3'>
                    <YStack alignItems='flex-start'>
                        <Text color='$textSecondary' fontSize={17} fontWeight='bold'>
                            Vehicle:
                        </Text>
                    </YStack>
                    <YStack flex={1} alignItems='flex-end'>
                        <Text color='$textPrimary' fontSize={17} numberOfLines={1}>
                            {fuelReport.vehicle_name ?? 'N/A'}
                        </Text>
                    </YStack>
                </XStack>
                <Separator />
                <XStack px='$3' alignItems='center' space='$3'>
                    <YStack alignItems='flex-start'>
                        <Text color='$textSecondary' fontSize={17} fontWeight='bold'>
                            Cost:
                        </Text>
                    </YStack>
                    <YStack flex={1} alignItems='flex-end'>
                        <Text color='$textPrimary' fontSize={17} numberOfLines={1}>
                            {formatCurrency(fuelReport.amount, fuelReport.currency)}
                        </Text>
                    </YStack>
                </XStack>
                <Separator />
                <XStack px='$3' alignItems='center' space='$3'>
                    <YStack alignItems='flex-start'>
                        <Text color='$textSecondary' fontSize={17} fontWeight='bold'>
                            Status:
                        </Text>
                    </YStack>
                    <YStack flex={1} alignItems='flex-end'>
                        <Badge status={fuelReport.status} fontSize={13} py='$2' />
                    </YStack>
                </XStack>
                <Separator />
                <YStack px='$3' space='$3'>
                    <YStack alignItems='flex-start'>
                        <Text color='$textSecondary' fontSize={17} fontWeight='bold'>
                            Report Location:
                        </Text>
                    </YStack>
                    <YStack flex={1} alignItems='flex-start'>
                        <PlaceMapView place={location} width='100%' height={200} borderWidth={1} borderColor='$borderColor' />
                    </YStack>
                </YStack>
                </YStack>
            </ScrollView>
        </YStack>
    );
};

export default FuelReportScreen;
