import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";
import { create } from "zustand";
import { io } from "socket.io-client";
import { Socket } from "socket.io-client";
import User from "./User";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

interface AuthState {
    authUser?: User | null;
    isSigningUp: boolean;
    isLoggingIn: boolean;
    isUpdatingProfile: boolean;
    isCheckingAuth: boolean;
    onlineUsers: string[];
    socket: Socket | null;
    checkAuth: () => Promise<void>;
    signup: (formData: Form) => Promise<void>;
    login: (formData: Form) => Promise<void>;
    logout: () => Promise<void>;
    deleteAccount: (userId: string) => Promise<void>;
    updateProfile: (data: unknown) => Promise<void>;
    connectSocket: () => void;
    disconnectSocket: () => void;
}

interface Form {
    username?: string | null;
    password?: string | null;
    profilePic?: string | null;
    isGuest: boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,

    checkAuth: async () => {
        try {
            const response = await axiosInstance.get("auth/check");
            set({ authUser: response.data });
            get().connectSocket();
        } catch (error) {
            console.log(error);
            set({ authUser: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    signup: async (formData: Form) => {
        set({ isSigningUp: true });

        try {
            const response = await axiosInstance.post("auth/signup", formData);
            toast.success("Account created successfully");
            set({ authUser: response.data });

            get().connectSocket();
        } catch (error) {
            console.log(error);
            const errorMessage =
                (error as { response?: { data?: { message?: string } } })
                    ?.response?.data?.message || "An error occurred";
            toast.error(errorMessage);
        } finally {
            set({ isSigningUp: false });
        }
    },

    login: async (formData: Form) => {
        set({ isLoggingIn: true });

        try {
            const response = await axiosInstance.post("auth/login", formData);
            toast.success("Logged in successfully");
            set({ authUser: response.data });

            get().connectSocket();
        } catch (error) {
            console.log(error);
            const errorMessage =
                (error as { response?: { data?: { message?: string } } })
                    ?.response?.data?.message || "An error occurred";
            toast.error(errorMessage);
        } finally {
            set({ isLoggingIn: false });
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post("auth/logout");
            set({ authUser: null });
            toast.success("Logged out successfully");
            get().disconnectSocket();
        } catch (error) {
            console.log(error);
            toast.error("An error occurred");
        }
    },

    updateProfile: async (data) => {
        const user = get().authUser;
        if (user?.isGuest) {
            toast.error("Guest users cannot update their profile");
            return;
        }

        set({ isUpdatingProfile: true });

        try {
            const response = await axiosInstance.put(
                "auth/update-profile",
                data
            );
            set({ authUser: response.data });
            toast.success("Profile updated successfully");
        } catch (error) {
            console.log(error);
            const errorMessage =
                (error as { response?: { data?: { message?: string } } })
                    ?.response?.data?.message || "An error occurred";
            toast.error(errorMessage);
        } finally {
            set({ isUpdatingProfile: false });
        }
    },

    deleteAccount: async (userId: string) => {
        if (!userId) {
            toast.error("User ID is required");
            return;
        }
        try {
            const res = await axiosInstance.post("auth/delete");

            set({ authUser: null });
            console.log(res);
            toast.success("Account deleted successfully");
            get().disconnectSocket();
        } catch (error) {
            console.log(error);
            toast.error("An error occurred");
        }
    },

    connectSocket: () => {
        const { authUser } = get();
        if (!authUser || get().socket?.connected) return;

        const socket = io(BASE_URL, {
            query: { userId: authUser._id },
        });
        socket.connect();

        set({ socket });

        socket.on("getOnlineUsers", (userIds: string[]) => {
            set({ onlineUsers: userIds });
        });
    },

    disconnectSocket: () => {
        if (get().socket?.connected) {
            get().socket?.disconnect();
        }
    },
}));
