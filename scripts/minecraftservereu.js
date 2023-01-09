async function vote(first) {
    if (first === false) return
    //К чему это ожидание?
    if (document.querySelector('#infoMessage') != null) document.querySelector('#infoMessage').style.display = 'none'
    if (document.querySelector('#inputFields') != null) document.querySelector('#inputFields').removeAttribute('style')
    if (document.querySelector('#voteBox') != null) document.querySelector('#voteBox').removeAttribute('style')

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

    const project = await getProject('MinecraftServerEu')
    document.querySelector('#voteBox input').value = project.nick
    document.querySelector('#voteBox button').click()
}