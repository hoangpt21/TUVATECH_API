import express from 'express';
import { categoryController } from '../../controllers/categoryController';
import { authMiddleware } from '../../middlewares/authMiddleware';

const Router = express.Router();
Router.route('/active/:categoryType')
    .get(categoryController.get_active_categories_by_type);

Router.route('/active')
    .get(categoryController.list_active_categories);


Router.route('/')
    .get(authMiddleware.isAuthorized, categoryController.list_all_categories)
    .post(authMiddleware.isAuthorized, categoryController.create_a_category);

Router.route('/:categoryType')
    .get( categoryController.get_categories_by_type);

Router.route('/:id')
    .get(categoryController.get_category_by_id)
    .put(authMiddleware.isAuthorized, categoryController.update_a_category)
    .delete(authMiddleware.isAuthorized, categoryController.delete_a_category);

export const categoryRoute = Router;