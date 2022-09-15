async function vote(/*first*/) {
    if (document.querySelector('div.border-2')) {
        const message = document.querySelector('div.border-2').textContent
        if (message.includes('Thanks for voting')) {
            chrome.runtime.sendMessage({successfully: true})
            return
        }
    }

    const project = await getProject('MinecraftGlobal')
    const inputNick = findElement('p', 'your minecraft username')
    inputNick.nextElementSibling.value = project.nick
    const buttonVote = findElement('p', 'upvote')
    buttonVote.click()
}

function findElement(selector, text) {
    for (const element of document.querySelectorAll(selector)) {
        if (element.textContent.toLowerCase().includes(text)) {
            return element
        }
    }
}

const timer = setInterval(()=>{
    try {
        if (document.querySelector('div.border-2')) {
            const message = document.querySelector('div.border-2').textContent
            if (message.includes('Thanks for voting')) {
                clearInterval(timer)
                chrome.runtime.sendMessage({successfully: true})
                return
            }
        }
        if (document.querySelector('div[role=status]')) {
            const message = document.querySelector('div[role=status]').textContent
            if (message.includes('can vote again')) {
                clearInterval(timer)
                chrome.runtime.sendMessage({later: true})
            } else if (!message.includes('captcha')) {
                clearInterval(timer)
                chrome.runtime.sendMessage({message})
            }
        }
    } catch (e) {
        clearInterval(timer)
        throwError(e)
    }
}, 250)