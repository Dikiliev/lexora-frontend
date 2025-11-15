import { createBrowserRouter } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Profile from "./pages/Profile";
import PostJob from "./pages/PostJob";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TranslatorSettings from "./pages/TranslatorSettings";
import TranslatorChats from "./pages/TranslatorChats";
import ClientChats from "./pages/ClientChats";
import ProtectedRoute from "./components/ProtectedRoute";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <RootLayout />,
        children: [
            { index: true, element: <Home /> },
            { path: "search", element: <Search /> },
            { path: "translator/:id", element: <Profile /> },
            {
                path: "post-job",
                element: (
                    <ProtectedRoute roles={["client"]}>
                        <PostJob />
                    </ProtectedRoute>
                ),
            },
            { path: "login", element: <Login /> },
            { path: "register", element: <Register /> },
            {
                path: "chats",
                element: (
                    <ProtectedRoute roles={["client"]}>
                        <ClientChats />
                    </ProtectedRoute>
                ),
            },
            {
                path: "translator/settings",
                element: (
                    <ProtectedRoute roles={["translator"]}>
                        <TranslatorSettings />
                    </ProtectedRoute>
                ),
            },
            {
                path: "translator/chats",
                element: (
                    <ProtectedRoute roles={["translator"]}>
                        <TranslatorChats />
                    </ProtectedRoute>
                ),
            },
        ],
    },
]);
