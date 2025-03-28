import { useChatStore } from "@/store/useChatStore";
import { AxiosError } from "axios";
import { Image, LoaderPinwheel, Send, X } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

const MessageInput = () => {
    const [text, setText] = useState("");
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const { sendMessage, isImageLoading } = useChatStore();

    interface ImageChangeEvent extends React.ChangeEvent<HTMLInputElement> {
        target: HTMLInputElement & { files: FileList };
    }

    const handleImageChange = async (e: ImageChangeEvent) => {
        const file = e.target.files[0];

        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }

        console.log("Image file size:", file.size);

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSendMessage = async (e: { preventDefault: () => void }) => {
        e.preventDefault();

        if (!text.trim() && !imagePreview) {
            return;
        }

        try {
            await sendMessage({ text, image: imagePreview });
            setText("");
            setImagePreview(null);

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } catch (error) {
            const e = error as AxiosError;
            console.log(e.response?.statusText);
            toast.error(e.response?.statusText ?? "Failed to send message");
        }
    };

    return (
        <div className="p-4 w-full">
            {imagePreview && (
                <div className="mb-3 flex items-center gap-2">
                    <div className="relative">
                        <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
                        />
                        <button
                            onClick={removeImage}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
                            type="button"
                        >
                            <X className="size-3" />
                        </button>
                    </div>

                    {isImageLoading && (
                        <div className="flex items-center justify-center">
                            <LoaderPinwheel className="size-md animate-spin"></LoaderPinwheel>
                        </div>
                    )}
                </div>
            )}

            <form
                onSubmit={handleSendMessage}
                className="flex items-center gap-2"
            >
                <div className="flex-1 flex gap-2">
                    <input
                        type="text"
                        className="w-full input input-bordered rounded-lg input-sm sm:input-md text-base focus:outline-none focus:border-primary"
                        placeholder="Type a message..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                    />

                    <button
                        type="button"
                        className={`sm:flex btn btn-circle
                     ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Image size={20} />
                    </button>
                </div>
                <button
                    type="submit"
                    className="btn btn-circle pr-0.5 pt-0.5"
                    disabled={!text.trim() && !imagePreview}
                >
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
};

export default MessageInput;
