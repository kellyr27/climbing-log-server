// Save original console methods
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

// Override console methods to suppress output
before(() => {
  console.log = () => {};
  console.error = () => {};
  console.warn = () => {};
});

// Restore original console methods after tests
after(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});