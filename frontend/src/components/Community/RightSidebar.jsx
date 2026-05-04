import { Users } from "lucide-react";
import React from "react";

const staffOnline = [
  {
    id: 1,
    name: "Darren Stanford",
    role: "Lead Developer",
  },
  {
    id: 2,
    name: "Jeffrey Hawkins",
    role: "System Admin",
  },
  {
    id: 3,
    name: "Cameron Williamson",
    role: "Forum Moderator",
  },
  {
    id: 4,
    name: "Stacy Edwards",
    role: "Network Engineer",
  },
];

const latestResources = [
  {
    id: 1,
    title: "Weekly Planner",
    author: "Dylan and 2 Others",
  },
  {
    id: 2,
    title: "Gantt Chart Templates",
    author: "Abhishek Bhatt",
  },
  {
    id: 3,
    title: "Responsive Dashboard",
    author: "Keerthi Singh",
  },
  {
    id: 4,
    title: "Planet themed Loaders",
    author: "Yu Ming",
  },
];

const RightSidebar = () => {
  return (
    <aside className="w-full max-w-[20vw] px-2 pt-4">
      <div className="w-full text-gray-200 bg-[#0d1117] p-4 rounded-lg space-y-8">
        {/* Staff Online */}
        <div>
          <h2 className="text-lg font-semibold flex gap-2 items-center">
           <Users /> Friends Online{" "}
            <span className="bg-green w-2 h-2 rounded-full"></span>
          </h2>

          <div className="mt-4 space-y-2">
            {staffOnline.map((user) => (
              <div key={user.id} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-400">{user.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <hr className="border-gray-800" />

        {/* Latest Resources */}
        <div>
          <h2 className="text-lg font-semibold flex gap-2 items-center">
            Latest Forums
          </h2>

          <div className="mt-4 space-y-2">
            {latestResources.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-700 rounded-lg"></div>
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-gray-400">{item.author}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;
