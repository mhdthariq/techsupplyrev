/**
 * Converts an image file to WebP format using HTML5 Canvas.
 * @param file The input image file
 * @param quality Quality of the output WebP image (0 to 1)
 * @returns Promise resolving to a WebP Blob
 */
export async function convertImageToWebP(
  file: File,
  quality = 0.8,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Conversion to WebP failed"));
            }
          },
          "image/webp",
          quality,
        );
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
}
