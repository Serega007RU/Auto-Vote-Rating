vote()
async function vote() {
    try {
        //Если мы находимся на странице проверки CloudFlare
        if (document.querySelector('span[data-translate="complete_sec_check"]') != null) {
            return
        }
        if (document.querySelector('body > div.container > div > div > div.alert.alert-danger') != null) {
            if (document.querySelector('body > div.container > div > div > div.alert.alert-danger').textContent.includes('already voted')) {
                chrome.runtime.sendMessage({later: true})
            } else {
                chrome.runtime.sendMessage({message: document.querySelector('body > div.container > div > div > div.alert.alert-danger').textContent})
            }
        } else if (document.querySelector('body > div.container > div > div > div > div.col-md-4 > button') != null) {
            if (document.querySelector('body > div.container > div > div > div > div.col-md-4 > button').textContent.includes('already voted')) {
                chrome.runtime.sendMessage({successfully: true})
            } else {
                chrome.runtime.sendMessage({message: document.querySelector('body > div.container > div > div > div > div.col-md-4 > button').textContent})
            }
        } else {
            //Ожидание загрузки reCATPCHA
            this.check = setTimeout(async ()=>{
                if (document.querySelector('input[name="token"]') != null && document.querySelector('input[name="token"]').value != '') {
                    clearInterval(this.check)
                    const nick = await getNickName()
                    if (nick == null || nick == '')
                        return
                    document.getElementById('username').value = nick
                    document.getElementById('voteButton').click()
                }
            }, 1000)
        }
    } catch (e) {
        chrome.runtime.sendMessage({errorVoteNoElement2: e.stack})
    }
}

async function getNickName() {
    const projects = await new Promise(resolve=>{
        chrome.storage.local.get('AVMRprojectsTopMinecraftServers', data=>{
            resolve(data['AVMRprojectsTopMinecraftServers'])
        })
    })
    for (const project of projects) {
        if (document.URL.includes(project.id)) {
            return project.nick
        }
    }

    chrome.runtime.sendMessage({errorVoteNoNick2: document.URL})
}
