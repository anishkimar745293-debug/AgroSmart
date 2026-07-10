// components/auth/AuthButton.jsx
const AuthButton = ({
  text,
  disabled = false,
  role = "farmer", // Default role farmer rakha hai
  onClick
}) => {
  // Role ke hisab se button ka color set hoga
  const buttonColor = role === "expert" 
    ? "bg-blue-600 hover:bg-blue-700 text-white" 
    : "bg-green-600 hover:bg-green-700 text-white";

  return (
    <button
      type={onClick ? "button" : "submit"}
      disabled={disabled}
      onClick={onClick}
      className={`w-full rounded-xl py-4 font-semibold transition cursor-pointer shadow-md ${
        disabled ? "bg-gray-400 cursor-not-allowed text-white" : buttonColor
      }`}
    >
      {text}
    </button>
  );
};

export default AuthButton;
