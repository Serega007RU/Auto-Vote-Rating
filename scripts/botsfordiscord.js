window.onmessage = function(e) {
    if (e.data == 'vote') {
        vote(false)
    }
}
vote(true)

function vote(first) {
    try {
        if (document.URL.startsWith('https://discord.com/')) {
            if (!first) return
            if (document.URL.includes('%20guilds.join')) {
                //Пилюля от жадности в правах
                document.location.replace(document.URL.replace('%20guilds.join', ''))
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

        //Если мы находимся на странице проверки CloudFlare
        if (document.querySelector('span[data-translate="complete_sec_check"]') != null) {
            return
        }

        if (document.getElementById('sign-in') != null) {
            if (document.getElementById('mainAuth') != null) {
                document.getElementById('guild').click()
                document.getElementById('mainAuth').click()
            } else {
                document.getElementById('sign-in').click()
            }
            return
        }

        if (document.querySelector('#votecontainer > h2') != null && document.querySelector('#votecontainer > h2').textContent.includes('already voted')) {
            chrome.runtime.sendMessage({later: true})
            return
        }

        if (document.getElementById('errorsubtitle') != null) {
            if (document.getElementById('errorsubtitle').firstChild.textContent.includes('successfully voted')) {
                chrome.runtime.sendMessage({successfully: true})
                return
            }
            chrome.runtime.sendMessage({message: document.getElementById('errorsubtitle').firstChild.textContent.trim()})
            return
        }

        if (first)
            return
        
        document.querySelector('button[type="submit"]').click()

    } catch (e) {
        chrome.runtime.sendMessage({errorVoteNoElement2: e.stack + (document.body.textContent.trim().length < 500 ? ' ' + document.body.textContent.trim() : '')})
    }
}