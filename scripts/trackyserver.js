async function vote(first) {
    try {
        if (document.querySelector('div.alert.alert-success') != null && document.querySelector('div.alert.alert-success').parentElement.style.display !== 'none') {
            chrome.runtime.sendMessage({successfully: true})
            return
        }
        if (document.querySelector('div.alert.alert-danger') != null && document.querySelector('div.alert.alert-danger').parentElement.style.display !== 'none') {
            if (document.querySelector('div.alert.alert-danger').textContent.includes('already voted')) {
                chrome.runtime.sendMessage({later: true})
                return
            }
            chrome.runtime.sendMessage({message: document.querySelector('div.alert.alert-danger').textContent})
            return
        }

        document.querySelector('a[data-target="#vote"]').click()
        
        if (first) return
        
        const project = await getProject('TrackyServer')
        document.querySelector('input[name="username"]').value = project.nick
        document.querySelector('form.vote button[type="submit"]').click()
    } catch (e) {
        throwError(e)
    }
}

const timer = setInterval(()=>{
    try {
        //Ищет надпись в которой написано что вы проголосовали или вы уже голосовали, по этой надписи скрипт завершается
        if (document.querySelector('div.alert.alert-success') != null && document.querySelector('div.alert.alert-success').parentElement.style.display !== 'none') {
            clearInterval(timer)
            chrome.runtime.sendMessage({successfully: true})
            return
        }
        if (document.querySelector('div.alert.alert-danger') != null && document.querySelector('div.alert.alert-danger').parentElement.style.display !== 'none') {
            clearInterval(timer)
            if (document.querySelector('div.alert.alert-danger').textContent.includes('already voted')) {
                chrome.runtime.sendMessage({later: true})
                return
            }
            chrome.runtime.sendMessage({message: document.querySelector('div.alert.alert-danger').textContent})
            // return
        }
    } catch (e) {
        throwError(e)
        clearInterval(timer)
    }
}, 100)