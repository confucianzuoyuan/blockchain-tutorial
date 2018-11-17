EcommerceStore = artifacts.require('./EcommerceStore.sol');

module.exports = function(){
    amt_1 = web3.toWei(1, 'ether');
    current_time = Math.round(new Date()/1000);
    EcommerceStore.deployed().then(i=>{i.addProductToStore('iphone 5', 'Cell Phones & Accessories', 'QmRQJ2vStY1ZrGs6hft3WGi5y8UcKaJe2bEr7ayActQAsd', 'QmTLr5Nw7U9xxqDcrx7bYZa27fhbTfB5FrxoFZVzZvTw6y', current_time, current_time + 300, 2*amt_1, 0).then(console.log)});
    EcommerceStore.deployed().then(i=>{i.addProductToStore('iphone 6s', 'Cell Phones & Accessories', 'QmbwvNNfuHUAXsR2hSruBTh7EjCACGw2tYxh3NGHzbFbWZ', 'QmWeysTWsbGfawRNsprZNmeW3v88Ho2RGh3Smi36BwSLCu', current_time, current_time + 600, 3*amt_1, 0).then(console.log)});
    EcommerceStore.deployed().then(function(i) {i.addProductToStore('iphone 6', 'Cell Phones & Accessories', 'QmStqeYPDCTbgKGUwns2nZixC5dBDactoCe1FB8htpmrt1', 'QmbLRFj5U6UGTy3o9Zt8jEnVDuAw2GKzvrrv3RED9wyGRk', current_time, current_time + 400, amt_1, 0).then(function(f) {console.log(f)})}); 
    EcommerceStore.deployed().then(function(i) {i.addProductToStore('iphone 6s', 'Cell Phones & Accessories', 'QmStqeYPDCTbgKGUwns2nZixC5dBDactoCe1FB8htpmrt1', 'QmbLRFj5U6UGTy3o9Zt8jEnVDuAw2GKzvrrv3RED9wyGRk', current_time, current_time + 86400, 4*amt_1, 1).then(function(f) {console.log(f)})});
    EcommerceStore.deployed().then(function(i) {i.addProductToStore('iphone 7', 'Cell Phones & Accessories', 'QmStqeYPDCTbgKGUwns2nZixC5dBDactoCe1FB8htpmrt1', 'QmbLRFj5U6UGTy3o9Zt8jEnVDuAw2GKzvrrv3RED9wyGRk', current_time, current_time + 86400, 5*amt_1, 1).then(function(f) {console.log(f)})});
    EcommerceStore.deployed().then(function(i) {i.addProductToStore('Jeans', 'Clothing, Shoes & Accessories', 'QmZwfUuHwBhwshGfo4HEvvvZwcdrppas156uNRxEVU3VYr', 'QmbLRFj5U6UGTy3o9Zt8jEnVDuAw2GKzvrrv3RED9wyGRk', current_time, current_time + 86400 + 86400 + 86400, 5*amt_1, 1).then(function(f) {console.log(f)})});
    EcommerceStore.deployed().then(function(i) {i.productIndex.call().then(function(f){console.log(f)})});
};
