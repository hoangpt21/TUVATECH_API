import { StatusCodes } from "http-status-codes";
import {userModel} from "../models/userModel";
import ApiError from "../utils/ApiError";
import crypto from "crypto";
import {v4 as uuidv4} from "uuid"
import { WEBSITE_DOMAIN } from "../utils/constants";
import { BrevoProvider } from "../providers/BrevoProvider";
import { env } from "../config/environment";
import { JwtProvider } from "../providers/JwtProvider";

const get_total_users = async () => {
    try {
        const totalUsers = await userModel.get_total_users();
        return totalUsers;
    } catch (error) { throw error }
}

const list_all_users = async (selectedColumns = ['*'], limit = 50, offset = 0) => {
    try {
        const users = await userModel.list_all_users(selectedColumns, limit, offset);
        if(!users) throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy tài khoản!");
        const returnUsers = users.map(user => {
            const {password, verify_token, ...returnUserInfo} = user;
            return returnUserInfo;
        }).filter(user => user.role !== 'admin');
        return returnUsers;
    } catch (error) { throw error }
}

const list_an_user = async (userId, selectedColumns = ['*']) => {
    try {
        const [existUser] = await userModel.list_users_by_conditions([userId], selectedColumns, [{name: 'user_id'}]);
        if(!existUser) return null;
        const {password, verify_token, otp, ...returnUserInfo} = existUser;
        return returnUserInfo;
    } catch (error) { throw error }
}

const create_a_user = async (reqBody) => {
    try {
        const [existUser] = await userModel.list_users_by_conditions([reqBody.email], ["*"], [{name: "email"}]);
        if(existUser) throw new ApiError(StatusCodes.CONFLICT, "Email này đã tồn tại!")
        const nameFromEmail = reqBody.email.split("@")[0];
        const newUser = {
            ...reqBody,
            password: crypto.createHash("sha512").update(reqBody.password).digest("hex"),
            user_name: nameFromEmail,
            verify_token: uuidv4()
        }
        const createdUser = await userModel.create_a_user(newUser);
        // Gửi email xác minh
        const verificationLink = `${WEBSITE_DOMAIN}/account/verification?email=${newUser.email}&token=${newUser.verify_token}`;
        const customSubject = "Vui lòng xác minh email của bạn trước khi sử dụng dịch vụ của chúng tôi"
        const htmlContent = `
            <h3>Đây là link xác minh của bạn:<h3>
            <a href=${verificationLink}>${verificationLink}<a>
            <h3>Chân thành, <br/> - ${env.ADMIN_EMAIL_NAME} -<h3>
        `;
        await BrevoProvider.sendEmail(newUser.email, customSubject, htmlContent);
        return createdUser;
    } catch (error) { throw error }
}

const verifyAccount= async (reqBody) => {
    try {
        const [existUser] = await userModel.list_users_by_conditions([reqBody.email], ["*"], [{name: "email"}]);
        if(!existUser) throw new ApiError(StatusCodes.NOT_FOUND, "Account not found!");
        if(existUser.is_active) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is already active!');
        if(reqBody.token !== existUser.verify_token) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Token is invalid!');
        const updatedUser = await userModel.update_a_user([true, null, existUser.user_id],["is_active", "verify_token"],[{name: "user_id"}]);
        return updatedUser;
    } catch (error) { throw error }
}

const login= async (reqBody) => {
    try {
        const [existUser] = await userModel.list_users_by_conditions([reqBody.email], ["*"], [{name: "email"}]);
        if(!existUser) throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy tài khoản!");
        const {password, verify_token, otp, ...returnUserInfo} = existUser;
        if(!existUser.is_active) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Tài khoản của bạn chưa kích hoạt!');
        const loginPasswordEncode = crypto.createHash("sha512").update(reqBody.password).digest("hex"); 
        if(loginPasswordEncode !== password) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Mật khẩu hoặc Email của bạn không đúng!');
        const userInfo = {
            user_id: existUser.user_id,
            email: existUser.email,
            role: existUser.role
        }
        const accessToken = await JwtProvider.generateToken(userInfo, env.ACCESS_TOKEN_SECRET_SIGNATURE, env.ACCESS_TOKEN_LIFE);
        const refreshToken = await JwtProvider.generateToken(userInfo, env.REFRESH_TOKEN_SECRET_SIGNATURE, env.REFRESH_TOKEN_LIFE);
        return { accessToken, refreshToken,  ...returnUserInfo}
    } catch (error) { throw error }
}

const refreshToken = async (clientRefreshToken) => {
    try {
        const refreshTokenDecoded = await JwtProvider.verifyToken(clientRefreshToken, env.REFRESH_TOKEN_SECRET_SIGNATURE);
        const userInfo = {
            user_id: refreshTokenDecoded.user_id,
            email: refreshTokenDecoded.email,
            role: refreshTokenDecoded.role
        }
        const accessToken = await JwtProvider.generateToken(userInfo, env.ACCESS_TOKEN_SECRET_SIGNATURE, env.ACCESS_TOKEN_LIFE);
        return {accessToken}
    } catch (error) { throw error }
}

const update_a_user = async (userId, reqBody) => {
    try {
        const [existUser] = await userModel.list_users_by_conditions([userId], ["*"], [{name: "user_id"}]); 
        if(!existUser) throw new ApiError(StatusCodes.NOT_FOUND, "Account not found!");
        if(!existUser.is_active) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is not active!');
        if(reqBody.current_password && reqBody.new_password) {
            const currentPasswordEncode = crypto.createHash("sha512").update(reqBody.current_password).digest("hex"); 
            if(currentPasswordEncode !== existUser.password) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your Current Password is incorrect!');
            const newPasswordEncode = crypto.createHash("sha512").update(reqBody.new_password).digest("hex"); 
            await userModel.update_a_user([newPasswordEncode, existUser.user_id], ["password"], [{name: "user_id"}]);
        } else {
            let selectedColumns = Object.keys(reqBody);
            let array = [...selectedColumns.map(key => reqBody[key]), existUser.user_id]
            await userModel.update_a_user(array, selectedColumns, [{name: "user_id"}]);
        } 
        const [updatedUser] = await userModel.list_users_by_conditions([existUser.user_id], ["*"], [{name: "user_id"}]);   
        const {password, verify_token, ...returnUserInfo} = updatedUser;
        return returnUserInfo;
    } catch (error) { throw error }
}

