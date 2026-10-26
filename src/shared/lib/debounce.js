export function debounce(callback, delay) {
  let timeoutId;

  const debounced = (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback(...args), delay);
  };

  debounced.cancel = () => clearTimeout(timeoutId);

  return debounced;
}
