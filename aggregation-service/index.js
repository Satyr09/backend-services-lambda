const DynamoDB = require("aws-sdk/clients/dynamodb");
const awsConfig = require("./awsConfig");
const Customer = require("./stat-owner/customer");
const ServiceProvider = require("./stat-owner/service-provider");


const documentClient = new DynamoDB.DocumentClient({
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

    console.log(context)
    console.log(event)
    console.log("------------BODY-------------------")
    console.log(event.body)
    const body = JSON.parse(event.body);

    console.log("Request received : ", body)

    switch (body.type) {
        case "all" :
            break;
        case "service-provider":
            return formOKResponse(await ServiceProvider.getOrderStats(documentClient,body));
        case "customer":
            return formOKResponse(await Customer.getOrderStats(documentClient, body))
        case "broadcast-order":
            break;
        case "customer-order":
            break;
        case "finance":
            break;
        case "capacity":
            break;
        case "inventory":
            break;
    }

    return formErrorResponse("Incorrect query type, currently supported query types: service-provider. Send this value in the type attribute along with other params in the body")
}