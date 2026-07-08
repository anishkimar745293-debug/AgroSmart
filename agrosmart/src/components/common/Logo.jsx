import logo from "../../assets/logo/icon1.png";

const Logo = () => {
  return (
    <div className="flex items-center gap-4 justify-center">

      <img
        src={logo}
        alt="AgroSmart"
        className="w-16 h-16 object-contain"
      />

      <div>
        <h1 className="text-3xl font-bold text-green-700">
          AgroSmart
        </h1>

        <p className="text-gray-500 text-sm">
          Farmer Expert Consultation Platform
        </p>
      </div>

    </div>
  );
};

export default Logo;























// import logo from "../../assets/logo/icon1.png";

// const Logo = () => {
//   return (
//     <div className="flex items-center justify-center gap-4">
//       <img
//         src={logo}
//         alt="AgroSmart Logo"
//         className="w-16 h-16 object-contain"
//       />

//       <div>
//         <h1 className="text-3xl font-bold text-green-700">
//           AgroSmart
//         </h1>

//         <p className="text-gray-500 text-sm">
//           Farmer Expert Consultation Platform
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Logo;















// // const Logo = () => {
// //   return (
// //     <div className="flex items-center justify-center gap-3">
// //       <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white text-2xl">
// //         🌱
// //       </div>

// //       <div>
// //         <h1 className="text-3xl font-bold text-green-700">
// //           AgroSmart
// //         </h1>

// //         <p className="text-gray-500 text-sm">
// //           Farmer Expert Consultation
// //         </p>
// //       </div>
// //     </div>
// //   );
// // };

// // export default Logo;