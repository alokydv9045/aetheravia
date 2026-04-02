import OrderDetails from './OrderDetails';

export const generateMetadata = ({ params }: { params: { id: string } }) => {
  return {
    title: `Order ${params.id}`,
  };
};

const OrderDetailsPage = ({ params }: { params: { id: string } }) => {
  return (
    <OrderDetails
      razorpayKeyId={process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_'}
      orderId={params.id}
    />
  );
};

export default OrderDetailsPage;
