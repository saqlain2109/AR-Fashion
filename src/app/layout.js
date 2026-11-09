import './globals.css';
import { CartProvider } from '@/components/store/CartContext';
import CartDrawer from '@/components/store/CartDrawer';

export const metadata = {
  title: 'AR Fashion House | Handcrafted Ethnic & Contemporary Clothing',
  description: 'Shop exclusive Panjabis, Banarasi sarees, luxury kurtis, and casual apparel with fast nationwide delivery and WhatsApp ordering.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen flex flex-col bg-[#070709] text-stone-100 selection:bg-amber-400 selection:text-black">
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
