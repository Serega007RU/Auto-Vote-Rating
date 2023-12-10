//Список рейтингов
// noinspection JSUnusedGlobalSymbols,ES6ConvertVarToLetConst,SpellCheckingInspection,HttpUrlsUsage

var allProjects = {
    'topcraft.ru': {
        pageURL: (project) => 'https://topcraft.club/servers/' + project.id + '/',
        voteURL: (project) => 'https://topcraft.club/servers/' + project.id + '/',
        projectName: (doc) => doc.querySelector('.project-header > h1').textContent,
        exampleURL: () => ['https://topcraft.club/servers/', '10496', '/'],
        URLMain: () => 'topcraft.ru',
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hour: 21}),
        needAdditionalOrigins: ()=> ['https://*.topcraft.ru/*', '*://*.vk.com/*']
    },
    'topcraft.club': {},
    'mctop.su': {
        pageURL: (project) => 'https://mctop.su/servers/' + project.id + '/',
        voteURL: (project) => 'https://mctop.su/servers/' + project.id + '/',
        projectName: (doc) => doc.querySelector('.project-header > h1').textContent,
        exampleURL: () => ['https://mctop.su/servers/', '5231', '/'],
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hour: 21}),
        needAdditionalOrigins: ()=> ['*://*.vk.com/*']
    },
    'mcrate.su': {
        pageURL: (project) => 'http://mcrate.su/project/' + project.id,
        voteURL: (project) => 'http://mcrate.su/rate/' + project.id,
        projectName: (doc) => doc.querySelector('#center-main > .top_panel > h1').textContent,
        exampleURL: () => ['http://mcrate.su/rate/', '4396', ''],
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hour: 22}),
        oneProject: () => 1,
        notFound: (doc) => doc.querySelector('div[class=error]') != null && doc.querySelector('div[class=error]').textContent.includes('Проект с таким ID не найден'),
        needAdditionalOrigins: ()=> ['*://*.vk.com/*']
    },
    'minecraftrating.ru': {
        pageURL: (project) => (project.listing === 'projects') ? 'https://minecraftrating.ru/projects/' + project.id + '/' : 'https://minecraftrating.ru/vote/' + project.id + '/',
        voteURL: (project) => (project.listing === 'projects') ? 'https://minecraftrating.ru/projects/' + project.id + '/' : 'https://minecraftrating.ru/vote/' + project.id + '/',
        projectName: (doc, project) => (project.listing === 'projects') ? doc.querySelector('h1[itemprop="name"]').textContent.trim().replace('Проект ', '') : doc.querySelector('.page-header a').textContent,
        exampleURL: () => ['https://minecraftrating.ru/projects/', 'cubixworld', '/'],
        parseURL: (url) => ({listing: url.pathname.split('/')[1] === 'projects' ? 'projects': 'servers', id: url.pathname.split('/')[2]}),
        timeout: (project) => project.listing === 'projects' ? ({hour: 21}) : ({hours: 24}),
        exampleURLListing: () => ['https://minecraftrating.ru/', 'projects', '/mcskill/'],
        defaultListing: () => 'projects',
        listingList: () => new Map([
            ['projects', 'Проекты'],
            ['servers', 'Сервера (нет награды за голосование)']
        ]),
        notRequiredNick: (project) => project?.listing === 'servers',
        needAdditionalOrigins: (project)=> project?.listing === 'projects' ? ['*://*.vk.com/*'] : []
    },
    'monitoringminecraft.ru': {
        pageURL: (project) => 'https://monitoringminecraft.ru/top/' + project.id + '/',
        voteURL: (project) => 'https://monitoringminecraft.ru/top/' + project.id + '/vote',
        projectName: (doc) => doc.querySelector('#cap h1').textContent,
        exampleURL: () => ['https://monitoringminecraft.ru/top/', 'gg', '/vote'],
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hour: 21}),
        notRequiredCaptcha: () => true,
        needAdditionalOrigins: () => ['*://*.vk.com/*'],
        needAdditionalPermissions: () => ['cookies']
    },
    'ionmc.top': {
        pageURL: (project) => 'https://ionmc.top/projects/' + project.id + '/vote',
        voteURL: (project) => 'https://ionmc.top/projects/' + project.id + '/vote',
        projectName: (doc) => doc.querySelector('#app h1.header').innerText.replace('Голосование за проект ', ''),
        exampleURL: () => ['https://ionmc.top/projects/', '80', '/vote'],
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hour: 21})
    },
    'minecraftservers.org': {
        pageURL: (project) => 'https://minecraftservers.org/server/' + project.id,
        voteURL: (project) => 'https://minecraftservers.org/vote/' + project.id,
        projectName: (doc) => doc.querySelector('div.header-bar div.text').innerText,
        exampleURL: () => ['https://minecraftservers.org/vote/', '25531', ''],
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hour: 0})
    },
    'serveur-prive.net': {
        pageURL: (project) => 'https://serveur-prive.net/' + (project.lang === 'fr' ? '' : project.lang + '/') + project.game + '/' + project.id + '/vote',
        voteURL: (project) => 'https://serveur-prive.net/' + (project.lang === 'fr' ? '' : project.lang + '/') + project.game + '/' + project.id + '/vote',
        projectName: (doc) => doc.querySelector('.description h2').textContent,
        exampleURL: () => ['https://serveur-prive.net/minecraft/', 'gommehd-net-4932', '/vote'],
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
        alertManualCaptcha: () => true,
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
    'planetminecraft.com': {
        pageURL: (project) => 'https://www.planetminecraft.com/server/' + project.id + '/',
        voteURL: (project) => 'https://www.planetminecraft.com/server/' + project.id + '/vote/',
        projectName: (doc) => doc.querySelector('#resource-title-text').textContent,
        exampleURL: () => ['https://www.planetminecraft.com/server/', 'legends-evolved', '/vote/'],
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hour: 5})
    },
    'topg.org': {
        pageURL: (project) => 'https://topg.org/' + project.game + '/' + project.id,
        voteURL: (project) => 'https://topg.org/' + project.game + '/' + project.id,
        projectName: (doc) => doc.querySelector('div.sheader').textContent,
        exampleURL: () => ['https://topg.org/minecraft-servers/', 'server-405637', ''],
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
    'listforge.net': {
        pageURL: (project) => 'https://' + project.game + '/server/' + project.id + '/vote/',
        voteURL: (project) => 'https://' + project.game + '/server/' + project.id + '/vote/' + (project.addition != null ? project.addition : ''),
        projectName: (doc) => doc.querySelector('head > title').textContent.replace('Vote for ', ''),
        exampleURL: () => ['https://minecraft-mp.com/server/', '81821', '/vote/'],
        URLMain: () => 'listforge.net',
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
    'ark-servers.net': {},
    'arma3-servers.net': {},
    'atlas-servers.io': {},
    'conan-exiles.com': {},
    'counter-strike-servers.net': {},
    'cubeworld-servers.com': {},
    'dayz-servers.org': {},
    'ecoservers.io': {},
    'empyrion-servers.com': {},
    'gmod-servers.com': {},
    'hurtworld-servers.net': {},
    'hytale-servers.io': {},
    'life-is-feudal.org': {},
    'minecraft-mp.com': {},
    'minecraftpocket-servers.com': {},
    'minecraft-tracker.com': {},
    'miscreated-servers.com': {},
    'reign-of-kings.net': {},
    'rust-servers.net': {},
    'space-engineers.com': {},
    'squad-servers.com': {},
    'starbound-servers.net': {},
    'tf2-servers.com': {},
    'teamspeak-servers.org': {},
    'terraria-servers.com': {},
    'unturned-servers.net': {},
    'vrising-servers.net': {},
    'valheim-servers.io': {},
    'wurm-unlimited.com': {},
    'minecraft-server-list.com': {
        pageURL: (project) => 'https://minecraft-server-list.com/server/' + project.id + '/',
        voteURL: (project) => 'https://minecraft-server-list.com/server/' + project.id + '/vote/',
        projectName: (doc) => doc.querySelector('.server-heading > a').textContent,
        exampleURL: () => ['https://minecraft-server-list.com/server/', '292028', '/vote/'],
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hour: 23})
    },
    'serverpact.com': {
        pageURL: (project) => 'https://www.serverpact.com/vote-' + project.id,
        voteURL: (project) => 'https://www.serverpact.com/vote-' + project.id,
        projectName: (doc) => doc.querySelector('h1.sp-title').textContent.trim().replace('Vote for ', ''),
        exampleURL: () => ['https://www.serverpact.com/vote-', '26492123', ''],
        URLMain: () => 'serverpact.com',
        parseURL: (url) => ({id: url.pathname.split('/')[1].replace('vote-', '')}),
        timeout: () => ({hours: 11, minutes: 7}),
        oneProject: () => 1,
        notFound: (doc) => doc.querySelector('div.container > div.row > div > center') != null && doc.querySelector('div.container > div.row > div > center').textContent.includes('This server does not exist'),
        silentVote: () => true,
        notRequiredCaptcha: () => true
    },
    'serverpact.nl': {},
    'minecraftserverlijst.nl': {},
    'minecraftserverlist.eu': {},
    'minecraftiplist.com': {
        pageURL: (project) => 'https://www.minecraftiplist.com/server/' + project.id,
        voteURL: (project) => 'https://www.minecraftiplist.com/server/' + project.id + '/vote',
        projectName: (doc) => doc.querySelector('.server-info-title').innerText,
        exampleURL: () => ['https://www.minecraftiplist.com/server/', 'PurplePrison1SponsoredServer-5020', '/vote'],
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hours: 24})
    },
    'topminecraftservers.org': {
        pageURL: (project) => 'https://topminecraftservers.org/server/' + project.id,
        voteURL: (project) => 'https://topminecraftservers.org/vote/' + project.id,
        projectName: (doc) => doc.querySelector('h1[property="name"]').textContent,
        exampleURL: () => ['https://topminecraftservers.org/vote/', '9126', ''],
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hour: 5})
    },
    'minecraftservers.biz': {
        pageURL: (project) => 'https://minecraftservers.biz/' + project.id + '/',
        voteURL: (project) => 'https://minecraftservers.biz/' + project.id + '/',
        projectName: (doc) => doc.querySelector('.panel-heading strong').textContent.trim(),
        exampleURL: () => ['https://minecraftservers.biz/', 'purpleprison', '/#vote_now'],
        parseURL: (url) => ({id: url.pathname.split('/')[1]}),
        timeout: () => ({hours: 12})
    },
    'hotmc.ru': {
        pageURL: (project) => 'https://hotmc.ru/minecraft-server-' + project.id,
        voteURL: (project) => 'https://hotmc.ru/vote-' + project.id,
        projectName: (doc) => doc.querySelector('div.text-server > h1').textContent.replace(' сервер Майнкрафт', ''),
        exampleURL: () => ['https://hotmc.ru/vote-', '199493', ''],
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
    'minecraft-server.net': {
        pageURL: (project) => 'https://minecraft-server.net/details/' + project.id + '/',
        voteURL: (project) => 'https://minecraft-server.net/vote/' + project.id + '/',
        projectName: (doc) => doc.querySelector('div.card-header > h2').textContent,
        exampleURL: () => ['https://minecraft-server.net/vote/', 'TitanicFreak', '/'],
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hours: 24})
    },
    'top-games.net': {
        pageURL: (project) => {
            if (project.lang === 'fr') {
                return 'https://top-serveurs.net/' + project.game + '/' + project.id
            } else if (project.lang === 'en') {
                return 'https://top-games.net/' + project.game + '/' + project.id
            } else {
                return 'https://' + project.lang + '.top-games.net/' + project.game + '/' + project.id
            }
        },
        voteURL: (project) => {
            if (project.lang === 'fr') {
                return 'https://top-serveurs.net/' + project.game + '/vote/' + project.id
            } else if (project.lang === 'en') {
                return 'https://top-games.net/' + project.game + '/vote/' + project.id
            } else {
                return 'https://' + project.lang + '.top-games.net/' + project.game + '/vote/' + project.id
            }
        },
        projectName: (doc) => doc.querySelector('div.top-description h1').textContent,
        exampleURL: () => ['https://top-serveurs.net/minecraft/', 'icesword-pvpfaction-depuis-2014-crack-on', ''],
        URLMain: () => 'top-games.net',
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
    'top-serveurs.net': {},
    'tmonitoring.com': {
        pageURL: (project) => 'https://tmonitoring.com/server/' + project.id + '/',
        voteURL: (project) => 'https://tmonitoring.com/server/' + project.id + '/',
        projectName: (doc) => doc.querySelector('div[class="info clearfix"] > div.pull-left > h1').textContent,
        exampleURL: () => ['https://tmonitoring.com/server/', 'qoobworldru', ''],
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hours: 24})
    },
    'top.gg': {
        pageURL: (project) => 'https://top.gg/' + project.listing + '/' + project.id + '/vote',
        voteURL: (project) => 'https://top.gg/' + project.listing + '/' + project.id + '/vote' + project.addition,
        projectName: (doc) => {
            for (const element of doc.querySelectorAll('h1')) {
                if (element.textContent.includes('Voting for ')) {
                    return element.textContent.replace('Voting for', '')
                }
            }
        },
        exampleURL: () => ['https://top.gg/bot/', '270904126974590976', '/vote'],
        parseURL: (url) => {
            const project = {}
            const paths = url.pathname.split('/')
            project.listing = paths[1]
            project.id = paths[2]
            if (url.search && url.search.length > 0) {
                project.addition = url.search
            } else {
                project.addition = ''
            }
            return project
        },
        timeout: () => ({hours: 12}),
        exampleURLListing: () => ['https://top.gg/', 'bot', '/270904126974590976/vote'],
        defaultListing: () => 'bot',
        listingList: () => new Map([
            ['bot', 'Bots'],
            ['servers', 'Guilds']
        ]),
        notRequiredNick: () => true,
        focusedTab: () => true,
        additionExampleURL: () => ['https://top.gg/bot/617037497574359050/vote', '?currency=DOGE', ''],
        needAdditionalOrigins: ()=> ['https://discord.com/oauth2/*']
    },
    'discordbotlist.com': {
        pageURL: (project) => 'https://discordbotlist.com/' + project.listing + '/' + project.id,
        voteURL: (project) => 'https://discordbotlist.com/' + project.listing + '/' + project.id + '/upvote',
        projectName: (doc) => doc.querySelector('h1.bot-name').textContent.trim(),
        exampleURL: () => ['https://discordbotlist.com/bots/', 'dank-memer', '/upvote'],
        parseURL: (url) => ({listing: url.pathname.split('/')[1], id: url.pathname.split('/')[2]}),
        timeout: () => ({hours: 12}),
        exampleURLListing: () => ['https://discordbotlist.com/', 'bots', '/dank-memer/upvote'],
        defaultListing: () => 'bots',
        listingList: () => new Map([
            ['bots', 'Bots'],
            ['servers', 'Guilds']
        ]),
        notRequiredNick: () => true,
        needAdditionalOrigins: ()=> ['https://discord.com/oauth2/*']
    },
    'discords.com': {
        pageURL: (project) => 'https://discords.com/' + project.listing + '/' + project.id,
        voteURL: (project) => 'https://discords.com/' + project.listing + '/' + project.id + (project.listing === 'servers' ? '/upvote' : '/vote'),
        projectName: (doc, project) => {
            if (project.game === 'servers') {
                return doc.querySelector('.servernameh1').textContent
            } else {
                // doc.querySelector('.bot-title-bp h2').textContent
                // TODO к сожалению сайт не даёт в html сведений о названии бота
                return null
            }
        },
        exampleURL: () => ['https://discords.com/bots/bot/', '469610550159212554', '/vote'],
        parseURL: (url) => {
            const project = {}
            const paths = url.pathname.split('/')
            if (paths[1] === 'servers') {
                project.id = paths[2]
                project.listing = 'servers'
            } else {
                project.id = paths[3]
                project.listing = 'bots/bot'
            }
            return project
        },
        timeout: (project) => project.listing === 'bots/bot' ? ({hours: 12}) : ({hours: 6}),
        exampleURLListing: () => ['https://discords.com/', 'bots/bot', '/469610550159212554/vote'],
        defaultListing: () => 'bots',
        listingList: () => new Map([
            ['bots/bot', 'Bots'],
            ['servers', 'Guilds']
        ]),
        notRequiredNick: () => true,
        needAdditionalOrigins: ()=> ['https://discord.com/oauth2/*']
    },
    'mmotop.ru': {
        pageURL: (project) => {
            if (project.lang === 'ru') {
                return 'https://' + project.game + '.mmotop.ru/servers/' + project.id
            } else {
                return 'https://' + project.game + '.mmotop.ru/' + project.lang + '/' + 'servers/' + project.id
            }
        },
        voteURL: (project) => {
            if (project.lang === 'ru') {
                return 'https://' + project.game + '.mmotop.ru/servers/' + project.id + '/votes/new'
            } else {
                return 'https://' + project.game + '.mmotop.ru/' + project.lang + '/' + 'servers/' + project.id + '/votes/new'
            }
        },
        projectName: (doc) => doc.querySelector('.server-one h1').textContent,
        exampleURL: () => ['https://pw.mmotop.ru/servers/', '25895', '/votes/new'],
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
    'mc-servers.com': {
        pageURL: (project) => 'https://mc-servers.com/server/' + project.id,
        voteURL: (project) => 'https://mc-servers.com/vote/' + project.id,
        projectName: (doc) => doc.querySelector('.main-panel h1').textContent,
        exampleURL: () => ['https://mc-servers.com/server/', '1890', '/'],
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hour: 4})
    },
    'minecraftlist.org': {
        pageURL: (project) => 'https://minecraftlist.org/server/' + project.id,
        voteURL: (project) => 'https://minecraftlist.org/vote/' + project.id,
        projectName: (doc) => doc.querySelector('.container h1').textContent.trim().replace('Minecraft Server', ''),
        exampleURL: () => ['https://minecraftlist.org/vote/', '11227', ''],
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hour: 5})
    },
    'minecraft-index.com': {
        pageURL: (project) => 'https://www.minecraft-index.com/' + project.id,
        voteURL: (project) => 'https://www.minecraft-index.com/' + project.id + '/vote',
        projectName: (doc) => doc.querySelector('h3.stitle').textContent,
        exampleURL: () => ['https://www.minecraft-index.com/', '33621-extremecraft-net', '/vote'],
        parseURL: (url) => ({id: url.pathname.split('/')[1]}),
        timeout: () => ({hour: 0}),
        alertManualCaptcha: () => true
    },
    'serverlist101.com': {
        pageURL: (project) => 'https://serverlist101.com/server/' + project.id + '/',
        voteURL: (project) => 'https://serverlist101.com/server/' + project.id + '/vote/',
        projectName: (doc) => doc.querySelector('.container li h1').textContent,
        exampleURL: () => ['https://serverlist101.com/server/', '1547', '/vote/'],
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hour: 23}),
        alertManualCaptcha: () => true
    },
    'mcserver-list.eu': {
        pageURL: (project) => 'https://mcserver-list.eu/server/' + project.id,
        voteURL: (project) => 'https://mcserver-list.eu/vote/' + project.id,
        projectName: (doc) => doc.querySelector('.serverdetail h1').textContent,
        exampleURL: () => ['https://mcserver-list.eu/server/', '416', ''],
        parseURL: (url) => {
            const project = {}
            const paths = url.pathname.split('/')
            if (paths[1].length === 2) {
                project.id = url.pathname.split('/')[3]
            } else {
                project.id = url.pathname.split('/')[2]
            }
            return project
        },
        timeout: () => ({hours: 2}),
        silentVote: () => true,
        limitedCountVote: () => true,
        notRequiredCaptcha: () => true
    },
    'craftlist.org': {
        pageURL: (project) => 'https://craftlist.org/' + project.id,
        voteURL: (project) => 'https://craftlist.org/' + project.id,
        projectName: (doc) => doc.querySelector('main h1').innerText.trim(),
        exampleURL: () => ['https://craftlist.org/', 'basicland', ''],
        parseURL: (url) => ({id: url.pathname.split('/')[1]}),
        timeout: () => ({hours: 24}),
        banAttention: () => true
    },
    'czech-craft.eu': {
        pageURL: (project) => 'https://czech-craft.eu/server/' + project.id + '/',
        voteURL: (project) => 'https://czech-craft.eu/server/' + project.id + '/vote/',
        projectName: (doc) => doc.querySelector('a.server-name').textContent,
        exampleURL: () => ['https://czech-craft.eu/server/', 'trenend', '/vote/'],
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hours: 2}),
        limitedCountVote: () => true
    },
    'minecraft.buzz': {
        pageURL: (project) => 'https://minecraft.buzz/server/' + project.id,
        voteURL: (project) => 'https://minecraft.buzz/vote/' + project.id,
        projectName: (doc) => doc.querySelector('#vote-line').previousElementSibling.textContent.trim(),
        exampleURL: () => ['https://minecraft.buzz/vote/', '306', ''],
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hour: 0})
    },
    'minecraftservery.eu': {
        pageURL: (project) => 'https://minecraftservery.eu/server/' + project.id,
        voteURL: (project) => 'https://minecraftservery.eu/server/' + project.id,
        projectName: (doc) => doc.querySelector('div.container div.box h1.title').textContent,
        exampleURL: () => ['https://minecraftservery.eu/server/', '105', ''],
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hours: 2}),
        limitedCountVote: () => true
    },
    'rpg-paradize.com': {
        pageURL: (project) => 'https://www.rpg-paradize.com/site--' + project.id,
        voteURL: (project) => 'https://www.rpg-paradize.com/?page=vote&vote=' + project.id,
        projectName: (doc) => doc.querySelector('div.div-box > h1').textContent.replace('Vote : ', ''),
        exampleURL: () => ['https://www.rpg-paradize.com/?page=vote&vote=', '113763', ''],
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
    'minecraft-serverlist.net': {
        pageURL: (project) => 'https://www.minecraft-serverlist.net/vote/' + project.id,
        voteURL: (project) => 'https://www.minecraft-serverlist.net/vote/' + project.id,
        projectName: (doc) => doc.querySelector('a.server-name').textContent.trim(),
        exampleURL: () => ['https://www.minecraft-serverlist.net/vote/', '51076', ''],
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hour: 23})
    },
    'minecraft-server.eu': {
        pageURL: (project) => 'https://minecraft-server.eu/server/index/' + project.id,
        voteURL: (project) => 'https://minecraft-server.eu/vote/index/' + project.id,
        projectName: (doc) => doc.querySelector('div.serverName').textContent,
        exampleURL: () => ['https://minecraft-server.eu/vote/index/', '1A73C', ''],
        parseURL: (url) => ({id: url.pathname.split('/')[3]}),
        timeout: () => ({hour: 23})
    },
    'minecraftkrant.nl': {
        pageURL: (project) => {
            if (!project.lang) project.lang = 'www.minecraftkrant.nl'
            const serverlist = project.lang === 'www.minecraftkrant.nl' ? 'serverlijst' : 'servers'
            return 'https://' + project.lang + '/' + serverlist + '/' + project.id
        },
        voteURL: (project) => {
            if (!project.lang) project.lang = 'www.minecraftkrant.nl'
            const serverlist = project.lang === 'www.minecraftkrant.nl' ? 'serverlijst' : 'servers'
            return 'https://' + project.lang + '/' + serverlist + '/' + project.id + '/vote'
        },
        projectName: (doc) => doc.querySelector('div.s_HeadTitle h1').firstChild.textContent.trim(),
        exampleURL: () => ['https://www.minecraftkrant.nl/serverlijst/', 'torchcraft', '/vote'],
        URLMain: () => 'minecraftkrant.nl',
        parseURL: (url) => {
            const project = {}
            project.lang = url.host
            project.id = url.pathname.split('/')[2]
            return project
        },
        exampleURLLang: () => ['https://www.', 'minecraftkrant.nl', '/serverlijst/torchcraft/vote'],
        defaultLand: () => 'www.minecraftkrant.nl',
        langList: () => new Map([
            ['www.minecraftkrant.nl', 'Nederlands'],
            ['minecraft-news.net', 'English']
        ])
    },
    'minecraft-news.net': {},
    'trackyserver.com': {
        pageURL: (project) => 'https://www.trackyserver.com/server/' + project.id,
        voteURL: (project) => 'https://www.trackyserver.com/server/' + project.id,
        projectName: (doc) => doc.querySelector('div.panel h1').textContent.trim(),
        exampleURL: () => ['https://www.trackyserver.com/server/', 'anubismc-486999', ''],
        parseURL: (url) => ({id: url.pathname.split('/')[2]})
    },
    'mc-lists.org': {
        pageURL: (project) => 'https://mc-lists.org/' + project.id + '/vote',
        voteURL: (project) => 'https://mc-lists.org/' + project.id + '/vote',
        projectName: (doc) => doc.querySelector('div.header > div.ui.container').textContent.trim(),
        exampleURL: () => ['https://mc-lists.org/', 'server-luxurycraft.1818', '/vote'],
        parseURL: (url) => ({id: url.pathname.split('/')[1]}),
        timeout: () => ({hours: 12})
    },
    'topmcservers.com': {
        pageURL: (project) => 'https://topmcservers.com/server/' + project.id,
        voteURL: (project) => 'https://topmcservers.com/server/' + project.id,
        projectName: (doc) => doc.querySelector('#server-metadata td').innerText,
        exampleURL: () => ['https://topmcservers.com/server/', '17', ''],
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hour: 0}),
        optionalNick: () => true // TODO почему-то нет никнейма, возможно сайт не доделан
    },
    'bestservers.com': {
        pageURL: (project) => 'https://bestservers.com/server/' + project.id + '/vote',
        voteURL: (project) => 'https://bestservers.com/server/' + project.id + '/vote',
        projectName: (doc) => doc.querySelector('th.server').textContent.trim(),
        exampleURL: () => ['https://bestservers.com/server/', '1135', '/vote'],
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        optionalNick: () => true,
        needAdditionalOrigins: ()=> ['*://*.steamcommunity.com/*']
    },
    'craft-list.net': {
        pageURL: (project) => 'https://craft-list.net/minecraft-server/' + project.id,
        voteURL: (project) => 'https://craft-list.net/minecraft-server/' + project.id + '/vote',
        projectName: (doc) => doc.querySelector('div.serverpage-navigation-headername.header').firstChild.textContent.trim(),
        exampleURL: () => ['https://craft-list.net/minecraft-server/', 'Advancius-Network', '/vote'],
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hours: 24})
    },
    'minecraft-servers-list.org': {
        pageURL: (project) => 'https://www.minecraft-servers-list.org/details/' + project.id + '/',
        voteURL: (project) => 'https://www.minecraft-servers-list.org/index.php?a=in&u=' + project.id,
        projectName: (doc) => doc.querySelector('div.card-header > h1').textContent.trim(),
        exampleURL: () => ['https://www.minecraft-servers-list.org/index.php?a=in&u=', 'chromity', ''],
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
    'serverliste.net': {
        pageURL: (project) => 'https://serverliste.net/vote/' + project.id,
        voteURL: (project) => 'https://serverliste.net/vote/' + project.id,
        projectName: (doc) => doc.querySelector('.justify-content-center h3').textContent.trim(),
        exampleURL: () => ['https://serverliste.net/vote/', '775', ''],
        parseURL: (url) => ({id: url.pathname.split('/')[2]})
    },
    'gtop100.com': {
        pageURL: (project) => 'https://gtop100.com/topsites/' + project.game + '/sitedetails/' + project.id + '?vote=1',
        voteURL: (project) => 'https://gtop100.com/topsites/' + project.game + '/sitedetails/' + project.id + '?vote=1&pingUsername=' + project.nick,
        projectName: (doc) => doc.querySelector('[itemprop="name"]').textContent.trim(),
        exampleURL: () => ['https://gtop100.com/topsites/MapleStory/sitedetails/', 'Ristonia--v224--98344', '?vote=1&pingUsername=kingcloudian'],
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
    'wargm.ru': {
        pageURL: (project) => 'https://wargm.ru/server/' + project.id,
        voteURL: (project) => 'https://wargm.ru/server/' + project.id + '/votes',
        projectName: (doc) => doc.querySelector('#header h1').textContent,
        exampleURL: () => ['https://wargm.ru/server/', '23394', '/votes'],
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hours: 16}),
        notRequiredNick: () => true,
        banAttention: () => true,
        needAdditionalOrigins: ()=> ['*://*.steamcommunity.com/*']
    },
    'minestatus.net': {
        pageURL: (project) => 'https://minestatus.net/server/' + project.id,
        voteURL: (project) => 'https://minestatus.net/server/vote/' + project.id,
        projectName: (doc) => doc.querySelector('h1.section-title').textContent.trim(),
        exampleURL: () => ['https://minestatus.net/server/vote/', 'mine.sylphmc.com', ''],
        parseURL: (url) => ({id: url.pathname.split('/')[2] === 'vote' ? url.pathname.split('/')[3] : url.pathname.split('/')[2]}),
        timeout: () => ({hours: 24})
    },
    'misterlauncher.org': {
        pageURL: (project) => {
            if (project.listing === 'projects') return 'https://misterlauncher.org/projects/' + project.id + '/'
            else return 'https://misterlauncher.org/vote/' + project.id + '/'
        },
        voteURL: (project) => {
            if (project.listing === 'projects') return 'https://oauth.vk.com/authorize?client_id=7636705&display=page&redirect_uri=https://misterlauncher.org/projects/' + project.id + '/&state=' + project.nick + '&response_type=code'
            else return 'https://misterlauncher.org/vote/' + project.id + '/'
        },
        projectName: (doc, project) => {
            if (project.listing === 'projects') return doc.querySelector('h1[itemprop="name"]').textContent.trim().replace('Проект ', '')
            else return doc.querySelector('.page-vote a').textContent
        },
        exampleURL: () => ['https://misterlauncher.org/projects/', 'omegamc', '/'],
        parseURL: (url) => ({listing: url.pathname.split('/')[1] === 'projects' ? 'projects' : 'servers', id: url.pathname.split('/')[2]}),
        timeout: (project) => project.listing === 'projects' ? ({hour: 21}) : ({hours: 24}),
        exampleURLListing: () => ['https://misterlauncher.org/', 'projects', '/omegamc/'],
        defaultListing: () => 'projects',
        listingList: () => new Map([
            ['projects', 'Проекты'],
            ['servers', 'Сервера (нет награды за голосование)']
        ]),
        silentVote: (project) => project?.listing === 'projects',
        notRequiredNick: (project) => project?.listing === 'servers',
        notRequiredCaptcha: (project) => project?.listing === 'projects',
        needAdditionalOrigins: (project)=> project?.listing === 'projects' ? ['*://*.vk.com/*'] : []
    },
    'minecraft-servers.de': {
        pageURL: (project) => 'https://minecraft-servers.de/server/' + project.id,
        voteURL: (project) => 'https://minecraft-servers.de/server/' + project.id + '/vote',
        projectName: (doc) => doc.querySelector('div.container h1').textContent,
        exampleURL: () => ['https://minecraft-servers.de/server/', 'twerion', '/vote'],
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hours: 24})
    },
    'discord.boats': {
        pageURL: (project) => 'https://discord.boats/bot/' + project.id,
        voteURL: (project) => 'https://discord.boats/bot/' + project.id + '/vote',
        projectName: (doc) => doc.querySelector('div.container h3 > span').textContent,
        exampleURL: () => ['https://discord.boats/bot/', '557628352828014614', '/vote'],
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hours: 12}),
        notRequiredNick: () => true,
        needAdditionalOrigins: ()=> ['https://discord.com/oauth2/*']
    },
    'serverlist.games': {
        pageURL: (project) => 'https://serverlist.games/server/' + project.id,
        voteURL: (project) => 'https://serverlist.games/vote/' + project.id,
        projectName: (doc) => doc.querySelector('div.card-title-server h5').textContent,
        exampleURL: () => ['https://serverlist.games/vote/', '2052', ''],
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hours: 20})
    },
    'best-minecraft-servers.co': {
        pageURL: (project) => 'https://best-minecraft-servers.co/' + project.id,
        voteURL: (project) => 'https://best-minecraft-servers.co/' + project.id + '/vote',
        projectName: (doc) => doc.querySelector('table.info th').textContent.trim(),
        exampleURL: () => ['https://best-minecraft-servers.co/', 'server-hypixel-network.30', '/vote'],
        parseURL: (url) => ({id: url.pathname.split('/')[1]})
    },
    'minecraftservers100.com': {
        pageURL: (project) => 'https://minecraftservers100.com/vote/' + project.id,
        voteURL: (project) => 'https://minecraftservers100.com/vote/' + project.id,
        projectName: (doc) => doc.querySelector('div.page-header').textContent.trim().replace('Vote for ', ''),
        exampleURL: () => ['https://minecraftservers100.com/vote/', '2340', ''],
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hours: 24})
    },
    'mc-serverlist.cz': {
        pageURL: (project) => 'https://mc-serverlist.cz/' + project.id,
        voteURL: (project) => 'https://mc-serverlist.cz/' + project.id + '/vote',
        projectName: (doc) => doc.querySelector('table.info th').textContent.trim(),
        exampleURL: () => ['https://mc-serverlist.cz/', 'server-lendmark.27', '/vote'],
        parseURL: (url) => ({id: url.pathname.split('/')[1]})
    },
    'mineservers.com': {
        pageURL: (project) => 'https://' + project.game + '/server/' + project.id + '/vote',
        voteURL: (project) => 'https://' + project.game + '/server/' + project.id + '/vote',
        projectName: (doc) => doc.querySelector('#title h1').textContent,
        exampleURL: () => ['https://mineservers.com/server/', 'jvvHdPJy', '/vote'],
        URLMain: () => 'mineservers.com',
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
    'pixelmonservers.com': {},
    'tekkitserverlist.com': {},
    'technicservers.com': {},
    'ftbservers.com': {},
    'attackofthebteamservers.com': {},
    'atlauncher.com': {
        pageURL: (project) => 'https://atlauncher.com/servers/server/' + project.id + '/vote',
        voteURL: (project) => 'https://atlauncher.com/servers/server/' + project.id + '/vote',
        projectName: (doc) => doc.querySelector('ol li:nth-child(3)').textContent.trim(),
        exampleURL: () => ['https://atlauncher.com/servers/server/', 'KineticNetworkSkyfactory4', '/vote'],
        parseURL: (url) => ({id: url.pathname.split('/')[3]}),
        timeout: () => ({hours: 24})
    },
    'servers-minecraft.net': {
        pageURL: (project) => 'https://servers-minecraft.net/' + project.id,
        voteURL: (project) => 'https://servers-minecraft.net/' + project.id + '/vote',
        projectName: (doc) => doc.querySelector('div.text-xl').textContent.trim(),
        exampleURL: () => ['https://servers-minecraft.net/', 'server-complex-gaming.58', '/vote'],
        parseURL: (url) => ({id: url.pathname.split('/')[1]}),
        timeout: () => ({hour: 5})
    },
    'minecraft-list.cz': {
        pageURL: (project) => 'https://www.minecraft-list.cz/server/' + project.id,
        voteURL: (project) => 'https://www.minecraft-list.cz/server/' + project.id + '/vote',
        projectName: (doc) => doc.querySelector('.card-body .text-center').textContent.trim(),
        exampleURL: () => ['https://www.minecraft-list.cz/server/', 'czech-survival', '/vote'],
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hours: 2}),
        limitedCountVote: () => true
    },
    'liste-serveurs-minecraft.org': {
        pageURL: (project) => 'https://www.liste-serveurs-minecraft.org/vote/?idc=' + project.id,
        voteURL: (project) => 'https://www.liste-serveurs-minecraft.org/vote/?idc=' + project.id,
        projectName: (doc) => {
            if (doc.querySelector('span.wlt_shortcode_TITLE-NOLINK')) {
                doc.querySelector('span.wlt_shortcode_TITLE-NOLINK').textContent
            } else {
                doc.querySelector('#gdrtsvote font[color="blue"]').textContent
            }
        },
        exampleURL: () => ['https://www.liste-serveurs-minecraft.org/vote/?idc=', '202085', ''],
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
    'mcservidores.com': {
        pageURL: (project) => 'https://mcservidores.com/servidor/' + project.id,
        voteURL: (project) => 'https://mcservidores.com/servidor/' + project.id,
        projectName: (doc) => doc.querySelector('#panel h1').textContent.trim(),
        exampleURL: () => ['https://mcservidores.com/servidor/', '122', ''],
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hours: 24}),
        oneProject: () => 1
    },
    'xtremetop100.com': {
        pageURL: (project) => 'https://www.xtremetop100.com/in.php?site=' + project.id,
        voteURL: (project) => 'https://www.xtremetop100.com/in.php?site=' + project.id,
        projectName: (doc) => doc.querySelector('#topbanner form[method="POST"] input[type="submit"]').value.replace('Vote for ', ''),
        exampleURL: () => ['https://www.xtremetop100.com/in.php?site=', '1132370645', ''],
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
        alertManualCaptcha: () => true,
        timeout: () => ({hours: 12})
    },
    'minecraft-server.sk': {
        pageURL: (project) => 'https://minecraft-server.sk/' + project.id + '/vote',
        voteURL: (project) => 'https://minecraft-server.sk/' + project.id + '/vote',
        projectName: (doc) => doc.querySelector('.server.icon').parentElement.innerText.trim(),
        exampleURL: () => ['https://minecraft-server.sk/', 'server-luoend.52', '/vote'],
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hours: 24})
    },
    'serveursminecraft.org': {
        pageURL: (project) => 'https://www.serveursminecraft.org/serveur/' + project.id + '/',
        voteURL: (project) => 'https://www.serveursminecraft.org/serveur/' + project.id + '/',
        projectName: (doc) => doc.querySelector('div.panel-heading b').textContent,
        exampleURL: () => ['https://www.serveursminecraft.org/serveur/', '1017', '/'],
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hours: 24})
    },
    'serveurs-mc.net': {
        pageURL: (project) => 'https://serveurs-mc.net/serveur/' + project.id,
        voteURL: (project) => 'https://serveurs-mc.net/serveur/' + project.id + '/voter',
        projectName: (doc) => doc.querySelector('h1.text-center').textContent,
        exampleURL: () => ['https://serveurs-mc.net/serveur/', '82', '/voter'],
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hours: 2}),
        limitedCountVote: () => true
    },
    'serveur-minecraft.com': {
        pageURL: (project) => 'https://serveur-minecraft.com/' + project.id,
        voteURL: (project) => 'https://serveur-minecraft.com/' + project.id,
        projectName: (doc) => doc.querySelector('div.title h1').textContent,
        exampleURL: () => ['https://serveur-minecraft.com/', '2908', ''],
        parseURL: (url) => ({id: url.pathname.split('/')[1]}),
        timeout: () => ({hours: 3}),
        limitedCountVote: () => true
    },
    'serveur-minecraft-vote.fr': {
        pageURL: (project) => 'https://serveur-minecraft-vote.fr/serveurs/' + project.id + '/vote',
        voteURL: (project) => 'https://serveur-minecraft-vote.fr/serveurs/' + project.id + '/vote',
        projectName: (doc) => doc.querySelector('.server-name').textContent,
        exampleURL: () => ['https://serveur-minecraft-vote.fr/serveurs/', 'ectalia.425', '/vote'],
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hours: 1, minutes: 30}),
        limitedCountVote: () => true
    },
    'minebrowse.com': {
        pageURL: (project) => 'https://minebrowse.com/server/' + project.id,
        voteURL: (project) => 'https://minebrowse.com/server/' + project.id,
        projectName: (doc) => doc.querySelector('title').textContent.replace(' - Minebrowse Minecraft Server List', ''),
        exampleURL: () => ['https://minebrowse.com/server/', '1638', ''],
        parseURL: (url) => ({id: url.pathname.split('/')[2]})
    },
    'mc-server-list.com': {
        pageURL: (project) => 'https://mc-server-list.com/server/' + project.id + '/',
        voteURL: (project) => 'https://mc-server-list.com/server/' + project.id +'/vote/',
        projectName: (doc) => doc.querySelector('h2.header').textContent,
        exampleURL: () => ['https://mc-server-list.com/server/', '127-Armageddon+Server', '/vote/'],
        parseURL: (url) => ({id: url.pathname.split('/')[2]})
    },
    'serverlocator.com': {
        pageURL: (project) => 'https://serverlocator.com/server/' + project.id,
        voteURL: (project) => 'https://serverlocator.com/vote/' + project.id,
        projectName: (doc) => doc.querySelector('.content_head h2').textContent,
        exampleURL: () => ['https://serverlocator.com/vote/', '440', ''],
        parseURL: (url) => ({id: url.pathname.split('/')[2]})
    },
    'top-mmogames.ru': {
        pageURL: (project) => 'https://top-mmogames.ru/' + project.id,
        voteURL: (project) => 'https://top-mmogames.ru/' + project.id,
        projectName: (doc) => doc.querySelector('.gamefeatures [itemprop="name"]').textContent,
        exampleURL: () => ['https://top-mmogames.ru/', 'server-wow-amdfun', ''],
        parseURL: (url) => ({id: url.pathname.split('/')[1]}),
        needPrompt: () => true
    },
    'mmorpg.top': {
        pageURL: (project) => 'https://' + project.game +'.mmorpg.top/server/' + project.id,
        voteURL: (project) => 'https://' + project.game +'.mmorpg.top/server/' + project.id,
        projectName: (doc) => doc.querySelector('.title [itemprop="name"]').textContent,
        exampleURL: () => ['https://wow.mmorpg.top/server/', '23', ''],
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
    'mmovote.ru': {
        pageURL: (project) => 'https://' + project.game +'.mmovote.ru/ru/vote/' + project.id,
        voteURL: (project) => 'https://' + project.game +'.mmovote.ru/ru/vote/' + project.id,
        projectName: (doc) => doc.querySelector('.content .box h2').textContent.replace('Голосование за ', ''),
        exampleURL: () => ['https://wow.mmovote.ru/ru/vote/', '85', ''],
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
    'mc-monitoring.info': {
        pageURL: (project) => {
            if (project.game === 'minecraft') {
                return 'https://mc-monitoring.info/server/' + project.id
            } else {
                return 'https://mc-monitoring.info/' + project.game + '/server/' + project.id
            }
        },
        voteURL: (project) => {
            if (project.game === 'minecraft') {
                return 'https://mc-monitoring.info/server/vote/' + project.id
            } else {
                return 'https://mc-monitoring.info/' + project.game + '/server/vote/' + project.id
            }
        },
        projectName: (doc) => doc.querySelector('.hello h1').textContent.replace('Игровой сервер ', ''),
        exampleURL: () => ['https://mc-monitoring.info/wow/server/vote/', '112', ''],
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
    'mcservertime.com': {
        pageURL: (project) => 'https://mcservertime.com/' + project.id,
        voteURL: (project) => 'https://mcservertime.com/' + project.id + '/vote',
        projectName: (doc) => doc.querySelector('.server.icon').parentElement.innerText.trim(),
        exampleURL: () => ['https://mcservertime.com/', 'server-blastmc-asia.1399', '/vote'],
        parseURL: (url) => ({id: url.pathname.split('/')[1]}),
        timeout: () => ({hours: 12})
    },
    'liste-serveurs.fr': {
        pageURL: (project) => 'https://www.liste-serveurs.fr/' + project.id,
        voteURL: (project) => 'https://www.liste-serveurs.fr/' + project.id + '/vote',
        projectName: (doc) => doc.querySelector('.server.icon').parentElement.innerText.trim(),
        exampleURL: () => ['https://www.liste-serveurs.fr/', 'server-pixel-prime-serveur-pixelmon.512', '/vote'],
        parseURL: (url) => ({id: url.pathname.split('/')[1]}),
        timeout: () => ({hours: 3}),
        limitedCountVote: () => true
    },
    'serveur-minecraft.fr': {
        pageURL: (project) => 'https://serveur-minecraft.fr/' + project.id,
        voteURL: (project) => 'https://serveur-minecraft.fr/' + project.id + '/vote',
        projectName: (doc) => doc.querySelector('.server.icon').parentElement.innerText.trim(),
        exampleURL: () => ['https://serveur-minecraft.fr/', 'server-oneblock-farm2win.525', '/vote'],
        parseURL: (url) => ({id: url.pathname.split('/')[1]}),
        alertManualCaptcha: () => true
    },
    'mineserv.top': {
        pageURL: (project) => 'https://mineserv.top/' + project.id,
        voteURL: (project) => 'https://mineserv.top/' + project.id,
        projectName: (doc) => doc.querySelector('.project-name h1').textContent,
        exampleURL: () => ['https://mineserv.top/', 'epserv', ''],
        parseURL: (url) => ({id: url.pathname.split('/')[1]})
    },
    'top100arena.com': {
        pageURL: (project) => 'https://www.top100arena.com/listing/' + project.id + '/vote',
        voteURL: (project) => 'https://www.top100arena.com/listing/' + project.id + '/vote',
        projectName: (doc) => doc.querySelector('.container.text-center h1.h2').textContent,
        exampleURL: () => ['https://www.top100arena.com/listing/', '94246', '/vote'],
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        notRequiredNick: () => true
    },
    'minecraftbestservers.com': {
        pageURL: (project) => 'https://minecraftbestservers.com/' + project.id,
        voteURL: (project) => 'https://minecraftbestservers.com/' + project.id + '/vote',
        projectName: (doc) => doc.querySelector('header div.container h1.text-center').textContent.replace(' Minecraft Server Info, Voting, and More', ''),
        exampleURL: () => ['https://minecraftbestservers.com/', 'server-cherry-survival.4599', '/vote'],
        parseURL: (url) => ({id: url.pathname.split('/')[1]}),
        timeout: () => ({hour: 0})
    },
    'mclike.com': {
        pageURL: (project) => 'https://mclike.com/minecraft-server-' + project.id,
        voteURL: (project) => 'https://mclike.com/vote-' + project.id,
        projectName: (doc) => doc.querySelector('div.text-server > h1').textContent.replace('Minecraft server ', ''),
        exampleURL: () => ['https://mclike.com/vote-', '188444', ''],
        parseURL: (url) => {
            const project = {}
            project.id = url.pathname.split('/')[1]
            project.id = project.id.replace('vote-', '')
            project.id = project.id.replace('minecraft-server-', '')
            return project
        },
        oneProject: () => 1
    },
    'pixelmon-server-list.com': {
        pageURL: (project) => 'https://pixelmon-server-list.com/server/' + project.id,
        voteURL: (project) => 'https://pixelmon-server-list.com/server/' + project.id + '/vote',
        projectName: (doc) => doc.querySelector('.page-header h1').textContent,
        exampleURL: () => ['https://pixelmon-server-list.com/server/', '181', '/vote'],
        parseURL: (url) => ({id: url.pathname.split('/')[2]})
    },
    'minecraftserver.sk': {
        pageURL: (project) => 'https://www.minecraftserver.sk/server/' + project.id + '/',
        voteURL: (project) => 'https://www.minecraftserver.sk/server/' + project.id + '/',
        projectName: (doc) => doc.querySelector('.panel-body h3').innerText.trim(),
        exampleURL: () => ['https://www.minecraftserver.sk/server/', 'minicraft-cz-6', '/'],
        parseURL: (url) => ({id: url.pathname.split('/')[2]})
    },
    'servidoresdeminecraft.es': {
        pageURL: (project) => 'https://servidoresdeminecraft.es/server/status/' + project.id,
        voteURL: (project) => 'https://servidoresdeminecraft.es/server/vote/' + project.id,
        projectName: (doc) => doc.querySelector('.server-header h1').textContent,
        exampleURL: () => ['https://servidoresdeminecraft.es/server/vote/', 'gRQ7HvE8/play.minelatino.com', ''],
        parseURL: (url) => ({id: url.pathname.split('/')[3] + '/' + url.pathname.split('/')[4]})
    },
    'minecraftsurvivalservers.com': {
        pageURL: (project) => 'https://minecraftsurvivalservers.com/server/' + project.id,
        voteURL: (project) => 'https://minecraftsurvivalservers.com/vote/' + project.id,
        projectName: () => {
            // Хрень какая-то, в fetch запросе отсылается не страница а предзагрузка
            // return doc.querySelector('div.items-center > span.text-xl.font-semibold').textContent.trim()
            return ''
        },
        exampleURL: () => ['https://minecraftsurvivalservers.com/vote/', '248-rede-revo', ''],
        parseURL: (url) => ({id: url.pathname.split('/')[2]})
    },
    'minecraft.global': {
        pageURL: (project) => 'https://minecraft.global/server/' + project.id,
        voteURL: (project) => 'https://minecraft.global/server/' + project.id + '/vote',
        projectName: (doc) => doc.querySelector('h1').textContent,
        exampleURL: () => ['https://minecraft.global/server/', '8', '/vote'],
        parseURL: (url) => ({id: url.pathname.split('/')[2]})
    },
    'warface.com': {
        pageURL: () => 'https://ru.warface.com/bonus/',
        voteURL: () => 'https://ru.warface.com/bonus/',
        projectName: () => 'Bonus',
        exampleURL: () => ['https://ru.warface.com/bonus/', '', ''],
        parseURL: () => ({id: 'bonus'}),
        timeout: () => ({week: 3, hour: 13}),
        notRequiredCaptcha: () => true,
        notRequiredNick: () => true,
        notRequiredId: () => true
    },
    'curseforge.com': {
        pageURL: (project) => 'https://www.curseforge.com/servers/minecraft/game/' + project.id + '/',
        voteURL: (project) => 'https://www.curseforge.com/servers/minecraft/game/' + project.id + '/vote',
        projectName: (doc) => doc.querySelector('title').textContent.replaceAll(' - The Best Minecraft Servers - CurseForge', ''),
        exampleURL: () => ['https://www.curseforge.com/servers/minecraft/game/', 'lemoncloud', '/vote'],
        parseURL: (url) => ({id: url.pathname.split('/')[4]})
    },
    'hoyolab.com': {
        pageURL: (project) => {
            if (!project.id || project.id === 'genshin impact daily') {
                return 'https://act.hoyolab.com/ys/event/signin-sea-v3/index.html?act_id=e202102251931481&lang=en-us'
            } else {
                return 'https://act.hoyolab.com/bbs/event/signin/hkrpg/index.html?act_id=e202303301540311&lang=en-us'
            }
        },
        voteURL: (project) => {
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
        notRequiredNick: () => true
    },
    'trackingservers.cloud': {
        pageURL: (project) => 'https://trackingservers.cloud/server/' + project.id,
        voteURL: (project) => 'https://trackingservers.cloud/server/vote/' + project.id,
        projectName: (doc) => doc.querySelector('th.rank').innerText.trim(),
        exampleURL: () => ['https://trackingservers.cloud/server/vote/', 'dcgaming-network', ''],
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
    'mclist.io': {
        pageURL: (project) => 'https://mclist.io/server/' + project.id,
        voteURL: (project) => 'https://mclist.io/server/' + project.id + '/vote',
        projectName: (doc) => doc.querySelector('title').textContent.replaceAll(' | mclist.io - Minecraft Server List', ''),
        exampleURL: () => ['https://mclist.io/server/', '61609', '/vote'],
        parseURL: (url) => ({id: url.pathname.split('/')[2]})
    },
    'loliland.ru': {
        pageURL: () => 'https://loliland.net/bonus',
        voteURL: () => 'https://loliland.net/bonus',
        projectName: () => 'Бонус за подписку',
        exampleURL: () => ['https://loliland.net/bonus', '', ''],
        URLMain: () => 'loliland.ru',
        parseURL: () => ({id: 'bonus subscribe'}),
        timeout: () => ({
            hours: 24,
            minutes: 1 // TODO 1-на минутная задержка так как LoliLand не умеет считать правильно 24 часа
        }),
        notRequiredCaptcha: () => true,
        notRequiredNick: () => true,
        notRequiredId: () => true,
        needAdditionalOrigins: ()=> ['https://*.loliland.ru/*', 'https://*.loliland.io/*'],
        needAdditionalPermissions: () => ['cookies']
    },
    'loliland.net': {},
    'mcservers.top': {
        pageURL: (project) => 'https://mcservers.top/server/' + project.id,
        voteURL: (project) => 'https://mcservers.top/server/' + project.id,
        projectName: (doc) => doc.querySelector('h1[itemprop="name"]').textContent,
        exampleURL: () => ['https://mcservers.top/server/', '1113', ''],
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        needPrompt: () => true,
        notRequiredCaptcha: () => true
    },
    'discadia.com': {
        pageURL: (project) => 'https://discadia.com/server/' + project.id + '/',
        voteURL: (project) => 'https://discadia.com/vote/' + project.id + '/',
        projectName: (doc) => doc.querySelector('section.items-center > h1').textContent,
        exampleURL: () => ['https://discadia.com/server/', 'rq6-valorant-boost', '/'],
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hours: 24}), // https://discord.com/channels/371699266747629568/760393040174120990/1099781014206820352
        oneProject: () => 1,
        notRequiredNick: () => true,
        notRequiredCaptcha: () => true,
        needAdditionalOrigins: ()=> ['https://discord.com/oauth2/*']
    },
    'minecraftsurvivalservers.net': {
        pageURL: (project) => 'https://minecraftsurvivalservers.net/server/' + project.id,
        voteURL: (project) => 'https://minecraftsurvivalservers.net/server/' + project.id + '/vote',
        projectName: (doc) => doc.querySelector('h1.large.header').textContent.replaceAll(' Minecraft Server', ''),
        exampleURL: () => ['https://minecraftsurvivalservers.net/server/', '64', '/vote'],
        parseURL: (url) => ({id: url.pathname.split('/')[2]})
    },
    'topservers.com': {
        pageURL: (project) => 'https://topservers.com/' + project.id,
        voteURL: (project) => 'https://topservers.com/' + project.id + '#vote',
        projectName: (doc) => doc.querySelector('h1[itemprop="name"]').textContent,
        exampleURL: () => ['https://topservers.com/', 'minecraft-server-hypixel.3368', '#vote'],
        parseURL: (url) => ({id: url.pathname.split('/')[1]})
    },
    'genshindrop.com': {
        pageURL: () => 'https://genshindrop.com/case/24-chasa-oskolki',
        voteURL: () => 'https://genshindrop.com/case/24-chasa-oskolki',
        projectName: () => 'Бесплатный кейс 24 часа от Катерины',
        exampleURL: () => ['https://genshindrop.com/', 'case/24-chasa-oskolki', ''],
        parseURL: () => ({id: '24hcasekaterina'}),
        timeout: () => ({hours: 24}),
        silentVote: () => true,
        notRequiredCaptcha: () => true,
        notRequiredNick: () => true,
        notRequiredId: () => true
    },
    'emeraldservers.com': {
        pageURL: (project) => 'https://emeraldservers.com/server/' + project.id,
        voteURL: (project) => 'https://emeraldservers.com/server/' + project.id,
        projectName: (doc) => doc.querySelector('.infobar2 h1').innerText.trim(),
        exampleURL: () => ['https://emeraldservers.com/server/', '595', ''],
        parseURL: (url) => ({id: url.pathname.split('/')[2]})
    },
    '40servidoresmc.es': {
        pageURL: (project) => 'https://www.40servidoresmc.es/' + project.id,
        voteURL: (project) => 'https://www.40servidoresmc.es/' + project.id + '-votar',
        projectName: (doc) => doc.querySelector('div.caracteristicas div.tabla-head h2').innerText.trim(),
        exampleURL: () => ['https://www.40servidoresmc.es/', 'astraly', '-votar'],
        parseURL: (url) => ({id: url.pathname.split('/')[1].replaceAll('-votar', '')})
    },
    'minecraft-servers.biz': {
        pageURL: (project) => 'https://minecraft-servers.biz/server/' + project.id + '/',
        voteURL: (project) => 'https://minecraft-servers.biz/server/' + project.id + '/vote/',
        projectName: (doc) => doc.querySelector('div[itemprop="name"]').innerText.trim(),
        exampleURL: () => ['https://minecraft-servers.biz/server/', 'roleplay-hub-schoolrp', '/vote/'],
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hour: 22}),
        alertManualCaptcha: () => true,
        optionalNick: () => true
    },
    'top-mc-servers.net': {
        pageURL: (project) => 'https://top-mc-servers.net/server/' + project.id,
        voteURL: (project) => 'https://top-mc-servers.net/server/' + project.id,
        projectName: (doc) => doc.querySelector('.container h1.ibmpm').innerText.trim(),
        exampleURL: () => ['https://top-mc-servers.net/server/', '5', ''],
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hours: 24})
    },
    'minecraft-serverlist.com': {
        pageURL: (project) => 'https://minecraft-serverlist.com/server/' + project.id,
        voteURL: (project) => 'https://minecraft-serverlist.com/server/' + project.id + '/vote',
        projectName: (doc) => doc.querySelector('h1.server-page__title').innerText.trim(),
        exampleURL: () => ['https://minecraft-serverlist.com/server/', '517', '/vote'],
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        oneProject: () => 3
    },
    // Похоже на копию ServerListGames, как минимум по технической части схоже
    'findmcserver.com': {
        pageURL: (project) => 'https://findmcserver.com/server/' + project.id,
        voteURL: (project) => 'https://findmcserver.com/server/' + project.id,
        projectName: () => null, // сайт-конструктор, отдаёт пустую страницу со скриптами на загрузку, название достать слишком сложно
        exampleURL: () => ['https://findmcserver.com/server/', 'sootmc', ''],
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hour: 0})
    },
    'serveurliste.com': {
        pageURL: (project) => 'https://www.serveurliste.com/' + project.game + '/' + project.id,
        voteURL: (project) => 'https://www.serveurliste.com/' + project.game + '/' + project.id + '#voter',
        projectName: (doc) => doc.querySelector('div.container h1.text-center').innerText,
        exampleURL: () => ['https://www.serveurliste.com/minecraft/', 'nossaria-serveur-survie', '#voter'],
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
        timeout: () => ({hours: 1, minutes: 30}),
        limitedCountVote: () => true,
        oneProject: () => 1
    },
    'craftbook.cz': {
        pageURL: (project) => 'https://craftbook.cz/server/' + project.id,
        voteURL: (project) => 'https://craftbook.cz/server/' + project.id,
        projectName: (doc) => doc.querySelector('#desc h1').textContent,
        exampleURL: () => ['https://craftbook.cz/server/', 'mc.hesovodoupe.cz:25565', ''],
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hours: 2}),
        limitedCountVote: () => true
    },
    'rovelstars.com': {
        pageURL: (project) => 'https://' + project.game + '.rovelstars.com/' + project.listing + '/' + project.id,
        voteURL: (project) => 'https://' + project.game + '.rovelstars.com/' + project.listing + '/' + project.id + '/vote',
        projectName: (doc) => doc.querySelector('.hero-body h1.title').innerText.trim(),
        exampleURL: () => ['https://discord.rovelstars.com/bots/', '778697286950715413', '/vote'],
        parseURL: (url) => {
            const project = {}
            project.game = url.hostname.split('.')[0]
            project.listing = url.pathname.split('/')[1]
            project.id = url.pathname.split('/')[2]
            return project
        },
        timeout: () => ({hours: 24}),
        exampleURLListing: () => ['https://discord.rovelstars.com/', 'bots', '/778697286950715413/vote'],
        defaultListing: () => 'bots',
        listingList: () => new Map([
            ['bots', 'Bots']
        ]),
        exampleURLGame: () => ['https://', 'discord', '.rovelstars.com/bots/778697286950715413/vote'],
        defaultGame: () => 'discord',
        gameList: () => new Map([
            ['discord', 'Discord']
        ]),
        notRequiredNick: () => true,
        notRequiredCaptcha: () => true,
        needAdditionalOrigins: ()=> ['https://discord.com/oauth2/*']
    },
    'infinitybots.gg': {
        pageURL: (project) => 'https://infinitybots.gg/bot/' + project.id,
        voteURL: (project) => 'https://infinitybots.gg/bot/' + project.id + '/vote',
        projectName: (doc) => doc.querySelector('title').innerText.trim().replaceAll(' | Infinity Bots', ''),
        exampleURL: () => ['https://infinitybots.gg/bot/', '1047520294685909158', '/vote'],
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hours: 6}),
        notRequiredNick: () => true,
        needAdditionalOrigins: ()=> ['https://discord.com/oauth2/*']
    },
    'botlist.me': {
        pageURL: (project) => 'https://botlist.me/bots/' + project.id,
        voteURL: (project) => 'https://botlist.me/bots/' + project.id + '/vote',
        projectName: (doc) => doc.querySelector('title').innerText.trim().replaceAll(' | Discord Bot', ''),
        exampleURL: () => ['https://botlist.me/bots/', '1052586565395828778', '/vote'],
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hours: 12}),
        notRequiredNick: () => true,
        notRequiredCaptcha: () => true,
        needAdditionalOrigins: ()=> ['https://discord.com/oauth2/*']
    },
    'topminecraft.io': {
        pageURL: (project) => 'https://topminecraft.io/' + project.lang +'/' + project.id,
        voteURL: (project) => 'https://topminecraft.io/' + project.lang +'/' + project.id + '/vote',
        projectName: (doc) => doc.querySelector('div.head h1').textContent,
        exampleURL: () => ['https://topminecraft.io/fr/', 'vikicraft-5', '/vote'],
        parseURL: (url) => ({lang: url.pathname.split('/')[1], id: url.pathname.split('/')[2]}),
        defaultLand: () => 'fr',
        langList: () => new Map([
            ['en', 'English'],
            ['fr', 'Français']
        ])
    },
    'minelist.net': {
        pageURL: (project) => 'https://minelist.net/server/' + project.id,
        voteURL: (project) => 'https://minelist.net/vote/' + project.id,
        projectName: (doc) => doc.querySelector('.panel-heading h1').innerText,
        exampleURL: () => ['https://minelist.net/server/', '2496', ''],
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hour: 6})
    },
    'liste-serv-minecraft.fr': {
        pageURL: (project) => 'https://liste-serv-minecraft.fr/serveur?id=' + project.id,
        voteURL: (project) => 'https://liste-serv-minecraft.fr/serveur?id=' + project.id,
        projectName: (doc) => doc.querySelector('#page h1').innerText,
        exampleURL: () => ['https://liste-serv-minecraft.fr/serveur?id=', '353', ''],
        parseURL: (url) => ({id: url.searchParams.get('id')}),
        // TODO должен быть такой таймаут, но пока ещё не реализован таймаут по минутам, будем на 30 минут позже голосовать
        // timeout: () => ({hour: 0, minute: 30})
        timeout: () => ({hour: 1})
    },
    'play-minecraft-servers.com': {
        pageURL: (project) => 'https://play-minecraft-servers.com/minecraft-servers/' + project.id + '/',
        voteURL: (project) => 'https://play-minecraft-servers.com/minecraft-servers/' + project.id + '/?tab=vote',
        projectName: (doc) => doc.querySelector('.server-title h2').innerText,
        exampleURL: () => ['https://play-minecraft-servers.com/minecraft-servers/', 'opblocks', '/?tab=vote'],
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        timeout: () => ({hour: 0}),
        notRequiredCaptcha: () => true,
        oneProject: () => 1
    },
    'minecraft.menu': {
        pageURL: (project) => 'https://minecraft.menu/' + project.id,
        voteURL: (project) => 'https://minecraft.menu/' + project.id + '/vote',
        projectName: (doc) => doc.querySelector('.server.icon').nextSibling.textContent,
        exampleURL: () => ['https://minecraft.menu/', 'server-insanitycraft-1-20.1279', '/vote'],
        parseURL: (url) => ({id: url.pathname.split('/')[1]}),
        timeout: () => ({hours: 24})
    },
    'minehut.com': {
        pageURL: (project) => 'https://minehut.com/sl/server/' + project.id,
        voteURL: (project) => 'https://minehut.com/sl/server/' + project.id,
        projectName: (doc) => doc.querySelector('.ant-card-body h5').innerText,
        exampleURL: () => ['https://minehut.com/sl/server/', '3fNN/scufflemc', ''],
        parseURL: (url) => ({id: url.pathname.split('/')[3] + '/' + url.pathname.split('/')[4]}),
        timeout: () => ({hours: 6})
    },
    'mc-liste.de': {
        pageURL: (project) => 'https://www.mc-liste.de/server/' + project.id,
        voteURL: (project) => 'https://www.mc-liste.de/server/' + project.id + '/vote',
        projectName: (doc) => doc.querySelector('.srvName').innerText,
        exampleURL: () => ['https://www.mc-liste.de/server/', '54', '/vote'],
        parseURL: (url) => ({id: url.pathname.split('/')[2]}),
        alertManualCaptcha: () => true
    },
    Custom: {
        pageURL: (project) => project.responseURL,
        voteURL: (project) => project.responseURL,
        projectName: () => '',
        exampleURL: () => ['', '', ''],
        parseURL: () => ({}),
        silentVote: () => true,
        notRequiredCaptcha: () => true
    }
}


