"use client";
import { useEffect, useState } from "react";
import { uploadBannerImage } from "@/lib/uploadBannerImage";
import { useParams, useRouter } from "next/navigation";

export default function EditBannerPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const router = useRouter();
  const [image, setImage] = useState("");
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchBanner() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/admin/carousel/${id}`);
        if (!res.ok) throw new Error("Failed to fetch banner");
        const banner = await res.json();
        setImage(banner.image || "");
        setTitle(banner.title || "");
        setLink(banner.link || "");
        setOrder(banner.order || 0);
        setIsActive(banner.isActive !== false);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    fetchBanner();
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/carousel/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image, title, link, order, isActive }),
      });
      if (!res.ok) throw new Error("Failed to update banner");
      router.push("/admin/carousel");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 max-w-xl mx-auto">
  <h1 className="text-2xl font-bold mb-4">Edit {process.env.NEXT_PUBLIC_BRAND_NAME || 'BellaModa'} Banner</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold">Banner Image</label>
            <input
              type="file"
              accept="image/*"
              className="input input-bordered w-full"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setLoading(true);
                  setError("");
                  try {
                    const url = await uploadBannerImage(file);
                    setImage(url);
                  } catch (err) {
                    setError((err as Error).message || "Image upload failed");
                  } finally {
                    setLoading(false);
                  }
                }
              }}
            />
          </div>
          {/* Image URL input removed for simplicity. Image is set by file upload only. */}
          <div>
            <label className="block font-semibold">Title</label>
            <input type="text" className="input input-bordered w-full" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="block font-semibold">Link</label>
            <input type="text" className="input input-bordered w-full" value={link} onChange={e => setLink(e.target.value)} />
          </div>
          <div>
            <label className="block font-semibold">Order</label>
            <input type="number" className="input input-bordered w-full" value={order} onChange={e => setOrder(Number(e.target.value))} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
            <label>Active</label>
          </div>
          {error && <div className="text-error">{error}</div>}
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Saving..." : "Update Banner"}</button>
        </form>
      )}
    </div>
  );
}
