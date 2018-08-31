/* eslint-disable func-names */ /* eslint-disable no-console */ const Alexa = require('ask-sdk-core'); const AWS = require('aws-sdk'); const dynamodb = new 
AWS.DynamoDB.DocumentClient(); const GetRemoteDataHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest'
      || (handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'GetRemoteDataIntent');
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
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
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
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
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
  canHandle() {
    getFact();
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
const skillBuilder = Alexa.SkillBuilders.custom(); exports.handler = skillBuilder
  .addRequestHandlers(
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
	GetNewFactIntent
  )
  .addErrorHandlers(ErrorHandler)
  .withTableName('awsfact')
  .withDynamoDbClient()
  .lambda(); function getFact() {
  // Setting up our dependencies const AWS = require('aws-sdk'); const dynamodb = new AWS.DynamoDB.DocumentClient(); // Creating an eviornment variable to store DynamoDB table 
name const TABLE_NAME = process.env.TABLENAME;
    
    var params = {
        TableName:TABLE_NAME
    };
                
	
	 dynamodb.getItem(params, function(err, data) {
                if (err) {
                    console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                } else {
                    const jokeCount = data.Count;
        const randomJoke = Math.floor(Math.random() * jokeCount);
        return data.Items[randomJoke].url;
                }
	 });
}
