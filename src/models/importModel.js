import connection from "../config/db_mysql"
import Joi from "joi";

const IMPORT_TABLE_NAME = 'imports';

const IMPORT_TABLE_SCHEMA = Joi.object({
    supplier_name: Joi.string().max(100).required(),
    phone: Joi.string().pattern(/^\d{10,20}$/).allow(null, ""),
    email: Joi.string().max(100).allow(null, ""),
    address: Joi.string().max(255).allow(null, ""),
    note: Joi.string().allow(null, ''),
    updated_at: Joi.date().default(new Date()),
    import_date: Joi.date().default(new Date()),
    total_amount: Joi.number().precision(2).default(0),
});

const validateBeforeCreateImport = async (data) => {
    return await IMPORT_TABLE_SCHEMA.validateAsync(data, { abortEarly: false });
}

const list_all_imports = async (columns = ['*'], limit = 50, offset = 0) => {
    try {
        let queryStr = `SELECT ${columns.join(', ')} FROM ${IMPORT_TABLE_NAME} LIMIT ? OFFSET ?`;
        const [result] = await connection.query(queryStr, [parseInt(limit), parseInt(offset)]);
        return result;
    } catch (error) {
        throw new Error(error);
    }
}

const list_imports_by_conditions = async (conditionValues, selectedColumns, conditionColumns, limit = 50, offset = 0, isAll = true) => {
    try {
        if(isAll) {
            let queryStr = `SELECT ${selectedColumns.map(column => column)} FROM ${IMPORT_TABLE_NAME} WHERE ${conditionColumns.map(column => column.logicalOperator ? `${column.name}=? ${column.logicalOperator}` : `${column.name}=?`).join(' ')}`;
            const [result] = await connection.query(queryStr, conditionValues);
            return result;
        } else {
            let queryStr = `SELECT ${selectedColumns.map(column => column)} FROM ${IMPORT_TABLE_NAME} WHERE ${conditionColumns.map(column => column.logicalOperator ? `${column.name}=? ${column.logicalOperator}` : `${column.name}=?`).join(' ')} LIMIT ? OFFSET ?`;
            const [result] = await connection.query(queryStr, [...conditionValues, parseInt(limit), parseInt(offset)]);
            return result;
        }
    } catch (error) {
        throw new Error(error);
    }
}

const create_an_import = async (data) => {
    try {
        let valiData = await validateBeforeCreateImport(data);
        let queryStr = `INSERT INTO ${IMPORT_TABLE_NAME} SET 
            supplier_name=?,
            phone=?,
            email=?,
            address=?,
            note=?,
            updated_at=?,
            import_date=?,
            total_amount=?`;
        const [result] = await connection.query(queryStr, [
            valiData.supplier_name,
            valiData.phone,
            valiData.email,
            valiData.address,
            valiData.note,
            valiData.updated_at,
            valiData.import_date,
            valiData.total_amount,
        ]);
        return result;
    } catch (error) {
        throw new Error(error);
    }
}

const update_an_import = async (columnValues, selectedColumns, conditionColumns) => {
    try {
        let queryStr = `UPDATE ${IMPORT_TABLE_NAME} SET ${selectedColumns.map(column => column + '=?')} WHERE ${conditionColumns.map(column => column.logicalOperator ? `${column.name}=? ${column.logicalOperator}` : `${column.name}=?`).join(' ')}`;
        const [result] = await connection.query(queryStr, columnValues);
        return result;
    } catch (error) {
        throw new Error(error);
    }
};

const delete_an_import = async (importId) => {
    try {
        let queryStr = `DELETE FROM ${IMPORT_TABLE_NAME} WHERE import_id=?`;
        const [result] = await connection.query(queryStr, [importId]);
        return result;
    } catch (error) {
        throw error;
    }
};

export const importModel = {
    list_all_imports,
    list_imports_by_conditions,
    create_an_import,
    update_an_import,
    delete_an_import,
};