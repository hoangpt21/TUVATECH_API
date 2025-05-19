const brevo = require("@getbrevo/brevo");
import { env } from "../config/environment";

let apiInstance = new brevo.TransactionalEmailsApi();
let apiKey = apiInstance.authentications['apiKey'];
apiKey.apiKey = env.BREVO_API_KEY;

const sendEmail = async (recipientEmail, customSubject, customHtmlContent) => {
    let sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.sender = {email: env.ADMIN_EMAIL_ADDRESS, name: env.ADMIN_EMAIL_NAME};
    sendSmtpEmail.to = [{email: recipientEmail }];
    sendSmtpEmail.subject = customSubject;
    sendSmtpEmail.htmlContent = customHtmlContent;
    return apiInstance.sendTransacEmail(sendSmtpEmail)
}

export const BrevoProvider = {
    sendEmail
}