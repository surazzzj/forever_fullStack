import {v2 as cloudinary} from "cloudinary";
import multer from 'multer';
import fs from 'fs';

// Multer for file uploads
const upload = multer({ dest: 'uploads/' })

const connectCloudinary = async () => {

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_SECRET_KEY
})

}

export default connectCloudinary;
