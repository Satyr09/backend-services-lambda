// const AWS = require("aws-sdk");
// const DynamoDB = require("aws-sdk/clients/dynamodb");
// AWS.config.region = 'ap-south-1';
// const lambda = new AWS.Lambda();
// const uuid = require("uuid")
// const DynamoDBClient = new DynamoDB.DocumentClient({
//     region : "ap-south-1"
// })


// exports.handler = async function (event, context) {
//     const data = event.body;


//     let batchReceipients = []
//     let count = 1;
//     let tempReceipients = []
//     data.receipients.forEach(receipient => {
//         if(count === 25) {
//             count = 0;
//             const item = { 
//                 'PutRequest': { 
//                     'Item' : {

//                     } 
//                 } 
//             };
//             batchReceipients.push(tempReceipients)    
//         }
//         tempReceipients.push(receipient)
//     });

//     var items = [];

//     for (i = 0; i < orders.length; i++) {
//         var ord = orders[i]; //a simple json object
//         var item = { 
//             'PutRequest': { 
//                 'Item' : ord[i] 
//             } 
//         };
    
//         items.push(item);
//      }
    
    
//     var params = {
//         RequestItems: {
//             'my_table_name': items
//         }
//     };
    
//     var docClient = new AWS.DynamoDB.DocumentClient();
    
//     DynamoDBClient.batchWrite(params).promise();
// }