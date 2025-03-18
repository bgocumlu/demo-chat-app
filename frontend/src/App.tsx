import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";

import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { useThemeStore } from "./store/useThemeStore";

function App() {
    const { authUser, checkAuth, isCheckingAuth, onlineUsers } = useAuthStore();

    const { theme } = useThemeStore();

    console.log({ onlineUsers });

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    console.log({ authUser });

    if (isCheckingAuth && !authUser) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader className="size-10 animate-spin"></Loader>
            </div>
        );
    }

    return (
        <div className="" data-theme={theme}>
            <Navbar></Navbar>

            <Routes>
                <Route
                    path="/"
                    element={
                        authUser ? (
                            <HomePage></HomePage>
                        ) : (
                            <Navigate to="/login"></Navigate>
                        )
                    }
                ></Route>
                <Route
                    path="/signup"
                    element={
                        !authUser ? (
                            <SignUpPage></SignUpPage>
                        ) : (
                            <Navigate to="/"></Navigate>
                        )
                    }
                ></Route>
                <Route
                    path="/login"
                    element={
                        !authUser ? (
                            <LoginPage></LoginPage>
                        ) : (
                            <Navigate to="/"></Navigate>
                        )
                    }
                ></Route>
                <Route
                    path="/settings"
                    element={<SettingsPage></SettingsPage>}
                ></Route>
                <Route
                    path="/profile"
                    element={
                        authUser ? (
                            <ProfilePage></ProfilePage>
                        ) : (
                            <Navigate to="/login" />
                        )
                    }
                ></Route>
            </Routes>

            <Toaster></Toaster>
        </div>
    );
}

export default App;
