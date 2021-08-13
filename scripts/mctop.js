//Совместимость с Rocket Loader и jQuery
// document.addEventListener('DOMContentLoaded', ()=>{
// //  const script = document.createElement('script')
// //  script.textContent = `$(document).ready(function() {window.postMessage('voteReady', '*')})`
// //  document.documentElement.appendChild(script)
// //  script.remove()
//     vote()
// })

async function vote(first) {
    if (first) return
    try {
        //Если погльзователь уже авторизован в вк, сразу голосует
        if (document.querySelector('button[data-type=vote]') == null) {
            //Клик 'Голосовать'
            document.querySelector('button.btn.btn-info.btn-vote.openVoteModal').click()
            //Вводит никнейм
            const project = await getProject('McTOP')
            document.querySelector('input[name=nick]').value = project.nick
            //Клик 'Голосовать' в окне голосования
            document.querySelector('button.btn.btn-info.btn-vote.voteBtn').click()
        } else {
            document.querySelector('button[data-type=vote]').click()
            const project = await getProject('McTOP')
            //Надо ли авторизовываться в вк, если не надо то сразу голосует
            if (document.querySelector('#loginModal > div > div > div.modal-body > div > ul > li > a') != null) {
                if (vkontakte != null && vkontakte.passwordMcTOP) {
                    document.querySelector('.usr-login-lnk').click()
                    document.getElementById('id_login').value = vkontakte.id + vkontakte.numberId
                    document.getElementById('id_password').value = vkontakte.passwordMcTOP
                    document.querySelector('button[type="submit"].btn-login').click()
                    return
                }
                //Клик VK
                document.querySelector('#loginModal > div > div > div.modal-body > div > ul > li > a').click()
                clearInterval(timer)
            } else {
                document.querySelector('input[name=nick]').value = project.nick
                document.querySelector('button.btn.btn-info.btn-vote.voteBtn').click()
            }
        }
    } catch (e) {
        throwError(e)
    }
}

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
