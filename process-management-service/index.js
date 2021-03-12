
const { createProcess, changeTaskStatusInProcess, activateTaskInProcess, updateCustomFieldsForTaskinProcess, bulkUpdateTaskStatus } = require("./entitites/process");
const headers = {
  "Access-Control-Allow-Origin" : "*",
  "Access-Control-Allow-Headers": "*" 
}

const formErrorResponse = (message, statusCode = 501) => {
  const response = {
      "statusCode" : statusCode,
      "body" : message,
      "headers" : headers
  }

  return response;
}

const formOKResponse = (response, statusCode = 200) => {
  return {
      "statusCode" : statusCode,
      "body" : JSON.stringify(response),
      "headers" : headers
  }
}


exports.handler = async (event, context) => {

  const request = JSON.parse(event.body);

  let res = null;
  try{
    switch(request.type) {
      case "create":
        res = await createProcess(request.data);
        return formOKResponse(res);
      case "bulkUpdateTaskStatus":
        res = await bulkUpdateTaskStatus(request.tasks)
        return formOKResponse(res)
      case "changeTaskStatus":
        res = await changeTaskStatusInProcess(request.data.processId, request.data.stageId, request.data.taskId, request.data.status);
        return formOKResponse(res);
      case "activateTask":
        res =  await activateTaskInProcess(request.data.processId, request.data.stageId, request.data.taskId);
        return formOKResponse(res);
      case "updateCustomField":
        res = await updateCustomFieldsForTaskinProcess(request.data.processId, request.data.stageId, request.data.taskId, request.data.custom);
        return formOKResponse(res);
      default:
        throw new Error("Unsupported type field");
    }
  }catch(err) {
    return formErrorResponse(JSON.stringify(err));
  }
}