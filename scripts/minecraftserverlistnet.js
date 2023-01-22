async function vote(first) {
    if (document.querySelector('div.alert.alert-danger')) {
        const request = {}
        request.message = document.querySelector('div.alert.alert-danger').textContent
        if (request.message.includes('Du hast bereits')) {
            const numbers = document.querySelector('div.alert.alert-danger').childNodes[2].textContent.match(/\d+/g).map(Number)
            const milliseconds = (numbers[0] * 60 * 60 * 1000) + (numbers[1] * 60 * 1000)/* + (sec * 1000)*/
            chrome.runtime.sendMessage({later: Date.now() + milliseconds})
            return
        }
        if (request.message.includes('Server existiert nicht')) {
            request.ignoreReport = true
        }
        if (request.message.toLowerCase().includes('captcha')) {
            // None
        } else {
            chrome.runtime.sendMessage(request)
            return
        }
    }
    if (document.querySelector('div.alert.alert-success') != null) {
        chrome.runtime.sendMessage({successfully: true})
        return
    }

    if (first) return

    const project = await getProject('MinecraftServerListNet')
    document.getElementById('mcname').value = project.nick
    document.querySelector('button.btn.btn-success.btn-lg').click()
}