import cloudinary from "cloudinary"
import { env } from "../config/environment"
import ApiError from "../utils/ApiError";
import { StatusCodes } from "http-status-codes";

const cloudinaryV2 = cloudinary.v2;
cloudinaryV2.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET
})

const streamUpload = (fileBuffer, folderName) => {
    return new Promise((resolve, reject) => {
        cloudinaryV2.uploader.upload_stream({ folder: folderName, format: "webp"}, (err, result) => {
            if(err) reject(err);
            else resolve(result);
        }).end(fileBuffer)
    });
}

const removeUpload = (publicIds) => {
    return new Promise((resolve, reject) => {
        cloudinaryV2.api.delete_resources(publicIds, (err, result) => {
            if(err) reject(err);
            else resolve(result);
        })
    });
}

export const CloudinaryProvider = { 
    streamUpload,
    removeUpload
};