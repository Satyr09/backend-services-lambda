
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

module.exports = validateAsset;