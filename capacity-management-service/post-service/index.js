const { mapPayloadToDatabaseEntry } = require("../utils/transformations");
const { formErrorResponse, formOKResponse } = require("../utils/response");
const validateAsset = require("../utils/validations");

const handler = async (event, DynamoDBClient, SERVICE_PROVIDER_TABLE) => {
    const asset = JSON.parse(event.body);
    if(!validateAsset(asset)) {
        return formErrorResponse("Must specify asset owner, type and location", 403)
    }
    const dynamoDBParams = {
        TableName : SERVICE_PROVIDER_TABLE,
        Item : mapPayloadToDatabaseEntry(asset)
    }
    const response = await DynamoDBClient.put(dynamoDBParams).promise();

    return formOKResponse(response);
}
module.exports = {handler};