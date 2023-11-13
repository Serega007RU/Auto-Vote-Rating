async function vote(first) {
    if (checkAnswer()) return

    if (first) return

    const project = await getProject()
    document.querySelector('form#voteform input#username').value = project.nick
    document.querySelector('form#voteform button#button_vote').click()
}

const timer = setInterval(() => {
    if (checkAnswer()) {
        clearInterval(timer)
    }
}, 1000)

function checkAnswer() {
    const toast = document.querySelector('div.toast-message')
    if (toast) {
        const request = {}
        request.message = document.querySelector('div.toast-message').innerText.trim()
        if (request.message.includes('I\'m not a robot')) {
            // None
        } else if (request.message.includes('Vote sent successfully')) {
            chrome.runtime.sendMessage({successfully: true})
            return true
        } else if (request.message.includes('already voted') || request.message.includes('can vote next in')) {
            chrome.runtime.sendMessage({later: true})
            return true
        } else {
            chrome.runtime.sendMessage(request)
            return true
        }
    }
    return false
}