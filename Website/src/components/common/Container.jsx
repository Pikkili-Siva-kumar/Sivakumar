import React from 'react';
import './Container.css';

/**
 * Reusable Container Component
 * Ensures responsive gutters and consistent widths across mobile, tablet, and desktop viewports.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to be wrapped
 * @param {'default'|'narrow'|'wide'|'full'} [props.size='default'] - Width variant
 * @param {string} [props.className=''] - Additional class names
 * @param {React.ElementType} [props.as='div'] - Semantic HTML element
 */
export default function Container({
  children,
  size = 'default',
  className = '',
  as: Component = 'div',
  ...rest
}) {
  const containerClass = `site-container site-container--${size} ${className}`.trim();

  return (
    <Component className={containerClass} {...rest}>
      {children}
    </Component>
  );
}
