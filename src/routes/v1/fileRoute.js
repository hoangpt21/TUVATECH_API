import express from 'express';
import { authMiddleware } from '../../middlewares/authMiddleware.js';
import { multerUploadMiddleware } from '../../middlewares/multerUploadMiddleware.js';
import { fileController } from '../../controllers/fileController.js';
const Router = express.Router();

Router.route('/upload/:dirName')
    .put(authMiddleware.isAuthorized, multerUploadMiddleware.upload.single('avatar'), fileController.upload_file)

export const fileRoute = Router;