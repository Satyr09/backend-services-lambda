const AWS = require('aws-sdk');
const SNS = AWS.SNS;

function generateRandomNumber (min, max) {
    return Math.floor(Math.random() * (max - min) + min);
 }

exports.handler = async event => {

    let secretLoginCode;
    const mobileNo = event.request.userAttributes.phone_number;
    let res = "";
    if (!event.request.session || !event.request.session.length) {

        // This is a new auth session
        // Generate a new secret login code and mail it to the user
        secretLoginCode = generateRandomNumber(1000,9999);
        console.log(event.request.userAttributes);
        res = await sendSMS(mobileNo, secretLoginCode);

    } else {

        // There's an existing session. Don't generate new digits but
        // re-use the code from the current session. This allows the user to
        // make a mistake when keying in the code and to then retry, rather
        // the needing to e-mail the user an all new code again.    
        const previousChallenge = event.request.session.slice(-1)[0];
        secretLoginCode = previousChallenge.challengeMetadata.match(/CODE-(\d*)/)[1];
    }

    // This is sent back to the client app
    event.response.publicChallengeParameters = {
        phonenumber: mobileNo,//event.request.userAttributes.email,
        res: res,
        message: "Your SMS should have been sent by now",
        userAttributes: JSON.stringify(event.request.userAttributes),
        secretLoginCode
    };

    // Add the secret login code to the private challenge parameters
    // so it can be verified by the "Verify Auth Challenge Response" trigger
    event.response.privateChallengeParameters = { answer : secretLoginCode };

    // Add the secret login code to the session so it is available
    // in a next invocation of the "Create Auth Challenge" trigger
    event.response.challengeMetadata = `CODE-${secretLoginCode}`;

    return event;
};

async function sendSMS (mobileNo, secretLoginCode) {
    const params = {
        Message: "Welcome! your mobile verification code is: " + secretLoginCode, /* required */
        PhoneNumber: mobileNo,
         MessageAttributes: {
            'AWS.SNS.SMS.SenderID': {
                'DataType': 'String',
                'StringValue': "GOFlexeAWS"
            }
        }
    };
    return new SNS({apiVersion: "2010–03–31", region: "ap-south-1"}).publish(params).promise()
    .then(message => {
        console.log("OTP SENT SUCCESSFULLY");
    })
    .catch(err => {
        console.log("Error "+err)
        return err;
    });
}