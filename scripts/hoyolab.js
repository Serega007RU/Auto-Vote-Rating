async function vote(first) {
    if (!first) return

    await wait(5000) // TODO дикий костыль ожидающий загрузки страницы

    const project = await getProject('HoYoLAB')

    if (!project.id || project.id === 'genshin impact daily') {
        if (document.querySelector('div[class*="sign-list"] div[class*="sign-wrapper"]')) {
            document.querySelector('div[class*="sign-list"] div[class*="sign-wrapper"]').click()
        } else if (document.querySelector('div[class*="sign-list"] div[class*="has-signed"]')) {
            chrome.runtime.sendMessage({later: true})
        } else {
            chrome.runtime.sendMessage({errorVoteNoElement: 'not loaded page?'})
        }
    } else  {
        if (document.querySelector('div[class*="prize-list"] div[style*="https://upload-static.hoyoverse.com/event/2023/04/21/5ccbbab8f5eb147df704e16f31fc5788_6285576485616685271.png"]')) {
            document.querySelector('div[class*="prize-list"] div[style*="https://upload-static.hoyoverse.com/event/2023/04/21/5ccbbab8f5eb147df704e16f31fc5788_6285576485616685271.png"]').click()
        } else if (document.querySelector('div[class*="prize-list"] [class*="received"]')) {
            chrome.runtime.sendMessage({later: true})
        } else {
            chrome.runtime.sendMessage({errorVoteNoElement: 'not loaded page?'})
        }
    }
}

const timer = setInterval(() => {
    const message = document.querySelector('div.sign-wrapper')?.innerText || document.querySelector('div.van-toast__text')?.innerText
    if (message && message.length > 3) {
        clearInterval(timer)
        if (message.includes('checked in today')) {
            chrome.runtime.sendMessage({successfully: true})
        } else {
            chrome.runtime.sendMessage({message})
        }
    }
}, 1000)