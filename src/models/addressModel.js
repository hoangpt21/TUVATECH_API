import connection from "../config/db_mysql"
import Joi from "joi";

const ADDRESS_TABLE_NAME = 'user_addresses';

const ADDRESS_TABLE_SCHEMA =  Joi.object({
    user_id: Joi.number().integer().required(), 
    full_name: Joi.string().max(100).required(), 
    phone: Joi.string().pattern(/^\d{10,20}$/).required(),
    city: Joi.string().max(255).required(), 
    district: Joi.string().max(255).required(), 
    ward: Joi.string().max(255).required(), 
    street: Joi.string().max(255).required(), 
    is_default: Joi.boolean().default(false), 
  });

const validateBeforeCreateAddress = async (data) => {
    return await ADDRESS_TABLE_SCHEMA.validateAsync(data, {abortEarly: false});
}
    
const list_all_addresses = async (columns = ['*'], limit = 50, offset = 0) => {
    try {
        let queryStr = `SELECT ${columns.join(', ')} FROM ${ADDRESS_TABLE_NAME} LIMIT ? OFFSET ?`;
        const [result] = await connection.query(queryStr, [parseInt(limit), parseInt(offset)]);
        return result;
    } catch (error) {
        throw new Error(error);
    }
} 

const list_addresses_by_conditions = async (conditionValues, selectedColumns, conditionColumns, limit = 50, offset = 0, isAll = true) => {
    try {
        if(isAll) {
            let queryStr = `SELECT ${selectedColumns.map(column => column)} FROM ${ADDRESS_TABLE_NAME} WHERE ${conditionColumns.map(column => column.logicalOperator? `${column.name}=? ${column.logicalOperator}`: `${column.name}=?`).join(' ')}`;
            const [result] = await connection.query(queryStr, conditionValues);
            return result;
        } else {
            let queryStr = `SELECT ${selectedColumns.map(column => column)} FROM ${ADDRESS_TABLE_NAME} WHERE ${conditionColumns.map(column => column.logicalOperator? `${column.name}=? ${column.logicalOperator}`: `${column.name}=?`).join(' ')} LIMIT ? OFFSET ?`;
            const [result] = await connection.query(queryStr, [...conditionValues, parseInt(limit), parseInt(offset)]);
            return result;
        }
    } catch (error) {
        throw new Error(error);
    }
}
    
const create_an_address = async (data) => {
    try {
        let valiData = await validateBeforeCreateAddress(data);
        let queryStr = `INSERT INTO ${ADDRESS_TABLE_NAME} SET 
            user_id=?,
            full_name=?,
            phone=?,
            city=?,
            district=?,
            ward=?,
            street=?,
            is_default=?`;
        const [result] = await connection.query(queryStr,[ 
            valiData.user_id,
            valiData.full_name,
            valiData.phone,
            valiData.city,
            valiData.district,
            valiData.ward,
            valiData.street,
            valiData.is_default
        ]);
        return result;
    } catch (error) {
        throw new Error(error);
    }
}
    
const update_an_address = async (columnValues, selectedColumns, conditionColumns) => {
    try {
        let queryStr = `UPDATE ${ADDRESS_TABLE_NAME} SET ${selectedColumns.map(column => column+'=?')}  WHERE ${conditionColumns.map(column => column.logicalOperator? `${column.name}=? ${column.logicalOperator}`: `${column.name}=?`).join(' ')}`
        const [result] = await connection.query(queryStr, columnValues);
        return result;
    } catch (error) {
        throw new Error(error);
    }
};

const delete_an_address = async (addressId) => {
    try {
        let queryStr = `DELETE FROM ${ADDRESS_TABLE_NAME} WHERE address_id=?`;
        const [result] = await connection.query(queryStr,[addressId]);
        return result;
    } catch (error) {
        throw error;
    }
};

export const addressModel = {
    list_all_addresses,
    list_addresses_by_conditions,
    create_an_address,
    update_an_address,
    delete_an_address,
};