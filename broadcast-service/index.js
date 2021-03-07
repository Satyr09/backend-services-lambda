const AWS = require("aws-sdk");
const DynamoDB = require("aws-sdk/clients/dynamodb");
AWS.config.region = 'ap-south-1';
const lambda = new AWS.Lambda();
const sendSMS = require("./communication-channels/sms");
const sendEmail = require("./communication-channels/email");
const uuid = require("uuid")
const DynamoDBClient = new DynamoDB.DocumentClient({
    region : "ap-south-1"
})
const sqs = new AWS.SQS();
const sqsQueueURL = "https://sqs.ap-south-1.amazonaws.com/183548183497/CustomerOrder.fifo";
/**
 * Fake formatting since frontend client does not yet have ability to demarcate between different kinds of products in the order
 * @param {*} rawData 
 */
const formatQueuePayload  = rawData => {
    const formattedData = {...rawData};
    formattedData.taskCategory = "PRODUCT";
    formattedData.taskSubCategory = "EDIBLES";
    return formattedData;
}


exports.handler = async function (event, context) {
    const record = event.Records[0];
    const { body } = record;

    console.log(body, "DATA RECEIVED")
    const customerOrder = JSON.parse(body);
    const formattedCustomerOrder = formatQueuePayload(customerOrder);

    const params = {
        FunctionName: "allocation-handler",
        InvocationType: 'RequestResponse',
        LogType: "Tail",
        Payload: JSON.stringify({ body: formattedCustomerOrder })
    }

    const data = await lambda.invoke(params).promise();
    const payload = JSON.parse(data.Payload);

    let partners = (JSON.parse(payload.body) || []);
    partners = partners.slice(0,process.env.BROADCAST_LIMIT);


    //TEST SERVICE PROVIDER - MEANT FOR DEBUGGING AND DEMO PURPOSES
    partners.push({
        Username: 'demodaipayan',
        Attributes: [
            { Name: 'sub', Value: 'demodaipayan' },
            { Name: 'email_verified', Value: 'true' },
            { Name: 'name', Value: ' ' },
            { Name: 'email', Value: 'daipayan@goflexe.com' }
        ],
        UserCreateDate: '2021-02-02T12:20:54.740Z',
        UserLastModifiedDate: '2021-02-02T12:20:54.740Z',
        Enabled: true,
        UserStatus: 'CONFIRMED'
    })


    console.log(partners)
    const returnData = [];

    const emailRecepients = [];
    const phoneRecepients = [];
    const receipients = [];
    const inAppReceipients = [];


    await Promise.all(
        partners.map(
            async partner => {
                console.log("Trying to send data : ", partner);
                const attributes = partner.Attributes;
                const phoneNumber = attributes.find(attribute => attribute.Name === "phone_number")
                                    ? attributes.find(attribute => attribute.Name === "phone_number").Value : null;
                const email = attributes.find(attribute => attribute.Name === "email") ?
                                    attributes.find(attribute => attribute.Name === "email").Value : null;

                const providerId = partner.Username;
                
                if(email)
                    emailRecepients.push(email)
                phoneRecepients.push(phoneNumber)
                receipients.push(providerId);


                console.log(email, " ", phoneNumber, " ", providerId);

                const orderId = customerOrder.OrderId || "123456789";
                inAppReceipients.push(providerId)
                let response  = null;
                try{
                    response = await sendSMS(phoneNumber, providerId, orderId);
                } catch(err) {
                    console.log("SMS Notifications for " , phoneNumber, " failed with error : ", err)
                }
                return response;
            }
        )
    )
    const orderId = customerOrder.OrderId;
    try{
        //Mail notifications-------------------------------------------------
        try{
            await sendEmail(orderId,null,emailRecepients)
        } catch(err) {
            console.log("Email notifications did not succeed completely." ,  err)
        }

        //In app notifications----------------------------------------------
        try {
            await Promise.all(
                inAppReceipients.map(async inAppReceipient => {
                    try {
                        const inAppNotifResponse =  await sendInAppNotification(inAppReceipient, orderId);
                        return inAppNotifResponse;
                    } catch(err) {
                        console.log("In app notification to ", inAppReceipient , " failed.")
                        return null;
                    }
                })
            )
        } catch(err) {
            console.log("In app notifications did not succeed completely, ", err.body)
        }


        //Creating entries in broadcast order table----------------------------------
        const databaseEntry = {
            customerOrderId : customerOrder.OrderId,
            broadcastOrderId : uuid.v4(),
            receipients,
            status : "PENDING"
        }
        const dynamoDBParams = {
            TableName : "BroadcastOrder",
            Item : databaseEntry
        }
        const response = await DynamoDBClient.put(dynamoDBParams).promise();

        console.log("RESPONSE FROM DATABASE : ", response)
    }catch(err) {
        console.log(err);
    }finally{
        const deleteMessageParams = {
            QueueUrl: sqsQueueURL,
            ReceiptHandle: record.receiptHandle
        };
        await sqs.deleteMessage(deleteMessageParams).promise();
        console.log("Deleted messages")
    }
    console.log("Success!")
    context.succeed(returnData);
}

const sendInAppNotification = async (providerId, orderId) => {
    const socketParams = {
        FunctionName: "socket-send-message-handler",
        InvocationType: 'RequestResponse',
        LogType: "Tail",
        Payload: JSON.stringify({ 
            body: {
                userName : providerId,
                messageType: "NEW_CUSTOMER_ORDER",
                orderId: orderId
        } })
    }

    return await lambda.invoke(socketParams).promise();
}