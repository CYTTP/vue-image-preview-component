
//
/**
 * A new XMLHttpRequest object has been created to initiate network requests, 
 * with the response type set to Blob, which means that the expected response will be a binary file.
 * @param {*} url 
 * @param {*} cb 
 */
export const getBlob = (url, cb) => {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'blob';
    xhr.onload = function () {
        if (xhr.status === 200) {
            cb(xhr.response);
        }
    };
    xhr.send();
}
/**
 *  Save binary data as a file in different browsers
 * @param {*} blob 
 * @param {*} filename 
 */
export const saveAs = (blob, filename) => {
    //Check if the browser supports the navigator.msSaveOrOpenBlob method.
    // Microsoft Edge or Internet Explorer 
    if (window.navigator.msSaveOrOpenBlob) {
        navigator.msSaveBlob(blob, filename);
    } else {
        var link = document.createElement('a');
        var body = document.querySelector('body');
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;
        // fix Firefox
        link.style.display = 'none';
        body.appendChild(link);
        link.click();
        body.removeChild(link);
        window.URL.revokeObjectURL(link.href);
    }
}


