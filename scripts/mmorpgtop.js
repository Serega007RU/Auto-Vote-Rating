async function vote(first) {
    //Мы попали на список серверов, возвращаемся, мы авторизовались? Ох, уж эти костыли
    if (document.querySelector('.servers-lists')) {
        const project = await getProject('MmoRpgTop')
        document.location.replace('https://' + project.game +'.mmorpg.top/server/' + project.id)
        return
    }

    //Только с авторизацией можно голосовать
    if (document.querySelector('.auth-link')) {
        if (!document.querySelector('.login-form')) {
            document.querySelector('.auth-link a').click()
        }
        chrome.runtime.sendMessage({auth: true})
        return
    }

    if (first) {
        document.querySelector('.vote-btn').click()
        document.querySelector('.modal-vote .vote-block').click()
        return
    }

    const project = await getProject('MmoRpgTop')
    const worlds = document.querySelector('[formcontrolname="worldId"]')
    if (worlds.children.length > 0) {
        const world = document.querySelector('[formcontrolname="worldId"]').children[project.ordinalWorld - 1]
        if (!world) {
            chrome.runtime.sendMessage({message: 'Указанный мир не существует'})
            return
        }
        world.querySelector('label').click()
    }
    const inputNick = document.querySelector('.modal-vote [formcontrolname="nickname"]')
    inputNick.value = project.nick
    inputNick.dispatchEvent(new Event('input'))
    document.querySelector('.modal-vote button.btn-primary').click()
}

const timer = setInterval(()=>{
    try {
        if (document.querySelector('.already-voted')) {
            clearInterval(timer)
            chrome.runtime.sendMessage({later: true})
            return
        }

        const notif = document.querySelector('.cdk-global-overlay-wrapper')
        if (notif && notif.textContent.length > 0) {
            const message = notif.textContent
            if (message.includes('засчитан')) {
                clearInterval(timer)
                chrome.runtime.sendMessage({successfully: true})
            }/* else {//Какую-ту чушь (рекламу) туда суют поэтому игнорируем, ListForge 2.0 момент
                chrome.runtime.sendMessage({message})
            }*/
        }
    } catch (e) {
        clearInterval(timer)
        throwError(e)
    }
}, 1000)