// src/types/types.ts

export interface Itinerary {
  day: number;
  details: string;
  title: string;
}

// Đổi tên travel thành Travel (viết hoa chữ cái đầu theo chuẩn Convention)
export interface Travel {
  id: string;
  departurePoint: string;
  destinationIDs: string[]; // Lưu ý: trong code bạn dùng destinationID nhưng logic detail lại dùng mảng destinationIDs
  images: string[];
  description: string;
  itinerary: Itinerary[];
  price: number;
  title: string;
  averageRating: number;
  reviewCount: number;
}

// Định nghĩa ParamList chung cho Navigation
export type RootStackParamList = {
  Splash: undefined;
  Home: undefined;
  Intro: undefined;
  Explore: undefined;
  Main: undefined;
  Search: undefined;
  // TravelDetail chấp nhận hoặc object travel, hoặc chỉ cần id
  TravelDetail: { travel?: Travel; id?: string }; 
  BookingTour: { travel: Travel; destinationName: string };
  BookingInfor: { props: any }; // Cập nhật type cụ thể nếu cần
  Payment: { payment: any };    // Cập nhật type cụ thể nếu cần
  Chatbot: undefined;
};