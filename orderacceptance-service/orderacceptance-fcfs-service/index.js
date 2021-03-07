const AWS = require("aws-sdk")
const uuid = require("uuid")
const awsConfig = require("./awsconfig");
const DynamoDB2 = require("aws-sdk/clients/dynamodb")


const sqs = new AWS.SQS({
    region: awsConfig.region
});
const documentClient = new DynamoDB2.DocumentClient({
    region: awsConfig.region
})

const ORDER_ACCEPTANCE_DB = awsConfig.ORDER_ACCEPTANCE_DB;
const sqsQueueURL = "https://sqs.ap-south-1.amazonaws.com/183548183497/OrderAcceptance.fifo";

exports.handler = async (event, context) => {
    const record = event.Records[0];
    const { body } = record;
    const data = JSON.parse(body);

    console.log(data);
    console.log("service provider id : ", data.serviceProviderId);

    let isSuccess = true;

    const timestamp = new Date().toString();

    try {

        //Find if service order for specified customerOrderId already exists
        const dynamodbCheckParams = {
            TableName: ORDER_ACCEPTANCE_DB,
            IndexName: "customerOrderIndex",
            KeyConditionExpression: 'customerOrderId = :customerOrderId',
            ExpressionAttributeValues: {
                ':customerOrderId': data.customerOrderId
            }
        }
        const presentData = await documentClient.query(dynamodbCheckParams).promise();
        if (presentData && presentData.Items && presentData.Items.length !== 0)
            throw new Error("Order already accepted");

        //Find broadcast order entries
        //TODO : Add check for data.serviceProviderId from incoming message in receipients attribute of broadcast order -> check if person accepting is allowed to accept this
        const params = {
            TableName: "BroadcastOrder",
            IndexName: 'customerOrderIndex',
            KeyConditionExpression: 'customerOrderId = :customerOrderId',
            ExpressionAttributeValues: {
                ':customerOrderId': data.customerOrderId
            }
        };
        const res = await documentClient.query(params).promise();
        console.log("BROADCAST ORDERS FETCH RESULT : ", res);
        if (!res || !res.Items || (res.Items && res.Items.length === 0))
            throw new Error("Broadcast orders could not be found");



        /**
         * Broadcast orders have been fetched and we know that no service order for given customer order exists
         * We are allowed to go ahead and create a service order and modify broadcast order table
         */

        const putParams = {
            TableName: ORDER_ACCEPTANCE_DB,
            Item: {
                "ServiceOrderId":  uuid.v4() ,
                "displayId":  new Date().getUTCMilliseconds().toString() ,
                "customerOrderId": data.customerOrderId ,
                "serviceProviderId":   data.serviceProviderId ,
                "createdAt": new Date().getTime().toString()
            },
        };
        const updateParams = {
            TableName: "BroadcastOrder",
            Key: {
                "broadcastOrderId": res.Items[0].broadcastOrderId
            },
            UpdateExpression: "set #status = :y, #acceptedAt = :timestamp",
            ExpressionAttributeNames: {
                "#status": "status",
                "#acceptedAt": "acceptedAt"
            },
            ExpressionAttributeValues: {
                ":y": "ACCEPTED",
                ":timestamp": timestamp
            }
        };
        const writeParams = {
            TransactItems: [{
                Put: {
                    ...putParams
                }
            }, {
                Update: {
                    ...updateParams
                }
            }]
        };

        //await documentClient.transactWrite(writeParams).promise();
        const request = await documentClient.transactWrite(writeParams);

        request.on('extractError', (response) => {
            if (response.error) {
            const cancellationReasons = JSON.parse(response.httpResponse.body.toString()).CancellationReasons;
            response.error.cancellationReasons = cancellationReasons;
            }
        });

        await request.promise();
    } catch (err) {
        isSuccess = false;
        console.error(err);
    } finally {
        const deleteMessageParams = {
            QueueUrl: sqsQueueURL,
            ReceiptHandle: record.receiptHandle
        };
        await sqs.deleteMessage(deleteMessageParams).promise();
        console.log("Deleted incoming messages from queue")
    }
    if(isSuccess)
        context.succeed(body);
    else   
        context.fail("")
}