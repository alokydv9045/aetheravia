import dbConnect from '../lib/dbConnect';
import ProductModel, { Product } from '../lib/models/ProductModel';

async function checkLatestProduct() {
  await dbConnect();
  const product = (await ProductModel.findOne({})
    .sort({ updatedAt: -1 })
    .lean()) as unknown as Product | null;
  if (product) {
    console.log('--- LATEST PRODUCT ---');
    console.log(`Name: ${product.name}`);
    console.log(`Primary Image: ${product.image}`);
    console.log(`Gallery Images: ${JSON.stringify(product.images)}`);
    console.log('----------------------');
  } else {
    console.log('No products found.');
  }
  process.exit(0);
}

checkLatestProduct();
