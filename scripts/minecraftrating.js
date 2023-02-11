async function vote(first) {
    const project = await getProject('MinecraftRating')
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

        if (first) return

        document.querySelector('#voteForm button[type="submit"]').click()
    }
}