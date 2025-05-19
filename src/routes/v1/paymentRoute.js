import express from 'express';
import { authMiddleware } from '../../middlewares/authMiddleware.js';
import { paymentController } from '../../controllers/paymentController.js';
const Router = express.Router();

Router.route('/vnpay/create-qrcode')
   .post(authMiddleware.isAuthorized, paymentController.createPaymentMethodByVNPay)
Router.route('/momo/create-qrcode')
   .post(authMiddleware.isAuthorized, paymentController.createPaymentMethodByMomo)
Router.route('/check-payment')
   .get(paymentController.checkPayment)

export const paymentRoute = Router;