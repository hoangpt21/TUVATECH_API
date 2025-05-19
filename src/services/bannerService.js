import { StatusCodes } from "http-status-codes"
import { bannerModel } from "../models/bannerModel"
import ApiError from "../utils/ApiError"

const list_all_banners = async (selectedColumns = ['*'], limit = 50, offset = 0) => {
    try {
        const banners = await bannerModel.list_all_banners(selectedColumns, limit, offset);
        return banners;
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi lấy danh sách banner");
    }
}

const list_active_banners = async (selectedColumns = ["*"], limit = 50, offset = 0) => {
    try {
        const banners = await bannerModel.list_banners_by_conditions(
            [1],
            selectedColumns,
            [{name: "is_active"}],
            limit,
            offset,
            false
        );
        return banners;
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi lấy danh sách banner");
    }
}

const get_banner_by_id = async (bannerId, selectedColumns = ["*"]) => {
    try {
        const [banner] = await bannerModel.list_banners_by_conditions(
            [bannerId],
            selectedColumns,
            [{ name: "banner_id" }]
        );
        if (!banner) return null;
        return banner;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi lấy thông tin banner");
    }
}

const create_a_banner = async (bannerData) => {
    try {
        const createdBanner = await bannerModel.create_a_banner(bannerData);
        const [newBanner] = await bannerModel.list_banners_by_conditions(
            [createdBanner.insertId],
            ["*"],
            [{ name: "banner_id" }]
        );
        return newBanner;
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi tạo banner mới");
    }
}

const update_a_banner = async (bannerId, updateData) => {
    try {
        // Check if banner exists
        const [existingBanner] = await bannerModel.list_banners_by_conditions(
            [bannerId],
            ["banner_id"], // Only check necessary field for validation
            [{ name: "banner_id" }]
        );

        if (!existingBanner) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy banner");
        }

        // Update banner
        const columnsToUpdate = Object.keys(updateData);
        const values = [...columnsToUpdate.map(key => updateData[key]), bannerId];
        await bannerModel.update_a_banner(
            values,
            columnsToUpdate,
            [{ name: "banner_id" }]
        );

        // Get updated banner with selected columns
        const [updatedBanner] = await bannerModel.list_banners_by_conditions(
            [bannerId],
            ["*"],
            [{ name: "banner_id" }]
        );

        return updatedBanner;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi cập nhật banner");
    }
}

const delete_a_banner = async (bannerId) => {
    try {
        // Check if banner exists
        const [existingBanner] = await bannerModel.list_banners_by_conditions(
            [bannerId],
            ["banner_id"], // Only check necessary field for validation
            [{ name: "banner_id" }]
        );

        if (!existingBanner) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy banner");
        }

        await bannerModel.delete_a_banner(bannerId);
        return { message: "Xóa banner thành công" };
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            throw new ApiError(
                StatusCodes.CONFLICT,
                "Banner đang được sử dụng, không thể xóa!"
            );
        }
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi xóa banner");
    }
}

export const bannerService = {
    list_all_banners,
    get_banner_by_id,
    create_a_banner,
    update_a_banner,
    delete_a_banner,
    list_active_banners
}; 