import connection from "../config/db_mysql"
import Joi from "joi";

const BRAND_TABLE_NAME = 'brands';

const BRAND_TABLE_SCHEMA = Joi.object({
    brand_name: Joi.string().max(255).required(),
    description: Joi.string().allow(null, ""),
    logo_url: Joi.string().uri().allow(null, ""),
    is_active: Joi.boolean().default(true),
    created_at: Joi.date().default(new Date()),
    updated_at: Joi.date().default(new Date())
});

const validateBeforeCreateBrand = async (data) => {
    return await BRAND_TABLE_SCHEMA.validateAsync(data, {abortEarly: false});
}

const list_all_brands = async (columns = ['*'], limit = 50, offset = 0) => {
    try {
        let queryStr = `SELECT ${columns.join(', ')} FROM ${BRAND_TABLE_NAME} LIMIT ? OFFSET ?`;
        const [result] = await connection.query(queryStr, [parseInt(limit), parseInt(offset)]);
        return result;
    } catch (error) {
        throw new Error(error);
    }
}

const list_brands_by_conditions = async (conditionValues, selectedColumns, conditionColumns, limit = 50, offset = 0, isAll = true) => {
    try {
        if(isAll) {
            let queryStr = `SELECT ${selectedColumns.map(column => column)} FROM ${BRAND_TABLE_NAME} WHERE ${conditionColumns.map(column => column.logicalOperator? `${column.name}=? ${column.logicalOperator}`: `${column.name}=?`).join(' ')}`;
            const [result] = await connection.query(queryStr, conditionValues);
            return result;
        } else {
            let queryStr = `SELECT ${selectedColumns.map(column => column)} FROM ${BRAND_TABLE_NAME} WHERE ${conditionColumns.map(column => column.logicalOperator? `${column.name}=? ${column.logicalOperator}`: `${column.name}=?`).join(' ')} LIMIT ? OFFSET ?`;
            const [result] = await connection.query(queryStr, [...conditionValues, parseInt(limit), parseInt(offset)]);
            return result;
        }
    } catch (error) {
        throw new Error(error);
    }
}

const create_a_brand = async (data) => {
    try {
        let valiData = await validateBeforeCreateBrand(data);
        let queryStr = `INSERT INTO ${BRAND_TABLE_NAME} SET 
            brand_name=?,
            description=?,
            logo_url=?,
            is_active=?,
            created_at=?,
            updated_at=?`;
        const [result] = await connection.query(queryStr,[
            valiData.brand_name,
            valiData.description,
            valiData.logo_url,
            valiData.is_active,
            valiData.created_at,
            valiData.updated_at
        ]);
        return result;
    } catch (error) {
        throw new Error(error);
    }
}

const update_a_brand = async (columnValues, selectedColumns, conditionColumns) => {
    try {
        let queryStr = `UPDATE ${BRAND_TABLE_NAME} SET ${selectedColumns.map(column => column+'=?')} WHERE ${conditionColumns.map(column => column.logicalOperator? `${column.name}=? ${column.logicalOperator}`: `${column.name}=?`).join(' ')}`;
        const [result] = await connection.query(queryStr, columnValues);
        return result;
    } catch (error) {
        throw new Error(error);
    }
}

const delete_a_brand = async (brandId) => {
    try {
        let queryStr = `DELETE FROM ${BRAND_TABLE_NAME} WHERE brand_id=?`;
        const [result] = await connection.query(queryStr,[brandId]);
        return result;
    } catch (error) {
        throw error;
    }
}

export const brandModel = {
    list_all_brands,
    list_brands_by_conditions,
    create_a_brand,
    update_a_brand,
    delete_a_brand
};