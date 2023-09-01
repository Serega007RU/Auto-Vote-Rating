async function vote(first) {
    if (checkAnswer()) return

    const project = await getProject('ServeurPrive', true)
    document.querySelector('#username').value = project.nick

    //Если у нас не настоящая капча, значит голосуем сразу без капчи
    if (document.querySelector('div.form > div.captcha img[alt="Captcha"]')) {
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

function checkAnswer() {
    //Если есть ошибка
    if (document.querySelector('.alert.alert-danger')?.innerText?.length) {
        const request = {}
        request.message = document.querySelector('.alert.alert-danger').innerText
        //Если не удалось пройти капчу
        if (request.message.includes('captcha') || request.message.includes('pseudo')) {
            return false
            //Если вы уже голосовали
        } else if (request.message.includes('Vous avez déjà voté pour ce serveur')) {
            chrome.runtime.sendMessage({later: true})
        } else {
            if (request.message.toLowerCase().includes('proxy') && request.message.toLowerCase().includes('vpn')) {
                request.ignoreReport = true
            }
            chrome.runtime.sendMessage(request)
        }
        return true
    }
    //Если успешное авто-голосование
    if (document.querySelector('.alert.alert-success')) {
        chrome.runtime.sendMessage({successfully: true})
        return true
    }
    return false
}