import express from 'express';
import { productController } from '../../controllers/productController';
import { authMiddleware } from '../../middlewares/authMiddleware';

const Router = express.Router();

Router.route('/total')
    .get(authMiddleware.isAuthorized, productController.get_total_products);

Router.route('/')
    .get(authMiddleware.isAuthorized, productController.list_all_products)
    .post(authMiddleware.isAuthorized, productController.create_a_product);

Router.route('/active/filter')
    .get(productController.filter_products);

Router.route('/active/best_seller')
   .get(productController.get_best_seller_products);

Router.route('/:id')
    .get(productController.get_product_by_id)
    .put(authMiddleware.isAuthorized, productController.update_a_product)
    .delete(authMiddleware.isAuthorized, productController.delete_a_product);

Router.route('/recommendation/:userId')
   .get(productController.get_recommendation_products);
export const productRoute = Router;