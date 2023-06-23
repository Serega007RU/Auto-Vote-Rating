async function vote(first) {
    if (document.querySelector('div.main-panel > span.red') || document.querySelector('div.main-panel > div.red')) {
        const message = document.querySelector('div.main-panel > span.red')?.textContent || document.querySelector('div.main-panel > div.red')?.textContent
        if (message.toLowerCase().includes('already voted')) {
            chrome.runtime.sendMessage({later: true})
        } else {
            chrome.runtime.sendMessage({message})
        }
        return
    }

    if (document.querySelector('div.main-panel > span.green') || document.querySelector('div.main-panel > div.green')) {
        const message = document.querySelector('div.main-panel > span.green')?.textContent || document.querySelector('div.main-panel > div.green')?.textContent
        if (message.includes('vote was success') || message.includes('successfully voted')) {
            chrome.runtime.sendMessage({successfully: true})
        } else {
            chrome.runtime.sendMessage({message})
        }
        return
    }

    if (document.querySelector('form[method="POST"] > button[type="submit"]').textContent.includes('Next vote in')) {
        chrome.runtime.sendMessage({later: true})
        return
    }

    if (first) return

    const project = await getProject('MCServers')
    if (document.querySelector('#username')) document.querySelector('#username').value = project.nick
    document.querySelector('form[method="POST"] > button[type="submit"]').click()
}