import OrderDetails from './OrderDetails';

export const generateMetadata = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  return {
    title: `Manifest ${id}`,
  };
};

const OrderDetailsPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  return (
    <OrderDetails
      razorpayKeyId={process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_'}
      orderId={id}
    />
  );
};

export default OrderDetailsPage;
