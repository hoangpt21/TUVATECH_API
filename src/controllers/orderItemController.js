import { StatusCodes } from "http-status-codes";
import { orderItemService } from "../services/orderItemService";

const list_all_order_items = async (req, res, next) => {
    try {
        if(req.jwtDecoded?.role !== 'admin') next(new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền truy cập vào tài nguyên này'));
        const { select, limit, offset } = req.query;
        const selectedColumns = select ? select.split(",") : ["*"];
        const orderItems = await orderItemService.list_all_order_items(selectedColumns, limit, offset);
        res.status(StatusCodes.OK).json(orderItems);
    } catch (error) {
        next(error);
    }
};

const get_order_items_by_orderId = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const { select, limit, offset } = req.query;
        const selectedColumns = select ? select.split(",") : ["*"];
        const orderItems = await orderItemService.get_order_items_by_orderId(orderId, selectedColumns, limit, offset);
        res.status(StatusCodes.OK).json(orderItems);
    } catch (error) {
        next(error);
    }
};


const get_order_item_by_id = async (req, res, next) => {
    try {
        const { orderItemId } = req.params;
        const { select } = req.query;
        const selectedColumns = select ? select.split(",") : ["*"];
        const orderItems = await orderItemService.get_order_item_by_id(orderItemId, selectedColumns);
        res.status(StatusCodes.OK).json(orderItems);
    } catch (error) {
        next(error);
    }
};

const create_an_order_item = async (req, res, next) => {
    try {
        const orderItemData = req.body;
        const newOrderItem = await orderItemService.create_an_order_item(orderItemData);
        res.status(StatusCodes.CREATED).json(newOrderItem);
    } catch (error) {
        next(error);
    }
};

const update_an_order_item = async (req, res, next) => {
    try {
        const { orderItemId } = req.params;
        const updateData = req.body;
        const updatedItem = await orderItemService.update_an_order_item(
            orderItemId,
            updateData // Pass the raw update data from the body
        );
        res.status(StatusCodes.OK).json(updatedItem);
    } catch (error) {
        next(error);
    }
};

const delete_an_order_item = async (req, res, next) => {
    try {
        const { orderItemId } = req.params;
        const result = await orderItemService.delete_an_order_item(orderItemId);
        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        next(error);
    }
};

// Renamed function to match service and updated service call
const delete_order_items_by_orderId = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        // Corrected service function call
        const result = await orderItemService.delete_order_items_by_orderId(orderId);
        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        next(error);
    }
};

export const orderItemController = {
    list_all_order_items,
    get_order_items_by_orderId,
    get_order_item_by_id,
    create_an_order_item,
    update_an_order_item,
    delete_an_order_item,
    delete_order_items_by_orderId // Updated exported function name
};