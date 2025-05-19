import connection from "../config/db_mysql"
import Joi from "joi";

const COUPON_TABLE_NAME = 'coupons';

const COUPON_TABLE_SCHEMA = Joi.object({
    coupon_code: Joi.string().max(50).required(),
    description: Joi.string().allow(null, ""),
    discount_type: Joi.string().valid('percentage', 'amount').required(),
    discount_value: Joi.number().precision(2).required(),
    start_date: Joi.date().required(),
    end_date: Joi.date().greater(Joi.ref('start_date')).required(),
    min_order_value: Joi.number().precision(2).required(),
    max_users: Joi.number().integer().min(0).required(),
    // status: Joi.string().valid('active', 'expired', 'used_up', 'pending', 'scheduled').default('active'),
    max_usage_per_user: Joi.number().integer().min(0).required(),
    max_discount_value: Joi.number().precision(2).allow(null),
    used_count: Joi.number().integer().default(0),
    is_active: Joi.boolean().default(true),
    created_at: Joi.date().default(new Date()),
    updated_at: Joi.date().default(new Date())
});

const validateBeforeCreateCoupon = async (data) => {
    return await COUPON_TABLE_SCHEMA.validateAsync(data, {abortEarly: false});
}

const list_all_coupons = async (columns = ['*'], limit = 50, offset = 0) => {
    try {
        let queryStr = `SELECT ${columns.join(', ')} FROM ${COUPON_TABLE_NAME} LIMIT ? OFFSET ?`;
        const [result] = await connection.query(queryStr, [parseInt(limit), parseInt(offset)]);
        return result;
    } catch (error) {
        throw new Error(error);
    }
}

const list_coupons_by_conditions = async (conditionValues, selectedColumns, conditionColumns, limit = 50, offset = 0, isAll = true) => {
    try {
        if(isAll) {
            let queryStr = `SELECT ${selectedColumns.map(column => column)} FROM ${COUPON_TABLE_NAME} WHERE ${conditionColumns.map(column => column.logicalOperator? `${column.name}=? ${column.logicalOperator}`: `${column.name}=?`).join(' ')}`;
            const [result] = await connection.query(queryStr, conditionValues);
            return result;
        } else {
            let queryStr = `SELECT ${selectedColumns.map(column => column)} FROM ${COUPON_TABLE_NAME} WHERE ${conditionColumns.map(column => column.logicalOperator? `${column.name}=? ${column.logicalOperator}`: `${column.name}=?`).join(' ')} LIMIT ? OFFSET ?`;
            const [result] = await connection.query(queryStr, [...conditionValues, parseInt(limit), parseInt(offset)]);
            return result;
        }
    } catch (error) {
        throw new Error(error);
    }
}

const create_a_coupon = async (data) => {
    try {
        let valiData = await validateBeforeCreateCoupon(data);
        let queryStr = `INSERT INTO ${COUPON_TABLE_NAME} SET 
            coupon_code=?,
            description=?,
            discount_type=?,
            discount_value=?,
            start_date=?,
            end_date=?,
            min_order_value=?,
            max_users=?,
            max_usage_per_user=?,
            max_discount_value=?,
            used_count=?,
            is_active=?,
            created_at=?,
            updated_at=?`;
        const [result] = await connection.query(queryStr,[
            valiData.coupon_code,
            valiData.description,
            valiData.discount_type,
            valiData.discount_value,
            valiData.start_date,
            valiData.end_date,
            valiData.min_order_value,
            valiData.max_users,
            valiData.max_usage_per_user,
            valiData.max_discount_value,
            valiData.used_count,
            valiData.is_active,
            valiData.created_at,
            valiData.updated_at
        ]);
        return result;
    } catch (error) {
        throw new Error(error);
    }
}

const update_a_coupon = async (columnValues, selectedColumns, conditionColumns) => {
    try {
        let queryStr = `UPDATE ${COUPON_TABLE_NAME} SET ${selectedColumns.map(column => column+'=?')} WHERE ${conditionColumns.map(column => column.logicalOperator? `${column.name}=? ${column.logicalOperator}`: `${column.name}=?`).join(' ')}`;
        const [result] = await connection.query(queryStr, columnValues);
        return result;
    } catch (error) {
        throw new Error(error);
    }
}

const delete_a_coupon = async (couponId) => {
    try {
        let queryStr = `DELETE FROM ${COUPON_TABLE_NAME} WHERE coupon_id=?`;
        const [result] = await connection.query(queryStr,[couponId]);
        return result;
    } catch (error) {
        throw error;
    }
}

export const couponModel = {
    list_all_coupons,
    list_coupons_by_conditions,
    create_a_coupon,
    update_a_coupon,
    delete_a_coupon
};