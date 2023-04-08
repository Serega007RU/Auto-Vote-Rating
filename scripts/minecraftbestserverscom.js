async function vote(first) {
    if (document.querySelector('div.bg-green-500[x-data="{ show: true }"]')) {
        const message = document.querySelector('div.bg-green-500[x-data="{ show: true }"]').innerText
        if (message.includes('vote has been counted')) {
            chrome.runtime.sendMessage({successfully: true})
        } else {
            chrome.runtime.sendMessage({message})
        }
        return
    }

    if (document.querySelector('div.bg-red-500[x-data="{ show: true }"]')) {
        const message = document.querySelector('div.bg-red-500[x-data="{ show: true }"]').innerText
        if (message.includes('failed the security challenge')) {
            // None
        } else if (message.includes('already voted')) {
            chrome.runtime.sendMessage({later: true})
            return
        } else {
            chrome.runtime.sendMessage({message})
            return
        }
    }

    if (document.querySelector('div.bg-red-100[x-data="{ show: true }"]')) {
        const message = document.querySelector('div.bg-red-100[x-data="{ show: true }"]').innerText
        if (message.includes('failed the security challenge')) {
            // None
        } else if (message.includes('already voted')) {
            chrome.runtime.sendMessage({later: true})
            return
        } else {
            chrome.runtime.sendMessage({message})
            return
        }
    }

    if (document.querySelector('div.tab[x-show="tab === 1"]')?.innerText.includes('Come back tomorrow to vote in the next period')) {
        chrome.runtime.sendMessage({later: true})
        return
    }

    if (first) return

    const project = await getProject('MinecraftBestServersCom')
    document.querySelector('#username').value = project.nick
    document.querySelector('.tab form button').click()
}