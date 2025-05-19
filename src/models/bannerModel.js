import connection from "../config/db_mysql"
import Joi from "joi";

const BANNER_TABLE_NAME = 'banners';

const BANNER_TABLE_SCHEMA = Joi.object({
    banner_name: Joi.string().max(255).required(),
    banner_url: Joi.string().uri().allow(null, ""),
    is_active: Joi.boolean().default(true),
    created_at: Joi.date().default(new Date()),
    updated_at: Joi.date().default(new Date())
});

const validateBeforeCreateBanner = async (data) => {
    return await BANNER_TABLE_SCHEMA.validateAsync(data, {abortEarly: false});
}

const list_all_banners = async (columns = ['*'], limit = 50, offset = 0) => {
    try {
        let queryStr = `SELECT ${columns.join(', ')} FROM ${BANNER_TABLE_NAME} LIMIT ? OFFSET ?`;
        const [result] = await connection.query(queryStr, [parseInt(limit), parseInt(offset)]);
        return result;
    } catch (error) {
        throw new Error(error);
    }
}

const list_banners_by_conditions = async (conditionValues, selectedColumns, conditionColumns, limit = 50, offset = 0, isAll = true) => {
    try {
        if(isAll) {
            let queryStr = `SELECT ${selectedColumns.map(column => column)} FROM ${BANNER_TABLE_NAME} WHERE ${conditionColumns.map(column => column.logicalOperator? `${column.name}=? ${column.logicalOperator}`: `${column.name}=?`).join(' ')}`;
            const [result] = await connection.query(queryStr, conditionValues);
            return result;
        } else {
            let queryStr = `SELECT ${selectedColumns.map(column => column)} FROM ${BANNER_TABLE_NAME} WHERE ${conditionColumns.map(column => column.logicalOperator? `${column.name}=? ${column.logicalOperator}`: `${column.name}=?`).join(' ')} LIMIT ? OFFSET ?`;
            const [result] = await connection.query(queryStr, [...conditionValues, parseInt(limit), parseInt(offset)]);
            return result;
        }
    } catch (error) {
        throw new Error(error);
    }
}

const create_a_banner = async (data) => {
    try {
        let valiData = await validateBeforeCreateBanner(data);
        let queryStr = `INSERT INTO ${BANNER_TABLE_NAME} SET 
            banner_name=?,
            banner_url=?,
            is_active=?,
            created_at=?,
            updated_at=?`;
        const [result] = await connection.query(queryStr,[
            valiData.banner_name,
            valiData.banner_url,
            valiData.is_active,
            valiData.created_at,
            valiData.updated_at
        ]);
        return result;
    } catch (error) {
        throw new Error(error);
    }
}

const update_a_banner = async (columnValues, selectedColumns, conditionColumns) => {
    try {
        let queryStr = `UPDATE ${BANNER_TABLE_NAME} SET ${selectedColumns.map(column => column+'=?')} WHERE ${conditionColumns.map(column => column.logicalOperator? `${column.name}=? ${column.logicalOperator}`: `${column.name}=?`).join(' ')}`;
        const [result] = await connection.query(queryStr, columnValues);
        return result;
    } catch (error) {
        throw new Error(error);
    }
}

const delete_a_banner = async (bannerId) => {
    try {
        let queryStr = `DELETE FROM ${BANNER_TABLE_NAME} WHERE banner_id=?`;
        const [result] = await connection.query(queryStr,[bannerId]);
        return result;
    } catch (error) {
        throw error;
    }
}

export const bannerModel = {
    list_all_banners,
    list_banners_by_conditions,
    create_a_banner,
    update_a_banner,
    delete_a_banner
};