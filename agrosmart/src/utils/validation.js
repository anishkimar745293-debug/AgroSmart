export const validateRegisterForm = (data) => {
  const errors = {};

  // Name
  if (!data.name.trim()) {
    errors.name = "Full Name is required.";
  }

  // Email
  if (!data.email.trim()) {
    errors.email = "Email is required.";
  } else if (
    !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(data.email)
  ) {
    errors.email = "Invalid email address.";
  }

  // Phone
  if (!data.phone.trim()) {
    errors.phone = "Phone Number is required.";
  } else if (!/^[6-9]\d{9}$/.test(data.phone)) {
    errors.phone = "Enter a valid 10-digit mobile number.";
  }

  // User ID
  if (!data.userId.trim()) {
    errors.userId = "User ID is required.";
  } else if (data.userId.length < 5) {
    errors.userId = "User ID must be at least 5 characters.";
  }

  // Address
  if (!data.address.trim()) {
    errors.address = "Address is required.";
  }

  // Password
  if (!data.password) {
    errors.password = "Password is required.";
  } else if (
    !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(
      data.password
    )
  ) {
    errors.password =
      "Password must contain uppercase, lowercase, number, special character and be at least 8 characters.";
  }

  // Confirm Password
  if (data.confirmPassword !== data.password) {
    errors.confirmPassword = "Passwords do not match.";
  }

  // Terms
  if (!data.agree) {
    errors.agree = "Please accept the Terms & Conditions.";
  }

  return errors;
};