import { StatusCodes } from "http-status-codes";
import { orderService } from "../services/orderService";
import ApiError from "../utils/ApiError";
const list_all_orders = async (req, res, next) => {
    try {
        if(req.jwtDecoded?.role !== 'admin') next(new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền truy cập vào tài nguyên này'));
        const { select, limit, offset } = req.query;
        const selectedColumns = select ? select.split(",") : ["*"];
        const orders = await orderService.list_all_orders(selectedColumns, limit, offset);
        res.status(StatusCodes.OK).json(orders);
    } catch (error) {
        next(error);
    }
};

const get_order_by_id = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { select } = req.query;
        const selectedColumns = select ? select.split(",") : ["*"];
        const order = await orderService.get_order_by_id(id, selectedColumns);
        res.status(StatusCodes.OK).json(order);
    } catch (error) {
        next(error);
    }
};

const get_orders_by_user = async (req, res, next) => {
    try {
        const userId = req.jwtDecoded.user_id;
        const { select, limit, offset } = req.query;
        const selectedColumns = select ? select.split(",") : ["*"];
        const orders = await orderService.get_orders_by_user(userId, selectedColumns, limit, offset);
        res.status(StatusCodes.OK).json(orders);
    } catch (error) {
        next(error);
    }
};

const create_an_order = async (req, res, next) => {
    try {
        const userId = req.jwtDecoded.user_id;
        const orderData = req.body;
        orderData.user_id = userId;
        const newOrder = await orderService.create_an_order(orderData);
        res.status(StatusCodes.CREATED).json(newOrder);
    } catch (error) {
        next(error);
    }
};

const update_order_status = async (req, res, next) => {
    try {
        if(req.jwtDecoded?.role !== 'admin') next(new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền truy cập vào tài nguyên này'));
        const adminId = req.jwtDecoded.user_id;
        const { id } = req.params;
        const { status } = req.body;
        const {select} = req.query;
        const selectedColumns = select? select.split(",") : ["*"];
        const updatedOrder = await orderService.update_order_status(id, status, adminId, selectedColumns);
        res.status(StatusCodes.OK).json(updatedOrder);
    } catch (error) {
        next(error);
    }
};

const update_an_order = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.jwtDecoded.user_id;
        const updateData = req.body;
        const { select } = req.query;
        const selectedColumns = select ? select.split(",") : ["*"];
        const updatedOrder = await orderService.update_an_order(id, userId, updateData, selectedColumns);
        res.status(StatusCodes.OK).json(updatedOrder);
    } catch (error) {
        next(error);
    }
};

const delete_an_order = async (req, res, next) => {
    try {
        if(req.jwtDecoded?.role !== 'admin') next(new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền truy cập vào tài nguyên này'));
        const { id } = req.params;
        const result = await orderService.delete_an_order(id);
        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        next(error);
    }
};

export const orderController = {
    list_all_orders,
    get_order_by_id,
    get_orders_by_user,
    create_an_order,
    update_order_status,
    update_an_order,
    delete_an_order
};