var ARMSJARB_C_TOKEN = artifacts.require("./ARMSJARB_C_TOKEN.sol");

contract('ARMSJARB_C_TOKEN', function(accounts){

    it('sets the total supply upon deployment', function(){
        return ARMSJARB_C_TOKEN.deployed().then(function(instance){
            tokenInstance = instance;
            return tokenInstance.totalSupply();
        }).then(function(totalSupply){
            assert.equal(totalSupply.toNumber(), 1000000, 'sets the toatl supply to 1,000,000');
        });
    });
})
