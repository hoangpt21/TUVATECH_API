import { StatusCodes } from "http-status-codes";
import { newsService } from "../services/newsService";
import ApiError from "../utils/ApiError";

const list_all_news = async (req, res, next) => {
    try {
        if(req.jwtDecoded?.role !== 'admin') next(new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền truy cập vào tài nguyên này'));
        const { select, limit, offset } = req.query;
        const selectedColumns = select ? select.split(",") : ["*"];
        const news = await newsService.list_all_news(selectedColumns, limit, offset);
        res.status(StatusCodes.OK).json(news);
    } catch (error) {
        next(error);
    }
};

const list_active_news = async (req, res, next) => {
    try {
        const { select, limit, offset } = req.query;
        const selectedColumns = select ? select.split(",") : ["*"];
        const news = await newsService.list_active_news(selectedColumns, limit, offset);
        res.status(StatusCodes.OK).json(news);
    } catch (error) {
        next(error);
    }
};

const get_news_by_id = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { select } = req.query;
        const selectedColumns = select ? select.split(",") : ["*"];
        const news = await newsService.get_news_by_id(id, selectedColumns);
        res.status(StatusCodes.OK).json(news);
    } catch (error) {
        next(error);
    }
};

const create_a_news = async (req, res, next) => {
    try {
        if(req.jwtDecoded?.role !== 'admin') next(new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền truy cập vào tài nguyên này'));
        const newsData = req.body;
        const newNews = await newsService.create_a_news(newsData);
        res.status(StatusCodes.CREATED).json(newNews);
    } catch (error) {
        next(error);
    }
};

const update_a_news = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const updatedNews = await newsService.update_a_news(id, updateData);
        res.status(StatusCodes.OK).json(updatedNews);
    } catch (error) {
        next(error);
    }
};

const delete_a_news = async (req, res, next) => {
    try {
        if(req.jwtDecoded?.role!== 'admin') next(new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền truy cập vào tài nguyên này'));
        const { id } = req.params;
        const result = await newsService.delete_a_news(id);
        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        next(error);
    }
};

export const newsController = {
    list_all_news,
    list_active_news,
    get_news_by_id,
    create_a_news,
    update_a_news,
    delete_a_news
};