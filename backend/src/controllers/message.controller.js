import cloudinary from "../lib/cloudinary.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import { io, getReceiverSocketId } from "../lib/socket.js";
import multer from "multer";

const upload = multer({
    limits: {
        fileSize: 10 * 1024 * 1024,
        fieldSize: 10 * 1024 * 1024,
    }, // 10MB max file size
}).fields([
    { name: "text", maxCount: 1 },
    { name: "image", maxCount: 1 },
]);

export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({
            _id: { $ne: loggedInUserId },
        }).select("-password");

        res.status(200).json(filteredUsers);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: myId, recieverId: userToChatId },
                { senderId: userToChatId, recieverId: myId },
            ],
        });

        res.status(200).json(messages);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const sendMessage = async (req, res) => {
    try {
        upload(req, res, async (err) => {
            if (err) {
                return res
                    .status(400)
                    .json({ error: "File upload failed: " + err.message });
            }

            const { text, image } = req.body;
            const { id: recieverId } = req.params;
            const senderId = req.user._id;

            const reciever = await User.findById(recieverId);
            const sender = await User.findById(senderId);

            if (!reciever || !sender) {
                console.log(error);
                res.status(500).json({ message: "Internal server error" });
                return;
            }

            let imageUrl;

            if (image) {
                const uploadResponse = await cloudinary.uploader.upload(image, {
                    quality: "auto",
                    fetch_format: "auto",
                    folder: "demo-chat-app",
                });
                imageUrl = uploadResponse.secure_url;
            }

            const newMessage = new Message({
                senderId,
                recieverId: recieverId,
                text,
                image: imageUrl,
                isVolatile: reciever.isGuest || sender.isGuest,
            });

            await newMessage.save();

            //socketio
            const recieverSocketId = getReceiverSocketId(recieverId);
            if (recieverSocketId) {
                io.to(recieverSocketId).emit("newMessage", newMessage);
            }

            res.status(201).json(newMessage);
            return;
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteMessage = async (req, res) => {
    try {
        const { id: messageId } = req.params;
        const message = await Message.findById(messageId);

        if (!message) {
            res.status(404).json({ message: "Message not found" });
            return;
        }

        if (req.user._id.toString != message.senderId.toString) {
            res.status(403).json({ message: "Unauthorized" });
            return;
        }

        await Message.findByIdAndDelete(messageId);

        const recieverSocketId = getReceiverSocketId(message.recieverId);
        if (recieverSocketId) {
            io.to(recieverSocketId).emit("deleteMessage", messageId);
        }
        
        res.status(200).json({ message: "Message deleted" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
