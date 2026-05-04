import StatsCard from "../components/Dashboard/StatsCard";
import CardDetails from "../components/Dashboard/CardDetails";
import UserProfile from "../components/Dashboard/UserProfile";
import TransactionDetails from "../components/Dashboard/TransactionDetails";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { changePassword } from "../services/userServices";

const Dashboard = () => {
  const { user, setUser, isLoading, setIsLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await changePassword(passwordForm);
      toast.success(res?.message || "Password changed successfully");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setIsChangingPassword(false);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Password change failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-dark">
      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6 text-white">
          <h2 className="md:text-2xl font-semibold">Your profile</h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsChangingPassword(true)}
              className="md:px-4 px-2 py-2  sm:py-2 border rounded-lg text-xs  sm:text-sm font-medium hover:bg-green duration-300 cursor-pointer"
            >
              Change password
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="md:px-4 px-2 py-2  sm:py-2 border rounded-lg text-xs  sm:text-sm font-medium hover:bg-green duration-300 cursor-pointer"
            >
              Edit profile
            </button>
          </div>
        </div>

        {/* Profile Card */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* User Profile */}
          <UserProfile
            user={user}
            setUser={setUser}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />

          <div className="col-span-3 space-y-6">
            <StatsCard />

            {/* Card Details */}
            <CardDetails />

            {/* Transaction Details */}
            <TransactionDetails />
          </div>
        </div>

        {isChangingPassword && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <div className="w-full max-w-md rounded-xl bg-gray-900 p-6 text-white shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Change Password</h3>
              <form onSubmit={handleChangePassword} className="space-y-3">
                <div className="flex flex-col">
                  <label htmlFor="currentPassword">Current password</label>
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-white"
                    required
                  />
                </div>

                <div className="flex flex-col">
                  <label htmlFor="newPassword">New password</label>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-white"
                    minLength={8}
                    required
                  />
                </div>

                <div className="flex flex-col">
                  <label htmlFor="confirmPassword">Confirm password</label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-white"
                    minLength={8}
                    required
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsChangingPassword(false)}
                    className="w-full rounded-md border border-gray-400 py-2 font-semibold hover:bg-dark/50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-full rounded-md bg-green py-2 font-semibold hover:bg-green/90"
                  >
                    {isLoading ? "Processing..." : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
