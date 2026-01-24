// src/utils/cloudinary.js

// REPLACE THESE WITH YOUR ACTUAL CLOUDINARY KEYS
const CLOUD_NAME = "dwwmhkpvi";
const UPLOAD_PRESET = "UploadDocs";

export const uploadToCloudinary = async (file) => {
    if (!file) return null;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("resource_type", "auto"); // Auto-detect (image or pdf)

    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`,
            {
                method: "POST",
                body: formData,
            }
        );

        if (!response.ok) {
            throw new Error("Upload failed");
        }

        const data = await response.json();
        return {
            name: file.name,
            url: data.secure_url // This is the public link we save to Firebase
        };
    } catch (error) {
        console.error("Cloudinary Error:", error);
        throw error;
    }
};