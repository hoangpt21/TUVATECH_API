import { StatusCodes } from "http-status-codes"
import { productModel } from "../models/productModel"
import { recommendForUser } from "../utils/recommendation"
import ApiError from "../utils/ApiError"

const get_total_products = async () => {
    try {
        const totalProducts = await productModel.get_total_products();
        return totalProducts;
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi lấy tổng số sản phẩm");
    }
}

const list_all_products = async (selectedColumns = ['*'], limit = 50, offset = 0) => {
    try {
        const products = await productModel.list_all_products(selectedColumns, limit, offset);
        return products;
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi lấy danh sách sản phẩm");
    }
}

const get_product_by_id = async (productId, selectedColumns = ["*"]) => {
    try {
        const [product] = await productModel.list_products_by_conditions(
            [productId],
            selectedColumns,
            [{ name: "product_id" }]
        );
        if (!product) return null;
        return product;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi lấy thông tin sản phẩm");
    }
}

const get_best_seller_products = async (limit = 50, offset = 0) => {
    try {
        const bestSellerProducts = await productModel.get_best_seller_products(limit, offset);
        return bestSellerProducts;
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi lấy danh sách sản phẩm bán chạy");
    }
}

const create_a_product = async (productData) => {
    try {
        const createdProduct = await productModel.create_a_product(productData);
        const [newProduct] = await productModel.list_products_by_conditions(
            [createdProduct.insertId],
            ["*"],
            [{ name: "product_id" }]
        );
        return newProduct;
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi tạo sản phẩm mới");
    }
}

const update_a_product = async (productId, updateData) => {
    try {
        // Check if product exists
        const [existingProduct] = await productModel.list_products_by_conditions(
            [productId],
            ["product_id"], // Only check necessary field for validation
            [{ name: "product_id" }]
        );

        if (!existingProduct) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy sản phẩm");
        }

        const columnsToUpdate = Object.keys(updateData);
        const values = [...columnsToUpdate.map(key => updateData[key]), productId];
        await productModel.update_a_product(
            values,
            columnsToUpdate,
            [{ name: "product_id" }]
        );

        // Get updated product with selected columns
        const [updatedProduct] = await productModel.list_products_by_conditions(
            [productId],
            ["*"],
            [{ name: "product_id" }]
        );

        return updatedProduct;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi cập nhật sản phẩm");
    }
}

const delete_a_product = async (productId) => {
    try {
        // Check if product exists
        const [existingProduct] = await productModel.list_products_by_conditions(
            [productId],
            ["product_id"], // Only check necessary field for validation
            [{ name: "product_id" }]
        );

        if (!existingProduct) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy sản phẩm");
        }

        await productModel.delete_a_product(productId);
        return { message: "Xóa sản phẩm thành công" };
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            throw new ApiError(
                StatusCodes.CONFLICT,
                "Sản phẩm đang được sử dụng, không thể xóa!"
            );
        }
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi xóa sản phẩm");
    }
}

const filter_products = async (filters, selectedColumns = ['*'], limit = 50, offset = 0) => {
    try {
        const products = await productModel.filter_products(filters, selectedColumns, limit, offset);
        return products;
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Error filtering products");
    }
}

const get_recommendation_products = async (userId) => {
    try {
        const allProducts = await productModel.list_all_products();
        let suggestProducts = allProducts
            .filter(product => product.avg_rating > 0)
            .sort((a, b) => b.avg_rating - a.avg_rating)
            .slice(0, 4);
        if (userId !== 'popular') {
            const productIds = await recommendForUser(parseInt(userId));
            if (productIds.length > 0) {
                suggestProducts = await Promise.all(productIds.map(productId => productModel.list_products_by_conditions(productId, ['*'], [{ name: "product_id" }])));
                suggestProducts = suggestProducts?.flat()?.slice(0, 4);
            } else suggestProducts = [];
        }
        return suggestProducts;
    }   
    catch (error) {
        console.log(error);
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi lấy danh sách sản phẩm gợi ý");
    }
}

export const productService = {
    list_all_products,
    get_product_by_id,
    create_a_product,
    update_a_product,
    delete_a_product,
    get_total_products,
    filter_products,
    get_best_seller_products,
    get_recommendation_products
};