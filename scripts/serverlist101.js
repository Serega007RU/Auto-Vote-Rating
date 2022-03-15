async function vote(first) {
    try {
        if (document.querySelector('div.nk-info-box.text-success.nk-info-box-noicon') != null) {
            chrome.runtime.sendMessage({successfully: true})
            return
        }
        if (document.querySelector('div.container div.col-lg-6').textContent.includes('already voted')) {
            chrome.runtime.sendMessage({later: true})
            return
        }
        if (document.querySelector('div.nk-info-box.text-danger.nk-info-box-noicon') != null) {
            chrome.runtime.sendMessage({message: document.querySelector('div.nk-info-box.text-danger.nk-info-box-noicon').textContent})
            return
        }

        if (first) return
        
        if (document.querySelector('form[method="POST"] > input[name="username"]') != null) {
            const project = await getProject('ServerList101')
            document.querySelector('form[method="POST"] > input[name="username"]').value = project.nick
        }
        document.querySelector('form[method="POST"] > input[type="submit"]').click()
    } catch (e) {
        throwError(e)
    }
}