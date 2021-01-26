
const validateAsset = asset => {
    if(!asset.type) {
        return false;
    }
    if(!asset.location) {
        return false;
    }
    if(!asset.owner) {
        return false;
    }
    return true;
}
const validateProduct = product => {
    if(!product.productType)
        return false;
    if(!product.productName)
        return false;
    if(!product.owner)
        return false;
    if(!product.location)
        return false;
    return true;
}

module.exports = {
    validateAsset,
    validateProduct
};