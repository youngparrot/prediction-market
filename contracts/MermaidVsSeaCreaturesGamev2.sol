// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v4.9/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v4.9/contracts/token/ERC721/IERC721.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v4.9/contracts/access/Ownable.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v4.9/contracts/security/ReentrancyGuard.sol";

contract MermaidVsSeaCreatures is Ownable, ReentrancyGuard {
    IERC721Enumerable public nftContract;
    address public platformRecipient;

    uint256 public platformFeePercent = 5; // Default 5%
    uint256 public winnerSharePercent = 80; // Default 80%

    struct RoundStats {
        uint256 id;
        uint256 startTime;
        uint256 endTime;
        uint256 totalRewards;
        uint256 carryOverFunds;
        uint256 totalMermaidSpent;
        uint256 totalSeaCreaturesSpent;
        uint256 totalMermaidPower;
        uint256 totalSeaCreaturesPower;
    }

    struct PlayerStats {
        uint256 totalMermaidSpent;
        uint256 totalSeaCreaturesSpent;
        uint256 totalMermaidPower;
        uint256 totalSeaCreaturesPower;
    }

    RoundStats[] public rounds;
    mapping(uint256 => mapping(address => PlayerStats)) public roundPlayerStats;
    mapping(uint256 => mapping(address => bool)) public hasClaimedReward;
    mapping(uint256 => bool) public validMermaidTokenIds;
    uint256 public minimumAmount = 1 * 10**18;

    event BetPlaced(address indexed player, uint256 amount, string side);
    event RewardsClaimed(address indexed player, uint256 reward);
    event EmergencyWithdrawal(address indexed owner, uint256 amount);
    event RoundStarted(uint256 roundIndex, uint256 startTime, uint256 endTime, uint256 carryOverFunds);
    event PlatformRecipientUpdated(address newRecipient);
    event NFTContractUpdated(address newNFTContract);
    event PercentagesUpdated(uint256 newPlatformFee, uint256 newWinnerShare);

    constructor(address _nftContract, address _platformRecipient) {
        nftContract = IERC721Enumerable(_nftContract);
        platformRecipient = _platformRecipient;
    }

    modifier roundActive() {
        require(
            block.timestamp >= rounds[getCurrentRoundIndex()].startTime &&
                block.timestamp < rounds[getCurrentRoundIndex()].endTime,
            "Round not active"
        );
        _;
    }

    modifier roundEnded() {
        require(block.timestamp >= rounds[getCurrentRoundIndex()].endTime, "Round still active");
        _;
    }

    // Allow the contract to receive native tokens
    receive() external payable {}

    fallback() external payable {}

    // Function to update the platformRecipient
    function setPlatformRecipient(address _newRecipient) external onlyOwner {
        require(_newRecipient != address(0), "Invalid recipient address");
        platformRecipient = _newRecipient;
        emit PlatformRecipientUpdated(_newRecipient);
    }

    // Function to update the NFT contract
    function setNFTContract(address _newNFTContract) external onlyOwner {
        require(_newNFTContract != address(0), "Invalid NFT contract address");
        nftContract = IERC721Enumerable(_newNFTContract);
        emit NFTContractUpdated(_newNFTContract);
    }

    // Function to update platform fee and winner share
    function setPercentages(uint256 _platformFeePercent, uint256 _winnerSharePercent) external onlyOwner {
        require(_platformFeePercent <= 10, "Platform fee too high"); // Cap platform fee at 10%
        require(_winnerSharePercent <= 100, "Invalid winner share percent");
        require(_platformFeePercent + _winnerSharePercent <= 100, "Percentages exceed 100%");
        platformFeePercent = _platformFeePercent;
        winnerSharePercent = _winnerSharePercent;
        emit PercentagesUpdated(_platformFeePercent, _winnerSharePercent);
    }

    // Start a new round
    function startRound(uint256 _startTime, uint256 _endTime, uint256 _carryOverFunds) external onlyOwner {
        require(_startTime < _endTime, "Start time must be before end time");
        rounds.push(
            RoundStats({
                id: rounds.length,
                startTime: _startTime,
                endTime: _endTime,
                totalRewards: _carryOverFunds,
                carryOverFunds: _carryOverFunds,
                totalMermaidSpent: 0,
                totalSeaCreaturesSpent: 0,
                totalMermaidPower: 0,
                totalSeaCreaturesPower: 0
            })
        );
        emit RoundStarted(rounds.length - 1, _startTime, _endTime, _carryOverFunds);
    }

    // End a round and distribute platform fee
    function endRound() external roundEnded onlyOwner {
        uint256 roundIndex = getCurrentRoundIndex();
        RoundStats storage round = rounds[roundIndex];

        uint256 platformFee = (round.totalRewards * platformFeePercent) / 100;
        payable(platformRecipient).transfer(platformFee);
    }

    // Place bets
    function betOnMermaid() external payable roundActive nonReentrant {
        require(_isEligibleMermaid(msg.sender), "You must own a valid Mermaid NFT");
        _placeBet("Mermaid");
    }

    function betOnSeaCreatures() external payable roundActive nonReentrant {
        require(_isEligibleSeaCreature(msg.sender), "You must own a valid Sea Creature NFT");
        _placeBet("SeaCreatures");
    }

    function setValidMermaidTokenIds(uint256[] memory tokenIds) external onlyOwner {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            validMermaidTokenIds[tokenIds[i]] = true;
        }
    }

    function _isEligibleMermaid(address player) internal view returns (bool) {
        uint256 balance = nftContract.balanceOf(player);
        for (uint256 i = 0; i < balance; i++) {
            try nftContract.tokenOfOwnerByIndex(player, i) returns (uint256 tokenId) {
                if (validMermaidTokenIds[tokenId]) {
                    return true;
                }
            } catch {}
        }
        return false;
    }

    function _isEligibleSeaCreature(address player) internal view returns (bool) {
        uint256 balance = nftContract.balanceOf(player);
        for (uint256 i = 0; i < balance; i++) {
            try nftContract.tokenOfOwnerByIndex(player, i) returns (uint256 tokenId) {
                if (!validMermaidTokenIds[tokenId]) {
                    return true;
                }
            } catch {}
        }
        return false;
    }

    function _placeBet(string memory side) internal {
        require(msg.value >= minimumAmount, "Bet amount must be greater than or equal minimum amount");
        uint256 power = _calculatePower(msg.value); // Use msg.value as the base power
        uint256 roundIndex = getCurrentRoundIndex();

        PlayerStats storage stats = roundPlayerStats[roundIndex][msg.sender];
        RoundStats storage round = rounds[roundIndex];

        if (keccak256(abi.encodePacked(side)) == keccak256("Mermaid")) {
            stats.totalMermaidPower += power;
            round.totalMermaidPower += power;
            stats.totalMermaidSpent += msg.value;
            round.totalMermaidSpent += msg.value;
        } else {
            stats.totalSeaCreaturesPower += power;
            round.totalSeaCreaturesPower += power;
            stats.totalSeaCreaturesSpent += msg.value;
            round.totalSeaCreaturesSpent += msg.value;
        }

        round.totalRewards += msg.value;

        emit BetPlaced(msg.sender, msg.value, side);
    }

    function _calculatePower(uint256 amount) internal view returns (uint256) {
        require(minimumAmount > 0, "Minimum amount must be greater than 0");
        require(amount >= minimumAmount, "Amount must be greater than or equal minimum amount");

        uint256 totalPower = 0; 
        uint256 iterations = amount / minimumAmount;

        // Limit iterations to prevent excessive gas usage
        require(iterations <= 100, "Too many iterations, reduce the amount");

        for (uint256 i = 0; i < iterations; i++) {
            uint256 random = uint256(
                keccak256(abi.encodePacked(block.timestamp, msg.sender, i))
            ) % 10000;

            if (random < 5) totalPower += 500;
            else if (random < 50) totalPower += 100;
            else if (random < 1050) totalPower += 10;
            else if (random < 1900) totalPower += 3;
            else if (random < 4900) totalPower += 2;
            else totalPower += 1;
        }

        return totalPower;
    }


    function claimReward() external roundEnded {
        uint256 roundIndex = getCurrentRoundIndex();
        RoundStats storage round = rounds[roundIndex];
        require(!hasClaimedReward[roundIndex][msg.sender], "Reward already claimed");

        uint256 reward;
        PlayerStats storage stats = roundPlayerStats[roundIndex][msg.sender];

        if (round.totalMermaidPower > round.totalSeaCreaturesPower && stats.totalMermaidSpent > 0) {
            reward = (stats.totalMermaidSpent / round.totalMermaidPower) / ((winnerSharePercent/100) * round.totalRewards);
        } else if (round.totalSeaCreaturesPower > round.totalMermaidPower && stats.totalSeaCreaturesSpent > 0) {
            reward = (stats.totalSeaCreaturesSpent / round.totalSeaCreaturesPower) / ((winnerSharePercent/100) * round.totalRewards);
        }

        require(reward > 0, "No reward to claim");
        hasClaimedReward[roundIndex][msg.sender] = true;
        payable(msg.sender).transfer(reward);
        emit RewardsClaimed(msg.sender, reward);
    }

    function getCurrentRoundIndex() public view returns (uint256) {
        return rounds.length - 1;
    }

    function getRoundStats(uint256 roundIndex) external view returns (RoundStats memory) {
        return rounds[roundIndex];
    }

    function getPlayerStats(uint256 roundIndex, address player) external view returns (PlayerStats memory) {
        PlayerStats memory stats = roundPlayerStats[roundIndex][player];
        return stats;
    }

    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        payable(owner()).transfer(balance);
        emit EmergencyWithdrawal(msg.sender, balance);
    }
}
