async function vote(first) {
    if (analyseText()) {
        return
    }

    if (first) return

    const project = await getProject()

    const textInputRef = document.querySelector('#username')
    const prototype = Object.getPrototypeOf(textInputRef)
    const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set
    prototypeValueSetter.call(textInputRef, project.nick)
    textInputRef.dispatchEvent(new Event('input', { bubbles: true }))

    document.querySelector('button.vote-button').click()
}

const timer = setInterval(()=>{
    if (analyseText()) {
        clearInterval(timer)
    }
}, 500)

function analyseText() {
    const request = {}
    if (document.querySelector('#alert_box')) {
        request.message = document.querySelector('#alert_box').textContent
    } else if (document.querySelector('#toast-container')) {
        request.message = document.querySelector('#toast-container').textContent
    } else if (document.querySelector("div.content h2")?.textContent.includes('Application error')) {
        request.message = document.querySelector("div.content h2")?.textContent
        request.ignoreReport = true
        chrome.runtime.sendMessage(request)
        return true
    } else {
        return false
    }
    if (request.message.includes('have successfully cast your vote')) {
        chrome.runtime.sendMessage({successfully: true})
    } else if (request.message.includes('captcha is not valid')) {
        // None
        return false
    } else if (request.message.includes('You can vote again in') && /\d/.test(request.message)) {
        const numbers = request.message.match(/\d+/g).map(Number)
        const milliseconds = (numbers[0] * 60 * 60 * 1000) + (numbers[1] * 60 * 1000) + (numbers[2] * 1000)
        chrome.runtime.sendMessage({later: Date.now() + milliseconds})
    } else {
        chrome.runtime.sendMessage(request)
    }
    return true
}