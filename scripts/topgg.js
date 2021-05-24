function vote(first) {
    if (first == false) return
    try {
        if (document.URL.startsWith('https://discord.com/')) {
            if (document.URL.includes('%20guilds')) {
                //Пилюля от жадности в правах
                document.location.replace(document.URL.replace('%20guilds', ''))
            } else if (!document.URL.includes('prompt=none')) {
                //Заставляем авторизацию авторизоваться не беспокоя пользователя если права уже были предоставлены
                document.location.replace(document.URL.concat('&prompt=none'))
            } else {
                const timer = setTimeout(()=>{//Да это костыль, а есть варинт по лучше?
                    chrome.runtime.sendMessage({discordLogIn: true})
                }, 10000)
                window.onbeforeunload = function(e) {
                    clearTimeout(timer)
                }
                window.onunload = function(e) {
                    clearTimeout(timer)
                }
            }
            return
        }

        if (document.querySelector('div.modal.is-active') != null) {
            if (document.querySelector('div.modal.is-active > div.modal-content.content').textContent.includes('You must be logged')) {
                document.querySelector('div.modal.is-active > div.modal-content.content a.btn.primary').click()
//              chrome.runtime.sendMessage({discordLogIn: true})
                return
            } else if (document.querySelector('div.modal.is-active a[class="btn"]') != null) {
                document.querySelector('div.modal.is-active a[class="btn"]').click()
            } else {
                chrome.runtime.sendMessage({message: document.querySelector('div.modal.is-active > div.modal-content.content').textContent.trim()})
                return
            }
        }

        document.getElementById('votingvoted').click()
        
        const timer2 = setInterval(()=>{
            try {
                if (document.getElementById('votingvoted').textContent.includes('already voted') || document.getElementById('votingvoted').value.includes('already voted')) {
                    chrome.runtime.sendMessage({later: true})
                    clearInterval(timer2)
                } else if (document.getElementById("reminder").style.display != 'none' || document.getElementById("successful-reminder").style.display != 'none' || document.getElementById("failure-reminder").style.display != 'none') {
                    chrome.runtime.sendMessage({successfully: true})
                    clearInterval(timer2)
                } else if (document.getElementById('votingvoted').textContent == 'Voting...' || document.getElementById('votingvoted').value == 'Voting...' || document.getElementById('votingvoted').textContent == 'Vote' || document.getElementById('votingvoted').value == 'Vote') {
                    //None
                } else if (document.getElementById('votingvoted').textContent != '' || document.getElementById('votingvoted').value != '') {
                    if (document.getElementById('votingvoted').textContent != '') {
                        chrome.runtime.sendMessage({message: document.getElementById('votingvoted').textContent.trim()})
                    } else {
                        chrome.runtime.sendMessage({message: document.getElementById('votingvoted').value})
                    }
                    clearInterval(timer2)
                }
            } catch (e) {
                throwError(e)
                clearInterval(timer2)
            }
        }, 1000)

    } catch (e) {
        throwError(e)
    }
}