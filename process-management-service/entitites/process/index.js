const { getProcessById, createNewProcess, updateProcess } = require("../../services/ddb");
const { getTemplate } = require("../../services/s3");
const { changeTaskStatusInStage, isStageCompleted, activateStage, activateTaskInStage, updateCustomFieldsForTaskinStage } = require("../stage");
const uuid = require("uuid")



const timeNow = new Date().toUTCString();

const getNextStageInProcess = async (process, stageId) => {
    let flag = false;
    let ans = null;
    process.stages.forEach(
        stage => {
            if (stage.stageId === stageId)
                flag = true;
            else if (flag == true) {
                flag = false;
                ans = stage;
            }
        }
    )
    return ans;
}
/**
 * 
 * @param {*} processId The id of the process to be updated
 * @param {*} stageId The id of the stage to be updated
 * @param {[{taskId, status}]} tasks An array of objects, each object contains the status and taskId attribute corresponding to the required updated.
 * @returns The updated process.
 */
const bulkUpdateTaskStatus = async (processId, stageId, tasks) => {

    const process = await getProcessById(processId);

    if (!process)
        throw new Error("Process not found");

    const stage = process.stages.find(
        stage => {
            if (stage.stageId === stageId)
                return true;
            return false;
        }
    )

    console.log("STAGE FOUND : ", stage)

    if (stage) {
        let updatedStage = stage;
        //not using async forEach becasue we want each of these tasks to be updated sequentially so that the updated stage can be passed on to the next one
        for(let i = 0 ; i < tasks.length; i++) {
            const task = tasks[i];
            const taskId = task.taskId;
            const status = task.status;
            updatedStage = await changeTaskStatusInStage(updatedStage, taskId, status);
        }
        let nextStage = await getNextStageInProcess(process, stageId);
        console.log("NEXT STAGE : ", nextStage)
        if (nextStage && isStageCompleted(updatedStage)) {
            nextStage = await activateStage(nextStage);
        }
        let newProcess = {
            ...process,
            stages: process.stages.map(
                stage => {
                    if (stage.stageId === stageId)
                        return updatedStage;
                    if (nextStage && stage.stageId === nextStage.stageId)
                        return nextStage;
                    return stage;
                }
            )
        }

        console.log("UPDATED PROCESS GENERATED : ", newProcess)
        if (isProcessCompletable(newProcess)) {
            newProcess.status = "COMPLETED"
            newProcess = updateProcessTimestamps(newProcess, true, false);
        } else {
            newProcess = updateProcessTimestamps(newProcess, false, false);
        }
        try {
            await updateProcess(newProcess);
        } catch (err) {
            throw new Error("Process could not be updated" + JSON.stringify(err));
        }
        return newProcess;
    } else {
        throw new Error("Incorrect stage specified")
    }
}


/**
 * 
 * @param {uuid} processId the process to be updated
 * @param {uuid} stageId the stage to be updated
 * @param {uuid} taskId the task to be updated
 * @param {string} status the next status, can be "NEXT" or any valid status
 * @returns THe updated process
 */
const changeTaskStatusInProcess = async (processId, stageId, taskId, status) => {

    const process = await getProcessById(processId);

    if (!process)
        throw new Error("Process not found");

    const stage = process.stages.find(
        stage => {
            if (stage.stageId === stageId)
                return true;
            return false;
        }
    )

    console.log("STAGE FOUND : ", stage)

    if (stage) {
        const newStage = await changeTaskStatusInStage(stage, taskId, status);
        let nextStage = await getNextStageInProcess(process, stageId);
        console.log("NEXT STAGE : ", nextStage)
        if (nextStage && isStageCompleted(newStage)) {
            nextStage = await activateStage(nextStage);
        }
        let newProcess = {
            ...process,
            stages: process.stages.map(
                stage => {
                    if (stage.stageId === stageId)
                        return newStage;
                    if (nextStage && stage.stageId === nextStage.stageId)
                        return nextStage;
                    return stage;
                }
            )
        }

        console.log("UPDATED PROCESS GENERATED : ", newProcess)
        if (isProcessCompletable(newProcess)) {
            newProcess.status = "COMPLETED"
            newProcess = updateProcessTimestamps(newProcess, true, false);
        } else {
            newProcess = updateProcessTimestamps(newProcess, false, false);
        }
        try {
            await updateProcess(newProcess);
        } catch (err) {
            throw new Error("Process could not be updated" + JSON.stringify(err));
        }
        return newProcess;
    } else {
        throw new Error("Incorrect stage specified")
    }
}

