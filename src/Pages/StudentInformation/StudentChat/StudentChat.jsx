import{ useContext, useEffect, useState, useRef } from "react";
import styles from "./StudentChat.module.css";
import axios from "axios";
import { authContext } from "../../../Context/AuthContextProvider";
import { baseUrl } from "../../../Env/Env";

export default function StudentChat() {
  const [chatGroups, setChatGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const { accessToken, decodedToken } = useContext(authContext);
  const id = decodedToken?.userId;
  const pollingRef = useRef(null);

  // جلب الجروبات
  const fetchChatGroups = async () => {
    if (!id) {
      alert("User ID is missing. Please log in again.");
      setIsLoading(false);
      return;
    }
    try {
      const response = await axios.get(`${baseUrl}Chat/groups/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      const data = response.data;
      setChatGroups(data);
      if (data.length > 0) setSelectedCourseId(data[0].groupId);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (groupId) => {
    try {
      const response = await axios.get(`${baseUrl}Chat/${groupId}/messages`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setMessages(response.data);
    } catch (error) {
      console.log(error)
    }
  };

  // جلب الجروبات عند تحميل الصفحة
  useEffect(() => {
    if (id && accessToken) {
      fetchChatGroups();
    }
  }, [id, accessToken]);

  useEffect(() => {
    if (!selectedCourseId) return;
    fetchMessages(selectedCourseId);
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(() => {
      fetchMessages(selectedCourseId);
    }, 50000000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
    // eslint-disable-next-line
  }, [selectedCourseId, accessToken]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    try {
      await axios.post(
        `${baseUrl}Chat/messages`,
        {
          groupId: selectedCourseId,
          message: input,
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      setInput("");
      fetchMessages(selectedCourseId); 
    } catch (err) {
      console.log(err)
    }
  };

  return (
    <div className={styles.content}>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className={styles.container}>
          <div className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
              <h2 className={styles.headerTitle}>Chats</h2>
              <input
                type="text"
                placeholder="Search..."
                className={styles.searchInput}
              />
            </div>
            <div className={styles.chatList}>
              {chatGroups.map((group, index) => (
                <div
                  key={index}
                  className={styles.chatItem}
                  onClick={() => setSelectedCourseId(group.groupId)}
                >
                  <div className={styles.chatAvatar}>
                    <img src={null} alt="" className={styles.chatAvatarImage} />
                  </div>
                  <div className={styles.chatDetails}>
                    <div className={styles.chatNameTime}>
                      <p className={styles.chatName}>
                        {group.groupName || "Unknown"}
                      </p>
          
                    </div>
                    <p className={styles.chatPreview}>
                      {group.lastMessageText || "No messages yet..."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className={styles.chatArea}>
            <div className={styles.chatHeader}>
              <div className={styles.chatHeaderContent}>
                <div className={styles.chatAvatar}>
                  <img src={null} alt="" className={styles.chatAvatarImage} />
                </div>
                <div className={styles.chatHeaderDetails}>
                  <h2 className={styles.headerTitle}>
                    {chatGroups.find((g) => g.groupId === selectedCourseId)
                      ?.groupName || "Select a chat"}
                  </h2>
                  <p className={styles.chatPreview}>
                  </p>
                </div>
              </div>
            </div>
            <div className={styles.messageArea}>
              {messages.map((msg) => (
                <div
                  key={`${msg.sendAt}-${msg.senderId}`}
                  className={msg.senderId === id ? styles.messageSent : styles.messageReceived}
                >
                  <p>
                    {msg.senderId !== id && <span className={styles.name}>{msg.senderName}</span>}
                    <br />
                    {msg.message}
                  </p>
                  <span className={styles.messageTime}>
                    {new Date(msg.sendAt).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
            <div className={styles.inputArea}>
              <div className={styles.inputContainer}>
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendMessage()}
                  placeholder="Type a message..."
                  className={styles.messageInput}
                />
                <button className={styles.sendButton} onClick={sendMessage}>
                  <i className="fa-solid fa-paper-plane"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
