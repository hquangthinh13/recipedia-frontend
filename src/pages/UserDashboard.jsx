import React from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/page-footer";
import InteractionDashboard from "@/components/interaction-dashboard";
const UserDashboard = () => {
  return (
    <div className="min-h-screen">
      <Navbar />{" "}
      <div className="flex mt-2 flex-col mx-auto max-w-6xl px-4 py-4">
        <InteractionDashboard />{" "}
      </div>
      <Footer />
    </div>
  );
};

export default UserDashboard;
