async function vote(first) {
    if (document.querySelector('div.alert.alert-error') != null) {
        if (document.querySelector('div.alert.alert-error').textContent.includes('Du hast bereits innerhalb der letzten')) {
            const later = Date.now() + 86400000
            chrome.runtime.sendMessage({later})
        } else {
            chrome.runtime.sendMessage({message: document.querySelector('div.alert.alert-error').textContent.trim()})
        }
        return
    }
    //Костыль селектор div.col-md-12 (там двойной div.alert.alert-success)
    if (document.querySelector('div.col-md-12 > div.alert.alert-success') != null) {
        chrome.runtime.sendMessage({successfully: true})
        return
    }

    if (first) return

    const project = await getProject('MinecraftServersDe')
    document.querySelector('input[name="username"]').value = project.nick
    document.querySelector('form > button[type="submit"]').click()
}