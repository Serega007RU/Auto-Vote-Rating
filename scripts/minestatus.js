async function vote(/*first*/) {
    try {
        if (document.querySelector('div.alert.alert-danger') != null) {
            chrome.runtime.sendMessage({message: document.querySelector('div.alert.alert-danger').textContent.trim()})
            return
        }
        if (document.querySelector('div.alert.alert-success') != null) {
            chrome.runtime.sendMessage({successfully: true})
            return
        }
        if (document.querySelector('div.alert.alert-warning') != null) {
            if (document.querySelector('div.alert.alert-warning').textContent.includes('already voted')) {
                const later = Date.now() + (document.querySelector('div.alert.alert-warning').textContent.match(/\d+/g).map(Number)[0] + 1) * 3600000
                chrome.runtime.sendMessage({later})
            } else {
                chrome.runtime.sendMessage({message: document.querySelector('div.alert.alert-warning').textContent.trim()})
            }
            return
        }

        const project = await getProject('MineStatus')
        document.querySelector('#mainForm input[name="username"]').value = project.nick
        document.querySelector('#mainForm input[value="Vote for server"]').click()
    } catch (e) {
        throwError(e)
    }
}