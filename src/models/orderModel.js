import connection from "../config/db_mysql"
import Joi from "joi";

const ORDER_TABLE_NAME = 'orders';

const ORDER_TABLE_SCHEMA = Joi.object({
    user_id: Joi.number().integer().required(),
    total_price: Joi.number().precision(2).allow(null), // Allow NULL initially
    status: Joi.string().max(50).valid('pending', 'confirmed', 'shipping', 'delivered', 'cancelled').allow(null).default('pending'),
    note: Joi.string().max(100).allow(null, ""),
    order_date: Joi.date().allow(null).default(() => new Date()), // Corrected: Removed invalid second argument
    updated_at: Joi.date().allow(null).default(() => new Date()), // Corrected: Removed invalid second argument, DB handles ON UPDATE
    payment_method: Joi.string().max(50).allow(null),
    payment_status: Joi.string().max(50).valid('pending', 'paid', 'failed', 'refund').allow(null).default('pending'),
    payment_date: Joi.date().allow(null),
    recipient_full_name: Joi.string().max(100).allow(null),
    recipient_phone_number: Joi.string().max(20).allow(null),
    recipient_email: Joi.string().email().max(100).allow(null), // Added email validation
    recipient_full_address: Joi.string().max(600).allow(null),
    coupon_code_used: Joi.string().max(50).allow(null),
    discount_amount: Joi.number().precision(2).allow(null).default(0.00),
    shipping_fee: Joi.number().precision(2).allow(0.00),
    shipping_method_name: Joi.string().max(100)
});

const validateBeforeCreateOrder = async (data) => {
    return await ORDER_TABLE_SCHEMA.validateAsync(data, {abortEarly: false});
}

const list_all_orders = async (columns = ['*'], limit = 50, offset = 0) => {
    try {
        let queryStr = `SELECT ${columns.join(', ')} FROM ${ORDER_TABLE_NAME} LIMIT ? OFFSET ?`;
        const [result] = await connection.query(queryStr, [parseInt(limit), parseInt(offset)]);
        return result;
    } catch (error) {
        throw new Error(error);
    }
}

const list_orders_by_conditions = async (conditionValues, selectedColumns, conditionColumns, limit = 50, offset = 0, isAll = true) => {
    try {
        if(isAll) {
            let queryStr = `SELECT ${selectedColumns.map(column => column)} FROM ${ORDER_TABLE_NAME} WHERE ${conditionColumns.map(column => column.logicalOperator? `${column.name}=? ${column.logicalOperator}`: `${column.name}=?`).join(' ')}`;
            const [result] = await connection.query(queryStr, conditionValues);
            return result;
        } else {
            let queryStr = `SELECT ${selectedColumns.map(column => column)} FROM ${ORDER_TABLE_NAME} WHERE ${conditionColumns.map(column => column.logicalOperator? `${column.name}=? ${column.logicalOperator}`: `${column.name}=?`).join(' ')} LIMIT ? OFFSET ?`;
            const [result] = await connection.query(queryStr, [...conditionValues, parseInt(limit), parseInt(offset)]);
            return result;
        }
    } catch (error) {
        throw new Error(error);
    }
}

const create_an_order = async (data) => {
    try {
        let valiData = await validateBeforeCreateOrder(data);
        // Dynamically build the SET part and values array based on validated data
        const columns = Object.keys(valiData);
        const placeholders = columns.map(col => `${col}=?`).join(', ');
        const values = columns.map(col => valiData[col]);

        let queryStr = `INSERT INTO ${ORDER_TABLE_NAME} SET ${placeholders}`;
        const [result] = await connection.query(queryStr, values);
        return result;
    } catch (error) {
        throw new Error(error);
    }
}

const update_an_order = async (columnValues, selectedColumns, conditionColumns) => {
    try {
        let queryStr = `UPDATE ${ORDER_TABLE_NAME} SET ${selectedColumns.map(column => column+'=?')} WHERE ${conditionColumns.map(column => column.logicalOperator? `${column.name}= ? ${column.logicalOperator}`: `${column.name}= ?`).join(' ')}`;
        const [result] = await connection.query(queryStr, columnValues);
        return result;
    } catch (error) {
        throw new Error(error);
    }
}

const delete_an_order = async (orderId) => {
    try {
        let queryStr = `DELETE FROM ${ORDER_TABLE_NAME} WHERE order_id=?`;
        const [result] = await connection.query(queryStr,[orderId]);
        return result;
    } catch (error) {
        throw error;
    }
}

export const orderModel = {
    list_all_orders,
    list_orders_by_conditions,
    create_an_order,
    update_an_order,
    delete_an_order
};