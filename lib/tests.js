const RaiClient = require("./index");
const chai = require("chai");
const chaiPromised = require("chai-as-promised");
const expect = chai.expect;

chai.use(chaiPromised);
chai.should();

/**
 * Workaround to fix a shit bug affecting NodeJS v7.x and v8.x while
 * using Promises rejection.
 */
process.on("unhandledRejection", () => {});

const WALLET_ADDRESS =
  "xrb_3t6k35gi95xu6tergt6p69ck76ogmitsa8mnijtpxm9fkcm736xtoncuohr3"; // Genesis
const NODE_ADDRESS = "http://[::1]:7076";
const SINGLE_BLOCK_HASH =
  "000D1BAEC8EC208142C99059B393051BAC8380F9B5A2E6B2489A277D81789F3F";
const MULTIPLE_BLOCKS_HASHES = [
  "000D1BAEC8EC208142C99059B393051BAC8380F9B5A2E6B2489A277D81789F3F",
  "991CF190094C00F0B68E2E5F75F6BEE95A2E0BD93CEAA4A6734DB9F19B728948"
];

const client = new RaiClient(NODE_ADDRESS, true);

describe("RaiClient", () => {
  it("should instanciate correctly with 1 arg", () => {
    const client = new RaiClient("xrbNodeAddress");
    expect(client).to.have.property("nodeAddress", "xrbNodeAddress");
    expect(client).to.have.property("deserializeJSON", true);
  });
  it("should instanciate correctly with 2 args, deserializeJSON set to TRUE", () => {
    const client = new RaiClient("xrbNodeAddress", true);
    expect(client).to.have.property("nodeAddress", "xrbNodeAddress");
    expect(client).to.have.property("deserializeJSON", true);
  });
  it("should instanciate correctly with 2 args, deserializeJSON set to FALSE", () => {
    const client = new RaiClient("xrbNodeAddress", false);
    expect(client).to.have.property("nodeAddress", "xrbNodeAddress");
    expect(client).to.have.property("deserializeJSON", false);
  });
});

describe("RaiClient::_buildRPCReq()", () => {
  it("should successfuly build a request for RPC methods WITHOUT args", () => {
    const client = new RaiClient("xrbNodeAddress");
    const req = client._buildRPCReq("block_count", undefined);
    const expectedReq = {
      url: "xrbNodeAddress/",
      body: '{"action":"block_count"}'
    };
    expect(req).to.deep.equal(expectedReq);
  });
  it("should successfuly build a request for RPC methods WITH args", () => {
    const client = new RaiClient("xrbNodeAddress");
    const req = client._buildRPCReq("account_balance", {
      account: "xrbWalletAddress"
    });
    const expectedReq = {
      url: "xrbNodeAddress/",
      body: '{"action":"account_balance","account":"xrbWalletAddress"}'
    };
    expect(req).to.deep.equal(expectedReq);
  });
});

describe("RaiClient.account_balance()", done => {
  it("should retrieve account balance", () => {
    expect(client.account_balance(WALLET_ADDRESS))
      .to.eventually.contain('"balance"')
      .and.to.eventually.contain('"pending"')
      .notify(done);
  });
});

describe("RaiClient.account_block_count()", done => {
  it("should retrieve account block count", () => {
    expect(client.account_block_count(WALLET_ADDRESS))
      .to.eventually.contain('"block_count"')
      .notify(done);
  });
});

