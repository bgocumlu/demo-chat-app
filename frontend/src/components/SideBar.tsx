import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";
import { useEffect, useState } from "react";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users } from "lucide-react";

interface SideBarProps {
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isSidebarOpen: boolean) => void;
}

export const SideBar = ({ isSidebarOpen, setIsSidebarOpen }: SideBarProps) => {
    const { fetchUsers, users, selectedUser, setSelectedUser, isUsersLoading } =
        useChatStore();
    const { onlineUsers } = useAuthStore();
    const [showOnlineOnly, setShowOnlineOnly] = useState(false);
    const [searchQuery, setSearchQuery] = useState(""); // State for search query
    const [filteredUsers, setFilteredUsers] = useState(users); // State for filtered users
    const [usersLoaded, setUsersLoaded] = useState(false);

    useEffect(() => {
        fetchUsers().then(() => setUsersLoaded(true));
    }, [fetchUsers]);

    // Filter users only when searchQuery or showOnlineOnly changes
    useEffect(() => {
        if (!usersLoaded) {
            return;
        }

        const filterUsers = () => {
            console.log("filtering users");
            const filtered = users.filter((user) => {
                const matchesOnlineFilter = showOnlineOnly
                    ? onlineUsers.includes(user._id)
                    : true;
                const matchesSearchQuery = user.username
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase());
                return matchesOnlineFilter && matchesSearchQuery;
            });
            setFilteredUsers(filtered);
        };

        filterUsers();
    }, [users, onlineUsers, showOnlineOnly, searchQuery, usersLoaded]);

    if (isUsersLoading) return <SidebarSkeleton />;

    return (
        <div
            className={`relative h-full ${
                isSidebarOpen ? "w-full sm:w-72" : "w-0"
            } transition-all duration-150`}
        >
            {/* Sidebar */}
            <aside
                className={`h-full bg-base-100 border-r border-base-300 flex flex-col ${
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                } transition-transform duration-150`}
                role="complementary"
                aria-hidden={!isSidebarOpen}
                aria-expanded={isSidebarOpen}
            >
                {isSidebarOpen && (
                    <>
                        {/* Sidebar Header */}
                        <div className="border-b border-base-300 w-full p-5">
                            <div className="flex items-center gap-2">
                                <Users className="w-6 h-6" />
                                <span className="font-medium">Contacts</span>
                            </div>

                            {/* Search Bar */}
                            <div className="mt-4">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    placeholder="Search users..."
                                    className="w-full input input-bordered rounded-lg input-sm  text-base focus:outline-none focus:border-primary"
                                />
                            </div>

                            {/* Show Online Only */}
                            <div className="mt-3 flex items-center gap-2">
                                <label className="cursor-pointer flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={showOnlineOnly}
                                        onChange={(e) =>
                                            setShowOnlineOnly(e.target.checked)
                                        }
                                        className="checkbox checkbox-sm"
                                    />
                                    <span className="text-sm whitespace-nowrap">
                                        Show online only
                                    </span>
                                </label>
                                <span className="text-xs text-zinc-500 whitespace-nowrap">
                                    ({onlineUsers.length - 1} online)
                                </span>
                            </div>
                        </div>

                        {/* Sidebar Content */}
                        <div className="flex-1 overflow-y-auto w-full py-3">
                            {filteredUsers.map((user) => (
                                <button
                                    key={user._id}
                                    onClick={() => {
                                        setSelectedUser(user);
                                        // Close sidebar only on small screens
                                        if (
                                            !window.matchMedia(
                                                "(min-width: 640px)"
                                            ).matches
                                        ) {
                                            setIsSidebarOpen(false);
                                        }
                                    }}
                                    className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors ${
                                        selectedUser?._id === user._id
                                            ? "bg-base-300 ring-1 ring-base-300"
                                            : ""
                                    } cursor-pointer`}
                                >
                                    <div className="relative">
                                        <img
                                            src={
                                                user.profilePic || "/avatar.png"
                                            }
                                            alt={user.username}
                                            className="w-16 h-16 object-cover rounded-full"
                                        />
                                        {onlineUsers.includes(user._id) && (
                                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
                                        )}
                                    </div>

                                    {/* User info */}
                                    <div className="text-left min-w-0">
                                        <div className="font-medium truncate">
                                            {user.username}
                                        </div>
                                        <div className="text-sm text-zinc-400">
                                            {onlineUsers.includes(user._id)
                                                ? "Online"
                                                : "Offline"}
                                        </div>
                                    </div>
                                </button>
                            ))}

                            {filteredUsers.length === 0 && (
                                <div className="text-center text-zinc-500 py-4">
                                    No users found
                                </div>
                            )}
                        </div>
                    </>
                )}
            </aside>
        </div>
    );
};
