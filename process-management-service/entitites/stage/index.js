const { activateTask, changeStatus, updateCustomFields, isTaskCompleted } = require("../task");


const getNextTaskInStage = async (stage, taskId, taskNumber) => {
    let flag = false;
    let ans = null;
    stage.tasks.forEach(
        task => {
            if(task.taskId === taskId)
                flag = true;
            else if(flag == true && task.status === "INACTIVE") {
                flag = false;
                ans = task;
            }
        }
    )

    let simultaneousTasksCompletedFlag = true;
    let count = 0;
    stage.tasks.forEach(
        task => {
            if (task.number == taskNumber) {
                count++;
                if(task.status !== "COMPLETED")
                    simultaneousTasksCompletedFlag = false;
            }
        }
    )

    console.log("Simultaneous tasks exist ? " , count > 1);
    console.log("All simultanoues tasks completed? ", simultaneousTasksCompletedFlag)
    if(count <= 1)
        return ans;
    else if(count > 1) {
        if(!simultaneousTasksCompletedFlag)
            return null; //NEXT STAGE CANNOT BE ACTIVATED YET, SOME PENDING TASKS WITH THE SAME NUMBER REMAIN i.e. NOT ALL SIMULTANEOUS TASKS HAVE BEEN COMPL.
        return ans;
    }
        
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
        let nextTask = await getNextTaskInStage(stage, taskId, task.number);
        console.log("NEXT TASK : ", nextTask)
        // if (nextTask && isTaskCompleted(newTask)) {
        //     nextTask = await activateTask(nextTask);
        //     const activatedTaskNumber = nextTask.number;
        //     console.log("Activating tasks with number : ", activatedTaskNumber);
        //     let newStage = {
        //         ...stage,
        //         tasks : await Promise.all(stage.tasks.map(
        //             async task => {
        //                 console.log(task.taskId + "  " + task.taskId + " " + activatedTaskNumber + " " + task.number);
        //                 if(task.taskId === task.taskId || task.number == activatedTaskNumber)
        //                     return await activateTask(task);
        //                 return task;
        //             }
        //         ))
        //     }
        //}
        let newStage = {
            ...stage,
            tasks : await Promise.all(stage.tasks.map(
                async task => {
                    if(task.taskId === taskId)
                        return newTask;
                    if(nextTask && isTaskCompleted(newTask) && (task.taskId === nextTask.taskId || task.number === nextTask.number))
                        return await activateTask(task);
                    return task;
                }
            ))
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
        const activatedTaskNumber = task.number;
        console.log("Activating tasks with number : ", activatedTaskNumber);
        let newStage = {
            ...stage,
            tasks : await Promise.all(stage.tasks.map(
                async task => {
                    console.log(task.taskId + "  " + task.taskId + " " + activatedTaskNumber + " " + task.number);
                    if(task.taskId === task.taskId || task.number == activatedTaskNumber)
                        return await activateTask(task);
                    return task;
                }
            ))
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
    const activatedTaskNumber = firstTask.number;
    console.log("Activating tasks with number : ", activatedTaskNumber);
    let newStage = {
        ...stage,
        tasks : await Promise.all(stage.tasks.map(
            async task => {
                console.log(task.taskId + "  " + firstTask.taskId);
                if(task.taskId === firstTask.taskId || task.number == activatedTaskNumber)
                    return await activateTask(task);
                return task;
            }
        ))
    }

    console.log("NEW STAGE : ", newStage)

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