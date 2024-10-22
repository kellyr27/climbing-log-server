// Store original console methods
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

// Override console methods to suppress output if DISABLE_CONSOLE_LOG is set
before(() => {
  if (process.env.DISABLE_CONSOLE_LOG) {
    console.log = () => {};
    console.error = () => {};
    console.warn = () => {};
  }
});

// Restore original console methods after tests
after(() => {
  if (process.env.DISABLE_CONSOLE_LOG) {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  }
});