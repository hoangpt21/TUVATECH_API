import express from 'express';
import { bannerController } from '../../controllers/bannerController';
import { authMiddleware } from '../../middlewares/authMiddleware.js';
const Router = express.Router();

//Banner routes
Router.route('/active')
    .get(bannerController.list_active_banners);

Router.route('/')
    .get(authMiddleware.isAuthorized, bannerController.list_all_banners)
    .post(authMiddleware.isAuthorized, bannerController.create_a_banner);

Router.route('/:id')
    .get(authMiddleware.isAuthorized, bannerController.get_banner_by_id)
    .put(authMiddleware.isAuthorized, bannerController.update_a_banner)
    .delete(authMiddleware.isAuthorized, bannerController.delete_a_banner);

export const bannerRoute = Router;