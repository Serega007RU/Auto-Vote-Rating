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
            document.querySelector('button.openVoteModal').click()
        }
        if (first) return
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
                if (textContent.includes('вы уже голосовали')) {
                    chrome.runtime.sendMessage({later: true})
                } else if (textContent.includes('спасибо за ваш голос')) {
                    chrome.runtime.sendMessage({successfully: true})
                } else {
                    chrome.runtime.sendMessage({message: textContent})
                }
                clearInterval(timer)
            }
        } catch (e) {
            throwError(e)
            clearInterval(timer)
        }
    }, 1000)
}