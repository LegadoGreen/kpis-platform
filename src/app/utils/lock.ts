let isInitializing = false;

export const withLock = async (fn: () => any): Promise<any> => {
  if (isInitializing) {
    console.log("Initialization already in progress...");
    return;
  }

  isInitializing = true;
  try {
    return await fn();
  } finally {
    isInitializing = false;
  }
};
