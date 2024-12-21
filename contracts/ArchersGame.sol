// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v4.9/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v4.9/contracts/token/ERC721/IERC721.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v4.9/contracts/token/ERC20/IERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v4.9/contracts/access/Ownable.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v4.9/contracts/security/ReentrancyGuard.sol";

contract ArchersGame is Ownable, ReentrancyGuard {
    IERC721Enumerable public nftContract;
    address public platformRecipient;
    address public devRecipient;
    IERC20 public paymentToken;

    uint256 public platformFeePercent = 50; // Default 2.5%
    uint256 public devFeePercent = 50; // Default 2.5%
    uint256 public winnerSharePercent = 800; // Default 80%

    uint256 public femalePowerMultiplier = 9; // Initial multiplier for Female power

    struct RoundStats {
        uint256 id;
        uint256 startTime;
        uint256 endTime;
        uint256 totalRewards;
        uint256 carryOverFunds;
        uint256 totalFemaleSpent;
        uint256 totalMaleSpent;
        uint256 totalFemalePower;
        uint256 totalMalePower;
    }

    struct PlayerStats {
        uint256 totalFemaleSpent;
        uint256 totalMaleSpent;
        uint256 totalFemalePower;
        uint256 totalMalePower;
    }

    RoundStats[] public rounds;
    mapping(uint256 => mapping(address => PlayerStats)) public roundPlayerStats;
    mapping(uint256 => mapping(address => bool)) public hasClaimedReward;
    mapping(uint256 => bool) public validFemaleTokenIds;
    uint256 public minimumAmount = 2 * 10**18;

    event BetPlaced(address indexed player, uint256 amount, string side);
    event RewardsClaimed(address indexed player, uint256 reward);
    event EmergencyWithdrawal(address indexed owner, uint256 amount);
    event RoundStarted(uint256 roundIndex, uint256 startTime, uint256 endTime, uint256 carryOverFunds);
    event PlatformRecipientUpdated(address newRecipient);
    event DevRecipientUpdated(address newRecipient);
    event NFTContractUpdated(address newNFTContract);
    event PercentagesUpdated(uint256 newPlatformFee, uint256 newDevFee, uint256 newWinnerShare);

    constructor(address _nftContract, address _platformRecipient, address _devReceipient, address _paymentToken) {
        nftContract = IERC721Enumerable(_nftContract);
        platformRecipient = _platformRecipient;
        devRecipient = _devReceipient;
        paymentToken = IERC20(_paymentToken);
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

    // Function to update the devRecipient
    function setDevRecipient(address _newRecipient) external onlyOwner {
        require(_newRecipient != address(0), "Invalid recipient address");
        devRecipient = _newRecipient;
        emit DevRecipientUpdated(_newRecipient);
    }

    // Function to update the NFT contract
    function setNFTContract(address _newNFTContract) external onlyOwner {
        require(_newNFTContract != address(0), "Invalid NFT contract address");
        nftContract = IERC721Enumerable(_newNFTContract);
        emit NFTContractUpdated(_newNFTContract);
    }

    // Function to update the minimum bet amount
    function updateMinimumAmount(uint256 _newMinimumAmount) external onlyOwner {
        require(_newMinimumAmount > 0, "Minimum amount must be greater than zero");
        minimumAmount = _newMinimumAmount;
    }

    function updateFemalePowerMultiplier(uint256 _newMultiplier) external onlyOwner {
        require(_newMultiplier > 0, "Multiplier must be greater than zero");
        femalePowerMultiplier = _newMultiplier;
    }

    // Function to update platform fee, dev fee and winner share
    function setPercentages(uint256 _platformFeePercent, uint256 _devFeePercent, uint256 _winnerSharePercent) external onlyOwner {
        require(_platformFeePercent <= 100, "Platform fee too high"); // Cap platform fee at 10%
        require(_devFeePercent <= 100, "Dev fee too high"); // Cap platform fee at 10%
        require(_winnerSharePercent <= 1000, "Invalid winner share percent");
        require(_platformFeePercent + _devFeePercent + _winnerSharePercent <= 1000, "Percentages exceed 100%");
        platformFeePercent = _platformFeePercent;
        devFeePercent = _devFeePercent;
        winnerSharePercent = _winnerSharePercent;
        emit PercentagesUpdated(_platformFeePercent, _devFeePercent, _winnerSharePercent);
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
                totalFemaleSpent: 0,
                totalMaleSpent: 0,
                totalFemalePower: 0,
                totalMalePower: 0
            })
        );
        emit RoundStarted(rounds.length, _startTime, _endTime, _carryOverFunds);
    }

    // End a round and distribute platform fee
    function endRound() external roundEnded onlyOwner {
        uint256 roundIndex = getCurrentRoundIndex();
        RoundStats storage round = rounds[roundIndex];

        uint256 platformFee = (round.totalRewards * platformFeePercent) / 1000;
        uint256 devFee = (round.totalRewards * devFeePercent) / 1000;

        // Transfer platform fee to platformRecipient
        require(paymentToken.transfer(platformRecipient, platformFee), "Platform fee transfer failed");

        // Transfer dev fee to devRecipient
        require(paymentToken.transfer(devRecipient, devFee), "Dev fee transfer failed");
    }

    function powerUpOnFemale(uint256 amount) external payable roundActive nonReentrant {
        require(_isEligibleFemale(msg.sender), "You must own a valid Archer female NFT");
        _placePowerUp("Female", amount);
    }

    function powerUpOnMale(uint256 amount) external payable roundActive nonReentrant {
        require(_isEligibleSeaCreature(msg.sender), "You must own a valid Archer male NFT");
        _placePowerUp("Male", amount);
    }

    function setValidFemaleTokenIds(uint256[] memory tokenIds) external onlyOwner {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            validFemaleTokenIds[tokenIds[i]] = true;
        }
    }

    function _isEligibleFemale(address player) internal view returns (bool) {
        uint256 balance = nftContract.balanceOf(player);
        for (uint256 i = 0; i < balance; i++) {
            try nftContract.tokenOfOwnerByIndex(player, i) returns (uint256 tokenId) {
                if (validFemaleTokenIds[tokenId]) {
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
                if (!validFemaleTokenIds[tokenId]) {
                    return true;
                }
            } catch {}
        }
        return false;
    }

    function _placePowerUp(string memory side, uint256 amount) internal {
        require(amount >= minimumAmount, "Bet amount must be greater than or equal minimum amount");

        // Transfer payment tokens from the user to the contract
        require(paymentToken.transferFrom(msg.sender, address(this), amount), "Token transfer failed");

        uint256 power = _calculatePower(msg.value); // Use msg.value as the base power
        uint256 roundIndex = getCurrentRoundIndex();

        PlayerStats storage stats = roundPlayerStats[roundIndex][msg.sender];
        RoundStats storage round = rounds[roundIndex];

        if (keccak256(abi.encodePacked(side)) == keccak256("Female")) {
            stats.totalFemalePower += power * femalePowerMultiplier;
            round.totalFemalePower += power * femalePowerMultiplier;
            stats.totalFemaleSpent += msg.value;
            round.totalFemaleSpent += msg.value;
        } else {
            stats.totalMalePower += power;
            round.totalMalePower += power;
            stats.totalMaleSpent += msg.value;
            round.totalMaleSpent += msg.value;
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
        _claimReward(getCurrentRoundIndex(), msg.sender);
    }

    function _claimReward(uint256 roundIndex, address playerAddress) internal roundEnded {
        require(!hasClaimedReward[roundIndex][playerAddress], "Reward already claimed");

        uint256 reward = _getClaimRewardAmount(roundIndex, playerAddress);

        require(reward > 0, "No reward to claim");
        hasClaimedReward[roundIndex][playerAddress] = true;
        
        // Transfer reward in payment tokens
        require(paymentToken.transfer(playerAddress, reward), "Token transfer failed");
        
        emit RewardsClaimed(playerAddress, reward);
    }

    function _getClaimRewardAmount(uint256 roundIndex, address playerAddress) internal view returns (uint256) {
        RoundStats storage round = rounds[roundIndex];

        uint256 reward;
        PlayerStats storage stats = roundPlayerStats[roundIndex][playerAddress];

        if (round.totalFemalePower == round.totalMalePower) {
            // Handle tie scenario
            if (round.totalFemaleSpent > round.totalMaleSpent) {
                // Female win based on total spent
                if (stats.totalFemaleSpent > 0) {
                    reward = (stats.totalFemaleSpent * round.totalRewards * winnerSharePercent) / 
                            (1000 * round.totalFemaleSpent);
                }
            } else if (round.totalMaleSpent > round.totalFemaleSpent) {
                // Male win based on total spent
                if (stats.totalMaleSpent > 0) {
                    reward = (stats.totalMaleSpent * round.totalRewards * winnerSharePercent) / 
                            (1000 * round.totalMaleSpent);
                }
            } else {
                // Exact tie on power and spent, split rewards evenly
                uint256 userContribution = stats.totalFemaleSpent + stats.totalMaleSpent;
                uint256 totalSpent = round.totalFemaleSpent + round.totalMaleSpent;
                if (userContribution > 0) {
                    reward = (userContribution * round.totalRewards * winnerSharePercent) / (1000 * totalSpent);
                }
            }
        } else {
            // Handle normal winner scenario
            if (round.totalFemalePower > round.totalMalePower && stats.totalFemaleSpent > 0) {
                reward = (stats.totalFemaleSpent * round.totalRewards * winnerSharePercent) / 
                        (1000 * round.totalFemaleSpent);
            } else if (round.totalMalePower > round.totalFemalePower && stats.totalMaleSpent > 0) {
                reward = (stats.totalMaleSpent * round.totalRewards * winnerSharePercent) / 
                        (1000 * round.totalMaleSpent);
            }
        }

        return reward;
    }

    function getClaimRewardAmount(uint256 roundIndex, address playerAddress) external view returns (uint256) {
        return _getClaimRewardAmount(roundIndex, playerAddress);
    }

    function hasClaimed(uint256 roundIndex, address playerAddress) external view returns (bool) {
        return hasClaimedReward[roundIndex][playerAddress];
    }

    function getCurrentRoundIndex() public view returns (uint256) {
        return rounds.length - 1;
    }

    function getRoundStats(uint256 roundIndex) external view returns (RoundStats memory) {
        return rounds[roundIndex];
    }

    function getPlayerStats(uint256 roundIndex, address player) external view returns (PlayerStats memory) {
        return roundPlayerStats[roundIndex][player];
    }

    function updateRoundDate(uint256 _startTime, uint256 _endTime) external roundActive onlyOwner {
        RoundStats storage round = rounds[getCurrentRoundIndex()];
        round.startTime = _startTime;
        round.endTime = _endTime;
    }

    function emergencyClaimReward(uint256 roundIndex, address playerAddress) external onlyOwner {
        _claimReward(roundIndex, playerAddress);
    }

    function emergencyWithdraw() external onlyOwner {
        uint256 balance = paymentToken.balanceOf(address(this));
        require(paymentToken.transfer(devRecipient, balance), "Token transfer failed");
        emit EmergencyWithdrawal(msg.sender, balance);
    }
}
