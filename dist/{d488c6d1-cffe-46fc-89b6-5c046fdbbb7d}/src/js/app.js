/**
 * Client-side JavaScript part
 */

 App = {
    //web3 is the JS library that we use to get our front-end client to talk to the blockchain
    web3Provider: null,
    contracts: {},
    account: '0x0',
    loading: false,
    tokenPrice: 1000000000000000,
    tokensSold: 0,
    tokensAvailable: 750000,

    init: function() {
        console.log("App initialized...")
         console.log("msg.sender address:", address);
        return App.initWeb3();
    },

    /**
     * Initialize web3
     */ 
     initWeb3: function() {
        if (typeof web3 !== 'undefined') {
            // If a web3 instance is already provided by Meta Mask.
            App.web3Provider = web3.currentProvider;
            web3 = new Web3(web3.currentProvider);
        } else {
            // Specify default instance if no web3 instance provided
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
            web3 = new Web3(App.web3Provider);
        }
        return App.initContracts();
    },

    /**
     * Initialize our smart contracts by getting the contract abstractions from ./build/contracts,
     * which contains the json representation of the contracts.
     * In order to interpret this representation we will use the truffle contract library.
     * REMEMBER TO CONNECT METAMASK TO OUR LOCAL NETW0RK!
     */
     initContracts: function() {
        $.getJSON("TestTokenSale.json", function(testTokenSale) {
            //truffle contract gives us a lot of functionalities to interact with the smart contracts (thanks to the truffle-contract.min.js dependency)
            App.contracts.TestTokenSale = TruffleContract(testTokenSale);
            App.contracts.TestTokenSale.setProvider(App.web3Provider);
            App.contracts.TestTokenSale.deployed().then(function(testTokenSale) {
                console.log("Test Token Sale Address:", testTokenSale.address);
                console.log("msg.sender address:", msg.sender);
            });
        }).done(function() {
        //we don't need to specify all the path of the json files because of the configuration of the bs-config.json file, where we expose the folder ./build/contracts
        $.getJSON("TestToken.json", function(testToken) {
            App.contracts.TestToken = TruffleContract(testToken);
            App.contracts.TestToken.setProvider(App.web3Provider);
            App.contracts.TestToken.deployed().then(function(testToken) {
              console.log("Test Token Address:", testToken.address);
          });

            App.listenForEvents();
            return App.render();
        });
    })
    },

    // Listen for events emitted from the contract
    listenForEvents: function() {
        App.contracts.TestTokenSale.deployed().then(function(instance) {
            instance.Sell({}, {
                fromBlock: 0,
                toBlock: 'latest',
            }).watch(function(error, event) {
                console.log("event triggered", event);
                App.render();
            })
        })
    },

    render: function() {
        if(App.loading) {
            return;
        }
        App.loading = true;

        var loader = $('#loader');
        var content = $('#content');

        loader.show();
        content.hide();

        //load account data
        if(window.ethereum){
            ethereum.request({ method: 'eth_requestAccounts' }).then(function(acc){
                App.account = acc[0];
                console.log("Test account:", App.account)
                $("#accountAddress").html("Your Account: " + App.account);
            })
        }

        // Load token sale contract
        App.contracts.TestTokenSale.deployed().then(function(instance) {
            testTokenSaleInstance = instance;
            return testTokenSaleInstance.tokenPrice();
        }).then(function(tokenPrice) {
            console.log("Test Token Price:", tokenPrice.toNumber())
            App.tokenPrice = tokenPrice;

                //show the token price in ether
                $('.token-price').html(web3.fromWei(App.tokenPrice, "ether").toNumber());
                return testTokenSaleInstance.tokensSold();
        }).then(function(tokensSold) {
            App.tokensSold = tokensSold.toNumber();
                //show the tokens sold
                $('.tokens-sold').html(App.tokensSold);
                //show the tokens available
                $('.tokens-available').html(App.tokensAvailable);

                //update the loader
                var progressPercent = (Math.ceil(App.tokensSold) / App.tokensAvailable) * 100;
                $('#progress').css('width', progressPercent + '%');

        // Load token contract
        App.contracts.TestToken.deployed().then(function(instance) {
            testTokenInstance = instance;
            return testTokenInstance.balanceOf(App.account);
        }).then(function(balance) {
             console.log("Test Token Balance:", balance.toNumber());
            $('.token-balance').html(balance.toNumber());


            //whenever all the asynchronous actions are done we show the content
            App.loading = false;
            loader.hide();
            content.show();
        })
    });
    },

    buyTokens: function() {
        $('#content').hide();
        $('#loader').show();
        var numberOfTokens = $('#numberOfTokens').val();
        App.contracts.TestTokenSale.deployed().then(function(instance) {
            return instance.buyTokens(numberOfTokens, {
                from: App.account,
                value: numberOfTokens * App.tokenPrice,
                gas: 500000 // Gas limit
            });
        }).then(function(result) {
            console.log("Tokens bought...")
        $('form').trigger('reset') // reset number of tokens in form
      // Wait for Sell event

  });
    }
}

/**
 * Whenever the windows load we initialize our app
 */ 
 $(function() {
    $(window).on('load', function() {
        App.init();
    })
});