const activateTaskInProcess = async (processId, stageId, taskId) => {
    const process = await getProcessById(processId);

    if (!process)
        throw new Error("Process not found");

    const stage = process.stages.find(
        stage => {
            if (stage.stageId === stageId)
                return true;
            return false;
        }
    )


    if (stage) {
        const newStage = await activateTaskInStage(stage, taskId);
        let newProcess = {
            ...process,
            stages: process.stages.map(
                stage => {
                    if (stage.stageId === stageId)
                        return newStage;
                    return stage;
                }
            )
        }

        if (isProcessCompletable(newProcess)) {
            newProcess.status = "COMPLETED"
            newProcess = updateProcessTimestamps(newProcess, true, false);
        } else {
            newProcess = updateProcessTimestamps(newProcess, false, false);
        }
        try {
            await updateProcess(newProcess);
        } catch (err) {
            throw new Error("Process could not be updated" + JSON.stringify(err));
        }
        return newProcess;
    } else {
        throw new Error("Incorrect task specified")
    }
}
const updateCustomFieldsForTaskinProcess = async (processId, stageId, taskId, payload) => {


    const process = await getProcessById(processId);

    if (!process)
        throw new Error("Process not found");

    const stage = process.stages.find(
        stage => {
            if (stage.stageId === stageId)
                return true;
            return false;
        }
    )

    if (stage) {
        const newStage = await updateCustomFieldsForTaskinStage(stage, taskId, payload);
        let newProcess = {
            ...process,
            stages: process.stages.map(
                stage => {
                    if (stage.stageId === stageId)
                        return newStage;
                    return stage;
                }
            )
        }

        if (isProcessCompletable(newProcess)) {
            newProcess.status = "COMPLETED"
            newProcess = updateProcessTimestamps(newProcess, true, false);
        } else {
            newProcess = updateProcessTimestamps(newProcess, false, false);
        }
        try {
            await updateProcess(newProcess);
        } catch (err) {
            throw new Error("Process could not be updated" + JSON.stringify(err));
        }
        return newProcess;
    } else {
        throw new Error("Incorrect task specified")
    }
}

const createProcess = async payload => {

    const type = payload.type;
    const template = await getTemplate({
        processType: type
    });

    const newProcess = {
        ...template,
        processId: uuid.v4(),
        principal: payload.principal,
        processGroup: payload.processGroup,
        dueDate: payload.dueDate,
        customFields: { ...payload.customFields }
    }
    newProcess.stages.forEach(
        stage => {
            stage.stageId = uuid.v4();
            stage.tasks.forEach(
                task => {
                    task.taskId = uuid.v4()
                }
            )
        }
    )
    console.log("New process is : ", newProcess)

    const initStage = newProcess.stages[0];
    const newStage = await activateStage(initStage);

    console.log("ACTIVATED STAGE : ", newStage);
    let activatedProcess = {
        ...newProcess,
        stages: newProcess.stages.map(
            stage => {
                console.log(stage.stageId + " --- " + newStage.stageId)
                if (stage.stageId === newStage.stageId)
                    return newStage;
                return stage;
            }
        ),
        status: newProcess.initStatus
    }

    updateProcessTimestamps(activatedProcess, false, true);
    console.log("Activated process is : ", activatedProcess)

    try {
        const res = await createNewProcess(activatedProcess);
        console.log(res)
        return activatedProcess;
    } catch (err) {
        throw new Error("Could not create process for type : ", payload.type)
    }
}

const isProcessCompletable = process => {
    let flag = true;
    process.stages.forEach(
        stage => {
            console.log("checking task status : ", stage.status)
            if (stage.status !== "COMPLETED")
                flag = false;
        }
    )
    console.log("process is completable? ", flag)
    return flag;
}
const updateProcessTimestamps = (process, isComplete, isNew) => {
    if (isNew)
        process.createdAt = timeNow;
    if (isComplete)
        process.completedOn = timeNow;
    process.lastModifiedAt = timeNow;

    return process;
}
module.exports = {
    changeTaskStatusInProcess,
    activateTaskInProcess,
    updateCustomFieldsForTaskinProcess,
    createProcess,
    bulkUpdateTaskStatus
}