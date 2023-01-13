async function vote(first) {
    if (first === false) return
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
    if (document.querySelector('div.alert.alert-danger')) {
        const message = document.querySelector('div.alert.alert-danger').innerText
        if (message.includes('cannot vote more than once at the same time')) {
            chrome.runtime.sendMessage({later: true})
        } else {
            chrome.runtime.sendMessage({message})
        }
        return
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