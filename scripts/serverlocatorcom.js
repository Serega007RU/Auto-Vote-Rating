async function vote(first) {
    try {
        const message = document.querySelector('#alert').textContent.trim()
        if (message.length > 0) {
            if (message.includes('Thanks for voting')) {
                chrome.runtime.sendMessage({successfully: true})
            } else if (message.includes('already voted')) {
                chrome.runtime.sendMessage({later: true})
            } else {
                chrome.runtime.sendMessage({message})
            }
            return
        }

        if (first) return

        const project = await getProject('ServerLocatorCom')
        document.querySelector('#vote_username').value = project.nick
        document.querySelector('#voteForm [type="submit"][name="vote_submit"]').click()
    } catch (e) {
        throwError(e)
    }
}