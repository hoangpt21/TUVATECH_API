import connection from "../config/db_mysql"
import Joi from "joi";

const CATEGORY_TABLE_NAME = 'categories';

const CATEGORY_TABLE_SCHEMA = Joi.object({
    category_name: Joi.string().max(255).required(),
    description: Joi.string().allow(null, ""),
    category_type: Joi.string().valid('product', 'news').default('product'),
    is_active: Joi.boolean().default(true),
    created_at: Joi.date().default(new Date()),
    updated_at: Joi.date().default(new Date())
});

const validateBeforeCreateCategory = async (data) => {
    return await CATEGORY_TABLE_SCHEMA.validateAsync(data, {abortEarly: false});
}

const list_all_categories = async (columns = ['*'], limit = 50, offset = 0) => {
    try {
        let queryStr = `SELECT ${columns.join(', ')} FROM ${CATEGORY_TABLE_NAME} LIMIT ? OFFSET ?`;
        const [result] = await connection.query(queryStr, [parseInt(limit), parseInt(offset)]);
        return result;
    } catch (error) {
        throw new Error(error);
    }
}

const list_categories_by_conditions = async (conditionValues, selectedColumns, conditionColumns, limit = 50, offset = 0, isAll = true) => {
    try {
        if(isAll) {
            let queryStr = `SELECT ${selectedColumns.map(column => column)} FROM ${CATEGORY_TABLE_NAME} WHERE ${conditionColumns.map(column => column.logicalOperator? `${column.name}=? ${column.logicalOperator}`: `${column.name}=?`).join(' ')}`;
            const [result] = await connection.query(queryStr, conditionValues);
            return result;
        } else {
            let queryStr = `SELECT ${selectedColumns.map(column => column)} FROM ${CATEGORY_TABLE_NAME} WHERE ${conditionColumns.map(column => column.logicalOperator? `${column.name}=? ${column.logicalOperator}`: `${column.name}=?`).join(' ')} LIMIT ? OFFSET ?`;
            const [result] = await connection.query(queryStr, [...conditionValues, parseInt(limit), parseInt(offset)]);
            return result;
        }
    } catch (error) {
        throw new Error(error);
    }
}

const create_a_category = async (data) => {
    try {
        let valiData = await validateBeforeCreateCategory(data);
        let queryStr = `INSERT INTO ${CATEGORY_TABLE_NAME} SET 
            category_name=?,
            description=?,
            category_type=?,
            is_active=?,
            created_at=?,
            updated_at=?`;
        const [result] = await connection.query(queryStr,[
            valiData.category_name,
            valiData.description,
            valiData.category_type,
            valiData.is_active,
            valiData.created_at,
            valiData.updated_at
        ]);
        return result;
    } catch (error) {
        throw new Error(error);
    }
}

const update_a_category = async (columnValues, selectedColumns, conditionColumns) => {
    try {
        let queryStr = `UPDATE ${CATEGORY_TABLE_NAME} SET ${selectedColumns.map(column => column+'=?')} WHERE ${conditionColumns.map(column => column.logicalOperator? `${column.name}=? ${column.logicalOperator}`: `${column.name}=?`).join(' ')}`;
        const [result] = await connection.query(queryStr, columnValues);
        return result;
    } catch (error) {
        throw new Error(error);
    }
}

const delete_a_category = async (categoryId) => {
    try {
        let queryStr = `DELETE FROM ${CATEGORY_TABLE_NAME} WHERE category_id=?`;
        const [result] = await connection.query(queryStr,[categoryId]);
        return result;
    } catch (error) {
        throw error;
    }
}

export const categoryModel = {
    list_all_categories,
    list_categories_by_conditions,
    create_a_category,
    update_a_category,
    delete_a_category
};