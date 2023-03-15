async function vote(first) {
    if (document.querySelector('div.alert.alert-success') != null && document.querySelector('div.alert.alert-success').parentElement.style.display !== 'none') {
        chrome.runtime.sendMessage({successfully: true})
        return
    }
    if (document.querySelector('div.alert.alert-danger') != null && document.querySelector('div.alert.alert-danger').parentElement.style.display !== 'none') {
        if (document.querySelector('div.alert.alert-danger').textContent.includes('already voted')) {
            chrome.runtime.sendMessage({later: true})
            return
        }
        chrome.runtime.sendMessage({message: document.querySelector('div.alert.alert-danger').textContent})
        return
    }

    document.querySelector('a[data-target="#vote"]').click()

    if (first) return

    const project = await getProject('TrackyServer')
    document.querySelector('form.vote input[name="username"]').value = project.nick
    document.querySelector('form.vote button[type="submit"]').click()
}

const timer = setInterval(()=>{
    try {
        //Ищет надпись в которой написано что вы проголосовали или вы уже голосовали, по этой надписи скрипт завершается
        if (document.querySelector('div.alert.alert-success') != null && document.querySelector('div.alert.alert-success').parentElement.style.display !== 'none') {
            clearInterval(timer)
            chrome.runtime.sendMessage({successfully: true})
            return
        }
        if (document.querySelector('div.alert.alert-danger') != null && document.querySelector('div.alert.alert-danger').parentElement.style.display !== 'none') {
            const request = {}
            request.message = document.querySelector('div.alert.alert-danger').innerText
            if (request.message.includes('already voted')) {
                chrome.runtime.sendMessage({later: true})
                clearInterval(timer)
            } else if (request.message.includes('Captcha is not valid')) {
                // None
            } else {
                clearInterval(timer)
                if (request.message.includes('There was a problem during the vote, please try again')) {
                    request.ignoreReport = true
                }
                chrome.runtime.sendMessage(request)
            }
        }
    } catch (e) {
        clearInterval(timer)
        throwError(e)
    }
}, 100)