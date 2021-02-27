const { getProcessById,createNewProcess, updateProcess } = require("../../services/ddb");
const { getTemplate } = require("../../services/s3");
const { changeTaskStatusInStage, isStageCompleted, activateStage, activateTaskInStage, updateCustomFieldsForTaskinStage } = require("../stage");
const uuid = require("uuid")

const getNextStageInProcess = async (process, stageId) => {
    let flag = false;
    let ans = null;
    process.stages.forEach(
        stage => {
            if(stage.stageId === stageId)
                flag = true;
            else if(flag == true) {
                flag = false;
                ans = stage;
            }
        }
    )
    return ans;
}
const changeTaskStatusInProcess = async (processId, stageId, taskId, status) => {

    const process = await getProcessById(processId);

    if(!process)
        throw new Error("Process not found");

    const stage = process.stages.find(
        stage => {
            if(stage.stageId === stageId)
                return true;
            return false;
        }
    )

    if(stage) {
        const newStage= await changeTaskStatusInStage(stage, taskId, status);
        let nextStage = await getNextStageInProcess(stage, stageId);
        if (nextStage && isStageCompleted(newStage)) {
            nextStage = await activateStage(nextStage);
        }
        let newProcess = {
            ...process,
            stages : stage.tasks.map(
                stage => {
                    if(stage.stageId === stageId)
                        return newStage;
                    if(stage.stageId === nextStage.stageId)
                        return nextStage;
                    return stage;
                }
            )
        }

        if(isProcessCompletable(newProcess)) {
            newProcess.status = "COMPLETED"
        }
        try{
            await updateProcess(newProcess);
        }catch(err) {
            throw new Error("Process could not be updated" + JSON.stringify(err));
        }
        return newProcess;
    } else {
        throw new Error("Incorrect stage specified")
    }
}

const activateTaskInProcess = async (processId, stageId, taskId) => {
    const process = await getProcessById(processId);

    if(!process)
        throw new Error("Process not found");

    const stage = process.stages.find(
        stage => {
            if(stage.stageId === stageId)
                return true;
            return false;
        }
    )


    if(stage) {
        const newStage = await activateTaskInStage(stage, taskId);
        let newProcess = {
            ...process,
            stages : process.stages.map(
                stage => {
                    if(stage.stageId === stageId)
                        return newStage;
                    return stage;
                }
            )
        }

        if(isProcessCompletable(newProcess)) {
            newProcess.status = "COMPLETED"
        }
        try{
            await updateProcess(newProcess);
        }catch(err) {
            throw new Error("Process could not be updated" + JSON.stringify(err));
        }
        return newProcess;
    } else {
        throw new Error("Incorrect task specified")
    }
}
const updateCustomFieldsForTaskinProcess = async (processId, stageId, taskId,payload)=> {


    const process = await getProcessById(processId);

    if(!process)
        throw new Error("Process not found");

    const stage = process.stages.find(
        stage => {
            if(stage.stageId === stageId)
                return true;
            return false;
        }
    )

    if(stage) {
        const newStage = await updateCustomFieldsForTaskinStage(stage,taskId, payload);
        let newProcess = {
            ...process,
            stages : process.stages.map(
                stage => {
                    if(stage.stageid === stageId)
                        return newStage;
                    return stage;
                }
            )
        }

        if(isProcessCompletable(newProcess)) {
            newProcess.status = "COMPLETED"
        }
        try{
            await updateProcess(newProcess);
        }catch(err) {
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
        processType : type
    });

    const newProcess = {
        ...template,
        processId : uuid.v4(),
        principal : payload.user,
        createdAt : new Date().toUTCString(),
        lastModifiedAt : new Date().toUTCString(),
    }
    try {
        const res = await createNewProcess(newProcess);
        console.log(res)
        return newProcess;
    }catch(err) {
        throw new Error("Could not create process for type : ", payload.type)
    }
}

const isProcessCompletable = process => {
    process.stages.forEach(
        stage => {
            if(stage.status !== "COMPLETED")
                return false;
        }
    )
    return true;
}


module.exports = {
    changeTaskStatusInProcess,
    activateTaskInProcess,
    updateCustomFieldsForTaskinProcess,
    createProcess
}