const AWS = require('aws-sdk');

const s3 = new AWS.S3();
const uuid = require('uuid');
const mimes = require('mime-types');
const awsConfig = require("./awsconfig");

const BUCKET_NAME = awsConfig.documentStorageBucketname;
const documentStoragePath = "uploads/kycdocuments";
const directorySuffixMap = {
    "customer" : "customer",
    "serviceprovider" : "serviceprovider"
}

/**
 * Send back a signed URL that the client can use to directly upload documents to S3 bucket
 */
exports.handler = async (event) => {
    const body = JSON.parse(event.body);

    const type = event.queryStringParameters.type;
    const directorySuffix = directorySuffixMap[type];

    const fileMetadata = {
        contentType: body.contentType,
    };

    const fileId = uuid.v4();
    const req = {
        Bucket: BUCKET_NAME,
        Key: `${documentStoragePath}/${directorySuffix}/${fileId}.${mimes.extension(fileMetadata.contentType)}`,
        ContentType: fileMetadata.contentType,
        Metadata: {
            ...fileMetadata,
            fileId,
        },
    };
    console.log(req);
    const s3PutObjectUrl = await s3.getSignedUrlPromise('putObject', req);
    const result = {
        fileId,
        s3PutObjectUrl,
    };

    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
    };
    const response = {
        statusCode: 200,
        body: JSON.stringify(result),
        headers,
    };
    console.log('Returning response : ', response);
    return response;
};
