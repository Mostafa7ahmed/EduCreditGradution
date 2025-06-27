import { useContext, useEffect, useState, useRef } from "react";
import styles from "./StudentChat.module.css";
import axios from "axios";
import { authContext } from "../../../Context/AuthContextProvider";
import { baseUrl } from "../../../Env/Env";
import * as signalR from "@microsoft/signalr";

export default function StudentChat() {
  const [chatGroups, setChatGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typingUsers, setTypingUsers] = useState([]);
  const { accessToken, decodedToken } = useContext(authContext);
  const id = decodedToken?.userId;
  const userName = decodedToken?.name || "User";
  const connectionRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Initialize SignalR connection
  useEffect(() => {
    if (!accessToken) return;

    // Create SignalR connection
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${baseUrl.replace('/api/', '')}chatHub`, {
        accessTokenFactory: () => accessToken,
      })
      .withAutomaticReconnect()
      .build();

    connectionRef.current = connection;

    // Set up event handlers
    connection.on("ReceiveMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    connection.on("UserTyping", (userName) => {
      setTypingUsers((prev) => {
        if (!prev.includes(userName)) {
          return [...prev, userName];
        }
        return prev;
      });

      // Remove typing indicator after 3 seconds
      setTimeout(() => {
        setTypingUsers((prev) => prev.filter((user) => user !== userName));
      }, 3000);
    });

    // Start connection
    connection
      .start()
      .then(() => {
        console.log("SignalR Connected");
      })
      .catch((err) => console.error("SignalR Connection Error:", err));

    // Cleanup on unmount
    return () => {
      connection.stop();
    };
  }, [accessToken, baseUrl]);

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
      console.log(error);
    }
  };

  // جلب الجروبات عند تحميل الصفحة
  useEffect(() => {
    if (id && accessToken) {
      fetchChatGroups();
    }
  }, [id, accessToken]);

  // Fetch messages when course is selected
  useEffect(() => {
    if (!selectedCourseId) return;
    fetchMessages(selectedCourseId);
  }, [selectedCourseId, accessToken]);

  const sendMessage = async () => {
    if (!input.trim() || !connectionRef.current) return;

    try {
      // Send message through SignalR
      if (connectionRef.current.state === signalR.HubConnectionState.Connected) {
        await connectionRef.current.invoke("SendMessageToGroup", selectedCourseId, input);
        setInput("");
      } else {
        // Fallback to HTTP if SignalR is not connected
        await axios.post(
          `${baseUrl}Chat/messages`,
          {
            courseId: selectedCourseId,
            message: input,
          },
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        setInput("");
        fetchMessages(selectedCourseId);
      }
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Failed to send message. Please try again.");
    }
  };

  const handleTyping = () => {
    if (!connectionRef.current || connectionRef.current.state !== signalR.HubConnectionState.Connected) {
      return;
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing notification
    connectionRef.current.invoke("SendTypingNotification", selectedCourseId, userName).catch((err) => {
      console.error("Error sending typing notification:", err);
    });

    // Set timeout to stop showing typing after user stops
    typingTimeoutRef.current = setTimeout(() => {
      // Typing stopped
    }, 1000);
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
                  className={`${styles.chatItem} ${
                    selectedCourseId === group.groupId ? styles.selectedChat : ""
                  }`}
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
                    {typingUsers.length > 0 && (
                      <span className={styles.typingIndicator}>
                        {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className={styles.messageArea}>
              {messages.map((msg, index) => (
                <div
                  key={`${msg.sendAt}-${msg.senderId}-${index}`}
                  className={msg.senderId === id ? styles.messageSent : styles.messageReceived}
                >
                  <p>
                    {msg.senderId !== id && (
                      <span className={styles.name}>{msg.senderName}</span>
                    )}
                    {msg.senderId !== id && <br />}
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
                  onChange={(e) => {
                    setInput(e.target.value);
                    handleTyping();
                  }}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
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
