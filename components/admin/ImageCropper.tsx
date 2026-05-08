'use client';

import React, { useState, useCallback } from 'react';
import Cropper, { Area, Point } from 'react-easy-crop';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageCropperProps {
  image: string;
  onCropComplete: (croppedImage: Blob) => void;
  onCancel: () => void;
  aspect?: number;
}

const ImageCropper: React.FC<ImageCropperProps> = ({ 
  image, 
  onCropComplete, 
  onCancel, 
  aspect = 3 / 4 
}) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropChange = (crop: Point) => setCrop(crop);
  const onZoomChange = (zoom: number) => setZoom(zoom);

  const onCropCompleteInternal = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area
  ): Promise<Blob | null> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg');
    });
  };

  const handleDone = async () => {
    if (croppedAreaPixels) {
      const croppedBlob = await getCroppedImg(image, croppedAreaPixels);
      if (croppedBlob) {
        onCropComplete(croppedBlob);
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 md:p-12"
    >
      <div className="relative w-full max-w-2xl aspect-square md:aspect-[4/3] bg-surface-container rounded-2xl overflow-hidden shadow-2xl">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          onCropChange={onCropChange}
          onCropComplete={onCropCompleteInternal}
          onZoomChange={onZoomChange}
        />
      </div>

      <div className="mt-8 w-full max-w-md space-y-6">
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-white/40">zoom_in</span>
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary"
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleDone}
            className="flex-1 py-4 bg-primary text-on-primary hover:bg-primary-container rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 transition-all"
          >
            Apply Crop
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ImageCropper;
