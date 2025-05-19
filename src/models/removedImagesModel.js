import connection from "../config/db_mysql"

const IMAGE_TABLE_NAME = 'removed_images';

const list_all_removed_images = async (columns = ['*']) => {
    try {
        let queryStr = `SELECT ${columns.join(', ')} FROM ${IMAGE_TABLE_NAME}`;
        const [result] = await connection.query(queryStr);
        return result;
    } catch (error) {
        throw new Error(error);
    }
}

const delete_all_removed_images = async () => {
    try {
        let queryStr = `DELETE FROM ${IMAGE_TABLE_NAME}`;
        const [result] = await connection.query(queryStr);
        return result;
    } catch (error) {
        throw new Error(error);
    }
}

export const removedImageModel = {
    list_all_removed_images,
    delete_all_removed_images
};