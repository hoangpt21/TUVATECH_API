import connection from "../config/db_mysql"
import Joi from "joi";

const CART_TABLE_NAME = 'carts';

const CART_TABLE_SCHEMA = Joi.object({
    user_id: Joi.number().integer().required(),
    product_id: Joi.number().integer().required(),
    quantity: Joi.number().integer().min(1).default(1),
    added_at: Joi.date().default(new Date()),
    updated_at: Joi.date().default(new Date())
});

const validateBeforeCreateCart = async (data) => {
    return await CART_TABLE_SCHEMA.validateAsync(data, {abortEarly: false});
}

const list_all_carts = async (columns = ['*'], limit = 50, offset = 0) => {
    try {
        let queryStr = `SELECT ${columns.join(', ')} FROM ${CART_TABLE_NAME} LIMIT ? OFFSET ?`;
        const [result] = await connection.query(queryStr, [parseInt(limit), parseInt(offset)]);
        return result;
    } catch (error) {
        throw new Error(error);
    }
}

const list_carts_by_conditions = async (conditionValues, selectedColumns, conditionColumns, limit = 50, offset = 0, isAll = true) => {
    try {
        if(isAll) {
            let queryStr = `SELECT ${selectedColumns.map(column => column)} FROM ${CART_TABLE_NAME} WHERE ${conditionColumns.map(column => column.logicalOperator? `${column.name}=? ${column.logicalOperator}`: `${column.name}=?`).join(' ')}`;
            const [result] = await connection.query(queryStr, conditionValues);
            return result;
        } else {
            let queryStr = `SELECT ${selectedColumns.map(column => column)} FROM ${CART_TABLE_NAME} WHERE ${conditionColumns.map(column => column.logicalOperator? `${column.name}=? ${column.logicalOperator}`: `${column.name}=?`).join(' ')} LIMIT ? OFFSET ?`;
            const [result] = await connection.query(queryStr, [...conditionValues, parseInt(limit), parseInt(offset)]);
            return result;
        }
    } catch (error) {
        throw new Error(error);
    }
}

const create_a_cart = async (data) => {
    try {
        let valiData = await validateBeforeCreateCart(data);
        let queryStr = `INSERT INTO ${CART_TABLE_NAME} SET 
            user_id=?,
            product_id=?,
            quantity=?,
            added_at=?,
            updated_at=?`;
        const [result] = await connection.query(queryStr,[
            valiData.user_id,
            valiData.product_id,
            valiData.quantity,
            valiData.added_at,
            valiData.updated_at
        ]);
        return result;
    } catch (error) {
        throw new Error(error);
    }
}

const update_a_cart = async (columnValues, selectedColumns, conditionColumns) => {
    try {
        let queryStr = `UPDATE ${CART_TABLE_NAME} SET ${selectedColumns.map(column => column+'=?')} WHERE ${conditionColumns.map(column => column.logicalOperator? `${column.name}=? ${column.logicalOperator}`: `${column.name}=?`).join(' ')}`;
        const [result] = await connection.query(queryStr, columnValues);
        return result;
    } catch (error) {
        throw new Error(error);
    }
}

const delete_a_cart = async (userId, productId) => {
    try {
        let queryStr = `DELETE FROM ${CART_TABLE_NAME} WHERE user_id=? AND product_id=?`;
        const [result] = await connection.query(queryStr, [userId, productId]);
        return result;
    } catch (error) {
        throw error;
    }
}

const delete_user_cart = async (userId) => {
    try {
        let queryStr = `DELETE FROM ${CART_TABLE_NAME} WHERE user_id=?`;
        const [result] = await connection.query(queryStr, [userId]);
        return result;
    } catch (error) {
        throw error;
    }
}

export const cartModel = {
    list_all_carts,
    list_carts_by_conditions,
    create_a_cart,
    update_a_cart,
    delete_a_cart,
    delete_user_cart
};