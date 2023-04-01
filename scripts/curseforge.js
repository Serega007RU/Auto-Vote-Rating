async function vote(first) {
    if (document.querySelector('div.grid div.text-center h2')) {
        const message = document.querySelector('div.grid div.text-center h2').textContent
        if (message.includes('Thanks for voting')) {
            chrome.runtime.sendMessage({successfully: true})
            return
        }
    }

    if (first) return

    const project = await getProject('CurseForge')
    document.querySelector('div.items-center.justify-center').lastElementChild.click()
    document.querySelector('input[maxlength="16"]').value = project.nick
    document.querySelector('input[maxlength="16"]').dispatchEvent(new Event('input'))
    document.querySelector('div.justify-center button[type="submit"]').click()
}

const timer = setInterval(() => {
    if (document.querySelector('div.grid div.text-center h2')) {
        const message = document.querySelector('div.grid div.text-center h2').textContent
        if (message.includes('Thanks for voting')) {
            chrome.runtime.sendMessage({successfully: true})
            clearInterval(timer)
        }
    }
}, 1000)