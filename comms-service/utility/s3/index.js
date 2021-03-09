const s3 = require("aws-sdk/clients/s3");
const { awsConfig } = require("../../awsConfig");

const s3Client = new s3({
    "region": awsConfig.region
});
const readFile = async (fileName) => {
    console.log(fileName)
    return new Promise((resolve, reject) => {
        s3Client.getObject({
            Bucket: awsConfig.templateBucket,
            Key: fileName
        }, (err, data) => {
            if (err)
                reject([])
            const jsonData = (data.Body.toString("utf8"));

            resolve(jsonData)
        })
    })
}

module.exports = {
    readFile
}