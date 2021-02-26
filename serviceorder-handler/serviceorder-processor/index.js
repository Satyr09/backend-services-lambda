const DynamoDB = require("aws-sdk/clients/dynamodb");
//const { v4: uuidv4 } = require('uuid');
const awsConfig = require("./awsconfig");

const documentClient = new DynamoDB.DocumentClient({
    "region": awsConfig.REGION
})

const TABLE_NAME = awsConfig.SERVICE_ORDER_TABLE_NAME;


exports.handler = async (event, context) => {
    //const method = event.httpMethod;
    const data = JSON.parse(event.body);
    console.log(data);
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
    }

    //const pathParameter = event.pathParameters;
    let responseMessage = null;
    let statusCode = 200;

    try {
        // switch(pathParameter.type) {
        //     case "new":
        //         responseMessage = await handleNewServiceOreder(data);
        //         break;

        //     case "edit":
        //         responseMessage = await handleExistingServiceOrder(data);
        //         break;
        //     default:
        //         statusCode = 404;
        //         responseMessage = "No such route exists"
        //         break;
        // }
        responseMessage = await handleExistingServiceOrder(data);
    } catch (err) {
        statusCode = 501;
        responseMessage = JSON.stringify(err)
    }
    return {
        "statusCode": statusCode,
        "body": JSON.stringify(responseMessage),
        "headers": headers
    }
}

// const handleNewServiceOreder = async data => {
//     const ServiceOrderId = uuidv4();

//     const params = {
//         TableName:TABLE_NAME,
//         Item:{
//             "ServiceOrderId": ServiceOrderId
//         }
//     };

//     return new Promise((resolve, reject) => {

//         DocumentClient.put(params, (err, data) => {
//             if(err)
//                 reject(err)
//             else {
//                 resolve(JSON.stringify(data));
//             }
//         })
//     })
// }

const handleExistingServiceOrder = async data => {
    const id = data.serviceOrderId;

    const params = {
        TableName: TABLE_NAME,
        Key: { 'ServiceOrderId': id }
    };
    console.log(params)
    delete data.serviceOrderId;

    const existingData = await documentClient.get(params).promise();
    const newData = {
        ...(existingData.Item),
        ...data
    }

    try{
        if(data.trucks) {
            return await handleServiceOrderWithCapacityUpdate(newData);
        } else {
            console.log("EXISTING DATA ", existingData)
            console.log("NEW DATA ", newData);
            const putPayload = {
                TableName: TABLE_NAME,
                Item: newData
            }; 
            return await documentClient.put(putPayload).promise();
        }
    } catch(err) {
        console.log(err);
    }
    
}

const handleServiceOrderWithCapacityUpdate = async data => {    

    const transactItems = data.trucks.map(
        truck => {
            return {
                Update : {
                    TableName : "ServiceProviderCapacity",
                    Key : {"ownerId": truck.ownerId, "assetType_assetId" : truck.assetType_assetId},
                    UpdateExpression : 'set #capacity = #capacity - :capacityUsed',
                    ConditionExpression: '#capacity >= :capacityUsed',
                    ExpressionAttributeNames : {"#capacity" : "capacity"},
                    ExpressionAttributeValues : {":capacityUsed" : truck.capacityUsed}
                }
            }
        }
    )
    const serviceOrderdata = {...data};
    serviceOrderdata.trucks.forEach(truck => {
        delete truck.assetType_assetId;
        delete truck.ownerId;
    });
    

    transactItems.push({
        Put :{
            TableName: TABLE_NAME,
            Item: serviceOrderdata
        }
    })
    const params = {
        TransactItems: transactItems
    };
      
    return await documentClient.transactWrite(params).promise();
}