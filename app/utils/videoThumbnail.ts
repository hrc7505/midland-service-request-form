/**
 * Generates a thumbnail image from a video file.
 * Returns a base64 data URL of the thumbnail.
 */
export default function getVideoThumbnail(file: File): Promise<string> {
    return new Promise((resolve) => {
        const url = URL.createObjectURL(file);
        const video = document.createElement("video");
        video.src = url;
        video.muted = true;
        video.playsInline = true;
        video.preload = "metadata";

        video.onloadeddata = () => {
            // Seek to 0.1s to get a good frame (avoiding empty first frame)
            video.currentTime = Math.min(0.1, video.duration / 2 || 0);
        };

        video.onseeked = () => {
            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");
            ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL("image/jpeg");
            
            URL.revokeObjectURL(url);
            resolve(dataUrl);
        };

        video.onerror = () => {
            URL.revokeObjectURL(url);
            resolve(""); // return empty if generation fails
        };
    });
}
