async function vote() {
    if (document.querySelector('.alert-success')?.offsetParent) {
        chrome.runtime.sendMessage({successfully: true})
        return
    }

    if (document.querySelector('.alert-danger')?.offsetParent) {
        const message = document.querySelector('.alert-danger').innerText.trim()
        if (message.includes('ste už zahlasovali')) {
            chrome.runtime.sendMessage({later: true})
        } else {
            chrome.runtime.sendMessage({message})
        }
        return
    }

    const project = await getProject('MinecraftServerSk2')
    document.querySelector('[data-target="#vote"]').click()
    document.querySelector('.vote input[name="username"]').value = project.nick
    document.querySelector('.vote button[type="submit"]').click()
}

const timer = setInterval(()=>{
    try {
        if (document.querySelector('.alert-success')?.offsetParent) {
            chrome.runtime.sendMessage({successfully: true})
            clearInterval(timer)
        } else if (document.querySelector('.alert-danger')?.offsetParent) {
            const message = document.querySelector('.alert-danger').innerText.trim()
            if (message.includes('ste už zahlasovali')) {
                chrome.runtime.sendMessage({later: true})
            } else {
                chrome.runtime.sendMessage({message})
            }
            clearInterval(timer)
        }
    } catch (e) {
        clearInterval(timer)
        throwError(e)
    }
}, 1000)