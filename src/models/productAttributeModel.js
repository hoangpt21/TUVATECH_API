import connection from "../config/db_mysql"
import Joi from "joi";

const PRODUCT_ATTRIBUTE_TABLE_NAME = 'product_attributes';

const PRODUCT_ATTRIBUTE_TABLE_SCHEMA = Joi.object({
    product_id: Joi.number().integer().required(),
    attribute_name: Joi.string().max(100).required(),
    attribute_value: Joi.string().max(255).required()
});

const validateBeforeCreateAttribute = async (data) => {
    return await PRODUCT_ATTRIBUTE_TABLE_SCHEMA.validateAsync(data, {abortEarly: false});
}

const list_all_attributes = async (selectedColumns = ["*"], limit = 50, offset = 0) => {
    try {
        let queryStr = `SELECT ${selectedColumns.map(column => column)} FROM ${PRODUCT_ATTRIBUTE_TABLE_NAME} LIMIT ? OFFSET ?`;
        const [result] = await connection.query(queryStr, [parseInt(limit), parseInt(offset)]);
        return result;
    } catch (error) {
        throw new Error(error);
    }
}

const list_attributes_by_conditions = async (conditionValues, selectedColumns, conditionColumns, limit = 50, offset = 0, isAll = true) => {
    try {
        if(isAll) {
            let queryStr = `SELECT ${selectedColumns.map(column => column)} FROM ${PRODUCT_ATTRIBUTE_TABLE_NAME} WHERE ${conditionColumns.map(column => column.logicalOperator? `${column.name}=? ${column.logicalOperator}`: `${column.name}=?`).join(' ')}`;
            const [result] = await connection.query(queryStr, conditionValues);
            return result;
        } else {
            let queryStr = `SELECT ${selectedColumns.map(column => column)} FROM ${PRODUCT_ATTRIBUTE_TABLE_NAME} WHERE ${conditionColumns.map(column => column.logicalOperator? `${column.name}=? ${column.logicalOperator}`: `${column.name}=?`).join(' ')} LIMIT ? OFFSET ?`;
            const [result] = await connection.query(queryStr, [...conditionValues, parseInt(limit), parseInt(offset)]);
            return result;
        }
    } catch (error) {
        throw new Error(error);
    }
}

const create_an_attribute = async (data) => {
    try {
        let valiData = await validateBeforeCreateAttribute(data);
        let queryStr = `INSERT INTO ${PRODUCT_ATTRIBUTE_TABLE_NAME} SET 
            product_id=?,
            attribute_name=?,
            attribute_value=?`;
        const [result] = await connection.query(queryStr,[
            valiData.product_id,
            valiData.attribute_name,
            valiData.attribute_value
        ]);
        return result;
    } catch (error) {
        throw new Error(error);
    }
}

const update_an_attribute = async (columnValues, selectedColumns, conditionColumns) => {
    try {
        let queryStr = `UPDATE ${PRODUCT_ATTRIBUTE_TABLE_NAME} SET ${selectedColumns.map(column => column+'=?')} WHERE ${conditionColumns.map(column => column.logicalOperator? `${column.name}=? ${column.logicalOperator}`: `${column.name}=?`).join(' ')}`;
        const [result] = await connection.query(queryStr, columnValues);
        return result;
    } catch (error) {
        throw new Error(error);
    }
}

const delete_an_attribute = async (attributeId) => {
    try {
        let queryStr = `DELETE FROM ${PRODUCT_ATTRIBUTE_TABLE_NAME} WHERE attribute_id=?`;
        const [result] = await connection.query(queryStr,[attributeId]);
        return result;
    } catch (error) {
        throw error;
    }
}

const delete_attributes_by_productId = async (productId) => {
    try {
        let queryStr = `DELETE FROM ${PRODUCT_ATTRIBUTE_TABLE_NAME} WHERE product_id=?`;
        const [result] = await connection.query(queryStr,[productId]);
        return result;
    } catch (error) {
        throw error;
    }
}
export const productAttributeModel = {
    list_all_attributes,
    list_attributes_by_conditions,
    create_an_attribute,
    update_an_attribute,
    delete_an_attribute,
    delete_attributes_by_productId
};