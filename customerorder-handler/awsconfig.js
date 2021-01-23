const awsResourceConfigs = {
    region  : "ap-south-1",
    customerOrderQueue : "https://sqs.ap-south-1.amazonaws.com/183548183497/CustomerOrder.fifo",
    customerOrderTableName : "CustomerOrder"
}

module.exports = awsResourceConfigs;