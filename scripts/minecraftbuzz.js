async function vote(first) {
    if (first) return

    const project = await getProject('MinecraftBuzz')
    document.getElementById('review-check').checked = false
    document.getElementById('username-input').value = project.nick
    document.querySelector('#vote button[type="submit"]').click()
}

const timer = setInterval(()=>{
    try {
        if (document.getElementById('message')) {
            const request = {}
            request.message = document.getElementById('message').textContent.trim()
            if (request.message.includes('Thank you for voting')) {
                chrome.runtime.sendMessage({successfully: true})
            } else if (request.message.includes('already voted')) {
                chrome.runtime.sendMessage({later: true})
            } else {
                if (request.message.includes('proxy')) {
                    request.ignoreReport = true
                }
                chrome.runtime.sendMessage(request)
            }
            clearInterval(timer)
        }
    } catch (e) {
        clearInterval(timer)
        throwError(e)
    }
}, 1000)