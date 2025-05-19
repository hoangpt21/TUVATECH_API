import { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat} from 'vnpay'
import { env } from '../config/environment'
import { API_WEBSITE, WEBSITE_IP_ADDRESS } from '../utils/constants';

const vnpay = new VNPay({
    // Thông tin cấu hình bắt buộc
    tmnCode: env.VNPAY_TMNCODE,
    secureSecret: env.VNPAY_HASHSECRET,
    vnpayHost: env.VNPAY_URL,
    // Cấu hình tùy chọn
    testMode: true,                // Chế độ test
    hashAlgorithm: 'SHA512',      // Thuật toán mã hóa
    enableLog: true,              // Bật/tắt ghi log
    loggerFn: ignoreLogger,       // Hàm xử lý log tùy chỉnh
})

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

const initiateVnpayPayment = async (orderId, amount) => {
    const vnp_Response = await vnpay.buildPaymentUrl({
      vnp_Amount: amount,
      vnp_IpAddr: WEBSITE_IP_ADDRESS,
      vnp_TxnRef: `${orderId}`,
      vnp_OrderInfo: `Thanh toan don hang co ma la ${orderId}`,
      vnp_OrderType: ProductCode.Computers_OfficeEquipment,
      vnp_ReturnUrl: `${API_WEBSITE}/v1/payments/check-payment`,
      vnp_Locale: VnpLocale.VN,
      vnp_CreateDate: dateFormat(new Date()),
      vnp_ExpireDate: dateFormat(tomorrow),
    });
    return vnp_Response;
};

export const VNPayProvider = {
    initiateVnpayPayment
}