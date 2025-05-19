import express from 'express';
import { addressController } from '../../controllers/addressController';
import { authMiddleware } from '../../middlewares/authMiddleware.js';
const Router = express.Router();


Router.route('/')
    .get(authMiddleware.isAuthorized, addressController.list_all_addresses)
    .post(authMiddleware.isAuthorized, addressController.create_an_address);

Router.route('/user')
    .get(authMiddleware.isAuthorized, addressController.list_addresses_by_user);

Router.route('/:id')
    .put(authMiddleware.isAuthorized, addressController.update_an_address)
    .delete(authMiddleware.isAuthorized, addressController.delete_an_address);

Router.route('/provinces')
    .get(authMiddleware.isAuthorized, addressController.api_get_provinces);

Router.route('/districts')
    .get(authMiddleware.isAuthorized, addressController.api_get_districts);

Router.route('/wards')
    .get(authMiddleware.isAuthorized, addressController.api_get_wards);
    
export const addressRoute = Router;