export async function getCroppedImg(
    imageSrc: string,
    crop: { x: number; y: number },
    zoom: number,
    aspect: number
): Promise<Blob> {
    const image = new Image();
    image.src = imageSrc;

    await new Promise((resolve) => (image.onload = resolve));

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    const naturalWidth = image.naturalWidth;
    const naturalHeight = image.naturalHeight;

    const cropX = (crop.x * naturalWidth) / 100;
    const cropY = (crop.y * naturalHeight) / 100;

    const width = naturalWidth / zoom;
    const height = naturalHeight / zoom;

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(
        image,
        cropX,
        cropY,
        width,
        height,
        0,
        0,
        width,
        height
    );

    return new Promise((resolve) =>
        canvas.toBlob((blob) => resolve(blob!), "image/jpeg")
    );
}
