async function vote(first) {
    if (document.querySelector('div.Good')) {
        chrome.runtime.sendMessage({successfully: true})
        return
    }
    if (document.querySelector('div.Error')) {
        const request = {}
        request.message = document.querySelector("div.Error").textContent
        if (request.message.includes('last voted for this server')) {
            chrome.runtime.sendMessage({later: true})
        } else {
            if (request.message.includes('Error while sending the vote')) {
                request.ignoreReport = true
            }
            chrome.runtime.sendMessage(request)
        }
        return
    }

    if (first) return

    const project = await getProject('MinecraftIpList')
    document.querySelector('input[name="userign"]').value = project.nick
    document.querySelector('#votebutton').click()
}