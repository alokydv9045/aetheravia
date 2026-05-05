import { Metadata } from 'next';

import Form from './Form';

export const metadata: Metadata = {
  title: 'Place Order',
};

const PlaceOrderPage = () => {
  return (
    <div>
      <Form />
    </div>
  );
};

export default PlaceOrderPage;
