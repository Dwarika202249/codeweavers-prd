import { Toaster as HotToaster } from 'react-hot-toast';
import { baseToastStyle } from './toastUtils';

// Custom Toaster component with dark theme styling
export function Toaster() {
  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        style: baseToastStyle,
        duration: 4000,
        success: {
          iconTheme: {
            primary: '#4ade80', // green-400
            secondary: '#1f2937', // gray-800
          },
        },
        error: {
          iconTheme: {
            primary: '#f87171', // red-400
            secondary: '#1f2937', // gray-800
          },
        },
      }}
      containerStyle={{
        top: 80, // Below navbar
      }}
    />
  );
}
