const DynamoDB = require("aws-sdk/clients/dynamodb");
const {process : serviceProviderKYCprocess}  = require("./serviceproviderkyc");
const {process : customerKYCprocess } = require("./customerkyc");
const DynamoDBClient = new DynamoDB.DocumentClient({
    "region" : "ap-south-1"
})
const headers = {
    "Access-Control-Allow-Origin" : "*",
    "Access-Control-Allow-Headers": "*" 
}    

const KYCTypeMap = {
    "customer" : "Customer",
    "serviceprovider" : "ServiceProvider"
}
const fetchKYC = async (event) => {
    let tableName;
    
    if(event.queryStringParameters.type==="serviceprovider") {
        tableName = "ServiceProviderInformation"
    } else {
        tableName = "CustomerInformation";
    }

    const params = {
        TableName: tableName,
        KeyConditionExpression: 'id = :id',
        ExpressionAttributeValues: {
          ':id': event.queryStringParameters.id
        }
      };
      const res = await DynamoDBClient.query(params).promise();
      const data = res.Items;

      return {
        statusCode: 200,
        body: JSON.stringify(data),
        headers 
      }
}
exports.handler = async (event) => {
   
    const data = JSON.parse(event.body);
    
    if(event.httpMethod === "GET") {
        return await fetchKYC(event);
    }

    if(!data.id) {
       const failureResponse = {
            statusCode: 404,
            body: JSON.stringify('User id must be specified'),
            headers
        };
        return failureResponse; 
    }
    
    console.log(data)
    let result;

    /*
        Possibly separate into two different lambdas, or same lambda on two diff routes
        and then perform the switch on request path.    
    */
    switch(KYCTypeMap[data.type]) {
        case "ServiceProvider" :
            result = await serviceProviderKYCprocess(data, DynamoDBClient);
            break;
        case "Customer":
            result = await customerKYCprocess(data, DynamoDBClient);
            break;
        default:
            return {
                statusCode: 404,
                body: JSON.stringify('type attribute must be specified as one of serviceprovider or customer'),
                headers
            };
    }
    const response = {
        statusCode: 200,
        body: JSON.stringify(result),
        headers
    };
    return response;
};
