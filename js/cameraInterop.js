window.cameraInterop = (function () {
    const streams = {}; // keyed by element id

    async function getCameras() {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
                return [];
            }
            const devices = await navigator.mediaDevices.enumerateDevices();
            return devices
                .filter(d => d.kind === 'videoinput')
                .map((d, i) => ({
                    deviceId: d.deviceId,
                    label: d.label || `Camera ${i + 1}`
                }));
        } catch (err) {
            console.error('getCameras error', err);
            return [];
        }
    }

    async function startCamera(videoElementId, deviceId) {
        try {
            const video = document.getElementById(videoElementId);
            if (!video) throw new Error('Video element not found');

            // Stop any existing stream for this element
            await stopCamera(videoElementId);

            const constraints = {
                video: deviceId ? { deviceId: { exact: deviceId } } : { facingMode: 'environment' },
                audio: false
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            video.srcObject = stream;
            streams[videoElementId] = stream;
            await video.play();
            return { success: true };
        } catch (err) {
            console.error('startCamera error', err);
            return { success: false, error: err?.message || String(err) };
        }
    }

    async function stopCamera(videoElementId) {
        try {
            const stream = streams[videoElementId];
            if (stream) {
                stream.getTracks().forEach(t => t.stop());
                delete streams[videoElementId];
            }
            const video = document.getElementById(videoElementId);
            if (video && video.srcObject) {
                video.srcObject = null;
            }
            return { success: true };
        } catch (err) {
            console.warn('stopCamera error', err);
            return { success: false, error: String(err) };
        }
    }

    function captureImage(videoElementId, maxWidth = 1280, maxHeight = 720, mimeType = 'image/jpeg', quality = 0.9) {
        try {
            const video = document.getElementById(videoElementId);
            if (!video) return { success: false, error: 'Video element not found' };

            const canvas = document.createElement('canvas');
            const vw = video.videoWidth || video.clientWidth || 640;
            const vh = video.videoHeight || video.clientHeight || 480;

            // Resize while preserving aspect ratio
            let w = vw, h = vh;
            if (maxWidth && w > maxWidth) {
                w = maxWidth;
                h = Math.round((vh / vw) * w);
            }
            if (maxHeight && h > maxHeight) {
                h = maxHeight;
                w = Math.round((vw / vh) * h);
            }

            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, w, h);

            const dataUrl = canvas.toDataURL(mimeType, quality);
            return { success: true, dataUrl };
        } catch (err) {
            console.error('captureImage error', err);
            return { success: false, error: String(err) };
        }
    }

    return {
        getCameras,
        startCamera,
        stopCamera,
        captureImage
    };
})();
