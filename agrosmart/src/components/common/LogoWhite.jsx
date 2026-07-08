import logo from "../../assets/logo/icon1.png";

const LogoWhite = () => {
  return (
    <div className="flex items-center gap-4">

      <img
        src={logo}
        alt="AgroSmart"
        className="w-16 h-16 object-contain"
      />

      <div>
        <h1 className="text-3xl font-bold text-white">
          AgroSmart
        </h1>

        <p className="text-green-100 text-sm">
          Farmer Expert Consultation Platform
        </p>
      </div>

    </div>
  );
};

export default LogoWhite;