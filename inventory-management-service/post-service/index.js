const { mapPayloadToDatabaseEntry } = require("../utils/transformations");
const { formErrorResponse, formOKResponse } = require("../utils/response");
const {validateProduct} = require("../utils/validations");

const handler = async (event, DynamoDBClient, INVENTORY_TABLE) => {
    const product = JSON.parse(event.body);
    if(!validateProduct(product)) {
        return formErrorResponse("Must specify product owner, location, type and name", 403)
    }
    const dynamoDBParams = {
        TableName : INVENTORY_TABLE,
        Item : mapPayloadToDatabaseEntry(product)
    }
    const response = await DynamoDBClient.put(dynamoDBParams).promise();

    return formOKResponse(response);
}
module.exports = {handler};