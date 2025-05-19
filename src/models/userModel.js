import connection from "../config/db_mysql"
import Joi from "joi";
const USER_TABLE_NAME = 'users';
const USER_ROLES = {
    USER: 'client',
    ADMIN: 'admin'
}
const USER_TABLE_SCHEMA = Joi.object({
    display_name: Joi.string().max(100).required(),
    user_name: Joi.string().max(100).required(),
    avatar_url: Joi.string().default(null),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(255).required(),
    phone: Joi.string(),
    gender: Joi.string().valid("Nam", "Nữ", "").default(""),
    verify_token: Joi.string(),
    birthday: Joi.date().optional(),
    role: Joi.string().valid(USER_ROLES.USER, USER_ROLES.ADMIN).default(USER_ROLES.USER),
    is_active: Joi.boolean().default(false),
    otp: Joi.string().allow(null, ''),
    created_at: Joi.date().default(new Date()),
    updated_at: Joi.date().default(new Date()),
})

const validateBeforeCreate = async (data) => {
    return await USER_TABLE_SCHEMA.validateAsync(data, {abortEarly: false});
}
    
const get_total_users = async () => {
    try {
        const queryStr = `SELECT COUNT(*) as total FROM ${USER_TABLE_NAME} WHERE role = ?`;
        const [result] = await connection.query(queryStr, [USER_ROLES.USER]);
        return result[0].total;
    } catch (error) {
        throw new Error(error);
    }
}

const list_all_users = async (columns = ['*'], limit = 50, offset = 0) => {
    try {
        let queryStr = `SELECT ${columns.join(', ')} FROM ${USER_TABLE_NAME} LIMIT ? OFFSET ?`;
        const [result] = await connection.query(queryStr, [parseInt(limit), parseInt(offset)]);
        return result;
    } catch (error) {
        throw new Error(error);
    }
} 

const list_users_by_conditions = async (conditionValues, selectedColumns, conditionColumns, limit = 50, offset = 0, isAll = true) => {
    try {
        if(isAll) {
            let queryStr = `SELECT ${selectedColumns.map(column => column)} FROM ${USER_TABLE_NAME} WHERE ${conditionColumns.map(column => column.logicalOperator? `${column.name}=? ${column.logicalOperator}`: `${column.name}=?`).join(' ')}`;
            const [result] = await connection.query(queryStr, conditionValues);
            return result;
        } else {
            let queryStr = `SELECT ${selectedColumns.map(column => column)} FROM ${USER_TABLE_NAME} WHERE ${conditionColumns.map(column => column.logicalOperator? `${column.name}=? ${column.logicalOperator}`: `${column.name}=?`).join(' ')} LIMIT ? OFFSET ?`;
            const [result] = await connection.query(queryStr, [...conditionValues, parseInt(limit), parseInt(offset)]);
            return result;
        }
    } catch (error) {
        throw new Error(error);
    }
    
}
    
const create_a_user = async (data) => {
    try {
        let valiData = await validateBeforeCreate(data);
        let queryStr = `INSERT INTO ${USER_TABLE_NAME} SET display_name=?, user_name=?, avatar_url=?, email=?, password=?, phone=?, gender=?, verify_token=?, birthday=?, created_at=?, updated_at=?, role=?, is_active=?`;
        const [result] = await connection.query(queryStr,[ valiData.display_name, valiData.user_name, valiData.avatar_url, valiData.email, valiData.password,valiData.phone, valiData.gender, valiData.verify_token, valiData.birthday, valiData.created_at, valiData.updated_at, valiData.role, valiData.is_active]);
        return result;
    } catch (error) {
        throw new Error(error);
    }
   
}
    
const update_a_user = async (columnValues, selectedColumns, conditionColumns) => {
    try {
        let queryStr = `UPDATE ${USER_TABLE_NAME} SET ${selectedColumns.map(column => column+'=?')}  WHERE ${conditionColumns.map(column => column.logicalOperator? `${column.name}=? ${column.logicalOperator}`: `${column.name}=?`).join(' ')}`
        const [result] = await connection.query(queryStr, columnValues);
        return result;
    } catch (error) {
        throw new Error(error);
    }
};

const delete_a_user = async (userId) => {
    try {
        let queryStr = `DELETE FROM ${USER_TABLE_NAME} WHERE userId=?`;
        const [result] = await connection.query(queryStr,[userId]);
        return result;
    } catch (error) {
        throw error;
    }
    
};

export const userModel = {
    list_all_users,
    list_users_by_conditions,
    create_a_user,
    update_a_user,
    delete_a_user,
    get_total_users,
};