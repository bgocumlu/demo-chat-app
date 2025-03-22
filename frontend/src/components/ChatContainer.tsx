import { useChatStore } from "@/store/useChatStore";
import { useEffect, useRef, useState } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "@/store/useAuthStore";
import { formatMessageTime } from "@/lib/utils";
import { X } from "lucide-react";

interface ChatContainerProps {
    setIsSidebarOpen: (isSidebarOpen: boolean) => void;
    isSidebarOpen: boolean;
}

const ChatContainer = ({
    setIsSidebarOpen,
    isSidebarOpen,
}: ChatContainerProps) => {
    const {
        messages,
        fetchMessages,
        isMessagesLoading,
        selectedUser,
        subscribeToMessages,
        unsubscribeFromMessages,
        deleteMessage,
    } = useChatStore();
    const { authUser } = useAuthStore();
    const messageEndRef = useRef<HTMLDivElement | null>(null);
    const [autoScroll, setAutoScroll] = useState(true);

    // TODO: Implement message editing
    const handleDeleteMessage = (
        event: React.MouseEvent<HTMLButtonElement>
    ): void => {
        const messageId = event.currentTarget.dataset.messageId;
        deleteMessage(messageId ?? "");
        console.log(`Delete message with ID: ${messageId}`);
        // Add your delete logic here
    };

    const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
        console.log(event.currentTarget.dataset.imageIndex);
        if (
            Number(event.currentTarget.dataset.imageIndex) ==
            messages.length - 1
        ) {
            if (autoScroll && messageEndRef.current && messages) {
                messageEndRef.current.scrollIntoView({ behavior: "smooth" });
            }
        }
    };

    useEffect(() => {
        if (selectedUser?._id) {
            fetchMessages(selectedUser._id);
        }

        subscribeToMessages();

        return () => unsubscribeFromMessages();
    }, [
        selectedUser?._id,
        fetchMessages,
        subscribeToMessages,
        unsubscribeFromMessages,
    ]);

    useEffect(() => {
        if (autoScroll && messageEndRef.current && messages) {
            messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, autoScroll]);

    if (isMessagesLoading) {
        return (
            <div className="flex-1 flex flex-col overflow-auto">
                <ChatHeader
                    autoScroll={autoScroll}
                    setAutoScroll={setAutoScroll}
                    setIsSidebarOpen={setIsSidebarOpen}
                    isSidebarOpen={isSidebarOpen}
                />
                <MessageSkeleton />
                <MessageInput />
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col overflow-auto">
            <ChatHeader
                autoScroll={autoScroll}
                setAutoScroll={setAutoScroll}
                setIsSidebarOpen={setIsSidebarOpen}
                isSidebarOpen={isSidebarOpen}
            />

            <div className="flex-grow overflow-y-auto p-4 space-y-4 ">
                <div className="flex flex-col min-h-full justify-end">
                    {messages.map((message, index) => (
                        <div
                            key={message._id}
                            className={`chat ${
                                message.senderId === authUser?._id
                                    ? "chat-end"
                                    : "chat-start"
                            }`}
                            ref={
                                index === messages.length - 1
                                    ? messageEndRef
                                    : null
                            } // Only set ref for the last message
                        >
                            <div className="chat-image avatar">
                                <div className="size-10 rounded-full border">
                                    <img
                                        src={
                                            message.senderId === authUser?._id
                                                ? authUser?.profilePic ||
                                                  "/avatar.png"
                                                : selectedUser?.profilePic ||
                                                  "/avatar.png"
                                        }
                                        alt="profile pic"
                                    />
                                </div>
                            </div>
                            <div className="chat-header mb-1">
                                <time className="text-xs opacity-50 ml-1">
                                    {formatMessageTime(message.createdAt ?? "")}
                                </time>
                            </div>
                            <div
                                className={`chat-bubble flex flex-col ${
                                    message.senderId === authUser?._id
                                        ? "chat-bubble-primary"
                                        : ""
                                } group`}
                            >
                                {message.image && (
                                    <img
                                        src={message.image}
                                        alt="Attachment"
                                        className="sm:max-w-[200px] rounded-md mb-2"
                                        data-image-index={index}
                                        onLoad={handleImageLoad}
                                    />
                                )}
                                {message.senderId === authUser?._id && (
                                    <button
                                        className="absolute -top-0.5 -left-0.5 text-xs text-error bg-base-100 rounded-full p-0.5 hidden group-hover:block"
                                        data-message-id={message._id} // Store the message ID in a data attribute
                                        onClick={handleDeleteMessage}
                                    >
                                        <X size={8} />
                                    </button>
                                )}
                                {message.text && <p>{message.text}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <MessageInput />
        </div>
    );
};

export default ChatContainer;
