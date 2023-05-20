async function vote(first) {
    if (document.querySelector('body > h2')) {
        const request = {}
        request.message = document.querySelector('body > h2').innerText
        if (request.message.includes('Completa el CAPCHA')) {
            request.ignoreReport = true
        }
        chrome.runtime.sendMessage(request)
        return
    }

    if (document.querySelector('div.sweet-alert')) {
        const request = {}
        request.message = document.querySelector('div.sweet-alert').innerText
        if (request.message.includes('Gracias por votar')) {
            chrome.runtime.sendMessage({successfully: true})
        } else if (request.message.includes('has votado')) {
            chrome.runtime.sendMessage({later: true})
        } else {
            chrome.runtime.sendMessage(request)
        }
        return
    }

    if (first) return

    const project = await getProject('ServidoresMC')
    document.querySelector('input#minecraft').value = project.nick
    document.querySelector('button#votador').click()
}