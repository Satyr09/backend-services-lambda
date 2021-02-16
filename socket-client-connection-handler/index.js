const DynamoDB = require("aws-sdk/clients/dynamodb");
const awsConfig = require("./awsconfig")

const DocumentClient = new DynamoDB.DocumentClient({
    "region": awsConfig.REGION
})


exports.handler = async (event, context, callback) => {
    const connectionId = event.requestContext.connectionId;
    await addConnectionId(connectionId);  
    const response = {
        statusCode: 200,
        body: JSON.stringify('Connection created  : '+connectionId),
    };
    return response;
}

const addConnectionId = async (connectionId) => {
    return DocumentClient.put({
        TableName: awsConfig.TABLENAME ,
        Item: {
            userName: 'daipayan',
            connectionId: connectionId,
            createdAt: new Date().toUTCString()
        }
    }).promise();
}