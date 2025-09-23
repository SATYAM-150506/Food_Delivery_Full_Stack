import React from 'react';
import Navbar from './assets/components/Navbar';
import Footer from './assets/components/Footer';
import WalletErrorBoundary from './assets/components/WalletErrorBoundary';
import { AuthProvider, AuthContext } from './assets/Context/AuthContext';
import { CartProvider } from './assets/Context/CartContext';
import { OrderProvider } from './assets/Context/OrderContext';
import { DarkModeProvider } from './assets/Context/DarkModeContext';
import { ToastProvider } from './assets/components/ToastContainer';
import AppRoutes from './routes/Routes';
import { BrowserRouter } from 'react-router-dom';

const App = () => {
  return (
    <WalletErrorBoundary>
      <BrowserRouter>
        <DarkModeProvider>
          <ToastProvider>
            <AuthProvider>
              <CartProvider>
                <OrderProvider>
                  <AuthContext.Consumer>
                    {({ user, loading }) => (
                      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                        <Navbar isAuthenticated={!!user} />
                        <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
                          {!loading && <AppRoutes isAuthenticated={!!user} />}
                        </main>
                        <Footer />
                      </div>
                    )}
                  </AuthContext.Consumer>
                </OrderProvider>
              </CartProvider>
            </AuthProvider>
          </ToastProvider>
        </DarkModeProvider>
      </BrowserRouter>
    </WalletErrorBoundary>
  );
};

export default App;
