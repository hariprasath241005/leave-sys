import Login from "./pages/Login";
import Employee from "./pages/Employee";
import Manager from "./pages/Manager";
import HR from "./pages/HR";

import AdminDashboard from "./pages/AdminDashboard";

function App() {
  const role = localStorage.getItem("role");

  if (!role) return <Login />;
  if (role === "employee") return <Employee />;
  if (role === "manager") return <Manager />;
  if (role === "hr") return <HR />;
  if (role === "ceo") return <AdminDashboard />;
}

export default App;