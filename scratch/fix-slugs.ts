import dbConnect from './lib/dbConnect';
import ProductModel from './lib/models/ProductModel';

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

async function fixSlugs() {
  await dbConnect();
  const products = await ProductModel.find({});
  console.log(`Found ${products.length} products`);
  
  for (const product of products) {
    const oldSlug = product.slug;
    const newSlug = slugify(oldSlug);
    
    if (oldSlug !== newSlug) {
      console.log(`Updating slug: ${oldSlug} -> ${newSlug}`);
      product.slug = newSlug;
      await product.save();
    }
  }
  
  console.log('Done');
  process.exit(0);
}

fixSlugs();
