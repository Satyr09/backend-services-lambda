const { getDynamoDBQueriedDataPaginated } = require("../../../utils/ddb-pagination")

const getCustomerOrderForCustomer = async (documentClient, params) => {
    const ddbParams = {
        TableName : "CustomerOrder",
        IndexName: 'customerEmail-index',
        KeyConditionExpression: 'customerEmail = :customerEmail',
        ExpressionAttributeValues: {
          ':customerEmail': params.customerId
        }
    }
    const customerOrders = await getDynamoDBQueriedDataPaginated(documentClient, ddbParams);
    console.log("Customer order query result :  ", customerOrders)
    return customerOrders;
}


module.exports = {
    getCustomerOrderForCustomer
}