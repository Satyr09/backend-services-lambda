const AWS = require("aws-sdk");
const SQS = new AWS.SQS();
const awsConfig = require("./awsconfig");
const constants = require("./constants");


exports.handler = async (event) => {
    console.log("Request: " + JSON.stringify(event));
    const payload = JSON.parse(event.body);

    const Item = {
        customerOrderId: payload.orderId,
        serviceProviderId: payload.username
    }
    if (payload.email) {
        Item.email = payload.email;
    }
    if (payload.phone) {
        Item.phone = payload.phone;
    }

    const queueParams = {
        MessageBody: JSON.stringify(Item),
        QueueUrl: awsConfig.ORDER_ACCEPTANCE_QUEUE_URL,
        MessageGroupId: Item.customerOrderId,//Processing of different orders are independent. Having orderId as the group id enables us to ensure FIFO ordering for each order, but parallel processing across diff orders.
        MessageDeduplicationId: Item.customerOrderId + "" + Item.serviceProviderid,
    }
    const info = await SQS.sendMessage(queueParams).promise();
    console.log("MESSAGE POSTED : ", info)

    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
    }

    const response = {
        statusCode: 200,
        headers: headers,
        body: constants.ALL_OK_RESPONSE
    };
    console.log("Response: " + JSON.stringify(response))
    return response;
}