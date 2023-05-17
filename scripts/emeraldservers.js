async function vote(first) {
    if (checkAnswer()) return

    document.querySelector('.button1vote').click()

    const project = await getProject('EmeraldServers')
    document.querySelector('form.vote input[name="username"]').value = project.nick
    document.querySelector('form.vote button[type="submit"]').click()
}

const timer = setInterval(() => {
    try {
        checkAnswer()
    } catch (error) {
        clearInterval(timer)
        throwError(error)
    }
}, 1000)

function checkAnswer() {
    const response = document.querySelector('#response')
    if (response.style.display !== 'none') {
        const request = {}
        request.message = response.innerText.trim()
        if (request.message.includes('Congratulations! Your requested command was performed successfully')) {
            chrome.runtime.sendMessage({successfully: true})
        } else if (request.message.includes('already voted')) {
            chrome.runtime.sendMessage({later: true})
        } else {
            chrome.runtime.sendMessage(request)
        }
        clearInterval(timer)
        return true
    }
    return false
}