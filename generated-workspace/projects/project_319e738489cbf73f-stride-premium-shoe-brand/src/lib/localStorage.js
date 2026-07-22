const getLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item);
  } catch (error) {
    console.error(`Failed to get localStorage key "${key}":`, error);
    return defaultValue;
  }
};

const setLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Failed to set localStorage key "${key}":`, error);
    return false;
  }
};

const removeLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Failed to remove localStorage key "${key}":`, error);
    return false;
  }
};

export { getLocalStorage, setLocalStorage, removeLocalStorage };
export default { getLocalStorage, setLocalStorage, removeLocalStorage };