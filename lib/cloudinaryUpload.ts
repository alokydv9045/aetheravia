// Utility for uploading images to Cloudinary from the frontend
export async function uploadToCloudinary(file: File, folder = "banners") {
  // Sanitize filename and create a public_id
  // We don't need to include the folder in the public_id string if we're also passing the folder parameter,
  // Cloudinary will handle the path.
  const sanitizedName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-z0-9]/gi, "_").toLowerCase();
  const public_id = `${Date.now()}-${sanitizedName}`;

  // Get signature and upload params from the server
  const signRes = await fetch("/api/admin/cloudinary-sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder, public_id }),
  });

  if (!signRes.ok) {
    const errorData = await signRes.json();
    throw new Error(errorData.message || errorData.error || "Failed to get Cloudinary signature");
  }

  const { cloudName, apiKey, timestamp, signature } = await signRes.json();

  if (!cloudName || !apiKey) {
    throw new Error("Cloudinary configuration is incomplete on the server");
  }

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

  if (!uploadRes.ok) {
    const errorData = await uploadRes.json();
    throw new Error(errorData.error?.message || "Cloudinary upload failed");
  }

  const data = await uploadRes.json();
  return data.secure_url;
}
