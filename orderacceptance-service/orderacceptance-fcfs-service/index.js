const AWS = require("aws-sdk")
const uuid = require("uuid")
const DynamoDB = new AWS.DynamoDB();
const awsConfig = require("./awsconfig");
const DynamoDB2 = require("aws-sdk/clients/dynamodb")

const DynamoDBClient = new DynamoDB2.DocumentClient({
    region: awsConfig.region
})

const ORDER_ACCEPTANCE_DB = awsConfig.ORDER_ACCEPTANCE_DB;
exports.handler = async (event, context) => {
    const record = event.Records[0];
    const { body } = record;
    const data = JSON.parse(body);

    console.log(data);
    console.log("service provider id : ", data.serviceProviderId);

    const timestamp = new Date().toString();

    const dynamodbParams = {
        TableName: ORDER_ACCEPTANCE_DB,
        Item: {
            "ServiceOrderId": { S: uuid.v4() },
            "displayId": { S: new Date().getUTCMilliseconds().toString() },
            "customerOrderId": { S: data.customerOrderId },
            "serviceProviderId": { S: data.serviceProviderId },
            "createdAt": { S: new Date().getTime().toString() }
        },
        ConditionExpression: 'attribute_not_exists(ServiceOrderId)'
    };
    try {
        const info = await DynamoDB.putItem(dynamodbParams).promise();
        console.log("DID NOT ERROR OUT")
        console.log(info, "INFORMATION POSTED");

        // const broadcastTableParams = {
        //     TableName: "BroadcastOrder",
        //     Item: {
        //         "ServiceOrderId": {S : uuid.v4()},
        //         "displayId": {S: new Date().getUTCMilliseconds().toString()},
        //         "customerOrderId" : {S : data.customerOrderId},
        //         "serviceProviderId": {S : data.serviceProviderId},
        //         "createdAt": {S : new Date().getTime().toString()}
        //     },
        //     ConditionExpression: 'attribute_not_exists(ServiceOrderId)'
        // };
        const params = {
            TableName: "BroadcastOrder",
            IndexName: 'customerOrderIndex',
            KeyConditionExpression: 'customerOrderId = :customerOrderId',
            ExpressionAttributeValues: {
                ':customerOrderId': data.customerOrderId
            }
        };
        const res = await DynamoDBClient.query(params).promise();
        console.log("FETCH RESULT : ", res);
        const updateParams = {
            TableName: "BroadcastOrder",
            Key: {
                "broadcastOrderId": res.Items[0].broadcastOrderId
            },
            UpdateExpression: "set #status = :y, #acceptedAt = :timestamp",
            ExpressionAttributeNames: {
                "#status": "status",
                "#acceptedAt": "acceptedAt"
            },
            ExpressionAttributeValues: {
                ":y": "ACCEPTED",
                ":timestamp": timestamp
            }
        };

        const updateRes = await DynamoDBClient.update(updateParams).promise();

        console.log("UPDATE RESULT : ")
        console.log(updateRes);

        context.succeed(body);
    } catch (err) {
        context.fail(err);
    }
}