// Minimal process declaration for browser environment
interface Process {
  env: {
    NODE_ENV: 'development' | 'production';
    [key: string]: string | undefined;
  };
}

declare var process: Process;