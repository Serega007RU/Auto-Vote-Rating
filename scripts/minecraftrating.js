async function vote(first) {
    const project = await getProject('MinecraftRating')

    if (project.id === 'borealis') {
        const request = {}
        request.message = 'Отключено расширением. В целях безопасности мы временно отключили вам авто-голосование для проекта Borealis.su. На данном проекте его владелец (Bartolomeo) крайне неадекватно себя ведёт и появилась большая вероятность что вас могут забанить за авто-голосование на данном проекте. Не спрашивайте на этом проекте про авто-голосование, иначе вас могут забанить!'
        request.ignoreReport = true
        request.retryCoolDown = 604800000
        chrome.runtime.sendMessage(request)
        return
    } else if (project.id === 'arago') {
        const request = {}
        request.message = 'Отключено расширением. Проект закрыт. Если это не так - сообщите разработчику расширения'
        request.ignoreReport = true
        request.retryCoolDown = 604800000
        chrome.runtime.sendMessage(request)
        return
    }

    if (document.querySelector('.container .text-center')?.textContent.includes('Страница не найдена')) {
        chrome.runtime.sendMessage({message: document.querySelector('.container .text-center').textContent, ignoreReport: true})
        return
    }
    if (document.body.innerText.trim().length < 150) {
        const message = document.body.innerText.trim()
        if (document.querySelector('body > #warning-container') || message.toLocaleLowerCase() === '419\npage expired') {
            chrome.runtime.sendMessage({
                message: document.body.innerText.trim(),
                ignoreReport: true
            })
            return
        }
    }
    if (project.game === 'projects') {
        if (document.querySelector('div.alert.alert-danger') != null) {
            if (document.querySelector('div.alert.alert-danger').textContent.includes('Вы уже голосовали за этот проект')) {
                chrome.runtime.sendMessage({later: true})
            }
        } else if (document.querySelector('div.alert.alert-success') != null && document.querySelector('div.alert.alert-success').textContent.includes('Спасибо за Ваш голос!')) {
            chrome.runtime.sendMessage({successfully: true})
        }

        if (first) {
            document.querySelector('input[name=nick]').value = project.nick
            document.querySelector('button[type=submit]').click()
            return
        }

        document.querySelector('#submitVote').click()
    } else {
        if (first) {
            const timer = setInterval(()=>{
                try {
                    if (document.querySelector('#msgBox').textContent.length > 0) {
                        const message = document.querySelector('#msgBox').textContent
                        if (message.includes('Спасибо за Ваш голос')) {
                            clearInterval(timer)
                            chrome.runtime.sendMessage({successfully: true})
                        } else if (message.includes('уже голосовали')) {
                            clearInterval(timer)
                            const numbers = message.match(/\d+/g).map(Number)
                            chrome.runtime.sendMessage({later: Date.UTC(numbers[2], numbers[1] - 1, numbers[0], numbers[3], numbers[4], numbers[5]) - 10800000 + 60000})
                        } else if (message.includes('Проверка на робота не пройдена')) {
                            // None
                        } else {
                            clearInterval(timer)
                            chrome.runtime.sendMessage({message})
                        }
                    }
                } catch (e) {
                    clearInterval(timer)
                    throwError(e)
                }
            }, 500)

            return
        }

        document.querySelector('#voteForm button[type="submit"]').click()
    }
}