import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
            minLength: 6,
        },
        profilePic: {
            type: String,
            default: "",
        },
        isGuest: {
            type: Boolean,
            default: false,
        },
        expiresAt: {
            type: Date,
            default: function () {
                return this.isGuest
                    ? new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour
                    : undefined; 
            },
            expires: 0,
        },
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
