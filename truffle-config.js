/**
 * Use this file to configure your truffle project. It's seeded with some
 * common settings for different networks and features like migrations,
 * compilation and testing. Uncomment the ones you need or modify
 * them to suit your project as necessary.
 *
 * More information about configuration can be found at:
 *
 * trufflesuite.com/docs/advanced/configuration
 *
 * To deploy via Infura you'll need a wallet provider (like @truffle/hdwallet-provider)
 * to sign your transactions before they're sent to a remote public node. Infura accounts
 * are available for free at: infura.io/register.
 *
 * You'll also need a mnemonic - the twelve word phrase the wallet uses to generate
 * public/private key pairs. If you're publishing your code to GitHub make sure you load this
 * phrase from a file you've .gitignored so it doesn't accidentally become public.
 *
 */

 const HDWalletProvider = require('@truffle/hdwallet-provider');


 const MNEMONIC = process.env.MNEMONIC;
 const NODE_API_KEY = process.env.INFURA_KEY || process.env.ALCHEMY_KEY;
 const isInfura = !!process.env.INFURA_KEY;
 const POLYSCAN_API_KEY = process.env.POLYSCAN_API_KEY
 
 const needsNodeAPI =
   process.env.npm_config_argv &&
   (process.env.npm_config_argv.includes("rinkeby") || 
    process.env.npm_config_argv.includes("ropsten") ||
     process.env.npm_config_argv.includes("live"));
 
 if ((!MNEMONIC || !NODE_API_KEY) && needsNodeAPI) {
   console.error("Please set a mnemonic and ALCHEMY_KEY or INFURA_KEY.");
   process.exit(0);
 }
 
 const rinkebyNodeUrl = isInfura
   ? "https://rinkeby.infura.io/v3/" + NODE_API_KEY
   : "https://eth-rinkeby.alchemyapi.io/v2/" + NODE_API_KEY;
 
 const ropstenNodeUrl = isInfura
   ? "https://ropsten.infura.io/v3/" + NODE_API_KEY
   : "https://eth-ropsten.alchemyapi.io/v2/" + NODE_API_KEY;  
 
 const mainnetNodeUrl = isInfura
   ? "https://mainnet.infura.io/v3/" + NODE_API_KEY
   : "https://eth-mainnet.alchemyapi.io/v2/" + NODE_API_KEY;
 
 const polygonMainNodeUrl = isInfura
   ? "https://polygon-mainnet.infura.io/v3/" + NODE_API_KEY
   : "https://polygon-mainnet.g.alchemy.com/v2/" + NODE_API_KEY;

 const polygonTestNodeUrl = isInfura
   ? "https://polygon-mumbai.infura.io/v3/" + NODE_API_KEY
   : "https://polygon-mumbai.g.alchemy.com/v2/" + NODE_API_KEY;
 
 module.exports = {
   /**
    * Networks define how you connect to your ethereum client and let you set the
    * defaults web3 uses to send transactions. If you don't specify one truffle
    * will spin up a development blockchain for you on port 9545 when you
    * run `develop` or `test`. You can ask a truffle command to use a specific
    * network from the command line, e.g
    *
    * $ truffle test --network <network-name>
    */
   networks: {
     // Useful for testing. The `development` name is special - truffle uses it by default
     // if it's defined here and no other network is specified at the command line.
     // You should run a client (like ganache-cli, geth or parity) in a separate terminal
     // tab if you use this network and you must also set the `host`, `port` and `network_id`
     // options below to some value.
     //
      development: {
       host: "127.0.0.1",     // Localhost (default: none)
       port: 7545,            // Standard Ethereum port (default: none)
       gas: 6000000,
       network_id: "*",       // Any network (default: none)
      },
      rinkeby: {
       provider: function () {
         return new HDWalletProvider(MNEMONIC, rinkebyNodeUrl);
       },
       gas: 5000000,
       network_id: "*",
     },
     ropsten: {
       provider: function () {
         return new HDWalletProvider(MNEMONIC, ropstenNodeUrl);
       },
       gas: 5000000,
       network_id: "*",
     },    
     mainnet: {
       provider: function () {
         return new HDWalletProvider(MNEMONIC, mainnetNodeUrl);
       },
       gas: 5000000,
       gasPrice: 1000000000, //1gwei x 
       network_id: "*",      
     },
     mumbai: {
      provider: function () {
        return new HDWalletProvider(MNEMONIC, polygonTestNodeUrl);
      },
      gas: 6000000,
      network_id: "80001",
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
      chainId: 80001,
      networkCheckTimeout: 90000,
      disableConfirmationListener: true
     },

    
     matic: {
      provider: function () {
        return new HDWalletProvider(MNEMONIC, "polygonMainNodeUrl");
      },
      gas: 5000000,
      gasPrice: 300000000000, //300gwei
      network_id: "137",
      confirmations: 2,
      timeoutBlocks: 200,
      networkCheckTimeout: 90000,
      skipDryRun: true,
      chainId: 137
     },
   },

   // Set default mocha options here, use special reporters etc.
   mocha: {
     reporter: "eth-gas-reporter",
     reporterOptions: {
       currency: "USD",
       gasPrice: 2,
     },
   },
 
   // Configure your compilers
   compilers: {
     solc: {
       version: "0.8.3",    // Fetch exact version from solc-bin (default: truffle's version)
       // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
       // settings: {          // See the solidity docs for advice about optimization and evmVersion
       //  optimizer: {
       //    enabled: false,
       //    runs: 200
       //  },
       //  evmVersion: "byzantium"
       // }
     }
   },
 
   // Truffle DB is currently disabled by default; to enable it, change enabled: false to enabled: true
   //
   // Note: if you migrated your contracts prior to enabling this field in your Truffle project and want
   // those previously migrated contracts available in the .db directory, you will need to run the following:
   // $ truffle migrate --reset --compile-all
 
   db: {
     enabled: false
   },

   plugins: [
    'truffle-plugin-verify'
   ],
   api_keys: {
    polygonscan: POLYSCAN_API_KEY
   }
 };
 