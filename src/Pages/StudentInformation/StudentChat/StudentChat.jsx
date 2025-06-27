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
  const [typingUsers, setTypingUsers] = useState(new Set());
  const { accessToken, decodedToken } = useContext(authContext);
  const id = decodedToken?.userId;
  const userName = decodedToken?.name || "User";
  const hubConnection = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Fetch user's chat groups - matches ChatController.GetUserGroups
  const fetchChatGroups = async () => {
    if (!id) {
      console.error("User ID is missing. Please log in again.");
      setIsLoading(false);
      return;
    }
    
    try {
      console.log("Fetching chat groups for user:", id);
      const response = await axios.get(`${baseUrl}Chat/groups/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      
      const data = response.data;
      console.log("Received chat groups:", data);
      setChatGroups(data);
      
      // Auto-select first group if available
      if (data && data.length > 0) {
        setSelectedCourseId(data[0].groupId);
      }
    } catch (error) {
      console.error("Error fetching chat groups:", error);
      const errorMessage = error.response?.data?.message || error.message;
      console.error("Chat groups error:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Load old messages when course is selected
  useEffect(() => {
    if (!selectedCourseId || !accessToken) return;

    fetch(`${baseUrl}Chat/${selectedCourseId}/messages`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Loaded messages for course:", selectedCourseId, data);
        setMessages(data || []);
      })
      .catch((error) => {
        console.error("Error loading messages:", error);
        setMessages([]);
      });
  }, [selectedCourseId, accessToken]);

  // Initialize SignalR connection and set up handlers
  useEffect(() => {
    if (!selectedCourseId || !accessToken) return;

    const hubUrl = baseUrl.replace('/api', '') + 'chatHub';
    console.log('Connecting to Chat Hub:', hubUrl);

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => accessToken,
      })
      .withAutomaticReconnect()
      .build();

    hubConnection.current = connection;

    connection.start()
      .then(() => {
        console.log("✅ Connected to chat hub for course:", selectedCourseId);
      })
      .catch((error) => {
        console.error("❌ Chat connection failed:", error);
      });

    // Receive new message
    connection.on("ReceiveMessage", (newMessage) => {
      console.log("Received new message:", newMessage);
      if (newMessage.CourseId !== selectedCourseId) return; // Ensure it's for the current group

      setMessages((prev) => [...prev, newMessage]);
    });

    // Receive typing notification
    connection.on("UserTyping", (typingUser) => {
      console.log("User typing:", typingUser);
      if (typingUser === userName) return; // Don't show typing for ourselves

      setTypingUsers((prev) => new Set(prev).add(typingUser));

      // Remove typing indicator after 3 seconds if user doesn't type again
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setTypingUsers((prev) => {
          const updated = new Set(prev);
          updated.delete(typingUser);
          return updated;
        });
      }, 3000);
    });

    return () => {
      connection.stop();
      setTypingUsers(new Set());
    };
  }, [selectedCourseId, accessToken, userName]);

  // Fetch groups on component mount
  useEffect(() => {
    if (id && accessToken) {
      fetchChatGroups();
    }
  }, [id, accessToken]);

  // Send message
  const sendMessage = async () => {
    if (!input.trim() || !selectedCourseId) return;

    const messageText = input.trim();
    setInput(""); // Clear input immediately

    try {
      if (hubConnection.current && hubConnection.current.state === signalR.HubConnectionState.Connected) {
        await hubConnection.current.invoke("SendMessageToGroup", selectedCourseId, messageText);
        console.log("Message sent via SignalR");
      } else {
        console.log("SignalR not connected, sending via HTTP...");
        // Fallback to HTTP
        const response = await axios.post(`${baseUrl}Chat/messages`, {
          courseId: selectedCourseId,
          message: messageText,
        }, {
          headers: { 
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });
        console.log("Message sent via HTTP:", response.data);
      }
    } catch (err) {
      console.error("Send message failed:", err);
      setInput(messageText); // Restore input on error
      alert("Failed to send message. Please try again.");
    }
  };

  // Send typing notification
  const sendTypingNotification = () => {
    if (!hubConnection.current || !selectedCourseId) return;

    hubConnection.current.invoke("SendTypingNotification", selectedCourseId, userName)
      .catch((error) => console.error("Typing notification failed:", error));
  };

  // Handle input change with typing notification
  const handleInputChange = (e) => {
    setInput(e.target.value);
    sendTypingNotification();
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
                    {typingUsers.size > 0 && (
                      <span className={styles.typingIndicator}>
                        {Array.from(typingUsers).join(", ")} {typingUsers.size === 1 ? "is" : "are"} typing...
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className={styles.messageArea}>
              {messages.length === 0 && <p>No messages yet.</p>}
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
                  onChange={handleInputChange}
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
