// Utility for uploading images to Cloudinary from the frontend
export async function uploadToCloudinary(file: File, folder = "banners") {
  // Get a unique public_id for the image
  const public_id = `${folder}/${Date.now()}-${file.name}`;
  // Get signature and upload params from the server
  const signRes = await fetch("/api/admin/cloudinary-sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder, public_id }),
  });
  if (!signRes.ok) throw new Error("Failed to get Cloudinary signature");
  const { cloudName, apiKey, timestamp, signature } = await signRes.json();

  // Prepare form data for Cloudinary upload
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);
  formData.append("folder", folder);
  formData.append("public_id", public_id);

  // Upload to Cloudinary
  const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });
  if (!uploadRes.ok) throw new Error("Cloudinary upload failed");
  const data = await uploadRes.json();
  return data.secure_url;
}
