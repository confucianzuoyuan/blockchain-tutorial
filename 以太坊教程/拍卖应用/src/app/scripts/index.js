import {default as Web3} from 'web3';
import {default as contract} from 'truffle-contract';
import ecommerce_store_artifacts from '../../build/contracts/EcommerceStore.json';

var EcommerceStore = contract(ecommerce_store_artifacts);

var ipfsAPI = require('ipfs-api');

var ipfs = ipfsAPI({host: 'localhost', port: '5001', protocol: 'http'});

window.App = {
    start: function(){
        var self = this;
        EcommerceStore.setProvider(web3.currentProvider);
        renderStore();

        var reader;
        $("#product-image").change(event=>{
            const file = event.target.files[0];
            reader = new window.FileReader();
            reader.readAsArrayBuffer(file);
        });

        $("#add-item-to-store").submit(function(event){
            const req = $("#add-item-to-store").serialize();
            console.log("req:" , req);
            let params = JSON.parse('{"' + req.replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
            console.log("params: ", params);
            let decodedParams = {};
            Object.keys(params).forEach(key=>{
                decodedParams[key] = decodeURIComponent(decodeURI(params[key]));
            });
            saveProduct(reader, decodedParams);
            event.preventDefault();
        });

        if($("#product-details").length > 0){
            let productId = new URLSearchParams(window.location.search).get('id');
            renderProductDetails(productId);
        }

        $("#bidding").submit(event=>{
            $("#msg").hide();
            let amount = $("#bid-amount").val();
            let sendAmount = $("#bid-send-amount").val();
            let secretText = $("#secret-text").val();
            let productId = $("#product-id").val();
            let sealedBid = web3.sha3(web3.toWei(amount,'ether').toString() + secretText);
            EcommerceStore.deployed().then(i=>{
                i.bid(parseInt(productId), sealedBid, {from: web3.eth.accounts[0], value: web3.toWei(sendAmount,'ether')}).then(res=>{
                    $("#msg").html("Your bid has been successfully submitted!");
                    $("#msg").show();
                });
            });
            event.preventDefault();
        });

        $("#revealing").submit(event=>{
            $("#msg").hide();
            let amount = $("#actual-amount").val();
            let secretText = $("#reveal-secret-text").val();
            let productId = $("#product-id").val();
            EcommerceStore.deployed().then(i=>{
                i.revealBid(parseInt(productId), web3.toWei(amount, 'ether').toString(), secretText, {from: web3.eth.accounts[0]}).then(res=>{
                    $("#msg").html("Your bid has been successfully revealed!");
                    $("#msg").show();
                });
            });
            event.preventDefault();
        });

        $("#finalize-auction").submit(event=>{
            $("#msg").hide();
            let productId = $("#product-id").val();
            EcommerceStore.deployed().then(i=>{
                i.finalizeAuction(parseInt(productId),{from: web3.eth.accounts[0]}).then(res=>{
                    $("#msg").html("The auction has been finalized and winner declared.");
                    $("#msg").show();
                    location.reload();
                }).catch(err=>{
                    $("#msg").html("The auction can not be finalized by the buyer or seller, only a third party aribiter can finalize it");
                    $("#msg").show();
                });
            });
            event.preventDefault();
        });

        $("#release-funds").click(()=>{
            let productId = new URLSearchParams(window.location.search).get("id");
            EcommerceStore.deployed().then(i=>{
                $("#msg").html("Your transaction has been submitted. Please wait for few seconds for the confirmation").show();
                i.releaseAmountToSeller(productId, {from: web3.eth.accounts[0]}).then(res=>{
                    location.reload();
                }).catch(err=>{
                    console.log(err);
                });
            });
        });

        $("#refund-funds").click(()=>{
            let productId = new URLSearchParams(window.location.search).get("id");
            EcommerceStore.deployed().then(i=>{
                $("#msg").html("Your transaction has been submitted. Please wait for few seconds for the confirmation").show();
                i.refundAmountToBuyer(productId, {from: web3.eth.accounts[0]}).then(res=>{
                    location.reload();
                }).catch(err=>{
                    console.log();
                });
            });
            alert("refund funds!");
        });
    },
};

function renderStore(){
    EcommerceStore.deployed().then(i=>{
        i.getProduct(1).then(p=>{
            $("#product-list").append(buildProduct(p));
        });
        i.getProduct(2).then(p=>{
            $("#product-list").append(buildProduct(p));
        });
    });
}

function buildProduct(product){
    let node = $("<div />");
    node.addClass("col-sm-3 text-center col-margin-bottom-1");
    node.append("<a href='product.html?id=" + product[0] + "'><img src='http://localhost:9001/ipfs/" + product[3] + "' width='150px' /></a>");
    node.append("<div>" + product[1] + "</div>");
    node.append("<div>" + product[2] + "</div>");
    node.append("<div>" + product[5] + "</div>");
    node.append("<div>" + product[6] + "</div>");
    node.append("<div> Ether " + product[7] + "</div>");
    return node;
}

function saveProduct(reader, decodedParams){
    let imageId, descId;
    saveImageOnIpfs(reader).then(id=>{
        imageId = id;
        saveTextBlobOnIpfs(decodedParams["product-description"]).then(id=>{
            descId = id;
            saveProductToBlockchain(decodedParams, imageId, descId);
        });
    });
}

function saveImageOnIpfs(reader){
    return new Promise((resolve, reject)=>{
        let buffer = Buffer.from(reader.result);
        ipfs.add(buffer).then(res=>{
            console.log("res: ", res);
            resolve(res[0].hash);
        }).catch(err=>{
            console.error(err);
            reject(err);
        });
    });
}

function saveTextBlobOnIpfs(blob){
    return new Promise((resolve, reject)=>{
        let buffer = Buffer.from(blob, 'utf-8');
        ipfs.add(buffer).then(res=>{
            console.log("res: ", res);
            resolve(res[0].hash);
        }).catch(err=>{
            console.error(err);
            reject(err);
        });
    });
}

function saveProductToBlockchain(params, imageId, descId){
    console.log("params in save product: ", params);
    let auctionStartTime = Date.parse(params["product-auction-start"])/1000;
    let auctionEndTime = auctionStartTime + parseInt(params["product-auction-end"]) * 24 * 60 * 60;
    EcommerceStore.deployed().then(i=>{
        i.addProductToStore(params["product-name"], params["product-category"], imageId, descId
                , auctionStartTime, auctionEndTime, web3.toWei(params["product-price"],'ether')
                , parseInt(params["product-condition"]), {from: web3.eth.accounts[0]}).then(res=>{
                    $("#msg").show();   
                    $("#msg").html("Your product was successfully added to your store!");
                });
    });
}

function renderProductDetails(productId){
    EcommerceStore.deployed().then(i=>{
        i.getProduct(productId).then(p=>{
            let desc = '';
            ipfs.cat(p[4]).then(file=>{
                desc = file.toString();
                $("#product-desc").append("<div>" + desc + "</div>");
            });
            $("#product-image").append("<img src='http://localhost:9001/ipfs/" + p[3] + "' width='250px' />");
            $("#product-name").html(p[1]);
            $("#product-price").html(displayPrice(p[7]));
            $("#product-id").val(p[0]);
            $("#product-auction-end").html(displayEndTime(p[6]));
            $("#bidding, #revealing, #finalize-auction, #escrow-info").hide();
            let currentTime = getCurrentTime();
            if(parseInt(p[8]) == 1)
                EcommerceStore.deployed().then(i=>{
                    $("#escrow-info").show();
                    i.highestBidderInfo(productId).then(info=>{
                        $("#product-status").html("Auction has ended. Product sold to " + info[0] + " for " + displayPrice(info[2]) +
                        "The money is in the escrow. Two of the three participants (Buyer, Seller and Arbiter) have to " +
                        "either release the funds to seller or refund the money to the buyer");
                    });
                    i.escrowInfo(productId).then(info=>{
                        $("#seller").html('Seller: ' + info[0]);
                        $("#buyer").html('Buyer: ' + info[1]);
                        $("#arbiter").html('Arbiter: ' + info[2]);
                        if(info[3] == true){
                            $("#release-funds").hide();
                            $("#refund-funds").hide();
                            $("#release-count").html("Amount from the escrow has been released");
                        } else{
                            $("#release-count").html(info[4] + " of 3 participants have agreed to release funds to seller");
                            $("#refund-count").html(info[5] + " of 3 participants have agreed to refund the buyer");
                        }
                    });
                });

            else if(parseInt(p[8]) == 2)
                $("#product-status").html("Product not sold");
            else if(currentTime < p[6])
                $("#bidding").show();
            else if( currentTime - (200) < p[6] )
                $("#revealing").show();
            else
                $("#finalize-auction").show();
        });
    });
}

function displayPrice(amount){
    return web3.fromWei(amount, 'ether') + 'ETH';
}

function getCurrentTime(){
    return Math.round(new Date()/1000);
}

function displayEndTime(timestamp){
    let current_time = getCurrentTime();
    let remaining_time = timestamp - current_time;

    if(remaining_time <= 0){
        return "Auction has ended";
    }
    let days = Math.trunc(remaining_time/(60*60*24));
    remaining_time -= days * 60 * 60 * 24;

    let hours = Math.trunc(remaining_time/(60*60));
    remaining_time -= hours * 60 * 60;

    let minutes =  Math.trunc(remaining_time / 60);
    remaining_time -= minutes * 60;

    if(days > 0){
        return "Auction ends in " + days + " days" + hours + " hours" + minutes + " minutes" + remaining_time + " seconds";
    } else if (hours > 0){
        return "Auction ends in " + hours + " hours" + minutes + " minutes" + remaining_time + " seconds";
    } else if (minutes > 0){
        return "Auction ends in " + minutes + " minutes" + remaining_time + " seconds";
    } else{
        return "Auction ends in " + remaining_time + " seconds";
    }
}

window.addEventListener('load', function(){
    if(typeof web3 !== undefined){
        window.web3 = new Web3(web3.currentProvider);
    } else{
        window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }
    App.start();
});