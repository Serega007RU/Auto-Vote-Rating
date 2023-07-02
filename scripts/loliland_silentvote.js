// noinspection ES6MissingAwait

async function silentVoteLoliLand(project) {
    if (!chrome.cookies) {
        endVote({message: 'У расширения нет доступа к куки которые нужны для авторизации с loliland, пожалуйста передобавьте данный проект что бы предоставить расширению доступ к куки'}, null, project)
        return
    }

    const cashedLogin = (await chrome.cookies.get({name: 'cashedLogin', url: 'https://loliland.ru/'}))?.value
    const accessToken = (await chrome.cookies.get({name: 'accessToken', url: 'https://loliland.ru/'}))?.value

    if (!cashedLogin || !accessToken) {
        endVote({message: 'Не удалось найти куки loliland\'а, скорее всего вы не авторизовались на сайте https://loliland.ru/'}, null, project)
        return
    }

    const socket = new WebSocket('wss://api.loliland.ru/ws')

    socket.onopen = function(event) {
        socket.send(JSON.stringify({data: {login: cashedLogin, key: accessToken}, packet: 'account.authToken'}))
    }

    socket.onmessage = function(event) {
        const json = JSON.parse(event.data)
        if (json.packet === 'account.authToken') {
            if (json.data?.type === 'success') {
                socket.send(JSON.stringify({data: {}, packet: 'bonus.get'}))
            } else {
                socket.close()
                endVote({message: 'Ошибка с авторизацией, скорее всего вы не авторизовались на сайте https://loliland.ru/, ' + event.data, url: socket.url}, null, project)
            }
        } else if (json.packet === 'bonus.get') {
            socket.close()
            if (json?.data?.type === 'success') {
                endVote({successfully: true}, null, project)
            } else if (json?.data?.type === 'error' && json?.data?.time != null) {
                if (json.data.time === '') {
                    endVote({message: 'LoliLand вернул пустое время следующего голосования. Эта ошибка на стороне LoliLand\'а, просто перезапустите голосование, должно помочь', ignoreReport: true}, null, project)
                    return
                }
                const numbers = json.data.time.match(/\d+/g).map(Number)
                let hours = 0
                let minutes = 0
                let seconds = 0
                let x = 0
                for (let i = numbers.length - 1; i >= 0; i--) {
                    if (x === 0) seconds = numbers[i]
                    else if (x === 1) minutes = numbers[i]
                    else if (x === 2) hours = numbers[i]
                    x++
                }
                const milliseconds = (hours * 60 * 60 * 1000) + (minutes * 60 * 1000) + (seconds * 1000)
                endVote({later: Date.now() + milliseconds}, null, project)
            } else if (json?.data?.type && json?.data?.error) {
                switch (json.data.error) {
                    case 0:
                        endVote({message: 'Ошибка с кодом 0, Текущая сессия истекла'}, null, project)
                        break
                    case 1:
                        endVote({message: 'Ошибка с кодом 1, Не выполнены условия для получения бонуса, Вы не привязали свой аккаунт к VK! Подробнее https://loliland.ru/bonus'}, null, project)
                        break
                    case 2:
                        endVote({message: 'Ошибка с кодом 2, Не выполнены условия для получения бонуса, Вы не подписаны на нашу группу в VK! Подробнее https://loliland.ru/bonus'}, null, project)
                        break
                    case 3:
                        endVote({message: 'Ошибка с кодом 3, Расширение не может посчитать время до следующего голосования? Сообщите об этой ошибке разработчику расширения!', html: event.data, url: socket.url}, null, project)
                        break
                    case 4:
                        endVote({message: 'Ошибка с кодом 4, Обновление баланса не завершилась успешно, попробуйте еще раз!'}, null, project)
                        break
                    default:
                        endVote({message: event.data, html: event.data, url: socket.url}, null, project)
                        break
                }
            } else {
                endVote({message: event.data, html: event.data, url: socket.url}, null, project)
            }
        }
    }

    socket.onclose = function(event) {
        if (!event.wasClean) {
            endVote({message: 'Соединение с веб сокетом прервано сервером, ' + event.code + ' ' + event.reason, url: socket.url}, null, project)
        }
    }

    socket.onerror = function(error) {
        endVote({message: 'Ошибка с веб сокетом, ' + error.toString(), url: socket.url}, null, project)
    }
}