const { readFile } = require("../utility/s3");
const { textTemplateToFileMapping } = require("./mapping")
const pug = require('pug');


const getCompiledTextTemplate = async (data, messageType) => {
    if(!textTemplateToFileMapping.hasOwnProperty(messageType))
        throw new Error("Template for provided message type not defined");

    const templateFileName = textTemplateToFileMapping[messageType];
    console.log(templateFileName)
    const template = await readFile(templateFileName);

    const compiledFunction = pug.compile(template);

    const content = compiledFunction(data)
    console.log(content)
    return content;
}

module.exports = {
    getCompiledTextTemplate
}