async function vote(first) {
    if (document.querySelector('div.b-layout__wrapper div.spinner div.loader')) {
        await new Promise(resolve => {
            const timer = setInterval(() => {
                if (!document.querySelector('div.b-layout__wrapper div.spinner div.loader')) {
                    clearInterval(timer)
                    resolve()
                }
            }, 1000)
        })
    }

    document.querySelector('div.b-username-verified-modal')?.remove()

    if (!document.querySelector('div.b-vote-modal')) {
        document.querySelector('.project-head__vote > button').click()
        return
    }

    if (first) return

    const project = await getProject('MineServTop')
    if (document.querySelector('.b-vote-modal__content input')) {
        document.querySelector('.b-vote-modal__content input').value = project.nick
        document.querySelector('.b-vote-modal__content input').dispatchEvent(new Event('input'))
    }
    document.querySelector('.b-vote-modal__content button').click()
}

const timer = setInterval(()=>{
    try {
        if (document.querySelector('.b-vote-modal__content_success')) {
            clearInterval(timer)
            chrome.runtime.sendMessage({successfully: true})
        } else if (document.querySelector('.b-vote-modal__content_error')) {
            clearInterval(timer)
            const message = document.querySelector('.b-vote-modal__content_error').textContent.trim()
            if (message.includes('уже голосовал')) {
                chrome.runtime.sendMessage({later: true})
            } else {
                chrome.runtime.sendMessage({message})
            }
        } else if (document.querySelector('.b-vote-modal__content_auth')) {
            document.querySelector('.b-vote-modal__content button').click()
            clearInterval(timer)
        }
    } catch (e) {
        clearInterval(timer)
        throwError(e)
    }
}, 1000)