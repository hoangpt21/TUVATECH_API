import connection from "../config/db_mysql"
import Joi from "joi";

const IMPORT_DETAIL_TABLE_NAME = 'import_details';

const IMPORT_DETAIL_TABLE_SCHEMA = Joi.object({
    import_id: Joi.number().integer().required(),
    product_id: Joi.number().integer(),
    product_name: Joi.string().max(255),
    quantity: Joi.number().integer().required(),
    import_price: Joi.number().precision(2).required(),
    thumbnail: Joi.string().required(),
});

const validateBeforeCreateImportDetail = async (data) => {
    return await IMPORT_DETAIL_TABLE_SCHEMA.validateAsync(data, { abortEarly: false });
}

const list_all_import_details = async (columns = ['*'], limit = 50, offset = 0) => {
    try {
        let queryStr = `SELECT ${columns.join(', ')} FROM ${IMPORT_DETAIL_TABLE_NAME} LIMIT ? OFFSET ?`;
        const [result] = await connection.query(queryStr, [parseInt(limit), parseInt(offset)]);
        return result;
    } catch (error) {
        throw new Error(error);
    }
}

const list_import_details_by_conditions = async (conditionValues, selectedColumns, conditionColumns, limit = 50, offset = 0, isAll = true) => {
    try {
        if(isAll) {
            let queryStr = `SELECT ${selectedColumns.map(column => column)} FROM ${IMPORT_DETAIL_TABLE_NAME} WHERE ${conditionColumns.map(column => column.logicalOperator ? `${column.name}=? ${column.logicalOperator}` : `${column.name}=?`).join(' ')}`;
            const [result] = await connection.query(queryStr, conditionValues);
            return result;
        } else {
            let queryStr = `SELECT ${selectedColumns.map(column => column)} FROM ${IMPORT_DETAIL_TABLE_NAME} WHERE ${conditionColumns.map(column => column.logicalOperator ? `${column.name}=? ${column.logicalOperator}` : `${column.name}=?`).join(' ')} LIMIT ? OFFSET ?`;
            const [result] = await connection.query(queryStr, [...conditionValues, parseInt(limit), parseInt(offset)]);
            return result;
        }
    } catch (error) {
        throw new Error(error);
    }
}

const create_an_import_detail = async (data) => {
    try {
        let valiData = await validateBeforeCreateImportDetail(data);
        let queryStr = `INSERT INTO ${IMPORT_DETAIL_TABLE_NAME} SET
            import_id=?,
            product_id=?,
            product_name=?,
            quantity=?,
            import_price=?,
            thumbnail=?`;
        const [result] = await connection.query(queryStr, [
            valiData.import_id,
            valiData.product_id,
            valiData.product_name,
            valiData.quantity,
            valiData.import_price,
            valiData.thumbnail
        ]);
        return result;
    } catch (error) {
        throw new Error(error);
    }
}

const update_an_import_detail = async (columnValues, selectedColumns, conditionColumns) => {
    try {
        let queryStr = `UPDATE ${IMPORT_DETAIL_TABLE_NAME} SET ${selectedColumns.map(column => column + '=?')} WHERE ${conditionColumns.map(column => column.logicalOperator ? `${column.name}=? ${column.logicalOperator}` : `${column.name}=?`).join(' ')}`;
        const [result] = await connection.query(queryStr, columnValues);
        return result;
    } catch (error) {
        throw new Error(error);
    }
};

const delete_an_import_detail = async (importDetailId) => {
    try {
        let queryStr = `DELETE FROM ${IMPORT_DETAIL_TABLE_NAME} WHERE import_detail_id=?`;
        const [result] = await connection.query(queryStr, [importDetailId]);
        return result;
    } catch (error) {
        throw error;
    }
};

const delete_import_details_by_importId = async (importId) => {
    try {
        let queryStr = `DELETE FROM ${IMPORT_DETAIL_TABLE_NAME} WHERE import_id=?`;
        const [result] = await connection.query(queryStr, [importId]);
        return result;
    } catch (error) {
        throw error;
    }
};

export const importDetailModel = {
    list_all_import_details,
    list_import_details_by_conditions,
    create_an_import_detail,
    update_an_import_detail,
    delete_an_import_detail,
    delete_import_details_by_importId
};