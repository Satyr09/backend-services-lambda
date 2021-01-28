// const SNS = require("aws-sdk/clients/sns");
// const constants = require("../constants");



// async function sendSMS (mobileNo, providerId, orderId) {
//     const acceptanceLink = constants.API_GATEWAY_ACCEPTANCE_ENDPOINT_PATH + `?orderId=${orderId}&providerId=${providerId}`
//     const params = {
//         Message: constants.BROADCAST_MESSAGE_BODY_PREFIX + acceptanceLink,
//         PhoneNumber: mobileNo,
//         MessageAttributes: {
//             'AWS.SNS.SMS.SenderID': {
//                 'DataType': 'String',
//                 'StringValue': "GOFlexeAWS"
//             }
//         }
//     };
//     return new SNS({ apiVersion: "2010–03–31", region: "ap-south-1" }).publish(params).promise()
//         .then(_ => {
//             console.log("OTP SENT SUCCESSFULLY");
//         })
//         .catch(err => {
//             console.log("Error " + err)
//             return err;
//         });
// }

// module.exports = sendSMS;

const accountSid =  process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
const { bodyTemplates } = require('../templates/email');


const sendSMS = async (mobileNo, providerId, orderId) => {
    const acceptanceLink = "http://localhost:3001/accept-order?orderId="+orderId;

    return client.messages.create({
        body : bodyTemplates.NEW_ORDER_ACCEPTANCE_PROMPT + acceptanceLink,
        from: '+14043342622',
        to: '+917003625198'
    }).then(
         message => message.sid
    )
}

module.exports = sendSMS;