pragma solidity ^0.4.17;

import "contracts/Escrow.sol";

contract EcommerceStore{
    enum ProductStatus { Open, Sold, Unsold }
    enum ProductCondition { New, Used }

    uint public productIndex;
    mapping (uint => address) productIdInStore;
    mapping (address => mapping(uint => Product)) stores;
    mapping (uint => address) productEscrow;

    struct Product{
        uint id;
        string name;
        string category;
        string imageLink;
        string descLink;
        uint auctionStartTime;
        uint auctionEndTime;
        uint startPrice;
        address highestBidder;
        uint highestBid;
        uint secondHighestBid;
        uint totalBids;
        ProductStatus status;
        ProductCondition condition;
        mapping (address => mapping (bytes32 => Bid)) bids;
    }
    
    struct Bid{
        address bidder;
        uint productId;
        uint value;
        bool revealed;
    }

    constructor() public{
        productIndex = 0;
    }

    function addProductToStore(string _name, string _category, string _imageLink, string _descLink
        , uint _auctionStartTime, uint _auctionEndTime, uint _startPrice, uint _productCondition) public{
        require(_auctionStartTime < _auctionEndTime, "Auction start time should be earlier than end time.");
        productIndex += 1;
        Product memory product = Product(productIndex, _name, _category, _imageLink, _descLink
            , _auctionStartTime, _auctionEndTime, _startPrice, 0, 0, 0, 0, ProductStatus.Open, ProductCondition(_productCondition));
        stores[msg.sender][productIndex] = product;
        productIdInStore[productIndex] = msg.sender;
    }

    function getProduct(uint _productId) public view returns (uint, string, string, string, string, uint, uint, uint, ProductStatus, ProductCondition){
        Product memory product = stores[productIdInStore[_productId]][_productId];
        return (product.id, product.name, product.category, product.imageLink, product.descLink
            , product.auctionStartTime, product.auctionEndTime, product.startPrice, product.status, product.condition);    
    }

    function bid(uint _productId, bytes32 _bid) public payable returns (bool){
        Product storage product = stores[productIdInStore[_productId]][_productId];
        require(now >= product.auctionStartTime, "Current time should be later than auction start time");
        require(now <= product.auctionEndTime, "Current time should be earlier than auction end time");
        require(msg.value > product.startPrice, "Value should be larger than start price");
        require(product.bids[msg.sender][_bid].bidder == 0, "Bidder should be null");
        product.bids[msg.sender][_bid] = Bid(msg.sender, _productId, msg.value, false);
        product.totalBids += 1;
        return true;
    }

    function revealBid(uint _productId, string _amount, string _secret) public {
        Product storage product = stores[productIdInStore[_productId]][_productId];
        require(now >= product.auctionEndTime);
        bytes32 sealedBid = sha3(_amount, _secret);
        Bid memory bidInfo = product.bids[msg.sender][sealedBid];
        require(bidInfo.bidder > 0, "Bidder should exist");
        require(bidInfo.revealed == false, "Bid should not be revealed");

        uint refund;
        uint amount = stringToUint(_amount);
        if(bidInfo.value < amount){
            refund = bidInfo.value;
        } else {
            if(address(product.highestBidder) == 0){
                product.highestBidder = msg.sender;
                product.highestBid = amount;
                product.secondHighestBid = product.startPrice;
                refund = bidInfo.value - amount;
            } else{
                if(amount > product.highestBid){
                    product.secondHighestBid = product.highestBid;
                    product.highestBidder.transfer(product.highestBid);
                    product.highestBid = amount;
                    product.highestBidder = msg.sender;
                    refund = bidInfo.value - amount;
                } else if(amount > product.secondHighestBid){
                    product.secondHighestBid = amount;
                    refund = bidInfo.value;
                } else{
                    refund = bidInfo.value;
                }
            }
        }
        product.bids[msg.sender][sealedBid].revealed = true;
        if(refund > 0){
            msg.sender.transfer(refund);
        }
    }

    function stringToUint(string s) private pure returns (uint){
        bytes memory b = bytes(s);
        uint result = 0;
        for(uint i = 0; i < b.length; i++){
            if(b[i] >= 48 && b[i] <= 57){
                result = result * 10 + (uint(b[i]) - 48);
            }
        }
        return result;
    }

    function highestBidderInfo(uint _productId) public view returns (address, uint, uint){
        Product memory product = stores[productIdInStore[_productId]][_productId];
        return (product.highestBidder, product.highestBid, product.secondHighestBid);
    }

    function totalBids(uint _productId) public view returns (uint){
        Product memory product = stores[productIdInStore[_productId]][_productId];
        return product.totalBids;
    }

    function finalizeAuction(uint _productId) public {
        Product memory product = stores[productIdInStore[_productId]][_productId];
        require((now > product.auctionEndTime), "Current time should be later than auction end time");
        require(product.status == ProductStatus.Open, "Product status should be open");
        require(msg.sender != productIdInStore[_productId], "Caller should not be seller");
        require(msg.sender != product.highestBidder, "Caller should not be buyer");

        if(product.highestBidder == 0){
            product.status = ProductStatus.Unsold;
        } else{
            Escrow escrow = (new Escrow).value(product.secondHighestBid)(_productId, productIdInStore[_productId], product.highestBidder, msg.sender);
            productEscrow[_productId] =  address(escrow);
            product.status = ProductStatus.Sold;
            uint refund = product.highestBid - product.secondHighestBid;
            product.highestBidder.transfer(refund);
        }
        stores[productIdInStore[_productId]][_productId] = product;
    }

    function escrowAddressForProduct(uint _productId) public view returns(address){
        return productEscrow[_productId];
    }
    function escrowInfo(uint _productId) public view returns (address, address, address, bool, uint, uint){
        return Escrow(productEscrow[_productId]).escrowInfo();
    }
    function releaseAmountToSeller(uint _productId) public {
        Escrow(productEscrow[_productId]).realseAmountToSeller(msg.sender);
    }
    function refundAmountToBuyer(uint _productId) public {
        Escrow(productEscrow[_productId]).refundAmountToBuyer(msg.sender);
    }
}
