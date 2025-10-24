import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import Header from "../components/Header";

export default function RootLayout() {
    return (
        <Box>
            <Header />
            <Box component="main">
                <Outlet />
            </Box>
        </Box>
    );
}
