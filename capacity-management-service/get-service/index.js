const { formErrorResponse, formOKResponse } = require("../utils/response");
const { mapDatabaseEntryToPayload } = require("../utils/transformations");

const handler = async (event, DynamoDBClient, SERVICE_PROVIDER_TABLE) => {
    const queryParameters = event.queryStringParameters;

    let response = null;
    switch(queryParameters.type) {
        case "id" :
            response = await getById(queryParameters.assetId, DynamoDBClient, SERVICE_PROVIDER_TABLE)
            break;
        case "owner":
            response = await getByOwner(queryParameters, DynamoDBClient, SERVICE_PROVIDER_TABLE)
            break;
        case "location":
            return formErrorResponse("Location based services unavailable at the moment", 501)
        default:
            return formErrorResponse("Incorrect query type", 404)
    }

    return formOKResponse(response)
}

const getById = async (assetId,DynamoDBClient,SERVICE_PROVIDER_TABLE) => {

    var params = {
        TableName: SERVICE_PROVIDER_TABLE,
        IndexName: 'assetIdIndex',
        KeyConditionExpression: 'assetId = :assetId',
        ExpressionAttributeValues: {
          ':assetId': assetId
        }
      };
      const res = await DynamoDBClient.query(params).promise();
      const response = res.Items.map(
        Item => mapDatabaseEntryToPayload(Item)
    )
    console.log("Retrived : ", response);
    return response;
}

const getByOwner = async (queryParameters,DynamoDBClient,SERVICE_PROVIDER_TABLE) => {

    let params = null;
    if(queryParameters.ownerId) {
        if(queryParameters.asset) {
            params  = {
                TableName: SERVICE_PROVIDER_TABLE,
                KeyConditionExpression: 'ownerId = :ownerId and begins_with(#sort_key, :asset)',
                ExpressionAttributeNames: {
                    "#sort_key" : 'assetType_assetId'
                },
                ExpressionAttributeValues: {
                  ':ownerId': queryParameters.ownerId,
                  ':asset' : queryParameters.asset
                }
              };
        }else {
            params = {
                TableName: SERVICE_PROVIDER_TABLE,
                KeyConditionExpression: 'ownerId = :ownerId',
                ExpressionAttributeValues: {
                  ':ownerId': queryParameters.ownerId,
                }
              };
        }
    }  
    const res =  await DynamoDBClient.query(params).promise();
    const response = res.Items.map(
        Item => mapDatabaseEntryToPayload(Item)
    )
    console.log("Retrived : ", response)
    return response;
}

module.exports = {handler}