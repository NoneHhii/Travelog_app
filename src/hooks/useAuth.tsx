import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { Text, View } from "react-native";
import { getOneUser, getUsers } from "../api/apiClient";
import { UserDB } from "../screens/Register";

interface AuthContextType {
    user: UserDB | null; 
    loading: boolean;
    logout: () => void,
    refreshUser: () => void,
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    logout: () => {},
    refreshUser: () => {},
});

export const useAuth = () => {
    return useContext(AuthContext);
}

export const AuthProvider = ({children}) => {
    const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
    const [user, setUser] = useState<UserDB | null>(null);
    const [users, setUsers] = useState<UserDB[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const refreshUser = () => setRefreshTrigger(prev => prev + 1);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (authUser) => {
            setFirebaseUser(authUser);
            // setLoading(false);
        })

        return unsubscribe;
    }, []);

    useEffect(() => {
        const fetchUser = async () => {
            if(firebaseUser) {
                try {
                    console.log(firebaseUser.uid);
                    
                    const dbUser = await getOneUser(firebaseUser.uid);

                    if(dbUser) {
                        setUser(dbUser);
                    } else {
                        // setUser(firebaseUser as UserDB);
                        console.warn("User data not found in DB, using Firebase Auth data.");
                        
                    }
                } catch (error) {
                    console.error("Fail when get user", error);
                    
                } finally {
                    setLoading(false);
                }
            } else {
                setUser(null);
                setLoading(false);
            }
        }

        fetchUser();
    }, [firebaseUser, users, refreshTrigger]);

    const logout = () => {
        auth.signOut().then(() => {
            setUser(null);
            setFirebaseUser(null);
        })
    }

    const value = {
        user,
        loading,
        logout,
        refreshUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading ? children : (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text>Đang kiểm tra phiên đăng nhập...</Text>
                </View>
            )}
        </AuthContext.Provider>
    )
}