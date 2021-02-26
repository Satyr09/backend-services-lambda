const { getDynamoDBQueriedDataPaginated} = require("../../../utils/ddb-pagination")

const getServiceOrdersForSP = async (documentClient, serviceProviderId) => {
    const ddbParams = {
        TableName: 'ServiceOrder',
        IndexName: 'serviceProviderIndex',
        KeyConditionExpression: 'serviceProviderId = :serviceProviderId',
        ExpressionAttributeValues: {
          ':serviceProviderId': serviceProviderId
        }
      };
    const allServiceOrders = await getDynamoDBQueriedDataPaginated(documentClient, ddbParams);
    console.log("ServiceOrder query result :  ", allServiceOrders)

    return allServiceOrders;
}


const getServiceOrdersForCustomer = async () => {

    return null;
}

module.exports = {
    getServiceOrdersForSP,
    getServiceOrdersForCustomer
}