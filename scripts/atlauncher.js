async function vote(first) {
    try {
        if (document.querySelector('div[role="alert"]') != null) {
            const text = document.querySelector('div[role="alert"]').textContent.trim()
            if (text.includes('vote has been added to the server')) {
                chrome.runtime.sendMessage({successfully: true})
            } else if (text.includes('already voted')) {
                chrome.runtime.sendMessage({later: true})
            } else {
                chrome.runtime.sendMessage({message: text})
            }
            return
        }

        if (first) return

        const project = await getProject('ATLauncher')
        document.querySelector('#username').value = project.nick
        document.querySelector('form input[value="Vote"]').click()
    } catch (e) {
        throwError(e)
    }
}