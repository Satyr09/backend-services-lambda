const { SQS } = require("aws-sdk");
const DynamoDB = require("aws-sdk/clients/dynamodb");
const { v4: uuidv4 } = require('uuid');
const awsResourceConfigs = require("./awsconfig");

const DynamoDBClient = new DynamoDB.DocumentClient({
    "region" : awsResourceConfigs.region
})

const tableName = awsResourceConfigs.customerOrderTableName;

exports.handler = async (event, context) => {
    const headers = {
        "Access-Control-Allow-Origin" : "*",
        "Access-Control-Allow-Headers": "*" 
    }
    const httpMethod = event.httpMethod;
    const pathParameter = event.pathParameters;
    const body = JSON.parse(event.body);

    console.log(httpMethod);
    console.log(pathParameter)

    let responseData = null;
    try{
        switch (httpMethod) {
            case "GET":
                responseData = await fetchCustomerOrder(pathParameter);
                break;
            case "POST":
                responseData = await writeCustomerOrder(body);
                break;
            default:
                throw new Error("Functionality unavailable.")
        }
    }
    catch(err) {
        console.log(err);
        return {
            "statusCode" : 501,
            "body" : "Something went wrong",
            "headers" : headers
        } 
    }
    
    const response = {
        "statusCode" : 200,
        "body" : JSON.stringify(responseData),
        "headers" : headers
    }
    return response;
}

const writeCustomerOrder = async (orders) => {
    const batchWriteItems = [];
    const response = [];

    orders.customerOrders.forEach(
        order => {
            const Item = {...order, OrderId:uuidv4()};
            response.push(Item);
            batchWriteItems.push(
                    {
                        PutRequest : {
                            Item : Item
                    }
                }
            )
        }
    )
    const params = {
        RequestItems: {
            "CustomerOrder" : batchWriteItems
        }
    };
    
    console.log(params);
    const _ = await DynamoDBClient.batchWrite(params).promise();

    await Promise.all(
        response.map(
            async Item => {
                const queueParams = {
                    MessageBody : JSON.stringify(Item),
                    QueueUrl : awsResourceConfigs.customerOrderQueue,
                    MessageGroupId: Item.Orderid,
                    //MessageDeduplicationId: "1"
                }
                const info = await new SQS().sendMessage(queueParams).promise();
                console.log("MESSAGE POSTED : ", info)
            }
        )
    )
    return response;
}
const fetchCustomerOrder = async pathParameter => {
    let data = null;
    if(pathParameter.customerEmail)
        data =  await fetchOrdersByCustomer(pathParameter.customerEmail);
    else if(pathParameter.orderId)
        data = await fetchCustomerOrderById(pathParameter.orderId);
    return data;
}
const fetchCustomerOrderById = async orderId => {
    var params = {
        TableName: tableName,
        Key:{
            OrderId : orderId
        }
    };

    const data = await DynamoDBClient.get(params).promise();
    console.log(data , " " , orderId )
    return data;
}

const fetchOrdersByCustomer = async customerEmail => {
    var params = {
        TableName: tableName,
        IndexName: 'customerEmail-index',
        KeyConditionExpression: 'customerEmail = :email',
        ExpressionAttributeValues: {
          ':email': customerEmail,
        }
      };
            
      const data = await DynamoDBClient.query(params).promise();
      return data.Items
}