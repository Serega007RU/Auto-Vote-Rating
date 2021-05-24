async function vote(first) {
    try {
        if (document.querySelector('div.alert.alert-danger') != null) {
            if (document.querySelector('div.alert.alert-danger').textContent.includes('already voted')) {
                chrome.runtime.sendMessage({later: true})
                return
            }
            chrome.runtime.sendMessage({message: document.querySelector('div.alert.alert-danger').textContent})
            return
        }
        if (document.querySelector('div.alert.alert-succes') != null) {
            chrome.runtime.sendMessage({successfully: true})
            return
        }

        if (first) return

        const project = await getProject('MinecraftServersListOrg')
        document.getElementById('mc_user').value = project.nick
        document.getElementById('vote-btn').click()
    } catch (e) {
        throwError(e)
    }
}