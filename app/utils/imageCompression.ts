const compressImage = (file: File, maxSizeMB: number, maxWidthOrHeight: number): Promise<File> =>
    new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            const img = new window.Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                if (width > maxWidthOrHeight || height > maxWidthOrHeight) {
                    if (width > height) {
                        height = Math.round((height *= maxWidthOrHeight / width));
                        width = maxWidthOrHeight;
                    } else {
                        width = Math.round((width *= maxWidthOrHeight / height));
                        height = maxWidthOrHeight;
                    }
                }

                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    return resolve(file); // fallback
                }

                // Fill white background in case of transparent PNGs being converted to JPEG
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);

                // Always use image/jpeg because canvas.toBlob ignores quality for image/png
                const type = "image/jpeg";
                const maxSizeBytes = maxSizeMB * 1024 * 1024;

                const initialQuality = 0.9;

                const attemptCompression = (currentQuality: number) => {
                    canvas.toBlob(
                        (blob) => {
                            if (!blob) {
                                return resolve(file); // fallback
                            }

                            // If the blob is smaller than max size, or quality is already very low, we accept it
                            if (blob.size <= maxSizeBytes || currentQuality <= 0.1) {
                                const newName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
                                const newFile = new File([blob], newName, {
                                    type: blob.type,
                                    lastModified: Date.now(),
                                });
                                (newFile as File & { originalSize?: number }).originalSize = file.size;
                                resolve(newFile);
                            } else {
                                // Recursively try with lower quality
                                attemptCompression(currentQuality - 0.2);
                            }
                        },
                        type,
                        currentQuality
                    );
                };

                attemptCompression(initialQuality);
            };
            img.onerror = () => resolve(file); // fallback
        };
        reader.onerror = () => resolve(file); // fallback
    });

export default compressImage;