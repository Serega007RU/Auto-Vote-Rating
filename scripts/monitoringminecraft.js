async function vote(first) {
    if (first === false) return
    if (document.querySelector('body') != null && document.querySelector('body').textContent.includes('Вы слишком часто обновляете страницу. Умерьте пыл.')) {
        window.location.reload()
        return
    }
    //Чистит куки
    //document.cookie.split(';').forEach(function(c) { document.cookie = c.replace(/^ +/,"").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");})
    //Проверяет есть ли кнопка 'голосовать', если есть то голосует, если нет, ждёт когда страница полностью загрузица иначе отправляет ошибку
    if (document.querySelector('input[name=player]') != null) {
        const project = await getProject('MonitoringMinecraft')
        document.querySelector('input[name=player]').value = project.nick
        document.querySelector('input[value=Голосовать]').click()
    } else {
        const request = {}
        request.message = document.querySelector('center').textContent
        if (request.message.includes('Вы уже голосовали сегодня')) {
            chrome.runtime.sendMessage({later: true})
        } else if (request.message.includes('Вы успешно проголосовали!')) {
            chrome.runtime.sendMessage({successfully: true})
        } else {
            if (request.message.includes('Ошибка подключения VK') || request.message.includes('Неправильное имя игрока')) {
                request.ignoreReport = true
            }
            chrome.runtime.sendMessage(request)
        }
    }
}