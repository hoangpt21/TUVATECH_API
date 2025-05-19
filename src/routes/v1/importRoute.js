import express from 'express';
import { importController } from '../../controllers/importController';
import { authMiddleware } from '../../middlewares/authMiddleware.js';
const Router = express.Router();

Router.route('/')
    .get(authMiddleware.isAuthorized, importController.list_all_imports)
    .post(authMiddleware.isAuthorized, importController.create_an_import);
Router.route('/:id')
    .get(authMiddleware.isAuthorized, importController.get_import_by_id)
    .put(authMiddleware.isAuthorized, importController.update_an_import)
    .delete(authMiddleware.isAuthorized, importController.delete_an_import);

export const importRoute = Router;