async function vote(first) {
    if (first) return

    const project = await getProject('MinecraftBuzz')
    document.getElementById('review-check').checked = false
    document.getElementById('username-input').value = project.nick
    document.querySelector('#vote button[type="submit"]').click()
}

const timer = setInterval(()=>{
    try {
        if (document.getElementById('message') != null) {
            if (document.getElementById('message').textContent.includes('Thank you for voting')) {
                chrome.runtime.sendMessage({successfully: true})
            } else if (document.getElementById('message').textContent.includes('already voted')) {
                chrome.runtime.sendMessage({later: true})
            } else {
                chrome.runtime.sendMessage({message: document.getElementById('message').textContent.trim()})
            }
            clearInterval(timer)
        }
    } catch (e) {
        clearInterval(timer)
        throwError(e)
    }
}, 1000)