import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const PasswordField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>

      <label className="block mb-2 font-medium">

        {label}

      </label>

      <div className="relative">

        <input
          name={name}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full border rounded-xl px-4 py-3 pr-12 outline-none focus:border-green-600"
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-4"
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>

      </div>

    </div>
  );
};

export default PasswordField;