// Utility to upload a file to the server-side API, which then uploads to Cloudinary
export async function uploadBannerImage(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('/api/admin/upload-banner-image', {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Server upload failed');
  const data = await res.json();
  if (!data.url) throw new Error('No image URL returned');
  return data.url;
}
