import express from 'express';
import { userCouponController } from '../../controllers/userCouponController';
import { authMiddleware } from '../../middlewares/authMiddleware';

const Router = express.Router();

Router.route('/')
    .get(authMiddleware.isAuthorized, userCouponController.list_all_user_coupons)
    .post(authMiddleware.isAuthorized, userCouponController.create_a_user_coupon);

Router.route('/user')
    .get(authMiddleware.isAuthorized, userCouponController.get_user_coupons);

Router.route('/:couponId')
    .get(authMiddleware.isAuthorized, userCouponController.get_specific_user_coupon)
    .put(authMiddleware.isAuthorized, userCouponController.update_user_coupon)
    .delete(authMiddleware.isAuthorized, userCouponController.delete_a_user_coupon);

export const userCouponRoute = Router;