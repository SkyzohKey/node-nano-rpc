const net = require("net");
const request = require("request");

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
      request.post(req, function(err, req, data) {
        if (err) return reject(err);
        if (!this.deserializeJSON) return resolve(data);
        try {
          return resolve(JSON.parse(data));
        } catch (err) {
          reject(err);
        }
      });
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
   * @param {number} count - Response length (default 1)
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
   * @param {number} count - A number of accounts to generate (defaults to 1).
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
   * @param {number} count
   * @param {number} threshold - Returns a list of pending block hashes with amount more or equal to threshold (v8.1+)
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
   * @param {number} port - A valid network port.
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
}

module.exports = RaiClient;
