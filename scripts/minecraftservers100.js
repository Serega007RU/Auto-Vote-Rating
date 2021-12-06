async function vote(first) {
    try {
        //На главной ли мы странице?
        if (document.querySelector('div.page-header').innerText === 'MINECRAFT SERVERS') {
            //Дааа, это настолько кринжовый мониторинг что если тебя перекидывает на главную страницу то это значит что типо проголосовало, вот настолько кривой это сайт
            chrome.runtime.sendMessage({successfully: true})
            return
        }

        if (first) return

        let project = await getProject('MinecraftServers100')
        document.querySelector('input[name="username"]').value = project.nick
        document.querySelector('input[type="submit"]').click()
    } catch (e) {
        throwError(e)
    }
}