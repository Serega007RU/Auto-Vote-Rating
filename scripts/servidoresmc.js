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

    if (document.querySelector('#p1').style.width !== '100%') {
        await new Promise(resolve => {
            const timer = setInterval(() => {
                try {
                    if (document.querySelector('#p1').style.width === '100%') {
                        clearInterval(timer)
                        resolve()
                    }
                } catch (error) {
                    clearInterval(timer)
                    throwError(error)
                }
            }, 100)
        })
    }

    const project = await getProject('ServidoresMC')
    document.querySelector('input#minecraft').value = project.nick
    document.querySelector('button#votador').click()
}