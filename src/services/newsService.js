import { StatusCodes } from "http-status-codes"
import { newsModel } from "../models/newsModel"
import ApiError from "../utils/ApiError"

const list_all_news = async (selectedColumns = ['*'], limit = 50, offset = 0) => {
    try {
        const news = await newsModel.list_all_news(selectedColumns, limit, offset);
        return news;
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi lấy danh sách tin tức");
    }
}

const list_active_news = async (selectedColumns = ["*"], limit = 50, offset = 0) => {
    try {
        const news = await newsModel.list_news_by_conditions(
            ["published"],
            selectedColumns,
            [{name: "status"}],
            limit,
            offset,
            false
        );
        return news;
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi lấy danh sách tin tức");
    }
}

const get_news_by_id = async (newsId, selectedColumns = ["*"]) => {
    try {
        const [news] = await newsModel.list_news_by_conditions(
            [newsId],
            selectedColumns,
            [{ name: "news_id" }]
        );

        if (!news) return null;

        return news;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi lấy thông tin tin tức");
    }
}

const create_a_news = async (newsData) => {
    try {
        const createdNews = await newsModel.create_a_news(newsData);
        const [newNews] = await newsModel.list_news_by_conditions(
            [createdNews.insertId],
            ["*"],
            [{ name: "news_id" }]
        );
        return newNews;
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi tạo tin tức mới");
    }
}

const update_a_news = async (newsId, updateData) => {
    try {
        const [existingNews] = await newsModel.list_news_by_conditions(
            [newsId],
            ["news_id"], // Only check necessary fields for validation
            [{ name: "news_id" }]
        );

        if (!existingNews) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy tin tức hoặc bạn không có quyền chỉnh sửa");
        }

        const columnsToUpdate = Object.keys(updateData);
        const values = [...columnsToUpdate.map(key => updateData[key]), newsId];
        await newsModel.update_a_news(
            values,
            columnsToUpdate,
            [{ name: "news_id" }]
        );

        const [updatedNews] = await newsModel.list_news_by_conditions(
            [newsId],
            ["*"],
            [{ name: "news_id" }]
        );

        return updatedNews;
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi cập nhật tin tức");
    }
}

const delete_a_news = async (newsId) => {
    try {
        const [existingNews] = await newsModel.list_news_by_conditions(
            [newsId],
            ["news_id"], // Only check necessary field for validation
            [{ name: "news_id" }]
        );

        if (!existingNews) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy tin tức hoặc bạn không có quyền xóa");
        }

        await newsModel.delete_a_news(newsId);
        return { message: "Xóa tin tức thành công" };
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            throw new ApiError(
                StatusCodes.CONFLICT,
                "Tin tức đang được sử dụng, không thể xóa!"
            );
        }
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi xóa tin tức");
    }
}

export const newsService = {
    list_all_news,
    list_active_news,
    get_news_by_id,
    create_a_news,
    update_a_news,
    delete_a_news
};