/*
 * ASKCOS utility functions
 */

function copyToClipboard(text, parent) {
  const dummy = document.createElement('textarea');
  if (parent) {
    parent.appendChild(dummy);
  } else {
    document.body.appendChild(dummy);
  }
  dummy.value = text;
  dummy.select();
  document.execCommand('copy');
  dummy.parentNode.removeChild(dummy);
}

function num2str(n, round = true, sigfigs = 2, exp = false, threshold = -4) {
  // Converts a number to a string based on the requested number of significant figures if round is true
  // Automatically uses exponential notation for small numbers, can be forced if exp is true
  if (n === undefined || isNaN(n)) {
    return 'N/A';
  } if (!round) {
    return n.toString();
  } if (exp) {
    return n.toExponential(sigfigs - 1);
  }
  const magnitude = n ? Math.floor(Math.log10(Math.abs(n))) : 0;
  const digits = sigfigs - magnitude - 1;
  const power = 10 ** digits;
  if (magnitude <= threshold) {
    return n.toExponential(sigfigs - 1);
  }
  return (Math.round(n * power) / power).toFixed(Math.max(digits, 0));
}

function storageAvailable(type) {
  let storage;
  try {
    storage = window[type];
    const x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return e instanceof DOMException && (
      // everything except Firefox
      e.code === 22
      // Firefox
      || e.code === 1014
      // test name field too, because code might not be present
      // everything except Firefox
      || e.name === 'QuotaExceededError'
      // Firefox
      || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')
      // acknowledge QuotaExceededError only if there's something already stored
      && (storage && storage.length !== 0);
  }
}

function getFromStorage(key) {
  const value = localStorage.getItem(key);
  if (value) {
    return JSON.parse(decodeURIComponent(value));
  }
  return {};
}

function updateObj(dest, src) {
  // take properties of src and overwrite matching properties of dest
  // ignores properties in src if they do not exist in dest
  // modifies dest object in place
  for (const p in src) {
    if (Object.prototype.hasOwnProperty.call(src, p) && Object.prototype.hasOwnProperty.call(dest, p)) {
      if (typeof dest[p] === 'object' && !Array.isArray(dest[p])) {
        updateObj(dest[p], src[p]);
      } else {
        dest[p] = src[p];
      }
    }
  }
}

export {
  copyToClipboard, num2str, storageAvailable, getFromStorage, updateObj,
};
