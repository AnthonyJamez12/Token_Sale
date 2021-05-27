pragma solidity ^0.4.22;

import "./ARMSJARB_C_TOKEN.sol";

contract ARMSJARB_C_SALE{
    address admin;
    ARMSJARB_C_TOKEN public tokenContract;
    uint public tokenPrice;
    uint public tokensSold;

    event Sell(address _buyer, uint256 _amount);

    function ARMSJARB_C_SALE(ARMSJARB_C_TOKEN _tokenContract, uint256 _tokenPrice) public{
        admin = msg.sender;
        tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;
    }


    function multiply(uint x, uint y) internal pure returns (uint z){
        require(y == 0 || (z = x * y) / y == x);
    }



    function buyTokens(uint256 _numberOfTokens)public payable{
        require(msg.value == multiply(_numberOfTokens, tokenPrice));
        require(tokenContract.balanceOf(this)>= _numberOfTokens);
        require(tokenContract.transfer(msg.sender, _numberOfTokens));

        tokensSold += _numberOfTokens;

        Sell(msg.sender, _numberOfTokens);
    }

    function endSale() public{
        require(msg.sender == admin);
        require(tokenContract.transfer(admin, tokenContract.balanceOf(this)));

        selfdestruct(admin);                                                       /cant figure out
    }
}






























//
