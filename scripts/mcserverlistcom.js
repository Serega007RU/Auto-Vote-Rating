async function vote(/*first*/) {
    if (document.querySelector('div.ui.success.message') && document.querySelector('div.ui.success.message').textContent.toLowerCase().includes('voted successfully')) {
        chrome.runtime.sendMessage({successfully: true})
        return
    }
    if (document.querySelector('div.ui.negative.message:last-of-type') || document.querySelector('div.ui.negative.message')) {
        const request = {}
        request.message = document.querySelector('div.ui.negative.message:last-of-type')?.innerText || document.querySelector('div.ui.negative.message')?.innerText
        if (request.message.includes(' already voted')) {
            chrome.runtime.sendMessage({later: true})
            return
        } else if (!request.message.includes('Internet Explorer')) {
            if (request.message.includes('Invalid reCAPTCHA')) {
                request.ignoreReport = true
            }
            chrome.runtime.sendMessage(request)
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