describe("RaiClient.account_info()", () => {
  it("should retrieve account informations WITHOUT arguments", done => {
    expect(client.account_info(WALLET_ADDRESS))
      .to.eventually.contain('"frontier"')
      .and.to.eventually.contain('"open_block"')
      .and.to.eventually.contain('"representative_block"')
      .and.to.eventually.contain('"balance"')
      .and.to.eventually.contain('"modified_timestamp"')
      .and.to.eventually.contain('"block_count"')
      .notify(done);
  });
  it("should retrieve account informations WITH representative", done => {
    expect(client.account_info(WALLET_ADDRESS, true))
      .to.eventually.contain('"frontier"')
      .and.to.eventually.contain('"open_block"')
      .and.to.eventually.contain('"representative_block"')
      .and.to.eventually.contain('"balance"')
      .and.to.eventually.contain('"modified_timestamp"')
      .and.to.eventually.contain('"block_count"')
      .and.to.eventually.contain('"representative"')
      .notify(done);
  });
  it("should retrieve account informations WITH voting weight", done => {
    expect(client.account_info(WALLET_ADDRESS, false, true))
      .to.eventually.contain('"frontier"')
      .and.to.eventually.contain('"open_block"')
      .and.to.eventually.contain('"representative_block"')
      .and.to.eventually.contain('"balance"')
      .and.to.eventually.contain('"modified_timestamp"')
      .and.to.eventually.contain('"block_count"')
      .and.to.eventually.contain('"weight"')
      .notify(done);
  });
  it("should retrieve account informations WITH pending balance", done => {
    expect(client.account_info(WALLET_ADDRESS, false, false, true))
      .to.eventually.contain('"frontier"')
      .and.to.eventually.contain('"open_block"')
      .and.to.eventually.contain('"representative_block"')
      .and.to.eventually.contain('"balance"')
      .and.to.eventually.contain('"modified_timestamp"')
      .and.to.eventually.contain('"block_count"')
      .and.to.eventually.contain('"pending"')
      .notify(done);
  });
  it("should retrieve account informations WITH all arguments to true", done => {
    expect(client.account_info(WALLET_ADDRESS, true, true, true))
      .to.eventually.contain('"frontier"')
      .and.to.eventually.contain('"open_block"')
      .and.to.eventually.contain('"representative_block"')
      .and.to.eventually.contain('"balance"')
      .and.to.eventually.contain('"modified_timestamp"')
      .and.to.eventually.contain('"block_count"')
      .and.to.eventually.contain('"representative"')
      .and.to.eventually.contain('"weight"')
      .and.to.eventually.contain('"pending"')
      .notify(done);
  });
});

describe("RaiClient.account_create()", done => {
  it("should create an account in the wallet WITHOUT work generation", () => {
    expect(client.account_create("myXRBPublicKey", false))
      .to.eventually.contain('"account"')
      .notify(done);
  });
  it("should create an account in the wallet WITH work generation", () => {
    expect(client.account_create("myXRBPublicKey"))
      .to.eventually.contain('"account"')
      .notify(done);
  });
});

describe("RaiClient.account_get()", done => {
  it("should retrieve an account from public key", () => {
    expect(client.account_get("myXRBPublicKey"))
      .to.eventually.contain('"account"')
      .notify(done);
  });
});

describe("RaiClient.account_history()", done => {
  it("should retrieve account history WITHOUT arguments", () => {
    expect(client.account_history(WALLET_ADDRESS))
      .to.eventually.contain('"history"')
      .notify(done);
  });
  it("should retrieve account history WITH specified count", () => {
    expect(client.account_history(WALLET_ADDRESS, 2))
      .to.eventually.contain('"history"')
      .notify(done);
  });
});

describe("RaiClient.account_list()", done => {
  it("should retrieve a list of accounts from a wallet", () => {
    expect(client.account_list("myXRBPublicKey"))
      .to.eventually.contain('"accounts"')
      .notify(done);
  });
});

describe("RaiClient.account_move()", done => {
  it("should move an account from a wallet to another", () => {
    expect(
      client.account_move("targetWallet", "myXRBWallet", [
        "account1",
        "account2"
      ])
    )
      .to.eventually.contain('"moved"')
      .notify(done);
  });
});

describe("RaiClient.account_key()", done => {
  it("should retrieve the public key for an account", () => {
    expect(client.account_key(WALLET_ADDRESS)).to.eventually.contain('"key"');
  });
});

describe("RaiClient.account_remove()", done => {
  it("should remove an account from the wallet", () => {
    expect(
      client.account_remove("myXRBWallet", WALLET_ADDRESS)
    ).to.eventually.contain('"removed"');
  });
});

describe("RaiClient.account_representative()", done => {
  it("should retrieve the representative for an account", () => {
    expect(client.account_representative(WALLET_ADDRESS)).to.eventually.contain(
      '"representative"'
    );
  });
});

describe("RaiClient.account_representative_set()", done => {
  it("should sets the representative for an account WITHOUT work generation", () => {
    expect(
      client.account_representative_set(
        "myXRBWallet",
        WALLET_ADDRESS,
        "myRepresentative",
        false
      )
    ).to.eventually.contain('"block"');
  });

  it("should sets the representative for an account WITH work generation", () => {
    expect(
      client.account_representative_set(
        "myXRBWallet",
        WALLET_ADDRESS,
        "myRepresentative",
        true
      )
    ).to.eventually.contain('"block"');
  });
});

