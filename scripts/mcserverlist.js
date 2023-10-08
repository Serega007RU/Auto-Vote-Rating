async function vote() {
    if (document.querySelector('div.alert')) {
        if (document.querySelector('div.alert-danger')) {
            const message = document.querySelector('div.alert-danger').textContent
            if (message.includes('already voted')) {
                chrome.runtime.sendMessage({later: true})
            } else {
                chrome.runtime.sendMessage({message})
            }
        } else if (document.querySelector('div.alert-success')) {
            chrome.runtime.sendMessage({successfully: true})
        }
        return
    }

    const project = await getProject('MCServerList')
    document.querySelector('input[name="playernick"]').value = project.nick
    document.querySelector('input[name="playernick"]').nextElementSibling.click()
}

const timer = setInterval(()=>{
    try {
        if (document.querySelector('div.alert')) {
            clearInterval(timer)
            if (document.querySelector('div.alert-danger')) {
                const message = document.querySelector('div.alert-danger').textContent
                if (message.includes('already voted')) {
                    chrome.runtime.sendMessage({later: true})
                } else {
                    chrome.runtime.sendMessage({message})
                }
            } else if (document.querySelector('div.alert-success')) {
                chrome.runtime.sendMessage({successfully: true})
            }
        }
    } catch (e) {
        clearInterval(timer)
        throwError(e)
    }
}, 1000)
