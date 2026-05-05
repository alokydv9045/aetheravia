"use client";
import { useEffect, useState, useCallback } from "react";
import { uploadBannerImage } from "@/lib/uploadBannerImage";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import toast from 'react-hot-toast';

export default function NewBannerPage() {
  const router = useRouter();
  const [image, setImage] = useState(""); // Cloudinary URL after upload
  const [file, setFile] = useState<File | null>(null); // Local file
  const [preview, setPreview] = useState<string>(""); // Local preview URL
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [order, setOrder] = useState<number>(0);
  const [suggestedOrder, setSuggestedOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch existing banners to suggest next order
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/carousel');
        if (res.ok) {
          const data = await res.json();
            const maxOrder = data.reduce((m: number, b: any) => Math.max(m, b.order || 0), 0);
            setSuggestedOrder(maxOrder + 1);
            setOrder(maxOrder + 1);
        }
      } catch {}
    })();
  }, []);

  const validate = () => {
    if (!file && !image) return 'Please select an image.';
    if (title.trim().length < 3) return 'Title must be at least 3 characters';
    if (link && !/^https?:\/\//i.test(link)) return 'Link must start with http:// or https://';
    return null;
  };

  const processFile = useCallback((f: File) => {
    // Validate file type
    if (!f.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      setFile(null); setPreview(""); return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB.');
      setFile(null); setPreview(""); return;
    }
    setFile(f);
    setImage("");
    setError("");
    setPreview(URL.createObjectURL(f));
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) processFile(f);
  };

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
  };

  async function uploadIfNeeded(): Promise<string> {
    if (image) return image; // already uploaded
    if (!file) throw new Error('No file selected');
    setUploading(true);
    try {
      const url = await uploadBannerImage(file);
      setImage(url);
      return url;
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const v = validate();
    if (v) { setError(v); return; }
    setLoading(true);
    setSuccess("");
    try {
      const imageUrl = await uploadIfNeeded();
      const res = await fetch('/api/admin/carousel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageUrl, title: title.trim(), link: link.trim(), order, isActive })
      });
      if (!res.ok) throw new Error('Failed to create banner');
      setSuccess('Banner added successfully!');
      toast.success('Banner created');
      setTimeout(() => {
        router.push('/admin/carousel');
      }, 900);
    } catch (err:any) {
      setError(err.message || 'Error creating banner');
      toast.error(err.message || 'Error');
    } finally {
      setLoading(false);
    }
  }

  function clearImage() {
    setFile(null); setPreview(""); setImage("");
  }

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold">Add New {process.env.NEXT_PUBLIC_BRAND_NAME || 'AetherAvia'} Banner</h1>
        <p className="text-sm opacity-70">Upload and configure a carousel banner. Optimized aspect ratio ~ 3:1 (e.g. 1500x500).</p>
      </div>

      <div className="grid gap-6 md:grid-cols-5 items-start">
        {/* Form Card */}
        <div className="md:col-span-3">
          <form onSubmit={handleSubmit} className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body p-5 space-y-6">
              {/* Image Uploader */}
              <div className="space-y-2">
                <label className="font-semibold text-sm">Banner Image *</label>
                <div
                  onDragOver={e=>e.preventDefault()}
                  onDrop={onDrop}
                  className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${preview || image ? 'border-primary/60 bg-primary/5' : 'border-base-300 hover:border-primary/60'}`}
                >
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={onSelectFile} />
                  {!preview && !image && (
                    <div className="space-y-2">
                      <div className="text-4xl">🖼️</div>
                      <div className="text-sm">Drag & drop or click to select</div>
                      <div className="text-[11px] opacity-60">Max 5MB • JPG / PNG / WebP</div>
                    </div>
                  )}
                  {(preview || image) && (
                    <div className="relative group">
                      <div className="aspect-[3/1] w-full relative rounded overflow-hidden border border-base-300">
                        {preview && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={preview} alt="Preview" className="object-cover w-full h-full" />
                        )}
                        {!preview && image && (
                          <Image src={image} alt="Uploaded" fill className="object-cover" />
                        )}
                      </div>
                      <div className="flex gap-2 justify-center mt-3">
                        <button type="button" onClick={clearImage} className="btn btn-xs btn-outline">Clear</button>
                        {!image && file && !uploading && <button type="button" onClick={uploadIfNeeded} className="btn btn-xs btn-primary">Upload</button>}
                        {uploading && <span className="loading loading-spinner loading-xs" />}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="form-control">
                  <label className="label"><span className="label-text">Title *</span></label>
                  <input type="text" className="input input-bordered input-sm md:input-md" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Summer Sale" />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Link (optional)</span></label>
                  <input type="text" className="input input-bordered input-sm md:input-md" value={link} onChange={e=>setLink(e.target.value)} placeholder="https://..." />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="form-control">
                  <label className="label"><span className="label-text">Order *</span></label>
                  <input type="number" className="input input-bordered input-sm md:input-md" value={order} onChange={e=>setOrder(Number(e.target.value))} />
                  <div className="text-[10px] mt-1 opacity-60">Suggested: <button type="button" className="link link-primary" onClick={()=>setOrder(suggestedOrder)}>{suggestedOrder}</button></div>
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Status</span></label>
                  <button type="button" onClick={()=>setIsActive(a=>!a)} className={`btn btn-sm ${isActive ? 'btn-success' : 'bg-green-600 hover:bg-green-700 text-white'}`}>{isActive ? 'Active' : 'Inactive'}</button>
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Preview Mode</span></label>
                  <div className="badge badge-outline text-xs py-3">Static</div>
                </div>
              </div>

              {error && <div className="alert alert-error py-2 text-sm">{error}</div>}
              {success && <div className="alert alert-success py-2 text-sm">{success}</div>}

              <div className="flex gap-3 flex-wrap">
                <button type="submit" className="btn btn-primary" disabled={loading || uploading}>{loading ? 'Saving...' : 'Save Banner'}</button>
                <button type="button" className="btn btn-ghost" disabled={loading} onClick={()=>router.push('/admin/carousel')}>Cancel</button>
              </div>
            </div>
          </form>
        </div>

        {/* Live Preview Card */}
        <div className="md:col-span-2 space-y-4">
          <div className="card bg-base-100 border border-base-300 shadow-sm sticky top-4">
            <div className="card-body p-4 space-y-4">
              <h3 className="font-semibold text-sm">Live Preview</h3>
              <div className="relative aspect-[3/1] w-full rounded overflow-hidden border border-base-300 bg-base-200 flex items-center justify-center text-xs">
                {preview && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt="Preview" className="object-cover w-full h-full" />
                )}
                {!preview && image && <Image src={image} alt="Banner" fill className="object-cover" />}
                {!preview && !image && <span className="opacity-50">No image selected</span>}
                {(preview || image) && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-left">
                    <div className="font-semibold text-white text-sm truncate">{title || 'Banner Title'}</div>
                    {link && <div className="text-[11px] text-white/80 truncate">{link}</div>}
                  </div>
                )}
              </div>
              <ul className="text-[11px] leading-relaxed opacity-70 list-disc ml-4">
                <li>Use high-resolution images (WebP if possible) for better performance.</li>
                <li>Lower order numbers appear first in the carousel.</li>
                <li>Keep text minimal; primary messaging should be concise.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
