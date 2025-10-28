import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

interface DatePickerInputProps {
    label: string;
    value: string; // Ngày sinh hiển thị (string)
    onDateChange: (dateString: string) => void;
}

const DatePickerInput: React.FC<DatePickerInputProps> = ({ label, value, onDateChange }) => {
    const [date, setDate] = useState(new Date());
    const [show, setShow] = useState(false);

    const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        const currentDate = selectedDate || date;
        setShow(Platform.OS === 'ios'); // Ẩn picker sau khi chọn trên Android
        
        if (event.type === 'set') {
            setDate(currentDate);
            const formattedDate = currentDate.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            });
            onDateChange(formattedDate);
        }
    };

    const showDatePicker = () => {
        setShow(true);
    };

    return (
        <View>
            <Text style={styles.label}>{label}:</Text>
            
            <TouchableOpacity onPress={showDatePicker}>
                <View pointerEvents="none"> 
                    <TextInput
                        placeholder="DD/MM/YYYY"
                        value={value}
                        style={styles.textInput}
                        editable={false} 
                    />
                </View>
            </TouchableOpacity>

            {/* Hiển thị DatePicker */}
            {show && (
                <DateTimePicker
                    testID="dateTimePicker"
                    value={date}
                    mode="date" 
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onChange}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    label: {
        fontSize: 14,
        marginTop: 10,
        marginBottom: 5,
        fontWeight: '500',
        color: '#555',
    },
    textInput: {
        height: 40,
        paddingHorizontal: 12,
        backgroundColor: '#F8F9FB', 
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
})

export default DatePickerInput;