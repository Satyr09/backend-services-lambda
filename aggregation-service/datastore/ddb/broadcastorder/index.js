const { getDynamoDBScannedDataPaginated } = require("../../../utils/ddb-pagination");

const getBroadcastOrderForSP = async (documentClient) => {
    const params = {
        TableName : "BroadcastOrder"
    }
    const allBroadcastOrders = await getDynamoDBScannedDataPaginated(documentClient, params);
    console.log("Broadcast order scan result :  ", allBroadcastOrders.length)
    return allBroadcastOrders;
}


const getBroadcastOrderForCustomer = async () => {

    return null;
}

module.exports = {
    getBroadcastOrderForSP,
    getBroadcastOrderForCustomer
}