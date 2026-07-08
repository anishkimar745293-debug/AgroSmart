import DashboardLayout from "../../layouts/DashboardLayout";

import IncomingRequests from "../../components/expert/IncomingRequests";

const ExpertDashboard = () => {
  return (
    <DashboardLayout role="expert">
      <div className="space-y-8">

        <div>
          <h1 className="text-3xl font-bold">
            Expert Dashboard
          </h1>

          <p className="text-gray-500">
            Incoming consultation requests.
          </p>
        </div>

        <IncomingRequests />

      </div>
    </DashboardLayout>
  );
};

export default ExpertDashboard;

