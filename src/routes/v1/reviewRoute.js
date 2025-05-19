import express from 'express';
import { reviewController } from '../../controllers/reviewController';
import { authMiddleware } from '../../middlewares/authMiddleware';

const Router = express.Router();

Router.route('/')
    .get(authMiddleware.isAuthorized, reviewController.list_all_reviews)
    .post(authMiddleware.isAuthorized, reviewController.create_a_review);

Router.route('/product/:productId')
    .get(reviewController.get_reviews_by_product);
Router.route('/user/:userId')
    .get(reviewController.get_reviews_by_user);

Router.route('/:reviewId')
    .put(authMiddleware.isAuthorized, reviewController.update_a_review)
    .delete(authMiddleware.isAuthorized, reviewController.delete_a_review);


export const reviewRoute = Router;