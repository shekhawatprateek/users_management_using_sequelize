import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const token = localStorage.getItem('access_token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token) {
        return <Navigate to='/login' replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
        return <Navigate to='/dashboard' replace />;
    }

    // ✅ FIXED: Return the children directly
    return children; 
}

export default ProtectedRoute;