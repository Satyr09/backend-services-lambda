const aws = require('aws-sdk');
const { awsConfigs } = require('../../awsConfigs');
const s3 = new aws.S3();

const templateToKepMapping = {
    "TRACKING" : "trackingTemplate.json"
}
const getTemplate = async data => {
    const params = {
        Bucket: awsConfigs.bucket,
        Key: templateToKepMapping[data.processType]
      }
  
      const obj = await s3.getObject(params).promise();
      const res = JSON.parse(obj.Body.toString('utf-8'));
    return res;
}

module.exports = {
    getTemplate
}