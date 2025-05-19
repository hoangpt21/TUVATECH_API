import { removedImageModel } from "../models/removedImagesModel";
import { CloudinaryProvider } from "../providers/CloudinaryProvider";

const delete_file = async (columns = ['*']) => {
    try {
        const rows = await removedImageModel.list_all_removed_images();
        let publicIds = [];
        if(rows?.length > 0) {
            for (const { dir_name, image_url } of rows) {
                const parts = image_url.split('/');
                const filename = parts.pop().split('.')[0];
                const publicId = `${dir_name}/${filename}`;
                publicIds.push(publicId)
            }
    
            const result = await CloudinaryProvider.removeUpload(publicIds);
            await removedImageModel.delete_all_removed_images();
        }
    } catch (error) { throw error }
}

export const removedImageService = {
    delete_file
};