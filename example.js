const RaiClient = require("./lib");

const RAI_ADDRESS =
  "xrb_3t6k35gi95xu6tergt6p69ck76ogmitsa8mnijtpxm9fkcm736xtoncuohr3";

const client = new RaiClient("http://[::1]:7076");
client.account_balance(RAI_ADDRESS).then(balance => console.log(balance));
client
  .account_info(RAI_ADDRESS, true, true, true)
  .then(count => console.log(count));
client.account_history(RAI_ADDRESS, 10).then(history => console.log(history));
client.block_count().then(count => console.log(count));
client.block_count_type().then(count_type => console.log(count_type));
