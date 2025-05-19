import { StatusCodes } from "http-status-codes"
import { imageModel } from "../models/imageModel"
import ApiError from "../utils/ApiError"

const list_all_images = async (selectedColumns = ['*'], limit = 50, offset = 0) => {
    try {
        const images = await imageModel.list_all_images(selectedColumns, limit, offset);
        return images;
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi lấy danh sách hình ảnh");
    }
}

const get_image_by_id = async (imageId, selectedColumns = ["*"]) => {
    try {
        const [image] = await imageModel.list_images_by_conditions(
            [imageId],
            selectedColumns,
            [{ name: "image_id" }]
        );

        if (!image) return null;

        return image;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi lấy thông tin hình ảnh");
    }
}

const get_images_by_entity = async (entityId, entityType, selectedColumns = ["*"], limit = 50, offset = 0) => {
    try {
        let operator = '=';
        if(entityId === 'true') {
            entityId = 'null';
            operator = '<>'
        }
        const columnName = `${entityType}_id`;
        const images = await imageModel.list_images_by_conditions(
            [entityId],
            selectedColumns,
            [{ name: columnName }],
            operator,
            limit,
            offset,
            false
        );
        return images;
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, `Lỗi khi lấy danh sách hình ảnh của ${entityType}`);
    }
}

const create_an_image = async (imageData) => {
    try {
        const createdImage = await imageModel.create_an_image(imageData);
        const [newImage] = await imageModel.list_images_by_conditions(
            [createdImage.insertId],
            ["*"],
            [{ name: "image_id" }]
        );
        return newImage;
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi tạo hình ảnh mới");
    }
}

const update_an_image = async (imageId, updateData, selectedColumns = ["*"]) => {
    try {
        const [existingImage] = await imageModel.list_images_by_conditions(
            [imageId],
            ["image_id"],
            [{ name: "image_id" }]
        );

        if (!existingImage) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy hình ảnh");
        }

        const columnsToUpdate = Object.keys(updateData);
        const values = [...columnsToUpdate.map(key => updateData[key]), imageId];
        await imageModel.update_an_image(
            values,
            columnsToUpdate,
            [{ name: "image_id" }]
        );

        const [updatedImage] = await imageModel.list_images_by_conditions(
            [imageId],
            selectedColumns,
            [{ name: "image_id" }]
        );

        return updatedImage;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi cập nhật hình ảnh");
    }
}

const delete_images_by_entity = async (entityId, entityType) => {
    try {
        const columnName = `${entityType}_id`;
        await imageModel.delete_images_by_id(columnName, entityId);
        return { message: `Xóa tất cả hình ảnh của ${entityType} thành công` };
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            throw new ApiError(
                StatusCodes.CONFLICT,
                "Hình ảnh đang được sử dụng, không thể xóa!"
            );
        }
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, `Lỗi khi xóa hình ảnh của ${entityType}`);
    }
}

const delete_an_image = async (imageId) => {
    try {
        const [existingImage] = await imageModel.list_images_by_conditions(
            [imageId],
            ["image_id"],
            [{ name: "image_id" }]
        );

        if (!existingImage) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy hình ảnh");
        }

        await imageModel.delete_an_image_by_id(imageId);
        return { message: "Xóa hình ảnh thành công" };
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            throw new ApiError(
                StatusCodes.CONFLICT,
                "Hình ảnh đang được sử dụng, không thể xóa!"
            );
        }
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi xóa hình ảnh");
    }
}

export const imageService = {
    list_all_images,
    get_image_by_id,
    get_images_by_entity,
    create_an_image,
    update_an_image,
    delete_images_by_entity,
    delete_an_image
};