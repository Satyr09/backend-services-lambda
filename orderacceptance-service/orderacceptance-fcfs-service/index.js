const AWS = require("aws-sdk")
const uuid = require("uuid")
const DynamoDB = new AWS.DynamoDB();
const awsConfig = require("./awsconfig");

const ORDER_ACCEPTANCE_DB = awsConfig.ORDER_ACCEPTANCE_DB;
exports.handler = async (event, context) => {
    const record = event.Records[0];
    const { body } = record;
    const data = JSON.parse(body);
    
    console.log(data);
    console.log("service provider id : ", data.serviceProviderId);
    const dynamodbParams = {
        TableName: ORDER_ACCEPTANCE_DB,
        Item: {
            "ServiceOrderId": {S : uuid.v4()},
            "customerOrderId" : {S : data.customerOrderId},
            "serviceProviderId": {S : data.serviceProviderId},
            "createdAt": {S : new Date().getTime().toString()}
        },
        ConditionExpression: 'attribute_not_exists(ServiceOrderId)'
    };
    try{
        const info = await DynamoDB.putItem(dynamodbParams).promise();
        console.log("DID NOT ERROR OUT")
        console.log(info, "INFORMATION POSTED");
        context.succeed(body);
    }catch(err) {
        context.fail(err);
    }
}