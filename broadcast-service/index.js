const AWS = require("aws-sdk");
AWS.config.region = 'ap-south-1';
const lambda = new AWS.Lambda();
const sendSMS = require("./communication-channels/sms");
const sendEmail = require("./communication-channels/email");

/**
 * Fake formatting since frontend client does not yet have ability to demarcate between different kinds of products in the order
 * @param {*} rawData 
 */
const formatQueuePayload  = rawData => {
    const formattedData = {...rawData};
    formattedData.taskCategory = "PRODUCT";
    formattedData.taskSubCategory = "EDIBLES";
    return formattedData;
}


exports.handler = async function (event, context) {
    const record = event.Records[0];
    const { body } = record;

    console.log(body, "DATA RECEIVED")
    const customerOrder = JSON.parse(body);
    const formattedCustomerOrder = formatQueuePayload(customerOrder);

    const params = {
        FunctionName: "allocation-handler",
        InvocationType: 'RequestResponse',
        LogType: "Tail",
        Payload: JSON.stringify({ body: formattedCustomerOrder })
    }

    const data = await lambda.invoke(params).promise();
    const partners = JSON.parse(data.Payload);

    const returnData = [];
    await Promise.all(
        JSON.parse(partners.body).map(
            async partner => {
                console.log("Trying to send data : ", partner);
                const providerId = partner.phoneNumber || partner.email;
                const orderId = customerOrder.OrderId || "123456789";
                const smsDeliveryInfo = await sendSMS(partner.phoneNumber, providerId, orderId);
                //Fake email ids since we are temporarily utilising SES in sandbox mode and in sb mode SES requires email ids to be subscribed before they can be used.
                const emailDeliveryInfo = await sendEmail('daipayan.mukherjee09@gmail.com', "daisatyr09@gmail.com", orderId, providerId)
                returnData.push(smsDeliveryInfo);
                returnData.push(emailDeliveryInfo);
            }
        )
    )

    context.succeed(returnData);
}

