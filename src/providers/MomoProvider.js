import crypto from 'crypto';
import { API_WEBSITE } from '../utils/constants';

const PARTNER_CODE = "MOMO";
const ACCESS_KEY = "F8BBA842ECF85";
const SECRET_KEY = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
const ORDER_INFO = "Thanh toan don hang co ma";
const REDIRECT_URL = `${API_WEBSITE}/v1/payments/check-payment`;
const IPN_URL = `${API_WEBSITE}/v1/payments/check-payment`;
const REQUEST_TYPE = "captureWallet";
const EXTRA_DATA = "";

const initiateMomoPayment = (amount, orderId) => {
    const requestId = PARTNER_CODE + new Date().getTime();
    const finalOrderId = requestId;
    const rawSignature = "accessKey="+ACCESS_KEY+"&amount=" + amount?.split('.')[0]+"&extraData=" + EXTRA_DATA+"&ipnUrl=" + IPN_URL+"&orderId=" + finalOrderId+"&orderInfo=" + (ORDER_INFO + ` ${orderId}`)+"&partnerCode=" + PARTNER_CODE +"&redirectUrl=" + REDIRECT_URL+"&requestId=" + requestId+"&requestType=" + REQUEST_TYPE;
    const signature = crypto.createHmac('sha256', SECRET_KEY)
        .update(rawSignature)
        .digest('hex');
    return JSON.stringify({
        partnerCode: PARTNER_CODE,
        accessKey: ACCESS_KEY,
        requestId: requestId,
        amount: amount?.split('.')[0],
        orderId: finalOrderId,
        orderInfo: ORDER_INFO + ` ${orderId}`,
        redirectUrl: REDIRECT_URL,
        ipnUrl: IPN_URL,
        extraData: EXTRA_DATA,
        requestType: REQUEST_TYPE,
        signature: signature,
        lang: 'en'
    });
}

export const MomoProvider = {
    initiateMomoPayment,
    urlMomo: 'https://test-payment.momo.vn/v2/gateway/api/create'
}