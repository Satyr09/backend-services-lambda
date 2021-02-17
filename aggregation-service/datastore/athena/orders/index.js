const aws = require("aws-sdk");
const AthenaExpress = require("athena-express");

//Initializing athena-express
const athenaExpress = new AthenaExpress({
    aws,
    db: "orders",
    getStats: true,
    s3: 's3://goflexe-athena-query-dump/stats/'
});

const getCustomerOrderAndServiceOrderJoins = async (customerId) => {
    const sqlQuery = "select * from customerorder co inner join serviceorder so on co.orderid = so.customerorderid where co.customerEmail = "+customerId+";";

    //try {
    const results = await athenaExpress.query(sqlQuery);
    return results.Items;
    // } catch (error) {
    //     return error;
    // }
}


module.exports = {
    getCustomerOrderAndServiceOrderJoins
}