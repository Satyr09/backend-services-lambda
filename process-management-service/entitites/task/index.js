const changeStatus = async (task, status) => {
    const validTransitions = task.validTransitions;
    const currStatus = task.status;

    const newStatus = status === "NEXT" ? validTransitions[currStatus][0] : status;

    if(newStatus && validTransitions[currStatus][0] === newStatus) {
        task.status = newStatus;
        task.lastModifiedAt = new Date().toUTCString();

        const triggers = task.triggers[task.status];
        const promiseList = triggers.forEach(async trigger => {
            //place in event bus
            console.log(trigger, "-------------TRIGGERED--------")
        });
        await Promise.all(promiseList);


        return task;
    } else {
        throw new Error("Invalid status transition")
    }
}

const activateTask = async task => {
    const initStatus = task.initStatus;
    task.status = initStatus;

    const triggers = task.triggers[task.status];
    const promiseList = triggers.forEach(async trigger => {
        console.log(trigger);
    })
    await Promise.all(promiseList);

    task.lastModifiedAt = new Date().toUTCString();
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
        const promiseList = triggers.forEach(async trigger => {
            console.log(trigger);
        })
        await Promise.all(promiseList);

    }
    if(payload.attachments) {
        newCustomFields.attachments = {
            ...newCustomFields.attachments,
            ...payload.attachments
        }

        const triggers = task.customAttachmentTriggers;
        const promiseList = triggers.forEach(async trigger => {
            console.log(trigger);
        })
        await Promise.all(promiseList);
    }

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