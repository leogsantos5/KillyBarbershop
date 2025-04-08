import React from 'react';

type LoadingSpinnerVariant = 'dashboard-tab' | 'dashboard-page' | 'booking-calendar';

interface LoadingSpinnerProps {
  variant?: LoadingSpinnerVariant;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ variant = 'dashboard-tab', className = '' }) => {
  const getStyles = (variant: LoadingSpinnerVariant) => {
    switch (variant) {
      case 'dashboard-tab':
        return 'flex items-center justify-center mb-20 min-h-[calc(100vh-4rem)]';
      case 'dashboard-page':
        return 'min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900';
      case 'booking-calendar':
        return 'flex items-center justify-center h-full w-full';
      default:
        return '';
    }
  };

  const getSpinnerSize = (variant: LoadingSpinnerVariant) => {
    switch (variant) {
      case 'dashboard-page':
        return 'h-12 w-12';
      case 'booking-calendar':
        return 'h-8 w-8';
      default:
        return 'h-10 w-10';
    }
  };

  return (
    <div className={`${getStyles(variant)} ${className}`}>
      <div className={`inline-block animate-spin rounded-full border-4 border-red-600 border-t-transparent ${getSpinnerSize(variant)}`}></div>
    </div>
  );
};

export default LoadingSpinner; 