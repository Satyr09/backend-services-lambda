const sendGridEmailClient = require("@sendgrid/mail");
const { getCompiledTextTemplate } = require("../../templates");
sendGridEmailClient.setApiKey("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");//process.env.SENDGRID_EMAIL_API_KEY);
const defaultSender = "daipayan@goflexe.com"

const sendEmail = async (data, receipients, messageType = "BROADCAST_ORDER", sender = defaultSender) => {
    const acceptanceLink = "https://serviceprovider.goflexe.com/#/accept-order/" + `${data.orderId}`;
    console.log(receipients)

    const dynamicFields = {
        acceptanceLink
    }

    const message = await getCompiledTextTemplate(dynamicFields, messageType)
    const params = {
        to : receipients,
        from: sender,
        subject: "TEST",
        text: message
    }
    try {
        const response =  await sendGridEmailClient.sendMultiple({
            to: receipients,
            from: sender,
            subject: "TEST",
            html : message
        });
        console.log(response)
        return response.body;
    } catch(err) {
        throw new Error(err)
    }
}

module.exports = sendEmail;