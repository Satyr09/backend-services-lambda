const SNS = require("aws-sdk/clients/sns");
const constants = require("../constants");


async function sendSMS (mobileNo, providerId, orderId) {
    const acceptanceLink = constants.API_GATEWAY_ACCEPTANCE_ENDPOINT_PATH + `?orderId=${orderId}&providerId=${providerId}`
    const params = {
        Message: constants.BROADCAST_MESSAGE_BODY_PREFIX + acceptanceLink,
        PhoneNumber: mobileNo,
        MessageAttributes: {
            'AWS.SNS.SMS.SenderID': {
                'DataType': 'String',
                'StringValue': "GOFlexeAWS"
            }
        }
    };
    return new SNS({ apiVersion: "2010–03–31", region: "ap-south-1" }).publish(params).promise()
        .then(_ => {
            console.log("OTP SENT SUCCESSFULLY");
        })
        .catch(err => {
            console.log("Error " + err)
            return err;
        });
}

module.exports = sendSMS;