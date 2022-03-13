async function vote(first) {
    try {
        if (first) {
            document.querySelector('[data-target="#vote"]').click()
            return
        }

        const project = await getProject('MineBrowseCom')
        document.querySelector('form.vote input[name="username"]').value = project.nick
        document.querySelector('form.vote button[type="submit"]').click()
    } catch (e) {
        throwError(e)
    }
}

const timer = setInterval(()=>{
    const resp = document.querySelector('#response')
    if (resp.style.display !== 'none') {
        const text = resp.textContent
        if (text.includes('successfully')) {
            chrome.runtime.sendMessage({successfully: true})
        } else if (text.includes('already voted')) {
            chrome.runtime.sendMessage({later: true})
        } else {
            chrome.runtime.sendMessage({message: text})
        }
        clearInterval(timer)
    }
}, 250)