import { StatusCodes } from "http-status-codes";
import { JwtProvider } from "../providers/JwtProvider";
import { env } from "../config/environment";
import ApiError from "../utils/ApiError";

const isAuthorized = async (req, res, next) => {
    const clientAccessToken = req.cookies?.accessToken;
    if(!clientAccessToken) {
        next(new ApiError(StatusCodes.UNAUTHORIZED, "Không được phép! (không tìm thấy token)"))
        return;
    } 
    try {
        const accessTokenDecoded = await JwtProvider.verifyToken(clientAccessToken, env.ACCESS_TOKEN_SECRET_SIGNATURE);
        req.jwtDecoded = accessTokenDecoded;
        next()
    } catch (error) {
        if(error?.message?.includes("jwt expired")) {
            next(new ApiError(StatusCodes.GONE, "Hãy làm mới token"));
            return;
        }
        next(new ApiError(StatusCodes.UNAUTHORIZED, "Không được phép!"))
    }
}

export const authMiddleware = { isAuthorized }