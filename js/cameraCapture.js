window.cameraCapture = {
    captureImage: async function (mimeType = "image/png", quality = 0.9) {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                return { success: false, error: "Camera API not supported in this browser" };
            }

            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            const video = document.createElement("video");
            video.srcObject = stream;

            await video.play();

            return new Promise((resolve) => {
                video.onloadeddata = () => {
                    try {
                        const canvas = document.createElement("canvas");
                        canvas.width = video.videoWidth || 640;
                        canvas.height = video.videoHeight || 480;

                        const ctx = canvas.getContext("2d");
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                        // Stop all tracks after capture
                        stream.getTracks().forEach(track => track.stop());

                        const dataUrl = canvas.toDataURL(mimeType, quality);
                        resolve({ success: true, dataUrl });
                    } catch (err) {
                        console.error("captureImage error", err);
                        resolve({ success: false, error: String(err) });
                    }
                };
            });
        } catch (err) {
            console.error("captureImage error", err);
            return { success: false, error: err?.message || String(err) };
        }
    }
};
