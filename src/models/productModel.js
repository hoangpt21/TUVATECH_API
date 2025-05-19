import connection from "../config/db_mysql"
import Joi from "joi";

const PRODUCT_TABLE_NAME = 'products';

const PRODUCT_TABLE_SCHEMA = Joi.object({
    category_id: Joi.number().integer().required(),
    product_name: Joi.string().max(255).required(),
    description: Joi.string().allow(null, ""),
    brand_id: Joi.number().integer().required(),
    price: Joi.number().precision(2).required(),
    selling_price: Joi.number().precision(2),
    is_active: Joi.boolean().default(true),
    created_at: Joi.date().default(new Date()),
    updated_at: Joi.date().default(new Date()),
    thumbnail: Joi.string().allow(null, ""),
    stock_quantity: Joi.number().integer().min(0).default(0),
    reserved_quantity: Joi.number().integer().min(0).default(0),
    avg_rating: Joi.number().default(0),
});

const validateBeforeCreateProduct = async (data) => {
    return await PRODUCT_TABLE_SCHEMA.validateAsync(data, {abortEarly: false});
}

const get_total_products = async () => {
    try {
        const queryStr = `SELECT COUNT(*) as total FROM ${PRODUCT_TABLE_NAME}`;
        const [result] = await connection.query(queryStr);
        return result[0].total;
    } catch (error) {
        throw new Error(error); 
    }
}


const list_all_products = async (columns = ['*'], limit = 50, offset = 0) => { 
    try {
        let queryStr = `SELECT ${columns.join(', ')} FROM ${PRODUCT_TABLE_NAME} LIMIT ? OFFSET ?`;
        const [result] = await connection.query(queryStr, [parseInt(limit), parseInt(offset)]);
        return result;
    } catch (error) {
        throw new Error(error);
    }
}

const list_products_by_conditions = async (conditionValues, selectedColumns, conditionColumns, limit = 50, offset = 0, isAll = true) => {
    try {
        if(isAll) {
            let queryStr = `SELECT ${selectedColumns.map(column => column)} FROM ${PRODUCT_TABLE_NAME} WHERE ${conditionColumns.map(column => column.logicalOperator? `${column.name}=? ${column.logicalOperator}`: `${column.name}=?`).join(' ')}`;
            const [result] = await connection.query(queryStr, conditionValues);
            return result;
        } else {
            let queryStr = `SELECT ${selectedColumns.map(column => column)} FROM ${PRODUCT_TABLE_NAME} WHERE ${conditionColumns.map(column => column.logicalOperator? `${column.name}=? ${column.logicalOperator}`: `${column.name}=?`).join(' ')} LIMIT ? OFFSET ?`;
            const [result] = await connection.query(queryStr, [...conditionValues, parseInt(limit), parseInt(offset)]);
            return result;
        }
    } catch (error) {
        throw new Error(error);
    }
}

const create_a_product = async (data) => {
    try {
        let valiData = await validateBeforeCreateProduct(data);
        let queryStr = `INSERT INTO ${PRODUCT_TABLE_NAME} SET 
            category_id=?,
            product_name=?,
            description=?,
            brand_id=?,
            price=?,
            selling_price=?,
            is_active=?,
            created_at=?,
            updated_at=?,
            thumbnail=?,
            stock_quantity=?,
            reserved_quantity=?,
            avg_rating=?`;
        const [result] = await connection.query(queryStr,[
            valiData.category_id,
            valiData.product_name,
            valiData.description,
            valiData.brand_id,
            valiData.price,
            valiData.selling_price,
            valiData.is_active,
            valiData.created_at,
            valiData.updated_at,
            valiData.thumbnail,
            valiData.stock_quantity,
            valiData.reserved_quantity,
            valiData.avg_rating
        ]);
        return result;
    } catch (error) {
        throw new Error(error);
    }
}

const update_a_product = async (columnValues, selectedColumns, conditionColumns) => {
    try {
        let queryStr = `UPDATE ${PRODUCT_TABLE_NAME} SET ${selectedColumns.map(column => column+'=?')} WHERE ${conditionColumns.map(column => column.logicalOperator? `${column.name}=? ${column.logicalOperator}`: `${column.name}=?`).join(' ')}`;
        const [result] = await connection.query(queryStr, columnValues);
        return result;
    } catch (error) {
        throw new Error(error);
    }
}

const delete_a_product = async (productId) => {
    try {
        let queryStr = `DELETE FROM ${PRODUCT_TABLE_NAME} WHERE product_id=?`;
        const [result] = await connection.query(queryStr,[productId]);
        return result;
    } catch (error) {
        throw error;
    }
}

const filter_products = async (filters, selectedColumns = ['*'], limit = 50, offset = 0) => {
    try {
        let queryStr = `SELECT ${selectedColumns.join(', ')} FROM ${PRODUCT_TABLE_NAME} WHERE is_active = 1`;
        const values = [];

        if (filters.searchKeyword) {
            queryStr += ` AND product_name LIKE ?`;
            values.push(`%${filters.searchKeyword}%`);
        }

        if (filters.categoryId) {
            queryStr += ` AND category_id = ?`;
            values.push(filters.categoryId);
        }

        if (filters.brandId) {
            queryStr += ` AND brand_id = ?`;
            values.push(filters.brandId);
        }

        if (filters.minPrice !== undefined) {
            queryStr += ` AND selling_price >= ?`;
            values.push(filters.minPrice);
        }

        if (filters.maxPrice !== undefined) {
            queryStr += ` AND selling_price <= ?`;
            values.push(filters.maxPrice);
        }

        if (filters.sortBy) {
            switch (filters.sortBy) {
                case 'price_asc':
                    queryStr += ` ORDER BY selling_price ASC`;
                    break;
                case 'price_desc':
                    queryStr += ` ORDER BY selling_price DESC`;
                    break;
                case 'created_at_desc':
                    queryStr += ` ORDER BY created_at DESC`;
                    break;
                default: queryStr += '';
            }
        }
        const [result] = await connection.query(queryStr, values);
        const total = result.length;
        return { products: result.slice(parseInt(offset), parseInt(offset) + parseInt(limit)) , total};
    } catch (error) {
        throw error;
    }
}

export const get_best_seller_products = async (limit = 50, offset = 0) => {
    try {
        // Tạo câu query để lấy sản phẩm bán chạy nhất
        let queryStr = `
            SELECT 
                p.*,
                SUM(oi.quantity) as total_sold
            FROM ${PRODUCT_TABLE_NAME} p
            INNER JOIN order_items oi ON p.product_id = oi.product_id
            INNER JOIN orders o ON oi.order_id = o.order_id
            WHERE o.payment_status = 'paid'
            GROUP BY p.product_id
            ORDER BY total_sold DESC
            LIMIT ? OFFSET ?
        `;
        const [result] = await connection.query(queryStr, [parseInt(limit), parseInt(offset)]);
        return result;
    } catch (error) {
        throw error;
    }
}

export const productModel = {
    list_all_products,
    list_products_by_conditions,
    create_a_product,
    update_a_product,
    delete_a_product,
    get_total_products,
    filter_products,
    get_best_seller_products
};