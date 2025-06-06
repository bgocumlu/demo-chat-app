import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";
import { Menu, X } from "lucide-react";
import toast from "react-hot-toast";

interface ChatHeaderProps {
    autoScroll: boolean;
    setAutoScroll: (autoScroll: boolean) => void;
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isSidebarOpen: boolean) => void;
}

const ChatHeader = ({
    autoScroll,
    setAutoScroll,
    isSidebarOpen,
    setIsSidebarOpen,
}: ChatHeaderProps) => {
    const { selectedUser, setSelectedUser } = useChatStore();
    const { onlineUsers } = useAuthStore();

    function handleAutoScrollToggle() {
        setAutoScroll(!autoScroll);
        if (!autoScroll) {
            toast.success(`Auto Scroll On`, {
                duration: 1000,
            });
        } else {
            toast.error(`Auto Scroll Off`, {
                duration: 1000,
            });
        }
    }

    return (
        <div className="p-2.5 border-b border-base-300">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* Toggle Button */}
                    <button
                        className="z-10 btn btn-sm btn-ghost"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    {/* Avatar */}
                    <div className="avatar">
                        <div className="size-10 rounded-full relative">
                            <img
                                src={selectedUser?.profilePic || "/avatar.png"}
                                alt={selectedUser?.username}
                            />
                        </div>
                    </div>

                    {/* User info */}
                    <div>
                        <h3 className="font-medium">
                            {selectedUser?.username}
                        </h3>
                        <p className="text-sm text-base-content/70">
                            {selectedUser?._id &&
                            onlineUsers.includes(selectedUser._id)
                                ? "Online"
                                : "Offline"}
                        </p>
                    </div>
                </div>
                <div className="flex flex-row">
                    <input
                        type="checkbox"
                        checked={autoScroll}
                        className="toggle toggle-xs mt-1 mr-3"
                        onChange={handleAutoScrollToggle}
                    />

                    {/* Close button */}
                    <button
                        className="cursor-pointer"
                        onClick={() => setSelectedUser(null)}
                    >
                        <X />
                    </button>
                </div>
            </div>
        </div>
    );
};
export default ChatHeader;
