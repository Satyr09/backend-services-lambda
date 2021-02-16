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
const formOkResponse = response => {
    return {
        statusCode : 200,
        body : JSON.stringify({estimatedPrice : response}),
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
const estimateItemPrice = async item => {
    const toPin = item.toPin;
    const fromPin = item.fromPin;
    
    const distance = getDistance(toPin, fromPin);

    if(item.measureable === 'true') {
    
        const length = item.length || 1;
        const width = item.width || 1;
        const height = item.height || 1;

        const volumetricWeight = Math.round(length * width * height * 2)/2.0;
        console.log(volumetricWeight, " volum wt")
        const itemPrice = volumetricWeight * distance * (await getPricingFromDistanceAndWeight(distance, volumetricWeight));
        console.log(itemPrice)
        return itemPrice;
    } else {
        const totalWeight = item.totalWeight;
        //const density = item.density;

        const itemPrice = totalWeight * distance * (await getPricingFromDistanceAndWeight(distance, totalWeight));
        return itemPrice;

    }
}
exports.handler = async (event, context) => {

    let totalPrice = 0;

    const items = JSON.parse(event.queryStringParameters.items);
    let areItemsValid = true;
    items.forEach(item => {
        console.log(item);
        if(!validateParameters(item))
            areItemsValid = false;
    });

    if(!areItemsValid)
        return formErrorResponse("Parameters missing or incorrect", 403);


    const promiseList = items.map(async item => {
        const itemPrice = await estimateItemPrice(item);
        totalPrice += itemPrice;
    })

    await Promise.all(promiseList);
    return formOkResponse(totalPrice);
}

const validateParameters = (item) => {
    if(!item.toPin || !item.fromPin) {
        console.log("Missing source and destination pins")
        return false;
    }
    if(item.measureable !== 'true' && item.measureable != true) {
        console.log("Not measureable")
        if(!item.totalWeight || !item.density) {
            console.log("Missing weght and density")
            return false;
        }
    } else {
        if(!item.length || !item.height || !item.width) {
            console.log("Missing dimensions")
            return false;
        }
    }
    return true;
}