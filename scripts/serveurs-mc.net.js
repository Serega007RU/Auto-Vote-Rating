async function vote(first) {
    if (document.querySelector('div.alert-success')) {
        chrome.runtime.sendMessage({successfully: true})
        return
    }
    if (document.querySelector('div.alert-warning')) {
        const request = {}
        request.message = document.querySelector('div.alert-warning').textContent.trim()
        if (request.message.includes('Vous avez déjà voté pour ce serveur')) {
            chrome.runtime.sendMessage({later: true})
        } else if (request.message.includes('Vous devez compléter le captcha')) {
            //None
        } else {
            if (request.message.includes('Aucun serveur n\'a été trouvé')) {
                request.ignoreReport = true
                request.retryCoolDown = 21600000
            }
            chrome.runtime.sendMessage(request)
        }
        return
    }
    if (document.querySelector('div.content-body.justify-content-center')?.innerText.includes('Erreur 404')) {
        chrome.runtime.sendMessage({message: document.querySelector('div.content-body.justify-content-center').innerText, ignoreReport: true, retryCoolDown: 21600000})
        return
    }

    if (first) return

    const project = await getProject()
    document.querySelector('form input[name="pseudo"]').value = project.nick
    if (document.querySelector('form button.disabled')) {
        //Какие-то не понятные костыли в случае если мы уже голосовали
        const button = document.querySelector('form button.disabled')
        button.disabled = false
        button.classList.remove('disabled')
        button.click()
    } else {
        document.querySelector('form button[type="submit"]').click()
    }
}