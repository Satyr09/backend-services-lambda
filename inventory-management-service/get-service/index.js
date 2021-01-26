const { formErrorResponse, formOKResponse } = require("../utils/response");
const { mapDatabaseEntryToPayload } = require("../utils/transformations");

const handler = async (event, DynamoDBClient, INVENTORY_TABLE) => {
    const queryParameters = event.queryStringParameters;

    let response = null;
    switch(queryParameters.type) {
        case "id" :
            response = await getById(queryParameters.productId, DynamoDBClient, INVENTORY_TABLE)
            break;
        case "owner":
            response = await getByOwner(queryParameters, DynamoDBClient, INVENTORY_TABLE)
            break;
        case "location":
            return formErrorResponse("Location based services unavailable at the moment", 501)
        default:
            return formErrorResponse("Incorrect query type", 404)
    }

    return formOKResponse(response)
}

const getById = async (productId,DynamoDBClient,INVENTORY_TABLE) => {

    var params = {
        TableName: INVENTORY_TABLE,
        IndexName: 'productIdIndex',
        KeyConditionExpression: 'productId = :productId',
        ExpressionAttributeValues: {
          ':productId': productId
        }
      };
      const res = await DynamoDBClient.query(params).promise();
      const response = res.Items.map(
        Item => mapDatabaseEntryToPayload(Item)
    )
    console.log("Retrived : ", response);
    return response;
}

const getByOwner = async (queryParameters,DynamoDBClient,INVENTORY_TABLE) => {

    let params = null;
    if(queryParameters.ownerId) {

        if(queryParameters.productType) {
        
        
            if(queryParameters.productName) {
                params  = {
                    TableName: INVENTORY_TABLE,
                    KeyConditionExpression: 'ownerId = :ownerId and begins_with(#sort_key, :product)',
                    IndexName: 'productTypeNameIndex',
                    ExpressionAttributeNames: {
                        "#sort_key" : 'productType_productId'
                    },
                    ExpressionAttributeValues: {
                      ':ownerId': queryParameters.ownerId,
                      ':product' : queryParameters.productType+"_"+queryParameters.productName
                    }
                  };
            }
            params  = {
                TableName: INVENTORY_TABLE,
                KeyConditionExpression: 'ownerId = :ownerId and begins_with(#sort_key, :product)',
                ExpressionAttributeNames: {
                    "#sort_key" : 'productType_productId'
                },
                ExpressionAttributeValues: {
                  ':ownerId': queryParameters.ownerId,
                  ':product' : queryParameters.productType
                }
              };
        }else {
            params = {
                TableName: INVENTORY_TABLE,
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