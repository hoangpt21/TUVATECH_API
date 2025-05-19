import { orderItemModel } from "../models/orderItemModel.js";
import { productModel } from "../models/productModel.js";
import { orderModel } from "../models/orderModel.js";
import { ApiError } from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

const list_all_order_items = async (selectedColumns = ['*'], limit = 50, offset = 0) => {
    try {
        const orderItems = await orderItemModel.list_all_order_items(selectedColumns, limit, offset);
        return orderItems;
    } catch (error) {
        throw error;
    }
};

const get_order_items_by_orderId = async (orderId, selectedColumns = ["*"], limit = 50, offset = 0) => {
    try {
        const orderItems = await orderItemModel.list_order_items_by_conditions(
            [orderId],
            selectedColumns,
            [{ name: "order_id" }],
            limit,
            offset,
            false
        );

        if (!orderItems) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy danh sách chi tiết đơn hàng");
        }

        return orderItems;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi lấy thông tin đơn hàng");
    }
}

const get_order_item_by_id = async (orderItemId, selectedColumns = ["*"]) => {
    try {
        const orderItems = await orderItemModel.list_order_items_by_conditions(
            [orderItemId],
            selectedColumns,
            [{ name: "order_item_id" }]
        );

        if (!orderItems) return null;

        return orderItems;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi lấy thông tin đơn hàng");
    }
}

const create_an_order_item = async (inputData) => { // Renamed data to inputData for clarity
    try {
        // 8. Create Order Item in DB
        const createResult = await orderItemModel.create_an_order_item(inputData);

        const [createdOrderItem] = await orderItemModel.list_order_items_by_conditions(
            [createResult.insertId], // Use insertId from the creation result
            ['*'], // Select all columns of the new item
            [{ name: 'order_item_id' }]
        );
        return createdOrderItem;
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
    }
};

// Note: Updating snapshot fields (product_name, color_name, subtotal_price, thumbnail) is generally not recommended
// as they represent the state at the time of order. Only quantity update makes sense usually.
const update_an_order_item = async (orderItemId, updateData) => {
    try {

        if (Object.keys(finalUpdateData).length > 0) {
             await orderItemModel.update_an_order_item(orderItemId, finalUpdateData);
        } else {
             // No valid fields to update, return current item
             return currentItem;
        }


        // 4. Fetch and Return Updated Order Item
        const [updatedOrderItem] = await orderItemModel.list_order_items_by_conditions(
            [orderItemId],
            ["*"], // Fetch all columns after update
            [{ name: "order_item_id" }]
        );

        return updatedOrderItem;
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
    }
};

// Changed signature to use orderItemId
const delete_an_order_item = async (orderItemId) => {
    try {
        // 1. Check if Order Item Exists and get details for stock adjustment
        const [currentItem] = await orderItemModel.list_order_items_by_conditions(
            [orderItemId],
            ['*'], // Need these for stock update
            [{ name: 'order_item_id' }]
        );

        if (!currentItem) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Chi tiết đơn hàng không tồn tại");
        }

        // 3. Delete Order Item from DB
        const result = await orderItemModel.delete_an_order_item(orderItemId); // Use the correct model function

        return result;
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            throw new ApiError(
                StatusCodes.CONFLICT,
                "Chi tiết đơn hàng đang được sử dụng, không thể xóa!"
            );
        }
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi xóa chi tiết đơn hàng");
    }
};

export const orderItemService = {
    list_all_order_items,
    get_order_items_by_orderId,
    get_order_item_by_id,
    create_an_order_item,
    update_an_order_item,
    delete_an_order_item,
};
