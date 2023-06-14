//Список рейтингов
// noinspection JSUnusedGlobalSymbols,ES6ConvertVarToLetConst,SpellCheckingInspection,HttpUrlsUsage

var allProjects = {
    TopCraft: {
        voteURL: (project) => 'https://topcraft.ru/servers/' + project.id + '/',
        pageURL: (project) => 'https://topcraft.ru/servers/' + project.id + '/',
        projectName: (doc) => doc.querySelector('.project-header > h1').textContent,
        exampleURL: () => ['https://topcraft.ru/servers/', '10496', '/'],
        URL: () => 'topcraft.ru',
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hour: 21}),
        needAdditionalOrigins: ()=> ['*://*.vk.com/*']
    },
    McTOP: {
        voteURL: (project) => 'https://mctop.su/servers/' + project.id + '/',
        pageURL: (project) => 'https://mctop.su/servers/' + project.id + '/',
        projectName: (doc) => doc.querySelector('.project-header > h1').textContent,
        exampleURL: () => ['https://mctop.su/servers/', '5231', '/'],
        URL: () => 'mctop.su',
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hour: 21}),
        needAdditionalOrigins: ()=> ['*://*.vk.com/*']
    },
    MCRate: {
        voteURL: (project) => 'http://mcrate.su/rate/' + project.id,
        pageURL: (project) => 'http://mcrate.su/project/' + project.id,
        projectName: (doc) => doc.querySelector('#center-main > .top_panel > h1').textContent,
        exampleURL: () => ['http://mcrate.su/rate/', '4396', ''],
        URL: () => 'mcrate.su',
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hour: 22}),
        oneProject: () => 1,
        notFound: (doc) => doc.querySelector('div[class=error]') != null && doc.querySelector('div[class=error]').textContent.includes('Проект с таким ID не найден'),
        needAdditionalOrigins: ()=> ['*://*.vk.com/*']
    },
    MinecraftRating: {
        voteURL: (project) => (project.game === 'projects') ? 'https://minecraftrating.ru/projects/' + project.id + '/' : 'https://minecraftrating.ru/vote/' + project.id + '/',
        pageURL: (project) => (project.game === 'projects') ? 'https://minecraftrating.ru/projects/' + project.id + '/' : 'https://minecraftrating.ru/vote/' + project.id + '/',
        projectName: (doc, project) => (project.game === 'projects') ? doc.querySelector('h1[itemprop="name"]').textContent.trim().replace('Проект ', '') : doc.querySelector('.page-header a').textContent,
        exampleURL: () => ['https://minecraftrating.ru/projects/', 'cubixworld', '/'],
        URL: () => 'minecraftrating.ru',
        parseURL: (url) => ({game: url.pathname.split('/')[1] === 'projects' ? 'projects': 'servers', id: url.pathname.split('/')[2]}),
        timeout: (project) => project.game === 'projects' ? ({hour: 21}) : ({hours: 24}),
        exampleURLGame: () => ['https://minecraftrating.ru/', 'projects', '/mcskill/'],
        defaultGame: () => 'projects',
        gameList: () => new Map([
            ['projects', 'Проекты'],
            ['servers', 'Сервера (нет награды за голосование)']
        ]),
        notRequiredNick: (project) => project?.game === 'servers',
        needAdditionalOrigins: (project)=> project?.game === 'projects' ? ['*://*.vk.com/*'] : []
    },
    MonitoringMinecraft: {
        voteURL: (project) => 'https://monitoringminecraft.ru/top/' + project.id + '/vote',
        pageURL: (project) => 'https://monitoringminecraft.ru/top/' + project.id + '/',
        projectName: (doc) => doc.querySelector('#cap h1').textContent,
        exampleURL: () => ['https://monitoringminecraft.ru/top/', 'gg', '/vote'],
        URL: () => 'monitoringminecraft.ru',
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hour: 21}),
        notRequiredCaptcha: () => true,
        needAdditionalOrigins: () => ['*://*.vk.com/*'],
        needAdditionalPermissions: () => ['cookies']
    },
    IonMc: {
        voteURL: (project) => 'https://ionmc.top/projects/' + project.id + '/vote',
        pageURL: (project) => 'https://ionmc.top/projects/' + project.id + '/vote',
        projectName: (doc) => doc.querySelector('#app h1.header').innerText.replace('Голосование за проект ', ''),
        exampleURL: () => ['https://ionmc.top/projects/', '80', '/vote'],
        URL: () => 'ionmc.top',
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hour: 21})
    },
    MinecraftServersOrg: {
        voteURL: (project) => 'https://minecraftservers.org/vote/' + project.id,
        pageURL: (project) => 'https://minecraftservers.org/server/' + project.id,
        projectName: (doc) => doc.querySelector('#left h1').textContent,
        exampleURL: () => ['https://minecraftservers.org/vote/', '25531', ''],
        URL: () => 'minecraftservers.org',
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hour: 0}),
        oneProject: () => 1
    },
    ServeurPrive: {
        voteURL: (project) => 'https://serveur-prive.net/' + (project.lang === 'fr' ? '' : project.lang + '/') + project.game + '/' + project.id + '/vote',
        pageURL: (project) => 'https://serveur-prive.net/' + (project.lang === 'fr' ? '' : project.lang + '/') + project.game + '/' + project.id + '/vote',
        projectName: (doc) => doc.querySelector('#t h2').textContent,
        exampleURL: () => ['https://serveur-prive.net/minecraft/', 'gommehd-net-4932', '/vote'],
        URL: () => 'serveur-prive.net',
        parseURL: (url) => {
            const project = {}
            const paths = url.pathname.split('/')
            if (paths[1].length === 2) {
                project.lang = paths[1]
                project.game = paths[2]
                project.id = paths[3]
            } else {
                project.lang = 'fr'
                project.game = paths[1]
                project.id = paths[2]
            }
            return project
        },
        timeout: () => ({hours: 1, minutes: 30}),
        limitedCountVote: () => true,
        exampleURLGame: () => ['https://serveur-prive.net/', 'minecraft', '/gommehd-net-4932'],
        defaultGame: () => 'minecraft',
        gameList: () => new Map([
            ['ark', 'ARK'],
            ['ark-survival-evolved', 'Ark : Survival Evolved'],
            ['discord', 'Discord'],
            ['garrys-mod', "Garry's Mod"],
            ['grand-theft-auto', 'Grand Theft Auto V'],
            ['hytale', 'Hytale'],
            ['minecraft', 'Minecraft'],
            ['minecraft-bedrock', 'Minecraft Bedrock'],
            ['rust', 'Rust']
        ]),
        defaultLand: () => 'fr',
        langList: () => new Map([
            ['en', 'English'],
            ['fr', 'Français']
        ])
    },
    PlanetMinecraft: {
        voteURL: (project) => 'https://www.planetminecraft.com/server/' + project.id + '/vote/',
        pageURL: (project) => 'https://www.planetminecraft.com/server/' + project.id + '/',
        projectName: (doc) => doc.querySelector('#resource-title-text').textContent,
        exampleURL: () => ['https://www.planetminecraft.com/server/', 'legends-evolved', '/vote/'],
        URL: () => 'planetminecraft.com',
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hour: 5})
    },
    TopG: {
        voteURL: (project) => {
            // noinspection JSCheckFunctionSignatures
            if (!isNaN(project.id.at(0))) { // TODO временное решение, следует в следующей версии перевести на новый формат id
                project.id = 'server-' + project.id
            }
            return 'https://topg.org/' + project.game + '/' + project.id
        },
        pageURL: (project) => {
            // noinspection JSCheckFunctionSignatures
            if (!isNaN(project.id.at(0))) { // TODO временное решение, следует в следующей версии перевести на новый формат id
                project.id = 'server-' + project.id
            }
            return 'https://topg.org/' + project.game + '/' + project.id
        },
        projectName: (doc) => doc.querySelector('div.sheader').textContent,
        exampleURL: () => ['https://topg.org/minecraft-servers/', 'server-405637', ''],
        URL: () => 'topg.org',
        parseURL: (url) => ({ game: url.pathname.split('/')[1], id: url.pathname.split('/')[2]}),
        timeout: () => ({hours: 12}),
        exampleURLGame: () => ['https://topg.org/', 'minecraft-servers', '/server-405637'],
        gameList: () => new Map([
            ['minecraft-servers', 'Minecraft'],
            ['cs-servers', 'Counter Strike: 1.6'],
            ['mu-private-servers', 'Mu Online'],
            ['wow-private-servers', 'World of Warcraft'],
            ['runescape-private-servers', 'Runescape']
        ])
    },
    ListForge: {
        voteURL: (project) => 'https://' + project.game + '/server/' + project.id + '/vote/' + (project.addition != null ? project.addition : ''),
        pageURL: (project) => 'https://' + project.game + '/server/' + project.id + '/vote/',
        projectName: (doc) => doc.querySelector('head > title').textContent.replace('Vote for ', ''),
        exampleURL: () => ['https://minecraft-mp.com/server/', '81821', '/vote/'],
        URL: () => 'listforge.net',
        parseURL: (url) => {
            const project = {}
            const paths = url.pathname.split('/')
            project.game = url.host
            if (paths[1].startsWith('server-s')) {
                project.id = paths[1].replace('server-s', '')
            } else {
                project.id = paths[2]
            }
            if (url.search && url.search.length > 0) {
                project.addition = url.search
            } else {
                project.addition = ''
            }
            return project
        },
        timeout: () => ({hour: 5}),
        notFound: (doc) => {
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
        },
        exampleURLGame: () => ['https://', 'minecraft-mp.com', '/server/207380/vote/'],
        gameList: () => new Map([
            ['7daystodie-servers.com', '7 Days To Die'],
            ['ark-servers.net', 'ARK : Survival Evolved'],
            ['arma3-servers.net', 'Arma3'],
            ['atlas-servers.io', 'Atlas'],
            ['conan-exiles.com', 'Conan Exiles'],
            ['counter-strike-servers.net', 'Counter Strike : Global Offensive'],
            ['cubeworld-servers.com', 'Cube World'],
            ['dayz-servers.org', 'DayZ'],
            ['ecoservers.io', 'ECO'],
            ['empyrion-servers.com', 'Empyrion'],
            ['gmod-servers.com', "Garry's Mod"],
            ['hurtworld-servers.net', 'Hurtworld'],
            ['hytale-servers.io', 'Hytale'],
            ['life-is-feudal.org', 'Life is Feudal'],
            ['minecraft-mp.com', 'Minecraft'],
            ['minecraftpocket-servers.com', 'Minecraft Pocket'],
            ['minecraft-tracker.com', 'Minecraft Tracker'],
            ['miscreated-servers.com', 'Miscreated'],
            ['reign-of-kings.net', 'Reign of Kings'],
            ['rust-servers.net', 'Rust'],
            ['space-engineers.com', 'Space Engineers'],
            ['squad-servers.com', 'Squad'],
            ['starbound-servers.net', 'Starbound'],
            ['tf2-servers.com', 'Team Fortress 2'],
            ['teamspeak-servers.org', 'Teamspeak'],
            ['terraria-servers.com', 'Terraria'],
            ['unturned-servers.net', 'Unturned'],
            ['wurm-unlimited.com', 'Wurm Unlimited']
        ]),
        optionalNick: () => true,
        additionExampleURL: () => ['https://minecraft-mp.com/server/41366/vote/', '?alternate_captcha=1', ''],
        needAdditionalOrigins: (project) => {
            if (project.game !== 'cubeworld-servers.com' && project.game !== 'hytale-servers.io' && project.game !== 'minecraft-mp.com' && project.game !== 'minecraftpocket-servers.com' && project.game !== 'terraria-servers.com' && project.game !== 'valheim-servers.io') {
                return ['*://*.steamcommunity.com/*']
            } else {
                return []
            }
        }
    },
    MinecraftServerList: {
        voteURL: (project) => 'https://minecraft-server-list.com/server/' + project.id + '/vote/',
        pageURL: (project) => 'https://minecraft-server-list.com/server/' + project.id + '/',
        projectName: (doc) => doc.querySelector('.server-heading > a').textContent,
        exampleURL: () => ['https://minecraft-server-list.com/server/', '292028', '/vote/'],
        URL: () => 'minecraft-server-list.com',
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hour: 23})
    },
    ServerPact: {
        voteURL: (project) => 'https://www.serverpact.com/vote-' + project.id,
        pageURL: (project) => 'https://www.serverpact.com/vote-' + project.id,
        projectName: (doc) => doc.querySelector('h1.sp-title').textContent.trim().replace('Vote for ', ''),
        exampleURL: () => ['https://www.serverpact.com/vote-', '26492123', ''],
        URL: () => 'serverpact.com',
        parseURL: (url) => ({id: url.pathname.split('/')[1].replace('vote-', '')}),
        timeout: () => ({hours: 11, minutes: 7}),
        oneProject: () => 1,
        notFound: (doc) => doc.querySelector('div.container > div.row > div > center') != null && doc.querySelector('div.container > div.row > div > center').textContent.includes('This server does not exist'),
        silentVote: () => true,
        notRequiredCaptcha: () => true
    },
    MinecraftIpList: {
        voteURL: (project) => 'https://www.minecraftiplist.com/index.php?action=vote&listingID=' + project.id,
        pageURL: (project) => 'https://www.minecraftiplist.com/server/-' + project.id,
        projectName: (doc) => doc.querySelector('h2.motdservername').textContent,
        exampleURL: () => ['https://www.minecraftiplist.com/index.php?action=vote&listingID=', '2576', ''],
        URL: () => 'minecraftiplist.com',
        parseURL: (url) => {
            const project = {}
            const paths = url.pathname.split('/')
            if (paths[1] === 'server') {
                project.id = paths[2]
            } else {
                project.id = url.searchParams.get('listingID')
            }
            return project
        },
        timeout: () => ({hours: 24})
    },
    TopMinecraftServers: {
        voteURL: (project) => 'https://topminecraftservers.org/vote/' + project.id,
        pageURL: (project) => 'https://topminecraftservers.org/server/' + project.id,
        projectName: (doc) => doc.querySelector('h1[property="name"]').textContent,
        exampleURL: () => ['https://topminecraftservers.org/vote/', '9126', ''],
        URL: () => 'topminecraftservers.org',
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hour: 4})
    },
    MinecraftServersBiz: {
        voteURL: (project) => 'https://minecraftservers.biz/' + project.id + '/',
        pageURL: (project) => 'https://minecraftservers.biz/' + project.id + '/',
        projectName: (doc) => doc.querySelector('.panel-heading strong').textContent.trim(),
        exampleURL: () => ['https://minecraftservers.biz/', 'purpleprison', '/#vote_now'],
        URL: () => 'minecraftservers.biz',
        parseURL: (url) => ({id: url.pathname.split('/')[1]}),
        timeout: () => ({hours: 12})
    },
    HotMC: {
        voteURL: (project) => 'https://hotmc.ru/vote-' + project.id,
        pageURL: (project) => 'https://hotmc.ru/minecraft-server-' + project.id,
        projectName: (doc) => doc.querySelector('div.text-server > h1').textContent.replace(' сервер Майнкрафт', ''),
        exampleURL: () => ['https://hotmc.ru/vote-', '199493', ''],
        URL: () => 'hotmc.ru',
        parseURL: (url) => {
            const project = {}
            const paths = url.pathname.split('/')
            project.id = paths[1]
            project.id = project.id.replace('vote-', '')
            project.id = project.id.replace('minecraft-server-', '')
            return project
        },
        timeout: () => ({hour: 21}),
        oneProject: () => 1
    },
    MinecraftServerNet: {
        voteURL: (project) => 'https://minecraft-server.net/vote/' + project.id + '/',
        pageURL: (project) => 'https://minecraft-server.net/details/' + project.id + '/',
        projectName: (doc) => doc.querySelector('div.card-header > h2').textContent,
        exampleURL: () => ['https://minecraft-server.net/vote/', 'TitanicFreak', '/'],
        URL: () => 'minecraft-server.net',
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hours: 24})
    },
    TopGames: {
        voteURL: (project) => {
            if (project.lang === 'fr') {
                return 'https://top-serveurs.net/' + project.game + '/vote/' + project.id
            } else if (project.lang === 'en') {
                return 'https://top-games.net/' + project.game + '/vote/' + project.id
            } else {
                return 'https://' + project.lang + '.top-games.net/' + project.game + '/vote/' + project.id
            }
        },
        pageURL: (project) => {
            if (project.lang === 'fr') {
                return 'https://top-serveurs.net/' + project.game + '/' + project.id
            } else if (project.lang === 'en') {
                return 'https://top-games.net/' + project.game + '/' + project.id
            } else {
                return 'https://' + project.lang + '.top-games.net/' + project.game + '/' + project.id
            }
        },
        projectName: (doc) => doc.querySelector('div.top-description h1').textContent,
        exampleURL: () => ['https://top-serveurs.net/minecraft/', 'icesword-pvpfaction-depuis-2014-crack-on', ''],
        URL: () => 'top-games.net',
        parseURL: (url) => {
            const project = {}
            const paths = url.pathname.split('/')
            if (url.hostname === 'top-serveurs.net') {
                project.lang = 'fr'
            } else if (url.hostname === 'top-games.net') {
                project.lang = 'en'
            } else {
                project.lang = url.hostname.split('.')[0]
            }
            project.game = paths[1]
            if (paths[2] === 'vote') {
                project.id = paths[3]
            } else {
                project.id = paths[2]
            }
            return project
        },
        timeout: () => ({hours: 2}),
        limitedCountVote: () => true,
        exampleURLGame: () => ['https://top-serveurs.net/', 'minecraft', '/hailcraft'],
        defaultGame: () => 'minecraft',
        gameList: () => new Map([
            ['ark', 'ARK'],
            ['dayz', 'Dayz'],
            ['discord', 'Discord'],
            ['garrys-mod', "Garry's mod"],
            ['gta', 'GTA 5'],
            ['hytale', 'Hytale'],
            ['l4d2', 'Left 4 Dead 2'],
            ['minecraft', 'Minecraft'],
            ['rdr', 'Red Dead Redemption 2'],
            ['roblox', 'Roblox'],
            ['rust', 'Rust'],
            ['terraria', 'Terraria']
        ]),
        defaultLand: () => 'fr',
        langList: () => new Map([
            ['de', 'Deutsch'],
            ['en', 'English'],
            ['es', 'Español'],
            ['fr', 'Français'],
            ['pt', 'Português'],
            ['ru', 'Русский']
        ])
    },
    TMonitoring: {
        voteURL: (project) => 'https://tmonitoring.com/server/' + project.id + '/',
        pageURL: (project) => 'https://tmonitoring.com/server/' + project.id + '/',
        projectName: (doc) => doc.querySelector('div[class="info clearfix"] > div.pull-left > h1').textContent,
        exampleURL: () => ['https://tmonitoring.com/server/', 'qoobworldru', ''],
        URL: () => 'tmonitoring.com',
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hours: 24})
    },
    TopGG: {
        voteURL: (project) => 'https://top.gg/' + project.game + '/' + project.id + '/vote' + project.addition,
        pageURL: (project) => 'https://top.gg/' + project.game + '/' + project.id + '/vote',
        projectName: (doc) => {
            for (const element of doc.querySelectorAll('h1')) {
                if (element.textContent.includes('Voting for ')) {
                    return element.textContent.replace('Voting for', '')
                }
            }
        },
        exampleURL: () => ['https://top.gg/bot/', '270904126974590976', '/vote'],
        URL: () => 'top.gg',
        parseURL: (url) => {
            const project = {}
            const paths = url.pathname.split('/')
            project.game = paths[1]
            project.id = paths[2]
            if (url.search && url.search.length > 0) {
                project.addition = url.search
            } else {
                project.addition = ''
            }
            return project
        },
        timeout: () => ({hours: 12}),
        exampleURLGame: () => ['https://top.gg/', 'bot', '/270904126974590976/vote'],
        defaultGame: () => 'bot',
        gameList: () => new Map([
            ['bot', 'Bots'],
            ['servers', 'Guilds']
        ]),
        notRequiredNick: () => true,
        additionExampleURL: () => ['https://top.gg/bot/617037497574359050/vote', '?currency=DOGE', ''],
        needAdditionalOrigins: ()=> ['https://discord.com/oauth2/*']
    },
    DiscordBotList: {
        voteURL: (project) => 'https://discordbotlist.com/' + project.game + '/' + project.id + '/upvote',
        pageURL: (project) => 'https://discordbotlist.com/' + project.game + '/' + project.id,
        projectName: (doc) => doc.querySelector('h1.bot-name').textContent.trim(),
        exampleURL: () => ['https://discordbotlist.com/bots/', 'dank-memer', '/upvote'],
        URL: () => 'discordbotlist.com',
        parseURL: (url) => ({game: url.pathname.split('/')[1], id: url.pathname.split('/')[2]}),
        timeout: () => ({hours: 12}),
        notRequiredNick: () => true,
        needAdditionalOrigins: ()=> ['https://discord.com/oauth2/*']
    },
    Discords: {
        voteURL: (project) => 'https://discords.com/' + project.game + '/' + project.id + (project.game === 'servers' ? '/upvote' : '/vote'),
        pageURL: (project) => 'https://discords.com/' + project.game + '/' + project.id,
        projectName: (doc, project) => project.game === 'servers' ? doc.querySelector('.servernameh1').textContent : doc.querySelector('.bot-title-bp h2').textContent,
        exampleURL: () => ['https://discords.com/bots/bot/', '469610550159212554', '/vote'],
        URL: () => 'discords.com',
        parseURL: (url) => {
            const project = {}
            const paths = url.pathname.split('/')
            if (paths[1] === 'servers') {
                project.id = paths[2]
                project.game = 'servers'
            } else {
                project.id = paths[3]
                project.game = 'bots/bot'
            }
            return project
        },
        timeout: (project) => project.game === 'bots/bot' ? ({hours: 12}) : ({hours: 6}),
        notRequiredNick: () => true,
        needAdditionalOrigins: ()=> ['https://discord.com/oauth2/*']
    },
    MMoTopRU: {
        voteURL: (project) => {
            if (project.lang === 'ru') {
                return 'https://' + project.game + '.mmotop.ru/servers/' + project.id + '/votes/new'
            } else {
                return 'https://' + project.game + '.mmotop.ru/' + project.lang + '/' + 'servers/' + project.id + '/votes/new'
            }
        },
        pageURL: (project) => {
            if (project.lang === 'ru') {
                return 'https://' + project.game + '.mmotop.ru/servers/' + project.id
            } else {
                return 'https://' + project.game + '.mmotop.ru/' + project.lang + '/' + 'servers/' + project.id
            }
        },
        projectName: (doc) => doc.querySelector('.server-one h1').textContent,
        exampleURL: () => ['https://pw.mmotop.ru/servers/', '25895', '/votes/new'],
        URL: () => 'mmotop.ru',
        parseURL: (url) => {
            const project = {}
            const paths = url.pathname.split('/')
            project.game = url.hostname.split('.')[0]
            if (paths[1] === 'servers') {
                project.lang = 'ru'
                project.id = paths[2]
            } else {
                project.lang = paths[1]
                project.id = paths[3]
            }
            return project
        },
        timeout: () => ({hour: 20}),
        oneProject: () => 1,
        ordinalWorld: () => true,
        exampleURLGame: () => ['https://', 'pw', '.mmotop.ru/servers/25895/votes/new'],
        gameList: () => new Map([
            ['aion', 'Aion'],
            ['mu', 'Global FIU Online'],
            ['jd', 'Jade Dynasty'],
            ['la2', 'Lineage 2'],
            ['all', 'Online Games (All)'],
            ['pw', 'Perfect World'],
            ['rf', 'RF Online'],
            ['wow', 'World War Craft']
        ]),
        defaultLand: () => 'ru',
        langList: () => new Map([
            ['en', 'English'],
            ['ru', 'Русский']
        ])
    },
    MCServers: {
        voteURL: (project) => 'https://mc-servers.com/vote/' + project.id,
        pageURL: (project) => 'https://mc-servers.com/server/' + project.id,
        projectName: (doc) => doc.querySelector('.main-panel h1').textContent,
        exampleURL: () => ['https://mc-servers.com/server/', '1890', '/'],
        URL: () => 'mc-servers.com',
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hours: 24})
    },
    MinecraftList: {
        voteURL: (project) => 'https://minecraftlist.org/vote/' + project.id,
        pageURL: (project) => 'https://minecraftlist.org/server/' + project.id,
        projectName: (doc) => doc.querySelector('.container h1').textContent.trim().replace('Minecraft Server', ''),
        exampleURL: () => ['https://minecraftlist.org/vote/', '11227', ''],
        URL: () => 'minecraftlist.org',
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hour: 5})
    },
    MinecraftIndex: {
        voteURL: (project) => 'https://www.minecraft-index.com/' + project.id + '/vote',
        pageURL: (project) => 'https://www.minecraft-index.com/' + project.id,
        projectName: (doc) => doc.querySelector('h3.stitle').textContent,
        exampleURL: () => ['https://www.minecraft-index.com/', '33621-extremecraft-net', '/vote'],
        URL: () => 'minecraft-index.com',
        parseURL: (url) => ({id: url.pathname.split('/')[1]}),
        timeout: () => ({hour: 0}),
        alertManualCaptcha: () => true
    },
    ServerList101: {
        voteURL: (project) => 'https://serverlist101.com/server/' + project.id + '/vote/',
        pageURL: (project) => 'https://serverlist101.com/server/' + project.id + '/',
        projectName: (doc) => doc.querySelector('.container li h1').textContent,
        exampleURL: () => ['https://serverlist101.com/server/', '1547', '/vote/'],
        URL: () => 'serverlist101.com',
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hour: 23}),
        alertManualCaptcha: () => true
    },
    MCServerList: {
        voteURL: (project) => 'https://mcserver-list.eu/hlasovat/' + project.id,
        pageURL: (project) => 'https://mcserver-list.eu/hlasovat/' + project.id,
        projectName: (doc) => doc.querySelector('.serverdetail h1').textContent,
        exampleURL: () => ['https://mcserver-list.eu/hlasovat/', '416', ''],
        URL: () => 'mcserver-list.eu',
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hours: 2}),
        silentVote: () => true,
        limitedCountVote: () => true,
        notRequiredCaptcha: () => true
    },
    CraftList: {
        voteURL: (project) => 'https://craftlist.org/' + project.id,
        pageURL: (project) => 'https://craftlist.org/' + project.id,
        projectName: (doc) => doc.querySelector('main h1').innerText.trim(),
        exampleURL: () => ['https://craftlist.org/', 'basicland', ''],
        URL: () => 'craftlist.org',
        parseURL: (url) => ({id: url.pathname.split('/')[1]}),
        timeout: () => ({hours: 24})
    },
    CzechCraft: {
        voteURL: (project) => 'https://czech-craft.eu/server/' + project.id + '/vote/',
        pageURL: (project) => 'https://czech-craft.eu/server/' + project.id + '/',
        projectName: (doc) => doc.querySelector('a.server-name').textContent,
        exampleURL: () => ['https://czech-craft.eu/server/', 'trenend', '/vote/'],
        URL: () => 'czech-craft.eu',
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hours: 2}),
        limitedCountVote: () => true
    },
    MinecraftBuzz: {
        voteURL: (project) => 'https://minecraft.buzz/vote/' + project.id,
        pageURL: (project) => 'https://minecraft.buzz/server/' + project.id,
        projectName: (doc) => doc.querySelector('#vote-line').previousElementSibling.textContent.trim(),
        exampleURL: () => ['https://minecraft.buzz/vote/', '306', ''],
        URL: () => 'minecraft.buzz',
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hour: 0})
    },
    MinecraftServery: {
        voteURL: (project) => 'https://minecraftservery.eu/server/' + project.id,
        pageURL: (project) => 'https://minecraftservery.eu/server/' + project.id,
        projectName: (doc) => doc.querySelector('div.container div.box h1.title').textContent,
        exampleURL: () => ['https://minecraftservery.eu/server/', '105', ''],
        URL: () => 'minecraftservery.eu',
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hours: 2}),
        limitedCountVote: () => true
    },
    RPGParadize: {
        voteURL: (project) => 'https://www.rpg-paradize.com/?page=vote&vote=' + project.id,
        pageURL: (project) => 'https://www.rpg-paradize.com/site--' + project.id,
        projectName: (doc) => doc.querySelector('div.div-box > h1').textContent.replace('Vote : ', ''),
        exampleURL: () => ['https://www.rpg-paradize.com/?page=vote&vote=', '113763', ''],
        URL: () => 'rpg-paradize.com',
        parseURL: (url) => {
            const project = {}
            if (url.searchParams.has('vote')) {
                project.id = url.searchParams.get('vote')
            } else {
                const paths = url.pathname.split('/')
                const names = paths[1].split('-')
                project.id = names[names.length - 1]
            }
            return project
        }
    },
    MinecraftServerListNet: {
        voteURL: (project) => 'https://www.minecraft-serverlist.net/vote/' + project.id,
        pageURL: (project) => 'https://www.minecraft-serverlist.net/vote/' + project.id,
        projectName: (doc) => doc.querySelector('a.server-name').textContent.trim(),
        exampleURL: () => ['https://www.minecraft-serverlist.net/vote/', '51076', ''],
        URL: () => 'minecraft-serverlist.net',
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hour: 23})
    },
    MinecraftServerEu: {
        voteURL: (project) => 'https://minecraft-server.eu/vote/index/' + project.id,
        pageURL: (project) => 'https://minecraft-server.eu/server/index/' + project.id,
        projectName: (doc) => doc.querySelector('div.serverName').textContent,
        exampleURL: () => ['https://minecraft-server.eu/vote/index/', '1A73C', ''],
        URL: () => 'minecraft-server.eu',
        parseURL: (url) => ({id: url.pathname.split('/')[3]}),
        timeout: () => ({hour: 23})
    },
    MinecraftKrant: {
        voteURL: (project) => {
            if (!project.game) project.game = 'www.minecraftkrant.nl'
            const serverlist = project.game === 'www.minecraftkrant.nl' ? 'serverlijst' : 'servers'
            return 'https://' + project.game + '/' + serverlist + '/' + project.id + '/vote'
        },
        pageURL: (project) => {
            if (!project.game) project.game = 'www.minecraftkrant.nl'
            const serverlist = project.game === 'www.minecraftkrant.nl' ? 'serverlijst' : 'servers'
            return 'https://' + project.game + '/' + serverlist + '/' + project.id
        },
        projectName: (doc) => doc.querySelector('div.s_HeadTitle').innerText.trim(),
        exampleURL: () => ['https://www.minecraftkrant.nl/serverlijst/', 'torchcraft', '/vote'],
        URL: () => 'minecraftkrant.nl',
        parseURL: (url) => {
            const project = {}
            project.game = url.host
            project.id = url.pathname.split('/')[2]
            return project
        },
        exampleURLGame: () => ['https://', 'minecraftkrant.nl', '/serverlijst/torchcraft/vote'],
        gameList: () => new Map([
            ['www.minecraftkrant.nl', 'Nederlands'],
            ['minecraft-news.net', 'English']
        ])
    },
    TrackyServer: {
        voteURL: (project) => 'https://www.trackyserver.com/server/' + project.id,
        pageURL: (project) => 'https://www.trackyserver.com/server/' + project.id,
        projectName: (doc) => doc.querySelector('div.panel h1').textContent.trim(),
        exampleURL: () => ['https://www.trackyserver.com/server/', 'anubismc-486999', ''],
        URL: () => 'trackyserver.com',
        parseURL: (url) => ({id: url.pathname.split('/')[2]})
    },
    MCListsOrg: {
        voteURL: (project) => 'https://mc-lists.org/' + project.id + '/vote',
        pageURL: (project) => 'https://mc-lists.org/' + project.id + '/vote',
        projectName: (doc) => doc.querySelector('div.header > div.ui.container').textContent.trim(),
        exampleURL: () => ['https://mc-lists.org/', 'server-luxurycraft.1818', '/vote'],
        URL: () => 'mc-lists.org',
        parseURL: (url) => ({id: url.pathname.split('/')[1]}),
        timeout: () => ({hours: 12})
    },
    TopMCServersCom: {
        voteURL: (project) => 'https://topmcservers.com/server/' + project.id + '/vote',
        pageURL: (project) => 'https://topmcservers.com/server/' + project.id,
        projectName: (doc) => doc.querySelector('#serverPage h1.header').textContent,
        exampleURL: () => ['https://topmcservers.com/server/', '17', '/vote'],
        URL: () => 'topmcservers.com',
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hours: 24})
    },
    BestServersCom: {
        voteURL: (project) => 'https://bestservers.com/server/' + project.id + '/vote',
        pageURL: (project) => 'https://bestservers.com/server/' + project.id + '/vote',
        projectName: (doc) => doc.querySelector('th.server').textContent.trim(),
        exampleURL: () => ['https://bestservers.com/server/', '1135', '/vote'],
        URL: () => 'bestservers.com',
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        optionalNick: () => true
    },
    CraftListNet: {
        voteURL: (project) => 'https://craft-list.net/minecraft-server/' + project.id + '/vote',
        pageURL: (project) => 'https://craft-list.net/minecraft-server/' + project.id,
        projectName: (doc) => doc.querySelector('div.serverpage-navigation-headername.header').firstChild.textContent.trim(),
        exampleURL: () => ['https://craft-list.net/minecraft-server/', 'Advancius-Network', '/vote'],
        URL: () => 'craft-list.net',
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hours: 24})
    },
    MinecraftServersListOrg: {
        voteURL: (project) => 'https://www.minecraft-servers-list.org/index.php?a=in&u=' + project.id,
        pageURL: (project) => 'https://www.minecraft-servers-list.org/details/' + project.id + '/',
        projectName: (doc) => doc.querySelector('div.card-header > h1').textContent.trim(),
        exampleURL: () => ['https://www.minecraft-servers-list.org/index.php?a=in&u=', 'chromity', ''],
        URL: () => 'minecraft-servers-list.org',
        parseURL: (url) => {
            const project = {}
            if (url.searchParams.has('u')) {
                project.id = url.searchParams.get('u')
            } else {
                const paths = url.pathname.split('/')
                project.id = paths[2]
            }
            return project
        }
    },
    ServerListe: {
        voteURL: (project) => 'https://serverliste.net/vote/' + project.id,
        pageURL: (project) => 'https://serverliste.net/vote/' + project.id,
        projectName: (doc) => doc.querySelector('.justify-content-center h3').textContent.trim(),
        exampleURL: () => ['https://serverliste.net/vote/', '775', ''],
        URL: () => 'serverliste.net',
        parseURL: (url) => ({id: url.pathname.split('/')[2]})
    },
    gTop100: {
        voteURL: (project) => 'https://gtop100.com/topsites/' + project.game + '/sitedetails/' + project.id + '?vote=1&pingUsername=' + project.nick,
        pageURL: (project) => 'https://gtop100.com/topsites/' + project.game + '/sitedetails/' + project.id + '?vote=1',
        projectName: (doc) => doc.querySelector('[itemprop="name"]').textContent.trim(),
        exampleURL: () => ['https://gtop100.com/topsites/MapleStory/sitedetails/', 'Ristonia--v224--98344', '?vote=1&pingUsername=kingcloudian'],
        URL: () => 'gtop100.com',
        parseURL: (url) => {
            const project = {}
            const paths = url.pathname.split('/')
            project.game = paths[2]
            project.id = paths[4]
            return project
        },
        exampleURLGame: () => ['https://gtop100.com/topsites/', 'MapleStory', '/sitedetails/Ristonia--v224--98344?vote=1&pingUsername=kingcloudian'],
        gameList: () => new Map([
            ['4Story', '4Story'],
            ['ACE-Online', 'ACE Online'],
            ['ARK-Survival-Evolved', 'ARK Survival Evolved'],
            ['Agario', 'Agario'],
            ['Aion-Online', 'Aion Online'],
            ['Allods-Online', 'Allods Online'],
            ['Battle-of-the-Immortals', 'Battle of the Immortals'],
            ['Black-Desert-Online', 'Black Desert Online'],
            ['Cabal-Online', 'Cabal Online'],
            ['Conquer-Online', 'Conquer Online'],
            ['Counter-Strike', 'Counter Strike'],
            ['Dekaron', 'Dekaron'],
            ['Dragon-Nest', 'Dragon Nest'],
            ['Dragonica-Online', 'Dragonica Online'],
            ['dungeon-fighter-online-private-servers', 'Dungeon Fighter Online'],
            ['Ether-Saga-Odyssey', 'Ether Saga Odyssey'],
            ['Flyff', 'Flyff'],
            ['Forsaken-World', 'Forsaken World'],
            ['Free-Online-Games', 'Free Online Games'],
            ['Grand-Chase', 'Grand Chase'],
            ['Habbo-Hotel', 'Habbo Hotel'],
            ['Helbreath', 'Helbreath'],
            ['Iris-Online', 'Iris Online'],
            ['Jade-Dynasty', 'Jade Dynasty'],
            ['Knight-Online', 'Knight Online'],
            ['Last-Chaos', 'Last Chaos'],
            ['Latale', 'Latale'],
            ['Legend-Of-Mir', 'Legend Of Mir'],
            ['Legends-of-Aria', 'Legends of Aria'],
            ['life-is-feudal-servers', 'Life is feudal'],
            ['Lineage-2', 'Lineage 2'],
            ['Luna-Online', 'Luna Online'],
            ['MMORPG-And-MPOG', 'MMORPG And MPOG'],
            ['MapleStory', 'MapleStory'],
            ['Metin2', 'Metin2'],
            ['Minecraft-Servers', 'Minecraft'],
            ['Mu-Online', 'Mu Online'],
            ['Ogame', 'Ogame'],
            ['Perfect-World', 'Perfect World'],
            ['Priston-Tale', 'Priston Tale'],
            ['RF-Online', 'RF Online'],
            ['Ragnarok-Online', 'Ragnarok Online'],
            ['RaiderZ-Online', 'RaiderZ Online'],
            ['Ran-Online', 'Ran Online'],
            ['Rappelz', 'Rappelz'],
            ['Rohan', 'Rohan'],
            ['Rose-Online', 'Rose Online'],
            ['Runes-of-Magic', 'Runes of Magic'],
            ['Runescape-private-server-top-100-list', 'Runescape'],
            ['Rust', 'Rust'],
            ['Rusty-Hearts', 'Rusty Hearts'],
            ['Seal-Online', 'Seal Online'],
            ['Shaiya', 'Shaiya'],
            ['Silkroad-Online', 'Silkroad Online'],
            ['Swordsman', 'Swordsman'],
            ['Tales-Of-Pirates', 'Tales Of Pirates'],
            ['Tera', 'Tera'],
            ['Terraria', 'Terraria'],
            ['Travian', 'Travian'],
            ['Ultima-Online', 'Ultima Online'],
            ['War-of-the-Immortals', 'War of the Immortals'],
            ['World-of-Warcraft', 'World of Warcraft']
        ])
    },
    WARGM: {
        voteURL: (project) => 'https://wargm.ru/server/' + project.id + '/votes',
        pageURL: (project) => 'https://wargm.ru/server/' + project.id,
        projectName: (doc) => doc.querySelector('#header h1').textContent,
        exampleURL: () => ['https://wargm.ru/server/', '23394', '/votes'],
        URL: () => 'wargm.ru',
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hours: 16}),
        notRequiredNick: () => true,
        banAttention: () => true,
        needAdditionalOrigins: ()=> ['*://*.steamcommunity.com/*']
    },
    MineStatus: {
        voteURL: (project) => 'https://minestatus.net/server/vote/' + project.id,
        pageURL: (project) => 'https://minestatus.net/server/' + project.id,
        projectName: (doc) => doc.querySelector('h1.section-title').textContent.trim(),
        exampleURL: () => ['https://minestatus.net/server/vote/', 'mine.sylphmc.com', ''],
        URL: () => 'minestatus.net',
        parseURL: (url) => ({id: url.pathname.split('/')[2] === 'vote' ? url.pathname.split('/')[3] : url.pathname.split('/')[2]}),
        timeout: () => ({hours: 24})
    },
    MisterLauncher: {
        voteURL: (project) => {
            if (project.game === 'projects') return 'https://oauth.vk.com/authorize?client_id=7636705&display=page&redirect_uri=https://misterlauncher.org/projects/' + project.id + '/&state=' + project.nick + '&response_type=code'
            else return 'https://misterlauncher.org/vote/' + project.id + '/'
        },
        pageURL: (project) => {
            if (project.game === 'projects') return 'https://misterlauncher.org/projects/' + project.id + '/'
            else return 'https://misterlauncher.org/vote/' + project.id + '/'
        },
        projectName: (doc, project) => {
            if (project.game === 'projects') return doc.querySelector('h1[itemprop="name"]').textContent.trim().replace('Проект ', '')
            else return doc.querySelector('.page-vote a').textContent
        },
        exampleURL: () => ['https://misterlauncher.org/projects/', 'omegamc', '/'],
        URL: () => 'misterlauncher.org',
        parseURL: (url) => ({game: url.pathname.split('/')[1] === 'projects' ? 'projects' : 'servers', id: url.pathname.split('/')[2]}),
        timeout: (project) => project.game === 'projects' ? ({hour: 21}) : ({hours: 24}),
        exampleURLGame: () => ['https://misterlauncher.org/', 'projects', '/omegamc/'],
        defaultGame: () => 'projects',
        gameList: () => new Map([
            ['projects', 'Проекты'],
            ['servers', 'Сервера (нет награды за голосование)']
        ]),
        silentVote: (project) => project.game === 'projects',
        notRequiredNick: (project) => project?.game === 'servers',
        notRequiredCaptcha: (project) => project?.game === 'projects',
        needAdditionalOrigins: (project)=> project?.game === 'projects' ? ['*://*.vk.com/*'] : []
    },
    MinecraftServersDe: {
        voteURL: (project) => 'https://minecraft-servers.de/server/' + project.id + '/vote',
        pageURL: (project) => 'https://minecraft-servers.de/server/' + project.id,
        projectName: (doc) => doc.querySelector('div.container h1').textContent,
        exampleURL: () => ['https://minecraft-servers.de/server/', 'twerion', '/vote'],
        URL: () => 'minecraft-servers.de',
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hours: 24})
    },
    DiscordBoats: {
        voteURL: (project) => 'https://discord.boats/bot/' + project.id + '/vote',
        pageURL: (project) => 'https://discord.boats/bot/' + project.id,
        projectName: (doc) => doc.querySelector('div.container h3 > span').textContent,
        exampleURL: () => ['https://discord.boats/bot/', '557628352828014614', '/vote'],
        URL: () => 'discord.boats',
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hours: 12}),
        notRequiredNick: () => true,
        needAdditionalOrigins: ()=> ['https://discord.com/oauth2/*']
    },
    ServerListGames: {
        voteURL: (project) => 'https://serverlist.games/vote/' + project.id,
        pageURL: (project) => 'https://serverlist.games/server/' + project.id,
        projectName: (doc) => doc.querySelector('div.card-title-server h5').textContent,
        exampleURL: () => ['https://serverlist.games/vote/', '2052', ''],
        URL: () => 'serverlist.games',
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hours: 20})
    },
    BestMinecraftServers: {
        voteURL: (project) => 'https://best-minecraft-servers.co/' + project.id + '/vote',
        pageURL: (project) => 'https://best-minecraft-servers.co/' + project.id,
        projectName: (doc) => doc.querySelector('table.info th').textContent.trim(),
        exampleURL: () => ['https://best-minecraft-servers.co/', 'server-hypixel-network.30', '/vote'],
        URL: () => 'best-minecraft-servers.co',
        parseURL: (url) => ({id: url.pathname.split('/')[1]})
    },
    MinecraftServers100: {
        voteURL: (project) => 'https://minecraftservers100.com/vote/' + project.id,
        pageURL: (project) => 'https://minecraftservers100.com/vote/' + project.id,
        projectName: (doc) => doc.querySelector('div.page-header').textContent.trim().replace('Vote for ', ''),
        exampleURL: () => ['https://minecraftservers100.com/vote/', '2340', ''],
        URL: () => 'minecraftservers100.com',
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hours: 24})
    },
    MCServerListCZ: {
        voteURL: (project) => 'https://mc-serverlist.cz/' + project.id + '/vote',
        pageURL: (project) => 'https://mc-serverlist.cz/' + project.id,
        projectName: (doc) => doc.querySelector('table.info th').textContent.trim(),
        exampleURL: () => ['https://mc-serverlist.cz/', 'server-lendmark.27', '/vote'],
        URL: () => 'mc-serverlist.cz',
        parseURL: (url) => ({id: url.pathname.split('/')[1]})
    },
    MineServers: {
        voteURL: (project) => 'https://' + project.game + '/server/' + project.id + '/vote',
        pageURL: (project) => 'https://' + project.game + '/server/' + project.id + '/vote',
        projectName: (doc) => doc.querySelector('#title h1').textContent,
        exampleURL: () => ['https://mineservers.com/server/', 'jvvHdPJy', '/vote'],
        URL: () => 'mineservers.com',
        parseURL: (url) => ({game: url.hostname, id: url.pathname.split('/')[2]}),
        timeout: () => ({hour: 0}),
        exampleURLGame: () => ['https://', 'mineservers.com', '/server/2zQ6UmWN/vote'],
        defaultGame: () => 'mineservers.com',
        gameList: () => new Map([
            ['mineservers.com', ''],
            ['pixelmonservers.com', ''],
            ['tekkitserverlist.com', ''],
            ['technicservers.com', ''],
            ['ftbservers.com', ''],
            ['attackofthebteamservers.com', '']
        ]),
        alertManualCaptcha: () => true
    },
    ATLauncher: {
        voteURL: (project) => 'https://atlauncher.com/servers/server/' + project.id + '/vote',
        pageURL: (project) => 'https://atlauncher.com/servers/server/' + project.id + '/vote',
        projectName: (doc) => doc.querySelector('ol li:nth-child(3)').textContent.trim(),
        exampleURL: () => ['https://atlauncher.com/servers/server/', 'KineticNetworkSkyfactory4', '/vote'],
        URL: () => 'atlauncher.com',
        parseURL: (url) => ({id: url.pathname.split('/')[3]}),
        timeout: () => ({hours: 24})
    },
    ServersMinecraft: {
        voteURL: (project) => 'https://servers-minecraft.net/' + project.id + '/vote',
        pageURL: (project) => 'https://servers-minecraft.net/' + project.id,
        projectName: (doc) => doc.querySelector('div.text-xl').textContent.trim(),
        exampleURL: () => ['https://servers-minecraft.net/', 'server-complex-gaming.58', '/vote'],
        URL: () => 'servers-minecraft.net',
        parseURL: (url) => ({id: url.pathname.split('/')[1]}),
        timeout: () => ({hour: 5})
    },
    MinecraftListCZ: {
        voteURL: (project) => 'https://www.minecraft-list.cz/server/' + project.id + '/vote',
        pageURL: (project) => 'https://www.minecraft-list.cz/server/' + project.id,
        projectName: (doc) => doc.querySelector('.card-body .text-center').textContent.trim(),
        exampleURL: () => ['https://www.minecraft-list.cz/server/', 'czech-survival', '/vote'],
        URL: () => 'minecraft-list.cz',
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hours: 2}),
        limitedCountVote: () => true
    },
    ListeServeursMinecraft: {
        voteURL: (project) => 'https://www.liste-serveurs-minecraft.org/vote/?idc=' + project.id,
        pageURL: (project) => 'https://www.liste-serveurs-minecraft.org/vote/?idc=' + project.id,
        projectName: (doc) => {
            if (doc.querySelector('span.wlt_shortcode_TITLE-NOLINK')) {
                doc.querySelector('span.wlt_shortcode_TITLE-NOLINK').textContent
            } else {
                doc.querySelector('#gdrtsvote font[color="blue"]').textContent
            }
        },
        exampleURL: () => ['https://www.liste-serveurs-minecraft.org/vote/?idc=', '202085', ''],
        URL: () => 'liste-serveurs-minecraft.org',
        parseURL: (url) => {
            const project = {}
            if (url.searchParams.has('idc')) {
                project.id = url.searchParams.get('idc')
            } else {
                project.id = url.pathname.split('/')[2]
            }
            return project
        },
        timeout: () => ({hours: 3}),
        notFound: (doc) => doc.querySelector('#core_middle_column div.panel-body') != null && doc.querySelector('#core_middle_column div.panel-body').textContent.includes('serveur est introuvable'),
        limitedCountVote: () => true
    },
    MCServidores: {
        voteURL: (project) => 'https://mcservidores.com/servidor/' + project.id,
        pageURL: (project) => 'https://mcservidores.com/servidor/' + project.id,
        projectName: (doc) => doc.querySelector('#panel h1').textContent.trim(),
        exampleURL: () => ['https://mcservidores.com/servidor/', '122', ''],
        URL: () => 'mcservidores.com',
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hours: 24}),
        oneProject: () => 1
    },
    XtremeTop100: {
        voteURL: (project) => 'https://www.xtremetop100.com/in.php?site=' + project.id,
        pageURL: (project) => 'https://www.xtremetop100.com/in.php?site=' + project.id,
        projectName: (doc) => doc.querySelector('#topbanner form[method="POST"] input[type="submit"]').value.replace('Vote for ', ''),
        exampleURL: () => ['https://www.xtremetop100.com/in.php?site=', '1132370645', ''],
        URL: () => 'xtremetop100.com',
        parseURL: (url) => {
            const project = {}
            if (url.searchParams.has('site')) {
                project.id = url.searchParams.get('site')
            } else {
                project.id = url.pathname.split('/')[1].replace('sitedetails-', '')
            }
            return project
        },
        notRequiredNick: () => true,
        alertManualCaptcha: () => true
    },
    MinecraftServerSk: {
        voteURL: (project) => 'https://minecraft-server.sk/' + project.id + '/vote',
        pageURL: (project) => 'https://minecraft-server.sk/' + project.id + '/vote',
        projectName: (doc) => doc.querySelector('.server.icon').parentElement.innerText.trim(),
        exampleURL: () => ['https://minecraft-server.sk/', 'server-luoend.52', '/vote'],
        URL: () => 'minecraft-server.sk',
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hours: 24})
    },
    ServeursMinecraftOrg: {
        voteURL: (project) => 'https://www.serveursminecraft.org/serveur/' + project.id + '/',
        pageURL: (project) => 'https://www.serveursminecraft.org/serveur/' + project.id + '/',
        projectName: (doc) => doc.querySelector('div.panel-heading b').textContent,
        exampleURL: () => ['https://www.serveursminecraft.org/serveur/', '1017', '/'],
        URL: () => 'serveursminecraft.org',
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hours: 24})
    },
    ServeursMCNet: {
        voteURL: (project) => 'https://serveurs-mc.net/serveur/' + project.id + '/voter',
        pageURL: (project) => 'https://serveurs-mc.net/serveur/' + project.id,
        projectName: (doc) => doc.querySelector('h1.text-center').textContent,
        exampleURL: () => ['https://serveurs-mc.net/serveur/', '82', '/voter'],
        URL: () => 'serveurs-mc.net',
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hours: 2}),
        limitedCountVote: () => true
    },
    ServeursMinecraftCom: {
        voteURL: (project) => 'https://serveur-minecraft.com/' + project.id,
        pageURL: (project) => 'https://serveur-minecraft.com/' + project.id,
        projectName: (doc) => doc.querySelector('div.title h1').textContent,
        exampleURL: () => ['https://serveur-minecraft.com/', '2908', ''],
        URL: () => 'serveur-minecraft.com',
        parseURL: (url) => ({id: url.pathname.split('/')[1]}),
        timeout: () => ({hours: 3}),
        limitedCountVote: () => true
    },
    ServeurMinecraftVoteFr: {
        voteURL: (project) => 'https://serveur-minecraft-vote.fr/serveurs/' + project.id + '/vote',
        pageURL: (project) => 'https://serveur-minecraft-vote.fr/serveurs/' + project.id + '/vote',
        projectName: (doc) => doc.querySelector('.server-name').textContent,
        exampleURL: () => ['https://serveur-minecraft-vote.fr/serveurs/', 'ectalia.425', '/vote'],
        URL: () => 'serveur-minecraft-vote.fr',
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hours: 1, minutes: 30}),
        limitedCountVote: () => true
    },
    MineBrowseCom: {
        voteURL: (project) => 'https://minebrowse.com/server/' + project.id,
        pageURL: (project) => 'https://minebrowse.com/server/' + project.id,
        projectName: (doc) => doc.querySelector('title').textContent.replace(' - Minebrowse Minecraft Server List', ''),
        exampleURL: () => ['https://minebrowse.com/server/', '1638', ''],
        URL: () => 'minebrowse.com',
        parseURL: (url) => ({id: url.pathname.split('/')[2]})
    },
    MCServerListCom: {
        voteURL: (project) => 'https://mc-server-list.com/server/' + project.id +'/vote/',
        pageURL: (project) => 'https://mc-server-list.com/server/' + project.id + '/',
        projectName: (doc) => doc.querySelector('h2.header').textContent,
        exampleURL: () => ['https://mc-server-list.com/server/', '127-Armageddon+Server', '/vote/'],
        URL: () => 'mc-server-list.com',
        parseURL: (url) => ({id: url.pathname.split('/')[2]})
    },
    ServerLocatorCom: {
        voteURL: (project) => 'https://serverlocator.com/vote/' + project.id,
        pageURL: (project) => 'https://serverlocator.com/server/' + project.id,
        projectName: (doc) => doc.querySelector('.content_head h2').textContent,
        exampleURL: () => ['https://serverlocator.com/vote/', '440', ''],
        URL: () => 'serverlocator.com',
        parseURL: (url) => ({id: url.pathname.split('/')[2]})
    },
    TopMmoGamesRu: {
        voteURL: (project) => 'https://top-mmogames.ru/' + project.id,
        pageURL: (project) => 'https://top-mmogames.ru/' + project.id,
        projectName: (doc) => doc.querySelector('.gamefeatures [itemprop="name"]').textContent,
        exampleURL: () => ['https://top-mmogames.ru/', 'server-wow-amdfun', ''],
        URL: () => 'top-mmogames.ru',
        parseURL: (url) => ({id: url.pathname.split('/')[1]}),
        needPrompt: () => true
    },
    MmoRpgTop: {
        voteURL: (project) => 'https://' + project.game +'.mmorpg.top/server/' + project.id,
        pageURL: (project) => 'https://' + project.game +'.mmorpg.top/server/' + project.id,
        projectName: (doc) => doc.querySelector('.title [itemprop="name"]').textContent,
        exampleURL: () => ['https://wow.mmorpg.top/server/', '23', ''],
        URL: () => 'mmorpg.top',
        parseURL: (url) => ({game: url.hostname.split('.')[0], id: url.pathname.split('/')[2]}),
        ordinalWorld: () => true,
        exampleURLGame: () => ['https://', 'wow', '.mmorpg.top/server/23'],
        gameList: () => new Map([
            ['l2', 'Lineage 2'],
            ['wow', 'World of Warcraft'],
            ['aion', 'Aion'],
            ['mu', 'MU Online'],
            ['jd', 'Jade Dynasty'],
            ['pw', 'Perfect World'],
            ['rf', 'RF Online'],
            ['so', 'Silkroad Online'],
            ['co', 'Conquer Online'],
            ['og', 'Other games']
        ])
    },
    MmoVoteRu: {
        voteURL: (project) => 'https://' + project.game +'.mmovote.ru/ru/vote/' + project.id,
        pageURL: (project) => 'https://' + project.game +'.mmovote.ru/ru/vote/' + project.id,
        projectName: (doc) => doc.querySelector('.content .box h2').textContent.replace('Голосование за ', ''),
        exampleURL: () => ['https://wow.mmovote.ru/ru/vote/', '85', ''],
        URL: () => 'mmovote.ru',
        parseURL: (url) => ({game: url.hostname.split('.')[0], id: url.pathname.split('/')[3]}),
        ordinalWorld: () => true,
        exampleURLGame: () => ['https://', 'wow', '.mmovote.ru/ru/vote/85'],
        gameList: () => new Map([
            ['wow', 'World of Warcraft'],
            ['l2', 'Lineage 2'],
            ['aion', 'Aion'],
            ['mu', 'MU Online'],
            ['rf', 'RF Online'],
            ['jade', 'Jade Dynasty'],
            ['games', 'Online Games'],
            ['pw', 'Perfect World'],
            ['minecraft', 'Minecraft']
        ])
    },
    McMonitoringInfo: {
        voteURL: (project) => {
            if (project.game === 'minecraft') {
                return 'https://mc-monitoring.info/server/vote/' + project.id
            } else {
                return 'https://mc-monitoring.info/' + project.game + '/server/vote/' + project.id
            }
        },
        pageURL: (project) => {
            if (project.game === 'minecraft') {
                return 'https://mc-monitoring.info/server/' + project.id
            } else {
                return 'https://mc-monitoring.info/' + project.game + '/server/' + project.id
            }
        },
        projectName: (doc) => doc.querySelector('.hello h1').textContent.replace('Игровой сервер ', ''),
        exampleURL: () => ['https://mc-monitoring.info/wow/server/vote/', '112', ''],
        URL: () => 'mc-monitoring.info',
        parseURL: (url) => {
            const project = {}
            const paths = url.pathname.split('/')
            if (paths[1] === 'server') {
                if (paths[2] === 'vote') {
                    project.id = paths[3]
                } else {
                    project.id = paths[2]
                }
                project.game = 'minecraft'
            } else {
                if (paths[3] === 'vote') {
                    project.id = paths[4]
                } else {
                    project.id = paths[3]
                }
                project.game = paths[1]
            }
            return project
        },
        exampleURLGame: () => ['https://mc-monitoring.info/', 'wow', '/server/vote/112'],
        gameList: () => new Map([
            ['wow', 'World of Warcraft'],
            ['l2', 'Lineage 2'],
            ['gta', 'GTA'],
            ['minecraft', 'Minecraft']
        ])
    },
    McServerTimeCom: {
        voteURL: (project) => 'https://mcservertime.com/' + project.id + '/vote',
        pageURL: (project) => 'https://mcservertime.com/' + project.id,
        projectName: (doc) => doc.querySelector('.server.icon').parentElement.innerText.trim(),
        exampleURL: () => ['https://mcservertime.com/', 'server-blastmc-asia.1399', '/vote'],
        URL: () => 'mcservertime.com',
        parseURL: (url) => ({id: url.pathname.split('/')[1]}),
        timeout: () => ({hours: 12})
    },
    ListeServeursFr: {
        voteURL: (project) => 'https://www.liste-serveurs.fr/' + project.id + '/vote',
        pageURL: (project) => 'https://www.liste-serveurs.fr/' + project.id,
        projectName: (doc) => doc.querySelector('.server.icon').parentElement.innerText.trim(),
        exampleURL: () => ['https://www.liste-serveurs.fr/', 'server-pixel-prime-serveur-pixelmon.512', '/vote'],
        URL: () => 'liste-serveurs.fr',
        parseURL: (url) => ({id: url.pathname.split('/')[1]}),
        timeout: () => ({hours: 3}),
        limitedCountVote: () => true
    },
    ServeurMinecraftFr: {
        voteURL: (project) => 'https://serveur-minecraft.fr/' + project.id + '/vote',
        pageURL: (project) => 'https://serveur-minecraft.fr/' + project.id,
        projectName: (doc) => doc.querySelector('.server.icon').parentElement.innerText.trim(),
        exampleURL: () => ['https://serveur-minecraft.fr/', 'server-oneblock-farm2win.525', '/vote'],
        URL: () => 'serveur-minecraft.fr',
        parseURL: (url) => ({id: url.pathname.split('/')[1]}),
        alertManualCaptcha: () => true
    },
    MineServTop: {
        voteURL: (project) => 'https://mineserv.top/' + project.id,
        pageURL: (project) => 'https://mineserv.top/' + project.id,
        projectName: (doc) => doc.querySelector('.project-name h1').textContent,
        exampleURL: () => ['https://mineserv.top/', 'epserv', ''],
        URL: () => 'mineserv.top',
        parseURL: (url) => ({id: url.pathname.split('/')[1]})
    },
    Top100ArenaCom: {
        voteURL: (project) => 'https://www.top100arena.com/listing/' + project.id + '/vote',
        pageURL: (project) => 'https://www.top100arena.com/listing/' + project.id + '/vote',
        projectName: (doc) => doc.querySelector('.container.text-center h1.h2').textContent,
        exampleURL: () => ['https://www.top100arena.com/listing/', '94246', '/vote'],
        URL: () => 'top100arena.com',
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        notRequiredNick: () => true
    },
    MinecraftBestServersCom: {
        voteURL: (project) => 'https://minecraftbestservers.com/' + project.id + '/vote',
        pageURL: (project) => 'https://minecraftbestservers.com/' + project.id,
        projectName: (doc) => doc.querySelector('header div.container h1.text-center').textContent.replace(' Minecraft Server Info, Voting, and More', ''),
        exampleURL: () => ['https://minecraftbestservers.com/', 'server-cherry-survival.4599', '/vote'],
        URL: () => 'minecraftbestservers.com',
        parseURL: (url) => ({id: url.pathname.split('/')[1]}),
        timeout: () => ({hour: 0})
    },
    MCLikeCom: {
        voteURL: (project) => 'https://mclike.com/vote-' + project.id,
        pageURL: (project) => 'https://mclike.com/minecraft-server-' + project.id,
        projectName: (doc) => doc.querySelector('div.text-server > h1').textContent.replace('Minecraft server ', ''),
        exampleURL: () => ['https://mclike.com/vote-', '188444', ''],
        URL: () => 'mclike.com',
        parseURL: (url) => {
            const project = {}
            project.id = url.pathname.split('/')[1]
            project.id = project.id.replace('vote-', '')
            project.id = project.id.replace('minecraft-server-', '')
            return project
        },
        oneProject: () => 1
    },
    PixelmonServerListCom: {
        voteURL: (project) => 'https://pixelmon-server-list.com/server/' + project.id + '/vote',
        pageURL: (project) => 'https://pixelmon-server-list.com/server/' + project.id,
        projectName: (doc) => doc.querySelector('.page-header h1').textContent,
        exampleURL: () => ['https://pixelmon-server-list.com/server/', '181', '/vote'],
        URL: () => 'pixelmon-server-list.com',
        parseURL: (url) => ({id: url.pathname.split('/')[2]})
    },
    MinecraftServerSk2: {
        voteURL: (project) => 'https://www.minecraftserver.sk/server/' + project.id + '/',
        pageURL: (project) => 'https://www.minecraftserver.sk/server/' + project.id + '/',
        projectName: (doc) => doc.querySelector('.panel-body h3').innerText.trim(),
        exampleURL: () => ['https://www.minecraftserver.sk/server/', 'minicraft-cz-6', '/'],
        URL: () => 'minecraftserver.sk',
        parseURL: (url) => ({id: url.pathname.split('/')[2]})
    },
    ServidoresdeMinecraftEs: {
        voteURL: (project) => 'https://servidoresdeminecraft.es/server/vote/' + project.id,
        pageURL: (project) => 'https://servidoresdeminecraft.es/server/status/' + project.id,
        projectName: (doc) => doc.querySelector('.server-header h1').textContent,
        exampleURL: () => ['https://servidoresdeminecraft.es/server/vote/', 'gRQ7HvE8/play.minelatino.com', ''],
        URL: () => 'servidoresdeminecraft.es',
        parseURL: (url) => ({id: url.pathname.split('/')[3] + '/' + url.pathname.split('/')[4]})
    },
    MinecraftSurvivalServersCom: {
        voteURL: (project) => 'https://minecraftsurvivalservers.com/vote/' + project.id,
        pageURL: (project) => 'https://minecraftsurvivalservers.com/server/' + project.id,
        projectName: () => {
            // Хрень какая-то, в fetch запросе отсылается не страница а предзагрузка
            // return doc.querySelector('div.items-center > span.text-xl.font-semibold').textContent.trim()
            return ''
        },
        exampleURL: () => ['https://minecraftsurvivalservers.com/vote/', '248-rede-revo', ''],
        URL: () => 'minecraftsurvivalservers.com',
        parseURL: (url) => ({id: url.pathname.split('/')[2]})
    },
    MinecraftGlobal: {
        voteURL: (project) => 'https://minecraft.global/server/' + project.id + '/vote',
        pageURL: (project) => 'https://minecraft.global/server/' + project.id,
        projectName: (doc) => doc.querySelector('h1').textContent,
        exampleURL: () => ['https://minecraft.global/server/', '8', '/vote'],
        URL: () => 'minecraft.global',
        parseURL: (url) => ({id: url.pathname.split('/')[2]})
    },
    Warface: {
        voteURL: () => 'https://ru.warface.com/bonus/',
        pageURL: () => 'https://ru.warface.com/bonus/',
        projectName: () => 'Bonus',
        exampleURL: () => ['https://ru.warface.com/bonus/', '', ''],
        URL: () => 'warface.com',
        parseURL: () => ({id: 'bonus'}),
        timeout: () => ({week: 3, hour: 13}),
        notRequiredCaptcha: () => true,
        notRequiredNick: () => true,
        notRequiredId: () => true
    },
    CurseForge: {
        voteURL: (project) => 'https://www.curseforge.com/servers/minecraft/game/' + project.id + '/vote',
        pageURL: (project) => 'https://www.curseforge.com/servers/minecraft/game/' + project.id + '/',
        projectName: (doc) => doc.querySelector('title').textContent.replaceAll(' - The Best Minecraft Servers - CurseForge', ''),
        exampleURL: () => ['https://www.curseforge.com/servers/minecraft/game/', 'lemoncloud', '/vote'],
        URL: () => 'curseforge.com',
        parseURL: (url) => ({id: url.pathname.split('/')[4]})
    },
    HoYoLAB: {
        voteURL: (project) => {
            if (!project.id || project.id === 'genshin impact daily') {
                return 'https://act.hoyolab.com/ys/event/signin-sea-v3/index.html?act_id=e202102251931481&lang=en-us'
            } else {
                return 'https://act.hoyolab.com/bbs/event/signin/hkrpg/index.html?act_id=e202303301540311&lang=en-us'
            }
        },
        pageURL: (project) => {
            if (!project.id || project.id === 'genshin impact daily') {
                return 'https://act.hoyolab.com/ys/event/signin-sea-v3/index.html?act_id=e202102251931481&lang=en-us'
            } else {
                return 'https://act.hoyolab.com/bbs/event/signin/hkrpg/index.html?act_id=e202303301540311&lang=en-us'
            }
        },
        projectName: (doc, project) => {
            if (!project.id || project.id === 'genshin impact daily') {
                return 'Genshin Impact Daily check-in'
            } else {
                return 'Honkai: Star Rail Daily check-in'
            }
        },
        exampleURL: () => ['https://act.hoyolab.com/ys/event/signin-sea-v3/index.html?act_id=e202102251931481&lang=en-us', '', ''],
        URL: () => 'hoyolab.com',
        parseURL: (url) => {
            if (url.searchParams.get('act_id') === 'e202303301540311') {
                return {id: 'honkai star rail daily'}
            } else if (url.searchParams.get('act_id') === 'e202102251931481') {
                return {id: 'genshin impact daily'}
            } else {
                return {}
            }
        },
        timeout: () => ({hour: 16}),
        silentVote: () => true,
        notRequiredCaptcha: () => true,
        notRequiredNick: () => true
    },
    TrackingServers: {
        voteURL: (project) => 'https://trackingservers.cloud/server/vote/' + project.id,
        pageURL: (project) => 'https://trackingservers.cloud/server/' + project.id,
        projectName: (doc) => doc.querySelector('th.rank').innerText.trim(),
        exampleURL: () => ['https://trackingservers.cloud/server/vote/', 'dcgaming-network', ''],
        URL: () => 'trackingservers.cloud',
        parseURL: (url) => {
            const project = {}
            const paths = url.pathname.split('/')
            if (paths[2] === 'vote') {
                project.id = paths[3]
            } else {
                project.id = paths[2]
            }
            return project
        }
    },
    McListIo: {
        voteURL: (project) => 'https://mclist.io/server/' + project.id + '/vote',
        pageURL: (project) => 'https://mclist.io/server/' + project.id,
        projectName: (doc) => doc.querySelector('title').textContent.replaceAll(' | mclist.io - Minecraft Server List', ''),
        exampleURL: () => ['https://mclist.io/server/', '61609', '/vote'],
        URL: () => 'mclist.io',
        parseURL: (url) => ({id: url.pathname.split('/')[2]})
    },
    LoliLand: {
        voteURL: () => 'https://loliland.ru/bonus',
        pageURL: () => 'https://loliland.ru/bonus',
        projectName: () => 'Бонус за подписку',
        exampleURL: () => ['https://loliland.ru/bonus', '', ''],
        URL: () => 'loliland.ru',
        parseURL: () => ({id: 'bonus subscribe'}),
        timeout: () => ({
            hours: 24,
            minutes: 1 // TODO 1-на минутная задержка так как LoliLand не умеет считать правильно 24 часа
        }),
        silentVote: () => true,
        notRequiredCaptcha: () => true,
        notRequiredNick: () => true,
        notRequiredId: () => true,
        needAdditionalPermissions: () => ['cookies']
    },
    MCServersTOP: {
        voteURL: (project) => 'https://mcservers.top/server/' + project.id,
        pageURL: (project) => 'https://mcservers.top/server/' + project.id,
        projectName: (doc) => doc.querySelector('h1[itemprop="name"]').textContent,
        exampleURL: () => ['https://mcservers.top/server/', '1113', ''],
        URL: () => 'mcservers.top',
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        needPrompt: () => true,
        notRequiredCaptcha: () => true
    },
    Discadia: {
        voteURL: (project) => 'https://discadia.com/vote/' + project.id + '/',
        pageURL: (project) => 'https://discadia.com/server/' + project.id + '/',
        projectName: (doc) => doc.querySelector('section.items-center > h1').textContent,
        exampleURL: () => ['https://discadia.com/server/', 'rq6-valorant-boost', '/'],
        URL: () => 'discadia.com',
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hours: 24}), // https://discord.com/channels/371699266747629568/760393040174120990/1099781014206820352
        oneProject: () => 1,
        notRequiredNick: () => true,
        notRequiredCaptcha: () => true,
        needAdditionalOrigins: ()=> ['https://discord.com/oauth2/*']
    },
    MinecraftSurvivalServers: {
        voteURL: (project) => 'https://minecraftsurvivalservers.net/server/' + project.id + '/vote',
        pageURL: (project) => 'https://minecraftsurvivalservers.net/server/' + project.id,
        projectName: (doc) => doc.querySelector('h1.large.header').textContent.replaceAll(' Minecraft Server', ''),
        exampleURL: () => ['https://minecraftsurvivalservers.net/server/', '64', '/vote'],
        URL: () => 'minecraftsurvivalservers.net',
        parseURL: (url) => ({id: url.pathname.split('/')[2]})
    },
    TopServersCom: {
        voteURL: (project) => 'https://topservers.com/' + project.id + '#vote',
        pageURL: (project) => 'https://topservers.com/' + project.id,
        projectName: (doc) => doc.querySelector('h1[itemprop="name"]').textContent,
        exampleURL: () => ['https://topservers.com/', 'minecraft-server-hypixel.3368', '#vote'],
        URL: () => 'topservers.com',
        parseURL: (url) => ({id: url.pathname.split('/')[1]})
    },
    GenshinDrop: {
        voteURL: () => 'https://genshindrop.com/case/24-chasa-oskolki',
        pageURL: () => 'https://genshindrop.com/case/24-chasa-oskolki',
        projectName: () => 'Бесплатный кейс 24 часа от Катерины',
        exampleURL: () => ['https://genshindrop.com/', 'case/24-chasa-oskolki', ''],
        URL: () => 'genshindrop.com',
        parseURL: () => ({id: '24hcasekaterina'}),
        timeout: () => ({hours: 24}),
        silentVote: () => true,
        notRequiredCaptcha: () => true,
        notRequiredNick: () => true,
        notRequiredId: () => true
    },
    EmeraldServers: {
        voteURL: (project) => 'https://emeraldservers.com/server/' + project.id,
        pageURL: (project) => 'https://emeraldservers.com/server/' + project.id,
        projectName: (doc) => doc.querySelector('.infobar2 h1').innerText.trim(),
        exampleURL: () => ['https://emeraldservers.com/server/', '595', ''],
        URL: () => 'emeraldservers.com',
        parseURL: (url) => ({id: url.pathname.split('/')[2]})
    },
    ServidoresMC: {
        voteURL: (project) => 'https://www.40servidoresmc.es/' + project.id + '-votar',
        pageURL: (project) => 'https://www.40servidoresmc.es/' + project.id,
        projectName: (doc) => doc.querySelector('div.caracteristicas div.tabla-head h2').innerText.trim(),
        exampleURL: () => ['https://www.40servidoresmc.es/', 'astraly', '-votar'],
        URL: () => '40servidoresmc.es',
        parseURL: (url) => ({id: url.pathname.split('/')[1].replaceAll('-votar', '')})
    },
    MinecraftServersBiz2: {
        voteURL: (project) => 'https://minecraft-servers.biz/server/' + project.id + '/vote/',
        pageURL: (project) => 'https://minecraft-servers.biz/server/' + project.id + '/',
        projectName: (doc) => doc.querySelector('div[itemprop="name"]').innerText.trim(),
        exampleURL: () => ['https://minecraft-servers.biz/server/', 'roleplay-hub-schoolrp', '/vote/'],
        URL: () => 'minecraft-servers.biz',
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hour: 22}),
        alertManualCaptcha: () => true,
        optionalNick: () => true
    },
    TopMCServersNet: {
        voteURL: (project) => 'https://top-mc-servers.net/server/' + project.id,
        pageURL: (project) => 'https://top-mc-servers.net/server/' + project.id,
        projectName: (doc) => doc.querySelector('.container h1.ibmpm').innerText.trim(),
        exampleURL: () => ['https://top-mc-servers.net/server/', '5', ''],
        URL: () => 'top-mc-servers.net',
        parseURL: (url) => ({id: url.pathname.split('/')[2]})
    },
    MinecraftServerListCom: {
        voteURL: (project) => 'https://minecraft-serverlist.com/server/' + project.id + '/vote',
        pageURL: (project) => 'https://minecraft-serverlist.com/server/' + project.id,
        projectName: (doc) => doc.querySelector('h1.server-page__title').innerText.trim(),
        exampleURL: () => ['https://minecraft-serverlist.com/server/', '517', '/vote'],
        URL: () => 'minecraft-serverlist.com',
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        oneProject: () => 3
    },
    // Похоже на копию ServerListGames, как минимум по технической части схоже
    FindMCServer: {
        voteURL: (project) => 'https://findmcserver.com/server/' + project.id,
        pageURL: (project) => 'https://findmcserver.com/server/' + project.id,
        projectName: () => null, // сайт-конструктор, отдаёт пустую страницу со скриптами на загрузку, название достать слишком сложно
        exampleURL: () => ['https://findmcserver.com/server/', 'sootmc', ''],
        URL: () => 'findmcserver.com',
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        notRequiredCaptcha: () => true
    },
    ServeurListe: {
        voteURL: (project) => 'https://www.serveurliste.com/' + project.game + '/' + project.id,
        pageURL: (project) => 'https://www.serveurliste.com/' + project.game + '/' + project.id + '#voter',
        projectName: (doc) => doc.querySelector('div.container h1.text-center').innerText,
        exampleURL: () => ['https://www.serveurliste.com/minecraft/', 'nossaria-serveur-survie', '#voter'],
        URL: () => 'serveurliste.com',
        parseURL: (url) => ({game: url.pathname.split('/')[1], id: url.pathname.split('/')[2]}),
        exampleURLGame: () => ['https://www.serveurliste.com/', 'minecraft', '/nossaria-serveur-survie#voter'],
        defaultGame: () => 'minecraft',
        gameList: () => new Map([
            ['minecraft', 'Minecraft'],
            ['rust', 'Rust'],
            ['fivem', 'fiveM'],
            ['flyff', 'Flyff'],
            ['discord', 'Discord'],
            ['garrys-mod', 'Garry\'s Mod']
        ]),
        oneProject: () => 1
    },
    Custom: {
        voteURL: (project) => project.responseURL,
        pageURL: (project) => project.responseURL,
        projectName: () => '',
        exampleURL: () => ['', '', ''],
        URL: () => 'Custom',
        parseURL: () => ({}),
        silentVote: () => true,
        notRequiredCaptcha: () => true
    }
}

