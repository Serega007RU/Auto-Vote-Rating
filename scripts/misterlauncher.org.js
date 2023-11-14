async function vote(first) {
    const project = await getProject()
    // TODO позже надо убрать отсюда project.game
    if (project.game === 'projects' || project.listing === 'projects') {
        if (first === false) return

        if (document.querySelector('.container div.alert.alert-danger') && document.querySelector('.container div.alert.alert-danger').style.display !== 'none') {
            const message = document.querySelector('.container div.alert.alert-danger').textContent
            if (message.includes('Вы уже голосовали за этот проект')) {
                chrome.runtime.sendMessage({later: true})
            } else {
                chrome.runtime.sendMessage({message})
            }
            return
        }

        if (document.querySelector('.container div.alert.alert-success') && document.querySelector('.container div.alert.alert-success').style.display !== 'none') {
            const message = document.querySelector('.container div.alert.alert-success').textContent
            if (message.includes('Спасибо за Ваш голос!')) {
                chrome.runtime.sendMessage({successfully: true})
            } else {
                chrome.runtime.sendMessage({message})
            }
            return
        }

        document.querySelector('input[name=nick]').value = project.nick
        document.querySelector('button[type=submit]').click()
    } else {
        const timer = setInterval(()=>{
            try {
                if (document.querySelector('#messages').textContent.length > 0) {
                    const request = {}
                    request.message = document.querySelector('#messages').textContent
                    if (request.message.includes('Спасибо за Ваш голос')) {
                        clearInterval(timer)
                        chrome.runtime.sendMessage({successfully: true})
                    } else if (request.message.includes('уже голосовали')) {
                        clearInterval(timer)
                        const numbers = request.message.match(/\d+/g).map(Number)
                        chrome.runtime.sendMessage({later: Date.UTC(numbers[2], numbers[1] - 1, numbers[0], numbers[3], numbers[4], numbers[5]) - 10800000 + 60000})
                    } else if (request.message.includes('Проверка на робота не пройдена')) {
                        // None
                    } else {
                        clearInterval(timer)
                        chrome.runtime.sendMessage(request)
                    }
                }
            } catch (e) {
                clearInterval(timer)
                throwError(e)
            }
        }, 500)

        if (first) return

        document.querySelector('#form-vote-server button[type="submit"]').click()
    }
}