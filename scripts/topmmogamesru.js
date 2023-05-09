async function vote(first) {
    //Если мы попали на форму авторизации
    if (document.querySelector('form.loginform')) {
        chrome.runtime.sendMessage({auth: true})
        return
    }

    const vote = document.querySelector('.likedislike .like')
    //Зачем нам открывать в новой вкладке?
    vote.removeAttribute('target')
    document.querySelector('.likedislike .like').click()
}

const timer = setInterval(()=>{
    try {
        const notif = document.querySelector('#jGrowl')
        if (notif && notif.textContent.length > 0) {
            clearInterval(timer)
            const message = notif.textContent
            if (message.includes('Спасибо за ваш голос')) {
                chrome.runtime.sendMessage({successfully: true})
            } else if (message.includes('уже зачтен')) {
                chrome.runtime.sendMessage({later: true})
            } else {
                chrome.runtime.sendMessage({message})
            }
        }
    } catch (e) {
        clearInterval(timer)
        throwError(e)
    }
}, 1000)