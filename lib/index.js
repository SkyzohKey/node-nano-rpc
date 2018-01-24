const net = require("net");
const { URL } = require("url");
const http = require("http");
const https = require("https");

/**
 * @class RaiClient
 * @description An RPC Client for RaiBlocks. The official RPC API is here:
 *              https://github.com/clemahieu/raiblocks/wiki/RPC-protocol
 */
class RaiClient {
  /*
   * @function constructor
   * @description Build an instance of `RaiClient`
   * @param {string} nodeAddress - The full address of the daemon node to connect to
   *                               Example1: 'http://mynodeurl:30400'
   *                               Example2: 'http://12.34.345.12:30400'
   * @param {bool} deserializeJSON - Whether to deserialize monero responses
   *                                 as JSON objects. Default to true.
   */
  constructor(nodeAddress, deserializeJSON = true) {
    this.nodeAddress = nodeAddress;
    this.deserializeJSON = deserializeJSON;
  }

  /**
   * @function _send
   * @private
   * @description Send the request to the daemon
   * @param {string} method - the name of the RPC method
   * @param {Object|Array} params - Parameters to be passed to the RPC method
   * @return {Promise} - A Promise which is resolved if the request succesfully
   *                      fetch the data, and rejected otherwise. Failure can happen
   *                      either because of a problem of the request, or before the
   *                      request happen, when `JSON.stringify` fails
   */
  _send(method, params = undefined) {
    return new Promise((resolve, reject) => {
      var req = {};
      try {
        req = this._buildRPCReq(method, params);
      } catch (err) {
        return reject(err);
      }

      // Take HTTPS urls in consideration.
      const url = new URL(req.url);
      const lib = url.protocol === "https" ? https : http;
      const requestOptions = {
        hostname: url.hostname,
        port: url.port,
        method: "POST",
        path: url.pathname
      };

      const request = lib.request(requestOptions, response => {
        if (response.statusCode < 200 || response.statusCode > 299) {
          reject(
            new Error(
              "Failed to fetch URL. Status code: " + response.statusCode
            )
          );
        }

        const body = [];

        response.on("data", chunk => {
          body.push(chunk);
        });

        response.on("end", () => {
          const data = body.join("");

          if (!this.deserializeJSON) {
            return resolve(data);
          }

          try {
            return resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      });

      request.on("error", e => {
        reject(e);
      });

      request.write(req.body);
      request.end();
    });
  }

  /**
   * @function _buildRPCReq
   * @private
   * @description Create an RPC request object to be later used by `#_send`.
   * @param {string} action - A given RPC action.
   * @param {Object|Array} params - Parameters to be passed to the RPC daemon
   * @return {Object} Returns an object containing the request (url, body).
   */
  _buildRPCReq(action, params) {
    const req = {};
    const payload = null;

    req.url = this.nodeAddress + "/";

    try {
      if (typeof params === "undefined") {
        req.body = JSON.stringify({ action: action });
      } else {
        req.body = JSON.stringify({
          action: action,
          ...params
        });
      }
      return req;
    } catch (e) {
      throw new Error(e);
    }
  }

  /**
   * Returns how many RAW is owned and how many have not yet been received by account.
   *
   * @param {string} account - The XRB account address.
   */
  account_balance(account) {
    return this._send("account_balance", { account });
  }

  /**
   * Get number of blocks for a specific account
   * @param {string} account - The XRB account address.
   */
  account_block_count(account) {
    return this._send("account_block_count", { account });
  }

  /**
   * Returns frontier, open block, change representative block, balance,
   * last modified timestamp from local database & block count for account
   * @param {string} account - The XRB account address.
   * @param {boolean} representative - Additionally returns representative for account (v8.1+)
   * @param {boolean} weight - Additionally returns voting weight for account (v8.1+)
   * @param {boolean} pending - Additionally returns pending balance for account (v8.1+)
   */
  account_info(
    account,
    representative = false,
    weight = false,
    pending = false
  ) {
    return this._send("account_info", {
      account,
      representative,
      weight,
      pending
    });
  }

  /**
   * Creates a new account, insert next deterministic key in wallet
   * @enable_control required
   * @param {string} wallet - An XRB Wallet.
   * @param {boolean} work - Disables work generation after creating account (v8.1+)
   */
  account_create(wallet, work = true) {
    return this._send("account_create", { wallet, work });
  }

  /**
   * Get account number for the public key
   * @param {string} key - An XRB public key.
   */
  account_get(key) {
    return this._send("account_get", { key });
  }

  /**
   * Reports send/receive information for a account
   * @param {string} account - The XRB account address.
   * @param {Number} count - Response length (default 1)
   */
  account_history(account, count = 1) {
    return this._send("account_history", { account, count });
  }

  /**
   * Lists all the accounts inside wallet
   * @param {string} wallet - An XRB Wallet.
   */
  account_list(wallet) {
    return this._send("account_list", { wallet });
  }

  /**
   * Moves accounts from source to wallet
   * @enable_control required
   * @param {string} wallet - Target XRB Wallet.
   * @param {string} source - Source XRB Wallet.
   * @param {Array<string>} accounts - A list of accounts to move.
   */
  account_move(wallet, source, accounts = []) {
    return this._send("account_move", { wallet, source, accounts });
  }

  /**
   * Get the public key for account
   * @param {string} account - AAn XRB account.
   */
  account_key(account) {
    return this._send("account_key", { account });
  }

  /**
   * Remove account from wallet
   * @enable_control required
   * @param {string} wallet - An XRB Wallet to remove from.
   * @param {string} account - An XRB account to be removed.
   */
  account_remove(wallet, account) {
    return this._send("account_remove", { wallet, account });
  }

  /**
   * Returns the representative for account
   * @param {string} account - The XRB account address.
   */
  account_representative(account) {
    return this._send("account_representative", { account });
  }

  /**
   * Sets the representative for account in wallet
   * @enable_control required
   * @param {string} wallet - An XRB Wallet.
   * @param {string} account - An XRB account.
   * @param {string} representative - An XRB representative account.
   * @param {boolean} work - Disables work generation after creating account (v8.1+)
   */
  account_representative_set(wallet, account, representative, work = false) {
    return this._send("account_representative_set", {
      wallet,
      account,
      representative,
      work
    });
  }

  /**
   * Returns the voting weight for account
   * @param {string} account - The XRB account address.
   */
  account_weight(account) {
    return this._send("account_weight", { account });
  }

  /**
   * Returns how many RAW is owned and how many have not yet been received by accounts list
   * @param {Array<string>} accounts - A list of XRB account address.
   */
  accounts_balances(accounts) {
    return this._send("accounts_balances", { accounts });
  }

  /**
   * Creates new accounts, insert next deterministic keys in wallet up to count
   * @enable_control required, version 8.1+
   * @param {string} wallet - An XRB Wallet.
   * @param {Number} count - A number of accounts to generate (defaults to 1).
   * @param {boolean} work - Disables work generation after creating account (v8.1+)
   */
  accounts_create(accounts, count = 1, work = false) {
    return this._send("accounts_create", { accounts, count });
  }

  /**
   * Returns a list of pairs of account and block hash representing the head block for accounts list
   * @param {Array<string>} accounts - A list of XRB account address.
   */
  accounts_frontiers(accounts) {
    return this._send("accounts_frontiers", { accounts });
  }

  /**
   * Creates new accounts, insert next deterministic keys in wallet up to count
   * @param {Array<string>} accounts - A list of XRB account address.
   * @param {Number} count
   * @param {Number} threshold - Returns a list of pending block hashes with amount more or equal to threshold (v8.1+)
   * @param {boolean} source - Returns a list of pending block hashes with amount and source accounts (v8.1+)
   */
  accounts_pending(
    accounts,
    count = 1,
    threshold = 1000000000000000000000000,
    source = false
  ) {
    return this._send("accounts_pending", {
      accounts,
      count,
      threshold,
      source
    });
  }

  /**
   * Returns how many rai are in the public supply
   */
  available_supply() {
    return this._send("available_supply");
  }

  /**
   * Retrieves a json representation of block
   * @param {string} hash - A block hash.
   */
  block(hash) {
    return this._send("block", { hash });
  }

  /**
   * Retrieves a json representations of blocks
   * @param {Array<string>} hashes - A list of block hashes.
   */
  blocks(hashes) {
    return this._send("blocks", { hashes });
  }

  /**
   * Retrieves a json representations of blocks with transaction amount & block account
   * @param {Array<string>} hashes - A list of block hashes.
   */
  blocks_info(hashes, source = false, pending = false) {
    return this._send("blocks_info", { hashes, source, pending });
  }

  /**
   * Returns the account containing block
   * @param {string} hash - A block hash.
   */
  block_account(hash) {
    return this._send("block_account", { hash });
  }

  /**
   * Reports the number of blocks in the ledger and unchecked synchronizing blocks
   */
  block_count() {
    return this._send("block_count");
  }

  /**
   * Reports the number of blocks in the ledger by type (send, receive, open, change)
   */
  block_count_type() {
    return this._send("block_count_type");
  }

  /**
   * Initialize bootstrap to specific IP address and port
   * @param {string} address - A valid network IP address.
   * @param {Number} port - A valid network port.
   */
  bootstrap(address, port) {
    return this._send("bootstrap", { address, port });
  }

  /**
   * Initialize multi-connection bootstrap to random peers
   */
  bootstrap_any() {
    return this._send("bootstrap_any");
  }

  /**
   * Returns a list of block hashes in the account chain starting at block up to count
   * @param {string} block - A block hash.
   * @param {Number} count - Max count of items to return.
   */
  chain(block, count = 1) {
    return this._send("chain", { block, count });
  }

  /**
   * Returns a list of pairs of delegator names given account a representative and its balance
   * @param {string} account - The XRB account address.
   */
  delegators(account) {
    return this._send("delegators", { account });
  }

  /**
   * Get number of delegators for a specific representative account
   * @param {string} account - The XRB account address.
   */
  delegators_count(account) {
    return this._send("delegators_count", { account });
  }

  /**
   * Derive deterministic keypair from seed based on index
   * @param {string} seed - A string used as a seed for deterministic generation.
   * @param {Number} index - Used to derive the key.
   */
  deterministic_key(seed, index) {
    return this._send("deterministic_key", { seed, index });
  }

  /**
   * Returns a list of pairs of account and block hash representing the head block starting at account up to count
   * @param {string} account - The XRB account address.
   * @param {Number} count - How much items to get from the list. (defaults to 1)
   */
  frontiers(account, count = 1) {
    return this._send("frontiers", { account, count });
  }

  /**
   * Reports the number of accounts in the ledger
   */
  frontiers_count() {
    return this._send("frontiers_count");
  }

  /**
   * Reports send/receive information for a chain of blocks
   * @param {string} hash - A block hash.
   * @param {Number} count - How much items to get from the list. (defaults to 1)
   */
  history(hash, count = 1) {
    return this._send("history", { hash, count });
  }

  /**
   * Divide a raw amount down by the Mrai ratio.
   * @param {string} amount - An amount to be converted.
   */
  mrai_from_raw(amount) {
    return this._send("mrai_from_raw", { amount });
  }

  /**
   * Multiply an Mrai amount by the Mrai ratio.
   * @param {string} amount - An amount to be converted.
   */
  mrai_to_raw(amount) {
    return this._send("mrai_to_raw", { amount });
  }

  /**
   * Divide a raw amount down by the krai ratio.
   * @param {string} amount - An amount to be converted.
   */
  krai_from_raw(amount) {
    return this._send("krai_from_raw", { amount });
  }

  /**
   * Multiply an krai amount by the krai ratio.
   * @param {string} amount - An amount to be converted.
   */
  krai_to_raw(amount) {
    return this._send("krai_to_raw", { amount });
  }

  /**
   * Divide a raw amount down by the rai ratio.
   * @param {string} amount - An amount to be converted.
   */
  rai_from_raw(amount) {
    return this._send("rai_from_raw", { amount });
  }

  /**
   * Multiply an rai amount by the rai ratio.
   * @param {string} amount - An amount to be converted.
   */
  rai_to_raw(amount) {
    return this._send("rai_to_raw", { amount });
  }

  /**
   * Tells the node to send a keepalive packet to address:port
   * @enable_control required
   * @param {string} address - A valid network IP address.
   * @param {Number} port - A valid network port.
   */
  keepalive(address, port) {
    return this._send("keepalive", { address, port });
  }

  /**
   * Generates an adhoc random keypair
   */
  key_create() {
    return this._send("key_create");
  }

  /**
   * Derive public key and account number from private key
   * @param {string} key - A private key to derivate from.
   */
  key_expand(key) {
    return this._send("key_expand", { key });
  }

  /**
   * Returns frontier, open block, change representative block, balance,
   * last modified timestamp from local database & block count starting at account up to count
   * @enable_control required, version 8.1+
   *
   * @param {string} account - The XRB account address.
   * @param {Number} count - Defines from where results are returned.
   * @param {boolean} representative - Additionally returns representative for each account.
   * @param {boolean} weight - Additionally returns voting weight for each account.
   * @param {boolean} pending - Additionally returns pending balance for each account.
   * @param {boolean} sorting - Sort the results by DESC.
   */
  ledger(
    account,
    count = 1,
    representative = false,
    weight = false,
    pending = false,
    sorting = false
  ) {
    return this._send("ledger", {
      account,
      count,
      representative,
      weight,
      pending,
      sorting
    });
  }

  /**
   * Creates a json representations of new block based on input data & signed with private key or account in wallet
   * @enable_control required, version 8.1+
   *
   * @param {string} type - The block type.
   * @param {string} key - The block signing key.
   * @param {string} account - An XRB account.
   * @param {string} representative - An XRB representative account.
   * @param {string} source - A block source.
   */
  block_create(type, key, account, representative, source) {
    return this._send("block_create", {
      type,
      key,
      account,
      representative,
      source
    });
  }

  /**
   * Marks all accounts in wallet as available for being used as a payment session.
   * @param {string} wallet - An XRB wallet string.
   */
  payment_init(wallet) {
    return this._send("payment_init", { wallet });
  }

  /**
   * Begin a new payment session.
   * Searches wallet for an account that's marked as available and
   * has a 0 balance. If one is found, the account number is returned
   * and is marked as unavailable. If no account is found,
   * a new account is created, placed in the wallet, and returned.
   *
   * @param {string} wallet - An XRB wallet string.
   */
  payment_begin(wallet) {
    return this._send("payment_begin", { wallet });
  }

  /**
   * Wait for payment of 'amount' to arrive in 'account' or until 'timeout' milliseconds have elapsed.
   * @param {string} account - An XRB account address.
   * @param {Number} amount - An amount of XRB.
   * @param {Number} timeout - Timeout before stoping to wait.
   */
  payment_wait(account, amount, timeout) {
    return this._send("payment_wait", { account, amount, timeout });
  }

  /**
   * End a payment session. Marks the account as available for use in a payment session.
   * @param {string} account - An XRB account address.
   * @param {string} wallet - An XRB wallet string.
   */
  payment_end(account, wallet) {
    return this._send("payment_end", { account, wallet });
  }

  /**
   * Publish block to the network.
   * @param {Object} block - A block to process. Format:
   * https://github.com/clemahieu/raiblocks/wiki/RPC-protocol#process-block
   */
  process(block) {
    return this._send("process", { block });
  }

  /**
   * Receive pending block for account in wallet
   * @param {string} wallet - An XRB wallet address.
   * @param {string} account - An XRB account address.
   * @param {string} block - An XRB block hash.
   */
  receive(wallet, account, block) {
    return this._send("receive", { wallet, account, block });
  }

  /**
   * Returns receive minimum for node
   * @enable_control required, version 8.0+
   */
  receive_minimum() {
    return this._send("receive_minimum");
  }

  /**
   * Set amount as new receive minimum for node until restart
   * @enable_control required, version 8.0+
   */
  receive_minimum_set() {
    return this._send("receive_minimum_set");
  }

  /**
   * Returns a list of pairs of representative and its voting weight
   * @param {Number} count - Count of items to return. (Defaults to 1)
   * @param {boolean} sorting - Sort the returned results by DESC.
   */
  representatives(count = 1, sorting = false) {
    return this._send("representatives");
  }

  /**
   * Returns the default representative for wallet
   * @param {string} wallet - An XRB wallet address.
   */
  wallet_representative(wallet) {
    return this._send("wallet_representative", { wallet });
  }

  /**
   * Sets the default representative for wallet
   * @enable_control required
   * @param {string} wallet - An XRB wallet address.
   * @param {string} representative - An XRB representative account address.
   */
  wallet_representative_set(wallet, representative) {
    return this._send("wallet_representative_set", { wallet, representative });
  }

  /**
   * Rebroadcast blocks starting at hash to the network
   * @param {string} hash - Hash of a block from which broadcast starts.
   * @param {Number} count
   * @param {Number} sources
   * @param {Number} destinations
   */
  republish(hash, count = 1, sources = null, destinations = null) {
    return this._send("republish", { hash, count, sources, destinations });
  }

  /**
   * Tells the node to look for pending blocks for any account in wallet
   * @enable_control required
   * @param {string} wallet - An XRB wallet address.
   */
  search_pending(wallet) {
    return this._send("search_pending", { wallet });
  }

  /**
   * Tells the node to look for pending blocks for any account in all available wallets
   * @enable_control required, version 8.0+
   */
  search_pending_all() {
    return this._send("search_pending_all");
  }

  /**
   * Send amount from source in wallet to destination
   * @enable_control required
   * @param {string} wallet - An XRB wallet address.
   * @param {string} source - An XRB account address.
   * @param {string} destination - The XRB destination account address.
   * @param {Number} amount - An amount of XRB.
   * @param {boolean} work - Uses work value for block from external source (v8.1+)
   */
  send(wallet, source, destination, amount, work = false) {
    return this._send("send", { wallet, source, destination, amount, work });
  }

  /**
   * Method to safely shutdown node
   * @enable_control required
   */
  stop() {
    return this._send("stop");
  }
}

module.exports = RaiClient;