const update_user_role = async (userId, newRole) => {
    try {
        const [existUser] = await userModel.list_users_by_conditions([userId], ["*"], [{name: "user_id"}]);
        if(!existUser) throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy tài khoản!");
        if(!existUser.is_active) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Tài khoản này chưa được kích hoạt!');

        await userModel.update_a_user([newRole, userId], ["role"], [{name: "user_id"}]);

        const [updatedUser] = await userModel.list_users_by_conditions([userId], ["*"], [{name: "user_id"}]);
        const {password, verify_token, ...returnUserInfo} = updatedUser;
        return returnUserInfo;
    } catch (error) { throw error }
}

const update_user_status = async (userId, newStatus) => {
    try {
        const [existUser] = await userModel.list_users_by_conditions([userId], ["*"], [{name: "user_id"}]);
        if(!existUser) throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy tài khoản!");
        await userModel.update_a_user([newStatus, userId], ["is_active"], [{name: "user_id"}]);
        const [updatedUser] = await userModel.list_users_by_conditions([userId], ["*"], [{name: "user_id"}]);
        const {password, verify_token, ...returnUserInfo} = updatedUser;
        return returnUserInfo;
    } catch (error) { throw error }
}

const delete_a_user = async (userId) => {
    try {
        await userModel.delete_a_user(userId);
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            throw new ApiError(
                StatusCodes.CONFLICT,
                "Tài khoản đang được sử dụng, không thể xóa!"
            );
        }
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi xóa tài khoản");
    }
}

const send_otp_byEmail = async (reqBody) => {
    try {
        const [existUser] = await userModel.list_users_by_conditions([reqBody.email], ["*"], [{name: "email"}]);
        if(!existUser) throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy tài khoản!");
        if(!existUser.is_active) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Tài khoản này chưa được kích hoạt!');
        const otp = Math.floor(100000 + Math.random() * 900000);
        await userModel.update_a_user([otp, existUser.user_id], ["otp"], [{name: "user_id"}]);
        const customSubject = "TuvaTech - Mã OTP của bạn"
        const htmlContent = `Mã OTP của bạn là:${' '}<span style="font-weight: 500; font-size: 20px">${otp}</span>. Xin vui lòng không chia sẻ mã OTP này cho người khác`;
        await BrevoProvider.sendEmail(existUser.email, customSubject, htmlContent);
        return {email: existUser.email};
    } catch (error) { throw error }
}

const verify_otp_byEmail = async (reqBody) => {
    try {
        const [existUser] = await userModel.list_users_by_conditions([reqBody.email], ["*"], [{name: "email"}]);
        if(!existUser) throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy tài khoản!");
        if(!existUser.is_active) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Tài khoản này chưa được kích hoạt!');
        if(reqBody.otp !== existUser.otp) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Mã OTP không đúng!');
        return {status: true};
    } catch (error) { throw error }
}

const reset_password_byEmail = async (reqBody) => {
    try {
        const [existUser] = await userModel.list_users_by_conditions([reqBody.email], ["*"], [{name: "email"}]);
        if(!existUser) throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy tài khoản!");
        if(!existUser.is_active) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Tài khoản này chưa được kích hoạt!');
        const newPasswordEncode = crypto.createHash("sha512").update(reqBody.password).digest("hex");
        await userModel.update_a_user([newPasswordEncode, existUser.user_id], ["password"], [{name: "user_id"}]);
        return {status: true};
    } catch (error) { throw error }
}

const upsert_user = async (reqBody) => {
    try {
        const [existUser] = await userModel.list_users_by_conditions([reqBody.email], ["*"], [{name: "email"}]); 
        let user = existUser;
        if (!existUser) {
            const nameFromEmail = reqBody.email.split("@")[0];
            const newUser = {
                ...reqBody,
                password: crypto.createHash("sha512").update(reqBody.password).digest("hex"),
                user_name: nameFromEmail,
                is_active: true,
            }
            const createdUser = await userModel.create_a_user(newUser);
            const [newUserObj] = await userModel.list_users_by_conditions([createdUser?.insertId], ["*"], [{name: "user_id"}]);     
            user = newUserObj;            
        }
        const userInfo = {
            user_id: user.user_id,
            email: user.email,
            role: user.role
        }
        const accessToken = await JwtProvider.generateToken(userInfo, env.ACCESS_TOKEN_SECRET_SIGNATURE, env.ACCESS_TOKEN_LIFE);
        const refreshToken = await JwtProvider.generateToken(userInfo, env.REFRESH_TOKEN_SECRET_SIGNATURE, env.REFRESH_TOKEN_LIFE);
        const {password, verify_token, otp, ...returnUserInfo} = user;
        return { ...returnUserInfo, accessToken, refreshToken};
    } catch (error) {
        throw error;
    }
}

export const userService = {
    list_all_users,
    get_total_users,
    create_a_user,
    update_a_user,
    update_user_status,
    update_user_role,
    verifyAccount,
    list_an_user,
    login,
    refreshToken,
    delete_a_user,
    send_otp_byEmail,
    verify_otp_byEmail,
    reset_password_byEmail,
    upsert_user,
}