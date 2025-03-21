import { useChatStore } from "@/store/useChatStore";
import { useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "@/store/useAuthStore";
import { formatMessageTime } from "@/lib/utils";

const ChatContainer = () => {
    const {
        messages,
        fetchMessages,
        isMessagesLoading,
        selectedUser,
        subscribeToMessages,
        unsubscribeFromMessages,
    } = useChatStore();
    const { authUser } = useAuthStore();
    const messageEndRef = useRef<HTMLDivElement | null>(null);

    // TODO: Implement message editing, deleting
    // interface TestEvent extends React.MouseEvent<HTMLDivElement> {
    //     target: EventTarget & {
    //         dataset: {
    //             key?: string;
    //         };
    //     };
    // }

    // function test(event: TestEvent): void {
    //     console.log(event.target.dataset.key);
    // }
    //

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
        if (messageEndRef.current && messages) {
            messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    if (isMessagesLoading) {
        return (
            <div className="flex-1 flex flex-col overflow-auto">
                <ChatHeader />
                <MessageSkeleton />
                <MessageInput />
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col overflow-auto">
            <ChatHeader />

            <div className="flex-grow overflow-y-auto p-4 space-y-4 ">
                <div className="flex flex-col min-h-full justify-end">
                    {messages.map((message) => (
                        <div
                            key={message._id}
                            data-key={message._id}
                            className={`chat ${
                                message.senderId === authUser?._id
                                    ? "chat-end"
                                    : "chat-start"
                            }`}
                            ref={messageEndRef}
                            // onClick={test}
                        >
                            <div className=" chat-image avatar">
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
                            <div className="chat-bubble flex flex-col">
                                {message.image && (
                                    <img
                                        src={message.image}
                                        alt="Attachment"
                                        className="sm:max-w-[200px] rounded-md mb-2"
                                    />
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
