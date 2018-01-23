const RaiClient = require("./lib");

const RAI_ADDRESS =
  "xrb_3t6k35gi95xu6tergt6p69ck76ogmitsa8mnijtpxm9fkcm736xtoncuohr3";

const client = new RaiClient("http://[::1]:7076");
client
  .account_balance(RAI_ADDRESS)
  .then(account => console.log("Account balance:", account));
client.block_count().then(count => console.log("Block count:", count));

//client.stop().then(() => console.log("Node stopped. Exiting..."));
