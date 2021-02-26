vote()
async function vote() {
    try {
        //Если мы находимся на странице проверки CloudFlare
        if (document.querySelector('span[data-translate="complete_sec_check"]') != null) {
            return
        }
        if (document.querySelector('#center > div > h1') != null && document.querySelector('#center > div > h1').textContent.includes('Successfully voted')) {
            chrome.runtime.sendMessage({successfully: true})
            return
        } else if (document.querySelector('#center > div > h1') != null && document.querySelector('#center > div > h1').textContent.includes('You already voted')) {
            chrome.runtime.sendMessage({later: true})
            return
        }
        const nick = await getNickName()
        if (nick == null || nick == '')
            return
        document.querySelector('#submit_vote_form > input[type=text]:nth-child(1)').value = nick
        document.querySelector('#submit_vote_form > input.r3submit').click()
    } catch (e) {
        chrome.runtime.sendMessage({errorVoteNoElement2: e.stack})
    }
}

async function getNickName() {
    const projects = await new Promise(resolve=>{
        chrome.storage.local.get('AVMRprojectsPlanetMinecraft', data=>{
            resolve(data['AVMRprojectsPlanetMinecraft'])
        })
    })
    for (const project of projects) {
        if (document.URL.includes(project.id)) {
            return project.nick
        }
    }

    chrome.runtime.sendMessage({errorVoteNoNick2: document.URL})
}
