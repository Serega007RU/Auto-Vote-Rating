async function vote(first) {
    if (!first) return

    // TODO дикий костыль ожидающий загрузки страницы
    // была попытка сделать адекватное ожидание станицы
    // но в html никакой нет информации что страница ещё не полностью загрузилась
    // можно конечно было сделать ожидание ответа fetch (xhr) запроса но и там проблемы
    // сайт делает таких запросов несколько
    // и также genshin и honkai делают эти запросы разные (хоть они и схожие)
    // также имеет место быть проблема если пользователь не авторизован
    // если нет авторизации то и fetch (xhr) запросов на загрузку сколько отметков выполнил пользователь
    // что вставляет ещё больше палок в колёса
    // поэтому тут такое тупое await wait()
    await wait(5000)

    const project = await getProject('HoYoLAB')

    if (!project.id || project.id === 'genshin impact daily') {
        if (document.querySelector('div[class*="sign-list"] div[class*="sign-wrapper"]')) {
            document.querySelector('div[class*="sign-list"] div[class*="sign-wrapper"]').click()
        } else if (document.querySelector('div[class*="sign-list"] div[class*="has-signed"]')) {
            chrome.runtime.sendMessage({later: true})
        } else {
            chrome.runtime.sendMessage({errorVoteNoElement: 'not loaded page?'})
        }
    } else {
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
    const request = {}
    request.message = document.querySelector('div.sign-wrapper')?.innerText ||
        document.querySelector('div.van-toast__text')?.innerText ||
        document.querySelector('div.m-dialog-body')?.innerText ||
        document.querySelector('div[class*="sign-guide"]')?.innerText
    if (request.message && request.message.length > 3) {
        if (request.message.includes('checked in today')) {
            clearInterval(timer)
            chrome.runtime.sendMessage({successfully: true})
        } else if (request.message.includes('You may set up check-in notifications') || request.message.includes('You can set up check-in reminders')) {
            // None
            document.querySelector('div[class*="dialog-close"]')?.click()
            document.querySelector('span[class*="guide-close"]')?.click()
        } else {
            clearInterval(timer)
            if (request.message.includes('network timed out')) {
                request.ignoreReport = true
            }
            chrome.runtime.sendMessage(request)
        }
    }
}, 1000)