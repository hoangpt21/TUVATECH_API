import { StatusCodes } from "http-status-codes"
import { importDetailService } from "../services/importDetailService"

const list_all_import_details = async (req, res, next) => {
    try {
        if(req.jwtDecoded?.role !== 'admin') next(new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền truy cập vào tài nguyên này'));
        const { select, limit, offset } = req.query;
        const selectedColumns = select ? select.split(",") : ["*"];
        const result = await importDetailService.list_all_import_details(selectedColumns, limit, offset);
        res.status(StatusCodes.OK).json(result);
    } catch (error) { next(error) }
}

const get_import_detail_by_id = async (req, res, next) => {
    try {
        if(req.jwtDecoded?.role !== 'admin') next(new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền truy cập vào tài nguyên này'));
        const importDetailId = req.params.id;
        const { select } = req.query;
        const selectedColumns = select ? select.split(",") : ["*"];
        const result = await importDetailService.get_import_detail_by_id(importDetailId, selectedColumns);
        res.status(StatusCodes.OK).json(result);
    } catch (error) { next(error) }
}

const list_details_by_import = async (req, res, next) => {
    try {
        if(req.jwtDecoded?.role !== 'admin') next(new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền truy cập vào tài nguyên này'));
        const importId = req.params.importId;
        const { select, limit, offset } = req.query;
        const selectedColumns = select ? select.split(",") : ["*"];
        const result = await importDetailService.list_details_by_import(importId, selectedColumns, limit, offset);
        res.status(StatusCodes.OK).json(result);
    } catch (error) { next(error) }
}

const create_an_import_detail = async (req, res, next) => {
    try {
        if(req.jwtDecoded?.role !== 'admin') next(new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền truy cập vào tài nguyên này'));
        // Validate required fields
        const { import_id, quantity, import_price } = req.body;
        if (!import_id || !quantity || !import_price) {
            res.status(StatusCodes.BAD_REQUEST).json({
                message: "Vui lòng cung cấp đầy đủ thông tin: import_id, quantity, import_price"
            });
            return;
        }

        const result = await importDetailService.create_an_import_detail(req.body);
        res.status(StatusCodes.CREATED).json(result);
    } catch (error) { next(error) }
}

const update_an_import_detail = async (req, res, next) => {
    try {
        if(req.jwtDecoded?.role !== 'admin') next(new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền truy cập vào tài nguyên này'));
        const importDetailId = req.params.id;
        const result = await importDetailService.update_an_import_detail(importDetailId, req.body);
        res.status(StatusCodes.OK).json(result);
    } catch (error) { next(error) }
}

const delete_an_import_detail = async (req, res, next) => {
    try {
        if(req.jwtDecoded?.role !== 'admin') next(new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền truy cập vào tài nguyên này'));
        const importDetailId = req.params.id;
        const result = await importDetailService.delete_an_import_detail(importDetailId);
        res.status(StatusCodes.OK).json(result);
    } catch (error) { next(error) }
}

const delete_import_details_by_importId = async (req, res, next) => {
    try {
        if(req.jwtDecoded?.role !== 'admin') next(new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền truy cập vào tài nguyên này'));
        const importId = req.params.importId;
        const result = await importDetailService.delete_import_details_by_importId(importId);
        res.status(StatusCodes.OK).json(result);
    } catch (error) { next(error) }
}


export const importDetailController = {
    list_all_import_details,
    get_import_detail_by_id,
    list_details_by_import,
    create_an_import_detail,
    update_an_import_detail,
    delete_an_import_detail,
    delete_import_details_by_importId
};