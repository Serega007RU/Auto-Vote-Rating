//Совместимость с Rocket Loader
document.addEventListener('DOMContentLoaded', (event)=>{
    this.check2 = setInterval(()=>{
        //Ожидаем загрузки reCAPTCHA
        if (document.getElementById('g-recaptcha-response') != null && document.getElementById('g-recaptcha-response').value && document.getElementById('g-recaptcha-response').value != '') {
            vote()
            clearInterval(this.check2)
        }
    }, 1000)
})

async function vote() {
    try {
        //Если мы находимся на странице проверки CloudFlare
        if (document.querySelector('span[data-translate="complete_sec_check"]') != null) {
            return
        }
        const nick = await getNickName()
        if (nick == null || nick == '')
            return
        document.getElementById('ignn').value = nick
        document.querySelector('#voteform > input.buttonsmall.pointer.green.size10').click()
    } catch (e) {
        chrome.runtime.sendMessage({errorVoteNoElement2: e.stack})
    }
}

async function getNickName() {
    const projects = await new Promise(resolve=>{
        chrome.storage.local.get('AVMRprojectsMinecraftServerList', data=>{
            resolve(data['AVMRprojectsMinecraftServerList'])
        })
    })
    for (const project of projects) {
        if (document.URL.includes(project.id)) {
            return project.nick
        }
    }

    chrome.runtime.sendMessage({errorVoteNoNick2: document.URL})
}

//Ждёт готовности recaptcha (Anti Spam check) и проверяет что с голосованием и пытается вновь нажать vote()
this.check = setInterval(()=>{
    if (document.querySelector('#voteerror > font') != null) {
        if (document.querySelector('#voteerror > font').textContent.includes('Vote Registered')) {
            chrome.runtime.sendMessage({successfully: true})
        } else if (document.querySelector('#voteerror > font').textContent.includes('already voted')) {
            chrome.runtime.sendMessage({later: true})
        } else if (document.querySelector('#voteerror > font').textContent.includes('Please Wait')) {
            return
        } else {
            chrome.runtime.sendMessage({message: document.querySelector('#voteerror > font').textContent})
        }
        clearInterval(this.check)
    }
}, 1000)
