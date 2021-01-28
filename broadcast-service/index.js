const AWS = require("aws-sdk");
const DynamoDB = require("aws-sdk/clients/dynamodb");
AWS.config.region = 'ap-south-1';
const lambda = new AWS.Lambda();
const sendSMS = require("./communication-channels/sms");
const sendEmail = require("./communication-channels/email");
const uuid = require("uuid")
const DynamoDBClient = new DynamoDB.DocumentClient({
    region : "ap-south-1"
})


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
    const payload = JSON.parse(data.Payload);

    let partners = (JSON.parse(payload.body) || []);
    partners = partners.slice(0,process.env.BROADCAST_LIMIT);

    console.log(partners)
    const returnData = [];

    const emailRecepients = [];
    const phoneRecepients = [];
    const receipients = [];

    await Promise.all(
        partners.map(
            async partner => {
                console.log("Trying to send data : ", partner);
                const attributes = partner.Attributes;
                const phoneNumber = attributes.find(attribute => attribute.name === "phone_number")
                                    ? attributes.find(attribute => attribute.name === "phone_number").Value : "+917003625198";
                const email = attributes.find(attribute => attribute.name === "email") ?
                                    attributes.find(attribute => attribute.name === "email").Value : null;
                const providerId = partner.Username;

                const obj = {
                    email,
                    phoneNumber,
                    userName : providerId
                }
                if(email)emailRecepients.push(email)
                phoneRecepients.push(phoneNumber)
                receipients.push(obj);

                // const providerId = partner.phoneNumber || partner.email;

                console.log(email, " ", phoneNumber, " ", providerId);

                const orderId = customerOrder.OrderId || "123456789";
                const smsDeliveryInfo = await sendSMS(phoneNumber, providerId, orderId);
                //const emailDeliveryInfo = await sendEmail(orderId, providerId, email)
                returnData.push(smsDeliveryInfo);
            }
        )
    )
    const orderId = customerOrder.OrderId || "123456789"
    const emailDeliveryInfo = await sendEmail(orderId,null,emailRecepients)



    const databaseEntry = {
        customerOrderId : customerOrder.OrderId,
        broadcastOrderId : uuid.v4(),
        receipients,
        status : "PENDING"

    }
    const dynamoDBParams = {
        TableName : "BroadcastOrder",
        Item : databaseEntry
    }
    const response = await DynamoDBClient.put(dynamoDBParams).promise();

    console.log("RESPONSE FROM DATABASE : ", response)
    returnData.push(emailDeliveryInfo)
    context.succeed(returnData);
}

