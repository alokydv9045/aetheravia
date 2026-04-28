'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

import { Product } from '@/lib/models/ProductModel';
import { uploadToCloudinary } from '@/lib/cloudinaryUpload';
import { formatId, slugify } from '@/lib/utils';
import ImageEditorModal from '@/components/admin/ImageEditorModal';

// Extend product form data with new fields (sizes, images)
interface ProductFormData {
  name: string;
  slug: string;
  price: number | string;
  image: string;
  images: string[];
  category: string;
  brand: string;
  countInStock: number | string;
  description: string;
  mlQuantity: string;
}



export default function ProductEditForm({ productId }: { productId: string }) {
  const { data: product, error } = useSWR<Product & { images?: string[]; mlQuantity?: string }>(`/api/admin/products/${productId}`);
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [fileQueue, setFileQueue] = useState<File[]>([]);
  const [currentEditingFile, setCurrentEditingFile] = useState<{ file: File; url: string } | null>(null);

  const { trigger: updateProduct, isMutating: isUpdating } = useSWRMutation(
    `/api/admin/products/${productId}`,
    async (url, { arg }: { arg: ProductFormData }) => {
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(arg),
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message);
      toast.success('Product updated successfully');
      router.push('/admin/products');
    },
  );

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ProductFormData>({
    defaultValues: {
      name: '', slug: '', price: '', image: '', images: [], category: '', brand: '', countInStock: '', description: '', mlQuantity: '',
    },
  });

  const images = watch('images');

  // Populate form when product loads
  useEffect(() => {
    if (!product) return;
    setValue('name', product.name === 'sample name' ? '' : (product.name || ''));
    setValue('slug', product.slug.startsWith('sample-name-') ? '' : (product.slug || ''));
    setValue('price', product.price === 0 ? '' : product.price);
    setValue('image', product.image || '');
    setValue('category', product.category === 'sample category' ? '' : (product.category || ''));
    setValue('brand', product.brand === 'sample brand' ? '' : (product.brand || ''));
    setValue('countInStock', product.countInStock === 0 ? '' : product.countInStock);
    setValue('description', product.description === 'sample description' ? '' : (product.description || ''));
    setValue('images', product.images || (product.image ? [product.image] : []));
    setValue('mlQuantity', product.mlQuantity || '');
  }, [product, setValue]);



  const removeImage = (url: string) => {
    const updated = images.filter(i => i !== url);
    setValue('images', updated);
    if (watch('image') === url) {
      // If removed primary, set new primary
      setValue('image', updated[0] || '');
    }
  };

  const makePrimary = (url: string) => {
    const without = images.filter(i => i !== url);
    setValue('images', [url, ...without]);
    setValue('image', url);
  };

  const uploadHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const newFiles = Array.from(files);
    setFileQueue(prev => [...prev, ...newFiles]);
    e.target.value = ''; // Reset input
  };

  // Effect to handle the queue
  useEffect(() => {
    if (!currentEditingFile && fileQueue.length > 0) {
      const nextFile = fileQueue[0];
      const url = URL.createObjectURL(nextFile);
      setCurrentEditingFile({ file: nextFile, url });
    }
  }, [fileQueue, currentEditingFile]);

  const handleEditorSave = async (croppedBlob: Blob) => {
    if (!currentEditingFile) return;
    
    setIsUploading(true);
    const toastId = toast.loading('Uploading edited image...');
    
    try {
      // Convert blob to file for uploadToCloudinary
      const editedFile = new File([croppedBlob], currentEditingFile.file.name, {
        type: 'image/jpeg',
      });
      
      const url = await uploadToCloudinary(editedFile, 'products');
      
      if (url) {
        const newImages = [...images, url];
        setValue('images', newImages);
        
        // Handle primary image logic
        const currentImage = watch('image');
        const isPlaceholder = !currentImage || 
                             currentImage.includes('No_Image_Available') || 
                             currentImage.includes('cosmetics-composition-with-serum-bottles.jpg');
                             
        if (isPlaceholder) {
          setValue('image', url);
        }
        
        setReviewImages(prev => [...prev, url]);
        if (!isReviewOpen) setIsReviewOpen(true);
      }
      
      toast.success('Image uploaded successfully', { id: toastId });
    } catch (err: any) {
      toast.error(err.message || 'Upload failed', { id: toastId });
    } finally {
      setIsUploading(false);
      URL.revokeObjectURL(currentEditingFile.url);
      setCurrentEditingFile(null);
      setFileQueue(prev => prev.slice(1));
    }
  };

  const handleEditorCancel = () => {
    if (currentEditingFile) {
      URL.revokeObjectURL(currentEditingFile.url);
      setCurrentEditingFile(null);
      setFileQueue(prev => prev.slice(1));
    }
  };

  const formSubmit = async (formData: ProductFormData) => {
    // Ensure numeric coercion
    const payload = {
      ...formData,
      slug: slugify(formData.slug),
      price: Number(formData.price),
      countInStock: Number(formData.countInStock),
    };
    await updateProduct(payload);
  };

  if (error) return <div className='alert alert-error'>{(error as any).message || 'Failed to load product'}</div>;
  if (!product) return <div className='flex flex-col items-center justify-center p-10 gap-3'><span className='loading loading-spinner loading-lg' /><p className='text-sm opacity-70'>Loading product…</p></div>;

  const Field = ({ id, label, type = 'text', required = false, placeholder = '' }: { id: keyof ProductFormData; label: string; type?: string; required?: boolean; placeholder?: string }) => (
    <div className='space-y-1'>
      <label className='text-xs font-semibold uppercase tracking-wide opacity-70' htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        {...register(id as any, { required: required && `${label} is required` })}
        className='input input-bordered input-sm w-full'
      />
      {errors[id as keyof ProductFormData]?.message && <p className='text-error text-xs'>{String(errors[id as keyof ProductFormData]?.message)}</p>}
    </div>
  );

  return (
    <div className='space-y-6 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'>
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-2'>
        <h1 className='h-fluid'>Edit Product <span className='text-primary'>{formatId(productId)}</span></h1>
        <div className='text-xs opacity-70'>Primary Image used in listings</div>
      </div>

      <form onSubmit={handleSubmit(formSubmit)} className='space-y-8'>
        {/* Basic Info Card */}
        <div className='card bg-base-100 shadow-sm'>
          <div className='card-body p-5 space-y-6'>
            <h2 className='font-semibold tracking-wide text-sm uppercase opacity-70'>Basic Information</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
               <Field id='name' label='Name' placeholder='e.g. Vitamin C Serum' required />
              <Field id='slug' label='Slug' placeholder='e.g. vitamin-c-serum' required />
              <Field id='brand' label='Brand' placeholder='e.g. Aetheravia' required />
              <Field id='category' label='Category' placeholder='e.g. Serums' required />
              <Field id='price' label='Price' type='number' placeholder='0.00' required />
              <Field id='countInStock' label='Count In Stock' type='number' placeholder='0' required />
            </div>
            <div className='space-y-1'>
              <label className='text-xs font-semibold uppercase tracking-wide opacity-70' htmlFor='description'>Description</label>
              <textarea id='description' rows={4} placeholder='Describe the product benefits, ingredients, and usage instructions...' {...register('description', { required: 'Description is required' })} className='textarea textarea-bordered w-full text-sm' />
              {errors.description?.message && <p className='text-error text-xs'>{errors.description.message}</p>}
            </div>
          </div>
        </div>

        {/* ML Quantity */}
        <div className='card bg-base-100 shadow-sm'>
          <div className='card-body p-5 space-y-4'>
            <h2 className='font-semibold tracking-wide text-sm uppercase opacity-70'>ML Quantity</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
              <Field id='mlQuantity' label='Quantity (e.g. 50ml)' placeholder='e.g. 50ml' />
            </div>
            <p className='text-[11px] opacity-70'>Specify the product volume in ml or other appropriate units.</p>
          </div>
        </div>

        {/* Images / Gallery */}
        <div className='card bg-base-100 shadow-sm'>
          <div className='card-body p-5 space-y-5'>
            <h2 className='font-semibold tracking-wide text-sm uppercase opacity-70'>Images</h2>
            <div className='flex flex-col lg:flex-row gap-6'>
              <div className='space-y-3 w-full lg:w-2/3'>
                <div className='flex items-center gap-3 flex-wrap'>
                  <input
                    type='file'
                    multiple
                    onChange={uploadHandler}
                    disabled={isUploading}
                    className='file-input file-input-sm file-input-bordered'
                  />
                  {isUploading && <span className='loading loading-spinner loading-sm' />}
                  <input
                    type='text'
                    placeholder='Primary image URL (optional)'
                    className='input input-bordered input-sm flex-1'
                    {...register('image', { required: 'Primary image is required' })}
                  />
                </div>
                {errors.image?.message && <p className='text-error text-xs'>{errors.image.message}</p>}
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
                  {images.map((img, idx) => (
                    <div key={img} className={`relative group border rounded-lg overflow-hidden ${idx === 0 ? 'ring-2 ring-primary' : ''}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={`Image ${idx+1}`} className='w-full h-28 object-cover' />
                      <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex flex-col justify-center items-center gap-2 text-xs'>
                        <button type='button' onClick={() => makePrimary(img)} className='btn btn-xs btn-primary'>Primary</button>
                        <button type='button' onClick={() => removeImage(img)} className='btn btn-xs btn-error'>Remove</button>
                      </div>
                      {idx === 0 && <span className='absolute top-1 left-1 badge badge-primary badge-xs'>Main</span>}
                    </div>
                  ))}
                  {images.length === 0 && (
                    <div className='col-span-full text-center text-xs opacity-60 p-4 border border-dashed rounded'>No images yet. Upload or paste a URL.</div>
                  )}
                </div>
              </div>
              <div className='w-full lg:w-1/3 space-y-3'>
                <p className='text-xs opacity-70 leading-relaxed'>Upload multiple product images to create a gallery. The first image (outlined) is used as the primary image across listings. You can reorder by setting another image as Primary. Removing the primary will automatically shift the next image up.</p>
                <div className='rounded-lg bg-base-200/50 p-3 text-[11px] space-y-1'>
                  <p><strong>Tips:</strong></p>
                  <ul className='list-disc ml-4 space-y-1'>
                    <li>Use square images (800x800) for best consistency.</li>
                    <li>Keep file sizes under 500KB for fast loads.</li>
                    <li>Primary image should be a clear, centered shot.</li>
                  </ul>
                </div>
              </div>
            </div>
            <input type='hidden' {...register('images')} />
          </div>
        </div>

        {/* Submit */}
        <div className='flex flex-col sm:flex-row gap-3 sm:items-center justify-between'>
          <div className='text-xs opacity-60'>Last updated will reflect after saving.</div>
          <div className='flex gap-3'>
            <Link href='/admin/products' className='btn btn-ghost btn-sm'>Cancel</Link>
            <button type='submit' disabled={isUpdating} className='btn btn-primary btn-sm'>
              {isUpdating && <span className='loading loading-spinner loading-xs'></span>}
              Save Changes
            </button>
          </div>
        </div>
      </form>

      {isReviewOpen && reviewImages.length > 0 && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-base-300/70 backdrop-blur-sm p-4'>
          <div className='card bg-base-100 shadow-xl w-full max-w-3xl relative'>
            <button
              type='button'
              className='btn btn-sm btn-circle absolute top-2 right-2'
              aria-label='Close'
              onClick={() => setIsReviewOpen(false)}
            >✕</button>
            <div className='card-body p-5 space-y-4'>
              <h3 className='font-semibold text-sm uppercase tracking-wide opacity-70'>Review Uploaded Images</h3>
              <div className='flex flex-col md:flex-row gap-6'>
                <div className='flex-1 flex flex-col items-center gap-3'>
                  <div className='w-full aspect-square max-w-sm relative rounded-lg overflow-hidden border'>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={reviewImages[currentReviewIndex]}
                      alt={`Uploaded ${currentReviewIndex + 1}`}
                      className='object-contain w-full h-full bg-base-200'
                    />
                    {images[0] === reviewImages[currentReviewIndex] && (
                      <span className='absolute top-2 left-2 badge badge-primary badge-sm'>Primary</span>
                    )}
                  </div>
                  <div className='flex items-center gap-2'>
                    <button
                      type='button'
                      className='btn btn-xs'
                      disabled={currentReviewIndex === 0}
                      onClick={() => setCurrentReviewIndex(i => Math.max(0, i - 1))}
                    >Prev</button>
                    <span className='text-[11px] opacity-70'>{currentReviewIndex + 1} / {reviewImages.length}</span>
                    <button
                      type='button'
                      className='btn btn-xs'
                      disabled={currentReviewIndex === reviewImages.length - 1}
                      onClick={() => setCurrentReviewIndex(i => Math.min(reviewImages.length - 1, i + 1))}
                    >Next</button>
                  </div>
                  <div className='flex flex-wrap gap-2 justify-center max-w-full'>
                    {reviewImages.map((u, idx) => (
                      <button
                        key={u}
                        type='button'
                        onClick={() => setCurrentReviewIndex(idx)}
                        className={`h-12 w-12 overflow-hidden rounded border ${idx === currentReviewIndex ? 'ring ring-primary' : 'opacity-70 hover:opacity-100'}`}
                        title={`Image ${idx + 1}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={u} alt='' className='object-cover w-full h-full' />
                      </button>
                    ))}
                  </div>
                </div>
                <div className='w-full md:w-64 space-y-4'>
                  <div className='space-y-2'>
                    <button
                      type='button'
                      className='btn btn-primary btn-sm w-full'
                      onClick={() => makePrimary(reviewImages[currentReviewIndex])}
                    >Set As Primary</button>
                    <button
                      type='button'
                      className='btn btn-error btn-sm w-full'
                      onClick={() => {
                        const target = reviewImages[currentReviewIndex];
                        removeImage(target);
                        const remaining = reviewImages.filter(i => i !== target);
                        setReviewImages(remaining);
                        if (remaining.length === 0) setIsReviewOpen(false); else setCurrentReviewIndex(Math.min(currentReviewIndex, remaining.length - 1));
                      }}
                    >Remove Image</button>
                  </div>
                  <div className='text-[11px] opacity-70 leading-relaxed'>Review newly uploaded images. You can set a primary image or remove any undesired uploads before saving the product. Closing this panel keeps all remaining images.</div>
                  <div className='flex gap-2'>
                    <button type='button' className='btn btn-ghost btn-sm flex-1' onClick={() => setIsReviewOpen(false)}>Close</button>
                    <button type='button' className='btn btn-accent btn-sm flex-1' onClick={() => setIsReviewOpen(false)}>Done</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentEditingFile && (
        <ImageEditorModal
          image={currentEditingFile.url}
          onSave={handleEditorSave}
          onCancel={handleEditorCancel}
        />
      )}
    </div>
  );
}
