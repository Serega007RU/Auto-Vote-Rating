async function vote(first) {
    if (document.querySelector('.container .text-center')?.textContent.includes('Страница не найдена')) {
        chrome.runtime.sendMessage({message: document.querySelector('.container .text-center').textContent, ignoreReport: true, retryCoolDown: 21600000})
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

    const project = await getProject()

    // TODO позже надо убрать отсюда project.game
    if (project.game === 'projects' || project.listing === 'projects') {
        if (document.querySelector('div.alert.alert-danger') != null) {
            if (document.querySelector('div.alert.alert-danger').textContent.includes('Вы уже голосовали за этот проект')) {
                chrome.runtime.sendMessage({later: true})
                return
            }
        } else if (document.querySelector('div.alert.alert-success') != null && document.querySelector('div.alert.alert-success').textContent.includes('Спасибо за Ваш голос!')) {
            chrome.runtime.sendMessage({successfully: true})
            return
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

let unload = false
window.onbeforeunload = ()=> {
    unload = true
}
window.onunload = ()=> {
    unload = true
}
const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
        if (entry.name === 'https://minecraftrating.ru/set-cookie/') {
            // Дикий костыль в обход ошибки "CSRF token mismatch."
            setTimeout(async () => {
                if (unload) return
                const project = await getProject()

                let response
                try {
                    response = await fetch(document.location.href)
                } catch (error) {
                    chrome.runtime.sendMessage({message: error.toString(), ignoreReport: true})
                    return
                }
                if (!response.ok) {
                    chrome.runtime.sendMessage({errorVote: [String(response.status), response.url]})
                    return
                }
                const text = await response.text()
                const doc = new DOMParser().parseFromString(text, 'text/html')
                const csrfToken = doc.querySelector('#form-vote input[name="_token"]')?.value
                if (!csrfToken) {
                    chrome.runtime.sendMessage({errorVoteNoElement: 'Не найден csrf токен', html: text, url: response.url})
                    return
                }
                document.querySelector('#form-vote input[name="_token"]').value = csrfToken

                try {
                    response = await fetch('/set-cookie/', {
                        headers: {
                            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
                        },
                        method: 'POST',
                        body: '_token=' + csrfToken + '&' + 'name=' + 'voted_project' + '&' + 'value= ' + document.querySelector('[name=url]').value + '__' + project.nick,
                    })
                } catch (error) {
                    chrome.runtime.sendMessage({message: error.toString(), ignoreReport: true})
                    return
                }
                if (!response.ok) {
                    chrome.runtime.sendMessage({errorVote: [String(response.status), response.url]})
                    return
                }

                document.querySelector('#form-vote').submit()
            }, 5000)
        }
    }
})
observer.observe({
    entryTypes: ["resource"]
})