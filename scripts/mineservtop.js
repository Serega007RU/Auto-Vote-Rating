let first_ = true
async function vote(first) {
    if (first) {
        if (first_ && document.querySelector('.project-head__vote > button')) {
            document.querySelector('.project-head__vote > button').click()
            first_ = false
        }
        return
    }

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
            if (document.querySelector('.b-vote-modal__content_error').textContent.includes('уже голосовал')) {
                chrome.runtime.sendMessage({later: true})
            } else {
                chrome.runtime.sendMessage({message: document.querySelector('.b-vote-modal__content_error').textContent.trim()})
            }
        } else if (document.querySelector('.b-vote-modal__content_auth')) {
            document.querySelector('.b-vote-modal__content button').click()
            clearInterval(timer)
        } else if (first_ && document.querySelector('.project-head__vote > button')) {
            document.querySelector('.project-head__vote > button').click()
            first_ = false
        }
    } catch (e) {
        clearInterval(timer)
        throwError(e)
    }
}, 1000)