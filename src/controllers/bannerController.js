import { StatusCodes } from "http-status-codes";
import { bannerService } from "../services/bannerService";
import ApiError from "../utils/ApiError";

const list_all_banners = async (req, res, next) => {
    try {
        if(req.jwtDecoded?.role !== 'admin') next(new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền truy cập vào tài nguyên này'));
        const { select, limit, offset } = req.query;
        const selectedColumns = select ? select.split(",") : ["*"];
        const banners = await bannerService.list_all_banners(selectedColumns, limit, offset);
        res.status(StatusCodes.OK).json(banners);
    } catch (error) {
        next(error);
    }
};

const list_active_banners = async (req, res, next) => {
    try {
        const { select, limit, offset } = req.query;
        const selectedColumns = select ? select.split(",") : ["*"];
        const banners = await bannerService.list_active_banners(selectedColumns, limit, offset);
        res.status(StatusCodes.OK).json(banners);
    } catch (error) {
        next(error);
    }
};

const get_banner_by_id = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { select } = req.query;
        const selectedColumns = select ? select.split(",") : ["*"];
        const banner = await bannerService.get_banner_by_id(id, selectedColumns);
        res.status(StatusCodes.OK).json(banner);
    } catch (error) {
        next(error);
    }
};

const create_a_banner = async (req, res, next) => {
    try {
        const bannerData = req.body;
        const newBanner = await bannerService.create_a_banner(bannerData);
        res.status(StatusCodes.CREATED).json(newBanner);
    } catch (error) {
        next(error);
    }
};

const update_a_banner = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const updatedBanner = await bannerService.update_a_banner(id, updateData);
        res.status(StatusCodes.OK).json(updatedBanner);
    } catch (error) {
        next(error);
    }
};

const delete_a_banner = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await bannerService.delete_a_banner(id);
        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        next(error);
    }
};

export const bannerController = {
    list_all_banners,
    list_active_banners,
    get_banner_by_id,
    create_a_banner,
    update_a_banner,
    delete_a_banner
};