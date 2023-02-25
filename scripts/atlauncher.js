async function vote(first) {
    if (document.querySelector('div[role="alert"][x-data="{ show: true }"]')) {
        const text = document.querySelector('div[role="alert"][x-data="{ show: true }"]').textContent.trim()
        if (text.includes('vote has been added to the server')) {
            chrome.runtime.sendMessage({successfully: true})
        } else if (text.includes('already voted')) {
            chrome.runtime.sendMessage({later: true})
        } else {
            chrome.runtime.sendMessage({message: text})
        }
        return
    }

    if (first) return

    const project = await getProject('ATLauncher')
    document.querySelector('#username').value = project.nick
    document.querySelector('form input[value="Vote"]').click()
}