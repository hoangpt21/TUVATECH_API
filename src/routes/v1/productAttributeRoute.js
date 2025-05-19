import express from 'express';
import { authMiddleware } from '../../middlewares/authMiddleware.js';
import { productAttributeController } from '../../controllers/productAttributeController.js';

const Router = express.Router();

// Get all product attributes
Router.route('/')
    .get(productAttributeController.list_all_attributes)
    .post(authMiddleware.isAuthorized, productAttributeController.create_an_attribute);

Router.route('/product/:productId')
    .get(productAttributeController.get_attributes_by_productId)
    .delete(authMiddleware.isAuthorized, productAttributeController.delete_attributes_by_productId);

Router.route('/:id')
    .get(productAttributeController.get_attribute_by_id)
    .put(authMiddleware.isAuthorized, productAttributeController.update_an_attribute)
    .delete(authMiddleware.isAuthorized, productAttributeController.delete_an_attribute);

export const productAttributeRoute = Router; 