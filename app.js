const fs = require('fs');
const request = require('request');

const tmi = require('tmi.js');

const bancho = require("bancho.js");

const secret = JSON.parse(fs.readFileSync("./secret.json"))
const osuPrefix = "#"
const twitchPrefix = "!"

var req = "0"
var url = 'http://localhost:24050/json';

const osuClient = new bancho.BanchoClient({
    username: secret["OSU"]["USERNAME"],
    password: secret["OSU"]["PASSWORD"]
});

const twitchClient = new tmi.Client({
	options: { debug: false, messagesLogLevel: "info" },
	connection: {
		reconnect: true,
		secure: true
	},
	identity: {
		username: secret["TWITCH"]["USERNAME"],
		password: secret["TWITCH"]["PASSWORD"]
	},
	channels: [ 'darukity' ]
});

const startBot = async () => {
    try {
        await twitchClient.connect();
        console.log("Twitch Bot connected")

        await osuClient.connect();
        console.log("osu!Bot connected")

        twitchClient.on('message', (channel, tags, message, self) => {
            if(self) return;
            if(message[0] !== twitchPrefix) return;
            const command = message.toLowerCase().split(" ");
            switch(command[0]){
                //bot related commands
                case twitchPrefix + "help":

                    break;
                //osu related commands
                case twitchPrefix + "np":
                    request(url, function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                           var osuJson = JSON.parse(body);
                           var np_say = `Now playing: ${osuJson["menu"]["bm"]["metadata"]["artist"]} - ${osuJson["menu"]["bm"]["metadata"]["title"]} [${osuJson["menu"]["bm"]["metadata"]["difficulty"]}] + ${osuJson["menu"]["mods"]["str"]} ${osuJson["menu"]["bm"]["stats"]["SR"]}★ Download: https://osu.ppy.sh/b/${osuJson["menu"]["bm"]["id"]}`
                           twitchClient.say(channel, `@${tags.username}, ${np_say}`)
                        } else {
                            twitchClient.say(channel, `@${tags.username}, he's not playing osu right now, or his code is shit`)
                        }
                    });
                    break;
                case twitchPrefix + "nppp":
                    request(url, function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                           var osuJson = JSON.parse(body);
                           var np_say = `Pp for: ${osuJson["menu"]["bm"]["metadata"]["artist"]} - ${osuJson["menu"]["bm"]["metadata"]["title"]} [${osuJson["menu"]["bm"]["metadata"]["difficulty"]}] + ${osuJson["menu"]["mods"]["str"]} 95%: ${osuJson["menu"]["pp"]["95"]}pp | 98%: ${osuJson["menu"]["pp"]["98"]}pp | 99%: ${osuJson["menu"]["pp"]["99"]}pp | 100%: ${osuJson["menu"]["pp"]["100"]}pp Download: https://osu.ppy.sh/b/${osuJson["menu"]["bm"]["id"]}`
                           twitchClient.say(channel, `@${tags.username}, ${np_say}`)
                        } else {
                            twitchClient.say(channel, `@${tags.username}, he's not playing osu right now, or his code is shit`)
                        }
                    });
                    break;
                case twitchPrefix + "req":
                    if(tags.username != "darukity" && req === "0"){
                        twitchClient.say(channel, `@${tags.username}, The requests are off rightnow`)
                        return;
                    }
                    if(tags.username === "darukity"){
                        if(command[1] === "on"){
                            if(req === 1){
                                twitchClient.say(channel, `@${tags.username}, The requests already are on`)
                                return;
                            }
                            req = 1
                            twitchClient.say(channel, `@${tags.username}, Requests on`)
                            return;
                        } else if(command[1] === "off"){
                            if(req === 0){
                                twitchClient.say(channel, `@${tags.username}, The requests already are off`)
                                return;
                            }
                            req = 0
                            twitchClient.say(channel, `@${tags.username}, Requests off`)
                            return;
                        }
                    }
                    if(!command[1].split("/").includes("osu.ppy.sh")){
                        twitchClient.say(channel, `@${tags.username}, You need to use a valid beatmap link`)
                    }
                    osuClient.getUser("Darukity").sendMessage(`${tags.username} from twitch chat: ${command[1]}`)
                    break;
                //social networks related
                case twitchPrefix + "tiktok":
                    break;
                default:
                    twitchClient.say(channel, `@${tags.username}, This command does not exists, please type ${twitchPrefix}help to get a list of commands`)
            }
            console.log(command)
        });

        osuClient.on("PM", async({ message, user}) => {
            if(user.ircUsername === OSU_USERNAME) return;
            if(user.ircUsername != "Darukity") return;
            if(message[0] !== osuPrefix) return;

            const command = message.toLowerCase().split(" ");
            switch(command[0]) {
                case osuPrefix + "ping":
                    return await user.sendMessage(`pong`);
                case osuPrefix + "req":
                    if(command[1] === "on"){
                        if(req === 1){
                            osuClient.getUser("Darukity").sendMessage(`request are already on`)
                            return;
                        }
                        req = 1
                        osuClient.getUser("Darukity").sendMessage(`request on`)
                        return;
                    } else if(command[1] === "off"){
                        if(req === 0){
                            osuClient.getUser("Darukity").sendMessage(`request are already off`)
                            return;
                        }
                        req = 0
                        osuClient.getUser("Darukity").sendMessage(`request off`)
                        return;
                    }

                default:
                    return await user.sendMessage(`yé pô compris`);
            }
        });

    } catch (err) {
        console.log(err);
    }
};

startBot()