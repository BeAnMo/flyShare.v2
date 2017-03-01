window.onload = main;

function main(){
    var fileList = document.getElementById('fileList');

    fileList.addEventListener('click', getFileList, false);

    function getFileList(event){
        event.preventDefault();
        console.log('getting file list...');

        var req = new XMLHttpRequest();

        req.open('GET', '../shared', true);
        req.responseType = 'json';

        req.addEventListener('load', function(){
            console.log('status', req.status);
            console.log(req.response);
        });

        req.send(null);
    }
}

