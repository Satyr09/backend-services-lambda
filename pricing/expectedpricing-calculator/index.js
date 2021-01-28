const aws = require('aws-sdk');
const s3 = new aws.S3();
const awsResourceConfig = require("./awsConfig")

const headers = {
    "Access-Control-Allow-Origin" : "*",
    "Access-Control-Allow-Headers": "*" 
}

const formErrorResponse = (message , statusCode = 501) => {
    return {
        statusCode : statusCode,
        body : message,
        headers : headers
    }
}

const getDistance = (toPin, fromPin) => {
    //access google maps - very accurate and easily accessible, but paid/mapbox - free but not sure yet if it serves our purpose yet
    return 10;
}

const getPricingConfigData = async () => {
    try {
        const params = {
          Bucket: awsResourceConfig.bucket,
          Key: awsResourceConfig.pricingConfig 
        }
    
        const data = await s3.getObject(params).promise();
    
        const res = JSON.parse(data.Body.toString('utf-8'));
        return res;
      } catch (e) {
        throw new Error(`Service unavailable`)
      }
}

const getPricingFromDistanceAndWeight = async (distance, weight) => {

    const pricingConfig = await getPricingConfigData();
    console.log(pricingConfig);


    const weightBasedPriceConfig = pricingConfig.weightSegregation;

    weightBasedPriceConfig.forEach(
        segment => {
            if(weight >=segment.minLimit && weight <= segment.maxLimit) {
                segment.pricingForDistanceRanges.forEach(
                    distanceSegment => {
                        if(distance <= distanceSegment.maxDistance && distance >= distanceSegment.minDistance) {
                            return distanceSegment.price;
                        }
                    }
                );

            }
        }
    )
    //access pricing config
    return 5.5;
}

exports.handler = async (event, context) => {

    let price = 10;

    if(!validateParameters(event.queryStringParameters)) {
        return formErrorResponse("Parameters missing or incorrect", 403);
    }
    
    const toPin = event.queryStringParameters.toPin;
    const fromPin = event.queryStringParameters.fromPin;
    
    const distance = getDistance(toPin, fromPin);

    if(event.queryStringParameters.measureable === 'true') {
    
        const length = event.queryStringParameters.length || 1;
        const width = event.queryStringParameters.width || 1;
        const height = event.queryStringParameters.height || 1;

        const volumetricWeight = Math.round(length * width * height * 2)/2.0;
        console.log(volumetricWeight, " volum wt")
        price = volumetricWeight * distance * (await getPricingFromDistanceAndWeight(distance, volumetricWeight));
        console.log(price)
    } else {
        const totalWeight = event.queryStringParameters.totalWeight;
        const density = event.queryStringParameters.density;

        price = totalWeight * distance * (await getPricingFromDistanceAndWeight(distance, totalWeight));

    }

    return formOkResponse(price);
}
const formOkResponse = response => {
    return {
        statusCode : 200,
        body : JSON.stringify({estimatedPrice : response}),
        headers : headers
    }
}
const validateParameters = (queryStringParameters) => {
    if(!queryStringParameters.toPin || !queryStringParameters.fromPin)
        return false;
    if(queryStringParameters.measureable !== 'true') {
        if(!queryStringParameters.totalWeight || !queryStringParameters.density)
            return false
    } else {
        if(!queryStringParameters.length || !queryStringParameters.height || !queryStringParameters.width)
            return false;
    }
    return true;
}