// Если у этого мониторинга (сайта) несколько подпроектов или доменов
allProjects['topcraft.club'] = allProjects['topcraft.ru']

allProjects['ark-servers.net'] = allProjects['listforge.net']
allProjects['arma3-servers.net'] = allProjects['listforge.net']
allProjects['atlas-servers.io'] = allProjects['listforge.net']
allProjects['conan-exiles.com'] = allProjects['listforge.net']
allProjects['counter-strike-servers.net'] = allProjects['listforge.net']
allProjects['cubeworld-servers.com'] = allProjects['listforge.net']
allProjects['dayz-servers.org'] = allProjects['listforge.net']
allProjects['ecoservers.io'] = allProjects['listforge.net']
allProjects['empyrion-servers.com'] = allProjects['listforge.net']
allProjects['gmod-servers.com'] = allProjects['listforge.net']
allProjects['hurtworld-servers.net'] = allProjects['listforge.net']
allProjects['hytale-servers.io'] = allProjects['listforge.net']
allProjects['life-is-feudal.org'] = allProjects['listforge.net']
allProjects['minecraft-mp.com'] = allProjects['listforge.net']
allProjects['minecraftpocket-servers.com'] = allProjects['listforge.net']
allProjects['minecraft-tracker.com'] = allProjects['listforge.net']
allProjects['miscreated-servers.com'] = allProjects['listforge.net']
allProjects['reign-of-kings.net'] = allProjects['listforge.net']
allProjects['rust-servers.net'] = allProjects['listforge.net']
allProjects['space-engineers.com'] = allProjects['listforge.net']
allProjects['squad-servers.com'] = allProjects['listforge.net']
allProjects['starbound-servers.net'] = allProjects['listforge.net']
allProjects['tf2-servers.com'] = allProjects['listforge.net']
allProjects['teamspeak-servers.org'] = allProjects['listforge.net']
allProjects['terraria-servers.com'] = allProjects['listforge.net']
allProjects['unturned-servers.net'] = allProjects['listforge.net']
allProjects['vrising-servers.net'] = allProjects['listforge.net']
allProjects['valheim-servers.io'] = allProjects['listforge.net']
allProjects['wurm-unlimited.com'] = allProjects['listforge.net']

