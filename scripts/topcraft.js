async function vote(first) {
    try {
        if (document.querySelector('#container > h1') != null) {
            let message = document.querySelector('#container > h1').textContent
            if (document.querySelector('#container > h1').nextElementSibling != null) {
                message = message + ' ' + document.querySelector('#container > h1').nextElementSibling.textContent
            }
            chrome.runtime.sendMessage({message})
            return
        }
        const project = await getProject('TopCraft')
        //Авторизованы ли мы в аккаунте?
        if (!document.querySelector('#userLoginWrap').classList.contains('hidden')) {
            if (vkontakte != null && vkontakte.passwordTopCraft) {
                document.querySelector('.usr-login-lnk').click()
                document.getElementById('id_login').value = vkontakte.id + vkontakte.numberId
                document.getElementById('id_password').value = vkontakte.passwordTopCraft
                document.querySelector('button[type="submit"].btn-login').click()
                const timer1 = setInterval(()=>{
                    if (document.querySelector('#loginForm .error') != null) {
                        chrome.runtime.sendMessage({message: document.querySelector('#loginForm > .error').textContent})
                        clearInterval(timer1)
                    }
                }, 1000)
                return
            }
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

const timer = setInterval(()=>{
    try {
        //Ищет надпись в которой написано что вы проголосовали или вы уже голосовали, по этой надписи скрипт завершается
        if (document.readyState === 'complete' && document.querySelectorAll('div[class=tooltip-inner]').item(0) != null) {
            const textContent = document.querySelectorAll('div[class=tooltip-inner]').item(0).textContent
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
