import express from 'express';
import { userController } from '../../controllers/userController.js';
import { authMiddleware } from '../../middlewares/authMiddleware.js';
import passport from 'passport';
const Router = express.Router();

Router.route('/total')
    .get(authMiddleware.isAuthorized, userController.get_total_users)

Router.route('/register')
    .post(userController.create_a_user)

Router.route('/verify')
    .put(userController.verifyAccount)

Router.route('/login')
    .post(userController.login)

Router.route('/logout')
    .delete(userController.logout)

Router.route('/refresh_token')
    .get(userController.refreshToken)

Router.route('/')
    .get(authMiddleware.isAuthorized, userController.list_all_users)
Router.route('/userdetail/:userId')
    .get(userController.read_a_user)

Router.route('/update')
    .put(authMiddleware.isAuthorized, userController.update_a_user)

Router.route('/update_role/:userId')
    .put(authMiddleware.isAuthorized, userController.update_user_role)

Router.route('/update_status/:userId')
    .put(authMiddleware.isAuthorized, userController.update_user_status)

Router.route('/delete/:userId')
    .delete(authMiddleware.isAuthorized, userController.delete_a_user)

Router.route('/send-otp-by-email')
   .post(userController.send_otp_byEmail)

Router.route('/verify-otp-by-email')
  .post(userController.verify_otp_byEmail)

Router.route('/reset-password-by-email')
 .put(userController.reset_password_byEmail)

Router.route('/google/auth')
  .get(passport.authenticate('google', { scope: ['profile', 'email'] }))
Router.route('/google/login')
  .get(passport.authenticate('google', { failureRedirect: '/login' }), userController.login_google)

export const userRoute = Router;