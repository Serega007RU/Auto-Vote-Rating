async function vote(first) {
    if (checkAnswer()) return

    if (first) return

    const project = await getProject('McListIo')
    document.querySelector('#nickname').value = project.nick
    // TODO ааа??? а точно здесь нужен await???
    // noinspection ES6RedundantAwait
    await document.querySelector('#nickname').dispatchEvent(new Event('input'))
    document.querySelector('#submit').click()
}

const timer = setInterval(() => {
    if (checkAnswer()) {
        clearInterval(timer)
    }
}, 1000)

function checkAnswer() {
    if (document.querySelector('div.xl\\:container.text-center')?.innerText.includes('vote has been added')) {
        chrome.runtime.sendMessage({successfully: true})
        return true
    } else if (document.querySelector('div.Vue-Toastification__toast-body')) {
        const message = document.querySelector('div.Vue-Toastification__toast-body').textContent
        if (message.includes('already voted')) {
            chrome.runtime.sendMessage({later: true})
        } else {
            chrome.runtime.sendMessage({message})
        }
        return true
    }
    return false
}