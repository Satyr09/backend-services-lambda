const DynamoDB = require("aws-sdk/clients/dynamodb");
//const { v4: uuidv4 } = require('uuid');
const awsConfig = require("./awsconfig");

const DynamoDBClient = new DynamoDB.DocumentClient({
    "region": awsConfig.REGION
})

const TABLE_NAME = awsConfig.SERVICE_ORDER_TABLE_NAME;


exports.handler = async (event, context) => {
    //const method = event.httpMethod;
    const data = JSON.parse(event.body);
    console.log(data);
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
    }

    //const pathParameter = event.pathParameters;
    let responseMessage = null;
    let statusCode = 200;

    try {
        // switch(pathParameter.type) {
        //     case "new":
        //         responseMessage = await handleNewServiceOreder(data);
        //         break;

        //     case "edit":
        //         responseMessage = await handleExistingServiceOrder(data);
        //         break;
        //     default:
        //         statusCode = 404;
        //         responseMessage = "No such route exists"
        //         break;
        // }
        responseMessage = await handleExistingServiceOrder(data);
    } catch (err) {
        statusCode = 501;
        responseMessage = JSON.stringify(err)
    }
    return {
        "statusCode": statusCode,
        "body": JSON.stringify(responseMessage),
        "headers": headers
    }
}

// const handleNewServiceOreder = async data => {
//     const ServiceOrderId = uuidv4();

//     const params = {
//         TableName:TABLE_NAME,
//         Item:{
//             "ServiceOrderId": ServiceOrderId
//         }
//     };

//     return new Promise((resolve, reject) => {

//         DynamoDBClient.put(params, (err, data) => {
//             if(err)
//                 reject(err)
//             else {
//                 resolve(JSON.stringify(data));
//             }
//         })
//     })
// }

const handleExistingServiceOrder = async data => {
    const id = data.serviceOrderId;

    const params = {
        TableName: TABLE_NAME,
        Key: { 'ServiceOrderId': id }
    };
    console.log(params)
    delete data.serviceOrderId;

    const existingData = await DynamoDBClient.get(params).promise();
    const newData = {
        ...(existingData.Item),
        ...data
    }

    console.log("EXISTING DATA ", existingData)
    console.log("NEW DATA ", newData);
    const putPayload = {
        TableName: TABLE_NAME,
        Item: newData
    };

    const response = await DynamoDBClient.put(putPayload).promise();
    return response;
}

