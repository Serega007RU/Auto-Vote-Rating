async function vote(first) {
    if (document.querySelector('div.justify-center.w-screen')) {
        const message = document.querySelector('div.justify-center.w-screen').innerText
        if (message.length > 0) {
            if (message.toLowerCase().includes('thanks')) {
                chrome.runtime.sendMessage({successfully: true})
            } else if (message.includes('can only vote once')) {
                chrome.runtime.sendMessage({later: true})
            } else {
                chrome.runtime.sendMessage({message})
            }
            return
        }
    }

    if (first) return

    const project = await getProject('MinecraftSurvivalServersCom')
    document.querySelector('#name').value = project.nick
    document.querySelector('#recaptcha').nextElementSibling.firstChild.click()
}

const timer = setInterval(()=>{
    try {
        if (document.querySelector('div.justify-center.w-screen')) {
            const message = document.querySelector('div.justify-center.w-screen').innerText
            if (message.length > 0) {
                clearInterval(timer)
                if (message.toLowerCase().includes('thanks')) {
                    chrome.runtime.sendMessage({successfully: true})
                } else if (message.includes('can only vote once')) {
                    chrome.runtime.sendMessage({later: true})
                } else {
                    chrome.runtime.sendMessage({message})
                }
            }
        }
    } catch (e) {
        clearInterval(timer)
        throwError(e)
    }
}, 1000)