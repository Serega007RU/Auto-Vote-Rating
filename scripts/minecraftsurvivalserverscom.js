async function vote(first) {
    if (checkPopup()) return

    if (first) return

    const project = await getProject('MinecraftSurvivalServersCom')
    document.querySelector('#name').value = project.nick
    document.querySelector('#recaptcha').nextElementSibling.firstChild.click()
}

const timer = setInterval(()=>{
    try {
        if (checkPopup()) {
            clearInterval(timer)
        }
    } catch (e) {
        clearInterval(timer)
        throwError(e)
    }
}, 1000)

function checkPopup() {
    if (document.querySelector('div.justify-center.w-screen')) {
        const request = {}
        request.message = document.querySelector('div.justify-center.w-screen').innerText
        if (request.message.length > 0) {
            if (request.message.toLowerCase().includes('thanks')) {
                chrome.runtime.sendMessage({successfully: true})
                return true
            } else if (request.message.includes('can only vote once')) {
                chrome.runtime.sendMessage({later: true})
                return true
            } else {
                if (request.message.includes('confirm reCaptcha')) {
                    // None
                } else {
                    chrome.runtime.sendMessage(request)
                    return true
                }
            }
        }
    }
    return false
}