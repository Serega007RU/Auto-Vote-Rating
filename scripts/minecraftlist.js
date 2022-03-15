async function vote(first) {
    try {
        if (document.querySelector('p.notification.errormsg') != null) {
            if (document.querySelector('p.notification.errormsg').textContent.includes('You can vote after')) {
                //Из полученного текста достаёт все цифры в Array List
                const numbers = document.querySelector('p.notification.errormsg').textContent.match(/\d+/g).map(Number)
                const milliseconds = (numbers[0] * 60 * 60 * 1000) + (numbers[1] * 60 * 1000)/* + (sec * 1000)*/
                chrome.runtime.sendMessage({later: Date.now() + milliseconds})
            } else {
                chrome.runtime.sendMessage({message: document.querySelector('p.notification.errormsg').textContent})
            }
            return
        }
        if (document.querySelector('p.notification.successmsg') != null) {
            chrome.runtime.sendMessage({successfully: true})
            return
        }

        if (first) return
        
        const project = await getProject('MinecraftList')
        document.getElementById('voteusername').value = project.nick
        document.querySelector('form[method="POST"] > input[type="submit"]').click()
    } catch (e) {
        throwError(e)
    }
}