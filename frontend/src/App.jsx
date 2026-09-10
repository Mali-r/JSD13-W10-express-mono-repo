import { useEffect, useState } from "react";
import { getUsers, createUser, updateUser, deleteUser } from "./api/user";
import Login from "./pages/Login";

function App() {
  // ---------- Auth state ----------
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
  };

  // ---------- Users CRUD state (ของเดิมทั้งหมด) ----------
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [editingId, setEditingId] = useState(null); // null = create mode, มีค่า = edit mode

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // โหลด users ก็ต่อเมื่อ login แล้วเท่านั้น
    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({ username: "", email: "", password: "" });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (editingId) {
        const payload = { username: form.username, email: form.email };
        if (form.password) payload.password = form.password;

        await updateUser(editingId, payload);
      } else {
        await createUser(form);
      }

      resetForm();
      await fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (user) => {
    setEditingId(user._id);
    setForm({ username: user.username, email: user.email, password: "" });
  };

  const handleDelete = async (id) => {
    if (!confirm("ยืนยันการลบ user นี้?")) return;

    try {
      setError(null);
      await deleteUser(id);
      await fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  // ---------- ยังไม่ login -> โชว์หน้า Login ----------
  if (!currentUser) {
    return <Login onLoginSuccess={setCurrentUser} />;
  }

  // ---------- login แล้ว -> โชว์หน้า Users management เดิม ----------
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            สวัสดี, {currentUser.username} 👋
          </h1>
          <button
            onClick={handleLogout}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm transition"
          >
            ออกจากระบบ
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-4 flex justify-between items-center">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} className="text-red-200 hover:text-white">
              ✕
            </button>
          </div>
        )}

        {/* Form Create/Update */}
        <form
          onSubmit={handleSubmit}
          className="bg-gray-800 p-5 rounded-lg mb-6 space-y-3"
        >
          <h2 className="font-semibold text-lg mb-2">
            {editingId ? "แก้ไข User" : "เพิ่ม User ใหม่"}
          </h2>

          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
            className="w-full bg-gray-700 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full bg-gray-700 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="password"
            name="password"
            placeholder={editingId ? "Password (เว้นว่างถ้าไม่เปลี่ยน)" : "Password"}
            value={form.password}
            onChange={handleChange}
            required={!editingId}
            className="w-full bg-gray-700 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed px-4 py-2 rounded font-medium transition"
            >
              {submitting ? "กำลังบันทึก..." : editingId ? "บันทึกการแก้ไข" : "เพิ่ม User"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded font-medium transition"
              >
                ยกเลิก
              </button>
            )}
          </div>
        </form>

        {/* Loading state */}
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : users.length === 0 ? (
          <p className="text-gray-400 text-center py-10">ยังไม่มี user ในระบบ</p>
        ) : (
          <ul className="space-y-2">
            {users.map((user) => (
              <li
                key={user._id}
                className="bg-gray-800 p-4 rounded-lg flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{user.username}</p>
                  <p className="text-sm text-gray-400">{user.email}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(user)}
                    className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-sm transition"
                  >
                    แก้ไข
                  </button>
                  <button
                    onClick={() => handleDelete(user._id)}
                    className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition"
                  >
                    ลบ
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;