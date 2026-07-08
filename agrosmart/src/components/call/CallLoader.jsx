const CallLoader = () => {

  return (

    <div className="flex justify-center mt-10">

      <div className="flex gap-3">

        <span className="w-4 h-4 rounded-full bg-green-500 animate-bounce"></span>

        <span
          className="w-4 h-4 rounded-full bg-green-500 animate-bounce"
          style={{ animationDelay: "0.2s" }}
        ></span>

        <span
          className="w-4 h-4 rounded-full bg-green-500 animate-bounce"
          style={{ animationDelay: "0.4s" }}
        ></span>

      </div>

    </div>

  );

};

export default CallLoader;