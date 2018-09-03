/* eslint-disable func-names */
/* eslint-disable no-console */
const Alexa = require('ask-sdk-core');
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

// Creating an eviornment variable to store DynamoDB table name
const TABLENAME = process.env.TABLENAME;

const GetRemoteDataHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest' ||
            (handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
                handlerInput.requestEnvelope.request.intent.name === 'GetRemoteDataIntent');
    },
    async handle(handlerInput) {
        let outputSpeech = 'Welcome to the AWS Fact skill';
        const attributesManager = handlerInput.attributesManager;
        const attributes = await attributesManager.getPersistentAttributes();
        attributes.questionAsked = false;
        attributesManager.setPersistentAttributes(attributes);
        await attributesManager.savePersistentAttributes();
        return handlerInput.responseBuilder
            .speak(outputSpeech)
            .getResponse();
    },
};
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speechText = 'You can introduce yourself by telling me your name';
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    },
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent' ||
                handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speechText = 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();
    },
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
        return handlerInput.responseBuilder.getResponse();
    },
};
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`Error handled: ${error.message}`);
        return handlerInput.responseBuilder
            .speak('Sorry, I can\'t understand the command. Please say again.')
            .reprompt('Sorry, I can\'t understand the command. Please say again.')
            .getResponse();
    },
};
const GetNewFactIntent = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'GetNewFactIntent';
        // we've come here because the user said something we declared as GetNewFactIntent and as that's true, we can run the below code
    },
    async handle(handlerInput, error) {

        console.log(`Error handled: ${error.message}`);
        var myReturnedVariable = await awsDBGetFact()
        // we're going to run this with async, as we have to 'await' for the db to send the info back

        var speechText = "This is what I want to say " + myReturnedVariable;
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    },
};

const skillBuilder = Alexa.SkillBuilders.custom();
exports.handler = skillBuilder
    .addRequestHandlers(
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        GetNewFactIntent
    )
    .addErrorHandlers(ErrorHandler)
    .lambda();

function awsDBGetFact() {
    var params = {
        TableName: TABLENAME
    };

    dynamodb.get(params, function(err, data) {
        if (err) {
            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            const jokeCount = data.Count;
            const randomJoke = Math.floor(Math.random() * jokeCount);
            return data.Items[randomJoke];
        }
    });
}
