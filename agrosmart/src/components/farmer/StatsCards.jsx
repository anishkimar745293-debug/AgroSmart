import {
  Users,
  MessageCircle,
  PhoneCall,
  Bot,
} from "lucide-react";

const stats = [
  {
    title: "Experts Available",
    value: "24",
    icon: Users,
    color: "bg-blue-500",
  },
  {
    title: "Chats",
    value: "12",
    icon: MessageCircle,
    color: "bg-green-500",
  },
  {
    title: "Consultations",
    value: "8",
    icon: PhoneCall,
    color: "bg-purple-500",
  },
  {
    title: "AI Requests",
    value: "31",
    icon: Bot,
    color: "bg-orange-500",
  },
];

const StatsCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {stats.map((item) => (
        <div
          key={item.title}
          className="bg-white rounded-2xl shadow p-6 flex justify-between items-center"
        >
          <div>
            <p className="text-gray-500">
              {item.title}
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {item.value}
            </h2>
          </div>

          <div
            className={`${item.color} p-4 rounded-xl text-white`}
          >
            <item.icon size={30} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;