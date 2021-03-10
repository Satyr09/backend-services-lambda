const accountSid =  process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
const { getCompiledTextTemplate } = require('../../templates');
const defaultSender = '+14043342622'

const sendSMS = async (data = {} , receipients, messageType = "BROADCAST_ORDER", sender = defaultSender) => {
    const acceptanceLink = "https://serviceprovider.goflexe.com/#/accept-order/"+data.orderId;

    const dynamicFields = {
        acceptanceLink,
        ...data
    }
    const message = getCompiledTextTemplate(dynamicFields, messageType)
    const errors = []
    const promiseList = receipients.map(async receipient => {
        let response = null;
        try {
            response = await client.messages.create({
                body : message,
                from: sender,
                to: receipient
            })
        }catch(err) {
            //console.error(err)
            errors.push(err);
        }
        return response;
    });
    await Promise.all(promiseList);
    if(errors.length > 0) 
        throw new Error("Errors occurred while sending SMS : ", JSON.stringify(errors))
}

module.exports = sendSMS;