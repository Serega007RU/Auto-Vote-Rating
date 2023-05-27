async function vote(first) {
    if (document.querySelector('#content')?.textContent.includes('Страница которую Вы запрашиваете не существует!')) {
        chrome.runtime.sendMessage({message: document.querySelector('#content').textContent, ignoreReport: true})
        return
    }
    if (first) {
        document.querySelector('span[data-target="#voteModal"]').click()
        return
    }
    const project = await getProject('TMonitoring')

    if (project.id === 'arago') {
        const request = {}
        request.message = 'Отключено расширением. Проект закрыт. Если это не так - сообщите разработчику расширения'
        request.ignoreReport = true
        request.retryCoolDown = 604800000
        chrome.runtime.sendMessage(request)
        return
    }

    if (document.getElementById("nickname") != null) {
        document.getElementById("nickname").value = project.nick
    } else {
        console.warn('[Auto Vote Rating] Нет поля ввода никнейма')
    }
    document.querySelector("#voteModal > div.modal-dialog > div > div.modal-footer.clearfix > div.pull-right > a").click()
}

const timer = setInterval(()=>{
    try {
        if (document.querySelector('div[class="message error"]')) {
            const request = {}
            request.message = document.querySelector('div[class="message error"]').textContent
            if (request.message.includes('уже голосовали')) {
                const numbers = document.querySelector('div[class="message error"]').textContent.match(/\d+/g).map(Number)
                const milliseconds = (numbers[0] * 60 * 60 * 1000) + (numbers[1] * 60 * 1000)/* + (sec * 1000)*/
                chrome.runtime.sendMessage({later: Date.now() + milliseconds})
                clearInterval(timer)
            } else {
                if (!request.message.toLowerCase().includes('капча')) {
                    if (request.message.includes('Ключи безопасности не совпадают')) {
                        request.ignoreReport = true
                    }
                    chrome.runtime.sendMessage(request)
                    clearInterval(timer)
                }
            }
        } else if (document.querySelector('div[class="message success"]') != null) {
            chrome.runtime.sendMessage({successfully: true})
            clearInterval(timer)
        }
    } catch (e) {
        clearInterval(timer)
        throwError(e)
    }
}, 1000)