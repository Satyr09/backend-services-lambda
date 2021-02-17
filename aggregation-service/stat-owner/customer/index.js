const { getCustomerOrderForCustomer } = require("../../customerorder");
const { getCustomerOrderAndServiceOrderJoins } = require("../../datastore/athena/orders");


class Customer {
    Customer () {

    }
    async getOrderStats (documentClient, params) {
        console.log("Fetching order stats for : ", params)
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


        acceptedOrderDetails.forEach(
            customerOrder => {
                console.log(customerOrder)
                if (customerOrder.trackingStatus === "FULFILLED")
                    ++customerOrdersFulfilledCount;
                if (customerOrder.isDelayed === "YES")
                    ++customerOrdersDelayedCount;
                if (customerOrder.isDamaged === "YES")
                    ++customerOrdersDamagedCount;
            }
        )

        const stats = {
            placedOrdersCount,
            customerOrdersAcceptedCount: acceptedOrdersCount,
            customerOrdersFulfilledCount,
            customerOrdersDamagedCount,
            customerOrdersDelayedCount
        }

        return stats;
    }

}


module.exports = new Customer()