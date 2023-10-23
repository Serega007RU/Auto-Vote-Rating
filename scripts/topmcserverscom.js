async function vote(first) {
    if (document.querySelector('#server-metadata').nextElementSibling.innerText.includes('already voted')) {
        chrome.runtime.sendMessage({later: true})
        return
    }

    if (first) return

    // TODO почему-то нет никнейма, возможно сайт не доделан
    // const project = await getProject('TopMCServersCom')
    // document.querySelector('input[name="username"]').value = project.nick
    document.querySelector('#server-metadata').nextElementSibling.querySelector('button').click()
}

const timer = setInterval(() => {
    try {
        if (document.querySelector('#server-metadata').nextElementSibling.innerText.includes('Vote added'))  {
            clearInterval(timer)
            chrome.runtime.sendMessage({successfully: true})
        } else if (document.querySelector('.toastify')) {
            clearInterval(timer)
            const request = {}
            request.message = document.querySelector('.toastify').innerText
            chrome.runtime.sendMessage(request)
        }
    } catch (error) {
        clearInterval(timer)
        throwError(error)
    }
}, 1000)