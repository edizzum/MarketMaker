// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import {IChronicle} from "./interfaces/IChronicle.sol";
import "@flarenetwork/flare-periphery-contracts/flare/util-contracts/userInterfaces/IFlareContractRegistry.sol";
import "@flarenetwork/flare-periphery-contracts/flare/ftso/userInterfaces/IFtsoRegistry.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

//import "@layerzerolabs/solidity-examples/contracts/token/onft/ONFT1155.sol";
//import "@layerzerolabs/solidity-examples/contracts/token/oft/OFT.sol";

contract MarketMaker is Ownable, ERC721URIStorage {
    struct Tier {
        uint256 level;
        uint256 rewardMultiplier;
    }

    struct PriceAndTime {
        uint256 price;
        uint256 lastUpdateTime;
    }

    struct Pool {
        address creator;
        uint256 totalAmount;
        uint256 participantsLimit;
        uint256 requiredAmount;
        uint256 duration;
        uint256 startTime;
        uint256 participantCount;
        bool isActive;
    }

    struct Participant {
        address user;
        Tier tier;
        bool hasClaimed;
    }

    struct Contacts {
        address user;
        string mail;
        string gmail;
        string discord;
        string twitter;
        string number;
    }

    IERC20 public mmToken;
    AggregatorV3Interface public priceFeedChainlink;
    IPyth public priceFeedPyth;
    IWorldIDContract public worldIDVerifier;
    address public priceFeedChronicle;
    address public admin;
    address public systemOwner;

    mapping(address => Tier) public influencerTiers;
    mapping(uint256 => address) public poolOwners;
    mapping(uint256 => uint256) public poolRewards;
    mapping(address => uint256) public nullifiers;
    mapping(uint256 => Contacts) public verifiedContacts;
    mapping(uint256 => Pool) public pools;
    mapping(uint256 => mapping(address => Participant)) public participants;
    mapping(address => uint256) public userTiers;
    mapping(address => bool) public hasNFT;

    event PoolCreated(uint256 indexed poolId, address indexed creator);
    event Participated(uint256 indexed poolId, address indexed participant);
    event RewardClaimed(uint256 indexed poolId, address indexed participant);

    error InvalidTierValue(uint256);

    bytes32 public pythPriceFeedID;

    uint256 public chroniclePrice;
    int256 public chainlinkPrice;
    uint256 public pythPrice;
    uint256 public flarePrice;
    uint256 public nftCounter;

    bool public isFlare;

    PriceAndTime internal parameters;

    constructor(
        address _mmToken,
        address _priceFeedChainlink,
        address _priceFeedPyth,
        bytes32 _priceFeedID,
        address _priceFeedChronicle,
        address _worldID,
        bool _isFlare,
        address _systemOwner
    ) ERC721("PoolNFT", "TNFT") Ownable(msg.sender) {
        mmToken = IERC20(_mmToken);
        priceFeedChainlink = AggregatorV3Interface(_priceFeedChainlink);
        priceFeedPyth = IPyth(_priceFeedPyth);
        priceFeedChronicle = _priceFeedChronicle;
        pythPriceFeedID = _priceFeedID;
        admin = msg.sender;
        selfKisser.selfKiss(address(chronicle));
        worldIDVerifier = IWorldIDContract(_worldID);
        isFlare = _isFlare;
        systemOwner = _systemOwner;
    }

    IChronicle public chronicle =
        IChronicle(address(0xdd6D76262Fd7BdDe428dcfCd94386EbAe0151603));

    ISelfKisser public selfKisser =
        ISelfKisser(address(0x0Dcc19657007713483A5cA76e6A7bbe5f56EA37d));

    function read() public view returns (uint256 val, uint256 age) {
        (val, age) = chronicle.readWithAge();
    }

    function setTier(
        address influencer,
        uint256 level,
        uint256 rewardMultiplier
    ) external onlyOwner {
        influencerTiers[influencer] = Tier(level, rewardMultiplier);
    }

    function openRewardPool(
        uint256 poolId,
        uint256 rewardAmount,
        uint256 participantsLimit,
        address signal,
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof
    ) external worldIDVerified(signal, root, nullifierHash, proof) {
        require(
            mmToken.transferFrom(msg.sender, address(this), rewardAmount),
            "Transfer failed"
        );
        require(participantsLimit > 0, "Invalid participant limit");
        require(rewardAmount > 0, "Invalid reward amount");

        uint256 systemShare = (rewardAmount * 5) / 100;
        uint256 poolAmount = rewardAmount - systemShare;

        poolOwners[poolId] = msg.sender;
        poolRewards[poolId] = poolAmount;

        emit PoolCreated(poolId, msg.sender);
    }

    function completeTask(uint256 poolId, address influencer)
        external
        onlyOwner
    {
        Tier memory tier = influencerTiers[influencer];
        uint256 reward = (poolRewards[poolId] * tier.rewardMultiplier) / 100;
        require(mmToken.transfer(influencer, reward), "Transfer failed");
        poolRewards[poolId] -= reward;
    }

    function claimReward(uint256 _poolId) external {
        Pool storage pool = pools[_poolId];
        Participant storage participant = participants[_poolId][msg.sender];

        require(participant.user != address(0), "Not a participant");
        require(!participant.hasClaimed, "Reward already claimed");

        uint256 totalShares = calculateTotalShares(_poolId);
        uint256 rewardAmount = pool.totalAmount;

        uint256 shareAmount = rewardAmount / totalShares;
        uint256 participantShare;

        if (participant.tier.level == 1) {
            participantShare = shareAmount;
        } else if (participant.tier.level == 2) {
            participantShare = shareAmount * 2;
        } else if (participant.tier.level == 3) {
            participantShare = shareAmount * 3;
        } else {
            revert InvalidTierValue(participant.tier.level);
        }

        participant.hasClaimed = true;
        mmToken.transfer(msg.sender, participantShare);

        emit RewardClaimed(_poolId, msg.sender);
    }

    function calculateTotalShares(uint256 _poolId)
        internal
        view
        returns (uint256)
    {
        Pool storage pool = pools[_poolId];
        uint256 totalShares = 0;

        for (uint256 i = 0; i < pool.participantCount; i++) {
            if (participants[_poolId][msg.sender].tier.level == 1) {
                totalShares += 1;
            } else if (participants[_poolId][msg.sender].tier.level == 2) {
                totalShares += 2;
            } else {
                totalShares += 3;
            }
        }

        return totalShares;
    }

    function _mintNFT(uint256 _tier) external {
        nftCounter++;
        string memory tokenURI = _getTokenURI(_tier);
        _mint(msg.sender, nftCounter);
        _setTokenURI(nftCounter, tokenURI);
        hasNFT[msg.sender] = true;
    }

    function _getTokenURI(uint256 _tier) internal pure returns (string memory) {
        if (_tier == 1) {
            return "ipfs://tier1_nft_metadata";
        } else if (_tier == 2) {
            return "ipfs://tier2_nft_metadata";
        } else {
            return "ipfs://tier3_nft_metadata";
        }
    }

    function setTier(address user, uint256 followers) external onlyOwner {
        if (followers <= 50000) {
            userTiers[user] = 1;
        } else if (followers <= 500000) {
            userTiers[user] = 2;
        } else {
            userTiers[user] = 3;
        }
    }

    function updatePrice(bytes[] calldata priceUpdate) public payable {
        uint256 fee = priceFeedPyth.getUpdateFee(priceUpdate);
        priceFeedPyth.updatePriceFeeds{value: fee}(priceUpdate);
        PythStructs.Price memory price = priceFeedPyth.getPrice(
            pythPriceFeedID
        );
        int64 _price = price.price;
        parameters.price = uint256(uint64(_price) * 10**10);
        parameters.lastUpdateTime = block.timestamp;
    }

    function fetchPrice() public returns (uint256) {
        (, chainlinkPrice, , , ) = priceFeedChainlink.latestRoundData();
        pythPrice = parameters.price;
        (chroniclePrice, ) = read();
        uint256 averagePrice;

        if (isFlare) {
            (flarePrice, , ) = getTokenPriceWei("testETH");
            if (chainlinkPrice == 0) {
                if (flarePrice == 0) {
                    averagePrice = chroniclePrice;
                } else if (chroniclePrice == 0) {
                    averagePrice = flarePrice;
                } else {
                    averagePrice = (flarePrice + chroniclePrice) / 2;
                }
            } else if (flarePrice == 0) {
                if (chroniclePrice == 0) {
                    averagePrice = uint256(chainlinkPrice);
                } else {
                    averagePrice =
                        (uint256(chainlinkPrice) + chroniclePrice) /
                        2;
                }
            } else if (chroniclePrice == 0) {
                averagePrice = (uint256(chainlinkPrice) + flarePrice) / 2;
            } else {
                averagePrice =
                    (uint256(chainlinkPrice) + flarePrice + chroniclePrice) /
                    3;
            }
        } else {
            if (chainlinkPrice == 0) {
                if (pythPrice == 0) {
                    averagePrice = chroniclePrice;
                } else if (chroniclePrice == 0) {
                    averagePrice = pythPrice;
                } else {
                    averagePrice = (pythPrice + chroniclePrice) / 2;
                }
            } else if (pythPrice == 0) {
                if (chroniclePrice == 0) {
                    averagePrice = uint256(chainlinkPrice);
                } else {
                    averagePrice =
                        (uint256(chainlinkPrice) + chroniclePrice) /
                        2;
                }
            } else if (chroniclePrice == 0) {
                averagePrice = (uint256(chainlinkPrice) + pythPrice) / 2;
            } else {
                averagePrice =
                    (uint256(chainlinkPrice) + pythPrice + chroniclePrice) /
                    3;
            }
        }
        return averagePrice;
    }

    function verifyWorldID(
        address signal,
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof
    ) public returns (bool success) {
        success = worldIDVerifier.verifyAndExecute(
            signal,
            root,
            nullifierHash,
            proof
        );
        if (success) {
            nullifiers[msg.sender] = nullifierHash;
        }
    }

    function setMail(
        string memory _mail,
        address signal,
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof
    ) public worldIDVerified(signal, root, nullifierHash, proof) {
        uint256 nullHash = nullifiers[msg.sender];
        verifiedContacts[nullHash].mail = _mail;
    }

    function setGmail(
        string memory _gmail,
        address signal,
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof
    ) public worldIDVerified(signal, root, nullifierHash, proof) {
        uint256 nullHash = nullifiers[msg.sender];
        verifiedContacts[nullHash].gmail = _gmail;
    }

    function setTwitter(
        string memory _twitter,
        address signal,
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof
    ) public worldIDVerified(signal, root, nullifierHash, proof) {
        uint256 nullHash = nullifiers[msg.sender];
        verifiedContacts[nullHash].twitter = _twitter;
    }

    function setDiscord(
        string memory _discord,
        address signal,
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof
    ) public worldIDVerified(signal, root, nullifierHash, proof) {
        uint256 nullHash = nullifiers[msg.sender];
        verifiedContacts[nullHash].discord = _discord;
    }

    function setNumber(
        string memory _number,
        address signal,
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof
    ) public worldIDVerified(signal, root, nullifierHash, proof) {
        uint256 nullHash = nullifiers[msg.sender];
        verifiedContacts[nullHash].number = _number;
    }

    function getTokenPriceWei(string memory _symbol)
        public
        view
        returns (
            uint256 _price,
            uint256 _timestamp,
            uint256 _decimals
        )
    {
        address FLARE_CONTRACT_REGISTRY = 0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019;
        IFlareContractRegistry contractRegistry = IFlareContractRegistry(
            FLARE_CONTRACT_REGISTRY
        );

        IFtsoRegistry ftsoRegistry = IFtsoRegistry(
            contractRegistry.getContractAddressByName("FtsoRegistry")
        );

        (_price, _timestamp, _decimals) = ftsoRegistry
            .getCurrentPriceWithDecimals(_symbol);
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    modifier worldIDVerified(
        address signal,
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof
    ) {
        if (nullifiers[msg.sender] == 0) {
            require(verifyWorldID(signal, root, nullifierHash, proof));
            _;
        } else {
            _;
        }
    }
}

interface ISelfKisser {
    /// @notice Kisses caller on oracle `oracle`.
    function selfKiss(address oracle) external;
}

interface IWorldIDContract {
    function verifyAndExecute(
        address signal,
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof
    ) external returns (bool success);
}
