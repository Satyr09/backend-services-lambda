const TABLE_NAME = "CustomerInformation"

const process  = async (data, DynamoDBClient) => {
    const params = {
        TableName: TABLE_NAME,
        KeyConditionExpression: 'id = :id',
        ExpressionAttributeValues: {
          ':id': data.id,
        }
     };
    const res = await DynamoDBClient.query(params).promise();
    const timestamp = Date.now().toString();
    const existingInformation = res.Items.length? res.Items[0] : {};
    const newItem = {
            ...existingInformation,
            id: data.id,
            lastModifiedAt: timestamp
    }
    if(!existingInformation) {
        newItem.createdAt = timestamp
    }
    const dynamodbParams = {
        TableName: TABLE_NAME,
        Item: { 
            ...newItem,
            ...(data.kycInformation)
        }
    };
    
    return await DynamoDBClient.put(dynamodbParams).promise();
}
module.exports = process;