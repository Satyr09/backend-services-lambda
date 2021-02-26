const { getCustomerOrderForCustomer } = require("../../datastore/ddb/customerorder");
const { getCustomerOrderAndServiceOrderJoins } = require("../../datastore/athena/orders");


class Customer {
    Customer () {

    }
    async getOrderStats (documentClient, params) {
        console.log("Fetching customer order stats for : ", params)
        const acceptedOrderDetails = await getCustomerOrderAndServiceOrderJoins(params.customerId); //Athena
        const placedOrderDetails = await getCustomerOrderForCustomer(documentClient, params); //DDB

        //Broadcasts received count
        let acceptedOrdersCount = acceptedOrderDetails.length;
        //Accepted count
        const placedOrdersCount = placedOrderDetails.length;
        //Fullfilled count
        let customerOrdersFulfilledCount = 0;
        //Delated count
        let customerOrdersDelayedCount = 0;
        //Damaged count
        let customerOrdersDamagedCount = 0;
        //In Transit count
        let customerOrdersInTransitCount = 0;


        acceptedOrderDetails.forEach(
            customerOrder => {
                console.log(customerOrder)
                if (customerOrder.trackingstatus === "FULFILLED")
                    ++customerOrdersFulfilledCount;
                if (customerOrder.isdelayed === "YES")
                    ++customerOrdersDelayedCount;
                if (customerOrder.isdamaged === "YES")
                    ++customerOrdersDamagedCount;
                if(customerOrder.trackingstatus === "IN_TRANSIT")
                    ++customerOrdersInTransitCount;
            }
        )

        const stats = {
            placedOrdersCount,
            customerOrdersAcceptedCount: acceptedOrdersCount,
            customerOrdersFulfilledCount,
            customerOrdersDamagedCount,
            customerOrdersDelayedCount,
            customerOrdersInTransitCount
        }

        return stats;
    }

}


module.exports = new Customer()