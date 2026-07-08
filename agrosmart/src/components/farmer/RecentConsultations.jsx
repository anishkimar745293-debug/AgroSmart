const consultations = [
  {
    expert: "Dr. Sharma",
    crop: "Wheat",
    status: "Completed",
  },
  {
    expert: "Dr. Kumar",
    crop: "Rice",
    status: "Pending",
  },
];

const RecentConsultations = () => {
  return (
    <div className="bg-white rounded-2xl shadow mt-8 p-6">
      <h2 className="text-2xl font-bold mb-6">
        Recent Consultations
      </h2>

      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3">
              Expert
            </th>

            <th className="text-left">
              Crop
            </th>

            <th className="text-left">
              Status
            </th>
          </tr>
        </thead>

        <tbody>
          {consultations.map((item, index) => (
            <tr
              key={index}
              className="border-b"
            >
              <td className="py-4">
                {item.expert}
              </td>

              <td>{item.crop}</td>

              <td>{item.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentConsultations;