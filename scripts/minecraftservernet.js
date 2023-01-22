async function vote(first) {
    //Если есть сообщение
    if (document.querySelector('div.alert.alert-success') != null) {
        chrome.runtime.sendMessage({successfully: true})
        return
    }
    if (document.querySelector('div.alert.alert-danger') != null) {
        if (document.querySelector('div.alert.alert-danger').textContent.includes('already voting')) {
            chrome.runtime.sendMessage({later: Date.now() + 86400000})//+ 24 часа
        } else {
            chrome.runtime.sendMessage({message: document.querySelector('div.alert.alert-danger').textContent.trim()})
        }
        return
    }

    if (first) return

    const project = await getProject('MinecraftServerNet')
    if (document.getElementById('mc_user')) document.getElementById('mc_user').value = project.nick
    document.getElementById('rate-10').click()
    document.querySelector('input[value="Confirm Vote"]').click()
}