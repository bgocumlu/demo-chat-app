import { useAuthStore } from "@/store/useAuthStore";
import { LogOut, MessageSquare, Settings, User } from "lucide-react";
import { useRef } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
    const { authUser, logout } = useAuthStore();
    const logoutModalRef = useRef<HTMLDialogElement | null>(null);

    const handleLogout = () => {
        console.log("User confirmed logout");
        logout(); // Call the logout function
        logoutModalRef.current?.close(); // Close the modal programmatically
    };

    return (
        <>
            <header
                className="border-b border-base-300 fixed w-full top-0 z-40 
                backdrop-blur-lg bg-base-100/80"
            >
                <div className="container mx-auto px-4 h-16">
                    <div className="flex items-center justify-between h-full">
                        <div className="flex items-center gap-8">
                            <Link
                                to="/"
                                className="flex items-center gap-2.5 hover:opacity-80 transition-all"
                            >
                                <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <MessageSquare className="w-5 h-5 text-primary" />
                                </div>
                                <h1 className="text-lg font-bold">Demo</h1>
                            </Link>
                        </div>

                        <div className="flex items-center gap-2">
                            <Link
                                to={"/settings"}
                                className={`btn btn-sm gap-2 transition-colors`}
                            >
                                <Settings className="w-4 h-4" />
                                <span className="hidden sm:inline">
                                    Settings
                                </span>
                            </Link>
                            {authUser && (
                                <>
                                    <Link
                                        to={"/profile"}
                                        className={`btn btn-sm gap-2`}
                                    >
                                        <User className="size-5" />
                                        <span className="hidden sm:inline">
                                            Profile
                                        </span>
                                    </Link>

                                    <button
                                        className="flex gap-2 items-center cursor-pointer"
                                        onClick={() =>
                                            logoutModalRef.current?.showModal()
                                        }
                                    >
                                        <LogOut className="size-5" />
                                        <span className="hidden sm:inline">
                                            Logout
                                        </span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Logout Confirmation Modal */}
            <dialog id="logout_modal" ref={logoutModalRef} className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">
                        {authUser?.isGuest
                            ? "Are you sure you want to log out as a guest?"
                            : "Are you sure you want to log out?"}
                    </h3>
                    <p className="py-4">
                        {authUser?.isGuest
                            ? "You will lose access to this guest account and cannot log in to it again."
                            : "You will need to log in again to access your account."}
                    </p>
                    <div className="modal-action">
                        <button className="btn btn-error" onClick={handleLogout}>
                            Yes, Log Out
                        </button>
                        <button
                            className="btn"
                            onClick={() => logoutModalRef.current?.close()}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </dialog>
        </>
    );
};

export default Navbar;
