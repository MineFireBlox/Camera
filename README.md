<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mobile Camera View</title>
 <link rel="stylesheet" href="styles.css">
</head>
<body>
    <h1>Live Mobile Camera View</h1>
<div id="cameraContainer">
        <video id="cameraFeed" autoplay playsinline></video>
</div>

<div class="controls">
        <button id="startButton">Start Camera</button>
        <button id="stopButton" disabled>Stop Camera</button>
        <button id="switchCameraButton" disabled>Switch Camera</button>
    </div>

<p class="message">
Please grant camera permission when prompted. This website requires a secure connection (HTTPS) to access your camera.</p>
<script src="script.js"></script>
</body>
</html>
