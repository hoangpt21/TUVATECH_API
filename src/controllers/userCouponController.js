import { StatusCodes } from "http-status-codes";
import { userCouponService } from "../services/userCouponService";

const list_all_user_coupons = async (req, res, next) => {
    try {
        const { select, limit, offset } = req.query;
        const selectedColumns = select ? select.split(",") : ["*"];
        const userCoupons = await userCouponService.list_all_user_coupons(selectedColumns, limit, offset);
        res.status(StatusCodes.OK).json(userCoupons);
    } catch (error) {
        next(error);
    }
};

const get_user_coupons = async (req, res, next) => {
    try {
        const userId = req.jwtDecoded?.user_id;
        const { select, limit, offset } = req.query;
        const selectedColumns = select ? select.split(",") : ["*"];
        const userCoupons = await userCouponService.get_user_coupons(userId, selectedColumns, limit, offset);
        res.status(StatusCodes.OK).json(userCoupons);
    } catch (error) {
        next(error);
    }
};

const get_specific_user_coupon = async (req, res, next) => {
    try {
        const userId = req.jwtDecoded?.user_id;
        const { couponId } = req.params;
        const { select } = req.query;
        const selectedColumns = select ? select.split(",") : ["*"];
        const userCoupon = await userCouponService.get_specific_user_coupon(userId, couponId, selectedColumns);
        res.status(StatusCodes.OK).json(userCoupon);
    } catch (error) {
        next(error);
    }
};

const create_a_user_coupon = async (req, res, next) => {
    try {
        const userCouponData = {
            ...req.body,
            user_id: req.jwtDecoded?.user_id
        };
        const newUserCoupon = await userCouponService.create_a_user_coupon(userCouponData);
        res.status(StatusCodes.CREATED).json(newUserCoupon);
    } catch (error) {
        next(error);
    }
};

const update_user_coupon = async (req, res, next) => {
    try {
        const userId = req.jwtDecoded?.user_id;
        const { couponId } = req.params;
        const updateData = req.body;
        const { select } = req.query;
        const selectedColumns = select ? select.split(",") : ["*"];
        const updatedUserCoupon = await userCouponService.update_user_coupon(
            userId,
            couponId,
            updateData,
            selectedColumns
        );
        res.status(StatusCodes.OK).json(updatedUserCoupon);
    } catch (error) {
        next(error);
    }
};

const delete_a_user_coupon = async (req, res, next) => {
    try {
        const userId = req.jwtDecoded?.user_id;
        const { couponId } = req.params;
        const result = await userCouponService.delete_a_user_coupon(userId, couponId);
        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        next(error);
    }
};

export const userCouponController = {
    list_all_user_coupons,
    get_user_coupons,
    get_specific_user_coupon,
    create_a_user_coupon,
    update_user_coupon,
    delete_a_user_coupon
};