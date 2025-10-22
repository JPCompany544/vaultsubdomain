// Minimal process declaration for browser environment
interface Process {
  env: {
    NODE_ENV: 'development' | 'production';
    [key: string]: string | undefined;
  };
}

declare var process: Process;

// Minimal global type definitions for window objects
declare global {
  interface Window {
    Tawk_API?: any;
    MSStream?: any;
    opera?: any;
  }
}

export {};