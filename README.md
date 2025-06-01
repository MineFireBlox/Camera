<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mobile Camera View</title>
    <style>
        /* Basic styling for the body */
        body {
            font-family: 'Inter', sans-serif; /* Using Inter font as per instructions */
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh; /* Full viewport height */
            margin: 0;
            background-color: #f0f2f5; /* Light grey background */
            color: #333;
            padding: 20px; /* Add some padding around the content */
            box-sizing: border-box; /* Include padding in element's total width and height */
        }

        /* Header styling */
        h1 {
            color: #2c3e50;
            margin-bottom: 25px;
            font-size: 2.2em;
            text-align: center;
        }

        /* Container for the video feed */
        #cameraContainer {
            position: relative;
            width: 95vw; /* Take 95% of viewport width */
            max-width: 720px; /* Max width for larger screens */
            background-color: #000; /* Black background for video area */
            border: 2px solid #555;
            border-radius: 12px; /* Rounded corners for the container */
            box-shadow: 0 8px 16px rgba(0,0,0,0.25); /* Soft shadow */
            overflow: hidden; /* Hide anything outside the video bounds */
            margin-bottom: 30px;
            aspect-ratio: 16 / 9; /* Maintain a common video aspect ratio */
            display: flex;
            align-items: center;
            justify-content: center;
        }

        /* Video element styling */
        video {
            display: block; /* Remove extra space below video */
            width: 100%;
            height: 100%;
            object-fit: cover; /* Fill the container, cropping if necessary */
            border-radius: 10px; /* Slightly smaller rounded corners than container */
        }

        /* Controls button group */
        .controls {
            display: flex;
            flex-wrap: wrap; /* Allow buttons to wrap on smaller screens */
            gap: 15px; /* Space between buttons */
            justify-content: center;
            margin-bottom: 20px;
        }

        /* Button base styling */
        button {
            padding: 14px 28px;
            font-size: 1.1em;
            cursor: pointer;
            border: none;
            border-radius: 8px; /* Rounded corners for buttons */
            transition: background-color 0.3s ease, transform 0.2s ease, box-shadow 0.2s ease;
            font-weight: bold;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        button:hover {
            transform: translateY(-2px); /* Slight lift effect on hover */
            box-shadow: 0 6px 10px rgba(0,0,0,0.15);
        }

        button:active {
            transform: translateY(0); /* Press effect */
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        button:disabled {
            background-color: #cccccc !important; /* Grey out disabled buttons */
            color: #666666 !important;
            cursor: not-allowed;
            box-shadow: none;
            transform: none;
        }

        /* Specific button colors */
        #startButton {
            background-color: #28a745; /* Green */
            color: white;
        }
        #startButton:hover {
            background-color: #218838;
        }

        #stopButton {
            background-color: #dc3545; /* Red */
            color: white;
        }
        #stopButton:hover {
            background-color: #c82333;
        }

        #switchCameraButton {
            background-color: #007bff; /* Blue */
            color: white;
        }
        #switchCameraButton:hover {
            background-color: #0069d9;
        }

        /* Message text styling */
        .message {
            margin-top: 15px;
            color: #6c757d;
            text-align: center;
            font-size: 0.95em;
            max-width: 80%;
        }

        /* Responsive adjustments for smaller screens */
        @media (max-width: 600px) {
            h1 {
                font-size: 1.8em;
                margin-bottom: 20px;
            }
            button {
                padding: 12px 20px;
                font-size: 1em;
            }
            .controls {
                flex-direction: column; /* Stack buttons vertically on small screens */
                gap: 10px;
            }
            #cameraContainer {
                aspect-ratio: 4 / 3; /* More common mobile camera ratio */
            }
        }
    </style>
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
        Please grant camera permission when prompted. This website requires a secure connection (HTTPS) to access your camera.
    </p>

    <script>
        // Get references to the HTML elements
        const video = document.getElementById('cameraFeed');
        const startButton = document.getElementById('startButton');
        const stopButton = document.getElementById('stopButton');
        const switchCameraButton = document.getElementById('switchCameraButton');

        let currentStream = null; // Variable to hold the active camera stream
        // 'environment' for back camera, 'user' for front camera
        let facingMode = 'environment'; // Default to back camera

        /**
         * Asynchronously starts the camera stream based on the current facingMode.
         * It first stops any existing stream to prevent conflicts.
         */
        async function startCamera() {
            // If a stream is already active, stop it before starting a new one
            if (currentStream) {
                stopCamera();
            }

            try {
                // Define constraints for getUserMedia to request video from the camera
                // We request an ideal resolution for better quality, and specify facingMode
                const constraints = {
                    video: {
                        facingMode: facingMode, // Use the current facing mode ('user' or 'environment')
                        width: { ideal: 1280 }, // Request ideal width for the video stream
                        height: { ideal: 720 }  // Request ideal height for the video stream
                    }
                };

                // Request access to the user's media devices (specifically video)
                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                // Set the video element's source to the camera stream
                video.srcObject = stream;
                currentStream = stream; // Store the stream for future operations (like stopping)

                // Update button states: disable Start, enable Stop
                startButton.disabled = true;
                stopButton.disabled = false;

                // Check if multiple video input devices (cameras) are available
                // to determine if the 'Switch Camera' button should be enabled
                const devices = await navigator.mediaDevices.enumerateDevices();
                const videoInputDevices = devices.filter(device => device.kind === 'videoinput');

                // If more than one video input device is found, enable the Switch Camera button
                if (videoInputDevices.length > 1) {
                    switchCameraButton.disabled = false;
                } else {
                    // Otherwise, disable it as there's nothing to switch to
                    switchCameraButton.disabled = true;
                }

            } catch (err) {
                // Log the error to the console for debugging
                console.error('Error accessing camera:', err);
                // Display a user-friendly alert message
                alert(`Could not access the camera. Please ensure you have granted permission and no other application is using it. Error: ${err.name}`);

                // Re-enable Start button and disable others on error
                startButton.disabled = false;
                stopButton.disabled = true;
                switchCameraButton.disabled = true;
            }
        }

        /**
         * Stops the currently active camera stream.
         * It iterates through all tracks in the stream and stops each one.
         */
        function stopCamera() {
            if (currentStream) {
                // Get all media tracks (video, audio) from the stream
                currentStream.getTracks().forEach(track => track.stop()); // Stop each track
                video.srcObject = null; // Disconnect the stream from the video element
                currentStream = null; // Clear the stored stream
            }
            // Update button states: enable Start, disable Stop and Switch
            startButton.disabled = false;
            stopButton.disabled = true;
            switchCameraButton.disabled = true;
        }

        /**
         * Toggles the camera facing mode ('user' for front, 'environment' for back)
         * and then restarts the camera with the new mode.
         */
        async function switchCamera() {
            // Toggle the facing mode
            facingMode = (facingMode === 'user') ? 'environment' : 'user';
            // Restart the camera with the newly selected facing mode
            await startCamera();
        }

        // Add event listeners to the buttons
        startButton.addEventListener('click', startCamera);
        stopButton.addEventListener('click', stopCamera);
        switchCameraButton.addEventListener('click', switchCamera);

        /**
         * Event listener for device changes. This can help detect if a camera
         * becomes unavailable (e.g., permission revoked, device disconnected).
         */
        navigator.mediaDevices.ondevicechange = async () => {
            // If there's an active stream and it's no longer active (e.g., stopped externally)
            if (currentStream && !currentStream.active) {
                console.log('Camera stream became inactive. Stopping.');
                stopCamera(); // Stop the stream gracefully
            }
            // Re-evaluate if the switch camera button should be enabled after a device change
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoInputDevices = devices.filter(device => device.kind === 'videoinput');
            // Enable switch button only if there's an active stream and multiple cameras
            if (videoInputDevices.length > 1 && currentStream) {
                switchCameraButton.disabled = false;
            } else {
                switchCameraButton.disabled = true;
            }
        };

        /**
         * Initial check for camera support when the page loads.
         * Provides feedback to the user if their browser doesn't support the API
         * or if no cameras are detected.
         */
        async function checkCameraSupport() {
            // Check if navigator.mediaDevices and getUserMedia are supported by the browser
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                alert('Your browser does not support camera access via getUserMedia API. Please use a modern browser (e.g., Chrome, Firefox, Safari).');
                startButton.disabled = true; // Disable start button if not supported
            } else {
                try {
                    // Enumerate devices to see if any video input devices are present
                    const devices = await navigator.mediaDevices.enumerateDevices();
                    const videoInputDevices = devices.filter(device => device.kind === 'videoinput');
                    if (videoInputDevices.length === 0) {
                        alert('No camera detected on this device.');
                        startButton.disabled = true; // Disable start button if no camera found
                    }
                } catch (error) {
                    console.error('Error enumerating devices:', error);
                    // This error might occur if the user denies permission to enumerate devices
                    alert('An error occurred while checking for cameras. Please ensure you have granted necessary permissions.');
                }
            }
        }

        // Call the camera support check function when the script loads
        checkCameraSupport();
    </script>
</body>
</html>
