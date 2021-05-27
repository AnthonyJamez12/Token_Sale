var ARMSJARB_C_TOKEN = artifacts.require("./ARMSJARB_C_TOKEN.sol");
var ARMSJARB_C_SALE = artifacts.require("./ARMSJARB_C_SALE.sol");

module.exports = function(deployer) {
  deployer.deploy(ARMSJARB_C_TOKEN, 1000000).then(function(){
    var tokenPrice = 1000000000000000;
    return deployer.deploy(ARMSJARB_C_SALE, ARMSJARB_C_TOKEN.address, tokenPrice);
  });
};
