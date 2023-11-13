async function vote(first) {
    if (first === false) return

    if (document.querySelector('#error-page .wp-die-message h1')) {
        const request = {}
        request.message = document.querySelector('#error-page .wp-die-message h1').textContent
        request.ignoreReport = true
        chrome.runtime.sendMessage(request)
        return
    }

    //Ожидаем загрузки Contrôle anti-bot
    if (document.querySelector('#loader_circle') != null) {
        await new Promise(resolve => {
            const timer2 = setInterval(()=>{
                if (document.querySelector('#loader_circle') == null) {
                    resolve()
                    clearInterval(timer2)
                }
            }, 1000)
        })
    }

    if (document.querySelector('.gdrts-rating-text') != null) {
        const text = document.querySelector('.gdrts-rating-text').textContent
        if (text.includes('accepte que mon adresse')) {
            //None
        } else if (text.includes('ous avez déjà voté')) {
            chrome.runtime.sendMessage({later: true})
            return
        }/* else {
            chrome.runtime.sendMessage({message: text})
            return
        }*/
    }

    const project = await getProject()
    if (document.querySelector('#minecraft_name')) {
        document.querySelector('#minecraft_name').value = project.nick
        document.querySelector('#submit_name').click()
    }
    document.querySelector('span[title="Voter"]').click()
}

const timer = setInterval(()=>{
    try {
        if (document.querySelector('.ZebraDialog')?.innerText?.length) {
            const request = {}
            request.message = document.querySelector('.ZebraDialog').innerText.trim()
            if (request.message.includes('captcha a expiré')) {
                document.querySelector('.ZebraDialog_Button_0').click()
            } else if (request.message.includes('vote a bien été enregistré') || request.message.includes('erci pour ton vote')) {
                chrome.runtime.sendMessage({successfully: true})
            } else {
                if (request.message.includes('captcha est invalide')) {
                    request.ignoreReport = true
                }
                chrome.runtime.sendMessage(request)
            }
            clearInterval(timer)
        }
    } catch (e) {
        clearInterval(timer)
        throwError(e)
    }
}, 100)