const AWS = require('aws-sdk');
AWS.config.update({ region: 'ap-southeast-1' });

const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({
    apiVersion: '2016-04-18'
});
const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*"
}

const formErrorResponse = (response, statusCode = 501) => {
    return {
        statusCode: statusCode,
        body: JSON.stringify(response),
        headers: headers
    }
}
const formOkResponse = response => {
    return {
        statusCode: 200,
        body: JSON.stringify(response),
        headers: headers
    }
}
const userPoolIdMap = {
    "customer" : "ap-south-1_qf0VKxrX9",
    "serviceProvider" : "ap-south-1_HA56Y5t61"
}
exports.handler = async (event, context) => {
    const data = JSON.parse(event.body);
    const UserAttributes = [];

    if (data.email) {
        UserAttributes.push({
            Name: 'email',
            Value: data.email
        })
    }
    if (data.phoneNumber) {
        UserAttributes.push({
            Name: 'phone_number',
            Value: data.phoneNumber
        })  
    }
    try{
        await cognitoidentityserviceprovider.adminUpdateUserAttributes({
            UserAttributes,
            UserPoolId: userPoolIdMap[event.userType],
            Username: data.userName
        })
    }catch(err) {
        return formErrorResponse({
            message : "Something failed"
        })
    }

    return formOkResponse({
        message : "Success"
    })
}


