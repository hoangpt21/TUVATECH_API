import { StatusCodes } from "http-status-codes"
import { couponModel } from "../models/couponModel"
import ApiError from "../utils/ApiError"

const list_all_coupons = async (selectedColumns = ['*'], limit = 50, offset = 0) => {
    try {
        const coupons = await couponModel.list_all_coupons(selectedColumns, limit, offset);
        return coupons;
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi lấy danh sách mã giảm giá");
    }
}

const list_active_coupons = async (selectedColumns = ['*'], limit = 50, offset = 0) => {
    try {
        const coupons = await couponModel.list_coupons_by_conditions(
            [1],
            selectedColumns,
            [{ name: "is_active"}],
            limit,
            offset,
            false
        );
        return coupons.filter(coupon => {
            const currentDate = new Date();
            const startDate = new Date(coupon.start_date);
            const endDate = new Date(coupon.end_date);
            return currentDate >= startDate && currentDate <= endDate;
        });
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi lấy danh sách mã giảm giá");
    }
}

const get_active_coupons_by_code = async (code, selectedColumns = ["*"]) => {
    try {
        const coupon = await couponModel.list_coupons_by_conditions(
            [code, 1],
            selectedColumns,
            [{ name: "coupon_code", logicalOperator: "AND" }, { name: "is_active" }]
        );
        return coupon;
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi lấy mã giảm giá");
    }
}

const get_coupon_by_id = async (couponId, selectedColumns = ["*"]) => {
    try {
        const [coupon] = await couponModel.list_coupons_by_conditions(
            [couponId],
            selectedColumns,
            [{ name: "coupon_id" }]
        );

        if (!coupon) return null; // Không tìm thấy mã giảm giá, trả về null thay th

        return coupon;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi lấy thông tin mã giảm giá");
    }
}

const get_coupon_by_code = async (couponCode, selectedColumns = ["*"]) => {
    try {
        const [coupon] = await couponModel.list_coupons_by_conditions(
            [couponCode],
            selectedColumns,
            [{ name: "coupon_code" }]
        );

        if (!coupon) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy mã giảm giá");
        }

        return coupon;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi lấy thông tin mã giảm giá");
    }
}

const create_a_coupon = async (couponData) => {
    try {
        // Check if coupon code already exists
        const [existingCoupon] = await couponModel.list_coupons_by_conditions(
            [couponData.coupon_code],
            ["coupon_id"],
            [{ name: "coupon_code" }]
        );

        if (existingCoupon) {
            throw new ApiError(StatusCodes.CONFLICT, "Mã giảm giá đã tồn tại");
        }

        const createdCoupon = await couponModel.create_a_coupon(couponData);
        const [newCoupon] = await couponModel.list_coupons_by_conditions(
            [createdCoupon.insertId],
            ["*"],
            [{ name: "coupon_id" }]
        );
        return newCoupon;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi tạo mã giảm giá mới");
    }
}

const update_a_coupon = async (couponId, updateData) => {
    try {
        // Check if coupon exists
        const [existingCoupon] = await couponModel.list_coupons_by_conditions(
            [couponId],
            ["coupon_id"],
            [{ name: "coupon_id" }]
        );

        if (!existingCoupon) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy mã giảm giá");
        }

        // If updating coupon code, check if new code already exists
        if (updateData.coupon_code) {
            const [duplicateCoupon] = await couponModel.list_coupons_by_conditions(
                [updateData.coupon_code],
                ["coupon_id"],
                [{ name: "coupon_code"}]
            );

            if (duplicateCoupon && duplicateCoupon.coupon_id !== parseInt(couponId)) {
                throw new ApiError(StatusCodes.CONFLICT, "Mã giảm giá mới đã tồn tại");
            }
        }

        const columnsToUpdate = Object.keys(updateData);
        const values = [...columnsToUpdate.map(key => updateData[key]), couponId];
        await couponModel.update_a_coupon(
            values,
            columnsToUpdate,
            [{ name: "coupon_id" }]
        );

        const [updatedCoupon] = await couponModel.list_coupons_by_conditions(
            [couponId],
            ["*"],
            [{ name: "coupon_id" }]
        );

        return updatedCoupon;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi cập nhật mã giảm giá");
    }
}

const delete_a_coupon = async (couponId) => {
    try {
        const [existingCoupon] = await couponModel.list_coupons_by_conditions(
            [couponId],
            ["coupon_id"],
            [{ name: "coupon_id" }]
        );

        if (!existingCoupon) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy mã giảm giá");
        }

        await couponModel.delete_a_coupon(couponId);
        return { message: "Xóa mã giảm giá thành công" };
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            throw new ApiError(
                StatusCodes.CONFLICT,
                "Mã giảm giá đang được người dùng sử dụng, không thể xóa!"
            );
        }
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi xóa mã giảm giá");
    }
}

export const couponService = {
    list_all_coupons,
    list_active_coupons,
    get_active_coupons_by_code,
    get_coupon_by_id,
    get_coupon_by_code,
    create_a_coupon,
    update_a_coupon,
    delete_a_coupon
};