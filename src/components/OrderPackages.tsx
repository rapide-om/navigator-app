import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { YStack, XStack, Text, Separator, useTheme } from 'tamagui';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBox, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { SimpleGrid } from 'react-native-super-grid';
import FastImage from 'react-native-fast-image';
import Collapsible from 'react-native-collapsible';

const PRODUCT_COLUMN_WIDTH = 100;

const ProductItem = ({ product }) => {
    return (
        <YStack alignItems='center' justifyContent='center' py='$3' space='$2' borderWidth={1} borderColor='$borderColor' borderRadius='$4'>
            <FastImage source={{ uri: product.photo_url }} style={{ width: 60, height: 60 }} />
            <YStack space='$1'>
                <Text textAlign='center' color='$textPrimary' numberOfLines={2} fontSize='$2'>
                    {product.name}
                </Text>
            </YStack>
        </YStack>
    );
};

const PackageCard = ({ pkg, defaultExpanded = false }) => {
    const theme = useTheme();
    const [expanded, setExpanded] = useState(defaultExpanded);
    const products = pkg.products ?? [];
    const productCount = products.length;

    const hasDimensions = (pkg.length > 0 || pkg.width > 0 || pkg.height > 0);
    const hasWeight = pkg.weight > 0;

    const formatDimensions = () => {
        const parts = [pkg.length, pkg.width, pkg.height].filter((v) => v > 0);
        const unit = pkg.dimensions_unit || 'cm';
        return `${parts.join(' x ')} ${unit}`;
    };

    return (
        <YStack borderWidth={1} borderColor='$borderColor' borderRadius='$4' overflow='hidden' bg='$background'>
            <Pressable onPress={() => setExpanded((prev) => !prev)}>
                <XStack px='$3' py='$3' alignItems='center' space='$3'>
                    {pkg.photo_url ? (
                        <FastImage source={{ uri: pkg.photo_url }} style={{ width: 44, height: 44, borderRadius: 8 }} />
                    ) : (
                        <YStack width={44} height={44} borderRadius={8} bg='$gray-200' alignItems='center' justifyContent='center'>
                            <FontAwesomeIcon icon={faBox} size={20} color={theme['$textSecondary']?.val ?? '#999'} />
                        </YStack>
                    )}
                    <YStack flex={1}>
                        <Text color='$textPrimary' fontWeight='bold' fontSize='$4' numberOfLines={1}>
                            {pkg.name || 'Unnamed Package'}
                        </Text>
                        <Text color='$textSecondary' fontSize='$2'>
                            {productCount} {productCount === 1 ? 'product' : 'products'}
                        </Text>
                    </YStack>
                    <FontAwesomeIcon icon={expanded ? faChevronUp : faChevronDown} size={14} color={theme['$textSecondary']?.val ?? '#999'} />
                </XStack>
            </Pressable>
            <Collapsible collapsed={!expanded}>
                <Separator />
                <YStack px='$3' py='$3' space='$3'>
                    {(hasDimensions || hasWeight) && (
                        <YStack space='$1'>
                            {hasDimensions && (
                                <XStack space='$2'>
                                    <Text color='$textSecondary' fontSize='$2'>Dimensions:</Text>
                                    <Text color='$textPrimary' fontSize='$2'>{formatDimensions()}</Text>
                                </XStack>
                            )}
                            {hasWeight && (
                                <XStack space='$2'>
                                    <Text color='$textSecondary' fontSize='$2'>Weight:</Text>
                                    <Text color='$textPrimary' fontSize='$2'>{pkg.weight} {pkg.weight_unit || 'kg'}</Text>
                                </XStack>
                            )}
                        </YStack>
                    )}
                    {productCount > 0 && (
                        <YStack>
                            <Text color='$textSecondary' fontSize='$2' mb='$2'>Products</Text>
                            <SimpleGrid
                                maxItemsPerRow={3}
                                itemDimension={PRODUCT_COLUMN_WIDTH}
                                data={products}
                                renderItem={({ item }) => <ProductItem product={item} />}
                                style={{ padding: 0, paddingLeft: 0 }}
                                spacing={8}
                            />
                        </YStack>
                    )}
                    {productCount === 0 && !hasDimensions && !hasWeight && (
                        <Text color='$textSecondary' textAlign='center' fontSize='$2'>No details available</Text>
                    )}
                </YStack>
            </Collapsible>
        </YStack>
    );
};

const OrderPackages = ({ order }) => {
    const packages = order.getAttribute('payload.packages', []) ?? [];

    if (packages.length === 0) {
        return (
            <YStack py='$5' alignItems='center' justifyContent='center'>
                <Text color='$textSecondary'>No packages.</Text>
            </YStack>
        );
    }

    return (
        <YStack px='$3' py='$4' space='$3'>
            {packages.map((pkg, index) => (
                <PackageCard key={pkg.id ?? index} pkg={pkg} defaultExpanded={index === 0} />
            ))}
        </YStack>
    );
};

export default OrderPackages;
