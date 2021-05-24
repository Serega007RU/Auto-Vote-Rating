async function vote(first) {
    if (first == false) return
    try {
        //К чему это ожидание?
        if (document.getElementById('infoMessage') != null) document.getElementById('infoMessage').style.display = 'none'
        if (document.getElementById('inputFields') != null) document.getElementById('inputFields').removeAttribute('style')
        
        if (document.querySelector('div.alert.alert-success') != null) {
            chrome.runtime.sendMessage({successfully: true})
            return
        }
        if (document.querySelector('div.alert.alert-danger') != null) {
            if (document.querySelector('div.alert.alert-danger').textContent.includes('already voted')) {
                chrome.runtime.sendMessage({later: true})
                return
            }
            chrome.runtime.sendMessage({message: document.querySelector('div.alert.alert-danger').textContent})
            return
        }

        const project = await getProject('MinecraftServerEu')
        document.getElementById('playername').value = project.nick
        document.getElementById('captcha').click()
    } catch (e) {
        throwError(e)
    }
}