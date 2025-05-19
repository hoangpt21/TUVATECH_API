import connection from "../config/db_mysql"
import Joi from "joi";

const USER_COUPON_TABLE_NAME = 'user_coupons';

const USER_COUPON_TABLE_SCHEMA = Joi.object({
    user_id: Joi.number().integer().required(),
    coupon_id: Joi.number().integer().required(),
    used_count: Joi.number().integer().default(0),
    received_at: Joi.date().default(new Date())
});

const validateBeforeCreateUserCoupon = async (data) => {
    return await USER_COUPON_TABLE_SCHEMA.validateAsync(data, {abortEarly: false});
}

const list_all_user_coupons = async (selectedColumns = ['*'], limit = 50, offset = 0) => {
    try {
        let queryStr = `SELECT ${selectedColumns.join(', ')} FROM ${USER_COUPON_TABLE_NAME} LIMIT ? OFFSET ?`;
        const [result] = await connection.query(queryStr, [parseInt(limit), parseInt(offset)]);
        return result;
    } catch (error) {
        throw new Error(error);
    }
}

const list_user_coupons_by_conditions = async (conditionValues, selectedColumns, conditionColumns, limit = 50, offset = 0, isAll = true) => {
    try {
        if(isAll) {
            let queryStr = `SELECT ${selectedColumns.map(column => column)} FROM ${USER_COUPON_TABLE_NAME} WHERE ${conditionColumns.map(column => column.logicalOperator? `${column.name}=? ${column.logicalOperator}`: `${column.name}=?`).join(' ')}`;
            const [result] = await connection.query(queryStr, conditionValues);
            return result;
        } else {
            let queryStr = `SELECT ${selectedColumns.map(column => column)} FROM ${USER_COUPON_TABLE_NAME} WHERE ${conditionColumns.map(column => column.logicalOperator? `${column.name}=? ${column.logicalOperator}`: `${column.name}=?`).join(' ')} LIMIT ? OFFSET ?`;
            const [result] = await connection.query(queryStr, [...conditionValues, parseInt(limit), parseInt(offset)]);
            return result;
        }
    } catch (error) {
        throw new Error(error);
    }
}

const create_a_user_coupon = async (data) => {
    try {
        let valiData = await validateBeforeCreateUserCoupon(data);
        let queryStr = `INSERT INTO ${USER_COUPON_TABLE_NAME} SET 
            user_id=?,
            coupon_id=?,
            used_count=?,
            received_at=?`;
        const [result] = await connection.query(queryStr,[
            valiData.user_id,
            valiData.coupon_id,
            valiData.used_count,
            valiData.received_at
        ]);
        return result;
    } catch (error) {
        throw new Error(error);
    }
}

const update_a_user_coupon = async (columnValues, selectedColumns, conditionColumns) => {
    try {
        let queryStr = `UPDATE ${USER_COUPON_TABLE_NAME} SET ${selectedColumns.map(column => column+'=?')} WHERE ${conditionColumns.map(column => column.logicalOperator? `${column.name}=? ${column.logicalOperator}`: `${column.name}=?`).join(' ')}`;
        const [result] = await connection.query(queryStr, columnValues);
        return result;
    } catch (error) {
        throw new Error(error);
    }
}

const delete_a_user_coupon = async (userId, couponId) => {
    try {
        let queryStr = `DELETE FROM ${USER_COUPON_TABLE_NAME} WHERE user_id=? AND coupon_id=?`;
        const [result] = await connection.query(queryStr,[userId, couponId]);
        return result;
    } catch (error) {
        throw error;
    }
}

export const userCouponModel = {
    list_all_user_coupons,
    list_user_coupons_by_conditions,
    create_a_user_coupon,
    update_a_user_coupon,
    delete_a_user_coupon
};