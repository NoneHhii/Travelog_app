import { addDoc, collection, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { Booking } from "../screens/BookingInfor";


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