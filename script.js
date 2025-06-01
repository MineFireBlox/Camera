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
