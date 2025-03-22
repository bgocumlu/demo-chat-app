import ChatContainer from "@/components/ChatContainer";
import NoChatSelected from "@/components/NoChatSelected";
import { SideBar } from "@/components/SideBar";
import { useChatStore } from "@/store/useChatStore";
import { useState } from "react";

const HomePage = () => {
    const { selectedUser } = useChatStore();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // State to toggle sidebar

    return (
        <div
            className="min-h-[100dvh] bg-base-200"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }} // Add padding for the safe area
        >
            <div className="flex items-center justify-center pt-20 px-4">
                <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100dvh-8rem)]">
                    <div className="flex h-full rounded-lg overflow-hidden">
                        <SideBar
                            isSidebarOpen={isSidebarOpen}
                            setIsSidebarOpen={setIsSidebarOpen}
                        />

                        {!selectedUser ? (
                            <NoChatSelected
                                setIsSidebarOpen={setIsSidebarOpen}
                            />
                        ) : (
                            <ChatContainer
                                setIsSidebarOpen={setIsSidebarOpen}
                                isSidebarOpen={isSidebarOpen}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
