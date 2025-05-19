import { StatusCodes } from "http-status-codes"
import { reviewModel } from "../models/reviewModel"
import ApiError from "../utils/ApiError"

const list_all_reviews = async (selectedColumns = ['*'], limit = 50, offset = 0) => {
    try {   
        const reviews = await reviewModel.list_all_reviews(selectedColumns, limit, offset);
        return reviews;
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi lấy danh sách đánh giá");
    }
}

const get_reviews_by_product = async (productId, selectedColumns = ["*"], limit = 50, offset = 0) => {
    try {
        const reviews = await reviewModel.list_reviews_by_conditions(
            [productId, 'approved'],
            selectedColumns,
            [{ name: "product_id", logicalOperator: 'AND' }, {name: 'moderation_status'}],
            limit,
            offset,
            false
        );
        return reviews;
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi lấy đánh giá của sản phẩm");
    }
}

const get_reviews_by_user = async (userId, selectedColumns = ["*"], limit = 50, offset = 0) => {
    try {
        const reviews = await reviewModel.list_reviews_by_conditions(
            [userId],
            selectedColumns,
            [{ name: "user_id" }],
            limit,
            offset,
            false
        );
        return reviews;
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi lấy đánh giá của người dùng");
    }
}

const create_a_review = async (reviewData) => {
    try {

        const createdReview = await reviewModel.create_a_review(reviewData);
        const [newReview] = await reviewModel.list_reviews_by_conditions(
            [createdReview.insertId],
            ["*"],
            [
                { name: "review_id"}
            ]
        );
        return newReview;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi tạo đánh giá mới");
    }
}

const update_a_review = async (reviewId, updateData) => {
    try {
        const [existingReview] = await reviewModel.list_reviews_by_conditions(
            [reviewId],
            ["review_id"],
            [
                { name: "review_id"}
            ]
        );
        if (!existingReview) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy đánh giá này!");
        }
        const columnsToUpdate = Object.keys(updateData);
        const values = [...columnsToUpdate.map(key => updateData[key]), reviewId];
        await reviewModel.update_a_review(
            values,
            columnsToUpdate,
            [ { name: "review_id"}]
        );

        const [updatedReview] = await reviewModel.list_reviews_by_conditions(
            [reviewId],
            ["*"],
            [{ name: "review_id"}]
        );

        return updatedReview;
    } catch (error) {
        console.error(error); // Log the error t
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi cập nhật đánh giá");
    }
}

const delete_a_review = async (reviewId) => {
    try {
        const [existingReview] = await reviewModel.list_reviews_by_conditions(
            [reviewId],
            ["review_id"],
            [
                { name: "review_id"}
            ]
        );

        if (!existingReview) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy đánh giá này!");
        }

        await reviewModel.delete_a_review(reviewId);
        return { message: "Xóa đánh giá thành công" };
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            throw new ApiError(
                StatusCodes.CONFLICT,
                "Đánh giá đang được sử dụng, không thể xóa!"
            );
        }
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi xóa đánh giá");
    }
}

export const reviewService = {
    list_all_reviews,
    get_reviews_by_product,
    get_reviews_by_user,
    create_a_review,
    update_a_review,
    delete_a_review
};