describe("RaiClient.account_weight()", done => {
  it("should retrieve the voting weight for an account", () => {
    expect(client.account_weight(WALLET_ADDRESS)).to.eventually.contain(
      '"weight"'
    );
  });
});

describe("RaiClient.accounts_balances()", done => {
  it("should retrieve the balances for a list of accounts", () => {
    expect(
      client.accounts_balances([WALLET_ADDRESS, "myOtherAccountAddress"])
    ).to.eventually.contain('"balances"');
  });
});

describe("RaiClient.accounts_create()", done => {
  it("should creates new accounts in wallet up to count WITHOUT work generation", () => {
    expect(
      client.accounts_create([WALLET_ADDRESS, "myOtherAccountAddress"])
    ).to.eventually.contain('"balances"');
  });
  it("should creates new accounts in wallet up to count WITH work generation", () => {
    expect(
      client.accounts_create([WALLET_ADDRESS, "myOtherAccountAddress"], true)
    ).to.eventually.contain('"balances"');
  });
});

describe("RaiClient.accounts_frontiers()", done => {
  it("should retrieve a list of pairs of account and block hash for a list of accounts", () => {
    expect(
      client.accounts_frontiers([WALLET_ADDRESS, "myOtherAccountAddress"])
    ).to.eventually.contain('"frontiers"');
  });
});

describe("RaiClient.accounts_pending()", done => {
  it("should retrieve a list of pairs of account and block hash WITHOUT arguments", () => {
    expect(
      client.accounts_pending([WALLET_ADDRESS, "myOtherAccountAddress"])
    ).to.eventually.contain('"frontiers"');
  });
  it("should retrieve a list of pairs of account and block hash WITH count", () => {
    expect(
      client.accounts_pending([WALLET_ADDRESS, "myOtherAccountAddress"], 2)
    ).to.eventually.contain('"frontiers"');
  });
  it("should retrieve a list of pairs of account and block hash WITH threshold", () => {
    expect(
      client.accounts_pending(
        [WALLET_ADDRESS, "myOtherAccountAddress"],
        null,
        10000000
      )
    ).to.eventually.contain('"frontiers"');
  });
  it("should retrieve a list of pairs of account and block hash WITH source", () => {
    expect(
      client.accounts_pending(
        [WALLET_ADDRESS, "myOtherAccountAddress"],
        null,
        null,
        true
      )
    ).to.eventually.contain('"frontiers"');
  });
  it("should retrieve a list of pairs of account and block hash WITH all arguments", () => {
    expect(
      client.accounts_pending(
        [WALLET_ADDRESS, "myOtherAccountAddress"],
        2,
        10000000,
        true
      )
    ).to.eventually.contain('"frontiers"');
  });
});

describe("RaiClient.available_supply()", done => {
  it("should retrieve how many rai are in the public supply", () => {
    expect(client.available_supply()).to.eventually.contain('"available"');
  });
});

describe("RaiClient.block()", done => {
  it("should retrieves a block", () => {
    expect(client.block(SINGLE_BLOCK_HASH)).to.eventually.contain('"contents"');
  });
});

describe("RaiClient.blocks()", done => {
  it("should retrieves a list of blocks", () => {
    expect(client.blocks(MULTIPLE_BLOCKS_HASHES)).to.eventually.contain(
      '"blocks"'
    );
  });
});

describe("RaiClient.blocks_info()", done => {
  it("should retrieves a more detailed list of blocks WITHOUT arguments", () => {
    expect(client.blocks_info(MULTIPLE_BLOCKS_HASHES)).to.eventually.contain(
      '"blocks"'
    );
  });
  it("should retrieves a more detailed list of blocks WITH source", () => {
    expect(
      client.blocks_info(MULTIPLE_BLOCKS_HASHES, true)
    ).to.eventually.contain('"blocks"');
  });
  it("should retrieves a more detailed list of blocks WITH pending", () => {
    expect(
      client.blocks_info(MULTIPLE_BLOCKS_HASHES, null, true)
    ).to.eventually.contain('"blocks"');
  });
  it("should retrieves a more detailed list of blocks WITH all arguments", () => {
    expect(
      client.blocks_info(MULTIPLE_BLOCKS_HASHES, true, true)
    ).to.eventually.contain('"blocks"');
  });
});
