import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatMessageTime(date: string) {
    return new Date(date).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
}

export function generateGuestUsername() {
    const adjectives = [
        "Swift",
        "Bold",
        "Silent",
        "Mighty",
        "Frosty",
        "Brave",
        "Clever",
        "Glowing",
        "Sly",
        "Wild",
    ];
    const nouns = [
        "Fox",
        "Wolf",
        "Bear",
        "Falcon",
        "Lion",
        "Tiger",
        "Eagle",
        "Dragon",
        "Panther",
        "Hawk",
    ];

    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNumber = Math.floor(Math.random() * 1000); // Random number from 0 to 999

    return `Guest_${adjective}${noun}${randomNumber}`;
}
