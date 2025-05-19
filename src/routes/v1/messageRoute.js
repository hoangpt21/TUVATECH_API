import express from 'express';
import { messageController } from '../../controllers/messageController';
import { authMiddleware } from '../../middlewares/authMiddleware';

const Router = express.Router();

Router.route('/')
    .get(authMiddleware.isAuthorized, messageController.list_all_messages)
    .post(authMiddleware.isAuthorized, messageController.create_a_message);

Router.route('/user/:userId')
    .get(authMiddleware.isAuthorized,messageController.get_messages_by_user);

Router.route('/:id')
    .put(authMiddleware.isAuthorized, messageController.update_a_message)
    .delete(authMiddleware.isAuthorized, messageController.delete_a_message);

export const messageRoute = Router;