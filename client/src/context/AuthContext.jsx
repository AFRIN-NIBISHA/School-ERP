import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [userRole, setUserRole] = useState(null); // 'teacher' or 'student'
    const [currentUser, setCurrentUser] = useState(null); // Full user object for students

    const login = (role, userData = null) => {
        setUserRole(role);
        setCurrentUser(userData);
    };

    const logout = () => {
        setUserRole(null);
        setCurrentUser(null);
    };

    return (
        <AuthContext.Provider value={{ userRole, currentUser, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
