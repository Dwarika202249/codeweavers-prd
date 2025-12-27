import { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  placeholder?: 'blur' | 'skeleton';
}

export function OptimizedImage({
  src,
  alt,
  className,
  containerClassName,
  width,
  height,
  priority = false,
  placeholder = 'skeleton',
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority || isInView) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '200px', // Start loading 200px before entering viewport
        threshold: 0,
      }
    );

    const currentRef = imgRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => observer.disconnect();
  }, [priority, isInView]);

  const sizeClasses = `${width ? `w-[${width}px]` : ''} ${height ? `h-[${height}px]` : ''}`.trim();

  return (
    <div
      ref={imgRef}
      className={cn('relative overflow-hidden', containerClassName, sizeClasses)}
    >
      {/* Skeleton/Placeholder */}
      {!isLoaded && (
        <div
          className={cn(
            'absolute inset-0',
            placeholder === 'skeleton'
              ? 'animate-pulse bg-gray-800'
              : 'bg-gray-900/50 backdrop-blur-sm'
          )}
        />
      )}

      {/* Actual Image */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          width={width}
          height={height}
        />
      )}
    </div>
  );
}

// Specialized component for blog cover images
interface BlogImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function BlogImage({ src, alt, className }: BlogImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={cn('h-48 w-full object-cover', className)}
      containerClassName="h-48 w-full"
      placeholder="skeleton"
    />
  );
}

// Specialized component for avatar images
interface AvatarImageProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  fallback?: string;
  className?: string;
}

export function AvatarImage({ 
  src, 
  alt, 
  size = 'md', 
  fallback,
  className 
}: AvatarImageProps) {
  const [error, setError] = useState(false);
  
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  if (!src || error) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-indigo-600 text-white font-medium',
          sizeClasses[size],
          className
        )}
      >
        {fallback || alt.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setError(true)}
      className={cn(
        'rounded-full object-cover',
        sizeClasses[size],
        className
      )}
    />
  );
}

export default OptimizedImage;
