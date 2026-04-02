import { Truck, Wallet, LockKeyhole, Phone } from 'lucide-react';

const Icons = () => {
  return (
    <div className='grid grid-cols-2 gap-6 gap-x-2 md:gap-x-6 lg:grid-cols-4'>
              <div className='flex flex-col items-center justify-center'>
          <Truck className='w-10 h-10 text-2xl font-semibold' />
          <p>Order above ₹999</p>
          <span className='text-xs'>Free Shipping</span>
        </div>
      <div className='flex flex-col justify-center gap-4 bg-base-300 px-4 py-8 md:px-12'>
        <Wallet width={48} height={48} strokeWidth={1} />
        <div className='flex flex-col gap-2'>
          <p>
            <strong>Money-back</strong>
          </p>
          <p>30 days guarantee0</p>
        </div>
      </div>
      <div className='flex flex-col justify-center gap-4 bg-base-300 px-4 py-8 md:px-12'>
        <LockKeyhole width={48} height={48} strokeWidth={1} />
        <div className='flex flex-col gap-2'>
          <p>
            <strong>Secure Payments</strong>
          </p>
          <p>Secured by Razorpay</p>
        </div>
      </div>
      <div className='flex flex-col justify-center gap-4 bg-base-300 px-4 py-8 md:px-12'>
        <Phone width={48} height={48} strokeWidth={1} />
        <div className='flex flex-col gap-2'>
          <p>
            <strong>24/7 Support</strong>
          </p>
          <p>Phone and Email support</p>
        </div>
      </div>
    </div>
  );
};

export default Icons;
