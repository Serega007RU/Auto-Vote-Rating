async function vote(first) {
    if (document.querySelector('.alert.alert-success') != null) {
        chrome.runtime.sendMessage({successfully: true})
        return
    }
    if (document.querySelector('.alert.alert-primary') != null) {
        if (document.querySelector('.alert.alert-primary').textContent.includes('si hlasoval')) {
            chrome.runtime.sendMessage({later: true})
        } else {
            chrome.runtime.sendMessage({message: document.querySelector('.alert.alert-primary').textContent.trim()})
        }
        return
    }
    if (document.querySelector('.vote__box').textContent.includes('si hlasoval')) {
        chrome.runtime.sendMessage({later: true})
        return
    }

    if (first) return

    const project = await getProject('MinecraftListCZ')
    document.querySelector('input[name="username"]').value = project.nick
    // TODO временный код
    if (document.querySelector("#gdpr") && window.getComputedStyle(document.querySelector("#gdpr")).visibility === 'visible') {
        document.querySelector("#gdpr").checked = true
    } else {
        chrome.runtime.sendMessage({message: "Agree (Souhlasím) is not visible"})
    }
    // TODO конец
    document.querySelector('div.vote__box__buttonRow__button button[type="submit"]').click()
}