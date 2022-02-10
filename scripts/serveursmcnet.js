async function vote(first) {
    try {
        if (document.querySelector('div.alert-success') != null) {
            chrome.runtime.sendMessage({successfully: true})
            return
        }
        if (document.querySelector('div.alert-warning') != null) {
            if (document.querySelector('div.alert-warning').textContent.includes('Vous avez déjà voté pour ce serveur')) {
                chrome.runtime.sendMessage({later: true})
            } else if (document.querySelector('div.alert-warning').textContent.includes('Vous devez compléter le captcha')) {
                //None
            } else {
                chrome.runtime.sendMessage({message: document.querySelector('div.alert-warning').textContent.trim()})
            }
            return
        }

        if (first) return

        const project = await getProject('ServeursMCNet')
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
    } catch (e) {
        throwError(e)
    }
}