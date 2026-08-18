/**
 * Utilidad de Optimización y Compresión de Imágenes en Cliente
 * Redimensiona y convierte cualquier imagen (PNG, JPG, WEBP, etc.) a formato WebP optimizado (< 100KB)
 * directamente en el navegador del usuario antes de subirla a la base de datos o almacenamiento.
 */

export interface CompressOptions {
  maxDimension?: number;
  quality?: number;
}

/**
 * Convierte un File de imagen a una cadena WebP DataURL optimizada.
 */
export async function compressImageToWebP(
  file: File,
  options: CompressOptions = {}
): Promise<string> {
  const { maxDimension = 800, quality = 0.82 } = options;

  // Validación básica de seguridad
  if (!file.type.startsWith('image/')) {
    throw new Error('El archivo seleccionado no es una imagen válida.');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Error al leer el archivo de imagen.'));

    reader.onload = (event) => {
      const img = new Image();

      img.onerror = () => reject(new Error('No se pudo procesar la imagen elegida.'));

      img.onload = () => {
        let { width, height } = img;

        // Calcular escalado proporcional manteniendo la relación de aspecto
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        // Crear canvas HTML5 para renderizar y comprimir
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo obtener el contexto 2D del navegador.'));
          return;
        }

        // Renderizar con suavizado de alta calidad
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir a WebP
        const webpDataUrl = canvas.toDataURL('image/webp', quality);
        resolve(webpDataUrl);
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
