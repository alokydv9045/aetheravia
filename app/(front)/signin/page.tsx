import { Metadata } from 'next';

import Form from './Form';

export const metadata: Metadata = {
  title: 'Sign In',
};

const SignInPage = async () => {
  return (
    <div>
      <Form />
    </div>
  );
};

export default SignInPage;
