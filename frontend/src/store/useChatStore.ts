import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "@/lib/axios";
import { useAuthStore } from "./useAuthStore";
import User from "./User";
import { AxiosError } from "axios";

interface Message {
    _id?: string;
    senderId?: string;
    recieverId?: string;
    text: string;
    image?: string | null;
    createdAt?: string;
}

interface ChatStore {
    messages: Message[];
    users: User[];
    selectedUser?: User | null;
    isUsersLoading: boolean;
    isMessagesLoading: boolean;
    isImageLoading: boolean;

    fetchUsers: () => Promise<void>;
    fetchMessages: (userId: string) => Promise<void>;
    sendMessage: (messageData: Message) => Promise<void>;
    deleteMessage: (messageId: string) => Promise<void>;
    subscribeToMessages: () => void;
    unsubscribeFromMessages: () => void;
    setSelectedUser: (selectedUser: User | null) => void;
    setImageLoading: (isImageLoading: boolean) => void;
    sortUsers: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
    isImageLoading: false,

    fetchUsers: async () => {
        set({ isUsersLoading: true });

        try {
            const response = await axiosInstance.get("messages/users");
            set({ users: response.data });
        } catch (error) {
            console.log(error);
            toast.error("Failed to fetch users");
        } finally {
            set({ isUsersLoading: false });
        }

        get().sortUsers();
    },

    fetchMessages: async (userId: string) => {
        set({ isMessagesLoading: true });

        try {
            const response = await axiosInstance.get(`messages/${userId}`);
            set({ messages: response.data });
        } catch (error) {
            console.log(error);
            toast.error("Failed to fetch messages");
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();
        try {
            const formData = new FormData();
            formData.append("text", messageData.text);

            if (messageData.image) {
                formData.append("image", messageData.image);
                set({ isImageLoading: true });
            }

            const response = await axiosInstance.post(
                `/messages/send/${selectedUser?._id}`,
                formData
            );

            set({ messages: [...messages, response.data] });
        } catch (error) {
            const e = error as AxiosError;
            console.log(e.response?.statusText);
            toast.error(e.response?.statusText ?? "Failed to send message");
        } finally {
            set({ isImageLoading: false });
        }
    },

    deleteMessage: async (messageId) => {
        const { messages } = get();

        try {
            await axiosInstance.post(`/messages/delete/${messageId}`);
            set({
                messages: messages.filter(
                    (message) => message._id !== messageId
                ),
            });
        } catch (error) {
            console.log(error);
            toast.error("Failed to delete message");
        }
    },

    subscribeToMessages: () => {
        const { selectedUser } = get();
        if (!selectedUser) return;

        const socket = useAuthStore.getState().socket;

        socket?.on("newMessage", (newMessage: Message) => {
            if (newMessage.senderId !== selectedUser._id) return;

            set((state) => ({ messages: [...state.messages, newMessage] }));
        });

        // Listen for deleted messages
        socket?.on("deleteMessage", (deletedMessageId: string) => {
            const message = get().messages.find(
                (message) => message._id === deletedMessageId
            );
            console.log("Deleted message: ", message);
            set((state) => ({
                messages: state.messages.filter(
                    (message) => message._id !== deletedMessageId
                ),
            }));
        });
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket?.off("newMessage");
        socket?.off("deleteMessage");
    },

    setSelectedUser: (selectedUser) => {
        set({ selectedUser });
    },

    setImageLoading: (isImageLoading) => {
        set({ isImageLoading: isImageLoading });
    },

    sortUsers: () => {
        set((state) => ({
            users: state.users.sort((a, b) => {
                if (a.username < b.username) return -1;
                if (a.username > b.username) return 1;
                return 0;
            }),
        }));
    },
}));
