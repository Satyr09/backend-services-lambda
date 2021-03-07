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

    try{
        const data = await documentClient.get(params).promise();
        console.log(data)
        return data.Item
    }catch(err) {
        console.log(err)
    }
}

const createNewProcess = async process => {
    const params = {
        TableName: awsConfigs.TableName,
        Item:{
            ...process
        }
    }; 
    console.log("INSERTING INTO DATABASE ........")
    try{
        console.log("PARAMS " ,params)
        const res = await documentClient.put(params).promise();
        console.log("RESPONSE FROM DB : ", res)
        return res;
    }catch(err) {
        console.log(err)
    }
}
const updateProcess = async process => {
    const params = {
        TableName: awsConfigs.TableName,
        Item:{
            ...process,
            lastModifiedAt : new Date().toUTCString()
        }
    }

    try{
        console.log("PARAMS " ,params)
        const res = await documentClient.put(params).promise();
        console.log("RESPONSE FROM DB : ", res)
        return res;
    }catch(err) {
        console.log(err)
    }
}

module.exports = {
    getProcessById,
    createNewProcess,
    updateProcess : updateProcess
}