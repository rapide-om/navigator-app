import { YStack, XStack, Text, Avatar, Separator, Button, useTheme } from 'tamagui';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPhone, faMessage } from '@fortawesome/free-solid-svg-icons';
import { Linking } from 'react-native';

const OrderCustomerCard = ({ customer }) => {
    const theme = useTheme();

    const handleCall = () => {
        if (customer.phone) {
            Linking.openURL(`tel:${customer.phone}`);
        }
    };

    const handleWhatsApp = () => {
        if (customer.phone) {
            // Remove any non-numeric characters from phone number
            const phoneNumber = customer.phone.replace(/[^0-9]/g, '');
            Linking.openURL(`whatsapp://send?phone=${phoneNumber}`);
        }
    };

    return (
        <YStack space='$2' borderWidth={1} borderColor='$borderColor' borderRadius='$4'>
            <YStack px='$3' py='$2'>
                <XStack space='$3'>
                    <YStack justifyContent='center'>
                        <Avatar size={30} circular>
                            <Avatar.Image src={customer.photo_url} />
                        </Avatar>
                    </YStack>
                    <YStack>
                        <Text color='$textPrimary' fontWeight='bold' mb='$1'>
                            {customer.name}
                        </Text>
                        <YStack>
                            {customer.phone && <Text color='$textSecondary'>{customer.phone}</Text>}
                        </YStack>
                    </YStack>
                </XStack>
            </YStack>
            <Separator />
            <YStack px='$3' py='$2'>
                <XStack space='$3'>
                    <Button bg='$info' size='$3' borderWidth={1} borderColor='$infoBorder' onPress={handleCall}>
                        <Button.Icon>
                            <FontAwesomeIcon icon={faPhone} color={theme.infoText.val} />
                        </Button.Icon>
                        <Button.Text color='$infoText'>Call</Button.Text>
                    </Button>
                    <Button bg='$info' size='$3' borderWidth={1} borderColor='$infoBorder' onPress={handleWhatsApp}>
                        <Button.Icon>
                            <FontAwesomeIcon icon={faMessage} color={theme.infoText.val} />
                        </Button.Icon>
                        <Button.Text color='$infoText'>Chat</Button.Text>
                    </Button>
                </XStack>
            </YStack>
        </YStack>
    );
};

export default OrderCustomerCard;
