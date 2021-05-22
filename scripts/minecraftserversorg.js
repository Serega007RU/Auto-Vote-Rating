async function vote(first) {
    try {
        //Если вы уже голосовали
        if (document.getElementById('error-message') != null) {
            if (document.getElementById('error-message').textContent.includes('You already voted today')) {
                chrome.runtime.sendMessage({later: true})
                return
            }
            chrome.runtime.sendMessage({message: document.getElementById('error-message').textContent})
            return
        }
        if (document.querySelector('#single > div.flash') != null) {
            if (document.querySelector('#single > div.flash').textContent.includes('You must wait until tomorrow before voting again')) {
                chrome.runtime.sendMessage({later: true})
                return
            }
            //Если успешное автоголосование
            if (document.querySelector('#single > div.flash').textContent.includes('Thanks for voting')) {
                chrome.runtime.sendMessage({successfully: true})
                return
            }
            chrome.runtime.sendMessage({message: document.querySelector('#single > div.flash').textContent})
            return
        }
        //Если не удалось пройти капчу
        if (document.querySelector('#field-container > form > span') != null) {
            chrome.runtime.sendMessage({message: document.querySelector('#field-container > form > span').textContent})
            return
        }

        if (first) return
        
        const project = await getProject('MinecraftServersOrg')
        document.querySelector('#field-container > form > ul > li > input').value = project.nick
        document.querySelector('#field-container > form > button').click()
    } catch (e) {
        throwError(e)
    }
}