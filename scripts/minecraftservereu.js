async function vote(first) {

    // Если мы каким-то образом попали на форум значит что-то не так
    if (document.location.pathname.split('/')[1] === 'forum') {
        const request = {}
        request.errorVoteNoElement = 'Redirected to forum'
        request.ignoreReport = true
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

    //К чему это ожидание?
    // if (document.querySelector('#infoMessage') != null) document.querySelector('#infoMessage').style.display = 'none'
    // if (document.querySelector('#inputFields') != null) document.querySelector('#inputFields').removeAttribute('style')
    // if (document.querySelector('#voteBox') != null) document.querySelector('#voteBox').removeAttribute('style')

    if (document.querySelector('div.alert.alert-success') != null) {
        chrome.runtime.sendMessage({successfully: true})
        return
    }
    if (document.querySelector('div.alert.alert-danger')) {
        const message = document.querySelector('div.alert.alert-danger').textContent
        if (message.includes('already voted') || message.includes('kannst für diesen Server heute nicht mehr voten')) {
            chrome.runtime.sendMessage({later: true})
            return
        }
        chrome.runtime.sendMessage({message})
        return
    }
}

const timer = setInterval(async () => {
    try {
        if (!document.querySelector("#voteBox") || document.querySelector("#voteBox").style.display === 'none') return
        clearInterval(timer)
        if (document.querySelector("#voteBox").firstElementChild.tagName === 'INPUT') {
            const project = await getProject('MinecraftServerEu')
            document.querySelector("#voteBox").firstElementChild.value = project.nick
            document.querySelector("#voteBox").querySelector('button').click()
        } else if (document.querySelector("#voteBox").firstElementChild.tagName === 'BUTTON') {
            document.querySelector("#voteBox").firstElementChild.click()
        } else {
            chrome.runtime.sendMessage({message: 'Not found element'})
        }
    } catch (e) {
        clearInterval(timer)
        throwError(e)
    }
})