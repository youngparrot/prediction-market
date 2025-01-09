// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v4.9/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v4.9/contracts/token/ERC721/IERC721.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v4.9/contracts/token/ERC20/IERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v4.9/contracts/access/Ownable.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v4.9/contracts/security/ReentrancyGuard.sol";

contract PredictionMarket is Ownable, ReentrancyGuard {
    struct Prediction {
        string question;
        string[] answers;
        uint256[] stakes;
        mapping(address => mapping(uint256 => uint256)) userStakes;
        bool ended;
        uint256 winningAnswerIndex;
        uint256 totalStaked;
        address creator;
        uint256 startTime;
        uint256 endTime;
    }

    IERC721Enumerable public nftContract;
    IERC20 public paymentToken;
    uint256 public platformFee = 5; // 5% fee
    uint256 public creationFee = 10000 * 10**18; // 10000 YPC
    uint256 public creationShareFeePercent = 20; // 20% of platform fee
    address public platformRecipient;

    Prediction[] public predictions;

    event PredictionCreated(uint256 indexed predictionId, string question, address indexed creator);
    event Predicted(uint256 indexed predictionId, address indexed user, uint256 answerIndex, uint256 amount);
    event PredictionEnded(uint256 indexed predictionId, uint256 winningAnswerIndex);
    event RewardsClaimed(uint256 indexed predictionId, address indexed user, uint256 amount);
    event EmergencyWithdraw(uint256 indexed predictionId, address indexed to, uint256 amount);
    event EmergencyWithdrawAll(address indexed to, uint256 amount);
    event PlatformFeeUpdated(uint256 newPlatformFee);
    event CreationFeeUpdated(uint256 newCreationFee);
    event PlatformRecipientUpdated(address newPlatformRecipient);
    event CreationShareFeePercentUpdated(uint256 newCreationShareFeePercent);

    constructor(address _nftContract, address _paymentToken, address _platformRecipient) {
        nftContract = IERC721Enumerable(_nftContract);
        paymentToken = IERC20(_paymentToken);
        platformRecipient = _platformRecipient;
    }

    function createPrediction(
        string memory _question,
        string[] memory _answers,
        uint256 _startTime,
        uint256 _endTime
    ) external nonReentrant {
        require(_answers.length > 1, "At least two answers required");
        require(_endTime > _startTime, "Invalid start and end time");
        require(paymentToken.transferFrom(msg.sender, platformRecipient, creationFee), "Creation fee transfer failed");
        uint256 balance = nftContract.balanceOf(msg.sender);
        require(balance > 0, "You do not have YoungParrot Member NFT in your wallet");

        predictions.push();
        uint256 predictionId = predictions.length - 1;
        Prediction storage prediction = predictions[predictionId];

        prediction.question = _question;
        prediction.answers = _answers;
        prediction.stakes = new uint256[](_answers.length);
        prediction.creator = msg.sender;
        prediction.startTime = _startTime;
        prediction.endTime = _endTime;

        emit PredictionCreated(predictionId, _question, msg.sender);
    }

    function predict(uint256 _predictionId, uint256 _answerIndex, uint256 _amount) external nonReentrant {
        Prediction storage prediction = predictions[_predictionId];
        require(block.timestamp >= prediction.startTime, "Prediction not started");
        require(block.timestamp <= prediction.endTime, "Prediction ended");
        require(!prediction.ended, "Prediction already ended");
        require(_answerIndex < prediction.answers.length, "Invalid answer index");
        require(_amount > 0, "Amount must be greater than zero");

        paymentToken.transferFrom(msg.sender, address(this), _amount);

        prediction.stakes[_answerIndex] += _amount;
        prediction.userStakes[msg.sender][_answerIndex] += _amount;
        prediction.totalStaked += _amount;

        emit Predicted(_predictionId, msg.sender, _answerIndex, _amount);
    }

    function endPrediction(uint256 _predictionId, uint256 _winningAnswerIndex) external onlyOwner nonReentrant {
        Prediction storage prediction = predictions[_predictionId];
        require(!prediction.ended, "Prediction already ended");
        require(block.timestamp > prediction.endTime, "Prediciton has not ended");
        require(_winningAnswerIndex < prediction.answers.length, "Invalid winning answer index");

        prediction.ended = true;
        prediction.winningAnswerIndex = _winningAnswerIndex;

        uint256 totalFee = (platformFee * prediction.totalStaked) / 100;
        uint256 creatorFee = (totalFee * creationShareFeePercent) / 100; // 20% of platform fee
        uint256 platformFeeAmount = totalFee - creatorFee; // Remaining fee for platform

        if (creatorFee > 0) {
            paymentToken.transfer(prediction.creator, creatorFee);
        }
        if (platformFeeAmount > 0) {
            paymentToken.transfer(platformRecipient, platformFeeAmount);
        }

        emit PredictionEnded(_predictionId, _winningAnswerIndex);
    }

    function claimRewards(uint256 _predictionId) external nonReentrant {
        Prediction storage prediction = predictions[_predictionId];
        require(prediction.ended, "Prediction not ended");
        uint256 userStake = prediction.userStakes[msg.sender][prediction.winningAnswerIndex];
        require(userStake > 0, "No stake to claim");

        uint256 winnerShare = (prediction.totalStaked * (100 - platformFee)) / 100;
        uint256 reward = (userStake * winnerShare) / prediction.stakes[prediction.winningAnswerIndex];

        prediction.userStakes[msg.sender][prediction.winningAnswerIndex] = 0;
        paymentToken.transfer(msg.sender, reward);

        emit RewardsClaimed(_predictionId, msg.sender, reward);
    }

    function getRewardToClaim(uint256 _predictionId, address _user) external view returns (uint256) {
        Prediction storage prediction = predictions[_predictionId];
        if (!prediction.ended) {
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

    function emergencyWithdraw(uint256 _predictionId) external onlyOwner nonReentrant {
        Prediction storage prediction = predictions[_predictionId];
        uint256 amount = prediction.totalStaked;
        require(amount > 0, "No tokens to withdraw");

        prediction.totalStaked = 0;
        paymentToken.transfer(owner(), amount);

        emit EmergencyWithdraw(_predictionId, owner(), amount);
    }

    function emergencyWithdrawAll() external onlyOwner nonReentrant {
        uint256 balance = paymentToken.balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw");
        paymentToken.transfer(owner(), balance);

        emit EmergencyWithdrawAll(owner(), balance);
    }

    // Function to update the NFT contract address
    function updateNftContract(address _nftContract) external onlyOwner {
        require(_nftContract != address(0), "Invalid address");
        nftContract = IERC721Enumerable(_nftContract);
    }

    // Function to update the payment token address
    function updatePaymentToken(address _paymentToken) external onlyOwner {
        require(_paymentToken != address(0), "Invalid address");
        paymentToken = IERC20(_paymentToken);
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

    function getPrediction(uint256 _predictionId) external view returns (
        string memory question,
        string[] memory answers,
        uint256[] memory stakes,
        bool ended,
        uint256 winningAnswerIndex,
        address creator,
        uint256 totalStaked,
        uint256 startTime,
        uint256 endTime
    ) {
        Prediction storage prediction = predictions[_predictionId];
        return (
            prediction.question,
            prediction.answers,
            prediction.stakes,
            prediction.ended,
            prediction.winningAnswerIndex,
            prediction.creator,
            prediction.totalStaked,
            prediction.startTime,
            prediction.endTime
        );
    }

    function getPredictionCount() external view returns (uint256) {
        return predictions.length;
    }
}
