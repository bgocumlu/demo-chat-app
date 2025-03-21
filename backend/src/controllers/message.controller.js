import cloudinary from "../lib/cloudinary.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import { io, getReceiverSocketId } from "../lib/socket.js";
import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, 
}).single("image");

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

            let imageUrl;

            if (image) {
                const uploadResponse = await cloudinary.uploader.upload(image, {
                    quality: "auto",
                    fetch_format: "auto",
                });
                imageUrl = uploadResponse.secure_url;
            }

            const isRecieverGuest = await User.findById(recieverId).then(
                (user) => user.isGuest
            );
            const isSenderGuest = await User.findById(senderId).then(
                (user) => user.isGuest
            );

            const newMessage = new Message({
                senderId,
                recieverId: recieverId,
                text,
                image: imageUrl,
                isVolatile: isRecieverGuest || isSenderGuest,
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
