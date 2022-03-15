async function vote(first) {
    try {
        if (checkAnswer()) return
        
        if (first) return

        const project = await getProject('ServeurPrive', true)
        document.querySelector('#pseudo').value = project.nick
        document.querySelector('#btnvote').click()
    } catch (e) {
        throwError(e)
    }
}

const timer = setInterval(()=>{
    if (checkAnswer()) {
        clearInterval(timer)
    }
}, 1000)

function checkAnswer() {
    //Ессли есть ошибка
    if (document.querySelector('.alert.alert-danger') != null) {
        //Если не удалось пройти капчу
        if (document.querySelector('.alert.alert-danger').textContent.includes('captcha')) {
            chrome.runtime.sendMessage({message: document.querySelector('.alert.alert-danger').textContent})
            //Если вы уже голосовали
        } else if (document.querySelector('.alert.alert-danger').textContent.includes('Vous avez déjà voté pour ce serveur')) {
            const numbers = document.querySelector('.alert.alert-danger').textContent.match(/\d+/g).map(Number)
            const milliseconds = (numbers[0] * 60 * 60 * 1000) + (numbers[1] * 60 * 1000) + (numbers[2] * 1000)
            chrome.runtime.sendMessage({later: Date.now() + milliseconds})
        } else {
            chrome.runtime.sendMessage({message: document.querySelector('.alert.alert-danger').textContent})
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