function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Check for 'alert' query parameter
const alertMessage = getQueryParam('alert');
if(alertMessage){
    alert(`${alertMessage}`)
}