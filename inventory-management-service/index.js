const DynamoDB = require("aws-sdk/clients/dynamodb");
const awsConfig = require("./awsConfig")
const postService = require("./post-service/index");
const putService = require("./put-service/index");
const getService = require("./get-service/index");
//const deleteService = require("./delete-service/index");
const { formErrorResponse } = require("./utils/response");


const DynamoDBClient = new DynamoDB.DocumentClient({
    region : awsConfig.region
})

const INVENTORY_TABLE  = awsConfig.tableName;


exports.handler = async (event, context) => {
    switch(event.httpMethod) {
        case "POST" :
            return await postService.handler(event, DynamoDBClient, INVENTORY_TABLE);
        case "PUT" :
            return await putService.handler(event, DynamoDBClient, INVENTORY_TABLE);
        case "GET" :
            return await getService.handler(event, DynamoDBClient, INVENTORY_TABLE);
        // case "DELETE" :
        //     return deleteService.handler(event, DynamoDBClient, SERVICE_PROVIDER_TABLE);
        default:
            return formErrorResponse("Invalid action", 404);
    }
}
