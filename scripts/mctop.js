//Костыли для Rocket Loader
if (typeof loaded2 === 'undefined') {
    // noinspection ES6ConvertVarToLetConst
    var loaded2 = true
    runVote()
}

async function vote(first) {
    if (first === true) return
    try {
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
        if (first || first == null) return
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
    //Совместимость с Rocket Loader и jQuery
    document.addEventListener('DOMContentLoaded', ()=>{
        // const script = document.createElement('script')
        // script.textContent = `$(document).ready(function() {window.postMessage('voteReady', '*')})`
        // document.documentElement.appendChild(script)
        // script.remove()
        vote()
    })

    const timer = setInterval(()=>{
        try {
            //Ищет надпись в которой написано что вы проголосовали или вы уже голосовали, по этой надписи скрипт завершается
            if (document.readyState === 'complete' && document.querySelectorAll('div[class=tooltip-inner]').item(0) != null) {
                const textContent = document.querySelectorAll('div[class=tooltip-inner]').item(0).textContent
                if (textContent === 'Сегодня Вы уже голосовали с данного вк') {
                    chrome.runtime.sendMessage({later: 'vk_error'})
                } else if (textContent === 'Сегодня Вы уже голосовали с этим ником') {
                    chrome.runtime.sendMessage({later: 'nick_error'})
                } else if (textContent === 'Спасибо за Ваш голос, Вы сможете повторно проголосовать завтра.') {
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