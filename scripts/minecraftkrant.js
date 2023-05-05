async function vote(first) {
    if (document.querySelector('div.alert.alert-success') != null) {
        chrome.runtime.sendMessage({successfully: true})
        return
    }
    if (document.querySelector('div.alert.alert-danger') != null) {
        if (document.querySelector('div.alert.alert-danger').textContent.includes('Je mag maar')) {
            chrome.runtime.sendMessage({later: true})
            return
        }
        chrome.runtime.sendMessage({message: document.querySelector('div.alert.alert-danger').textContent})
        return
    }

    if (first) return

    const project = await getProject('MinecraftKrant')
    if (document.querySelector('form input[name="is_review"]')?.checked) {
        document.querySelector('form input[name="is_review"]').click()
    }
    document.querySelector('form input[name="minecraft_name"]').value = project.nick
    document.querySelector('form button:last-child > span').parentElement.click()
}