const { getBroadcastOrderForSP } = require("../../datastore/ddb/broadcastorder");
const { getServiceOrdersForSP } = require("../../datastore/ddb/serviceorder");


class ServiceProvider {
    ServiceProvider () {

    }
    async getOrderStats (documentClient, params) {
        console.log("Fetching order stats for : ", params)
        const broadcastOrders = await getBroadcastOrderForSP(documentClient, params.serviceProviderId);
        const serviceOrders = await getServiceOrdersForSP(documentClient, params.serviceProviderId);


        //Broadcasts received count
        let broadcastOrdersCount = 0;
        //Accepted count
        const serviceOrdersCount = serviceOrders.length;
        //Fullfilled count
        let serviceOrdersFulfilledCount = 0;
        //Delated count
        let serviceOrdersDelayedCount = 0;
        //Damaged count
        let serviceOrdersDamagedCount = 0;


        broadcastOrders.forEach(broadcastOrder => {
            if (broadcastOrder.receipients.includes(params.serviceProviderId))
                ++broadcastOrdersCount;
        })

        serviceOrders.forEach(
            serviceOrder => {
                if (serviceOrder.trackingStatus === "FULFILLED")
                    ++serviceOrdersFulfilledCount;
                if (serviceOrder.isDelayed === "YES")
                    ++serviceOrdersDelayedCount;
                if (serviceOrder.isDamaged === "YES")
                    ++serviceOrdersDamagedCount;
            }
        )

        const stats = {
            broadcastOrdersCount,
            serviceOrdersAcceptedCount: serviceOrdersCount,
            serviceOrdersFulfilledCount,
            serviceOrdersDamagedCount,
            serviceOrdersDelayedCount
        }

        return stats;
    }

}


module.exports = new ServiceProvider()