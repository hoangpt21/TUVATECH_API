import { StatusCodes } from "http-status-codes"
import { importService } from "../services/importService"

const list_all_imports = async (req, res, next) => {
    try {
        if(req.jwtDecoded?.role !== 'admin') next(new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền truy cập vào tài nguyên này'));
        const { select, limit, offset } = req.query;
        const selectedColumns = select ? select.split(",") : ["*"];
        const result = await importService.list_all_imports(selectedColumns, limit, offset);
        res.status(StatusCodes.OK).json(result);
    } catch (error) { next(error) }
}

const get_import_by_id = async (req, res, next) => {
    try {
        if(req.jwtDecoded?.role !== 'admin') next(new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền truy cập vào tài nguyên này'));
        const importId = req.params.id;
        const { select } = req.query;
        const selectedColumns = select ? select.split(",") : ["*"];
        const result = await importService.get_import_by_id(importId, selectedColumns);
        res.status(StatusCodes.OK).json(result);
    } catch (error) { next(error) }
}

const create_an_import = async (req, res, next) => {
    try {
        if(req.jwtDecoded?.role !== 'admin') next(new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền truy cập vào tài nguyên này'));
        const result = await importService.create_an_import(req.body);
        res.status(StatusCodes.CREATED).json(result);
    } catch (error) { next(error) }
}

const update_an_import = async (req, res, next) => {
    try {
        if(req.jwtDecoded?.role !== 'admin') next(new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền truy cập vào tài nguyên này'));
        const importId = req.params.id;
        const result = await importService.update_an_import(importId, req.body);
        res.status(StatusCodes.OK).json(result);
    } catch (error) { next(error) }
}

const delete_an_import = async (req, res, next) => {
    try {
        if(req.jwtDecoded?.role !== 'admin') next(new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền truy cập vào tài nguyên này'));
        const importId = req.params.id;
        const result = await importService.delete_an_import(importId);
        res.status(StatusCodes.OK).json(result);
    } catch (error) { next(error) }
}

export const importController = {
    list_all_imports,
    get_import_by_id,
    create_an_import,
    update_an_import,
    delete_an_import
};