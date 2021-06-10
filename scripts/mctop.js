//Совместимость с Rocket Loader и jQuery
document.addEventListener('DOMContentLoaded', (event)=>{
    const script = document.createElement('script')
    script.textContent = `$(document).ready(function() {window.postMessage('voteReady', '*')})`
    document.documentElement.appendChild(script)
    script.remove()
})

async function vote(first, event) {
    if (first == true || first == false) return
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
            //Надо ли авторизовываться в вк, если не надо то сразу голосует
            if (document.querySelector('#loginModal > div > div > div.modal-body > div > ul > li > a') != null) {
                //Клик VK
                document.querySelector('#loginModal > div > div > div.modal-body > div > ul > li > a').click()
                clearInterval(this.check)
                clearInterval(this.check2)
            } else {
                const project = await getProject('McTOP')
                document.querySelector('input[name=nick]').value = project.nick
                document.querySelector('button.btn.btn-info.btn-vote.voteBtn').click()
            }
        }
    } catch (e) {
        throwError(e)
    }
}

// const timer = setInterval(()=>{
//     try {
//         //Ищет надпись в которой написано что вы проголосовали или вы уже голосовали, по этой надписи скрипт завершается
//         if (document.readyState == 'complete' && document.querySelectorAll('div[class=tooltip-inner]').item(0) != null) {
//             const textContent = document.querySelectorAll('div[class=tooltip-inner]').item(0).textContent
//             if (textContent == 'Сегодня Вы уже голосовали с данного вк') {
//                 chrome.runtime.sendMessage({later: 'vk_error'})
//             } else if (textContent == 'Сегодня Вы уже голосовали с этим ником') {
//                 chrome.runtime.sendMessage({later: 'nick_error'})
//             } else if (textContent == 'Спасибо за Ваш голос, Вы сможете повторно проголосовать завтра.') {
//                 chrome.runtime.sendMessage({successfully: true})
//             } else {
//                 chrome.runtime.sendMessage({message: textContent})
//             }
//             clearInterval(timer)
//         }
//     } catch (e) {
//         throwError(e)
//         clearInterval(timer)
//     }
// }, 1000)
