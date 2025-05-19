import { StatusCodes } from "http-status-codes";
import { productService } from "../services/productService";
import ApiError from "../utils/ApiError";

const get_total_products = async (req, res, next) => {
    try {
        if(req.jwtDecoded?.role !== 'admin') next(new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền truy cập vào tài nguyên này'));
        const totalProducts = await productService.get_total_products();
        res.status(StatusCodes.OK).json(totalProducts);
    } catch (error) {
        next(error);
    }
};

const list_all_products = async (req, res, next) => {
    try {
        if(req.jwtDecoded?.role !== 'admin') next(new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền truy cập vào tài nguyên này'));
        const { select } = req.query;
        const selectedColumns = select ? select.split(",") : ["*"];
        const { limit, offset } = req.query;
        const products = await productService.list_all_products(selectedColumns, limit, offset);
        res.status(StatusCodes.OK).json(products);
    } catch (error) {
        next(error);
    }
};

const get_product_by_id = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { select } = req.query;
        const selectedColumns = select? select.split(",") : ["*"];
        const product = await productService.get_product_by_id(id, selectedColumns);
        res.status(StatusCodes.OK).json(product);
    } catch (error) {
        next(error);
    }
};

const get_best_seller_products = async (req, res, next) => {
    try {
        const { limit, offset } = req.query;
        const products = await productService.get_best_seller_products(limit, offset);
        res.status(StatusCodes.OK).json(products);
    } catch (error) {
        next(error);
    }
}

const create_a_product = async (req, res, next) => {
    try {
        if(req.jwtDecoded?.role !== 'admin') next(new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền truy cập vào tài nguyên này'));
        const productData = req.body;
        const newProduct = await productService.create_a_product(productData);
        res.status(StatusCodes.CREATED).json(newProduct);
    } catch (error) {
        next(error);
    }
};

const update_a_product = async (req, res, next) => {
    try {
        if(req.jwtDecoded?.role !== 'admin') next(new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền truy cập vào tài nguyên này'));
        const { id } = req.params;
        const updateData = req.body;
        const updatedProduct = await productService.update_a_product(id, updateData);
        res.status(StatusCodes.OK).json(updatedProduct);
    } catch (error) {
        next(error);
    }
};

const delete_a_product = async (req, res, next) => {
    try {
        if(req.jwtDecoded?.role !== 'admin') next(new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền truy cập vào tài nguyên này'));
        const { id } = req.params;
        const result = await productService.delete_a_product(id);
        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        next(error);
    }
};

const filter_products = async (req, res, next) => {
    try {
        const select = req.query?.select;
        const searchKeyword = req.query?.sKw;
        const categoryId = req.query?.ctgId;
        const brandId = req.query?.brId;
        const minPrice = req.query?.minP;
        const maxPrice = req.query?.maxP;
        const sortBy = req.query?.srt;
        const limit = req.query?.limit;
        const offset = req.query?.offset;
        const selectedColumns = select ? select.split(",") : ["*"];
        const filters = {
            searchKeyword,
            categoryId,
            brandId,
            minPrice: minPrice ? parseFloat(minPrice) : undefined,
            maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
            sortBy,
        };

        const products = await productService.filter_products(
            filters,
            selectedColumns,
            limit,
            offset
        );
        res.status(StatusCodes.OK).json(products);
    } catch (error) {
        next(error);
    }
};

const get_recommendation_products = async (req, res, next) => {
    try {
        const userId = req.params?.userId;
        const products = await productService.get_recommendation_products(userId);
        res.status(StatusCodes.OK).json(products);
    }   
    catch (error) {
        next(error);
    }
}

export const productController = {
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