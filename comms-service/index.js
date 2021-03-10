const sendEmail = require("./channels/email");
const sendSMS = require("./channels/sms");

// const event =  {
//     body : {
//         // type : "NOTIFICATION",
//         // channels : [
//         //     {
//         //         channelName : "email",
//         //         receipients : [
//         //             "daipayan@goflexe.com"
//         //         ],
//         //         messageType : "BROADCAST_ORDER",
//         //         data : {
//         //             orderId : "1234"
//         //         }
//         //     },
//         //     {
//         //         channelName : "sms",
//         //         receipients : [
//         //             "+917003625198"
//         //         ],
//         //         messageType : "BROADCAST_ORDER",
//         //         data : {
//         //             orderId : "1234"
//         //         }
//         //     }
//         // ]
//         type: "NOTIFICATION",
//         channels : [
//             {
//                 channelName : "email",
//                 receipients : [
//                     "daipayan@goflexe.com"
//                 ],
//                 messageType : "SIGNUP_WELCOME",
//                 data : {}
//             }
//         ]
//     }
    
// }

const channelMap = {
    "email" : sendEmail,
    "sms" : sendSMS
}

exports.handler = async (event, context) => {
    const payload = JSON.parse(event.body);
    console.log(payload)
    if(!payload || !payload.type)
        context.fail("Payload is empty")

    if(!payload.channels || payload.channels.length == 0) 
        context.fail("Channels must be specified")
     
    const errors = []
    const promiseList = payload.channels.map(async channel => {
        let response = null;
        try {
            const func = channelMap[channel.channelName];
            const data = channel.data
            response = await func(data, channel.receipients, channel.messageType);
        } catch(err) {
            console.log(err)
            errors.push(err);
        }
        console.log("Completed ", channel)
        return response;
    });

    try {
        await Promise.all(promiseList)
    } catch(err) {
        console.log(err)
    }
    if(errors.length > 0)
        console.error("Something went wrong")
}
