import connection from "../config/db_mysql"
import Joi from "joi";

const NEWS_TABLE_NAME = 'news';

const NEWS_TABLE_SCHEMA = Joi.object({
    category_id: Joi.number().integer(),
    title: Joi.string().max(255).required(),
    content: Joi.string().required(),
    thumbnail: Joi.string(),
    pseudonym: Joi.string().required(),
    published_date: Joi.date().default(null),
    status: Joi.string().valid('published', 'archived').default('archived'),
    created_at: Joi.date().default(new Date()),
    updated_at: Joi.date().default(new Date()),
    likes: Joi.number().integer().default(0),
    dislikes: Joi.number().integer().default(0),
});

const validateBeforeCreateNews = async (data) => {
    return await NEWS_TABLE_SCHEMA.validateAsync(data, {abortEarly: false});
}

const list_all_news = async (columns = ['*'], limit = 50, offset = 0) => {
    try {
        let queryStr = `SELECT ${columns.join(', ')} FROM ${NEWS_TABLE_NAME} LIMIT ? OFFSET ?`;
        const [result] = await connection.query(queryStr, [parseInt(limit), parseInt(offset)]);
        return result;
    } catch (error) {
        throw new Error(error);
    }
}

const list_news_by_conditions = async (conditionValues, selectedColumns, conditionColumns, limit = 50, offset = 0, isAll = true) => {
    try {
        if(isAll) {
            let queryStr = `SELECT ${selectedColumns.map(column => column)} FROM ${NEWS_TABLE_NAME} WHERE ${conditionColumns.map(column => column.logicalOperator? `${column.name}=? ${column.logicalOperator}`: `${column.name}=?`).join(' ')}`;
            const [result] = await connection.query(queryStr, conditionValues);
            return result;
        } else {
            let queryStr = `SELECT ${selectedColumns.map(column => column)} FROM ${NEWS_TABLE_NAME} WHERE ${conditionColumns.map(column => column.logicalOperator? `${column.name}=? ${column.logicalOperator}`: `${column.name}=?`).join(' ')} LIMIT ? OFFSET ?`;
            const [result] = await connection.query(queryStr, [...conditionValues, parseInt(limit), parseInt(offset)]);
            return result;
        }
    } catch (error) {
        throw new Error(error);
    }
}

const create_a_news = async (data) => {
    try {
        let valiData = await validateBeforeCreateNews(data);
        let queryStr = `INSERT INTO ${NEWS_TABLE_NAME} SET 
            category_id=?,
            title=?,
            content=?,
            thumbnail=?,
            pseudonym=?,
            published_date=?,
            status=?,
            created_at=?,
            updated_at=?`;
        const [result] = await connection.query(queryStr,[
            valiData.category_id,
            valiData.title,
            valiData.content,
            valiData.thumbnail,
            valiData.pseudonym,
            valiData.published_date,
            valiData.status,
            valiData.created_at,
            valiData.updated_at
        ]);
        return result;
    } catch (error) {
        throw new Error(error);
    }
}

const update_a_news = async (columnValues, selectedColumns, conditionColumns) => {
    try {
        let queryStr = `UPDATE ${NEWS_TABLE_NAME} SET ${selectedColumns.map(column => column+'=?')} WHERE ${conditionColumns.map(column => column.logicalOperator? `${column.name}=? ${column.logicalOperator}`: `${column.name}=?`).join(' ')}`;
        const [result] = await connection.query(queryStr, columnValues);
        return result;
    } catch (error) {
        throw new Error(error);
    }
}

const delete_a_news = async (newsId) => {
    try {
        let queryStr = `DELETE FROM ${NEWS_TABLE_NAME} WHERE news_id=?`;
        const [result] = await connection.query(queryStr,[newsId]);
        return result;
    } catch (error) {
        throw error;
    }
}

export const newsModel = {
    list_all_news,
    list_news_by_conditions,
    create_a_news,
    update_a_news,
    delete_a_news
};