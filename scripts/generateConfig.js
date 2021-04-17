const { writeFileSync } = require("fs");
const { join } = require("path");

const data = {
  pluginsFolder: "../plugins",
  releaseFolder: "../release",
  addInstallScript: true,
  copyToBD: process.argv[2] === "local",
};

writeFileSync(
  join(__dirname, "../BDPluginLibrary/config.json"),
  JSON.stringify(data)
);
