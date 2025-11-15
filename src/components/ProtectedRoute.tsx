import type { ReactElement } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useAuthStore } from "../stores/authStore";

interface ProtectedRouteProps {
    children: ReactElement;
    roles?: ("client" | "translator" | "admin")[];
}

export default function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
    const location = useLocation();
    const user = useAuthStore((state) => state.user);
    const isReady = useAuthStore((state) => state.isReady);

    if (!isReady) {
        return (
            <Box minHeight="50vh" display="flex" alignItems="center" justifyContent="center">
                <CircularProgress />
            </Box>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
    }

    if (roles) {
        const role = user.role;
        const isKnownRole = role === "client" || role === "translator" || role === "admin";

        if (!isKnownRole || !roles.includes(role)) {
            return <Navigate to="/" replace />;
        }
    }

    return children;
}

