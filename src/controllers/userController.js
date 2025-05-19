import { StatusCodes } from "http-status-codes"
import { userService } from "../services/userService"
import ms from "ms"
import ApiError from "../utils/ApiError"
import { WEBSITE_DOMAIN } from "../utils/constants"

const get_total_users = async (req, res, next) => {
    try {
        if(req.jwtDecoded?.role !== 'admin') next(new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền truy cập vào tài nguyên này'));
        const totalUsers = await userService.get_total_users();
        res.status(StatusCodes.OK).json(totalUsers);
    } catch (error) { next(error) }
}

const list_all_users = async (req, res, next) => {
    try {
        if(req.jwtDecoded?.role !== 'admin') next(new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền truy cập vào tài nguyên này'));
        const users = await userService.list_all_users();
        res.status(StatusCodes.OK).json(users)
    } catch (error) { next(error) }
}

const create_a_user = async (req, res, next) => {
    try {
        const result = await userService.create_a_user(req.body);
        res.status(StatusCodes.CREATED).json(result)
    } catch (error) { next(error) } 
}

const verifyAccount= async (req, res, next) => {
    try {
        const result = await userService.verifyAccount(req.body);
        res.status(StatusCodes.OK).json(result)
    } catch (error) { next(error) }
}

const login= async (req, res, next) => {
    try {
        const result = await userService.login(req.body);
        res.cookie('accessToken', result.accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: ms("14 days")
        });
        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: ms("14 days")
        });
        res.status(StatusCodes.OK).json(result)
    } catch (error) { next(error) }
}

const logout= async (req, res, next) => {
    try {
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        res.status(StatusCodes.OK).json({ loggedOut: true })
    } catch (error) { next(error) }
}

const refreshToken= async (req, res, next) => {
    try {
        const result = await userService.refreshToken(req.cookies?.refreshToken);
        res.cookie("accessToken", result.accessToken, { httpOnly: true, secure:true, sameSite:"none", maxAge: ms("14 days") })
        res.status(StatusCodes.OK).json(result)
    } catch (error) {
        // Lỗi từ refresh Token (hết hạn hoặc sai) 
        next(new ApiError(StatusCodes.FORBIDDEN, "Hãy Đăng Nhập!"))
    }
}

const read_a_user = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { select } = req.query;
        const selectedColumns = select ? select.split(",") : ["*"];
        const users = await userService.list_an_user(userId, selectedColumns);
        res.status(StatusCodes.OK).json(users)
    } catch (error) { next(error) }
}

const update_a_user = async (req, res, next) => {
    try {
        const userId = req.jwtDecoded.user_id;
        const result = await userService.update_a_user(userId, req.body);
        res.status(StatusCodes.OK).json(result)
    } catch (error) { next(error) }
}

const update_user_role = async (req, res, next) => {
    try {
        if(req.jwtDecoded?.role !== 'admin') next(new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền truy cập vào tài nguyên này'));
        const newRole = req.body.newRole === 'admin' ? 'admin' : 'client';
        const result = await userService.update_user_role(req.params.userId, newRole);
        res.status(StatusCodes.OK).json(result)
    } catch (error) { next(error) }
}

const update_user_status = async (req, res, next) => {
    try {
        if(req.jwtDecoded?.role !== 'admin') next(new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền truy cập vào tài nguyên này'));
        const newStatus = req.body.is_active ? 1 : 0;
        const result = await userService.update_user_status(req.params.userId, newStatus);
        res.status(StatusCodes.OK).json(result)
    } catch (error) { next(error) }
}


const delete_a_user = async (req, res, next) => {
    try {
        if(req.jwtDecoded?.role !== 'admin') next(new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền truy cập vào tài nguyên này'));
        const result = await userService.delete_a_user(req.params.userId);
        res.status(StatusCodes.OK).json(result)
    } catch (error) { next(error) }
}

const send_otp_byEmail = async (req, res, next) => {
    try {
        const result = await userService.send_otp_byEmail(req.body);
        res.status(StatusCodes.OK).json(result)
    } catch (error) { next(error) }
}

const verify_otp_byEmail = async (req, res, next) => {
    try {
        const result = await userService.verify_otp_byEmail(req.body);
        res.status(StatusCodes.OK).json(result)
    } catch (error) { next(error) }
}

const reset_password_byEmail = async (req, res, next) => {
    try {
        const result = await userService.reset_password_byEmail(req.body);
        res.status(StatusCodes.OK).json(result)
    } catch (error) { next(error) }
}

const login_google = async (req, res, next) => {
    try {
        const user = req.user;
        res.cookie('accessToken', user.accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: ms("14 days")
        });
        res.cookie('refreshToken', user.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: ms("14 days")
        });
        res.redirect(`${WEBSITE_DOMAIN}/google/auth-callback?userIdLogin=${user.user_id}`);
    } catch (error) { next(error) }
}
export const userController = {
    get_total_users,
    list_all_users,
    create_a_user,
    read_a_user,
    update_a_user,
    update_user_role,
    update_user_status,
    delete_a_user,
    verifyAccount,
    login,
    logout,
    refreshToken,
    send_otp_byEmail,
    verify_otp_byEmail,
    reset_password_byEmail,
    login_google,
}