import express from 'express';
import { importDetailController } from '../../controllers/importDetailController';
import { authMiddleware } from '../../middlewares/authMiddleware.js';
const Router = express.Router();

Router.route('/')
    .get(authMiddleware.isAuthorized, importDetailController.list_all_import_details)
    .post(authMiddleware.isAuthorized, importDetailController.create_an_import_detail);

Router.route('/import/:importId')
    .get(authMiddleware.isAuthorized, importDetailController.list_details_by_import)
    .delete(authMiddleware.isAuthorized, importDetailController.delete_import_details_by_importId);

Router.route('/:id')
    .get(authMiddleware.isAuthorized, importDetailController.get_import_detail_by_id)
    .put(authMiddleware.isAuthorized, importDetailController.update_an_import_detail)
    .delete(authMiddleware.isAuthorized, importDetailController.delete_an_import_detail);

export const importDetailRoute = Router;