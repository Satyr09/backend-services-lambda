const TABLE_NAME = "ServiceProviderInformation";

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
            ...(data.selfInfo || {}),
            drivers : [
                ...(existingInformation.drivers || []),
                ...(data.drivers || [])
            ],
            trucks : [
                ...(existingInformation.trucks || []),
                ...(data.trucks || [])
            ]
        }
    };
    
    return await DynamoDBClient.put(dynamodbParams).promise();
}
module.exports = process;