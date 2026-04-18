import DrawerButton from '@/components/DrawerButton';
import Footer from '@/components/footer/Footer';
import Header from '@/components/header/Header';
import Sidebar from '@/components/Sidebar';
import ScrollToTopButton from '@/components/ScrollToTopButton';
import ResponsiveDrawerInit from '@/components/ResponsiveDrawerInit';

export default function FrontLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className='drawer z-[60]'>
      <DrawerButton />
      <ResponsiveDrawerInit />
      <div className='drawer-content'>
        <div className='flex min-h-screen flex-col overflow-x-hidden'>
          <Header />
          <main className='flex-grow'>{children}</main>
          <Footer />
          <ScrollToTopButton />
        </div>
      </div>
      <div className='drawer-side z-[70]'>
        <label
          htmlFor='my-drawer'
          aria-label='close sidebar'
          className='drawer-overlay'
        ></label>
        <Sidebar />
      </div>
    </div>
  );
}
