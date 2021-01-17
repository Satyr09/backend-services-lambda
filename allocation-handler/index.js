const s3 = require("aws-sdk/clients/s3");
const locationBlacklisting = require("./filters/blacklisting/locationBlacklisting");
const coldStorageRequired = require("./filters/constraint/coldStorageRequired");
const kpiPriority = require("./filters/prioritization/kpiPriority");
const proximityPriority = require("./filters/prioritization/proximityPriority");
const preferredPartnersWhitelisting = require("./filters/whitelisting/preferredPartnersWhitelisting");
const awsConfig = require("./awsconfig")


const s3Client =  new s3({
    "region" : awsConfig.region
});


/**
 * 3 levels of mapping, order type -> filters required [S3]. filters required -> actual filter function name [S3]. filter function name -> reference to filter function [Js].
 */

const filterFunctionsMap = {
    "coldStorageRequired": coldStorageRequired,
    "kpiPriority": kpiPriority,
    "proximityPriority": proximityPriority,
    "preferredPartnersWhitelisting": preferredPartnersWhitelisting,
    "locationBlacklisting": locationBlacklisting
}
/**
 * Message/Task Type -> List of Filters it has to run through
 * in order to have a set of potential partners ->
 * Run through the filters -> Send list of potential partners to 
 * broadcast module
 */
module.exports = async (event, context) => {

    const task = JSON.parse(event.body);
    const filters = await findFilters(task);

    //Get initial list of partners, intially while number of partners are limited, this will contain possibly all partners
    let partners = getInitialListOfPartners();
    //We maintain a map of (filterType, filterOutput) ---> nameOfCorrespondingFilterFunctioon, here, we retrieve that map
    const filterFunctions = await getFilterFunctions();



    filters.forEach(item => {
        item.filterOutput.forEach(
            filter => {
                //figure out which filtering function needs to be called for the given filterType, filterOutput combination
                const functionMapping = filterFunctions.find(elem => elem.filterType == item.filterType && elem.filterName == filter);
                //Get the function pointer provided the string name of the function -> this also allows us to secure our code by not revealing the actuak function names in the config files
                const func = filterFunctionsMap[functionMapping.funcName];
                partners = func(item.filterIp, partners); //update list of potentital partners in each step
            }
        )
        //call respective filtering/ranking service, chain filtering/ranking service calls
    });

    const headers = {
        "Access-Control-Allow-Origin" : "*",
        "Access-Control-Allow-Headers": "*" 
    }
    const response = {
        "statusCode" : 200,
        "body" : JSON.stringify(partners),
        "headers" : headers
    }
    return response;
    //place final list of suitable entities for task into queue, to be picked up by broadcasting service or someone else
}

/**
 * Get Map of which function to call for which function type
 * @param {taskObject} task 
 */
const getFilterFunctions = (task) => {
    return new Promise((resolve, reject) => {
        s3Client.getObject({
            Bucket: awsConfig.configBucketName,
            Key: awsConfig.filterToFilterFunctionMapping
        }, (err, data) => {
            if(err)
                reject([])
            const jsonData = JSON.parse(Buffer.from(data).toString("utf8"));

            resolve(jsonData)
        })
    })

}

/**
 * Dummy set of vairables for now. 
 * TODO : Replace with actual calls to database based on Business Rules Discussion
 */
const getInitialListOfPartners = () => {

    return [{
        "name": "FedEx",
        "coldStorage": true,
    }]
}


const findFilters = (task) => {

    return new Promise((resolve, reject) => {
        s3Client.getObject({
            Bucket: awsConfig.configBucketName,
            Key: awsConfig.filterConfigMapping
        }, (err, data) => {
            if(err)
                reject(err);
                const jsonData = JSON.parse(Buffer.from(data).toString("utf8"));

                console.log(jsonData)
                const filterSpecs = jsonData.find(
                    item => item.type == task.taskCategory && 
                    item.category == task.taskSubCategory);
    
                if(!filterSpecs)
                    reject(null);
                resolve(filterSpecs.filters); 
        }) ;
    })
}
  