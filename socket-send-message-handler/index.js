const aws = require("aws-sdk")
const DynamoDB = require("aws-sdk/clients/dynamodb");
//const awsConfig = require("./awsconfig")

const apigatewayManagementApi = new aws.ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: 'kb14hb5n02.execute-api.ap-south-1.amazonaws.com/staging',
});
const documentClient = new DynamoDB.DocumentClient({
    "region": "ap-south-1"
})


exports.handler = async (event, context, callback) => {


    const messageData = JSON.parse(event.body);

    const ddbParams = {
        TableName: 'SocketConnectionIdMapping',
        Key: {
            userName: messageData.username
        }
    };

    const connectionData = await documentClient.get(ddbParams).promise();
    console.log(connectionData);
    
    const connectionId = connectionData.Items[0].connectionId;

    const socketParams = {
        ConnectionId: connectionId,
        Data: event.body.messageString,
    };
    await apigatewayManagementApi.postToConnection(socketParams).promise();
}