var projectByURL = new Map([
    ['topcraft.ru', 'TopCraft'],
    ['mctop.su', 'McTOP'],
    ['mcrate.su', 'MCRate'],
    ['minecraftrating.ru', 'MinecraftRating'],
    ['monitoringminecraft.ru', 'MonitoringMinecraft'],
    ['ionmc.top', 'IonMc'],
    ['minecraftservers.org', 'MinecraftServersOrg'],
    ['serveur-prive.net', 'ServeurPrive'],
    ['planetminecraft.com', 'PlanetMinecraft'],
    ['topg.org', 'TopG'],
    ['listforge.net', 'ListForge'],
    ['7daystodie-servers.com', 'ListForge'],
    ['ark-servers.net', 'ListForge'],
    ['arma3-servers.net', 'ListForge'],
    ['atlas-servers.io', 'ListForge'],
    ['conan-exiles.com', 'ListForge'],
    ['counter-strike-servers.net', 'ListForge'],
    ['cubeworld-servers.com', 'ListForge'],
    ['dayz-servers.org', 'ListForge'],
    ['ecoservers.io', 'ListForge'],
    ['empyrion-servers.com', 'ListForge'],
    ['gmod-servers.com', 'ListForge'],
    ['hurtworld-servers.net', 'ListForge'],
    ['hytale-servers.io', 'ListForge'],
    ['life-is-feudal.org', 'ListForge'],
    ['minecraft-mp.com', 'ListForge'],
    ['minecraftpocket-servers.com', 'ListForge'],
    ['minecraft-tracker.com', 'ListForge'],
    ['miscreated-servers.com', 'ListForge'],
    ['reign-of-kings.net', 'ListForge'],
    ['rust-servers.net', 'ListForge'],
    ['space-engineers.com', 'ListForge'],
    ['squad-servers.com', 'ListForge'],
    ['starbound-servers.net', 'ListForge'],
    ['tf2-servers.com', 'ListForge'],
    ['teamspeak-servers.org', 'ListForge'],
    ['terraria-servers.com', 'ListForge'],
    ['unturned-servers.net', 'ListForge'],
    ['vrising-servers.net', 'ListForge'],
    ['valheim-servers.io', 'ListForge'],
    ['wurm-unlimited.com', 'ListForge'],
    ['minecraft-server-list.com', 'MinecraftServerList'],
    ['serverpact.com', 'ServerPact'],
    ['serverpact.nl', 'ServerPact'],
    ['minecraftserverlijst.nl', 'ServerPact'],
    ['minecraftserverlist.eu', 'ServerPact'],
    ['minecraftiplist.com', 'MinecraftIpList'],
    ['topminecraftservers.org', 'TopMinecraftServers'],
    ['minecraftservers.biz', 'MinecraftServersBiz'],
    ['hotmc.ru', 'HotMC'],
    ['minecraft-server.net', 'MinecraftServerNet'],
    ['top-games.net', 'TopGames'],
    ['top-serveurs.net', 'TopGames'],
    ['tmonitoring.com', 'TMonitoring'],
    ['top.gg', 'TopGG'],
    ['discordbotlist.com', 'DiscordBotList'],
    ['discords.com', 'Discords'],
    ['mmotop.ru', 'MMoTopRU'],
    ['mc-servers.com', 'MCServers'],
    ['minecraftlist.org', 'MinecraftList'],
    ['minecraft-index.com', 'MinecraftIndex'],
    ['serverlist101.com', 'ServerList101'],
    ['mcserver-list.eu', 'MCServerList'],
    ['craftlist.org', 'CraftList'],
    ['czech-craft.eu', 'CzechCraft'],
    ['minecraft.buzz', 'MinecraftBuzz'],
    ['minecraftservery.eu', 'MinecraftServery'],
    ['rpg-paradize.com', 'RPGParadize'],
    ['minecraft-serverlist.net', 'MinecraftServerListNet'],
    ['minecraft-server.eu', 'MinecraftServerEu'],
    ['minecraft-news.net', 'MinecraftKrant'],
    ['minecraftkrant.nl', 'MinecraftKrant'],
    ['trackyserver.com', 'TrackyServer'],
    ['mc-lists.org', 'MCListsOrg'],
    ['topmcservers.com', 'TopMCServersCom'],
    ['bestservers.com', 'BestServersCom'],
    ['craft-list.net', 'CraftListNet'],
    ['minecraft-servers-list.org', 'MinecraftServersListOrg'],
    ['serverliste.net', 'ServerListe'],
    ['gtop100.com', 'gTop100'],
    ['wargm.ru', 'WARGM'],
    ['minestatus.net', 'MineStatus'],
    ['misterlauncher.org', 'MisterLauncher'],
    ['minecraft-servers.de', 'MinecraftServersDe'],
    ['discord.boats', 'DiscordBoats'],
    ['serverlist.games', 'ServerListGames'],
    ['best-minecraft-servers.co', 'BestMinecraftServers'],
    ['minecraftservers100.com', 'MinecraftServers100'],
    ['mc-serverlist.cz', 'MCServerListCZ'],
    ['mineservers.com', 'MineServers'],
    ['pixelmonservers.com', 'MineServers'],
    ['tekkitserverlist.com', 'MineServers'],
    ['technicservers.com', 'MineServers'],
    ['ftbservers.com', 'MineServers'],
    ['attackofthebteamservers.com', 'MineServers'],
    ['atlauncher.com', 'ATLauncher'],
    ['servers-minecraft.net', 'ServersMinecraft'],
    ['minecraft-list.cz', 'MinecraftListCZ'],
    ['liste-serveurs-minecraft.org', 'ListeServeursMinecraft'],
    ['mcservidores.com', 'MCServidores'],
    ['xtremetop100.com', 'XtremeTop100'],
    ['minecraft-server.sk', 'MinecraftServerSk'],
    ['serveursminecraft.org', 'ServeursMinecraftOrg'],
    ['serveurs-mc.net', 'ServeursMCNet'],
    ['serveur-minecraft.com', 'ServeursMinecraftCom'],
    ['serveur-minecraft-vote.fr', 'ServeurMinecraftVoteFr'],
    ['minebrowse.com', 'MineBrowseCom'],
    ['mc-server-list.com', 'MCServerListCom'],
    ['serverlocator.com', 'ServerLocatorCom'],
    ['top-mmogames.ru', 'TopMmoGamesRu'],
    ['mmorpg.top', 'MmoRpgTop'],
    ['mmovote.ru', 'MmoVoteRu'],
    ['mc-monitoring.info', 'McMonitoringInfo'],
    ['mcservertime.com', 'McServerTimeCom'],
    ['liste-serveurs.fr', 'ListeServeursFr'],
    ['serveur-minecraft.fr', 'ServeurMinecraftFr'],
    ['mineserv.top', 'MineServTop'],
    ['top100arena.com', 'Top100ArenaCom'],
    ['minecraftbestservers.com', 'MinecraftBestServersCom'],
    ['mclike.com', 'MCLikeCom'],
    ['pixelmon-server-list.com', 'PixelmonServerListCom'],
    ['minecraftserver.sk', 'MinecraftServerSk2'],
    ['servidoresdeminecraft.es', 'ServidoresdeMinecraftEs'],
    ['minecraftsurvivalservers.com', 'MinecraftSurvivalServersCom'],
    ['minecraft.global', 'MinecraftGlobal'],
    ['warface.com', 'Warface'],
    ['curseforge.com', 'CurseForge'],
    ['hoyolab.com', 'HoYoLAB'],
    ['trackingservers.cloud', 'TrackingServers'],
    ['mclist.io', 'McListIo'],
    ['loliland.ru', 'LoliLand'],
    ['mcservers.top', 'MCServersTOP'],
    ['discadia.com', 'Discadia'],
    ['minecraftsurvivalservers.net', 'MinecraftSurvivalServers'],
    ['topservers.com', 'TopServersCom'],
    ['genshindrop.com', 'GenshinDrop'],
    ['emeraldservers.com', 'EmeraldServers'],
    ['40servidoresmc.es', 'ServidoresMC'],
    ['minecraft-servers.biz', 'MinecraftServersBiz2'],
    ['top-mc-servers.net', 'TopMCServersNet'],
    ['minecraft-serverlist.com', 'MinecraftServerListCom'],
    ['findmcserver.com', 'FindMCServer'],
    ['serveurliste.com', 'ServeurListe'],
    ['Custom', 'Custom']
])

const getDomainWithoutSubdomain = url => {
    const urlParts = new URL(url).hostname.split('.')

    return urlParts
        .slice(0)
        .slice(-(urlParts.length === 4 ? 3 : 2))
        .join('.')
}

function extractHostname(url) {
    let hostname
    //find & remove protocol (http, ftp, etc.) and get hostname

    if (url.indexOf('//') > -1) {
        hostname = url.split('/')[2]
    } else {
        hostname = url.split('/')[0]
    }

    //find & remove port number
    hostname = hostname.split(':')[0]
    //find & remove '?'
    hostname = hostname.split('?')[0]

    return hostname
}

// Удалённая конфигурация расширения
if (typeof db !== 'undefined' && typeof settings !== 'undefined' && settings.disabledNotifStart != null && !settings.disabledSendErrorSentry && (settings.enabledReportTimeout || !settings.enabledReportTooManyAttempts)) {
    settings.enabledReportTimeout = false
    settings.enabledReportTooManyAttempts = true
    db.put('other', settings, 'settings')
}