//Совместимость с Rocket Loader
// document.addEventListener('DOMContentLoaded', (event)=>{
//     vote()
// })

async function vote(first) {
//  if (first == true || first == false) return
    if (document.querySelector('div.main-panel > p')) {
        const request = {}
        request.message = document.querySelector('div.main-panel > p').textContent
        if (request.message.includes('already voted')) {
            chrome.runtime.sendMessage({later: true})
            return
        } else {
            if (request.message.includes('Captcha is not correct')) {
                // None
            } else {
                if (request.message.includes('some problems sending your vote')) {
                    request.ignoreReport = true
                }
                chrome.runtime.sendMessage(request)
                return
            }
        }
    }
    if (document.querySelector('div.main-panel > span') != null) {
        if (document.querySelector('div.main-panel > span').textContent.includes('vote was success')) {
            chrome.runtime.sendMessage({successfully: true})
        } else {
            chrome.runtime.sendMessage({message: document.querySelector('div.main-panel > span').textContent})
        }
        return
    }

    if (document.querySelector('form[method="POST"] > button[type="submit"]').textContent.includes('Already Voted')) {
        chrome.runtime.sendMessage({later: true})
        return
    }

    if (first) return

    const project = await getProject('MCServers')
    document.getElementById('username').value = project.nick
    document.querySelector('form[method="POST"] > button[type="submit"]').click()
}