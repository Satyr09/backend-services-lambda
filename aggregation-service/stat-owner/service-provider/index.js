const { getBroadcastOrderForSP } = require("../../datastore/ddb/broadcastorder");
const { getServiceOrdersForSP } = require("../../datastore/ddb/serviceorder");


class ServiceProvider {
    ServiceProvider () {

    }
    async getOrderStats (documentClient, params) {
        console.log("Fetching sp order stats for : ", params)
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
        //In Transit count
        let serviceOrdersInTransitCount = 0;


        broadcastOrders.forEach(broadcastOrder => {
            if (broadcastOrder.receipients && broadcastOrder.receipients.includes(params.serviceProviderId))
                ++broadcastOrdersCount;
        })

        serviceOrders.forEach(
            serviceOrder => {
                if (serviceOrder.trackingstatus === "FULFILLED")
                    ++serviceOrdersFulfilledCount;
                if (serviceOrder.isdelayed === "YES")
                    ++serviceOrdersDelayedCount;
                if (serviceOrder.isdamaged === "YES")
                    ++serviceOrdersDamagedCount;
                if(serviceOrder.trackingstatus === "IN_TRANSIT")
                    ++serviceOrdersInTransitCount;
            }
        )

        const stats = {
            broadcastOrdersCount,
            serviceOrdersAcceptedCount: serviceOrdersCount,
            serviceOrdersFulfilledCount,
            serviceOrdersDamagedCount,
            serviceOrdersDelayedCount,
            serviceOrdersInTransitCount
        }

        return stats;
    }

}


module.exports = new ServiceProvider()