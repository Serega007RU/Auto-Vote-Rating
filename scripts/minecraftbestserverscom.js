async function vote(/*first*/) {
    if (document.querySelector('div.border-green-300.bg-green-100')) {
        const message = document.querySelector('div.border-green-300.bg-green-100').innerText
        if (message.includes('vote has been counted')) {
            chrome.runtime.sendMessage({successfully: true})
        } else {
            chrome.runtime.sendMessage(message)
        }
        return
    }

    if (document.querySelector('div.border-red-300.bg-red-100')) {
        const message = document.querySelector('div.border-red-300.bg-red-100').innerText
        if (message.includes('already voted')) {
            chrome.runtime.sendMessage({later: true})
        } else {
            chrome.runtime.sendMessage(message)
        }
    }

    const project = await getProject('MinecraftBestServersCom')
    document.querySelector('#username').value = project.nick
    document.querySelector('.tab form button').click()
}