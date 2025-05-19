import express from 'express';
import { userRoute } from './userRoute';
import { fileRoute } from './fileRoute';
import { addressRoute } from './addressRoute';
import { brandRoute } from './brandRoute';
import { cartRoute } from './cartRoute';
import { categoryRoute } from './categoryRoute';
import { couponRoute } from './couponRoute';
import { newsRoute } from './newsRoute';
import { orderRoute } from './orderRoute';
import { orderItemRoute } from './orderItemRoute';
import { productRoute } from './productRoute';
import { productAttributeRoute } from './productAttributeRoute';
import { reviewRoute } from './reviewRoute';
import { userCouponRoute } from './userCouponRoute';
import { imageRoute } from './imageRoute';
import { importRoute } from './importRoute';
import { importDetailRoute } from './importDetailRoute';
import { bannerRoute } from './bannerRoute';
import { paymentRoute } from './paymentRoute';

const Router = express.Router();

Router.use('/images', imageRoute)

// User related routes
Router.use('/users', userRoute);
Router.use('/addresses', addressRoute);

// File upload route
Router.use('/cloudinary', fileRoute);

// Product related routes
Router.use('/brands', brandRoute);
Router.use('/products', productRoute);
Router.use('/product-attributes', productAttributeRoute);

// Order related routes
Router.use('/orders', orderRoute);
Router.use('/order-items', orderItemRoute);

// Shopping related routes
Router.use('/carts', cartRoute);
Router.use('/categories', categoryRoute);

// Promotion related routes
Router.use('/coupons', couponRoute);
Router.use('/user-coupons', userCouponRoute);

// Content related routes
Router.use('/news', newsRoute);
Router.use('/reviews', reviewRoute);

// Support related routes

// Inventory management routes
Router.use('/imports', importRoute);
Router.use('/import-details', importDetailRoute);

// Banner management routes
Router.use('/banners', bannerRoute);

// VNPay routes
Router.use('/payments', paymentRoute);

export const APIs_V1 = Router;