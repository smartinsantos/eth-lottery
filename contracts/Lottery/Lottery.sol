// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

contract Lottery {
    uint private MINIMUM_ENTRANCE = .01 ether;
    address public manager;
    address[] public players;

    constructor() {
        manager = msg.sender;
    }

    modifier restricted() {
        // only the manager can call
        require(msg.sender == manager);
        _;
    }

    // pseudo-random uint function
    function random() private view returns (uint) {
        // creates a sha256 from eth block difficulty, current time and players and casts to uint
        return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, players)));
    }

    function enter() public payable {
        require(msg.value > MINIMUM_ENTRANCE);
        players.push(msg.sender);
    }

    function getPlayers() public view returns (address[] memory) {
        return players;
    }

    function pickWinner() public restricted {
        // transfer balance to picked player
        uint contractBalance = address(this).balance;
        uint randomIndex = random() % players.length;
        address payable player = payable(players[randomIndex]);
        player.transfer(contractBalance);

        // reset the players array to be able to reuse the contract
        players = new address[](0);
    }
}
