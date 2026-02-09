import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { FlatList, TextInput, Keyboard } from 'react-native';
import { countries, getEmojiFlag } from 'countries-list';
import BottomSheet, { BottomSheetView, BottomSheetFlatList, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useTheme, View, Text, Button, XStack, YStack, Input } from 'tamagui';
import { Portal } from '@gorhom/portal';
import { getCountryByPhoneCode, getCountryByISO2, parsePhoneNumber, debounce } from '../utils';
import useAppTheme from '../hooks/use-app-theme';

function getDefaultValues(value = null, fallbackCountry = 'US') {
    if (typeof value === 'string' && value.startsWith('+')) {
        const segments = parsePhoneNumber(value);
        return {
            phoneNumber: segments.localNumber ?? '',
            ...segments,
        };
    }

    const country = getCountryByISO2(fallbackCountry);
    return {
        phoneNumber: '',
        country,
    };
}

const countryList = Object.entries(countries).map(([code, details]) => ({
    code,
    name: details.name,
    phone: details.phone[0],
    emoji: getEmojiFlag(code),
}));

const PhoneInput = ({ value, onChange, bg, width = '100%', defaultCountryCode = 'US', size = '$5', wrapperProps = {} }) => {
    const defaultValue = getDefaultValues(value, defaultCountryCode);
    const theme = useTheme();
    const { isDarkMode } = useAppTheme();
    const [selectedCountry, setSelectedCountry] = useState(defaultValue.country);
    const [phoneNumber, setPhoneNumber] = useState(defaultValue.phoneNumber);
    const [searchTerm, setSearchTerm] = useState('');
    const bottomSheetRef = useRef<BottomSheet>(null);
    const phoneInputRef = useRef(null);
    const searchInputRef = useRef(null);
    const snapPoints = useMemo(() => ['50%', '75%'], []);
    const backgroundColor = bg ? bg : isDarkMode ? '$surface' : '$gray-200';

    const filteredCountries = useMemo(() => {
        return countryList.filter(({ name, code, phone }) => {
            const lowerSearch = searchTerm.toLowerCase();
            return name.toLowerCase().includes(lowerSearch) || code.toLowerCase().includes(lowerSearch) || String(phone).includes(lowerSearch);
        });
    }, [searchTerm]);

    const openBottomSheet = () => {
        phoneInputRef.current?.blur();
        Keyboard.dismiss();
        bottomSheetRef.current?.expand();
    };

    const closeBottomSheet = () => {
        Keyboard.dismiss();
        bottomSheetRef.current?.close();
    };

    const handleInputFocus = () => {
        bottomSheetRef.current?.close();
    };

    const handleCountrySelect = (country: { code: string; phone: number | string; name?: string; emoji?: string }) => {
        const normalizedCountry = {
            code: country.code,
            phone: typeof country.phone === 'number' ? String(country.phone) : country.phone,
            name: country.name,
            emoji: country.emoji,
        };
        setSelectedCountry(normalizedCountry);
        closeBottomSheet();
    };

    useEffect(() => {
        if (onChange) {
            const combinedValue = `+${selectedCountry.phone}${phoneNumber}`;
            console.log('[PhoneInput] Country Code:', selectedCountry.phone);
            console.log('[PhoneInput] Local Number:', phoneNumber);
            console.log('[PhoneInput] Combined Value:', combinedValue);
            console.log('[PhoneInput] Selected Country:', selectedCountry.code, selectedCountry.name);
            onChange(combinedValue, phoneNumber, selectedCountry);
        }
    }, [selectedCountry, phoneNumber, onChange]);

    return (
        <YStack space='$4' {...wrapperProps}>
            <XStack width='100%' paddingHorizontal={0} shadowOpacity={0} shadowRadius={0} borderWidth={1} borderColor='$borderColorWithShadow' borderRadius='$5' bg={backgroundColor}>
                <Button size={size} onPress={openBottomSheet} bg={backgroundColor} borderWidth={0} width={80} maxWidth={80}>
                    <XStack alignItems='center' space='$2'>
                        <Text fontSize={size}>{getEmojiFlag(selectedCountry.code)}</Text>
                        <Text fontSize={size}>+{selectedCountry.phone}</Text>
                    </XStack>
                </Button>
                <Input
                    size={size}
                    ref={phoneInputRef}
                    flex={1}
                    placeholder='Enter phone number'
                    keyboardType='phone-pad'
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    onFocus={handleInputFocus}
                    bg={backgroundColor}
                    color='$textPrimary'
                    borderRadius={0}
                    borderTopRightRadius='$3'
                    borderBottomRightRadius='$3'
                    overflow='hidden'
                    placeholderTextColor={isDarkMode ? '$gray-700' : '$gray-400'}
                />
            </XStack>

            <Portal hostName='MainPortal'>
                <BottomSheet
                    ref={bottomSheetRef}
                    index={-1}
                    snapPoints={snapPoints}
                    keyboardBehavior='extend'
                    keyboardBlurBehavior='none'
                    enableDynamicSizing={false}
                    enablePanDownToClose={true}
                    enableOverDrag={false}
                    backgroundStyle={{ backgroundColor: theme.background.val }}
                    handleIndicatorStyle={{ backgroundColor: theme.secondary.val }}
                >
                    <BottomSheetFlatList
                        data={filteredCountries}
                        keyExtractor={(item) => item.code}
                        ListHeaderComponent={
                            <YStack px='$3' pb='$2'>
                                <BottomSheetTextInput
                                    ref={searchInputRef}
                                    placeholder='Search country'
                                    onChangeText={setSearchTerm}
                                    autoCapitalize='none'
                                    autoComplete='off'
                                    autoCorrect={false}
                                    style={{
                                        color: theme.textPrimary.val,
                                        backgroundColor: theme.surface.val,
                                        borderWidth: 1,
                                        borderColor: theme.borderColor.val,
                                        padding: 14,
                                        borderRadius: 12,
                                        fontSize: 15,
                                        marginBottom: 10,
                                    }}
                                />
                            </YStack>
                        }
                        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 20 }}
                        renderItem={({ item }) => (
                            <Button
                                size='$4'
                                onPress={() => handleCountrySelect(item)}
                                bg='$surface'
                                justifyContent='space-between'
                                mb='$2'
                                px='$3'
                                borderRadius='$3'
                                hoverStyle={{
                                    opacity: 0.7,
                                }}
                                pressStyle={{
                                    opacity: 0.7,
                                }}
                            >
                                <XStack alignItems='center' gap='$3'>
                                    <Text fontSize={20}>{item.emoji}</Text>
                                    <Text color='$textPrimary'>{item.name}</Text>
                                </XStack>
                                <Text color='$textSecondary'>+{item.phone}</Text>
                            </Button>
                        )}
                    />
                </BottomSheet>
            </Portal>
        </YStack>
    );
};

export default PhoneInput;
