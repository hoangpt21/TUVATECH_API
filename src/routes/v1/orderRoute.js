import express from 'express';
import { orderController } from '../../controllers/orderController';
import { authMiddleware } from '../../middlewares/authMiddleware';

const Router = express.Router();

Router.route('/')
    .get(authMiddleware.isAuthorized, orderController.list_all_orders)
    .post(authMiddleware.isAuthorized, orderController.create_an_order);

Router.route('/user')
    .get(authMiddleware.isAuthorized, orderController.get_orders_by_user);

Router.route('/:id')
    .get(authMiddleware.isAuthorized, orderController.get_order_by_id)
    .put(authMiddleware.isAuthorized, orderController.update_an_order)
    .delete(authMiddleware.isAuthorized, orderController.delete_an_order);

Router.route('/:id/status')
    .put(authMiddleware.isAuthorized, orderController.update_order_status);

export const orderRoute = Router;