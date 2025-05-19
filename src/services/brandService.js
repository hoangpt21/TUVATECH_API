import { StatusCodes } from "http-status-codes"
import { brandModel } from "../models/brandModel"
import ApiError from "../utils/ApiError"

const list_all_brands = async (selectedColumns = ['*'], limit = 50, offset = 0) => {
    try {
        const brands = await brandModel.list_all_brands(selectedColumns, limit, offset);
        return brands;
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi lấy danh sách thương hiệu");
    }
}

const list_active_brands = async (selectedColumns = ["*"], limit = 50, offset = 0) => {
    try {
        const brands = await brandModel.list_brands_by_conditions(
            [1],
            selectedColumns,
            [{name: "is_active"}],
            limit,
            offset,
            false
        );
        return brands;
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi lấy danh sách thương hiệu");
    }
}

const get_brand_by_id = async (brandId, selectedColumns = ["*"]) => {
    try {
        const [brand] = await brandModel.list_brands_by_conditions(
            [brandId],
            selectedColumns,
            [{ name: "brand_id" }]
        );

        if (!brand) return null;

        return brand;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi lấy thông tin thương hiệu");
    }
}

const create_a_brand = async (brandData) => {
    try {
        const createdBrand = await brandModel.create_a_brand(brandData);
        const [newBrand] = await brandModel.list_brands_by_conditions(
            [createdBrand.insertId],
            ["*"],
            [{ name: "brand_id" }]
        );
        return newBrand;
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi tạo thương hiệu mới");
    }
}

const update_a_brand = async (brandId, updateData) => {
    try {
        // Check if brand exists
        const [existingBrand] = await brandModel.list_brands_by_conditions(
            [brandId],
            ["brand_id"], // Only check necessary field for validation
            [{ name: "brand_id" }]
        );

        if (!existingBrand) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy thương hiệu");
        }

        // Update brand
        const columnsToUpdate = Object.keys(updateData);
        const values = [...columnsToUpdate.map(key => updateData[key]), brandId];
        await brandModel.update_a_brand(
            values,
            columnsToUpdate,
            [{ name: "brand_id" }]
        );

        // Get updated brand with selected columns
        const [updatedBrand] = await brandModel.list_brands_by_conditions(
            [brandId],
            ["*"],
            [{ name: "brand_id" }]
        );

        return updatedBrand;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi cập nhật thương hiệu");
    }
}

const delete_a_brand = async (brandId) => {
    try {
        // Check if brand exists
        const [existingBrand] = await brandModel.list_brands_by_conditions(
            [brandId],
            ["brand_id"], // Only check necessary field for validation
            [{ name: "brand_id" }]
        );

        if (!existingBrand) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy thương hiệu");
        }

        await brandModel.delete_a_brand(brandId);
        return { message: "Xóa thương hiệu thành công" };
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            throw new ApiError(
                StatusCodes.CONFLICT,
                "Thương hiệu đang được sản phẩm sử dụng, không thể xóa!"
            );
        }
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi xóa thương hiệu");
    }
}

export const brandService = {
    list_all_brands,
    get_brand_by_id,
    create_a_brand,
    update_a_brand,
    delete_a_brand,
    list_active_brands
};