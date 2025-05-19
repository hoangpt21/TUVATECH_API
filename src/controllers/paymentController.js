import { StatusCodes } from "http-status-codes";
import { VNPayProvider } from "../providers/VNPayProvider";
import { MomoProvider } from "../providers/MomoProvider";
import { WEBSITE_DOMAIN } from "../utils/constants";
import { orderModel } from "../models/orderModel";
import axios from "axios";
import ApiError from "../utils/ApiError";

const createPaymentMethodByVNPay = async (req, res, next) => {
    try {
        const { amount, orderId } = req.body;
        const result = await VNPayProvider.initiateVnpayPayment(orderId, amount);
        res.status(StatusCodes.CREATED).json(result);
    } catch (error) {
        next(error);
    }
}

const createPaymentMethodByMomo = async (req, res, next) => {
    try {
        const { amount, orderId } = req.body;
        if(Number(amount) > 50000000) return next(new ApiError(StatusCodes.BAD_REQUEST, "Giới hạn số tiền có thể thanh toán là 50 triệu đồng"))
        const requestBody = MomoProvider.initiateMomoPayment(amount, orderId);
        const result = await axios.post(MomoProvider.urlMomo, requestBody,{
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(requestBody)
            },
        });
        res.status(StatusCodes.CREATED).json(result?.data?.payUrl);
    } catch (error) {
        next(error);
    }
}

const checkPayment = async (req, res, next) => {
    try {
        const resultCode = req.query?.resultCode;
        const orderInfo = req.query?.orderInfo;
        const vnp_ResponseCode = req.query?.vnp_ResponseCode;
        const vnp_TxnRef = req.query?.vnp_TxnRef;
        
        const ckeck = vnp_ResponseCode === "00" || resultCode === "0";
        const orderId = orderInfo? orderInfo.split(" ")[orderInfo.split(" ").length-1]: vnp_TxnRef;
        const isSuccess = ckeck;
        const statusPayment = isSuccess? "paid" : "failed";
        await orderModel.update_an_order(
            [statusPayment, (new Date()).toLocaleDateString('en-CA'), parseInt(orderId)],
            ["payment_status","payment_date"],
            [{name: "order_id"}],
        )
        const status = isSuccess ? "success" : "failed";
        const redirectUrl = `${WEBSITE_DOMAIN}/payment-status?status=${status}&orderId=${parseInt(orderId)}`;
        return res.redirect(redirectUrl);
    } catch (error) {
        next(error);
    }
}
export const paymentController = {
    createPaymentMethodByVNPay,
    createPaymentMethodByMomo,
    checkPayment
}