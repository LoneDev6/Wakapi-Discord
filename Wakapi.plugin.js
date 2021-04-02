//META{"name":"Wakapi"}*//
class Wakapi {

    getApiKey() {
        return "";
    }

    getRequestURL() {
        return "http://localhost:4000/api/heartbeat?api_key=";
    }

    getName() {
        return "Wakapi";
    }

    getDescription() {
        return "Does things with the library";
    }

    getVersion() {
        return "0.0.1";
    }

    getAuthor() {
        return "LoneDev";
    }

    start() {
        if (!global.ZeresPluginLibrary)
            return window.BdApi.alert("Library Missing", `The library plugin needed for ${this.getName()} is missing.<br /><br /> <a href="https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js" target="_blank">Click here to download the library!</a>`);
        ZLibrary.PluginUpdater.checkForUpdate(this.getName(), this.getVersion(), "LINK_TO_RAW_CODE");

        this.focus = () => {
            this.trySendHeartbeat()
        }
        window.addEventListener("focus", this.focus)
    }

    stop() {
        window.removeEventListener("focus", this.focus)
    }

    onMessage() {
        this.trySendHeartbeat()
    }

    onSwitch() {
        this.trySendHeartbeat()
    }

    trySendHeartbeat() {

        const category = ZeresPluginLibrary.DiscordAPI.currentChannel.category;
        if (category == null || category == undefined)
            return;
        if (!category.discordObject.name.includes("tickets")) {
            return;
        }

        const request = require("request");
        const os = require("os");

        const machine = os.hostname();
        const system = os.type().replace("_NT", "");
        const time = Math.round(Date.now() / 1000);

        const obj = [
            {
                entity: "Tickets",
                type: "Tickets",
                category: "Tickets",
                project: "Tickets",
                language: "Tickets",
                editor: "Discord",
                is_write: false,
                machine: machine,
                operating_system: system,
                time: time
            }
        ];

        const headersOpt = {
            "content-type": "application/json",
            "X-Machine-Name": machine,
            "User-Agent": `Discord (${machine})`,
            "Authorization": `Basic ${Buffer.from(this.getApiKey()).toString('base64')}`,
        };
        const options = {
            uri: this.getRequestURL() + this.getApiKey(),
            method: 'POST',
            headers: headersOpt,
            json: obj
        };

        request(options, (e, r, b) => {
            if (!e && b && r.statusCode == 201) {
                console.log("Sent ticket activity")
            } else {
                window.BdApi.alert("Error", "Wakapi error: " + e + " | " + b);
                console.log(e)
                console.log(b)
            }
        });
    }
}
