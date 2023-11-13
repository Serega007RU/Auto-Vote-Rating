async function vote(first) {
    if (checkAnswer()) return

    if (document.querySelector('form[wire\\:submit\\.prevent="sendVote"] p.dark\\:text-red-200')?.innerText.length) {
        const request = {}
        request.message = document.querySelector('form[wire\\:submit\\.prevent="sendVote"] p.dark\\:text-red-200').innerText
        if (request.message.includes('Vous devez attendre encore')) {
            const numbers = request.message.match(/\d+/g).map(Number)
            const milliseconds = (numbers[0] * 60 * 60 * 1000) + (numbers[1] * 60 * 1000)
            chrome.runtime.sendMessage({later: Date.now() + milliseconds})
            return
        } else {
            chrome.runtime.sendMessage(request)
            return
        }
    }

    if (first) return

    const project = await getProject()
    document.querySelector('form[wire\\:submit\\.prevent="sendVote"] #pseudo').value = project.nick
    document.querySelector('form[wire\\:submit\\.prevent="sendVote"] button[type="submit"]').click()
}

const timer = setInterval(() => {
    if (checkAnswer()) {
        clearInterval(timer)
    }
}, 1000)

function checkAnswer() {
    const message = document.querySelector('p[x-text="message.message"]')?.parentElement.innerText
    if (message) {
        const request = {}
        request.message = message
        if (request.message.includes('Vous venez de voter pour le serveur')) {
            chrome.runtime.sendMessage({successfully: true})
            return true
        } else if (request.message.includes('Vous devez attendre encore')) {
            const numbers = request.message.match(/\d+/g).map(Number)
            const milliseconds = (numbers[0] * 60 * 60 * 1000) + (numbers[1] * 60 * 1000)
            chrome.runtime.sendMessage({later: Date.now() + milliseconds})
            return true
        } else if (request.message.includes('ReCaptcha')) {
            // Ignore
            return false
        } else {
            chrome.runtime.sendMessage(request)
            return true
        }
    }
    return false
}