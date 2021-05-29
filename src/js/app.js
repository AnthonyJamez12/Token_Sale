App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  loading: false,
  tokenPrice: 1000000000000000,
  tokensSold: 0,
  tokensAvailable: 750000,

  initMetaMask: function() {

  async function enableUser() {
      const accounts = await ethereum.enable();
      const account = accounts[0];
      App.account = account;
  }
  enableUser();
  },

  init: function() {
    console.log("App initialized...")
    return App.initWeb3();
  },

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

  initContracts: function() {
    $.getJSON("ARMSJARB_C_SALE.json", function(armsjarb_c_sale) {
      App.contracts.ARMSJARB_C_SALE = TruffleContract(armsjarb_c_sale);
      App.contracts.ARMSJARB_C_SALE.setProvider(App.web3Provider);
      App.contracts.ARMSJARB_C_SALE.deployed().then(function(armsjarb_c_sale) {
        console.log("armsjarb Token Sale Address:", armsjarb_c_sale.address);
      });
    }).done(function() {
      $.getJSON("ARMSJARB_C_TOKEN.json", function(armsjarb_c_token) {
        App.contracts.ARMSJARB_C_TOKEN = TruffleContract(armsjarb_c_token);
        App.contracts.ARMSJARB_C_TOKEN.setProvider(App.web3Provider);
        App.contracts.ARMSJARB_C_TOKEN.deployed().then(function(armsjarb_c_token) {
        console.log(" Token Address:", armsjarb_c_token.address);
        });

        App.listenForEvents();
        return App.render();
      });
    })
  },

  // Listen for events emitted from the contract
  listenForEvents: function() {
    App.contracts.ARMSJARB_C_SALE.deployed().then(function(instance) {
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
    if (App.loading) {
      return;
    }
    App.loading = true;

    var loader  = $('#loader');
    var content = $('#content');

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if(err === null) {
        App.account = account;
        $('#accountAddress').html("Your Account: " + account);
      }
    })

    // Load token sale contract
    App.contracts.ARMSJARB_C_SALE.deployed().then(function(instance) {
      armsjarbTokenSaleInstance = instance;
      return armsjarbTokenSaleInstance.tokenPrice();
    }).then(function(tokenPrice) {
      App.tokenPrice = tokenPrice;
      $('.token-price').html(web3.fromWei(App.tokenPrice, "ether").toNumber());
      return armsjarbTokenSaleInstance.tokensSold();
    }).then(function(tokensSold) {
      App.tokensSold = tokensSold.toNumber();
      $('.tokens-sold').html(App.tokensSold);
      $('.tokens-available').html(App.tokensAvailable);

      var progressPercent = (Math.ceil(App.tokensSold) / App.tokensAvailable) * 100;
      $('#progress').css('width', progressPercent + '%');

      // Load token contract
      App.contracts.ARMSJARB_C_TOKEN.deployed().then(function(instance) {
        armsjarb_c_Instance = instance;
        return armsjarb_c_Instance.balanceOf(App.account);
      }).then(function(balance) {
        $('.armsjarb-balance').html(balance.toNumber());
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
    App.contracts.ARMSJARB_C_SALE.deployed().then(function(instance) {
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

$(function() {
  $(window).load(function() {
    App.initMetaMask();
    App.init();
  })
});
