import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';

export async function registerForPushNotificationsAsync() {
  const {status: existingStatus} = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if(existingStatus !== 'granted') {
    const {status} = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if(finalStatus !== 'granted') Alert.alert("Failed to get push token for push notification!");
}

export const scheduleLocalNotification = async () => {
  // 1. Kiểm tra quyền trước khi lên lịch (rất quan trọng)
//   const permissionGranted = await requL

//   if (permissionGranted) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Nhắc nhở hàng ngày! 🔔",
          body: "Đừng quên vào ứng dụng để điểm danh nhận thưởng hôm nay.",
          data: { key: 'local_checkin' },
        },
        trigger: { 
          seconds: 4,          
          repeats: false,      
        } as Notifications.TimeIntervalTriggerInput,
      });
      console.log("Đã lên lịch thông báo cục bộ.");
  // }
};