import { StatusCodes } from "http-status-codes";
import { brandService } from "../services/brandService";
import ApiError from "../utils/ApiError";
const list_all_brands = async (req, res, next) => {
    try {
        if(req.jwtDecoded?.role !== 'admin') next(new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền truy cập vào tài nguyên này'));
        const { select, limit, offset } = req.query;
        const selectedColumns = select ? select.split(",") : ["*"];
        const brands = await brandService.list_all_brands(selectedColumns, limit, offset);
        res.status(StatusCodes.OK).json(brands);
    } catch (error) {
        next(error);
    }
};

const list_active_brands = async (req, res, next) => {
    try {
        const { select, limit, offset } = req.query;
        const selectedColumns = select ? select.split(",") : ["*"];
        const brands = await brandService.list_active_brands(selectedColumns, limit, offset);
        res.status(StatusCodes.OK).json(brands);
    } catch (error) {
        next(error);
    }
};

const get_brand_by_id = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { select } = req.query;
        const selectedColumns = select ? select.split(",") : ["*"];
        const brand = await brandService.get_brand_by_id(id, selectedColumns);
        res.status(StatusCodes.OK).json(brand);
    } catch (error) {
        next(error);
    }
};

const create_a_brand = async (req, res, next) => {
    try {
        const brandData = req.body;
        const newBrand = await brandService.create_a_brand(brandData);
        res.status(StatusCodes.CREATED).json(newBrand);
    } catch (error) {
        next(error);
    }
};

const update_a_brand = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const updatedBrand = await brandService.update_a_brand(id, updateData);
        res.status(StatusCodes.OK).json(updatedBrand);
    } catch (error) {
        next(error);
    }
};

const delete_a_brand = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await brandService.delete_a_brand(id);
        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        next(error);
    }
};

export const brandController = {
    list_all_brands,
    list_active_brands,
    get_brand_by_id,
    create_a_brand,
    update_a_brand,
    delete_a_brand
};