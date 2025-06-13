import { Configuration, OpenAIApi } from 'openai';

const getOpenAI = () => {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  return new OpenAIApi(configuration);
};

export const TaskAssigner = async (title, description) => {
  const openai = getOpenAI();
  const rolesList = ['Developer', 'Designer', 'Project Manager', 'QA Tester'];
  const prompt = `We have a team with the following roles: ${rolesList.join(', ')}. Given the following task, determine which role is best suited to take it on.\n\nTask Title: ${title || 'Untitled'}\nTask Description: ${description}\n\nThe single most suitable role for this task is:`;

  const apiResponse = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    max_tokens: 50,
    temperature: 0.7,
  });

  return apiResponse.data.choices[0].message.content.trim();
}

export const TaskOptimizer = async (title, description) => {
  const openai = getOpenAI();
    
  const prompt = `Here is a task and its description. Improve the clarity and detail of the description.\n\nTask Title: ${title || 'Untitled'}\nTask Description: ${description}\n\nImproved Task Description:`;

  const apiResponse = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    max_tokens: 100,
    temperature: 0.7,
  });
  
  return apiResponse.data.choices[0].message.content.trim();
}