async function vote(first) {
    if (first) return

    const project = await getProject()
    document.querySelector('#username').value = project.nick
    document.querySelector('button[type="submit"] img[alt="Login"]').parentElement.click()
}

const timer = setInterval(() => {
    try {
        if (document.querySelector('.vue-notification.success')) {
            clearInterval(timer)
            chrome.runtime.sendMessage({successfully: true})
        } else if (document.querySelector('.vue-notification.error')) {
            clearInterval(timer)
            const request = {}
            request.message = document.querySelector('.vue-notification.error').innerText
            if (request.message.includes('already voted')) {
                chrome.runtime.sendMessage({later: true})
            } else {
                if (request.message.includes('Something went wrong')) {
                    request.ignoreReport = true
                }
                chrome.runtime.sendMessage(request)
            }
        }
    } catch (error) {
        clearInterval(timer)
        throwError(error)
    }
}, 1000)