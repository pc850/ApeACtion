
// Animation utilities for the app

// Function to trigger a pulse animation on an element
export const pulseElement = (element: HTMLElement | null, duration = 300) => {
  if (!element) return;
  
  element.style.transition = `transform ${duration}ms ease-in-out`;
  element.style.transform = 'scale(1.1)';
  
  setTimeout(() => {
    element.style.transform = 'scale(1)';
  }, duration);
};

// Function to create a floating number animation
export const createFloatingNumber = (
  x: number, 
  y: number, 
  value: number, 
  parentElement: HTMLElement
) => {
  const floatingNumber = document.createElement('div');
  floatingNumber.textContent = `+${value}`;
  floatingNumber.style.position = 'absolute';
  floatingNumber.style.left = `${x}px`;
  floatingNumber.style.top = `${y}px`;
  floatingNumber.style.color = '#FF69B4';
  floatingNumber.style.fontWeight = 'bold';
  floatingNumber.style.pointerEvents = 'none';
  floatingNumber.style.zIndex = '9999';
  floatingNumber.style.opacity = '1';
  floatingNumber.style.fontSize = '1.5rem';
  floatingNumber.style.textShadow = '0 0 5px rgba(0,0,0,0.3)';
  
  parentElement.appendChild(floatingNumber);
  
  // Animate the floating number
  const startTime = Date.now();
  const duration = 1000; // ms
  
  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    floatingNumber.style.top = `${y - progress * 50}px`;
    floatingNumber.style.opacity = `${1 - progress}`;
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      parentElement.removeChild(floatingNumber);
    }
  };
  
  requestAnimationFrame(animate);
};

// Function to apply a glass morphism effect
export const applyGlassMorphism = (element: HTMLElement | null) => {
  if (!element) return;
  
  element.style.backdropFilter = 'blur(10px)';
  element.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
  element.style.border = '1px solid rgba(255, 255, 255, 0.2)';
  element.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
};

// Function to create a ripple effect on click
export const createRippleEffect = (e: React.MouseEvent<HTMLElement>) => {
  const button = e.currentTarget;
  
  const rect = button.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  ripple.style.position = 'absolute';
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  ripple.style.transform = 'translate(-50%, -50%)';
  ripple.style.width = '0';
  ripple.style.height = '0';
  ripple.style.borderRadius = '50%';
  ripple.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
  ripple.style.pointerEvents = 'none';
  
  button.appendChild(ripple);
  
  // Set position to relative if it's not already
  if (window.getComputedStyle(button).position !== 'relative') {
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
  }
  
  // Animate the ripple
  requestAnimationFrame(() => {
    ripple.style.transition = 'all 0.6s ease-out';
    ripple.style.width = `${Math.max(button.clientWidth, button.clientHeight) * 2.5}px`;
    ripple.style.height = `${Math.max(button.clientWidth, button.clientHeight) * 2.5}px`;
    ripple.style.opacity = '0';
    
    // Remove the ripple element after animation completes
    setTimeout(() => {
      button.removeChild(ripple);
    }, 700);
  });
};
