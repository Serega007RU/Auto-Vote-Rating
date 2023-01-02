async function vote(first) {
    if (document.querySelector('#alert_box') != null) {
        analyseText(document.querySelector('#alert_box').textContent)
        return
    }

    if (first) return

    const project = await getProject('ServerListGames')

    const textInputRef = document.querySelector('#username')
    const prototype = Object.getPrototypeOf(textInputRef)
    const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set
    prototypeValueSetter.call(textInputRef, project.nick)
    textInputRef.dispatchEvent(new Event('input', { bubbles: true }))

    document.querySelector('button.vote-button').click()
}

const timer = setInterval(()=>{
    if (document.querySelector('#toast-container') != null) {
        analyseText(document.querySelector('#toast-container').textContent)
        clearInterval(timer)
    }
}, 500)

function analyseText(text) {
    if (text.includes('have successfully cast your vote')) {
        chrome.runtime.sendMessage({successfully: true})
    } else if (text.includes('You can vote again in') && /\d/.test(text)) {
        const numbers = text.match(/\d+/g).map(Number)
        const milliseconds = (numbers[0] * 60 * 60 * 1000) + (numbers[1] * 60 * 1000) + (numbers[2] * 1000)
        chrome.runtime.sendMessage({later: Date.now() + milliseconds})
    } else {
        chrome.runtime.sendMessage({message: text})
    }
}