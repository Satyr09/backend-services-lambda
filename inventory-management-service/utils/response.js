const headers = {
    "Access-Control-Allow-Origin" : "*",
    "Access-Control-Allow-Headers": "*" 
}

const formErrorResponse = (message, statusCode = 501) => {
    const response = {
        "statusCode" : statusCode,
        "body" : message,
        "headers" : headers
    }

    return response;
}

function isCyclic (obj) {
    var keys = [];
    var stack = [];
    var stackSet = new Set();
    var detected = false;
  
    function detect (obj, key) {
      if (obj && typeof obj != 'object') { return; }
  
      if (stackSet.has(obj)) { // it's cyclic! Print the object and its locations.
        var oldindex = stack.indexOf(obj);
        var l1 = keys.join('.') + '.' + key;
        var l2 = keys.slice(0, oldindex + 1).join('.');
        console.log('CIRCULAR: ' + l1 + ' = ' + l2 + ' = ' + obj);
        console.log(obj);
        detected = true;
        return;
      }
  
      keys.push(key);
      stack.push(obj);
      stackSet.add(obj);
      for (var k in obj) { //dive on the object's children
        if (Object.prototype.hasOwnProperty.call(obj, k)) { detect(obj[k], k); }
      }
  
      keys.pop();
      stack.pop();
      stackSet.delete(obj);
      return;
    }
  
    detect(obj, 'obj');
    return detected;
  }
  
const formOKResponse = payload => {

    isCyclic(payload)
    const response = {
        "statusCode" : 200,
        "body" : JSON.stringify(payload),
        "headers" : headers
    }

    return response;
}


module.exports = {
    formOKResponse,
    formErrorResponse
}