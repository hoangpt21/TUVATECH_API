import { StatusCodes } from "http-status-codes"
import { CloudinaryProvider } from "../providers/CloudinaryProvider";

const upload_file = async (req, res, next) => {
    try {
        const userAvatarFile = req.file;
        const folderName = req.params.dirName;
        if(userAvatarFile) {
            const uploadResult = await CloudinaryProvider.streamUpload(userAvatarFile.buffer, folderName);
            res.status(StatusCodes.OK).json(uploadResult.secure_url);
        }
    } catch (error) { next(error) }
}

export const fileController = {
    upload_file
}