import express from 'express';
import { couponController } from '../../controllers/couponController';
import { authMiddleware } from '../../middlewares/authMiddleware';

const Router = express.Router();

Router.route('/active')
    .get(couponController.list_active_coupons);
Router.route('/active/code/:code')
    .get(couponController.get_active_coupons_by_code);

Router.route('/')
    .get(authMiddleware.isAuthorized, couponController.list_all_coupons)
    .post(authMiddleware.isAuthorized, couponController.create_a_coupon);

Router.route('/:id')
    .get(authMiddleware.isAuthorized, couponController.get_coupon_by_id)
    .put(authMiddleware.isAuthorized, couponController.update_a_coupon)
    .delete(authMiddleware.isAuthorized, couponController.delete_a_coupon);

Router.route('/code/:code')
    .get(authMiddleware.isAuthorized, couponController.get_coupon_by_code);

export const couponRoute = Router;