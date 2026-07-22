export const validateEmail = (email) => {
  if (!email) return false;
  
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  return emailRegex.test(email);
};

export const validateContactForm = (formData) => {
  const errors = {};
  
  if (!formData.name || formData.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters";
  }
  
  if (!formData.email || !validateEmail(formData.email)) {
    errors.email = "Please enter a valid email address";
  }
  
  if (!formData.message || formData.message.trim().length < 10) {
    errors.message = "Message must be at least 10 characters";
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export default validateEmail;