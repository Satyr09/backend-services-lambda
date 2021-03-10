const sendGridEmailClient = require("@sendgrid/mail");
const { getCompiledTextTemplate } = require("../../templates");
sendGridEmailClient.setApiKey(process.env.SENDGRID_EMAIL_API_KEY);
const defaultSender = "admin@goflexe.com"

const sendEmail = async (data = {}, receipients, messageType = "BROADCAST_ORDER", sender = defaultSender) => {
    const acceptanceLink = "https://serviceprovider.goflexe.com/#/accept-order/" + `${data.orderId}`;
    console.log(receipients)

    const dynamicFields = {
        acceptanceLink,
        ...data,
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
            subject: "GoFlexe",
            html : message
        });
        console.log(response)
        return response.body;
    } catch(err) {
        throw new Error(err)
    }
}

module.exports = sendEmail;