async function vote() {
    if (document.querySelector('#server-vote')?.innerText.includes('Thank you for voting')) {
        chrome.runtime.sendMessage({successfully: true})
        return
    }

    const project = await getProject()
    document.querySelector('#minecraftUsername').value = project.nick
    document.querySelector('#voteServerBtn').click()
}