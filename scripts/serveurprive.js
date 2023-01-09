async function vote(first) {
    if (checkAnswer()) return

    if (first) return

    const project = await getProject('ServeurPrive', true)
    document.querySelector('#pseudo').value = project.nick
    document.querySelector('#btnvote').click()
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
    if (document.querySelector('.alert.alert-danger')) {
        const message = document.querySelector('.alert.alert-danger').textContent
        //Если не удалось пройти капчу
        if (message.includes('captcha')) {
            return false
            //Если вы уже голосовали
        } else if (message.includes('Vous avez déjà voté pour ce serveur')) {
            const numbers = document.querySelector('.alert.alert-danger').textContent.match(/\d+/g).map(Number)
            const milliseconds = (numbers[0] * 60 * 60 * 1000) + (numbers[1] * 60 * 1000) + (numbers[2] * 1000)
            chrome.runtime.sendMessage({later: Date.now() + milliseconds})
        } else {
            chrome.runtime.sendMessage({message})
        }
        return true
    }
    //Если успешное автоголосование
    if (document.querySelector('.alert.alert-success') != null) {
        chrome.runtime.sendMessage({successfully: true})
        return true
    }
    return false
}