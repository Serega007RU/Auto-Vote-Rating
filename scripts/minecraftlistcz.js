async function vote(first) {
    if (document.body.innerHTML.length === 0) {
        chrome.runtime.sendMessage({emptyError: true, ignoreReport: true})
        return
    }
    if (document.querySelector('.alert.alert-success')) {
        chrome.runtime.sendMessage({successfully: true})
        return
    }
    if (document.querySelector('.alert.alert-primary')) {
        const request = {}
        request.message = document.querySelector('.alert.alert-primary').textContent.trim()
        if (request.message.includes('reCaptcha')) {
            return
        } else if (request.message.includes('si hlasoval')) {
            chrome.runtime.sendMessage({later: true})
            return
        } else {
            if (!request.message.includes('server u nás nemá nakonfigurované hlasování')) {
                chrome.runtime.sendMessage(request)
                return
            }
        }
    }
    if (document.querySelector('.alert.alert-danger')) {
        const request = {}
        request.message = document.querySelector('.alert.alert-danger').textContent.trim()
        chrome.runtime.sendMessage(request)
        return
    }
    if (document.querySelector('div.content.content-full h1')) {
        const request = {}
        request.message = document.querySelector('div.content.content-full h1').textContent.trim() + ' ' + document.querySelector('div.content.content-full h2').textContent.trim()
        if (request.message.includes('ale tato stránka nebyla nalezena')) {
            request.ignoreReport = true
        }
        chrome.runtime.sendMessage(request)
        return
    }
    if (document.querySelector('#vote-form').textContent.includes('si hlasoval')) {
        chrome.runtime.sendMessage({later: true})
        return
    }
    // Ошибки 5xx
    if (document.querySelector("#main-container div.hero div.text-center h1")) {
        const request = {}
        request.message = document.querySelector("#main-container div.hero div.text-center h1").parentElement.innerText
        request.ignoreReport = true
        chrome.runtime.sendMessage(request)
        return
    }
    if (document.querySelector('a[href*="/vote"]')) {
        document.querySelector('a[href*="/vote"]').click()
        return
    }

    if (first) return

    const project = await getProject('MinecraftListCZ')
    document.querySelector('input[name="username"]').value = project.nick
    document.querySelector('#gdpr').checked = true

    // TODO ну хорошо, подождём мы секунду, но явно проблема не в "быстром JavaScript" (костыльное решение ошибки "Souhlas s GDPR musí být vyplněn.")
    await wait(Math.floor(Math.random() * 500 + 500))

    document.querySelector('div.vote__box__buttonRow__button button[type="submit"]').click()
}