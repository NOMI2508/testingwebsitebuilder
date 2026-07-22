const validateContactForm = (values) => {
  const errors = {};

  if (!values.name || values.name.trim() === "") {
    errors.name = "Name is required";
  }

  if (!values.email || values.email.trim() === "") {
    errors.email = "Email is required";
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(values.email)) {
      errors.email = "Please enter a valid email address";
    }
  }

  if (!values.message || values.message.trim() === "") {
    errors.message = "Message is required";
  }

  return errors;
};

export default validateContactForm;