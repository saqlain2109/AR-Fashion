'use client';
import { useState, useRef, useMemo } from 'react';
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
  Tag,
  Palette,
  Filter,
} from 'lucide-react';

export default function ImageUploader({
  images = [], // Array of strings (URLs) OR objects { url, colour }
  onChange, // (newImagesArray) => void
  mainImage,
  onMainImageChange, // (mainImageUrl) => void
  availableColours = [], // Array of string colour names from variants, e.g. ['Midnight Black', 'Royal Maroon']
}) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedFilterColour, setSelectedFilterColour] = useState('ALL');
  const [uploadTargetColour, setUploadTargetColour] = useState('');
  const fileInputRef = useRef(null);

  // Normalize images to always be objects: { url, colour }
  const normalizedImages = useMemo(() => {
    return (images || []).map((img) => {
      if (typeof img === 'string') {
        return { url: img, colour: '' };
      }
      return { url: img.url, colour: img.colour || '' };
    });
  }, [images]);

  // Distinct colours present across images and availableColours
  const allKnownColours = useMemo(() => {
    const set = new Set(availableColours);
    normalizedImages.forEach((img) => {
      if (img.colour && img.colour.trim()) set.add(img.colour.trim());
    });
    return Array.from(set);
  }, [availableColours, normalizedImages]);

  // Filtered view
  const visibleImages = useMemo(() => {
    if (selectedFilterColour === 'ALL') return normalizedImages;
    if (selectedFilterColour === '__UNTAGGED__') return normalizedImages.filter((img) => !img.colour);
    return normalizedImages.filter((img) => img.colour === selectedFilterColour);
  }, [normalizedImages, selectedFilterColour]);

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

      // Determine which colour to tag new images with
      const activeColourTag = uploadTargetColour || (selectedFilterColour !== 'ALL' && selectedFilterColour !== '__UNTAGGED__' ? selectedFilterColour : '');

      const newObjects = data.urls.map((url) => ({
        url,
        colour: activeColourTag,
      }));

      const combined = [...normalizedImages, ...newObjects];
      onChange(combined);

      // If no main image selected yet, pick the first
      if (!mainImage && combined.length > 0) {
        onMainImageChange(combined[0].url);
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

  const removeImage = (globalIndex) => {
    const targetUrl = normalizedImages[globalIndex].url;
    const updated = normalizedImages.filter((_, idx) => idx !== globalIndex);
    onChange(updated);

    if (mainImage === targetUrl) {
      onMainImageChange(updated.length > 0 ? updated[0].url : null);
    }
  };

  const moveImage = (globalIndex, direction) => {
    const targetIdx = direction === 'left' ? globalIndex - 1 : globalIndex + 1;
    if (targetIdx < 0 || targetIdx >= normalizedImages.length) return;

    const copy = [...normalizedImages];
    const temp = copy[globalIndex];
    copy[globalIndex] = copy[targetIdx];
    copy[targetIdx] = temp;
    onChange(copy);
  };

  const updateImageColour = (globalIndex, newColour) => {
    const copy = [...normalizedImages];
    copy[globalIndex] = {
      ...copy[globalIndex],
      colour: newColour === '__ALL__' ? '' : newColour,
    };
    onChange(copy);
  };

  return (
    <div className="space-y-4">
      {/* 1. Header with Colour Filter Tabs & Upload Target Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2">
          <Palette size={16} className="text-emerald-600" />
          <span className="text-xs font-bold text-slate-800">Colour Filter & Management:</span>
        </div>

        {/* Upload Target Colour Dropdown */}
        <div className="flex items-center gap-2 text-xs">
          <label className="text-slate-600 font-semibold">Assign new uploads to:</label>
          <select
            value={uploadTargetColour}
            onChange={(e) => setUploadTargetColour(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Colours / General</option>
            {allKnownColours.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Colour Filter Pills */}
      {allKnownColours.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedFilterColour('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              selectedFilterColour === 'ALL'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            All Photos ({normalizedImages.length})
          </button>

          {allKnownColours.map((colName) => {
            const count = normalizedImages.filter((img) => img.colour === colName).length;
            const isSelected = selectedFilterColour === colName;
            return (
              <button
                key={colName}
                type="button"
                onClick={() => setSelectedFilterColour(colName)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white hover:bg-emerald-50 text-slate-700 border-slate-200'
                }`}
              >
                <span>{colName}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isSelected ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {count}
                </span>
              </button>
            );
          })}

          {normalizedImages.some((img) => !img.colour) && (
            <button
              type="button"
              onClick={() => setSelectedFilterColour('__UNTAGGED__')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                selectedFilterColour === '__UNTAGGED__'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-white hover:bg-amber-50 text-slate-700 border-slate-200'
              }`}
            >
              General / All Colours ({normalizedImages.filter((img) => !img.colour).length})
            </button>
          )}
        </div>
      )}

      {/* 2. Upload Drag & Drop Area */}
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
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
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
            Upload multiple photos. {uploadTargetColour ? `(Will be assigned to: "${uploadTargetColour}")` : '(Select a colour above or tag each image individually below)'}
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

      {/* 3. Uploaded Images Gallery & Colour Separation Grid */}
      {normalizedImages.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>
              Showing {visibleImages.length} of {normalizedImages.length} Photographs
            </span>
            <span className="text-slate-400">
              Tag each photo to its matching colour so storefront customers see correct photos when clicking a colour!
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
            {visibleImages.map((img) => {
              const globalIdx = normalizedImages.findIndex((orig) => orig.url === img.url);
              const isMain = img.url === mainImage || (!mainImage && globalIdx === 0);

              return (
                <div
                  key={img.url + globalIdx}
                  className={`group rounded-2xl overflow-hidden border-2 transition-all bg-white shadow-xs flex flex-col justify-between ${
                    isMain ? 'border-emerald-600 ring-2 ring-emerald-500/20' : 'border-slate-200'
                  }`}
                >
                  {/* Thumbnail Image Container */}
                  <div className="aspect-square w-full relative bg-slate-100 overflow-hidden">
                    <img
                      src={img.url}
                      alt={`Product photograph ${globalIdx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Main Badge */}
                    {isMain && (
                      <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 z-10">
                        <Star size={10} className="fill-white" />
                        <span>Main Cover</span>
                      </div>
                    )}

                    {/* Assigned Colour Badge */}
                    {img.colour && (
                      <div className="absolute top-2 right-2 bg-slate-900/85 backdrop-blur-xs text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 z-10 border border-slate-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span className="truncate max-w-[80px]">{img.colour}</span>
                      </div>
                    )}

                    {/* Hover Actions Overlay */}
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 z-20">
                      {/* Top actions */}
                      <div className="flex justify-between items-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMainImageChange(img.url);
                          }}
                          title="Set as Main Cover Image"
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
                            removeImage(globalIdx);
                          }}
                          title="Remove photograph"
                          className="p-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white transition-colors"
                        >
                          <X size={13} />
                        </button>
                      </div>

                      {/* Reorder Buttons */}
                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveImage(globalIdx, 'left');
                          }}
                          disabled={globalIdx === 0}
                          title="Move left"
                          className="p-1 rounded bg-white/80 hover:bg-white text-slate-800 disabled:opacity-30 disabled:pointer-events-none"
                        >
                          <ArrowLeft size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveImage(globalIdx, 'right');
                          }}
                          disabled={globalIdx === normalizedImages.length - 1}
                          title="Move right"
                          className="p-1 rounded bg-white/80 hover:bg-white text-slate-800 disabled:opacity-30 disabled:pointer-events-none"
                        >
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Colour Tag Selector Dropdown */}
                  <div className="p-2 bg-slate-50 border-t border-slate-200">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Assigned Colour:
                    </label>
                    <select
                      value={img.colour || '__ALL__'}
                      onChange={(e) => updateImageColour(globalIdx, e.target.value)}
                      className="w-full text-xs font-bold p-1 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 truncate"
                    >
                      <option value="__ALL__">🎨 All Colours (Default)</option>
                      {allKnownColours.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
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