allProjects['serverpact.nl'] = allProjects['serverpact.com']
allProjects['minecraftserverlijst.nl'] = allProjects['serverpact.com']
allProjects['minecraftserverlist.eu'] = allProjects['serverpact.com']

allProjects['top-serveurs.net'] = allProjects['top-games.net']

allProjects['minecraft-news.net'] = allProjects['minecraftkrant.nl']

allProjects['pixelmonservers.com'] = allProjects['mineservers.com']
allProjects['tekkitserverlist.com'] = allProjects['mineservers.com']
allProjects['technicservers.com'] = allProjects['mineservers.com']
allProjects['ftbservers.com'] = allProjects['mineservers.com']
allProjects['attackofthebteamservers.com'] = allProjects['mineservers.com']

allProjects['loliland.net'] = allProjects['loliland.ru']

const getDomainWithoutSubdomain = url => {
    url = url.toLowerCase()
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
// if (typeof db !== 'undefined' && typeof settings !== 'undefined' && settings.disabledNotifStart != null && !settings.disabledSendErrorSentry && (settings.enabledReportTimeout || !settings.enabledReportTooManyAttempts)) {
//     settings.enabledReportTimeout = false
//     settings.enabledReportTooManyAttempts = true
//     db.put('other', settings, 'settings')
// }