import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BaseToast, BaseToastProps, ErrorToast } from 'react-native-toast-message';
import { colors } from '../constants/colors';

// Định nghĩa cấu hình style cho Toast
export const toastConfig = {
  // Tùy chỉnh loại 'success'
  success: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      style={{ 
          borderLeftColor: '#34A853', // Màu viền trái xanh lá
          backgroundColor: '#E6FFE6', // Nền xanh rất nhạt
          borderRadius: 10,           // Bo góc rõ rệt
          height: 60,                 // Tăng chiều cao
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 14,
        fontWeight: 'bold',
        color: '#34A853', // Màu xanh lá cho text1
      }}
      text2Style={{
        fontSize: 12,
        color: colors.black,
      }}
    />
  ),

  // Tùy chỉnh loại 'error' (Ví dụ: dùng ErrorToast gốc)
  error: (props: BaseToastProps) => (
    <ErrorToast
      {...props}
      // ... tùy chỉnh cho ErrorToast
      text1Style={{
        fontSize: 14,
        color: colors.red,
      }}
    />
  ),
  
  // Tùy chỉnh loại 'my_custom_toast' (nếu bạn muốn tạo loại mới)
  // my_custom_toast: (props: BaseToastProps) => (/* ... */),
};