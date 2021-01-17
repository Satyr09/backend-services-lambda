const DynamoDB = require("aws-sdk/clients/dynamodb");
const {process : serviceProviderKYCprocess}  = require("./serviceproviderkyc");
const {process : customerKYCprocess } = require("./customerkyc");
const DynamoDBClient = new DynamoDB.DocumentClient({
    "region" : "ap-south-1"
})



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
    switch(data.type) {
        case "Customer" :
            result = serviceProviderKYCprocess(data, DynamoDBClient);
            break;
        case "ServiceProvider":
            result = customerKYCprocess(data, DynamoDBClient);
            break;
        default:
            return {
                statusCode: 404,
                body: JSON.stringify('type attribute must be specified as one of ServiceProvider or Customer'),
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
