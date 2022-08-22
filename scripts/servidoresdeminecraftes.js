async function vote(first) {
    if (document.querySelector('div.alert-success')) {
        chrome.runtime.sendMessage({successfully: true})
        return
    }
    if (document.querySelector('div.alert-danger')) {
        const message = document.querySelector('div.alert-danger').textContent.trim()
        if (message.includes('has votado')) {
            chrome.runtime.sendMessage({later: true})
        } else {
            chrome.runtime.sendMessage({message})
        }
        return
    }

    if (first) return

    const project = await getProject('ServidoresdeMinecraftEs')
    document.querySelector('#inputVoterName').value = project.nick
    document.querySelector('#submitVoterName').click()
}

const timer = setInterval(()=>{
    try {
        if (document.querySelector('div.alert-success')) {
            clearInterval(timer)
            chrome.runtime.sendMessage({successfully: true})
        } else if (document.querySelector('div.alert-danger')) {
            clearInterval(timer)
            const message = document.querySelector('div.alert-danger').textContent.trim()
            if (message.includes('has votado')) {
                chrome.runtime.sendMessage({later: true})
            } else {
                chrome.runtime.sendMessage({message})
            }
        }
    } catch (e) {
        clearInterval(timer)
        throwError(e)
    }
}, 1000)