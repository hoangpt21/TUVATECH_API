import express from 'express';
import { orderItemController } from '../../controllers/orderItemController';
import { authMiddleware } from '../../middlewares/authMiddleware';

const Router = express.Router();

Router.route('/')
    .get(authMiddleware.isAuthorized, orderItemController.list_all_order_items)
    .post(authMiddleware.isAuthorized, orderItemController.create_an_order_item);

Router.route('/order/:orderId')
    .get(authMiddleware.isAuthorized, orderItemController.get_order_items_by_orderId)
    .delete(authMiddleware.isAuthorized, orderItemController.delete_order_items_by_orderId); // Corrected controller function name

Router.route('/:orderItemId')
    .get(authMiddleware.isAuthorized, orderItemController.get_order_item_by_id)
    .put(authMiddleware.isAuthorized, orderItemController.update_an_order_item)
    .delete(authMiddleware.isAuthorized, orderItemController.delete_an_order_item);

export const orderItemRoute = Router;