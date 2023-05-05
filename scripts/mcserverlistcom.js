async function vote(/*first*/) {
    if (document.querySelector('div.ui.success.message') && document.querySelector('div.ui.success.message').textContent.toLowerCase().includes('voted successfully')) {
        chrome.runtime.sendMessage({successfully: true})
        return
    }
    if (document.querySelector('div.ui.negative.message:last-of-type') || document.querySelector('div.ui.negative.message')) {
        const error = document.querySelector('div.ui.negative.message:last-of-type') || document.querySelector('div.ui.negative.message')
        const message = error.innerText
        if (message.includes(' already voted')) {
            chrome.runtime.sendMessage({later: true})
            return
        } else if (!message.includes('Internet Explorer')) {
            chrome.runtime.sendMessage({message})
            return
        }
    }
    if (document.querySelector('body > div.container-fluid  div.jumbotron > div > h2')?.textContent === 'Sorry!') {
        chrome.runtime.sendMessage({
            message: document.querySelector('body > div.container-fluid  div.jumbotron > div').innerText,
            ignoreReport: true
        })
    }

    const project = await getProject('MCServerListCom')
    document.querySelector('#mc_username').value = project.nick
    document.querySelector('#vote [type="submit"]').click()
}