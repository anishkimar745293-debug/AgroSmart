const PageContainer = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-green-50 to-green-100 flex justify-center items-center p-5">
      {children}
    </div>
  );
};

export default PageContainer;
