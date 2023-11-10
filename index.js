require('dotenv').config()
const fs = require("fs")
const inquirer = require('inquirer')
const { OpenAI } = require('langchain/llms/openai')
const { PromptTemplate } = require('langchain/prompts')

const model = new OpenAI({
  openAIApiKey: process.env.OPEN_AI_API_KEY,
  temperature: 0,
  model: 'gpt-3.5-turbo'
})

const promptFunction = async (name, hometown) => {
  const myPrompt = 'generate a bio based on the following inputs {name}, and {hometown}.'
  const myPromptTemplate = PromptTemplate.fromTemplate(myPrompt)
  const newchain = myPromptTemplate.pipe(model)
  return await newchain.invoke({
    name,
    hometown
  })
}

const init = async () => {
  const resp = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'What is your name?'
    },
    {
      type: 'input',
      name: 'town',
      message: 'What is your hometown?'
    }
  ])
  const bio = await promptFunction(resp.name, resp.hometown)
  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/css/bootstrap.min.css">
    <title>Document</title>
  </head>
  <body>
    <header class="p-5 mb-4 header bg-light">
      <div class="container">
        <h1 class="display-4">Hi! My name is ${resp.name}</h1>
        <p class="lead">I am from ${resp.town}.</p>
        <h3>Example heading <span class="badge bg-secondary">Contact Me</span></h3>
        <p>${bio}</p>
      </div>
    </header>
  </body>
  </html>
  `
  fs.writeFile('portfolio.html', html, (err) => {
    console.log(err)
  })
}

init()