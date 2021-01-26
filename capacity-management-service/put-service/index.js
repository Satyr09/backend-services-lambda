const { formErrorResponse, formOKResponse } = require("../utils/response");
const { mapPayloadToDatabaseEntry } = require("../utils/transformations");
const validateAsset = require("../utils/validations");

const handler = async (event, DynamoDBClient, SERVICE_PROVIDER_TABLE) => {
    const asset = JSON.parse(event.body);

    if(!validateAsset(asset)) {
        return formErrorResponse("Must specify asset owner, type and location", 403)
    }

    const params = {
        TableName: SERVICE_PROVIDER_TABLE,
        Key: { 
            'ownerId': asset.owner, 
            'assetType_assetId' : asset.type+"_"+asset.assetId 
        }
    };

    const existingData = await DynamoDBClient.get(params).promise();
    const existingItem = existingData.Item;
    if(!existingItem) {
        return formErrorResponse("No such item exists", 404)
    }
    if(existingItem.assetType !== asset.type) {
        return formErrorResponse("Cannot change asset type", 403)
    }

    const newData = mapPayloadToDatabaseEntry(asset);
    const dynamoDBParams = {
        TableName : SERVICE_PROVIDER_TABLE,
        Item : newData,
        ReturnValues: "ALL_OLD"
    }
    const response = await DynamoDBClient.put(dynamoDBParams).promise();
    console.log(response)
    return formOKResponse({old : response.Attributes, new : newData});
}
module.exports = {handler};