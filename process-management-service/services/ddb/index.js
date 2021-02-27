const DynamoDB = require("aws-sdk/clients/dynamodb");
const { awsConfigs } = require("../../awsConfigs");
const documentClient = new DynamoDB.DocumentClient({
    "region" : awsConfigs.region
})

const getProcessById = async (processId) => {
    const params = {
        TableName: awsConfigs.TableName,
        Key:{
            processId : processId
        }
    };

    const data = await documentClient.get(params).promise();
    return data.Items
}

const createNewProcess = async process => {
    const params = {
        TableName: awsConfigs.TableName,
        Item:{
            ...process
        }
    }; 
    const res = await documentClient.put(params).promise();
    return res;
}
const updateProcess = async process => {
    const params = {
        TableName: awsConfigs.TableName,
        Item:{
            ...process,
            lastUpdatedAt : new Date().toUTCString()
        }
    }
    const res = await documentClient.put(params).promise();
    return res;
}

module.exports = {
    getProcessById,
    createNewProcess,
    updateProcess : updateProcess
}