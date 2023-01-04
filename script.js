import bot from './assets_chat_gpt/bot.svg'
import user from './assets_chat_gpt/user.svg'

const form = document.querySelector('form')
const chatContainer = document.querySelector('#chat_container')

// .... Loading

let loadInterval

function loader(element) {
  element.textContent = ''

  loadInterval = setInterval(() => {
    element.textContent += '.'

    if (element.textContent === '....') {
      element.textContent = ''
    }
  }, 300)
}

// Typing every letter one by one

function typeText(element, text) {
  let index = 0

  let interval = setInterval(() => {
    if (index < text.length) {
      // If it is true it means we are still typing
      element.innerHTML += text.charAt(index) // it will return a specific charater at index which AI is going to return
      index++
    } else {
      // If we have reached to end of the text we will clear the interval
      clearInterval(interval)
    }
  }, 20)
}

// Unique Id for every single message to be able to map over them

function generateUinqueId() {
  const timestamp = Date.now()
  const randomNumber = Math.random()
  const hexadecimalString = randomNumber.toString(16)

  return `id-${timestamp}-${hexadecimalString}`
}

// ChatStripe
//  for AI and User

function chatStripe(isAi, value, uniqueId) {
  return `
      <div class="wrapper ${isAi && 'ai'}">
        <div class="chat">
          <div class="profile">
            <img src="${isAi ? bot : user}" alt="${isAi ? 'bot' : 'user'}" />
          </div>
          <div class="message" id=${uniqueId}>${value}</div>
        </div>
      </div>
    `
}

// AI generated Response on Submit

const handleSubmit = async (e) => {
  e.preventDefault()

  const data = new FormData(form)

  // User's chatStripe

  chatContainer.innerHTML += chatStripe(false, data.get('prompt')) // we are passing false because because it is for user profile

  form.reset()

  // Bot's chatStripe
  const uniqueId = generateUinqueId()
  chatContainer.innerHTML += chatStripe(true, ' ', uniqueId) // we are passing true because because it is for AI profile

  chatContainer.scrollTop = chatContainer.scrollHeight

  const messageDiv = document.getElementById(uniqueId)

  loader(messageDiv)

  // fetch data from server --- Bot's Response

  const response = await fetch('http://localhost:5000', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: data.get('prompt'),
    }),
  })
  clearInterval(loadInterval)
  messageDiv.innerHTML = ''

  if (response.ok) {
    const data = await response.json()
    const parsedData = data.bot.trim()

    typeText(messageDiv, parsedData)
  } else {
    const err = await response.text()

    messageDiv.innerHTML = 'Something went wrong'

    alert(err)
  }
}

form.addEventListener('submit', handleSubmit)
form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e)
  }
})
