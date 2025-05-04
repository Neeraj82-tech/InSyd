import { useEffect, useState } from 'react';
import axios from 'axios';

const API = 'http://localhost:4000';

export default function Home() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [blogContent, setBlogContent] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [followId, setFollowId] = useState('');
  const [message, setMessage] = useState('');
  const [following, setFollowing] = useState([]);

  useEffect(() => {
    axios.get(`${API}/users`).then(res => setUsers(res.data));
  }, []);

  useEffect(() => {
    if (selectedUser && selectedUser.id) {
      // Get notifications
      axios.get(`${API}/notifications/${selectedUser.id}`)
        .then(res => setNotifications(res.data))
        .catch(err => console.error('Error fetching notifications:', err));

      // Get following list
      axios.get(`${API}/following/${selectedUser.id}`)
        .then(res => setFollowing(res.data))
        .catch(err => {
          console.error('Error fetching following list:', err);
          setFollowing([]); // Reset following list on error
        });
    } else {
      // Reset states when no user is selected
      setNotifications([]);
      setFollowing([]);
    }
  }, [selectedUser, message]);

  const handleUserSelect = (e) => {
    const userId = e.target.value;
    if (userId) {
      const user = users.find(u => u.id == userId);
      setSelectedUser(user);
      setFollowId(''); // Reset follow selection when user changes
    } else {
      setSelectedUser(null);
    }
  };

  const handleFollow = async () => {
    try {
      await axios.post(`${API}/follow`, { followerId: selectedUser.id, followeeId: followId });
      setMessage('✅ Followed!');
      setFollowing([...following, followId]);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error following user');
    }
    setTimeout(() => setMessage(''), 2000);
  };

  const handleUnfollow = async () => {
    try {
      await axios.post(`${API}/unfollow`, { followerId: selectedUser.id, followeeId: followId });
      setMessage('❌ Unfollowed!');
      setFollowing(following.filter(id => id !== followId));
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error unfollowing user');
    }
    setTimeout(() => setMessage(''), 2000);
  };

  const handleBlog = async () => {
    await axios.post(`${API}/blog`, { userId: selectedUser.id, content: blogContent });
    setBlogContent('');
    setMessage('📝 Blog posted!');
    setTimeout(() => setMessage(''), 2000);
  };

  const handleComment = async () => {
    await axios.post(`${API}/comment`, { userId: selectedUser.id, content: commentContent });
    setCommentContent('');
    setMessage('💬 Comment posted!');
    setTimeout(() => setMessage(''), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-4 py-10 text-white font-sans">
      <div className="w-full max-w-2xl bg-gray-900 bg-opacity-80 backdrop-blur rounded-2xl shadow-2xl p-8 space-y-6">
        <h1 className="text-4xl font-bold text-center text-teal-400">Insyd Notification POC</h1>

        <button
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-xl transition"
          onClick={() => axios.get(`${API}/init`).then(() => window.location.reload())}
        >
          🔄 Reset & Seed Users
        </button>

        <div>
          <h2 className="text-xl font-semibold mb-2 text-teal-300">1. Select User</h2>
          <select
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
            onChange={handleUserSelect}
            defaultValue=""
          >
            <option value="" disabled>-- Select User --</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name} (id: {u.id})</option>
            ))}
          </select>
        </div>

        {selectedUser && (
          <>
            <div>
              <h2 className="text-xl font-semibold mb-2 text-teal-300">2. Actions</h2>

              {/* Follow */}
              <div className="mb-4">
                <label className="block mb-1">Follow someone</label>
                <div className="flex gap-2">
                  <select
                    className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                    onChange={e => setFollowId(e.target.value)}
                    defaultValue=""
                  >
                    <option value="" disabled>-- Select --</option>
                    {users.filter(u => u.id !== selectedUser.id).map(u => (
                      <option key={u.id} value={u.id}>{u.name} (id: {u.id})</option>
                    ))}
                  </select>
                  <button
                    className={`${following.includes(parseInt(followId))
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-teal-600 hover:bg-teal-700'
                      } text-white px-4 py-2 rounded-xl transition`}
                    onClick={following.includes(parseInt(followId)) ? handleUnfollow : handleFollow}
                    disabled={!followId}
                  >
                    {following.includes(parseInt(followId)) ? '❌ Unfollow' : '➕ Follow'}
                  </button>
                </div>
              </div>

              {/* Blog */}
              <div className="mb-4">
                <label className="block mb-1">Post Blog</label>
                <div className="flex gap-2">
                  <input
                    className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                    value={blogContent}
                    onChange={e => setBlogContent(e.target.value)}
                    placeholder="Write a blog..."
                  />
                  <button
                    className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl transition"
                    onClick={handleBlog}
                    disabled={!blogContent}
                  >
                    ✍️ Post
                  </button>
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block mb-1">Post Comment</label>
                <div className="flex gap-2">
                  <input
                    className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                    value={commentContent}
                    onChange={e => setCommentContent(e.target.value)}
                    placeholder="Write a comment..."
                  />
                  <button
                    className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl transition"
                    onClick={handleComment}
                    disabled={!commentContent}
                  >
                    💬 Post
                  </button>
                </div>
              </div>
            </div>

            {/* Message */}
            {message && (
              <div className="text-center text-green-400 font-semibold">{message}</div>
            )}

            {/* Notifications */}
            <div>
              <h2 className="text-xl font-semibold mb-2 text-teal-300">3. Notifications</h2>
              <ul className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {notifications.length === 0 ? (
                  <li className="text-gray-400 italic">No notifications yet.</li>
                ) : (
                  notifications.map(n => (
                    <li key={n.id} className="bg-gray-800 border border-gray-700 rounded p-3 shadow-sm">
                      <div className="text-white">{n.content}</div>
                      <div className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
