import express from 'express';
import { cartController } from '../../controllers/cartController';
import { authMiddleware } from '../../middlewares/authMiddleware';

const Router = express.Router();

Router.route('/')
    .get(authMiddleware.isAuthorized, cartController.list_all_carts)
    .post(authMiddleware.isAuthorized, cartController.add_to_cart);
    
Router.route('/user/clear')
    .delete(authMiddleware.isAuthorized, cartController.clear_cart);

Router.route('/user')
    .get(authMiddleware.isAuthorized, cartController.get_user_cart);

Router.route('/:productId')
    .delete(authMiddleware.isAuthorized, cartController.remove_from_cart);
export const cartRoute = Router;