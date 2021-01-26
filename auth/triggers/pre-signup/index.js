var AWS = require('aws-sdk');

exports.handler = (event, context, callback) => {

    console.log(event.request.userAttributes);
    console.log(event);
    event.response.autoConfirmUser = true;

    // Set the email as verified if it is in the request
    if (event.request.userAttributes.hasOwnProperty("email")) {
        event.response.autoVerifyEmail = true;
    }

    // Set the phone number as verified if it is in the request
    if (event.request.userAttributes.hasOwnProperty("phone_number")) {
        event.response.autoVerifyPhone = true;
    }
    
      var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
      var params = {
        GroupName: 'Editors', //The name of the group in you cognito user pool that you want to add the user to
        UserPoolId: event.userPoolId, 
        Username: event.userName 
      };
      cognitoidentityserviceprovider.adminAddUserToGroup(params, function (err, data) {
        if (err) {
          callback(err) // an error occurred
        }
        console.log("Successfully added : ", params);
        callback(null, event);           // successful response
      });
  
    // Return to Amazon Cognito
    callback(null, event);
};