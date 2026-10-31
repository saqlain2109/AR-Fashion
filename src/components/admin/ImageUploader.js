'use client';
import { useState, useRef } from 'react';
import {
  Upload,
  X,
  Star,
  ArrowLeft,
  ArrowRight,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

export default function ImageUploader({
  images = [], // Array of URLs (strings)
  onChange, // (newImagesArray) => void
  mainImage,
  onMainImageChange, // (mainImageUrl) => void
}) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleFiles = async (filesList) => {
    if (!filesList || filesList.length === 0) return;
    setErrorMessage('');
    setUploading(true);
    setUploadProgress(10);

    const formData = new FormData();
    const validFiles = [];

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    for (let i = 0; i < filesList.length; i++) {
      const file = filesList[i];
      if (!allowedTypes.includes(file.type)) {
        setErrorMessage(`File "${file.name}" is not a valid image. Only JPG, PNG, WEBP, and GIF are allowed.`);
        setUploading(false);
        return;
      }
      if (file.size > maxSize) {
        setErrorMessage(`File "${file.name}" exceeds the 10MB limit.`);
        setUploading(false);
        return;
      }
      formData.append('files', file);
      validFiles.push(file);
    }

    if (validFiles.length === 0) {
      setUploading(false);
      return;
    }

    try {
      setUploadProgress(40);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(80);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      setUploadProgress(100);
      const newUrls = [...images, ...data.urls];
      onChange(newUrls);

      // If no main image selected yet, pick the first
      if (!mainImage && newUrls.length > 0) {
        onMainImageChange(newUrls[0]);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Image upload failed. Please try again.');
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeImage = (indexToRemove) => {
    const targetUrl = images[indexToRemove];
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);

    if (mainImage === targetUrl) {
      onMainImageChange(updated.length > 0 ? updated[0] : null);
    }
  };

  const moveImage = (index, direction) => {
    const targetIdx = direction === 'left' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= images.length) return;

    const copy = [...images];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;
    onChange(copy);
  };

  return (
    <div className="space-y-4">
      {/* Upload Drag & Drop Area */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-emerald-500 bg-emerald-50/60 scale-[1.01]'
            : 'border-slate-300 hover:border-emerald-500 bg-slate-50/50 hover:bg-slate-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-1">
            <Upload size={22} />
          </div>
          <p className="text-sm font-semibold text-slate-800">
            Drag and drop product images here, or{' '}
            <span className="text-emerald-600 hover:underline">browse files</span>
          </p>
          <p className="text-xs text-slate-500">
            Supports high-resolution JPG, PNG, WEBP, GIF (Up to 10MB per file)
          </p>
        </div>
      </div>

      {/* Upload Progress Bar */}
      {uploading && (
        <div className="space-y-1.5 p-3 rounded-xl bg-slate-100 border border-slate-200">
          <div className="flex justify-between text-xs font-semibold text-slate-700">
            <span className="flex items-center gap-1.5">
              <Loader2 size={13} className="animate-spin text-emerald-600" />
              Uploading actual photographs...
            </span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage('')}
            className="ml-auto text-rose-500 hover:text-rose-700"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Uploaded Images Gallery & Reordering Grid */}
      {images.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>Uploaded Photographs ({images.length})</span>
            <span className="text-slate-400">Click star to set as main thumbnail</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {images.map((url, idx) => {
              const isMain = url === mainImage || (!mainImage && idx === 0);

              return (
                <div
                  key={url + idx}
                  className={`relative group rounded-xl overflow-hidden border-2 transition-all bg-white shadow-xs ${
                    isMain ? 'border-emerald-600 ring-2 ring-emerald-500/20' : 'border-slate-200'
                  }`}
                >
                  {/* Thumbnail Image */}
                  <div className="aspect-square w-full relative bg-slate-100">
                    <img
                      src={url}
                      alt={`Product image ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Main Badge */}
                  {isMain && (
                    <div className="absolute top-1.5 left-1.5 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                      <Star size={10} className="fill-white" />
                      <span>Main</span>
                    </div>
                  )}

                  {/* Actions overlay */}
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                    {/* Top actions: Make Main & Delete */}
                    <div className="flex justify-between items-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMainImageChange(url);
                        }}
                        title="Set as Main Product Image"
                        className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          isMain
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white/80 text-slate-700 hover:bg-white'
                        }`}
                      >
                        <Star size={13} className={isMain ? 'fill-white' : ''} />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(idx);
                        }}
                        title="Remove image"
                        className="p-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white transition-colors"
                      >
                        <X size={13} />
                      </button>
                    </div>

                    {/* Bottom actions: Reorder Left / Right */}
                    <div className="flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveImage(idx, 'left');
                        }}
                        disabled={idx === 0}
                        title="Move left"
                        className="p-1 rounded bg-white/80 hover:bg-white text-slate-800 disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <ArrowLeft size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveImage(idx, 'right');
                        }}
                        disabled={idx === images.length - 1}
                        title="Move right"
                        className="p-1 rounded bg-white/80 hover:bg-white text-slate-800 disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
