require('dotenv').config()
const fs = require('fs/promises')
const inquirer = require('inquirer')
const { OpenAI } = require('langchain/llms/openai')
const { PromptTemplate } = require('langchain/prompts')

const model = new OpenAI({
  openAIApiKey: process.env.OPEN_AI_API_KEY,
  temperature: 0,
  model: 'gpt-3.5-turbo'
})

const generateBio = async ({name, location, job, officeLocation, skills}) => {
  const myPrompt = 'generate a bio based on the following inputs {name}, job i am looking for {job}, where i want to work {officeLocation}, what skills i have {skills} and where i live {location}.'
  const myPromptTemplate = PromptTemplate.fromTemplate(myPrompt)
  const newchain = myPromptTemplate.pipe(model)
  return await newchain.invoke({
    name,
    location,
    job,
    officeLocation,
    skills: skills.join(', ')
  })
}

const promptUser = async () => {
    return await inquirer.prompt([
        /**
         * name, location, bio, LinkedIn URL, and GitHub URL
         */
        {
            type: 'input',
            message: 'What is your name?',
            name: 'name'
        },
        {
            type: 'input',
            message: 'What is your location?',
            name: 'location'
        },
        {
            type: 'input',
            message: 'What type of job are you looking for?',
            name: 'job'
        },
        {
            type: 'list',
            message: 'where do you want to work?',
            choices: [
                'onsite',
                'remote'
            ],
            name: 'officeLocation'
        },
        {
            type: 'checkbox',
            message: 'Which of these skills do you have?',
            choices: [
                'Cooking',
                'Cleaning',
                'JavaScript',
                'Wood Working',
                'Gardening'
            ],
            name: 'skills'
        },
        {
            type: 'input',
            message: 'What is your linkedIn URL?',
            name: 'linkedin'
        },
        {
            type: 'input',
            message: 'What is your GitHub URL?',
            name: 'github'
        },
    ])
}

const generateHTML = async (responses) => (
    `
    <!DOCTYPE html>
        <html lang="en">
            <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="ie=edge">
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/css/bootstrap.min.css">
            <title>${responses.name} Portfolio</title>
            </head>
            <body>
            <header class="p-5 mb-4 header bg-light">
                <div class="container">
                <h1 class="display-4">Call me ${responses.name}</h1>
                <p class="lead">I live in ${responses.location}</p>
                <h3><span class="badge bg-secondary">Contact Me</span></h3>
                <ul class="list-group">
                    <li class="list-group-item">My GitHub url is ${responses.github}</li>
                    <li class="list-group-item">LinkedIn: ${responses.linkedIn}</li>
                </ul>
                </div>
            </header>
            <main>
                <div class="container">
                    <p>${ await generateBio(responses) }</p>
                </div>
            </main>
            </body>
        </html>
    `
)

const writeHTML = async (responses) => {
    try {
        await fs.writeFile(`${responses.name}-portfolio.html`, await generateHTML(responses))
    } catch (err) {
        console.error(err)
    }
}

const init = async () => {
    const responses = await promptUser()
    await writeHTML(responses)
}

init()