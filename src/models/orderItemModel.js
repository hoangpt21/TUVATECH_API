import connection from "../config/db_mysql"
import Joi from "joi";

const ORDER_ITEM_TABLE_NAME = 'order_items';

const ORDER_ITEM_TABLE_SCHEMA = Joi.object({
    order_id: Joi.number().integer().required(),
    product_id: Joi.number().integer().allow(null), // Foreign key to products (allow NULL)
    quantity: Joi.number().integer().required().default(0), // Default 0, required
    subtotal_price: Joi.number().precision(2).required(), // Renamed from price
    product_name: Joi.string().max(255).allow(null), // Snapshot
    thumbnail: Joi.string().allow(null) // Snapshot (TEXT maps to string)
});

const validateBeforeCreateOrderItem = async (data) => {
    return await ORDER_ITEM_TABLE_SCHEMA.validateAsync(data, {abortEarly: false});
}

const list_all_order_items = async (selectedColumns = ['*'], limit = 50, offset = 0) => {
    try {
        let queryStr = `SELECT ${selectedColumns.join(', ')} FROM ${ORDER_ITEM_TABLE_NAME} LIMIT ? OFFSET ?`;
        const [result] = await connection.query(queryStr, [parseInt(limit), parseInt(offset)]);
        return result;
    } catch (error) {
        throw new Error(error);
    }
}

const list_order_items_by_conditions = async (conditionValues, selectedColumns, conditionColumns, limit = 50, offset = 0, isAll = true) => {
    try {
        if(isAll) {
            let queryStr = `SELECT ${selectedColumns.map(column => column)} FROM ${ORDER_ITEM_TABLE_NAME} WHERE ${conditionColumns.map(column => column.logicalOperator? `${column.name}=? ${column.logicalOperator}`: `${column.name}=?`).join(' ')}`;
            const [result] = await connection.query(queryStr, conditionValues);
            return result;
        } else {
            let queryStr = `SELECT ${selectedColumns.map(column => column)} FROM ${ORDER_ITEM_TABLE_NAME} WHERE ${conditionColumns.map(column => column.logicalOperator? `${column.name}=? ${column.logicalOperator}`: `${column.name}=?`).join(' ')} LIMIT ? OFFSET ?`;
            const [result] = await connection.query(queryStr, [...conditionValues, parseInt(limit), parseInt(offset)]);
            return result;
        }
    } catch (error) {
        throw new Error(error);
    }
}

const create_an_order_item = async (data) => {
    try {
        let valiData = await validateBeforeCreateOrderItem(data);
        // Dynamically build the SET part and values array based on validated data
        const columns = Object.keys(valiData);
        const placeholders = columns.map(col => `${col}=?`).join(', ');
        const values = columns.map(col => valiData[col]);

        let queryStr = `INSERT INTO ${ORDER_ITEM_TABLE_NAME} SET ${placeholders}`;
        const [result] = await connection.query(queryStr, values);
        return result; // Returns insert result, including insertId
    } catch (error) {
        throw new Error(error);
    }
}

// Assumes order_item_id is the primary key for updates, based on service usage
const update_an_order_item = async (orderItemId, updateData) => {
    try {
        const columnsToUpdate = Object.keys(updateData);
        if (columnsToUpdate.length === 0) {
            return { affectedRows: 0 }; // No changes needed
        }
        const setClause = columnsToUpdate.map(col => `${col}=?`).join(', ');
        const values = [...columnsToUpdate.map(key => updateData[key]), orderItemId];

        let queryStr = `UPDATE ${ORDER_ITEM_TABLE_NAME} SET ${setClause} WHERE order_item_id=?`;
        const [result] = await connection.query(queryStr, values);
        return result;
    } catch (error) {
        throw new Error(error);
    }
}

// Assumes order_item_id is the primary key for deletion, based on service/controller/route usage
const delete_an_order_item = async (orderItemId) => {
    try {
        let queryStr = `DELETE FROM ${ORDER_ITEM_TABLE_NAME} WHERE order_item_id=?`;
        const [result] = await connection.query(queryStr, [orderItemId]);
        return result;
    } catch (error) {
        throw error;
    }
}

const delete_order_items_by_orderId = async (orderId) => {
    try {
        let queryStr = `DELETE FROM ${ORDER_ITEM_TABLE_NAME} WHERE order_id=?`;
        const [result] = await connection.query(queryStr,[orderId]);
        return result;
    } catch (error) {
        throw error;
    }
}

export const orderItemModel = {
    list_all_order_items,
    list_order_items_by_conditions,
    create_an_order_item,
    update_an_order_item,
    delete_an_order_item,
    delete_order_items_by_orderId
};