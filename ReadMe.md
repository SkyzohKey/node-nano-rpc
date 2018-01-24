# RaiBlocks NodeJS RPC Client

[![npm version](https://nodei.co/npm/node-raiblocks-rpc.png)](https://www.npmjs.com/package/node-raiblocks-rpc)

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FSkyzohKey%2Fnode-raiblocks-rpc.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2FSkyzohKey%2Fnode-raiblocks-rpc?ref=badge_small) [![npm version](https://badge.fury.io/js/node-raiblocks-rpc.svg)](https://badge.fury.io/js/node-raiblocks-rpc)

RaiBlocks RPC client written with NodeJS.  
It produces JSON objects or strings as output, wrapped in native promises.

All RPC calls are defined here:
https://github.com/clemahieu/raiblocks/wiki/RPC-protocol

## [Become a patron](https://www.patreon.com/bePatron?u=2330345) &nbsp;~&nbsp; [Donate](#donations)

#### Table of Contents

* [Getting Started](#getting-started)
  * [Examples](#examples)
  * [Promise-wrapped responses](#promise-wrapped-responses)
  * [Methods Names](#methods-names)
  * [Arguments](#arguments)
  * [Returned value](#returned-value)
* [Testing](#testing)
* [Possible future features](#possible-future-features)
* [Donations](#donations)
* [License (MIT)](#license)

## Getting Started

1. Install the npm package:

```bash
$ yarn add node-raiblocks-rpc
# or
$ npm install node-raiblocks-rpc --save
```

2. Require the RPC client into your project:

```js
const RaiClient = require('node-raiblocks-rpc');
const NODE_ADDRESS = 'http://[urltonode|iptonode]:port';

/**
 * decodeJSON is an optional boolean argument.
 * When set to true (default), the JSON string response is
 * parsed into a JSON object. Otherwise the string is returned.
 */
const client = new RaiClient(NODE_ADDRESS [, decodeJSON]);
```

3. Use methods attached to `client` to send RPC calls:

### Examples

Head to the [`examples.js`](examples.js) file for even more!

```js
const client = new RaiClient(NODE_ADDRESS [, decodeJSON]);

// Some methods do not require arguments:
client
  .block_count()
  .then(count => {
    console.log(count);
    /**
     * {
     *   "count": "1826834",
     *   "unchecked": "3385205"
     * }
     */
  })
  .catch(e => {
    // Deal with your errors here.
  });

// Some methods require arguments:
client
  .account_balance("xrb_mySuperAddress")
  .then(balance => {
    console.log(balance);
    /**
     * {
     *   "balance": "325586539664609129644855132177",
     *   "pending": "2309370929000000000000000000000000"
     * }
     */
  })
  .catch(e => {
    // Deal with your errors here.
  });
```

### Promise-wrapped responses

All method calls return native NodeJS promises. You need to use the
`then()` / `catch()` pattern shown above. If the call was succesful,
the data will be passed to `then()`, otherwise the error will be passed
to `catch()`.

### Methods Names

The method calls are the same as the original RPC actions defined
on the RaiBlocks wiki.
(See https://github.com/clemahieu/raiblocks/wiki/RPC-protocol)

Example1: on the RaiBlocks wiki `account_balance` is called with `account`.
For the NodeJS client, the method is `account_balance` and the argument is the account string.

### Arguments

The arguments to use for those methods are detailed in the inline documentation of
the `index.js`. There are the same as those mentioned in the Monero documentation:
https://github.com/clemahieu/raiblocks/wiki/RPC-protocol

### Returned value

If you havent specified any `decodeJSON` argument when you
instantiated `RaiClient`, by default the returned data will already be parsed
into a JSON object for you. Otherwise you will receive the original JSON string
returned by the RaiBlocks network.

## Testing

Testing is done with `mocha`, `chai` and `chai-as-promised` to test promises.

To run the tests:

```bash
$ yarn test
# or
$ npm run test
```

The tests are located in the `lib/tests.js` file. They perform actual API calls to the RaiBlocks network through a local node. In order to prevent the tests from failing because of a timeout, tests are run with a `timeout` option of 100s. Tests can still fail if the local node is too slow.

If you want to just run one set of test (i.e a `describe` block), for let's say the `account_balance()` function, you can do so with this command:

```bash
$ ./node_modules/mocha/bin/mocha --grep [functionNameHere] --timeout 10000
```

For example, if you want to test `account_balance`:

```bash
$ ./node_modules/mocha/bin/mocha --grep account_balance --timeout 10000
```

You can be even more specific by adding `only` to the individual tests. Example for `account_balance()`:

```diff
describe("RaiClient.account_balance()", done => {
+ it.only("should retrieve account balance", () => {
- it("should retrieve account balanve", () => {
    expect(client.account_balance(WALLET_ADDRESS))
      .to.eventually.contain('"balance"')
      .and.to.eventually.contain('"pending"')
      .notify(done);
  });
});
```

## Possible future features

* Caching of some responses
  * First with javascript objects
  * Then with some external db, like Redis or SQLLite
* Make the library Isomorphic, i.e work in web-browsers as well
* Make the method calls also support callbacks
* Setup automated testing with travis. Will need first to build a mock object for RaiBlocks to have deterministic tests

## Donations

I currently work on this project during my free-time, but also during my work-time. As I'm my own boss, I take work time to work on personnal projects that I really believes in. But during this time, I don't win any money. I'm not doing that for money.

Anyway, if you consider support me, you can pay me a pack of Monster's cans for moore productive coding, :D.

I accept donations in form of RaiBlocks, Monero, Bitcoin, Etherum & IntenseCoin. You can also Patreon me !

[![Become a patron](https://i.imgur.com/oWouhEe.png)](https://www.patreon.com/bePatron?u=2330345)

```
1. Monero (XMR): 47XpVhUHahViCZHuZPc2Z6ivLraidX7AxbM8b2StdPcQGwjDGY14eqj9ippW7Pdrqj9d2y4xvwChzePQAqG1NvqQ775FKxg
2. Bitcoin (BTC/XBT): 18BqyV9mNbFLi5HNNnfUprnPJyJDFP59Xh
3. Etherum (ETH): 0x56E3273D42B40d47E122fF62108dEDC974A4206e
4. RaiBlocks (XRB): xrb_1ezazq8dkyashxeorb6kwncoc1imodd36yfetsje1ase71joy3qsnk8papku
4. IntenseCoin (ITNS): iz5F814eDfX7gbUucu17E5YUBGADYGLDRhMfKQjfXwv9S1UDPaJKcgEiUUWm9vDeJ7JVcPWo7kZRmTFtcVcssc1h28zguw8iE
```

If you wish to support me, but doesn't have money for, you can still message me on Wire and give me some free hugs! :D

* Wire handle: **@SkyzohKey**

## License
You can find an in-depth analysis of the dependencies license on [FOSSA](https://app.fossa.io/reports/c98c4d73-3c54-4bdb-b804-678f37c429fd)

This project is licensed under [The MIT License](LICENSE).

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FSkyzohKey%2Fnode-raiblocks-rpc.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2FSkyzohKey%2Fnode-raiblocks-rpc?ref=badge_large)
