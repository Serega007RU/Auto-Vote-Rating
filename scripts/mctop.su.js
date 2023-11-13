async function vote(first) {
    if (document.getElementById('summary') != null) {
        if (document.getElementById('summary').textContent.includes('Ошибка проверки CSRF')) {
            //Костыль костыля, перезагружаем страницу в случае возникновения Ошибки проверки CSRF (данная ошибка выскакивает после прохождения проверки CloudFlare)
            document.location.replace(document.URL)
            return
        } else if (document.querySelector('#summary > h1') != null && document.querySelector('#summary > p') != null) {
            chrome.runtime.sendMessage({message: document.getElementById('summary').textContent})
            return
        }
    }

    if (document.querySelector('#container > h1')) {
        let request = {}
        request.message = document.querySelector('#container > h1').textContent
        if (document.querySelector('#container > h1').nextElementSibling) {
            request.message = request.message + ' ' + document.querySelector('#container > h1').nextElementSibling.textContent
        }
        if (request.message.toLowerCase().includes('ошибка авторизации через социальную сеть')) {
            request.ignoreReport = true
        }
        chrome.runtime.sendMessage(request)
        return
    }

    const project = await getProject()

    //Авторизованы ли мы в аккаунте?
    if (!document.querySelector('#userLoginWrap').classList.contains('hidden')) {
        const timerLogin = setInterval(() => {
            if (document.querySelector('#loginModal').classList.contains('in')) {
                document.querySelector('a.modalVkLogin').click()
                clearInterval(timerLogin)
            } else {
                document.querySelector('button[data-type=vote]').click()
            }
        }, 1000)
        return
    }
    if (!document.querySelector('#voteModal').classList.contains('in')) {
        if (document.querySelector('button.openVoteModal') === null) {
            //Костыль для владельцев проектов если они голосуют за свой же проект
            let url = new URL(document.URL)
            if (!url.searchParams.has('voting')) {
                url.searchParams.append('voting', project.id)
                document.location.replace(url.toString())
            }
        } else {
            const timerVote = setInterval(() => {
                if (document.querySelector('#voteModal').classList.contains('in')) {
                    clearInterval(timerVote)
                } else {
                    document.querySelector('button.openVoteModal').click()
                }
            }, 1000)
        }
    }
    if (first) return

    //Вводит никнейм
    document.querySelector('input[name=nick]').value = project.nick
    document.querySelector('input[name=nick]').click()
    //Клик 'Голосовать' в окне голосования
    document.querySelector('button.btn.btn-info.btn-vote.voteBtn').click()
}

let fixTimer
const timer = setInterval(()=>{
    try {
        //Ищет надпись в которой написано что вы проголосовали или вы уже голосовали, по этой надписи скрипт завершается
        if (document.readyState === 'complete' && document.querySelectorAll('div[class=tooltip-inner]').item(0) != null) {
            const textContent = document.querySelectorAll('div[class=tooltip-inner]').item(0).textContent.toLowerCase()
            if (textContent.includes('уже голосовали') || textContent.includes('уже проголосовали') || textContent.includes('сможете проголосовать') || textContent.includes('вы сегодня голосовали') || textContent.includes('вы сегодня проголосовали')) {
                chrome.runtime.sendMessage({later: true})
            } else if (textContent.includes('за ваш голос') || textContent.includes('спасибо за голос') ||  textContent.includes('голос принят') || textContent.includes('голос засчитан') || textContent.includes('успех') || textContent.includes('успешн')) {
                chrome.runtime.sendMessage({successfully: true})
            } else if (
                    textContent.includes('некорректный ник')
                    || textContent.includes('ваш айпи находится в базе данных спамеров')
                    || textContent.includes('ваш айпи попал в базу данных спамеров')
                    || (textContent.includes('код ошибки') && textContent.includes('обновить страницу'))
                    || textContent.includes('ошибка авторизации через социальную сеть')
                    || textContent.includes('ошибка 500')
                    || textContent === 'ошибка'
                    || textContent.includes('капча временно не работает')
                    || textContent.includes('аккаунт заблокирован')) {
                chrome.runtime.sendMessage({message: document.querySelectorAll('div[class=tooltip-inner]').item(0).textContent, ignoreReport: true})
            } else if (textContent.includes('поставьте галочку в капче') || textContent.includes('обязательное поле')) {
                return
            } else {
                chrome.runtime.sendMessage({message: document.querySelectorAll('div[class=tooltip-inner]').item(0).textContent})
            }
            clearInterval(timer)
            clearTimeout(fixTimer)
        }
    } catch (e) {
        clearInterval(timer)
        clearTimeout(fixTimer)
        throwError(e)
    }
}, 1000)

//Фикс-костыль на случай если у нас ошибка в vote запросе
const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
        if (entry.name === 'https://mctop.su/projects/vote/') {
            fixTimer = setTimeout(()=>{
                chrome.runtime.sendMessage({message: 'Мы получили что vote запрос прошёл но ответ от McTOP так и не поступил, скорее всего в vote запросе произошла ошибка, смотрите подробности в консоли в момент голосования', ignoreReport: true})
            }, 5000)
        }
    }
})
observer.observe({
    entryTypes: ["resource"]
})