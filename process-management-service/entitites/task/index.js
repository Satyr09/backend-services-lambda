const changeStatus = async (task, status) => {
    const validTransitions = task.validTransitions;
    const currStatus = task.status;

    
    const newStatus = status === "NEXT" ? validTransitions[currStatus][0] : status;

    console.log("CURR STATUS : ", currStatus , " NEW STATUS : ", newStatus)
    if(newStatus && validTransitions[currStatus][0] === newStatus) {
        task.status = newStatus;
        task.lastModifiedAt = new Date().toUTCString();

        const triggers = task.triggers[task.status];
        const promiseList = triggers.map(async trigger => {
            //place in event bus
            console.log(trigger, "-------------TRIGGERED--------")
            return true;
        });
        await Promise.all(promiseList);


        return task;
    } else {
        throw new Error("Invalid status transition")
    }
}

const activateTask = async task => {
    console.log("ACTIVATING TASK")
    const initStatus = task.initStatus;
    task.status = initStatus;

    console.log("TASK STATUS : ", task.status)

    const triggers = task.triggers[task.status];
    const promiseList = triggers.map(async trigger => {
        console.log(trigger)
        // const triggerPayload = {
        //     ...triggers,
        //     process.customF
        // }
    })
    await Promise.all(promiseList);

    task.lastModifiedAt = new Date().toUTCString();
    console.log("Returning task : ", task)
    return task;
}

const updateCustomFields = async (task,payload)=> {
    //const oldCustomFields = task.customFields;
    const newCustomFields = task.customFields;

    if(payload.data) {
        newCustomFields.data = {
            ...newCustomFields.data,
            ...payload.data
        }

        const triggers = task.customDataUpdateTriggers;
        const promiseList = triggers.map(async trigger => {
            console.log(trigger);
            return true;
        })
        await Promise.all(promiseList);

    }
    if(payload.attachments) {
        newCustomFields.attachments = {
            ...newCustomFields.attachments,
            ...payload.attachments
        }

        const triggers = task.customAttachmentTriggers;
        const promiseList = triggers.map(async trigger => {
            console.log(trigger);
            return true;
        })
        await Promise.all(promiseList);
    }
    task.customFields = newCustomFields;
    task.lastModifiedAt = new Date().toUTCString();

    return task;
}
const isTaskCompleted = task => {
    return task.status === "COMPLETED"
}
module.exports = {
    activateTask,
    changeStatus,
    updateCustomFields,
    isTaskCompleted
}