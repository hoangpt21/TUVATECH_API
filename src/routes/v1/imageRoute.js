import express from 'express';
import { imageController } from '../../controllers/imageController';
import { authMiddleware } from '../../middlewares/authMiddleware';

const Router = express.Router();

Router.route('/')
    .get(imageController.list_all_images)
    .post(authMiddleware.isAuthorized, imageController.create_an_image);

Router.route('/entity/:entityType/:entityId')
    .get(imageController.get_images_by_entity)
    .delete(authMiddleware.isAuthorized, imageController.delete_images_by_entity);

Router.route('/:id')
    .get(imageController.get_image_by_id)
    .put(authMiddleware.isAuthorized, imageController.update_an_image)
    .delete(authMiddleware.isAuthorized, imageController.delete_an_image);

export const imageRoute = Router;