import React from "react";
import { useUser } from "../context/UserContext";

const Profile: React.FC = () => {
  const { user } = useUser();

  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Profile</h1>
      <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
    </div>
  );
};

export default Profile;