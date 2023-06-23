async function vote(first) {
    if (first) {
        document.querySelector('a[data-target="#vote"]').click()
        return
    }

    const project = await getProject('CraftBook')
    document.querySelector('form.vote input[name="username"]').value = project.nick
    document.querySelector('form.vote button[type="submit"]').click()
}

const timer = setInterval(() => {
    try {
        const response = document.querySelector('#response')
        if (response.style.display !== 'none') {
            const message = response.innerText.trim()
            if (message.includes('Příkaz byl úspěšně odeslán')) {
                chrome.runtime.sendMessage({successfully: true})
            } else if (message.includes('Již si hlasoval')) {
                chrome.runtime.sendMessage({later: true})
            } else {
                chrome.runtime.sendMessage({message})
            }
            clearInterval(timer)
        }
    } catch (error) {
        clearInterval(timer)
        throwError(error)
    }
}, 1000)