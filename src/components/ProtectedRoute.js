import React from 'react';
import { Navigate } from 'react-router-dom';
import '../styles/LoginPage.css';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user) {
        return <Navigate to="/Error" replace />;
    }

    const isTeacher = user.is_teacher;
    const isStudent = !user.is_teacher;

    if ((allowedRoles === "teacher" && !isTeacher) || (allowedRoles === "student" && !isStudent)) {
        return <Navigate to="/Error" replace />;
    }

    return children;
};

export default ProtectedRoute;
