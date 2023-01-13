async function vote(first) {
    if (document.querySelector('.notification') != null) {
        if (document.querySelector('.notification.is-success') != null) {
            chrome.runtime.sendMessage({successfully: true})
            return
        } else if (document.querySelector('.notification.is-warning') != null && document.querySelector('.notification.is-warning').textContent.includes('Hlasovat můžete až')) {
            //Сайт предоставляет когда следующее голосование но не понятно в каком часовом поясе указано время, также не указывается день (пишет только часы и минуты) что ещё больше осложняет определение времени следующего голосования
            chrome.runtime.sendMessage({later: Date.now() + 7200000})
            return
        } else {
            const message = document.querySelector('.notification').textContent.trim()
            if (message.toLowerCase().includes('captcha') || message.toLowerCase().includes('že nejste robot')) {
                if (first) chrome.runtime.sendMessage({captcha: true})
                return
            } else {
                chrome.runtime.sendMessage({message})
                return
            }
        }
    }
    if (document.querySelector('body > .container > h1.title')) {
        const request = {}
        request.message = document.querySelector('body > .container > h1.title').textContent
        if (request.message.includes('stránka nebyla nalezena')) {
            request.ignoreReport = true
        }
        chrome.runtime.sendMessage(request)
        return
    }

    if (first) {
        document.querySelector('.columns .column button.button').click()
        return
    }
    let project = await getProject('MinecraftServery')
    document.querySelector('.modal form input[name="nickname"]').value = project.nick
    document.querySelector('.modal form button[type="submit"]').click()
}