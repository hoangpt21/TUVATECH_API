import { StatusCodes } from "http-status-codes";
import { reviewService } from "../services/reviewService";

const list_all_reviews = async (req, res, next) => {
    try {
        if(req.jwtDecoded?.role !== 'admin') next(new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền truy cập vào tài nguyên này'));
        const { select, limit, offset } = req.query;
        const selectedColumns = select ? select.split(",") : ["*"];
        const reviews = await reviewService.list_all_reviews(selectedColumns, limit, offset);
        res.status(StatusCodes.OK).json(reviews);
    } catch (error) {
        next(error);
    }
};

const get_reviews_by_product = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const { select, limit, offset } = req.query;
        const selectedColumns = select ? select.split(",") : ["*"];
        const reviews = await reviewService.get_reviews_by_product(productId, selectedColumns, limit, offset);
        res.status(StatusCodes.OK).json(reviews);
    } catch (error) {
        next(error);
    }
};

const get_reviews_by_user = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { select, limit, offset } = req.query;
        const selectedColumns = select ? select.split(",") : ["*"];
        const reviews = await reviewService.get_reviews_by_user(userId, selectedColumns, limit, offset);
        res.status(StatusCodes.OK).json(reviews);
    } catch (error) {
        next(error);
    }
};

const create_a_review = async (req, res, next) => {
    try {
        const reviewData = {
            ...req.body,
            user_id: req.jwtDecoded?.user_id
        };
        const newReview = await reviewService.create_a_review(reviewData);
        res.status(StatusCodes.CREATED).json(newReview);
    } catch (error) {
        next(error);
    }
};

const update_a_review = async (req, res, next) => {
    try {
        const { reviewId } = req.params
        const updateData = req.body;
        const updatedReview = await reviewService.update_a_review(
            parseInt(reviewId),
            updateData
        );
        res.status(StatusCodes.OK).json(updatedReview);
    } catch (error) {
        next(error);
    }
};

const delete_a_review = async (req, res, next) => {
    try {
        const { reviewId } = req.params;
        const result = await reviewService.delete_a_review(reviewId);
        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        next(error);
    }
};

export const reviewController = {
    list_all_reviews,
    get_reviews_by_product,
    get_reviews_by_user,
    create_a_review,
    update_a_review,
    delete_a_review
};