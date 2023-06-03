async function vote(first) {
    if (document.querySelector('div.alert.alert-success')) {
        chrome.runtime.sendMessage({successfully: true})
        return
    }
    if (document.querySelector('div.alert.alert-danger')) {
        const request = {}
        request.message = document.querySelector('div.alert.alert-danger').innerText.trim()
        if (request.message.includes('Je mag maar') || request.message.includes('can only vote once per')) {
            chrome.runtime.sendMessage({later: true})
            return
        } else if (request.message.includes('not validated the captcha')) {
            // None
        } else {
            chrome.runtime.sendMessage(request)
            return
        }
    }

    if (first) return

    const project = await getProject('MinecraftKrant')
    if (document.querySelector('form input[name="is_review"]')?.checked) {
        document.querySelector('form input[name="is_review"]').click()
    }
    document.querySelector('form input[name="minecraft_name"]').value = project.nick
    document.querySelector('form button:last-child > span').parentElement.click()
}