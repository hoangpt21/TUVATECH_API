import express from 'express';
import { newsController } from '../../controllers/newsController';
import { authMiddleware } from '../../middlewares/authMiddleware';

const Router = express.Router();

Router.route('/active')
    .get(newsController.list_active_news);

Router.route('/')
    .get(authMiddleware.isAuthorized, newsController.list_all_news)
    .post(authMiddleware.isAuthorized, newsController.create_a_news);

Router.route('/:id')
    .get( newsController.get_news_by_id)
    .put(newsController.update_a_news)
    .delete(authMiddleware.isAuthorized, newsController.delete_a_news);

export const newsRoute = Router;