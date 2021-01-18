const DynamoDB = require("aws-sdk/clients/dynamodb");
const DynamoDBClient = new DynamoDB.DocumentClient({
    "region": "ap-south-1"
})

const TABLE_NAME = "ServiceOrder";


exports.handler = async (event, context) => {
    if (!event.queryStringParameters) {
        context.fail("No query criteria mentioned.");
    }

    console.log(event.queryStringParameters);
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
    }
    let statusCode = 200;
    let response = "";

    if (event.queryStringParameters.orderId) {
        const params = {
            TableName: TABLE_NAME,
            KeyConditionExpression: 'ServiceOrderId = :orderId',
            ExpressionAttributeValues: {
                ':orderId': event.queryStringParameters.orderId,
            }
        };
        response = await DynamoDBClient.query(params).promise();
    } else if (event.queryStringParameters.username) {
        const params = {
            TableName: TABLE_NAME,
            IndexName: "serviceProviderId-index",
            KeyConditionExpression: 'serviceProviderId = :serviceProviderId',
            ExpressionAttributeValues: {
                ':serviceProviderId': event.queryStringParameters.username,
            }
        };
        response = await DynamoDBClient.query(params).promise();

    } else {
        response = { Items: [] };
    }
    console.log(response)
    return {
        "statusCode": statusCode,
        "body": JSON.stringify(response.Items),
        "headers": headers
    }
}