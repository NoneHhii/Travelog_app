import { addDoc, collection, doc, Firestore, getDoc, getDocs, query, runTransaction, serverTimestamp, setDoc, Transaction, updateDoc, where } from "firebase/firestore";
import { app, db } from "../firebase/firebase";
import { Booking } from "../screens/BookingInfor";
import { UserDB } from "../screens/Register";
import moment from "moment";
import firebase from 'firebase/app';


export async function createBooking(booking: Booking) {
    const docRef = await addDoc(collection(db, "bookings"), {
        ...booking,
        createAt: serverTimestamp(),
    });
    console.log("Added: ", docRef.id);
    return docRef.id;
    
}

export async function getAllTravel() {
    try {
        const snapshot = await getDocs(collection(db, "tours"));
        const travels = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
        return travels;
    } catch (error) {
        console.error("Error fetching travel data:", error);
        return [];
    }
}

export async function getAllDestinations() {
    try {
        const snapshot = await getDocs(collection(db, "destinations"));
        const destinations = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
        return destinations;
    } catch (error) {
        console.error("Error fetching travel data:", error);
        return [];
    }
}

export async function getReviews() {
    try {
        const snapshot = await getDocs(collection(db, "reviews"));
        const reviews = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
        return reviews;
    } catch (error) {
        console.error("Error fetching travel data:", error);
        return [];
    }
}

export async function getUsers() {
    try {
        const snapshot = await getDocs(collection(db, "users"));
        const users = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
        return users;
    } catch (error) {
        console.error("Error fetching travel data:", error);
        return [];
    }
}

// user
export async function getOneUser(uid: string) {
    if(!uid) {
        console.log("Value failure");
        return null;
    };

    const userDocRef = doc(db, "users", uid);
    
    try {
        const snapshot = await getDoc(userDocRef);
        // console.log(snapshot.data());
        
        if(snapshot.exists()) {
            return {
                id: snapshot.id,
                ...snapshot.data(),
                lastCheckInDate: snapshot.data().lastCheckInDate && snapshot.data().lastCheckInDate.toDate()
            };
        } else {
            console.log("Cannot found user");
            return null;
            
        }
    } catch (error) {
        console.error("Error fetching travel data:", error);
        return [];
    }
}


export async function createUser(user: UserDB) {
    const userDocRef = doc(db, "users", user.uid);

    await setDoc(userDocRef, {
        ...user,
        createAt: serverTimestamp(),
    });
    console.log("Added: ", user.uid);
    return user.uid;
    
}

export async function searchReward(uid: string, point: number) {
    const useRef = doc(db, 'users', uid);

    return runTransaction(db, async (transaction: Transaction) => {
        const userDoc = await transaction.get(useRef);
        if(!userDoc.exists()) throw new Error("Cannot found user");

        const data = userDoc.data();
        let currentCount = data.search.count | 0;
        let pointReward = data.pointReward | 0;
        const lastSearchTime = data.search?.lastUpdated;
        let lastSearchMoment = null;
        if(lastSearchTime) lastSearchMoment = moment(lastSearchTime.toDate());

        const now = moment();

        const isSameDay = lastSearchMoment && lastSearchMoment.isSame(now, 'day');

        if(!isSameDay) currentCount = 1;
        else {
            pointReward+=point;
            currentCount+=1;
        }

        transaction.update(useRef, {
            pointReward: pointReward,
            search: {
                count: currentCount,
                lastUpdated: serverTimestamp(),
            }
        })
    })

    // const resetSearch = searchCount;
    // if(searchCount === 12) searchCount = 1;

    // await updateDoc(useRef, {
    //     pointReward: point
    // });
};

export async function updatePointReward(uid: string, point: number) {
    const useRef = doc(db, 'users', uid);

    await updateDoc(useRef, {
        pointReward: point
    });
};

// Checkin
export async function CheckInDaily(uid: string, point: number) {
    const useRef = doc(db, 'users', uid);

    return runTransaction(db, async (transaction: Transaction) => {
        const userDoc = await transaction.get(useRef);
        if(!userDoc.exists()) throw new Error("User doc does not exist!");

        const data = userDoc.data();
        // console.log(data);
        

        const timeStamp = moment();
        const currentStreak = data.checkinStreak || 0;
        const lastCheckIn = data.lastCheckInDate;
        let lastTimeStamp = null;   
        if(lastCheckIn) lastTimeStamp = moment(lastCheckIn);
        const isTodayChecked = lastTimeStamp && lastTimeStamp.isSame(timeStamp, 'day');
        const yesterdayChecked = lastTimeStamp && lastTimeStamp.isSame(timeStamp.clone().subtract(1, 'day'), 'day');

        if(isTodayChecked) {
            throw new Error("Already checked");
        }

        let newStreak;

        newStreak = currentStreak + 1;

        let reward = data.pointReward + point;

        if(newStreak > 7) {
            newStreak = 1;
        }

        transaction.update(useRef, {
            checkinStreak: newStreak,
            lastCheckInDate: serverTimestamp(),
            pointReward: reward,
        });

        return {success: true, reward: reward};
    });
}

const API_URL = 'https://betravelog.vercel.app/';

//coupon
export async function getCouponByIds(ids: string[]) {
    if(!ids || ids.length === 0) return [];

    try {
        const response = await fetch(`${API_URL}/api/getCouponsByIds`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ids: ids}),
        });

        if(!response.ok) {
            throw new Error('Network response was not ok');
        }

        const coupons = await response.json();
        return coupons;
    } catch (error) {
        console.error("Error calling backend API", error);
        return [];
    }
}


// PAYOS API
export async function createPayOSLink(amount: number, returnUrl: string, cancelUrl: string) {
    try {
        const response = await fetch(`${API_URL}/api/create-payment-link`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                amount: amount, 
                description: "Booking Tour",
                returnUrl: returnUrl,
                cancelUrl: cancelUrl
            }),
        });
        const result = await response.json();
        if (result.error === 0) return result.data; // Trả về object chứa checkoutUrl và orderCode
        throw new Error(result.message);
    } catch (error) {
        console.error("Error creating payment link:", error);
        return null;
    }
}

export async function checkPaymentStatus(orderCode: number) {
    try {
        const response = await fetch(`${API_URL}/api/check-payment-status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderCode }),
        });
        const result = await response.json();
        if (result.error === 0) return result.data; // Trả về thông tin đơn hàng
        return null;
    } catch (error) {
        console.error("Error checking status:", error);
        return null;
    }
}

export async function getBookingsByEmail(email: string) {
    if (!email) return [];
    
    try {
        // Query tìm trong collection 'bookings' có contactEmail trùng với email user
        const q = query(
            collection(db, "bookings"), 
            where("contactEmail", "==", email)
            // orderBy("createAt", "desc") // Bạn có thể thêm index trong Firestore để sort
        );
        
        const snapshot = await getDocs(q);
        const bookings = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            // Xử lý timestamp nếu cần
            // createAt: doc.data().createAt?.toDate() 
        }));
        
        return bookings;
    } catch (error) {
        console.error("Error fetching user bookings:", error);
        return [];
    }
}