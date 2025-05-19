import connection from "../config/db_mysql"
import Joi from "joi";

const IMAGE_TABLE_NAME = 'images';

const IMAGE_TABLE_SCHEMA = Joi.object({
    review_id: Joi.number().integer().allow(null),
    product_id: Joi.number().integer().allow(null),
    image_url: Joi.string().uri().required()
}).custom((value, helpers) => {
    // Ensure at least one ID is provided
    if (!value.review_id && !value.product_id) {
        return helpers.error('any.custom', { message: 'Phải cung cấp ít nhất một ID (review_id, hoặc product_id)' });
    }
    return value;
});

const validateBeforeCreateImage = async (data) => {
    return await IMAGE_TABLE_SCHEMA.validateAsync(data, {abortEarly: false});
}

const list_all_images = async (selectedColumns = ['*'], limit = 50, offset = 0) => {
    try {
        let queryStr = `SELECT ${selectedColumns.join(', ')} FROM ${IMAGE_TABLE_NAME} LIMIT ? OFFSET ?`;
        const [result] = await connection.query(queryStr, [parseInt(limit), parseInt(offset)]);
        return result;
    } catch (error) {
        throw new Error(error);
    }
}

const list_images_by_conditions = async (conditionValues, selectedColumns, conditionColumns, operator = '=', limit = 50, offset = 0, isAll = true) => {
    try {
        if(isAll) {
            let queryStr = `SELECT ${selectedColumns.map(column => column)} FROM ${IMAGE_TABLE_NAME} WHERE ${conditionColumns.map(column => column.logicalOperator? `${column.name} ${operator} ? ${column.logicalOperator}`: `${column.name} ${operator} ?`).join(' ')}`;
            const [result] = await connection.query(queryStr, conditionValues);
            return result;
        } else {
            let queryStr = `SELECT ${selectedColumns.map(column => column)} FROM ${IMAGE_TABLE_NAME} WHERE ${conditionColumns.map(column => column.logicalOperator? `${column.name} ${operator} ? ${column.logicalOperator}`: `${column.name} ${operator} ?`).join(' ')} LIMIT ? OFFSET ?`;
            const [result] = await connection.query(queryStr, [...conditionValues, parseInt(limit), parseInt(offset)]);
            return result;
        }
    } catch (error) {
        throw new Error(error);
    }
}

const create_an_image = async (data) => {
    try {
        let valiData = await validateBeforeCreateImage(data);
        let queryStr = `INSERT INTO ${IMAGE_TABLE_NAME} SET 
            review_id=?,
            product_id=?,
            image_url=?`;
        const [result] = await connection.query(queryStr,[
            valiData.review_id,
            valiData.product_id,
            valiData.image_url
        ]);
        return result;
    } catch (error) {
        throw new Error(error);
    }
}

const update_an_image = async (columnValues, selectedColumns, conditionColumns) => {
    try {
        let queryStr = `UPDATE ${IMAGE_TABLE_NAME} SET ${selectedColumns.map(column => column+'=?')} WHERE ${conditionColumns.map(column => column.logicalOperator? `${column.name}=? ${column.logicalOperator}`: `${column.name}=?`).join(' ')}`;
        const [result] = await connection.query(queryStr, columnValues);
        return result;
    } catch (error) {
        throw new Error(error);
    }
}

const delete_images_by_id = async (columnName, columnId) => {
    try {
        let queryStr = `DELETE FROM ${IMAGE_TABLE_NAME} WHERE ${columnName}=?`;
        const [result] = await connection.query(queryStr,[columnId]);
        return result;
    } catch (error) {
        throw error;
    }
}

const delete_an_image_by_id = async (imageId) => {
    try {
        let queryStr = `DELETE FROM ${IMAGE_TABLE_NAME} WHERE image_id=?`;
        const [result] = await connection.query(queryStr,[imageId]);
        return result;
    } catch (error) {
        throw error;
    }
}

export const imageModel = {
    list_all_images,
    list_images_by_conditions,
    create_an_image,
    update_an_image,
    delete_images_by_id,
    delete_an_image_by_id
};