// const SES = require("aws-sdk/clients/ses");
// const ses = new SES({ region: "ap-south-1" });
// const constants = require("../constants");


// async function sendEmail (toEmail, fromEmail, orderId, providerId) {
//     const real = constants.API_GATEWAY_ACCEPTANCE_ENDPOINT_PATH + `?orderId=${orderId}&providerId=${providerId}`;
    
//     const acceptanceLink = "http://localhost:3001/accept-order/" + `?orderId=${orderId}&providerId=${providerId}`;
//     var params = {
//         Destination: {
//             ToAddresses: [toEmail],
//         },
//         Message: {
//             Body: {
//                 Text: { Data: constants.BROADCAST_MESSAGE_BODY_PREFIX + acceptanceLink, },
//             },

//             Subject: { Data: constants.BROADCAST_MESSAGE_SUBJECT },
//         },
//         Source: fromEmail,
//     };

//     return ses.sendEmail(params).promise()
// }

// module.exports = sendEmail;

const sendGridEmailClient = require("@sendgrid/mail");
const {subjectTemplates, bodyTemplates} = require("../templates/email");
sendGridEmailClient.setApiKey(process.env.SENDGRID_EMAIL_API_KEY);
const defaultSender = "daipayan@goflexe.com"

const sendEmail = async (orderId, providerId, receipient, sender = defaultSender) => {
    const acceptanceLink = "https://serviceprovider.goflexe.com/#/accept-order/" + `${orderId}`;
    console.log(receipient)
    const msg = {
        to : receipient,
        from: sender,
        subject: subjectTemplates.NEW_ORDER,
        text: bodyTemplates.NEW_ORDER_ACCEPTANCE_PROMPT + acceptanceLink
    }
    return await sendGridEmailClient.sendMultiple(msg)
}

module.exports = sendEmail;