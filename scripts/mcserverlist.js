function vote() {
    setTimeout(async ()=>{//Костыль, чо ещё поделаешь с говно кодом сайта
        try {
            const project = await getProject('MCServerList')
            document.getElementById('username').value = project.nick
            document.getElementById('btn').click()
        } catch (e) {
            throwError(e)
        }
    }, 3000)
}

const timer = setInterval(()=>{
    try {
        if (document.querySelector('div.alert.alert-danger') != null && document.querySelector('div.alert.alert-danger').textContent !== '') {
            if (document.querySelector('div.alert.alert-danger').textContent.includes('Již jsi hlasoval vrať se znovu za 2 hodiny')) {
                chrome.runtime.sendMessage({later: true})
            } else {
                chrome.runtime.sendMessage({message: document.querySelector('div.alert.alert-danger').textContent})
            }
            clearInterval(timer)
        }
        if (document.querySelector('div.alert.alert-success') != null && document.querySelector('div.alert.alert-danger').textContent !== '') {
            chrome.runtime.sendMessage({successfully: true})
        }
    } catch (e) {
        clearInterval(timer)
        throwError(e)
    }
}, 1000)
