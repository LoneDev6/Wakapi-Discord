/**
 * @name Wakapi
 * @invite undefined
 * @authorLink undefined
 * @donate undefined
 * @patreon undefined
 * @website https://github.com/LoneDev6/Wakapi-Discord#readme
 * @source https://raw.githubusercontent.com/LoneDev6/Wakapi-Discord/main/release/Wakapi.plugin.js
 */
/*@cc_on
@if (@_jscript)
	
	// Offer to self-install for clueless users that try to run this directly.
	var shell = WScript.CreateObject("WScript.Shell");
	var fs = new ActiveXObject("Scripting.FileSystemObject");
	var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\BetterDiscord\plugins");
	var pathSelf = WScript.ScriptFullName;
	// Put the user at ease by addressing them in the first person
	shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
	if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
		shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
	} else if (!fs.FolderExists(pathPlugins)) {
		shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
	} else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
		fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
		// Show the user where to put plugins in the future
		shell.Exec("explorer " + pathPlugins);
		shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
	}
	WScript.Quit();

@else@*/

module.exports = (() => {
    const config = {"main":"index.js","info":{"name":"Wakapi","authors":[{"name":"LoneDev","discord_id":"289137568144949248","github_username":"LoneDev6","twitter_username":"LoneDev6"},{"name":"MeerBiene","discord_id":"686669011601326281","github_username":"MeerBiene"}],"version":"0.0.2","description":"Enables Wakapi time tracking of time spent in support channels.","github":"https://github.com/LoneDev6/Wakapi-Discord#readme","github_raw":"https://raw.githubusercontent.com/LoneDev6/Wakapi-Discord/main/release/Wakapi.plugin.js"},"changelog":[{"title":"Sample Rate","items":["add smaple rate setting for less network usage"]},{"title":"Settings","items":["added general settings","added discord settings to enable what channel names on which guilds are tracked"]},{"title":"Tracking on other guilds","type":"fixed","items":["Fixed bug where the plugin tracked time spent in support channels on other guilds"]}],"defaultConfig":[{"type":"switch","id":"enabled","name":"Tracking Enabled","value":true},{"type":"category","id":"wakapi","name":"Wakapi Settings","collapsible":true,"shown":false,"settings":[{"type":"textbox","id":"apikey","name":"Wakapi API Key","note":"API Key needed to interact with Wakapi","value":""},{"type":"textbox","id":"apiurl","name":"Wakapi Url","note":"API Url where your Wakapi instance lives","value":"https://wakapi.dev/api/heartbeat"},{"type":"slider","id":"samplerate","name":"Sample Rate","note":"Send a heartbeat every ... seconds","value":90,"min":30,"max":240,"markers":[30,60,90,120,150,180,210,240],"stickToMarkers":true}]},{"type":"category","id":"discord","name":"Discord Settings","collapsible":true,"shown":false,"settings":[{"type":"textbox","id":"trackingguilds","name":"Tracking Guilds","note":"The guild(s) in which you want to track your time. IDs! For multiple guilds, just seperate the guild IDs by comma. If left empty the plugin tracks the time on all guilds.","placeholder":"1234567891011, 1110987654321","value":""},{"type":"textbox","id":"categories","name":"Category Names","note":"Put the category names that indicate a support category and trigger the time tracking action here. For more than one just seperate them by comma.","value":"tickets, support"},{"type":"textbox","id":"projectmapping","name":"Project Mapping","note":"If you want to map the tracked guilds to a certain project, put them in here like so: {GUILID} => {PROJECTNAME}. If left empty, the project shown in wakapi will be \"tickets\".","placeholder":"1234567891011 => ExampleProject, 1110987654321 => ProjectExample","value":""}]}]};

    return !global.ZeresPluginLibrary ? class {
        constructor() {this._config = config;}
        getName() {return config.info.name;}
        getAuthor() {return config.info.authors.map(a => a.name).join(", ");}
        getDescription() {return config.info.description;}
        getVersion() {return config.info.version;}
        load() {
            BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
                confirmText: "Download Now",
                cancelText: "Cancel",
                onConfirm: () => {
                    require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, response, body) => {
                        if (error) return require("electron").shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
                        await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
                    });
                }
            });
        }
        start() {}
        stop() {}
    } : (([Plugin, Api]) => {
        const plugin = (Plugin, Library) => {
  const { Logger } = Library;

  return class Wakapi extends Plugin {
    onStart() {
      if (this.settings.enabled === false) return;
      if (this.settings.wakapi.apikey === "")
        return window.BdApi.alert(
          "No Waka API key found! Place your api key in the settings menu of this plugin in order for the plugin to work."
        );
      Logger.log("Started");
      let focussed = true;
      this.focus = () => {
        this.trySendHeartbeat();
        focussed = true;
      };
      this.unfocus = () => {
        focussed = false;
      };
      window.addEventListener("focus", this.focus);
      window.addEventListener("blur", this.unfocus);

      let trySendHeartbeat_hack = () => this.trySendHeartbeat();

      window.setInterval(function () {
        if (focussed) trySendHeartbeat_hack();
      }, this.settings.wakapi.samplerate * 1000);
    }

    onStop() {
      Logger.log("Stopped");
      window.removeEventListener("focus", this.focus);
      window.removeEventListener("blur", this.unfocus);
    }

    onMessage() {
      this.trySendHeartbeat();
    }

    onSwitch() {
      this.trySendHeartbeat();
    }

    trySendHeartbeat() {
      if (this.settings.enabled !== true) return;
      if (this.settings.wakapi.apikey === "") return;
      // if the user supplied no guild and no categoy names we can assume they dont want to track anything
      if (
        this.settings.discord.trackingguilds === "" ||
        this.settings.discord.categories === ""
      )
        return;
      // dm channel
      if (
        ZeresPluginLibrary.DiscordAPI.currentGuild === null ||
        ZeresPluginLibrary.DiscordAPI.currentGuild === undefined
      )
        return;
      let project = "Tickets";
      const category = ZeresPluginLibrary.DiscordAPI.currentChannel.category;
      const guild_id = ZeresPluginLibrary.DiscordAPI.currentGuild.id;
      const allowed_categories = this.settings.discord.categories;

      if (category === null || category === undefined) return;
      // guild check
      if (!this.settings.discord.trackingguilds.includes(guild_id)) return;
      // category check
      if (!allowed_categories.includes(category.discordObject.name)) return;

      // projectmapping
      if (
        this.settings.discord.projectmapping !== "" &&
        this.settings.discord.projectmapping.includes(guild_id)
      ) {
        let projects = this.settings.discord.projectmapping.includes(",")
          ? this.settings.discord.projectmapping.split(",")
          : [this.settings.discord.projectmapping];

        projects.forEach((p) => {
          let mapped = p.split("=>");
          if (mapped[0].trim() === guild_id) project = mapped[1].trim();
        });
      }

      const request = require("request");
      const os = require("os");
      const { Buffer } = require("buffer");

      const machine = os.hostname();
      const system = os.type().replace("_NT", "");
      const time = Math.round(Date.now() / 1000);

      const obj = [
        {
          entity: "Tickets",
          type: "Tickets",
          category: "Tickets",
          project,
          language: "Tickets",
          editor: "Discord",
          is_write: true,
          machine: machine,
          operating_system: system,
          time: time,
        },
      ];

      const headersOpt = {
        "content-type": "application/json",
        "X-Machine-Name": machine,
        "User-Agent": `wakatime/1.0.0 (${system}-idk) Discord/1.0.0 Discord-wakatime/1.0.0`,
        Authorization: `Basic ${Buffer.from(
          this.settings.wakapi.apikey
        ).toString("base64")}`,
      };

      const options = {
        uri: this.settings.wakapi.apiurl + this.settings.wakapi.apikey,
        method: "POST",
        headers: headersOpt,
        json: obj,
      };

      request(options, (e, r, b) => {
        if (!e && b && r.statusCode === 201) {
          Logger.log("Sent ticket activity");
        } else {
          window.BdApi.alert("Error", "Wakapi error: " + e + " | " + b);
          Logger.err(e);
          Logger.err(b);
        }
      });
    }

    getSettingsPanel() {
      const panel = this.buildSettingsPanel();
      return panel.getElement();
    }
  };
};
        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/