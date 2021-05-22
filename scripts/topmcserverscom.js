async function vote(first) {
    try {
        if (document.querySelector('div.ui.success.message') != null) {
            chrome.runtime.sendMessage({successfully: true})
            return
        }
        if (document.querySelector('div.alert.alert-danger') != null) {
            if (document.querySelector('div.alert.alert-danger').textContent.includes('must wait until tomorrow')) {
                chrome.runtime.sendMessage({later: true})
                return
            }
            chrome.runtime.sendMessage({message: document.querySelector('div.alert.alert-danger').textContent})
            return
        }

        if (first) return
        
        const project = await getProject('TopMCServersCom')
        document.querySelector('input[name="username"]').value = project.nick
        document.querySelector('#main-content button[type="submit"]').click()
    } catch (e) {
        throwError(e)
    }
}