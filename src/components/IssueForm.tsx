import React, { useState, useCallback, useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, ActivityIndicator } from 'react-native';
import { Text, YStack, XStack, Button, useTheme } from 'tamagui';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import { underscore } from 'inflected';
import { uppercase } from '../utils/format';
import { getIssueTypes, getIssuePriorities, getIssueStatuses, getIssueCategories, IssueStatus, IssuePriority } from '../constants/Enums';
import SimpleSelect from '../components/SimpleSelect';
import SimpleTextArea from '../components/SimpleTextArea';

const IssueForm = ({ value = {}, onSubmit, isSubmitting = false, submitText = 'Publish Issue' }) => {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const [issue, setIssue] = useState({
        status: IssueStatus.PENDING,
        priority: IssuePriority.LOW,
        ...value,
    });

    const isValid = useMemo(() => {
        return !!issue.type && !!issue.category && !!issue.report;
    }, [issue.type, issue.category, issue.report]);

    const handleUpdateIssue = (key, value) => {
        setIssue((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleSubmit = useCallback(() => {
        if (onSubmit && isValid) {
            const formattedIssue = {
                ...issue,
                type: underscore(issue.type),
                priority: underscore(issue.priority),
                status: underscore(issue.status),
            };
            onSubmit(formattedIssue);
        }
    }, [onSubmit, isValid, issue]);

    return (
        <YStack flex={1}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                    <YStack py='$3' space='$4'>
                <YStack px='$3' space='$2'>
                    <Text color='$textPrimary' fontSize={18} fontWeight='bold' px='$1'>
                        Issue Type
                    </Text>
                    <SimpleSelect
                        value={issue.type}
                        options={getIssueTypes()}
                        optionLabel='value'
                        optionValue='key'
                        onChange={(value) => handleUpdateIssue('type', value)}
                        title='Select Issue Type'
                        humanize={true}
                    />
                </YStack>
                <YStack px='$3' space='$2'>
                    <Text color='$textPrimary' fontSize={18} fontWeight='bold' px='$1'>
                        Issue Category
                    </Text>
                    <SimpleSelect
                        value={issue.category}
                        options={getIssueCategories(uppercase(underscore(issue.type)))}
                        onChange={(value) => handleUpdateIssue('category', value)}
                        title='Select Issue Category'
                        humanize={true}
                    />
                </YStack>
                <YStack px='$3' space='$2'>
                    <Text color='$textPrimary' fontSize={18} fontWeight='bold' px='$1'>
                        Issue Priority
                    </Text>
                    <SimpleSelect
                        value={issue.priority}
                        options={getIssuePriorities()}
                        optionLabel='value'
                        optionValue='key'
                        onChange={(value) => handleUpdateIssue('priority', value)}
                        title='Select Issue Priority'
                        humanize={true}
                    />
                </YStack>
                <YStack px='$3' space='$2'>
                    <Text color='$textPrimary' fontSize={18} fontWeight='bold' px='$1'>
                        Issue Status
                    </Text>
                    <SimpleSelect
                        value={issue.status}
                        options={getIssueStatuses()}
                        optionLabel='value'
                        optionValue='key'
                        onChange={(value) => handleUpdateIssue('status', value)}
                        title='Select Issue Status'
                        humanize={true}
                    />
                </YStack>
                <YStack px='$3' space='$2'>
                    <Text color='$textPrimary' fontSize={18} fontWeight='bold' px='$1'>
                        Issue Report
                    </Text>
                    <SimpleTextArea
                        value={issue.report}
                        onChange={(value) => handleUpdateIssue('report', value)}
                        title='Issue Report'
                        placeholder='Type your issue report...'
                    />
                </YStack>
            </YStack>
            </ScrollView>
            <YStack bg='$background' position='absolute' bottom={insets.bottom} left={0} right={0} borderTopWidth={1} borderColor='$borderColor'>
                <XStack px='$4' py='$4'>
                    <Button
                        onPress={handleSubmit}
                        flex={1}
                        bg='$info'
                        borderWidth={1}
                        borderColor='$infoBorder'
                        height={50}
                        disabled={isSubmitting || !isValid}
                        opacity={isSubmitting || !isValid ? 0.6 : 1}
                    >
                        <Button.Icon>{isSubmitting ? <ActivityIndicator size='small' color={theme['$infoText']?.val ?? '#fff'} /> : <FontAwesomeIcon icon={faSave} color={theme['$infoText'].val} size={16} />}</Button.Icon>
                        <Button.Text color='$infoText' fontSize={15}>
                            {submitText}
                        </Button.Text>
                    </Button>
                </XStack>
            </YStack>
        </YStack>
    );
};

export default IssueForm;
