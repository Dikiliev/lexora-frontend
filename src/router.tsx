import { createBrowserRouter } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Profile from "./pages/Profile";
import PostJob from "./pages/PostJob";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <RootLayout />,
        children: [
            { index: true, element: <Home /> },
            { path: "search", element: <Search /> },
            { path: "translator/:id", element: <Profile /> },
            { path: "post-job", element: <PostJob /> },
        ],
    },
]);
