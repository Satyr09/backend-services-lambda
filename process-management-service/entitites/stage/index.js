const { activateTask, changeStatus, updateCustomFields, isTaskCompleted } = require("../task");


const getNextTaskInStage = async (stage, taskId) => {
    let flag = false;
    let ans = null;
    stage.tasks.forEach(
        task => {
            if(task.taskId === taskId)
                flag = true;
            else if(flag == true) {
                flag = false;
                ans = task;
            }
        }
    )
    return ans;
}
const changeTaskStatusInStage = async (stage, taskId, status) => {
    const task = stage.tasks.find(
        task => {
            if(task.taskId === taskId)
                return true;
            return false;
        }
    )

    console.log("FOUND TASK : ", task)
    if(task) {
        const newTask = await changeStatus(task, status);
        let nextTask = await getNextTaskInStage(stage, taskId);
        console.log("NEXT TASK : ", nextTask)
        if (nextTask && isTaskCompleted(newTask)) {
            nextTask = await activateTask(nextTask);
        }
        let newStage = {
            ...stage,
            tasks : stage.tasks.map(
                task => {
                    if(task.taskId === taskId)
                        return newTask;
                    if(nextTask && task.taskId === nextTask.taskId)
                        return nextTask;
                    return task;
                }
            )
        }
        console.log("NEW STAGE CREATED")
        if(isStageCompletable(newStage)) {
            newStage.status = "COMPLETED"
        }
        newStage.lastModifiedAt = new Date().toUTCString();
        console.log("RETURNING NEWSTAGE : ", newStage)
        return newStage;
    } else {
        throw new Error("Incorrect task specified")
    }
}

const activateTaskInStage = async (stage, taskId) => {
    const task = stage.tasks.find(
        task => {
            if(task.taskId === taskId)
                return true;
            return false;
        }
    )

    if(task) {
        const newTask = await activateTask(task);
        let newStage = {
            ...stage,
            tasks : stage.tasks.map(
                task => {
                    if(task.taskId === taskId)
                        return newTask;
                    return task;
                }
            )
        }

        if(isStageCompletable(newStage)) {
            newStage.status = "COMPLETED"
        }
        newStage.lastModifiedAt = new Date().toUTCString();
        return newStage;
    } else {
        throw new Error("Incorrect task specified")
    }
}


const isStageCompletable = stage => {
    let flag = true;
    stage.tasks.forEach(
        task => {
            console.log("checking task status : ", task.status)
            if(task.status !== "COMPLETED")
                flag = false;
        }
    )
    console.log("stage is completable? ", flag)
    return flag;
}

const updateCustomFieldsForTaskinStage = async (stage, taskId,payload)=> {


    const task = stage.tasks.find(
        task => {
            if(task.taskId === taskId)
                return true;
            return false;
        }
    )

    if(task) {
        console.log("STAGE STATUS : ", stage.status)
        const newTask = await updateCustomFields(task, payload);
        let newStage = {
            ...stage,
            tasks : stage.tasks.map(
                task => {
                    if(task.taskId === taskId)
                        return newTask;
                    return task;
                }
            )
        }
        console.log("TASKS IN STAGE : ")
        console.log(stage.tasks);


        console.log("STAGE STATUS  : ", stage.status)
        if(isStageCompletable(newStage)) {
            newStage.status = "COMPLETED"
        }
        console.log("STAGE STATUS : ", stage.status)
        newStage.lastModifiedAt = new Date().toUTCString();
        return newStage;
    } else {
        throw new Error("Incorrect task specified")
    }
}

const activateStage = async stage => {
    console.log("ACTIVATING STAGE")
    const initStatus = stage.initstatus || "PENDING";
    stage.status = initStatus;

    console.log("STAGE STATUS : ", stage.status)
    const timeNow = new Date().toUTCString();
    stage.activatedAt = timeNow;

    const firstTask = stage.tasks[0];
    const newTask = await activateTask(firstTask);
    let newStage = {
        ...stage,
        tasks : stage.tasks.map(
            task => {
                console.log(task.taskId + "  " + firstTask.taskId);
                if(task.taskId === firstTask.taskId)
                    return newTask;
                return task;
            }
        )
    }

    console.log("NEW STAGE : ", newStage)
    // const triggers = newStage.triggers[stage.status];
    // const promiseList = triggers.forEach(async trigger => {
    //     console.log(trigger);
    // })
    // await Promise.all(promiseList);

    newStage.lastModifiedAt = timeNow;
    console.log("Returning : ");
    return newStage;
}


const isStageCompleted = stage => {
    return stage.status === "COMPLETED"
}

module.exports = {
    activateTaskInStage,
    changeTaskStatusInStage,
    updateCustomFieldsForTaskinStage,
    isStageCompleted,
    activateStage
}