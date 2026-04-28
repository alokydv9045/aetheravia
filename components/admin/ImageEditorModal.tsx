'use client';

import React, { useState, useCallback } from 'react';
import Cropper, { Point, Area } from 'react-easy-crop';
import { getCroppedImg } from '@/lib/imageUtils';
import { X, RotateCw, Check, Maximize, Crop } from 'lucide-react';

interface ImageEditorModalProps {
  image: string;
  onSave: (croppedImage: Blob) => void;
  onCancel: () => void;
}

export default function ImageEditorModal({ image, onSave, onCancel }: ImageEditorModalProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspect, setAspect] = useState(1); // Default 1:1
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    setIsProcessing(true);
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels, rotation);
      if (croppedImage) {
        onSave(croppedImage);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-base-100 rounded-[2rem] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col h-[85vh]">
        {/* Header */}
        <div className="p-6 border-b border-base-200 flex items-center justify-between bg-base-100/50 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <Crop size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Edit Image</h3>
              <p className="text-xs opacity-60">Adjust crop, rotation, and zoom</p>
            </div>
          </div>
          <button onClick={onCancel} className="btn btn-ghost btn-sm btn-circle">
            <X size={20} />
          </button>
        </div>

        {/* Editor Body */}
        <div className="flex-1 relative bg-base-300/50">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
          />
        </div>

        {/* Controls */}
        <div className="p-6 bg-base-100 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Zoom & Rotation */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest opacity-60">
                  <span>Zoom</span>
                  <span>{Math.round(zoom * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="range range-primary range-xs"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest opacity-60">
                  <span>Rotation</span>
                  <span>{rotation}°</span>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={0}
                    max={360}
                    step={1}
                    value={rotation}
                    onChange={(e) => setRotation(Number(e.target.value))}
                    className="range range-secondary range-xs flex-1"
                  />
                  <button 
                    onClick={() => setRotation((r) => (r + 90) % 360)}
                    className="btn btn-circle btn-ghost btn-xs"
                  >
                    <RotateCw size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-4">
               <div className="text-xs font-bold uppercase tracking-widest opacity-60">Aspect Ratio</div>
               <div className="flex flex-wrap gap-2">
                 {[
                   { label: 'Square (1:1)', value: 1 },
                   { label: 'Portrait (4:5)', value: 4/5 },
                   { label: 'Classic (3:2)', value: 3/2 },
                   { label: 'Wide (16:9)', value: 16/9 },
                 ].map((r) => (
                   <button
                     key={r.label}
                     onClick={() => setAspect(r.value)}
                     className={`btn btn-sm rounded-xl px-4 ${aspect === r.value ? 'btn-primary' : 'btn-ghost bg-base-200'}`}
                   >
                     {r.label}
                   </button>
                 ))}
               </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-base-200">
            <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-primary/60">
              <Maximize size={12} />
              Drag to position, scroll to zoom
            </div>
            <div className="flex gap-3">
              <button onClick={onCancel} className="btn btn-ghost btn-sm rounded-xl px-6">Cancel</button>
              <button 
                onClick={handleSave} 
                disabled={isProcessing}
                className="btn btn-primary btn-sm rounded-xl px-8 shadow-lg shadow-primary/20"
              >
                {isProcessing ? <span className="loading loading-spinner loading-xs" /> : <Check size={16} className="mr-2" />}
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
