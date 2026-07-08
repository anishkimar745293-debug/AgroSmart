const InputField = ({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
}) => {
  return (
    <div>

      <label className="block mb-2 font-medium">

        {label}

      </label>

      <input
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full border rounded-xl px-4 py-3 outline-none focus:border-green-600"
      />

    </div>
  );
};

export default InputField;

