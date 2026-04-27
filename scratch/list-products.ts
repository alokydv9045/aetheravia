import dbConnect from './lib/dbConnect';
import ProductModel from './lib/models/ProductModel';

async function listProducts() {
  await dbConnect();
  const products = await ProductModel.find({}).lean();
  console.log('--- PRODUCTS ---');
  products.forEach(p => {
    console.log(`Name: ${p.name}`);
    console.log(`Slug: ${p.slug}`);
    console.log(`Image: ${p.image}`);
    console.log(`Images: ${JSON.stringify(p.images)}`);
    console.log('----------------');
  });
  process.exit(0);
}

listProducts();
