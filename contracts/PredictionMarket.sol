// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v4.9/contracts/access/Ownable.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v4.9/contracts/security/ReentrancyGuard.sol";

contract PredictionMarket is Ownable, ReentrancyGuard {
    struct Prediction {
        string metadataId;
        uint256 answersLength;
        uint256[] stakes;
        mapping(address => mapping(uint256 => uint256)) userStakes;
        mapping(address => bool) hasClaimed;
        bool ended;
        uint256 winningAnswerIndex;
        uint256 totalStaked;
        address creator;
        uint256 endTime;
    }

    // Define a struct to encapsulate prediction details
    struct PredictionDetails {
        string metadataId;
        uint256[] stakes;
        bool ended;
        uint256 winningAnswerIndex;
        address creator;
        uint256 totalStaked;
        uint256 endTime;
    }

    uint256 public platformFee = 5; // 5% fee
    uint256 public creationFee = 1 ether; // 1 CORE
    uint256 public creationShareFeePercent = 20; // 20% of platform fee
    address public platformRecipient;

    mapping(string => Prediction) public predictions;

    event PredictionCreated(string indexed metadataId, address indexed creator);
    event Predicted(string indexed metadataId, address indexed user, uint256 answerIndex, uint256 amount);
    event PredictionEnded(string indexed metadataId, uint256 winningAnswerIndex);
    event RewardsClaimed(string indexed metadataId, address indexed user, uint256 amount);
    event EmergencyWithdraw(string indexed metadataId, address indexed to, uint256 amount);
    event EmergencyWithdrawAll(address indexed to, uint256 amount);
    event PlatformFeeUpdated(uint256 newPlatformFee);
    event CreationFeeUpdated(uint256 newCreationFee);
    event PlatformRecipientUpdated(address newPlatformRecipient);
    event CreationShareFeePercentUpdated(uint256 newCreationShareFeePercent);

    constructor(address _platformRecipient) {
        platformRecipient = _platformRecipient;
    }

    function createPrediction(
        string memory _metadataId,
        uint256 _answersLength,
        uint256 _endTime
    ) external payable nonReentrant {
        require(bytes(_metadataId).length > 0, "Metadata ID cannot be empty");
        require(_answersLength > 1, "At least two answers required");
        require(msg.value >= creationFee, "Insufficient creation fee");
        require(predictions[_metadataId].creator == address(0), "Prediction already exists");

        (bool sent, ) = platformRecipient.call{value: msg.value}("");
        require(sent, "Creation fee transfer failed");

        Prediction storage prediction = predictions[_metadataId];
        prediction.stakes = new uint256[](_answersLength);
        prediction.creator = msg.sender;
        prediction.endTime = _endTime;
        prediction.answersLength = _answersLength;

        emit PredictionCreated(_metadataId, msg.sender);
    }

    function predict(string memory _metadataId, uint256 _answerIndex) external payable nonReentrant {
        Prediction storage prediction = predictions[_metadataId];
        require(block.timestamp <= prediction.endTime, "Prediction ended");
        require(!prediction.ended, "Prediction already ended");
        require(_answerIndex < prediction.answersLength, "Invalid answer index");
        require(msg.value > 0, "Amount must be greater than zero");

        prediction.stakes[_answerIndex] += msg.value;
        prediction.userStakes[msg.sender][_answerIndex] += msg.value;
        prediction.totalStaked += msg.value;

        emit Predicted(_metadataId, msg.sender, _answerIndex, msg.value);
    }

    function endPrediction(string memory _metadataId, uint256 _winningAnswerIndex) external onlyOwner nonReentrant {
        Prediction storage prediction = predictions[_metadataId];
        require(!prediction.ended, "Prediction already ended");
        require(block.timestamp > prediction.endTime, "Prediction has not ended");
        require(_winningAnswerIndex < prediction.answersLength, "Invalid winning answer index");

        prediction.ended = true;
        prediction.winningAnswerIndex = _winningAnswerIndex;

        uint256 totalFee = (platformFee * prediction.totalStaked) / 100;
        uint256 creatorFee = (totalFee * creationShareFeePercent) / 100; // 20% of platform fee
        uint256 platformFeeAmount = totalFee - creatorFee; // Remaining fee for platform

        if (creatorFee > 0) {
            (bool sentToCreator, ) = prediction.creator.call{value: creatorFee}("");
            require(sentToCreator, "Transfer to creator failed");
        }
        if (platformFeeAmount > 0) {
            (bool sentToPlatform, ) = platformRecipient.call{value: platformFeeAmount}("");
            require(sentToPlatform, "Transfer to platform failed");
        }

        emit PredictionEnded(_metadataId, _winningAnswerIndex);
    }

    function claimRewards(string memory _metadataId) external nonReentrant {
        Prediction storage prediction = predictions[_metadataId];
        require(prediction.ended, "Prediction not ended");
        require(!prediction.hasClaimed[msg.sender], "Rewards already claimed");

        uint256 userStake = prediction.userStakes[msg.sender][prediction.winningAnswerIndex];
        require(userStake > 0, "No stake to claim");

        uint256 winnerShare = (prediction.totalStaked * (100 - platformFee)) / 100;
        uint256 reward = (userStake * winnerShare) / prediction.stakes[prediction.winningAnswerIndex];

        prediction.userStakes[msg.sender][prediction.winningAnswerIndex] = 0;
        prediction.hasClaimed[msg.sender] = true;
        (bool sent, ) = msg.sender.call{value: reward}("");
        require(sent, "Transfer to user failed");

        emit RewardsClaimed(_metadataId, msg.sender, reward);
    }

    function hasUserClaimed(string memory _metadataId, address _user) external view returns (bool) {
        Prediction storage prediction = predictions[_metadataId];
        return prediction.hasClaimed[_user];
    }

    function getRewardToClaim(string memory _metadataId, address _user) external view returns (uint256) {
        Prediction storage prediction = predictions[_metadataId];
        if (!prediction.ended || prediction.hasClaimed[_user]) {
            return 0;
        }

        uint256 userStake = prediction.userStakes[_user][prediction.winningAnswerIndex];
        if (userStake == 0) {
            return 0;
        }

        uint256 winnerShare = (prediction.totalStaked * (100 - platformFee)) / 100;
        uint256 reward = (userStake * winnerShare) / prediction.stakes[prediction.winningAnswerIndex];

        return reward;
    }

    function emergencyWithdraw(string memory _metadataId) external onlyOwner nonReentrant {
        Prediction storage prediction = predictions[_metadataId];
        uint256 amount = prediction.totalStaked;
        require(amount > 0, "No tokens to withdraw");

        prediction.totalStaked = 0;
        (bool sent, ) = owner().call{value: amount}("");
        require(sent, "Emergency withdraw failed");

        emit EmergencyWithdraw(_metadataId, owner(), amount);
    }

    function emergencyWithdrawAll() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No tokens to withdraw");
        (bool sent, ) = owner().call{value: balance}("");
        require(sent, "Emergency withdraw all failed");

        emit EmergencyWithdrawAll(owner(), balance);
    }

    function updatePlatformFee(uint256 _newPlatformFee) external onlyOwner {
        require(_newPlatformFee <= 100, "Fee cannot exceed 100%");
        platformFee = _newPlatformFee;

        emit PlatformFeeUpdated(_newPlatformFee);
    }

    function updateCreationFee(uint256 _newCreationFee) external onlyOwner {
        creationFee = _newCreationFee;

        emit CreationFeeUpdated(_newCreationFee);
    }

    function updateEndTime(string memory _metadataId, uint256 _endTime) external onlyOwner {
        Prediction storage prediction = predictions[_metadataId];
        prediction.endTime = _endTime;
    }

    function updateCreationShareFeePercent(uint256 _newCreationShareFeePercent) external onlyOwner {
        require(_newCreationShareFeePercent <= 100, "Share cannot exceed 100%");
        creationShareFeePercent = _newCreationShareFeePercent;

        emit CreationShareFeePercentUpdated(_newCreationShareFeePercent);
    }

    function updatePlatformRecipient(address _newPlatformRecipient) external onlyOwner {
        require(_newPlatformRecipient != address(0), "Invalid address");
        platformRecipient = _newPlatformRecipient;

        emit PlatformRecipientUpdated(_newPlatformRecipient);
    }

    function getPrediction(string memory _metadataId) external view returns (
        string memory metadataId,
        uint256[] memory stakes,
        bool ended,
        uint256 winningAnswerIndex,
        address creator,
        uint256 totalStaked,
        uint256 endTime
    ) {
        Prediction storage prediction = predictions[_metadataId];
        return (
            prediction.metadataId,
            prediction.stakes,
            prediction.ended,
            prediction.winningAnswerIndex,
            prediction.creator,
            prediction.totalStaked,
            prediction.endTime
        );
    }

    function getPredictionsByIds(string[] memory _metadataIds) external view returns (
        PredictionDetails[] memory predictionsa
    ) {
        uint256 length = _metadataIds.length;

        // Initialize arrays for the return values
        predictionsa = new PredictionDetails[](length);

        for (uint256 i = 0; i < length; i++) {
            string memory metadataId = _metadataIds[i];
            Prediction storage prediction = predictions[metadataId];

            // Use the PredictionDetails struct to hold prediction data
            predictionsa[i] = PredictionDetails({
                metadataId: prediction.metadataId,
                stakes: prediction.stakes,
                ended: prediction.ended,
                winningAnswerIndex: prediction.winningAnswerIndex,
                creator: prediction.creator,
                totalStaked: prediction.totalStaked,
                endTime: prediction.endTime
            });
        }
    }

    function getUserStakesForPrediction(string memory _metadataId, address _user) external view returns (uint256[] memory) {
        Prediction storage prediction = predictions[_metadataId];
        uint256[] memory userStakes = new uint256[](prediction.answersLength);
        for (uint256 i = 0; i < prediction.answersLength; i++) {
            userStakes[i] = prediction.userStakes[_user][i];
        }
        return userStakes;
    }

    function getTotalStakesForPrediction(string memory _metadataId) external view returns (uint256[] memory) {
        Prediction storage prediction = predictions[_metadataId];
        return prediction.stakes;
    }
}
