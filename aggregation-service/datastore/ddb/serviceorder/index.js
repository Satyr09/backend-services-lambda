const { getDynamoDBQueriedDataPaginated} = require("../../../utils/ddb-pagination")

const getServiceOrdersForSP = async (documentClient, params) => {
    const ddbParams = {
        TableName: 'ServiceOrder',
        IndexName: 'serviceProviderIndex',
        KeyConditionExpression: 'serviceProviderId = :serviceProviderId',
        ExpressionAttributeValues: {
          ':serviceProviderId': params.serviceProviderId
        }
      };
    const allServiceOrders = await getDynamoDBQueriedDataPaginated(documentClient, ddbParams);
    console.log("Broadcast order scan result :  ", allServiceOrders)

    return allServiceOrders;
}


const getServiceOrdersForCustomer = async () => {

    return null;
}

module.exports = {
    getServiceOrdersForSP,
    getServiceOrdersForCustomer
}