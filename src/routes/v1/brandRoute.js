import express from 'express';
import { brandController } from '../../controllers/brandController';
import { authMiddleware } from '../../middlewares/authMiddleware.js';
const Router = express.Router();

//Brand routes
Router.route('/active')
    .get(brandController.list_active_brands);

Router.route('/')
    .get(authMiddleware.isAuthorized, brandController.list_all_brands)
    .post(authMiddleware.isAuthorized, brandController.create_a_brand);

Router.route('/:id')
    .get(brandController.get_brand_by_id)
    .put(authMiddleware.isAuthorized, brandController.update_a_brand)
    .delete(authMiddleware.isAuthorized, brandController.delete_a_brand);

export const brandRoute = Router;