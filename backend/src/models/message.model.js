import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        recieverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        text: {
            type: String,
        },
        image: {
            type: String,
        },
        isVolatile: {
            type: Boolean,
            default: false,
        },
        expiresAt: {
            type: Date,
            default: function () {
                return this.isVolatile
                    ? new Date(Date.now() + 1.5 * 60 * 60 * 1000) // 1.5 hour
                    : undefined;
            },
            expires: 0,
        },
    },
    { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
