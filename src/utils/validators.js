export const Validators = {
  isEmail: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  isPhoneNumber: (phone) => {
    const re = /^[\d\s\-\+\(\)]{10,}$/;
    return re.test(phone);
  },

  isURL: (url) => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  },

  isEmpty: (value) => {
    return !value || (typeof value === 'string' && value.trim() === '');
  },

  isValidField: (field, value) => {
    if (field.required && Validators.isEmpty(value)) {
      return { valid: false, message: `${field.label} is required` };
    }

    switch (field.type) {
      case 'email':
        if (value && !Validators.isEmail(value)) {
          return { valid: false, message: 'Invalid email format' };
        }
        break;
      case 'number':
        if (value && isNaN(value)) {
          return { valid: false, message: 'Must be a number' };
        }
        break;
      case 'url':
        if (value && !Validators.isURL(value)) {
          return { valid: false, message: 'Invalid URL format' };
        }
        break;
      default:
        break;
    }

    return { valid: true };
  }
};