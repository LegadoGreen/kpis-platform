let isInitializing = false;

export const withLock = async <T>(fn: () => Promise<T> | T): Promise<T> => {
  if (isInitializing) {
    console.log("Initialization already in progress...");
    return Promise.reject("Locked");
  }
  isInitializing = true;
  try {
    return await fn();
  } finally {
    isInitializing = false;
  }
};
