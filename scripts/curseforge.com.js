async function vote(first) {
    if (checkAnswer()) return

    if (first) return

    const project = await getProject()
    document.querySelector('div.items-center.justify-center').lastElementChild.click()
    document.querySelector('input[maxlength="16"]').value = project.nick
    document.querySelector('input[maxlength="16"]').dispatchEvent(new Event('input'))
    document.querySelector('div.justify-center button[type="submit"]').click()
}

const timer = setInterval(() => {
    if (checkAnswer()) {
        clearInterval(timer)
    }
}, 1000)

function checkAnswer() {
    if (document.querySelector('div.grid div.text-center h2')) {
        const message = document.querySelector('div.grid div.text-center h2').textContent
        if (message.includes('Thanks for voting')) {
            chrome.runtime.sendMessage({successfully: true})
            return true
        }
    } else if (document.querySelector('div.grid div.text-center p.text-error')) {
        const message = document.querySelector('div.grid div.text-center p.text-error').textContent
        if (message.includes('already voted')) {
            chrome.runtime.sendMessage({later: true})
        } else {
            chrome.runtime.sendMessage({message})
        }
        return true
    }
    return false
}