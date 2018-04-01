const Service = require("node-windows").Service;

let svc = new Service({
  name: "AlexaSubsonic",
  description: "Alexa Subsonic Skill",
  script: require("path").join(__dirname, "server.js"),
  maxRetries: 3
});

svc.on("install", function() {
  console.log("Install complete. Starting...");
  svc.start();
  console.log("Service started");
});

svc.on("uninstall", function() {
  console.log("Uninstall complete.");
  console.log("The service exists: ", svc.exists);
});

const args = process.argv.slice(2);
if (args[0] == "install") {
  svc.install();
}
if (args[0] == "uninstall") {
  svc.uninstall();
}
