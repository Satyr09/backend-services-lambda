const constants = {
    API_GATEWAY_ACCEPTANCE_ENDPOINT_PATH :  "https://2n3n7swm8f.execute-api.ap-south-1.amazonaws.com/draft0" + "/serviceorder/acceptance",
    BROADCAST_MESSAGE_BODY_PREFIX : "Hi! You have one order waiting to be accepted, Click here to accept it: ",
    BROADCAST_MESSAGE_SUBJECT : "New Order For You!"
}


module.exports = constants;