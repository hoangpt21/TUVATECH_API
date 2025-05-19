import multer from "multer";
import ApiError from "../utils/ApiError";
import { StatusCodes } from "http-status-codes";


const customFileFilter = (req, file, callback) => {
    if(!['image/jpg', 'image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
        const errorMessage = "Kiểu file không đúng, chỉ chấp nhận jpg, jpeg, png and webp";
        return callback(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage), null);
    }
    return callback(null, true);
}

const upload = multer({
    limits: { fileSize: 10485760 },
    fileFilter: customFileFilter
})

export const multerUploadMiddleware = { upload }