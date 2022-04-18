async function vote(first) {
    //Если мы попали на форму авторизации
    if (document.querySelector('form.loginform')) {
        chrome.runtime.sendMessage({auth: true})
        return
    }

    if (first) await inject()

    const vote = document.querySelector('.likedislike .like')
    //Зачем нам открывать в новой вкладке?
    vote.removeAttribute('target')
    document.querySelector('.likedislike .like').click()
}

//Костыли что бы отправить никнейм в prompt иначе вся работа JavaScript будет остановлена
async function inject() {
    const project = await getProject('TopMmoGamesRu')
    const script = document.createElement('script')
    script.textContent = `
        prompt = function() {
            return '` + project.nick + `'
        }
        `
    document.head.appendChild(script)
    //ToDo большие сомнения что оно будет успевать подставлять ник но мы надеемся на лучшее
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