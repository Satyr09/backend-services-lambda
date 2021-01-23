const DynamoDB = require("aws-sdk/clients/dynamodb");
const {process : serviceProviderKYCprocess}  = require("./serviceproviderkyc");
const {process : customerKYCprocess } = require("./customerkyc");
const DynamoDBClient = new DynamoDB.DocumentClient({
    "region" : "ap-south-1"
})
const KYCTypeMap = {
    "customer" : "Customer",
    "serviceprovider" : "ServiceProvider"
}

exports.handler = async (event) => {
    const headers = {
        "Access-Control-Allow-Origin" : "*",
        "Access-Control-Allow-Headers": "*" 
    }    
    const data = JSON.parse(event.body);
    
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
