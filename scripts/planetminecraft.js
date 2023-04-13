async function vote(first) {
    if (first === false) return
    if (document.querySelector('#center > div > h1') != null && document.querySelector('#center > div > h1').textContent.includes('Successfully voted')) {
        chrome.runtime.sendMessage({successfully: true})
        return
    } else if (document.querySelector('#center > div > h1') != null && document.querySelector('#center > div > h1').textContent.includes('You already voted')) {
        chrome.runtime.sendMessage({later: true})
        return
    }

    if (document.querySelector('div[role="dialog"]')) {
        chrome.runtime.sendMessage({auth: true})
        await new Promise(resolve => {
            const timer2 = setInterval(() => {
                if (!document.querySelector('div[role="dialog"]')) {
                    clearInterval(timer2)
                    resolve()
                }
            }, 1000)
        })
    }

    if (document.querySelector('#error_page div.notice_box')) {
        const request = {}
        request.message = document.querySelector('#error_page div.notice_box').innerText
        request.ignoreReport = true
        chrome.runtime.sendMessage(request)
        return
    }

    const project = await getProject('PlanetMinecraft')
    if (document.querySelector('#submit_vote_form > input[name="mcname"]') != null) {
        document.querySelector('#submit_vote_form > input[name="mcname"]').value = project.nick
    } else {
        console.warn('Не удалось найти поле для никнейма, возможно это голосование без награды')
    }
    document.querySelector('#submit_vote_form > input[type="submit"]').click()
}