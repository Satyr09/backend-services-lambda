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

    if(task) {
        const newTask = await changeStatus(task, status);
        let nextTask = await getNextTaskInStage(stage, taskId);
        if (nextTask && isTaskCompleted(newTask)) {
            nextTask = await activateTask(nextTask);
        }
        let newStage = {
            ...stage,
            tasks : stage.tasks.map(
                task => {
                    if(task.taskId === taskId)
                        return newTask;
                    if(task.taskId === nextTask.taskId)
                        return nextTask;
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
    stage.tasks.forEach(
        task => {
            if(task.status !== "COMPLETED")
                return false;
        }
    )
    return true;
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

        if(isStageCompletable(newStage)) {
            newStage.status = "COMPLETED"
        }
        newStage.lastModifiedAt = new Date().toUTCString();
        return newStage;
    } else {
        throw new Error("Incorrect task specified")
    }
}

const activateStage = async stage => {
    const initStatus = stage.initstatus || "PENDING";
    stage.status = initStatus;

    const timeNow = new Date().toUTCString();
    stage.activatedAt = timeNow;

    const firstTask = stage.tasks[0];
    const newTask = await activateTask(firstTask);
    let newStage = {
        ...stage,
        tasks : stage.tasks.map(
            task => {
                if(task.taskId === firstTask.taskId)
                    return newTask;
                return task;
            }
        )
    }


    const triggers = newStage.triggers[stage.status];
    const promiseList = triggers.forEach(async trigger => {
        console.log(trigger);
    })
    await Promise.all(promiseList);

    newStage.lastModifiedAt = timeNow;
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