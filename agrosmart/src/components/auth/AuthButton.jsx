const AuthButton = ({
  text,
  disabled = false,
}) => {
  return (
    <button
      type="submit"
      disabled={disabled}
      className={`w-full rounded-xl py-4 font-semibold transition

      ${
        disabled
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-green-600 hover:bg-green-700 text-white"
      }`}
    >
      {text}
    </button>
  );
};

export default AuthButton;