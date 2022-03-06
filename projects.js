//Список рейтингов
// noinspection JSUnusedGlobalSymbols
const allProjects = {
    TopCraft: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
                return 'https://topcraft.ru/accounts/vk/login/?process=login&next=/servers/' + project.id + '/'
            case 'pageURL':
                return 'https://topcraft.ru/servers/' + project.id + '/'
            case 'projectName':
                return doc.querySelector('.project-header > h1').textContent
            case 'exampleURL':
                return ['https://topcraft.ru/servers/', '10496', '/']
            case 'URL':
                return 'TopCraft.ru'
        }
    },
    McTOP: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
                return 'https://mctop.su/accounts/vk/login/?process=login&next=/servers/' + project.id + '/'
            case 'pageURL':
                return 'https://mctop.su/servers/' + project.id + '/'
            case 'projectName':
                return doc.querySelector('.project-header > h1').textContent
            case 'exampleURL':
                return ['https://mctop.su/servers/', '5231', '/']
            case 'URL':
                return 'McTOP.su'
        }
    },
    MCRate: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
                return 'http://mcrate.su/rate/' + project.id
            case 'pageURL':
                return 'http://mcrate.su/project/' + project.id
            case 'projectName':
                return doc.querySelector('#center-main > .top_panel > h1').textContent
            case 'exampleURL':
                return ['http://mcrate.su/rate/', '4396', '']
            case 'URL':
                return 'MCRate.su'
            case 'oneProject':
                return 1
            case 'notFound':
                return doc.querySelector('div[class=error]') != null && doc.querySelector('div[class=error]').textContent.includes('Проект с таким ID не найден')
        }
    },
    MinecraftRating: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
                if (project.game === 'projects') return 'https://oauth.vk.com/authorize?client_id=5216838&display=page&redirect_uri=https://minecraftrating.ru/projects/' + project.id + '/&state=' + project.nick + '&response_type=code&v=5.45'
                else return 'https://minecraftrating.ru/vote/' + project.id + '/'
            case 'pageURL':
                if (project.game === 'projects') return 'https://minecraftrating.ru/projects/' + project.id + '/'
                else return 'https://minecraftrating.ru/vote/' + project.id + '/'
            case 'projectName':
                if (project.game === 'projects') return doc.querySelector('h1[itemprop="name"]').textContent.trim().replace('Проект ', '')
                else return doc.querySelector('.page-header a').textContent
            case 'exampleURL':
                return ['https://minecraftrating.ru/projects/', 'cubixworld', '/']
            case 'URL':
                return 'MinecraftRating.ru'
        }
    },
    MonitoringMinecraft: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
                return 'https://monitoringminecraft.ru/top/' + project.id + '/vote'
            case 'pageURL':
                return 'https://monitoringminecraft.ru/top/' + project.id + '/'
            case 'projectName':
                return doc.querySelector('#cap h1').textContent
            case 'exampleURL':
                return ['https://monitoringminecraft.ru/top/', 'gg', '/vote']
            case 'URL':
                return 'MonitoringMinecraft.ru'
        }
    },
    IonMc: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
            case 'pageURL':
                return 'https://ionmc.top/projects/' + project.id + '/vote'
            case 'projectName':
                return doc.querySelector('#app h1.header').innerText.replace('Голосование за проект ', '')
            case 'exampleURL':
                return ['https://ionmc.top/projects/', '80', '/vote']
            case 'URL':
                return 'IonMc.top'
        }
    },
    MinecraftServersOrg: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
                return 'https://minecraftservers.org/vote/' + project.id
            case 'pageURL':
                return 'https://minecraftservers.org/server/' + project.id
            case 'projectName':
                return doc.querySelector('#left h1').textContent
            case 'exampleURL':
                return ['https://minecraftservers.org/vote/', '25531', '']
            case 'URL':
                return 'MinecraftServers.org'
            case 'oneProject':
                return 1
        }
    },
    ServeurPrive: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
            case 'pageURL':
                if (project.lang === 'en') {
                    return 'https://serveur-prive.net/' + project.lang + '/' + project.game + '/' + project.id + '/vote'
                } else {
                    return 'https://serveur-prive.net/' + project.game + '/' + project.id + '/vote'
                }
            case 'projectName':
                return doc.querySelector('#t h2').textContent
            case 'exampleURL':
                return ['https://serveur-prive.net/minecraft/', 'gommehd-net-4932', '/vote']
            case 'URL':
                return 'Serveur-Prive.net'
        }
    },
    PlanetMinecraft: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
                return 'https://www.planetminecraft.com/server/' + project.id + '/vote/'
            case 'pageURL':
                return 'https://www.planetminecraft.com/server/' + project.id + '/'
            case 'projectName':
                return doc.querySelector('#resource-title-text').textContent
            case 'exampleURL':
                return ['https://www.planetminecraft.com/server/', 'legends-evolved', '/vote/']
            case 'URL':
                return 'PlanetMinecraft.com'
        }
    },
    TopG: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
            case 'pageURL':
                return 'https://topg.org/' + project.game + '/server-' + project.id
            case 'projectName':
                return doc.querySelector('div.sheader').textContent
            case 'exampleURL':
                return ['https://topg.org/minecraft-servers/server-', '405637', '']
            case 'URL':
                return 'TopG.org'
        }
    },
    ListForge: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
                return 'https://' + project.game + '/server/' + project.id + '/vote/' + (project.addition != null ? project.addition : '')
            case 'pageURL':
                return 'https://' + project.game + '/server/' + project.id + '/vote/'
            case 'projectName':
                let text = doc.querySelector('head > title').textContent
                return text.replace('Vote for ', '')
            case 'exampleURL':
                return ['https://minecraft-mp.com/server/', '81821', '/vote/']
            case 'URL':
                return 'ListForge.net'
            case 'notFound':
                for (const el of doc.querySelectorAll('div.alert.alert-info')) {
                    if (el.textContent.includes('server has been removed')) {
                        return el.textContent.trim()
                    }
                }
                for (const el of doc.querySelectorAll('span.badge')) {
                    if (el.textContent.includes('server has been removed')) {
                        return el.textContent.trim()
                    }
                }
                break
        }
    },
    MinecraftServerList: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
                return 'https://minecraft-server-list.com/server/' + project.id + '/vote/'
            case 'pageURL':
                return 'https://minecraft-server-list.com/server/' + project.id + '/'
            case 'projectName':
                return doc.querySelector('.server-heading > a').textContent
            case 'exampleURL':
                return ['https://minecraft-server-list.com/server/', '292028', '/vote/']
            case 'URL':
                return 'Minecraft-Server-List.com'
        }
    },
    ServerPact: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
            case 'pageURL':
                return 'https://www.serverpact.com/vote-' + project.id
            case 'projectName':
                return doc.querySelector('h1.sp-title').textContent.trim().replace('Vote for ', '')
            case 'exampleURL':
                return ['https://www.serverpact.com/vote-', '26492123', '']
            case 'URL':
                return 'ServerPact.com'
            case 'oneProject':
                return 1
            case 'notFound':
                return doc.querySelector('div.container > div.row > div > center') != null && doc.querySelector('div.container > div.row > div > center').textContent.includes('This server does not exist')
        }
    },
    MinecraftIpList: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
                return 'https://minecraftiplist.com/index.php?action=vote&listingID=' + project.id
            case 'pageURL':
                return 'https://minecraftiplist.com/server/-' + project.id
            case 'projectName':
                return doc.querySelector('h2.motdservername').textContent
            case 'exampleURL':
                return ['https://minecraftiplist.com/index.php?action=vote&listingID=', '2576', '']
            case 'URL':
                return 'MinecraftIpList.com'
            case 'oneProject':
                return 5
            case 'notFound':
                return doc.querySelector('#addr > span:nth-child(3)') == null
        }
    },
    TopMinecraftServers: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
                return 'https://topminecraftservers.org/vote/' + project.id
            case 'pageURL':
                return 'https://topminecraftservers.org/server/' + project.id
            case 'projectName':
                return doc.querySelector('h1[property="name"]').textContent
            case 'exampleURL':
                return ['https://topminecraftservers.org/vote/', '9126', '']
            case 'URL':
                return 'TopMinecraftServers.org'
        }
    },
    MinecraftServersBiz: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
            case 'pageURL':
                return 'https://minecraftservers.biz/' + project.id + '/'
            case 'projectName':
                return doc.querySelector('.panel-heading strong').textContent.trim()
            case 'exampleURL':
                return ['https://minecraftservers.biz/', 'servers/145999', '/']
            case 'URL':
                return 'MinecraftServers.biz'
        }
    },
    HotMC: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
                return 'https://hotmc.ru/vote-' + project.id
            case 'pageURL':
                return 'https://hotmc.ru/minecraft-server-' + project.id
            case 'projectName':
                return doc.querySelector('div.text-server > h1').textContent.replace(' сервер Майнкрафт', '')
            case 'exampleURL':
                return ['https://hotmc.ru/vote-', '199493', '']
            case 'URL':
                return 'HotMC.ru'
            case 'oneProject':
                return 1
        }
    },
    MinecraftServerNet: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
                return 'https://minecraft-server.net/vote/' + project.id + '/'
            case 'pageURL':
                return 'https://minecraft-server.net/details/' + project.id + '/'
            case 'projectName':
                return doc.querySelector('div.card-header > h2').textContent
            case 'exampleURL':
                return ['https://minecraft-server.net/vote/', 'TitanicFreak', '/']
            case 'URL':
                return 'Minecraft-Server.net'
        }
    },
    TopGames: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
                if (project.lang === 'fr') {
                    return 'https://top-serveurs.net/' + project.game + '/vote/' + project.id
                } else if (project.lang === 'en') {
                    return 'https://top-games.net/' + project.game + '/vote/' + project.id
                } else {
                    return 'https://' + project.lang + '.top-games.net/' + project.game + '/vote/' + project.id
                }
            case 'pageURL':
                if (project.lang === 'fr') {
                    return 'https://top-serveurs.net/' + project.game + '/' + project.id
                } else if (project.lang === 'en') {
                    return 'https://top-games.net/' + project.game + '/' + project.id
                } else {
                    return 'https://' + project.lang + '.top-games.net/' + project.game + '/' + project.id
                }
            case 'projectName':
                return doc.querySelector('div.top-description h1').textContent
            case 'exampleURL':
                return ['https://top-serveurs.net/minecraft/', 'icesword-pvpfaction-depuis-2014-crack-on', '']
            case 'URL':
                return 'Top-Games.net'
        }
    },
    TMonitoring: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
            case 'pageURL':
                return 'https://tmonitoring.com/server/' + project.id + '/'
            case 'projectName':
                return doc.querySelector('div[class="info clearfix"] > div.pull-left > h1').textContent
            case 'exampleURL':
                return ['https://tmonitoring.com/server/', 'qoobworldru', '']
            case 'URL':
                return 'TMonitoring.com'
        }
    },
    TopGG: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
                return 'https://top.gg/' + project.game + '/' + project.id + '/vote' + project.addition
            case 'pageURL':
                return 'https://top.gg/' + project.game + '/' + project.id + '/vote'
            case 'projectName':
                for (const element of doc.querySelectorAll('h1')) {
                    if (element.textContent.includes('Voting for ')) {
                        return element.textContent.replace('Voting for', '')
                    }
                }
                break
            case 'exampleURL':
                return ['https://top.gg/bot/', '270904126974590976', '/vote']
            case 'URL':
                return 'Top.gg'
        }
    },
    DiscordBotList: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
                return 'https://discordbotlist.com/' + project.game + '/' + project.id + '/upvote'
            case 'pageURL':
                return 'https://discordbotlist.com/' + project.game + '/' + project.id
            case 'projectName':
                return doc.querySelector('h1.bot-name').textContent.trim()
            case 'exampleURL':
                return ['https://discordbotlist.com/bots/', 'dank-memer', '/upvote']
            case 'URL':
                return 'DiscordBotList.com'
        }
    },
    Discords: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
                return 'https://discords.com/' + project.game + '/' + project.id + (project.game === 'servers' ? '/upvote' : '/vote')
            case 'pageURL':
                return 'https://discords.com/' + project.game + '/' + project.id
            case 'projectName':
                return project.game === 'servers' ? doc.querySelector('.servernameh1').textContent : doc.querySelector('.bot-title-bp h2').textContent
            case 'exampleURL':
                return ['https://discords.com/bots/bot/', '469610550159212554', '/vote']
            case 'URL':
                return 'Discords.com'
        }
    },
    MMoTopRU: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
                if (project.lang === 'ru') {
                    return 'https://' + project.game + '.mmotop.ru/servers/' + project.id + '/votes/new'
                } else {
                    return 'https://' + project.game + '.mmotop.ru/' + project.lang + '/' + 'servers/' + project.id + '/votes/new'
                }
            case 'pageURL':
                if (project.lang === 'ru') {
                    return 'https://' + project.game + '.mmotop.ru/servers/' + project.id
                } else {
                    return 'https://' + project.game + '.mmotop.ru/' + project.lang + '/' + 'servers/' + project.id
                }
            case 'projectName':
                return doc.querySelector('.server-one h1').textContent
            case 'exampleURL':
                return ['https://pw.mmotop.ru/servers/', '25895', '/votes/new']
            case 'URL':
                return 'MMoTop.ru'
            case 'oneProject':
                return 1
        }
    },
    MCServers: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
                return 'https://mc-servers.com/mcvote/' + project.id + '/'
            case 'pageURL':
                return 'https://mc-servers.com/details/' + project.id + '/'
            case 'projectName':
                return doc.querySelector('.main-panel h1').textContent
            case 'exampleURL':
                return ['https://mc-servers.com/mcvote/', '1890', '/']
            case 'URL':
                return 'MC-Servers.com'
        }
    },
    MinecraftList: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
                return 'https://minecraftlist.org/vote/' + project.id
            case 'pageURL':
                return 'https://minecraftlist.org/server/' + project.id
            case 'projectName':
                return doc.querySelector('.container h1').textContent.trim().replace('Minecraft Server', '')
            case 'exampleURL':
                return ['https://minecraftlist.org/vote/', '11227', '']
            case 'URL':
                return 'MinecraftList.org'
        }
    },
    MinecraftIndex: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
                return 'https://www.minecraft-index.com/' + project.id + '/vote'
            case 'pageURL':
                return 'https://www.minecraft-index.com/' + project.id
            case 'projectName':
                return doc.querySelector('h3.stitle').textContent
            case 'exampleURL':
                return ['https://www.minecraft-index.com/', '33621-extremecraft-net', '/vote']
            case 'URL':
                return 'Minecraft-Index.com'
        }
    },
    ServerList101: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
                return 'https://serverlist101.com/server/' + project.id + '/vote/'
            case 'pageURL':
                return 'https://serverlist101.com/server/' + project.id + '/'
            case 'projectName':
                return doc.querySelector('.container li h1').textContent
            case 'exampleURL':
                return ['https://serverlist101.com/server/', '1547', '/vote/']
            case 'URL':
                return 'ServerList101.com'
        }
    },
    MCServerList: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
                return 'https://mcserver-list.eu/hlasovat?id=' + project.id
            case 'pageURL':
                return 'https://api.mcserver-list.eu/server/?id=' + project.id
            case 'projectName':
                return JSON.parse(doc.body.innerText)[0].name
            case 'exampleURL':
                return ['https://mcserver-list.eu/hlasovat/?id=', '307', '']
            case 'URL':
                return 'MCServer-List.eu'
        }
    },
    CraftList: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
            case 'pageURL':
                return 'https://craftlist.org/' + project.id
            case 'projectName':
                return doc.querySelector('main h1').textContent
            case 'exampleURL':
                return ['https://craftlist.org/', 'basicland', '']
            case 'URL':
                return 'CraftList.org'
        }
    },
    CzechCraft: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
                return 'https://czech-craft.eu/server/' + project.id + '/vote/'
            case 'pageURL':
                return 'https://czech-craft.eu/server/' + project.id + '/'
            case 'projectName':
                return doc.querySelector('a.server-name').textContent
            case 'exampleURL':
                return ['https://czech-craft.eu/server/', 'trenend', '/vote/']
            case 'URL':
                return 'Czech-Craft.eu'
        }
    },
    MinecraftBuzz: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
                return 'https://minecraft.buzz/vote/' + project.id
            case 'pageURL':
                return 'https://minecraft.buzz/server/' + project.id
            case 'projectName':
                return doc.querySelector('#vote-line').previousElementSibling.textContent.trim()
            case 'exampleURL':
                return ['https://minecraft.buzz/vote/', '306', '']
            case 'URL':
                return 'Minecraft.Buzz'
        }
    },
    MinecraftServery: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
            case 'pageURL':
                return 'https://minecraftservery.eu/server/' + project.id
            case 'projectName':
                return doc.querySelector('div.container div.box h1.title').textContent
            case 'exampleURL':
                return ['https://minecraftservery.eu/server/', '105', '']
            case 'URL':
                return 'MinecraftServery.eu'
        }
    },
    RPGParadize: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
            case 'pageURL':
                return 'https://www.rpg-paradize.com/?page=vote&vote=' + project.id
            case 'projectName':
                return doc.querySelector('div.div-box > h1').textContent.replace('Vote : ', '')
            case 'exampleURL':
                return ['https://www.rpg-paradize.com/?page=vote&vote=', '113763', '']
            case 'URL':
                return 'RPG-Paradize.com'
        }
    },
    MinecraftServerListNet: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
            case 'pageURL':
                return 'https://www.minecraft-serverlist.net/vote/' + project.id
            case 'projectName':
                return doc.querySelector('a.server-name').textContent.trim()
            case 'exampleURL':
                return ['https://www.minecraft-serverlist.net/vote/', '51076', '']
            case 'URL':
                return 'Minecraft-ServerList.net'
        }
    },
    MinecraftServerEu: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
                return 'https://minecraft-server.eu/vote/index/' + project.id
            case 'pageURL':
                return 'https://minecraft-server.eu/server/index/' + project.id
            case 'projectName':
                return doc.querySelector('div.serverName').textContent
            case 'exampleURL':
                return ['https://minecraft-server.eu/vote/index/', '1A73C', '']
            case 'URL':
                return 'Minecraft-Server.eu'
        }
    },
    MinecraftKrant: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
            case 'pageURL':
                return 'https://www.minecraftkrant.nl/serverlijst/' + project.id
            case 'projectName':
                return doc.querySelector('div.inner-title').firstChild.textContent.trim()
            case 'exampleURL':
                return ['https://www.minecraftkrant.nl/serverlijst/', 'torchcraft', '']
            case 'URL':
                return 'MinecraftKrant.nl'
        }
    },
    TrackyServer: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
            case 'pageURL':
                return 'https://www.trackyserver.com/server/' + project.id
            case 'projectName':
                return doc.querySelector('div.panel h1').textContent.trim()
            case 'exampleURL':
                return ['https://www.trackyserver.com/server/', 'anubismc-486999', '']
            case 'URL':
                return 'TrackyServer.com'
        }
    },
    MCListsOrg: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
            case 'pageURL':
                return 'https://mc-lists.org/' + project.id + '/vote'
            case 'projectName':
                return doc.querySelector('div.header > div.ui.container').textContent.trim()
            case 'exampleURL':
                return ['https://mc-lists.org/', 'server-luxurycraft.1818', '/vote']
            case 'URL':
                return 'MC-Lists.org'
        }
    },
    TopMCServersCom: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
                return 'https://topmcservers.com/server/' + project.id + '/vote'
            case 'pageURL':
                return 'https://topmcservers.com/server/' + project.id
            case 'projectName':
                return doc.querySelector('#serverPage > h1.header').textContent
            case 'exampleURL':
                return ['https://topmcservers.com/server/', '17', '/vote']
            case 'URL':
                return 'TopMCServers.com'
        }
    },
    BestServersCom: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
            case 'pageURL':
                return 'https://bestservers.com/server/' + project.id + '/vote'
            case 'projectName':
                return doc.querySelector('th.server').textContent.trim()
            case 'exampleURL':
                return ['https://bestservers.com/server/', '1135', '/vote']
            case 'URL':
                return 'BestServers.com'
        }
    },
    CraftListNet: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
                return 'https://craft-list.net/minecraft-server/' + project.id + '/vote'
            case 'pageURL':
                return 'https://craft-list.net/minecraft-server/' + project.id
            case 'projectName':
                return doc.querySelector('div.serverpage-navigation-headername.header').firstChild.textContent.trim()
            case 'exampleURL':
                return ['https://craft-list.net/minecraft-server/', 'Advancius-Network', '/vote']
            case 'URL':
                return 'Craft-List.net'
        }
    },
    MinecraftServersListOrg: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
                return 'https://www.minecraft-servers-list.org/index.php?a=in&u=' + project.id
            case 'pageURL':
                return 'https://www.minecraft-servers-list.org/details/' + project.id + '/'
            case 'projectName':
                return doc.querySelector('div.card-header > h1').textContent.trim()
            case 'exampleURL':
                return ['https://www.minecraft-servers-list.org/index.php?a=in&u=', 'chromity', '']
            case 'URL':
                return 'Minecraft-Servers-List.org'
        }
    },
    ServerListe: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
            case 'pageURL':
                return 'https://www.serverliste.net/vote/' + project.id
            case 'projectName':
                return doc.querySelector('#bar > h3').textContent.trim()
            case 'exampleURL':
                return ['https://www.serverliste.net/vote/', '775', '']
            case 'URL':
                return 'ServerListe.net'
        }
    },
    gTop100: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
                return 'https://gtop100.com/topsites/' + project.game + '/sitedetails/' + project.id + '?vote=1&pingUsername=' + project.nick
            case 'pageURL':
                return 'https://gtop100.com/topsites/' + project.game + '/sitedetails/' + project.id + '?vote=1'
            case 'projectName':
                return doc.querySelector('[itemprop="name"]').textContent.trim()
            case 'exampleURL':
                return ['https://gtop100.com/topsites/MapleStory/sitedetails/', 'Ristonia--v224--98344', '?vote=1&pingUsername=kingcloudian']
            case 'URL':
                return 'gTop100.com'
        }
    },
    WARGM: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
                return 'https://wargm.ru/server/' + project.id + '/votes'
            case 'pageURL':
                return 'https://wargm.ru/server/' + project.id
            case 'projectName':
                return doc.querySelector('#header h1').textContent
            case 'exampleURL':
                return ['https://wargm.ru/server/', '23394', '/votes']
            case 'URL':
                return 'WARGM.ru'
        }
    },
    MineStatus: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
                return 'https://minestatus.net/server/vote/' + project.id
            case 'pageURL':
                return 'https://minestatus.net/server/' + project.id
            case 'projectName':
                return doc.querySelector('h1.section-title').textContent.trim()
            case 'exampleURL':
                return ['https://minestatus.net/server/vote/', 'mine.sylphmc.com', '']
            case 'URL':
                return 'MineStatus.net'
        }
    },
    MisterLauncher: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
                if (project.game === 'projects') return 'https://oauth.vk.com/authorize?client_id=7636705&display=page&redirect_uri=https://misterlauncher.org/projects/' + project.id + '/&state=' + project.nick + '&response_type=code'
                else return 'https://misterlauncher.org/vote/' + project.id + '/'
            case 'pageURL':
                if (project.game === 'projects') return 'https://misterlauncher.org/projects/' + project.id + '/'
                else return 'https://misterlauncher.org/vote/' + project.id + '/'
            case 'projectName':
                if (project.game === 'projects') return doc.querySelector('h1[itemprop="name"]').textContent.trim().replace('Проект ', '')
                else return doc.querySelector('.page-vote a').textContent
            case 'exampleURL':
                return ['https://misterlauncher.org/projects/', 'omegamc', '/']
            case 'URL':
                return 'MisterLauncher.org'
        }
    },
    MinecraftServersDe: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
                return 'https://minecraft-servers.de/server/' + project.id + '/vote'
            case 'pageURL':
                return 'https://minecraft-servers.de/server/' + project.id
            case 'projectName':
                return doc.querySelector('div.container h1').textContent
            case 'exampleURL':
                return ['https://minecraft-servers.de/server/', 'twerion', '/vote']
            case 'URL':
                return 'Minecraft-Servers.de'
        }
    },
    DiscordBoats: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
                return 'https://discord.boats/bot/' + project.id + '/vote'
            case 'pageURL':
                return 'https://discord.boats/bot/' + project.id
            case 'projectName':
                return doc.querySelector('div.container h3 > span').textContent
            case 'exampleURL':
                return ['https://discord.boats/bot/', '557628352828014614', '/vote']
            case 'URL':
                return 'Discord.Boats'
        }
    },
    ServerListGames: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
                return 'https://serverlist.games/vote/' + project.id
            case 'pageURL':
                return 'https://serverlist.games/server/' + project.id
            case 'projectName':
                return doc.querySelector('div.card-title-server h5').textContent
            case 'exampleURL':
                return ['https://serverlist.games/vote/', '2052', '']
            case 'URL':
                return 'ServerList.Games'
        }
    },
    BestMinecraftServers: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
                return 'https://best-minecraft-servers.co/' + project.id + '/vote'
            case 'pageURL':
                return 'https://best-minecraft-servers.co/' + project.id
            case 'projectName':
                return doc.querySelector('table.info th').textContent.trim()
            case 'exampleURL':
                return ['https://best-minecraft-servers.co/', 'server-hypixel-network.30', '/vote']
            case 'URL':
                return 'Best-Minecraft-Servers.co'
        }
    },
    MinecraftServers100: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
                return 'https://minecraftservers100.com/vote/' + project.id
            case 'pageURL':
                return 'https://minecraftservers100.com/vote/' + project.id
            case 'projectName':
                return doc.querySelector('div.page-header').textContent.trim().replace('Vote for ', '')
            case 'exampleURL':
                return ['https://minecraftservers100.com/vote/', '2340', '']
            case 'URL':
                return 'MinecraftServers100.com'
        }
    },
    MCServerListCZ: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
                return 'https://mc-serverlist.cz/' + project.id + '/vote'
            case 'pageURL':
                return 'https://mc-serverlist.cz/' + project.id
            case 'projectName':
                return doc.querySelector('table.info th').textContent.trim()
            case 'exampleURL':
                return ['https://mc-serverlist.cz/', 'server-lendmark.27', '/vote']
            case 'URL':
                return 'MC-ServerList.cz'
        }
    },
    MineServers: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
                return 'https://' + project.game + '/server/' + project.id + '/vote'
            case 'pageURL':
                return 'https://' + project.game + '/server/' + project.id + '/vote'
            case 'projectName':
                return doc.querySelector('#title h1').textContent
            case 'exampleURL':
                return ['https://mineservers.com/server/', 'jvvHdPJy', '/vote']
            case 'URL':
                return 'MineServers.com'
        }
    },
    ATLauncher: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
                return 'https://atlauncher.com/servers/server/' + project.id + '/vote'
            case 'pageURL':
                return 'https://atlauncher.com/servers/server/' + project.id + '/vote'
            case 'projectName':
                return doc.querySelector('ol li:nth-child(3)').textContent.trim()
            case 'exampleURL':
                return ['https://atlauncher.com/servers/server/', 'KineticNetworkSkyfactory4', '/vote']
            case 'URL':
                return 'ATLauncher.com'
        }
    },
    ServersMinecraft: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
                return 'https://servers-minecraft.net/' + project.id + '/vote'
            case 'pageURL':
                return 'https://servers-minecraft.net/' + project.id
            case 'projectName':
                return doc.querySelector('div.text-xl').textContent
            case 'exampleURL':
                return ['https://servers-minecraft.net/', 'server-complex-gaming.58', '/vote']
            case 'URL':
                return 'Servers-Minecraft.net'
        }
    },
    MinecraftListCZ: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
                return 'https://www.minecraft-list.cz/server/' + project.id + '/vote'
            case 'pageURL':
                return 'https://www.minecraft-list.cz/server/' + project.id
            case 'projectName':
                return doc.querySelector('.content__box__server__content__detail__firstRow__name').textContent.trim()
            case 'exampleURL':
                return ['https://www.minecraft-list.cz/server/', 'czech-survival', '/vote']
            case 'URL':
                return 'Minecraft-List.cz'
        }
    },
    ListeServeursMinecraft: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
                return 'https://www.liste-serveurs-minecraft.org/vote/?idc=' + project.id
            case 'pageURL':
                return 'https://www.liste-serveurs-minecraft.org/vote/?idc=' + project.id
            case 'projectName':
                return doc.querySelector('#gdrtsvote font[color="blue"]').textContent
            case 'exampleURL':
                return ['https://www.liste-serveurs-minecraft.org/vote/?idc=', '202085', '']
            case 'URL':
                return 'Liste-Serveurs-Minecraft.org'
            case 'notFound':
                return doc.querySelector('#core_middle_column div.panel-body') != null && doc.querySelector('#core_middle_column div.panel-body').textContent.includes('serveur est introuvable')
        }
    },
    MCServidores: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
            case 'pageURL':
                return 'https://mcservidores.com/servidor/' + project.id
            case 'projectName':
                return doc.querySelector('#panel h1').textContent.trim()
            case 'exampleURL':
                return ['https://mcservidores.com/servidor/', '122', '']
            case 'URL':
                return 'MCServidores.com'
            case 'oneProject':
                return 1
        }
    },
    XtremeTop100: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
            case 'pageURL':
                return 'https://www.xtremetop100.com/in.php?site=' + project.id
            case 'projectName':
                return doc.querySelector('#topbanner form[method="POST"] input[type="submit"]').value.replace('Vote for ', '')
            case 'exampleURL':
                return ['https://www.xtremetop100.com/in.php?site=', '1132370645', '']
            case 'URL':
                return 'XtremeTop100.com'
        }
    },
    MinecraftServerSk: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
            case 'pageURL':
                return 'https://minecraft-server.sk/' + project.id + '/vote'
            case 'projectName':
                return doc.querySelector('.server.icon').parentElement.innerText.trim()
            case 'exampleURL':
                return ['https://minecraft-server.sk/', 'server-luoend.52', '/vote']
            case 'URL':
                return 'Minecraft-Server.sk'
        }
    },
    ServeursMinecraftOrg: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
            case 'pageURL':
                return 'https://www.serveursminecraft.org/serveur/' + project.id + '/'
            case 'projectName':
                return doc.querySelector('div.panel-heading b').textContent
            case 'exampleURL':
                return ['https://www.serveursminecraft.org/serveur/', '1017', '/']
            case 'URL':
                return 'ServeursMinecraft.org'
        }
    },
    ServeursMCNet: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
                return 'https://serveurs-mc.net/serveur/' + project.id + '/voter'
            case 'pageURL':
                return 'https://serveurs-mc.net/serveur/' + project.id
            case 'projectName':
                return doc.querySelector('h1.text-center').textContent
            case 'exampleURL':
                return ['https://serveurs-mc.net/serveur/', '82', '/voter']
            case 'URL':
                return 'Serveurs-MC.net'
        }
    },
    ServeursMinecraftCom: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
            case 'pageURL':
                return 'https://serveur-minecraft.com/' + project.id
            case 'projectName':
                return doc.querySelector('div.title h1').textContent
            case 'exampleURL':
                return ['https://serveur-minecraft.com/', '2908', '']
            case 'URL':
                return 'Serveur-Minecraft.com'
        }
    },
    ServeurMinecraftVoteFr: (type, project, doc) => {
        switch (type) {
            case 'voteURL':
            case 'pageURL':
                return 'https://serveur-minecraft-vote.fr/serveurs/' + project.id + '/vote'
            case 'projectName':
                return doc.querySelector('.server-name').textContent
            case 'exampleURL':
                return ['https://serveur-minecraft-vote.fr/serveurs/', 'ectalia.425', '/vote']
            case 'URL':
                return 'Serveur-Minecraft-Vote.fr'
        }
    },
    Custom: (type, project/*, doc*/) => {
        switch (type) {
            case 'pageURL':
                return project.responseURL
            case 'exampleURL':
                return ['', '', '']
            case 'URL':
                return 'Custom'
        }
    }
}