import React from "react";
import { useUser } from "../context/UserContext";

const UserDashboard: React.FC = () => {
  const { user } = useUser();

  if (!user) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">User Dashboard</h2>
      <div className="mb-2"><strong>Name:</strong> {user.name}</div>
      <div className="mb-2"><strong>Email:</strong> {user.email}</div>
      <div className="mb-2"><strong>Role:</strong> {user.role}</div>
    </div>
  );
};

export default UserDashboard;