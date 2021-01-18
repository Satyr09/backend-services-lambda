const SES = require("aws-sdk/clients/ses");
const ses = new SES({ region: "ap-south-1" });
const constants = require("../constants");


async function sendEmail (toEmail, fromEmail, orderId, providerId) {
    const real = constants.API_GATEWAY_ACCEPTANCE_ENDPOINT_PATH + `?orderId=${orderId}&providerId=${providerId}`;
    
    const acceptanceLink = "http://localhost:3001/accept-order/" + `?orderId=${orderId}&providerId=${providerId}`;
    var params = {
        Destination: {
            ToAddresses: [toEmail],
        },
        Message: {
            Body: {
                Text: { Data: constants.BROADCAST_MESSAGE_BODY_PREFIX + acceptanceLink, },
            },

            Subject: { Data: constants.BROADCAST_MESSAGE_SUBJECT },
        },
        Source: fromEmail,
    };

    return ses.sendEmail(params).promise()
}

module.exports = sendEmail;