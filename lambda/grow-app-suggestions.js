// exports.handler = async (event) => {
//   return {
//     statusCode: 200,
//     headers: { "Content-Type": "text/plain" },
//     body: JSON.stringify({ message: "Hello from Grow!" }),
//   };
// }

require('dotenv').config();
const OpenAI = require('openai');

const apiKey = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: apiKey
});

exports.handler = async (event) => {
  const searchTerm = event.queryStringParameters && event.queryStringParameters.searchterm;

  if (!searchTerm) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'searchterm query parameter is required.' }),
    };
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: 'system',
          content: `Review the search term entered, and if it isn't related to software engineering do not 
            proceed with the rest of the prompts.`
        },
        {
          role: 'system',
          content: `You are a helpful assistant and you are helping a software engineer find learning resources.`
        },
        {
          role: 'user',
          content: `What are some learning resources for ${searchTerm}? List up to six resources with a maximum
            of 120 characters for each. List the title, description, and website or link as a url.`
        },
        {
          role: 'user',
          content: `Limit the title length to a maximum of 30 characters.`
        },
        {
          role: 'user',
          content: `Consider listing resources that may not be obvious that would be helpful for someone
            looking to fill gaps.`
        },
        {
        role: 'user',
        content: `Place some focus on resources that may cover topics outside of coding, e.g. soft skills,
          or infrastructure, or networking, or something else that may help under the topic from a different angle?`
        },
        {
          role: 'system',
          content: `Return the message content as a json collection for parsing back to a front-end web 
            application.`
        }
      ],
      temperature: 1,
      max_tokens: 512,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      response_format: {
        "type": "json_object"
      },
    });
    
    if (!response || !response.choices || !response.choices[0] || !response.choices[0].message) {
      throw new Error('Invalid response structure');
    }

    const jsonResponse = JSON.parse(response.choices[0].message.content);
    const learningSuggestions = jsonResponse.resources;

    return {
      statusCode: 200,
      headers: {
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'OPTIONS,GET'
      },
      body: JSON.stringify(learningSuggestions),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};