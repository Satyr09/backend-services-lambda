const getDynamoDBScannedDataPaginated = async (documentClient, params) => {
    const _getAllData = async (params, startKey) => {
      if (startKey) {
        params.ExclusiveStartKey = startKey
      }
      return documentClient.scan(params).promise()
    }
    let lastEvaluatedKey = null
    let rows = []
    do {
      const result = await _getAllData(params, lastEvaluatedKey)
      rows = rows.concat(result.Items)
      lastEvaluatedKey = result.LastEvaluatedKey
    } while (lastEvaluatedKey)
    return rows
}
const getDynamoDBQueriedDataPaginated = async (documentClient, params) => {
    const _getAllData = async (params, startKey) => {
      if (startKey) {
        params.ExclusiveStartKey = startKey
      }
      return documentClient.query(params).promise()
    }
    let lastEvaluatedKey = null
    let rows = []
    do {
      const result = await _getAllData(params, lastEvaluatedKey)
      rows = rows.concat(result.Items)
      lastEvaluatedKey = result.LastEvaluatedKey
    } while (lastEvaluatedKey)
    return rows;
}
module.exports = {getDynamoDBScannedDataPaginated, getDynamoDBQueriedDataPaginated}