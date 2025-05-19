import { StatusCodes } from "http-status-codes";
import { categoryService } from "../services/categoryService";
import ApiError from "../utils/ApiError";

const list_all_categories = async (req, res, next) => {
    try {
        if(req.jwtDecoded?.role !== 'admin') next(new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền truy cập vào tài nguyên này'));
        const { select, limit, offset } = req.query;
        const selectedColumns = select ? select.split(",") : ["*"];
        const categories = await categoryService.list_all_categories(selectedColumns, limit, offset);
        res.status(StatusCodes.OK).json(categories);
    } catch (error) {
        next(error);
    }
};

const list_active_categories = async (req, res, next) => {
    try {
        const { select, limit, offset } = req.query;
        const selectedColumns = select ? select.split(",") : ["*"];
        const categories = await categoryService.list_active_categories(selectedColumns, limit, offset);
        res.status(StatusCodes.OK).json(categories);
    } catch (error) {
        next(error);
    }
};

const get_categories_by_type = async (req, res, next) => {
    try {
        const { categoryType } = req.params;
        const { select, limit, offset } = req.query;
        const selectedColumns = select ? select.split(",") : ["*"]; 
        const categories = await categoryService.get_categories_by_type(categoryType, selectedColumns, limit, offset);
        res.status(StatusCodes.OK).json(categories);
    } catch (error) {
        next(error);
    }
};

const get_active_categories_by_type = async (req, res, next) => {
    try {
        const { categoryType } = req.params;
        const { select, limit, offset } = req.query;
        const selectedColumns = select ? select.split(",") : ["*"]; 
        const categories = await categoryService.get_active_categories_by_type(categoryType, selectedColumns, limit, offset);
        res.status(StatusCodes.OK).json(categories);
    } catch (error) {
        next(error);
    }
};

const get_category_by_id = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { select } = req.query;
        const selectedColumns = select ? select.split(",") : ["*"];
        const category = await categoryService.get_category_by_id(id, selectedColumns);
        res.status(StatusCodes.OK).json(category);
    } catch (error) {
        next(error);
    }
};

const create_a_category = async (req, res, next) => {
    try {
        if(req.jwtDecoded?.role !== 'admin') next(new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền truy cập vào tài nguyên này'));
        const categoryData = req.body;
        const newCategory = await categoryService.create_a_category(categoryData);
        res.status(StatusCodes.CREATED).json(newCategory);
    } catch (error) {
        next(error);
    }
};

const update_a_category = async (req, res, next) => {
    try {
        if(req.jwtDecoded?.role !== 'admin') next(new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền truy cập vào tài nguyên này'));
        const { id } = req.params;
        const updateData = req.body;
        const updatedCategory = await categoryService.update_a_category(id, updateData);
        res.status(StatusCodes.OK).json(updatedCategory);
    } catch (error) {
        next(error);
    }
};

const delete_a_category = async (req, res, next) => {
    try {
        if(req.jwtDecoded?.role !== 'admin') next(new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền truy cập vào tài nguyên này'));
        const { id } = req.params;
        const result = await categoryService.delete_a_category(id);
        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        next(error);
    }
};

export const categoryController = {
    list_all_categories,
    list_active_categories,
    get_categories_by_type,
    get_active_categories_by_type,
    get_category_by_id,
    create_a_category,
    update_a_category,
    delete_a_category
};