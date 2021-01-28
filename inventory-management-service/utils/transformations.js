const uuid = require("uuid");


const mapDatabaseEntryToPayload = entry => {
    const data =  {
        owner : entry.ownerId,
        productType: entry.productType,
        productName: entry.productName,
        productId : entry.productId,
        features : entry.features || [],
        length: entry.length,
        width: entry.width,
        height: entry.height,
        weightPerUnit : entry.weightPerUnit,
        pincode : entry.pincode || null,
        location: entry.productLocation || null,
        createdAt: entry.createdAt,
        lastModifiedAt: entry.lastModifiedAt
    }
    return data;
}
const mapPayloadToDatabaseEntry = payload => {
    const productId = payload.productId || uuid.v4();

    const data =  {
        ownerId : payload.owner,
        productType: payload.productType,
        productName: payload.productName,
        features : payload.features || [],
        width: payload.width,
        height: payload.height,
        length: payload.length,
        weightPerUnit : payload.weightPerUnit,
        pincode : payload.pincode || null,
        productLocation: payload.location || null,
        createdAt : new Date().toString(),
        lastModifiedAt: new Date().toString()
    }

    
    /**
     * Form composite keys for indexing purposes;
     */
    const productType_productId = payload.productType+"_"+productId;
    const productLocation_productType_productId = payload.location+"_"+productType_productId;
    const productType_productName_productId = payload.productType+"_"+payload.productName+"_"+productId;



    data.productId = productId;
    data.productLocation_productType_productId = productLocation_productType_productId;
    data.productType_productId = productType_productId;
    data.productType_productName_productId = productType_productName_productId;

    console.log("Transformed data", data)
    return data;
}


module.exports = {
    mapPayloadToDatabaseEntry,
    mapDatabaseEntryToPayload
}