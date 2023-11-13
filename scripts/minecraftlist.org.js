async function vote(first) {
    if (document.querySelector('p.notification.errormsg')) {
        const message = document.querySelector('p.notification.errormsg').textContent
        if (message.includes('You can vote after')) {
            //Из полученного текста достаёт все цифры в Array List
            const numbers = message.match(/\d+/g).map(Number)
            const milliseconds = (numbers[0] * 60 * 60 * 1000) + (numbers[1] * 60 * 1000)/* + (sec * 1000)*/
            chrome.runtime.sendMessage({later: Date.now() + milliseconds})
            return
        } else {
            if (message.toLowerCase().includes('captcha')) {
                if (first) chrome.runtime.sendMessage({captcha: true})
            } else {
                chrome.runtime.sendMessage({message})
                return
            }
        }
    }
    if (document.querySelector('p.notification.successmsg') != null) {
        chrome.runtime.sendMessage({successfully: true})
        return
    }

    if (first) return

    const project = await getProject()
    document.getElementById('voteusername').value = project.nick
    document.querySelector('form[method="POST"] > input[type="submit"]').click()
}