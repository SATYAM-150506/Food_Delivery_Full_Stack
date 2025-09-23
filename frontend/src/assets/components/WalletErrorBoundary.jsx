import React from 'react';

class WalletErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Check if it's a MetaMask/wallet related error
    if (error.message && (
      error.message.includes('MetaMask') ||
      error.message.includes('ethereum') ||
      error.message.includes('web3') ||
      error.message.includes('wallet') ||
      error.message.includes('chrome-extension')
    )) {
      return { hasError: true, error: error };
    }
    // For other errors, let them bubble up
    return null;
  }

  componentDidCatch(error, errorInfo) {
    // Log wallet errors but don't crash the app
    if (this.state.hasError) {
      console.warn('Wallet extension error caught and handled:', error.message);
      console.info('This is expected behavior - wallet extensions are disabled for this food delivery app');
    }
  }

  render() {
    if (this.state.hasError) {
      // Reset the error after a brief moment
      setTimeout(() => {
        this.setState({ hasError: false, error: null });
      }, 1000);

      // Return null to render nothing, effectively ignoring the error
      return null;
    }

    return this.props.children;
  }
}

export default WalletErrorBoundary;
