import { StatusCodes } from "http-status-codes"
import { userCouponModel } from "../models/userCouponModel"
import ApiError from "../utils/ApiError"
import { couponModel } from "../models/couponModel";

const list_all_user_coupons = async (selectedColumns = ["*"], limit = 50, offset = 0) => {
    try {
        const userCoupons = await userCouponModel.list_all_user_coupons(
            selectedColumns,
            limit,
            offset
        );
        return userCoupons;
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi lấy danh sách mã giảm giá của người dùng");
    }
}

const get_user_coupons = async (userId, selectedColumns = ["*"], limit = 50, offset = 0) => {
    try {
        const userCoupons = await userCouponModel.list_user_coupons_by_conditions(
            [userId],
            selectedColumns,
            [{ name: "user_id" }],
            limit,
            offset,
            false
        );
        return userCoupons;
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi lấy danh sách mã giảm giá của người dùng");
    }
}

const get_specific_user_coupon = async (userId, couponId, selectedColumns = ["*"]) => {
    try {
        const [userCoupon] = await userCouponModel.list_user_coupons_by_conditions(
            [userId, couponId],
            selectedColumns,
            [
                { name: "user_id", logicalOperator: "AND" },
                { name: "coupon_id" }
            ]
        );

        if (!userCoupon) return null;

        return userCoupon;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi lấy thông tin mã giảm giá của người dùng");
    }
}

const create_a_user_coupon = async (userCouponData) => {
    try {
        // Check if user already has this coupon
        const [existingUserCoupons, [activeCoupon]] = await Promise.all([
            userCouponModel.list_user_coupons_by_conditions(
                [userCouponData.coupon_id],
                ["user_id"],
                [{ name: "coupon_id" }]
            ),
            couponModel.list_coupons_by_conditions(
                [userCouponData.coupon_id, 1],
                ["coupon_id", "max_users"],
                [{ name: "coupon_id", logicalOperator: "AND" }, { name: "is_active"  }]
            )
        ]);

        if (existingUserCoupons.length >= activeCoupon.max_users) {
            throw new ApiError(StatusCodes.CONFLICT, "Đã đạt giới hạn người dùng cho mã giảm giá này!");
        }
        if (existingUserCoupons?.some(userCoupon => userCoupon.user_id === userCouponData.user_id)) {
            throw new ApiError(StatusCodes.CONFLICT, "Đã lưu voucher này trong kho!");
        }

        await userCouponModel.create_a_user_coupon(userCouponData);
        const [newUserCoupon] = await userCouponModel.list_user_coupons_by_conditions(
            [userCouponData.user_id, userCouponData.coupon_id],
            ["*"],
            [
                { name: "user_id", logicalOperator: "AND" },
                { name: "coupon_id" }
            ]
        );
        return newUserCoupon;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi thêm mã giảm giá cho người dùng");
    }
}

const update_user_coupon = async (userId, couponId, updateData, selectedColumns = ["*"]) => {
    try {
        const [existingUserCoupon] = await userCouponModel.list_user_coupons_by_conditions(
            [userId, couponId],
            ["user_id"],
            [
                { name: "user_id", logicalOperator: "AND" },
                { name: "coupon_id" }
            ]
        );

        if (!existingUserCoupon) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy mã giảm giá của người dùng");
        }

        const columnsToUpdate = Object.keys(updateData);
        const values = [
            ...columnsToUpdate.map(key => updateData[key]),
            userId,
            couponId
        ];
        
        await userCouponModel.update_a_user_coupon(
            values,
            columnsToUpdate,
            [
                { name: "user_id", logicalOperator: "AND" },
                { name: "coupon_id" }
            ]
        );

        const [updatedUserCoupon] = await userCouponModel.list_user_coupons_by_conditions(
            [userId, couponId],
            selectedColumns,
            [
                { name: "user_id", logicalOperator: "AND" },
                { name: "coupon_id" }
            ]
        );

        return updatedUserCoupon;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi cập nhật trạng thái mã giảm giá của người dùng");
    }
}

const delete_a_user_coupon = async (userId, couponId) => {
    try {
        const [existingUserCoupon] = await userCouponModel.list_user_coupons_by_conditions(
            [userId, couponId],
            ["user_id"],
            [
                { name: "user_id", logicalOperator: "AND" },
                { name: "coupon_id" }
            ]
        );

        if (!existingUserCoupon) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy mã giảm giá của người dùng");
        }

        await userCouponModel.delete_a_user_coupon(userId, couponId);
        return { message: "Xóa mã giảm giá của người dùng thành công" };
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            throw new ApiError(
                StatusCodes.CONFLICT,
                "Mã giảm giá đang được sử dụng, không thể xóa!"
            );
        }
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi xóa mã giảm giá của người dùng");
    }
}

export const userCouponService = {
    list_all_user_coupons,
    get_user_coupons,
    get_specific_user_coupon,
    create_a_user_coupon,
    update_user_coupon,
    delete_a_user_coupon
};