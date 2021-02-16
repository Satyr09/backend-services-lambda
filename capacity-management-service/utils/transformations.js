const uuid = require("uuid");


const mapDatabaseEntryToPayload = entry => {
    const data =  {
        owner : entry.ownerId,
        type: entry.assetType,
        assetId : entry.assetId,
        assetNumber: entry.assetNumber,
        capabilities : entry.capabilities || [],
        capacity: entry.capacity,
        availableFromDateTime : entry.availableFromDateTime,
        availableToDateTime: entry.availableToDateTime,
        ownershipType : entry.ownershipType,
        pincode : entry.pincode || null,
        location: entry.assetLocation || null,
        createdAt: entry.createdAt,
        lastModifiedAt: entry.lastModifiedAt
    }
    return data;
}
const mapPayloadToDatabaseEntry = payload => {
    const timestamp = new Date();
    const timestampOneYear = timestamp.setFullYear(timestamp.getFullYear() + 1);
    const assetId = payload.assetId || uuid.v4();


    const data =  {
        ownerId : payload.owner,
        assetType: payload.type,
        assetNumber: payload.assetNumber,
        capabilities : payload.capabilities || [],
        capacity: payload.capacity,
        availableFromDateTime : payload.availableFromDateTime || timestamp.toString(),
        availableToDateTime: payload.availableToDateTime || timestampOneYear.toString(),
        ownershipType : payload.ownershipType,
        pincode : payload.pincode || null,
        assetLocation: payload.location || null,
        createdAt : new Date().toString(),
        lastModifiedAt: new Date().toString()
    }

    
    /**
     * Form composite keys for indexing purposes;
     */
    const assetType_assetId = payload.type+"_"+assetId;
    const assetLocation_assetType_assetId = payload.location+"_"+assetType_assetId;
    data.assetId = assetId;
    data.assetLocation_assetType_assetId = assetLocation_assetType_assetId;
    data.assetType_assetId = assetType_assetId;

    console.log("Transformed data", data)
    return data;
}


module.exports = {
    mapPayloadToDatabaseEntry,
    mapDatabaseEntryToPayload
}