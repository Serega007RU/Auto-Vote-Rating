async function vote(first) {
    if (checkAnswer()) return

    const project = await getProject()
    document.querySelector('#username').value = project.nick

    //Если у нас не настоящая капча, значит голосуем сразу без капчи
    if (document.querySelector('#voteForm img[alt="Hcaptcha"]')) {
        document.querySelector('#voteBtn').click()
    } else {
        chrome.runtime.sendMessage({captcha: true})
    }
}

const timer = setInterval(()=>{
    try {
        if (checkAnswer()) {
            clearInterval(timer)
        }
    } catch (e) {
        clearInterval(timer)
        throwError(e)
    }
}, 1000)

const timer2 = setInterval(() => {
    try {
        if (document.querySelector('div.iconcaptcha-modal__body-title')?.textContent?.includes?.('Complété')) {
            clearInterval(timer2)
            document.querySelector('#voteBtn').click()
        }
    } catch (error) {
        clearInterval(timer2)
        throwError(error)
    }
}, 1000)

function checkAnswer() {
    //Если есть ошибка
    if (document.querySelector('.alert.alert-danger')?.innerText.trim?.()?.length) {
        const request = {}
        request.message = document.querySelector('.alert.alert-danger').innerText.trim()
        //Если не удалось пройти капчу
        if (request.message.includes('captcha') || request.message.includes('pseudo')) {
            return false
            //Если вы уже голосовали
        } else if (request.message.includes('Vous avez déjà voté pour ce serveur')) {
            chrome.runtime.sendMessage({later: true})
            return true
        } else {
            if ((request.message.toLowerCase().includes('proxy') && request.message.toLowerCase().includes('vpn')) || request.message.toLowerCase().includes('votre ip') || request.message.toLowerCase().includes('erreur interne')) {
                request.ignoreReport = true
            }
            chrome.runtime.sendMessage(request)
        }
        return true
    }
    // Если мы видим таймер показывающий сколько осталось до следующего голосования
    if (document.querySelector('#cooldown div.counter')) {
        const message = document.querySelector('#cooldown div.counter').innerText
        const numbers = message.match(/\d+/g).map(Number)
        const milliseconds = (numbers[0] * 60 * 60 * 1000) + (numbers[1] * 60 * 1000) + (numbers[2] * 1000)
        chrome.runtime.sendMessage({later: Date.now() + milliseconds})
        return true
    }
    //Если успешное авто-голосование
    if (document.querySelector('.alert.alert-success')) {
        chrome.runtime.sendMessage({successfully: true})
        return true
    }
    return false
}