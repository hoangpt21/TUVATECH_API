import { StatusCodes } from "http-status-codes";
import { productAttributeService } from "../services/productAttributeService";
import ApiError from "../utils/ApiError";
const list_all_attributes = async (req, res, next) => {
    try {
        const { select, limit, offset } = req.query;
        const selectedColumns = select ? select.split(",") : ["*"];
        const attributes = await productAttributeService.list_all_attributes(selectedColumns, limit, offset);
        res.status(StatusCodes.OK).json(attributes);
    } catch (error) {
        next(error);
    }
};

const get_attribute_by_id = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { select } = req.query;
        const selectedColumns = select ? select.split(",") : ["*"];
        const attribute = await productAttributeService.get_attribute_by_id(id, selectedColumns);
        res.status(StatusCodes.OK).json(attribute);
    } catch (error) {
        next(error);
    }
};

const get_attributes_by_productId = async (req, res, next) => {
    try {   
        const { productId } = req.params;
        const { select, limit, offset } = req.query;
        const selectedColumns = select ? select.split(",") : ["*"];
        const attributes = await productAttributeService.get_attributes_by_productId(productId, selectedColumns, limit, offset);
        res.status(StatusCodes.OK).json(attributes);
    } catch (error) {
        next(error);
    }
};

const create_an_attribute = async (req, res, next) => {
    try {
        if(req.jwtDecoded.role !== 'admin') next(new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền truy cập vào tài nguyên này'));
        const attributeData = req.body;
        const newAttribute = await productAttributeService.create_an_attribute(attributeData);
        res.status(StatusCodes.CREATED).json(newAttribute);
    } catch (error) {
        next(error);
    }
};

const update_an_attribute = async (req, res, next) => {
    try {
        if(req.jwtDecoded.role !== 'admin') next(new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền truy cập vào tài nguyên này'));
        const { id } = req.params;
        const updateData = req.body;
        const updatedAttribute = await productAttributeService.update_an_attribute(id, updateData);
        res.status(StatusCodes.OK).json(updatedAttribute);
    } catch (error) {
        next(error);
    }
};

const delete_an_attribute = async (req, res, next) => {
    try {
        if(req.jwtDecoded.role !== 'admin') next(new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền truy cập vào tài nguyên này'));
        const { id } = req.params;
        const result = await productAttributeService.delete_an_attribute(id);
        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        next(error);
    }
};

const delete_attributes_by_productId = async (req, res, next) => {
    try {
        if(req.jwtDecoded.role !== 'admin') next(new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền truy cập vào tài nguyên này'));
        const { productId } = req.params;
        const result = await productAttributeService.delete_attributes_by_productId(productId);
        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        next(error);
    }
};

export const productAttributeController = {
    list_all_attributes,
    get_attribute_by_id,
    get_attributes_by_productId,
    create_an_attribute,
    update_an_attribute,
    delete_an_attribute,
    delete_attributes_by_productId
};