let first = true
async function vote(first) {
    if (first) {
        if (this.first && document.querySelector('.project-head__vote > button')) {
            document.querySelector('.project-head__vote > button').click()
            this.first = false
        }
        return
    }

    const project = await getProject('MineServTop')
    document.querySelector('.b-vote-modal__content input').value = project.nick
    document.querySelector('.b-vote-modal__content input').dispatchEvent(new Event('input'))
    document.querySelector('.b-vote-modal__content button').click()
}

const timer = setInterval(()=>{
    try {
        if (document.querySelector('.b-vote-modal__content_success')) {
            clearInterval(timer)
            chrome.runtime.sendMessage({successfully: true})
        } else if (document.querySelector('.b-vote-modal__content_error')) {
            clearInterval(timer)
            if (document.querySelector('.b-vote-modal__content_error').textContent.includes('уже голосовали')) {
                chrome.runtime.sendMessage({later: true})
            } else {
                chrome.runtime.sendMessage({message: document.querySelector('.b-vote-modal__content_error').textContent.trim()})
            }
        } else if (document.querySelector('.b-vote-modal__content_auth')) {
            document.querySelector('.b-vote-modal__content button').click()
            clearInterval(timer)
        } else if (first && document.querySelector('.project-head__vote > button')) {
            document.querySelector('.project-head__vote > button').click()
            first = false
        }
    } catch (e) {
        clearInterval(timer)
        throwError(e)
    }
}, 1000)