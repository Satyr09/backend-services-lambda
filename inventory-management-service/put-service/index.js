const { formErrorResponse, formOKResponse } = require("../utils/response");
const { mapPayloadToDatabaseEntry } = require("../utils/transformations");
const {validateProduct} = require("../utils/validations");

const handler = async (event, DynamoDBClient, SERVICE_PROVIDER_TABLE) => {
    const product = JSON.parse(event.body);

    if(!validateProduct(product)) {
        return formErrorResponse("Must specify product owner, location, type and name", 403)
    }

    const params = {
        TableName: SERVICE_PROVIDER_TABLE,
        Key: { 
            'ownerId': product.owner, 
            'productType_productId' : product.productType+"_"+product.productId 
        }
    };

    const existingData = await DynamoDBClient.get(params).promise();
    const existingItem = existingData.Item;
    if(!existingItem) {
        return formErrorResponse("No such item exists", 404)
    }
    if(existingItem.productType !== product.productType) {
        return formErrorResponse("Cannot change product type", 403)
    }

    const createdAtTimestamp = existingItem.createdAt;
    const newData = mapPayloadToDatabaseEntry(product);
    newData.createdAt = createdAtTimestamp;
    
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