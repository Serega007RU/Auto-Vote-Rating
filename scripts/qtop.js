async function vote(first) {
    try {
        if (document.getElementById('first_auth_vk') != null) {
            document.getElementById('first_auth_vk').click()
            return
        }

        if (first) {
            return
        }

        const project = await getProject('QTop')
        document.getElementById('char_name').value = project.nick
        document.getElementById('captcha_button').click()
    } catch (e) {
        throwError(e)
    }
}

const timer = setInterval(()=> {
    try {
        if (document.querySelector('.error_window') != null) {
            chrome.runtime.sendMessage({message: document.querySelector('.error_window').innerText})
            clearInterval(timer)
        } else if (document.querySelector('.info_window') != null) {
            if (document.querySelector('.info_window').innerText.includes('Вы сможете проголосовать завтра')) {
                chrome.runtime.sendMessage({later: true})
            } else {
                chrome.runtime.sendMessage({message: document.querySelector('.info_window').innerText})
            }
            clearInterval(timer)
        } else if (document.querySelector('.ok_window') != null) {
            chrome.runtime.sendMessage({successfully: true})
            clearInterval(timer)
        }
    } catch (e) {
        throwError(e)
        clearInterval(timer)
    }
}, 1000)