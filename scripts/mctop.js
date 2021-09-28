//Костыли для Rocket Loader
if (typeof loaded2 === 'undefined') {
    // noinspection ES6ConvertVarToLetConst
    var loaded2 = true
    runVote()
}

async function vote(first) {
    try {
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

        if (document.querySelector('#container > h1') != null) {
            let message = document.querySelector('#container > h1').textContent
            if (document.querySelector('#container > h1').nextElementSibling != null) {
                message = message + ' ' + document.querySelector('#container > h1').nextElementSibling.textContent
            }
            chrome.runtime.sendMessage({message})
            return
        }
        const project = await getProject('McTOP')
        //Авторизованы ли мы в аккаунте?
        if (!document.querySelector('#userLoginWrap').classList.contains('hidden')) {
            document.querySelector('button[data-type=vote]').click()
            document.querySelector('a.modalVkLogin').click()
            return
        }
        if (!document.querySelector('#voteModal').classList.contains('in')) {
            if (document.querySelector('button.openVoteModal') === null) {
                //Костыль для владельцев проектов если они голосуют за свой же проект
                let url = new URL(document.URL)
                url.searchParams.append('voting', '10895')
                document.location.replace(url.toString())
            } else {
                document.querySelector('button.openVoteModal').click()
            }
        }
        if (first) return

        //Обход fingerprint
        if (document.querySelector('input[name="v"]') != null) document.querySelector('input[name="v"]').value = makeid(32)
        if (document.querySelector('input[name="vv"]') != null) document.querySelector('input[name="vv"]').value = makeid(32)
        if (document.querySelector('input[name="vs"]') != null) document.querySelector('input[name="vs"]').value = makeid(32)

        //Вводит никнейм
        document.querySelector('input[name=nick]').value = project.nick
        document.querySelector('input[name=nick]').click()
        //Клик 'Голосовать' в окне голосования
        document.querySelector('button.btn.btn-info.btn-vote.voteBtn').click()
    } catch (e) {
        throwError(e)
    }
}

function runVote() {
    const timer = setInterval(()=>{
        try {
            //Ищет надпись в которой написано что вы проголосовали или вы уже голосовали, по этой надписи скрипт завершается
            if (document.readyState === 'complete' && document.querySelectorAll('div[class=tooltip-inner]').item(0) != null) {
                const textContent = document.querySelectorAll('div[class=tooltip-inner]').item(0).textContent.toLowerCase()
                if (textContent.includes('уже голосовали') || textContent.includes('уже проголосовали') || textContent.includes('сможете проголосовать')) {
                    chrome.runtime.sendMessage({later: true})
                } else if (textContent.includes('за ваш голос') || textContent.includes('спасибо за голос') ||  textContent.includes('голос принят') || textContent.includes('голос засчитан') || textContent.includes('успех') || textContent.includes('успешн')) {
                    chrome.runtime.sendMessage({successfully: true})
                } else {
                    chrome.runtime.sendMessage({message: document.querySelectorAll('div[class=tooltip-inner]').item(0).textContent})
                }
                clearInterval(timer)
            }
        } catch (e) {
            throwError(e)
            clearInterval(timer)
        }
    }, 1000)
}

function makeid(length) {
    let result           = ''
    const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const charactersLength = characters.length
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength))
    }
    return result
}