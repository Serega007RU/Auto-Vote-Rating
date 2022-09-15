async function vote(first) {
    if (document.querySelector('div.alert.alert-danger') != null) {
        if (document.querySelector('div.alert.alert-danger').textContent.includes('already voted')) {
            chrome.runtime.sendMessage({later: true})
            return
        }
        chrome.runtime.sendMessage({message: document.querySelector('div.alert.alert-danger').textContent})
        return
    }
    if (document.querySelector('div.alert.alert-success') != null) {
        chrome.runtime.sendMessage({successfully: true})
        return
    }

    if (first) return

    const project = await getProject('MinecraftServersListOrg')
    const inputNick = document.querySelector('#mc_user')
    inputNick.value = project.nick
    inputNick.dispatchEvent(new Event('input', {bubbles:true}))
}

const timer = setInterval(()=>{
    try {
        const voteBtn = document.querySelector('#vote-btn')
        if (!voteBtn.disabled) {
            clearInterval(timer)
            voteBtn.click()
        }
    } catch (e) {
        throwError(e)
    }
}, 1000)