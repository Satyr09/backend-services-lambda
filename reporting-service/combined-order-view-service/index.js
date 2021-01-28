const DynamoDB = require("aws-sdk/clients/dynamodb");
const awsConfig = require("./awsConfig")
const DynamoDBClient = new DynamoDB.DocumentClient({
    region : awsConfig.region
})
const headers = {
    "Access-Control-Allow-Origin" : "*",
    "Access-Control-Allow-Headers": "*" 
}

const formErrorResponse = (message, statusCode = 501) => {
    const response = {
        "statusCode" : statusCode,
        "body" : message,
        "headers" : headers
    }

    return response;
}

const formOKResponse = (response, statusCode = 200) => {
    return {
        "statusCode" : statusCode,
        "body" : JSON.stringify(response),
        "headers" : headers
    }
}

exports.handler = async (event, context) => {
    console.log(" THIS IS THE EVENT : ")
    console.log(event)
    console.log(event.queryStringParameters)
    const customerOrderId = event.queryStringParameters.orderId;

    const customerOrderData = await getCustomerOrderData(customerOrderId);
    const serviceOrderData = await getServiceOrderData(customerOrderId);
    const broadcastOrderData = await getBroadcastOrderData(customerOrderId);

    const responseData = {
        customerOrderData,
        serviceOrderData,
        broadcastOrderData
    }

    return formOKResponse(responseData);
}
const getBroadcastOrderData = async customerOrderId => {
    const params = {
        TableName: "BroadcastOrder",
        IndexName: 'customerOrderIndex',
        KeyConditionExpression: 'customerOrderId = :customerOrderId',
        ExpressionAttributeValues: {
          ':customerOrderId': customerOrderId
        }
      };
      const res = await DynamoDBClient.query(params).promise();
      return res.Items;
}
const getCustomerOrderData = async customerOrderId => {
    console.log("Calling customer order db : ", customerOrderId)

    const params  = {
        TableName: awsConfig.customerOrderTable,
        KeyConditionExpression: 'OrderId = :customerOrderId',
        ExpressionAttributeValues: {
          ':customerOrderId': customerOrderId
        }
    };
    const response = await DynamoDBClient.query(params).promise();
    return response.Items;
}

const getServiceOrderData = async customerOrderId => {

    console.log("Calling service order db : ", customerOrderId)
    const params  = {
        TableName: awsConfig.serviceOrderTable,
        IndexName: 'customerOrderIndex',
        KeyConditionExpression: 'customerOrderId = :customerOrderId',
        ExpressionAttributeValues: {
          ':customerOrderId': customerOrderId
        }
    };
    const response = await DynamoDBClient.query(params).promise();
    return response.Items;
}