async function vote(first) {
    if (first === false) return

    if (isVisibleElement(document.querySelector('.fc-dialog-container'))) {
        chrome.runtime.sendMessage({requiredConfirmTOS: true})
        await new Promise(resolve => {
            const timer2 = setInterval(() => {
                if (!document.querySelector('.fc-dialog-container')) {
                    clearInterval(timer2)
                    resolve()
                }
            }, 1000)
        })
    }

    //Если успешное авто-голосование
    if (document.querySelector('div.alert.alert-success') != null) {
        chrome.runtime.sendMessage({successfully: true})
        return
    }
    //Если есть предупреждение
    if (document.querySelector('div.alert.alert-warning') != null) {
        //Если вы уже голосовали
        if (document.getElementById('voteTimer') != null) {
            const numbers = document.getElementById('voteTimer').textContent.match(/\d+/g).map(Number)
            const milliseconds = /*(hour * 60 * 60 * 1000) + */(numbers[0] * 60 * 1000)/* + (sec * 1000)*/
            chrome.runtime.sendMessage({later: Date.now() + milliseconds})
            return
        } else {
            chrome.runtime.sendMessage({message: document.querySelector('div.alert.alert-warning').innerText})
            return
        }
    }
    //Если есть ошибка
    for (const el of document.querySelectorAll('div.alert.alert-danger')) {
        const request = {}
        request.message = el.innerText
        if (request.message.includes('cannot vote more than once at the same time') || request.message.includes('avant de pouvoir voter à nouveau')) {
            chrome.runtime.sendMessage({later: true})
            return
        } else if (request.message.includes('Captcha')) {
            // None
        } else {
            if (
                    request.message.includes('Sie können nicht wählen, weil Ihr Netzwerk kein')
                    || request.message.includes('cannot vote because your network')
                    || request.message.includes('не можете голосовать из-за того, что находитесь в частной или закрытой сети')
                    || request.message.includes('não pode votar porque sua rede não é uma rede')
                    || request.message.includes('ne pouvez pas voter car votre réseau n\'est pas un réseau')
                    || request.message.includes('puedes votar porque tu red no es una red')) {
                request.ignoreReport = true
            }
            chrome.runtime.sendMessage(request)
            return
        }
    }

    if (document.getElementById('playername') != null) {
        const project = await getProject('TopGames', true)
        document.getElementById('playername').value = project.nick
    }

    const timer = setInterval(function() {
        try {
            if (document.querySelector('#captcha-content > div > div.grecaptcha-logo > iframe') != null) {
                //Ждёт загрузки reCaptcha
                document.querySelector('button[type="submit"]').click()
                clearInterval(timer)
            }
        } catch (e) {
            clearInterval(timer)
            throwError(e)
        }
    }, 1000)

    if (document.querySelector('.mtcaptcha') != null) {
        chrome.runtime.sendMessage({captcha: true})
    }
}