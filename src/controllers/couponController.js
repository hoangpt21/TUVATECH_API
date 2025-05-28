import { StatusCodes } from "http-status-codes";
import { couponService } from "../services/couponService";
import ApiError from "../utils/ApiError";
const list_all_coupons = async (req, res, next) => {
    try {
        if(req.jwtDecoded?.role !== 'admin') next(new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền truy cập vào tài nguyên này'));
        const { select, limit, offset } = req.query;
        const selectedColumns = select ? select.split(",") : ["*"];
        const coupons = await couponService.list_all_coupons(selectedColumns, limit, offset);
        res.status(StatusCodes.OK).json(coupons);
    } catch (error) {
        next(error);
    }
};

const list_active_coupons = async (req, res, next) => {
    try {
        const { select, limit, offset } = req.query;
        const selectedColumns = select ? select.split(",") : ["*"];
        const coupons = await couponService.list_active_coupons(selectedColumns, limit, offset);
        res.status(StatusCodes.OK).json(coupons);
    } catch (error) {
        next(error);
    }
};

const get_active_coupons_by_code = async (req, res, next) => {
    try {
        const { code } = req.params;
        const { select } = req.query;
        const selectedColumns = select ? select.split(",") : ["*"];
        const coupon = await couponService.get_active_coupons_by_code(code, selectedColumns);
        res.status(StatusCodes.OK).json(coupon);
    } catch (error) {
        next(error);
    }
};

const get_coupon_by_id = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { select } = req.query;
        const selectedColumns = select ? select.split(",") : ["*"];
        const coupon = await couponService.get_coupon_by_id(id, selectedColumns);
        res.status(StatusCodes.OK).json(coupon);
    } catch (error) {
        next(error);
    }
};

const get_coupon_by_code = async (req, res, next) => {
    try {
        if(req.jwtDecoded?.role !== 'admin') next(new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền truy cập vào tài nguyên này'));
        const { code } = req.params;
        const { select } = req.query;
        const selectedColumns = select ? select.split(",") : ["*"];
        const coupon = await couponService.get_coupon_by_code(code, selectedColumns);
        res.status(StatusCodes.OK).json(coupon);
    } catch (error) {
        next(error);
    }
};

const create_a_coupon = async (req, res, next) => {
    try {
        if(req.jwtDecoded?.role !== 'admin') next(new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền truy cập vào tài nguyên này'));
        const couponData = req.body;
        const newCoupon = await couponService.create_a_coupon(couponData);
        res.status(StatusCodes.CREATED).json(newCoupon);
    } catch (error) {
        next(error);
    }
};

const update_a_coupon = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const updatedCoupon = await couponService.update_a_coupon(id, updateData);
        res.status(StatusCodes.OK).json(updatedCoupon);
    } catch (error) {
        next(error);
    }
};

const delete_a_coupon = async (req, res, next) => {
    try {
        if(req.jwtDecoded?.role !== 'admin') next(new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền truy cập vào tài nguyên này'));
        const { id } = req.params;
        const result = await couponService.delete_a_coupon(id);
        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        next(error);
    }
};

export const couponController = {
    list_all_coupons,
    list_active_coupons,
    get_active_coupons_by_code,
    get_coupon_by_id,
    get_coupon_by_code,
    create_a_coupon,
    update_a_coupon,
    delete_a_coupon
};