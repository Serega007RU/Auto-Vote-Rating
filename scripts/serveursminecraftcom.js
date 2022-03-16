async function vote(first) {
    if (document.querySelector('div.alert-success') != null) {
        chrome.runtime.sendMessage({successfully: true})
        return
    }
    if (document.querySelector('div.row p').textContent && document.querySelector('div.row p').textContent.includes('Vous avez déjà voté pour ce serveur')) {
        chrome.runtime.sendMessage({later: true})
        return
    }

    if (first) return

    const project = await getProject('ServeursMinecraftCom')
    document.querySelector('#form_username').value = project.nick
    document.querySelector('form button[type="submit"]').click()
}