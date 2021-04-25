module.exports = (Plugin, Library) => {
  const { Logger } = Library;
  return class Wakapi extends Plugin {
    constructor() {
      super();
      this.enabled = true;
    }

    onStart() {
      this.reload();
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

    reload() {
      this.enabled = this.settings.enabled;
    }

    onMessage() {
      this.trySendHeartbeat();
    }

    onSwitch() {
      this.trySendHeartbeat();
    }

    trySendHeartbeat() {
      if (this.enabled !== true) return;
      if (this.settings.wakapi.apikey === "") return;
      // if the user supplied no categoy names we can assume they dont want to track anything
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
      const allowed_categories = this.settings.discord.categories;

      if (category === null || category === undefined) return;

      const category_id = category.discordObject.id;

      // category check
      if (!allowed_categories.includes(category_id)) return;

      // projectmapping
      if (
        this.settings.discord.projectmapping !== "" &&
        this.settings.discord.projectmapping.includes(category_id)
      ) {
        let projects = this.settings.discord.projectmapping.includes(",")
          ? this.settings.discord.projectmapping.split(",")
          : [this.settings.discord.projectmapping];

        projects.forEach((p) => {
          let mapped = p.split("=>");
          if (mapped[0].trim() === category_id) project = mapped[1].trim();
        });
      }

      const request = require("request");
      const os = require("os");
      const { Buffer } = require("buffer");

      const machine = os.hostname();
      const system = os.type().replace("_NT", "");
      const time = Math.round(Date.now() / 1000);

      const heartbeat_obj = [
        {
          entity: "Tickets",
          type: "Tickets",
          category:
            this.settings.tickets.category !== ""
              ? this.settings.tickets.category
              : "Tickets",
          language:
            this.settings.tickets.language !== ""
              ? this.settings.tickets.language
              : "Tickets",
          editor:
            this.settings.tickets.editor !== ""
              ? this.settings.tickets.editor
              : "Discord",
          is_write: true,
          machine: machine,
          operating_system: system,
          project,
          time,
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
        json: heartbeat_obj,
      };

      request(options, (e, r, b) => {
        if (!e && b && r.statusCode === 201) {
          Logger.log("Sent ticket activity");
        } else {
          window.BdApi.alert(
            "Error",
            "Wakapi error: " + b.toString() + " | " + e.toString()
          );
          Logger.err(e);
          Logger.err(b);
        }
      });
    }

    getSettingsPanel() {
      const panel = this.buildSettingsPanel();
      panel.addListener(() => {
        this.reload();
      });
      return panel.getElement();
    }
  };
};
