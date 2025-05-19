import connection from "../config/db_mysql"
import Joi from "joi";

const REVIEW_TABLE_NAME = 'reviews';

const REVIEW_TABLE_SCHEMA = Joi.object({
    product_id: Joi.number().integer().required(),
    user_id: Joi.number().integer().required(),
    rating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().allow(null, ""),
    created_at: Joi.date().default(new Date()),
    moderation_status: Joi.string().max(50).valid('pending', 'approved', 'rejected').default('pending'),
});

const validateBeforeCreateReview = async (data) => {
    return await REVIEW_TABLE_SCHEMA.validateAsync(data, {abortEarly: false});
}

const list_all_reviews = async (columns = ['*'], limit = 50, offset = 0) => {
    try {
        let queryStr = `SELECT ${columns.join(', ')} FROM ${REVIEW_TABLE_NAME} LIMIT ? OFFSET ?`;
        const [result] = await connection.query(queryStr, [parseInt(limit), parseInt(offset)]);
        return result;
    } catch (error) {
        throw new Error(error);
    }
}

const list_reviews_by_conditions = async (conditionValues, selectedColumns, conditionColumns, limit = 50, offset = 0, isAll = true) => {
    try {
        if(isAll) {
            let queryStr = `SELECT ${selectedColumns.map(column => column)} FROM ${REVIEW_TABLE_NAME} WHERE ${conditionColumns.map(column => column.logicalOperator? `${column.name}=? ${column.logicalOperator}`: `${column.name}=?`).join(' ')}`;
            const [result] = await connection.query(queryStr, conditionValues);
            return result;
        } else {
            let queryStr = `SELECT ${selectedColumns.map(column => column)} FROM ${REVIEW_TABLE_NAME} WHERE ${conditionColumns.map(column => column.logicalOperator? `${column.name}=? ${column.logicalOperator}`: `${column.name}=?`).join(' ')} LIMIT ? OFFSET ?`;
            const [result] = await connection.query(queryStr, [...conditionValues, parseInt(limit), parseInt(offset)]);
            return result;
        }
    } catch (error) {
        throw new Error(error);
    }
}

const create_a_review = async (data) => {
    try {
        let valiData = await validateBeforeCreateReview(data);
        let queryStr = `INSERT INTO ${REVIEW_TABLE_NAME} SET 
            product_id=?,
            user_id=?,
            rating=?,
            comment=?,
            created_at=?,
            moderation_status=?`;
        const [result] = await connection.query(queryStr,[
            valiData.product_id,
            valiData.user_id,
            valiData.rating,
            valiData.comment,
            valiData.created_at,
            valiData.moderation_status
        ]);
        return result;
    } catch (error) {
        throw new Error(error);
    }
}

const update_a_review = async (columnValues, selectedColumns, conditionColumns) => {
    try {
        let queryStr = `UPDATE ${REVIEW_TABLE_NAME} SET ${selectedColumns.map(column => column+'=?')} WHERE ${conditionColumns.map(column => column.logicalOperator? `${column.name}=? ${column.logicalOperator}`: `${column.name}=?`).join(' ')}`;
        const [result] = await connection.query(queryStr, columnValues);
        return result;
    } catch (error) {
        throw error;
    }
}

const delete_a_review = async (reviewId) => {
    try {
        let queryStr = `DELETE FROM ${REVIEW_TABLE_NAME} WHERE review_id=?`;
        const [result] = await connection.query(queryStr,[reviewId]);
        return result;
    } catch (error) {
        throw error;
    }
}

export const reviewModel = {
    list_all_reviews,
    list_reviews_by_conditions,
    create_a_review,
    update_a_review,
    delete_a_review
};