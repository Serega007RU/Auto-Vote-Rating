async function vote(first) {
    if (document.querySelector('#content div.pform h1')?.textContent === 'Log in') {
        chrome.runtime.sendMessage({auth: true})
        return
    }

    if (checkAnswer()) return

    document.querySelector('.like.votebtn').click()
}

const timer = setInterval(() => {
    if (checkAnswer()) {
        clearInterval(timer)
    }
}, 1000)

function checkAnswer() {
    const message = document.querySelector('.like.votebtn')?.textContent
    if (message) {
        if (message.includes('Vote for the server')) {
            return false
        } else if (message.includes('vote has been counted')) {
            chrome.runtime.sendMessage({successfully: true})
            return true
        } else {
            chrome.runtime.sendMessage({message})
            return true
        }
    }
    return false
}