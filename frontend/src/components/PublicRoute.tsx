import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface PublicRouteProps {
    children?: React.ReactNode;
}

export default function PublicRoute({ children }: PublicRouteProps) {
    const { isAuthenticated, user } = useAuth();

    if (isAuthenticated && user) {
        // Redirect authenticated users to their respective dashboards
        const userType = (user as any).userType || (user as any).role;

        if (userType === 'Admin' || userType === 'Super Admin') {
            return <Navigate to="/admin" replace />;
        }

        if (userType === 'Seller') {
            return <Navigate to="/seller" replace />;
        }

        if (userType === 'Delivery') {
            return <Navigate to="/delivery" replace />;
        }

        // Default for Customer or unknown types
        return <Navigate to="/" replace />;
    }

    return children ? <>{children}</> : <Outlet />;
}
