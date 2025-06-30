import { useContext, useEffect, useState, useRef, useCallback } from "react";
import styles from "./TeacherChat.module.css";
import axios from "axios";
import { authContext } from "../../../Context/AuthContextProvider";
import { baseUrl } from "../../../Env/Env";
import * as signalR from "@microsoft/signalr";

export default function TeacherChat() {
  const [chatGroups, setChatGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  
  const { accessToken, decodedToken } = useContext(authContext);
  const id = decodedToken?.userId;
  const userName = decodedToken?.name || "Teacher";
  
  // Use single connection for all courses
  const hubConnection = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch user's chat groups
  const fetchChatGroups = useCallback(async () => {
    if (!id || !accessToken) {
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
      
      // Auto-select first group if available
      if (data && data.length > 0 && !selectedCourseId) {
        setSelectedCourseId(data[0].groupId);
      }
    } catch (error) {
      console.error("Error fetching chat groups:", error);
      setConnectionError("Failed to load chat groups");
    } finally {
      setIsLoading(false);
    }
  }, [id, accessToken, selectedCourseId]);

  // Load messages for selected course
  const loadMessages = useCallback(async (courseId) => {
    if (!courseId || !accessToken) return;

    try {
      const response = await axios.get(`${baseUrl}Chat/${courseId}/messages`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setMessages(response.data || []);
      setTimeout(scrollToBottom, 100); // Scroll after messages load
    } catch (error) {
      console.error("Error loading messages:", error);
      setMessages([]);
    }
  }, [accessToken]);

  // Fallback connection method for CORS issues
  const tryFallbackConnection = async () => {
    try {
      const hubUrl = baseUrl.replace('/api', '') + 'chatHub';
      console.log('🔄 Trying fallback connection...');

      const fallbackConnection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          // Try different transport methods
          transport: signalR.HttpTransportType.LongPolling,
          accessTokenFactory: () => accessToken,
        })
        .withAutomaticReconnect()
        .build();

      await fallbackConnection.start();
      
      console.log("✅ Fallback connection successful!");
      
      // Replace the current connection
      if (hubConnection.current) {
        hubConnection.current.stop();
      }
      
      hubConnection.current = fallbackConnection;
      setIsConnected(true);
      setConnectionError(null);
      
      // Set up the same event handlers
      setupConnectionHandlers(fallbackConnection);
      
    } catch (fallbackError) {
      console.error("❌ Fallback connection also failed:", fallbackError);
      setConnectionError("Connection failed - please check backend CORS configuration");
    }
  };

  // Setup connection event handlers (extracted for reuse)
  const setupConnectionHandlers = (connection) => {
    // Handle new messages
    connection.on("ReceiveMessage", (newMessage) => {
      console.log("📨 Received message:", newMessage);
      
      // Add message to state and scroll to bottom
      setMessages((prev) => {
        const updated = [...prev, newMessage];
        setTimeout(scrollToBottom, 50);
        return updated;
      });
    });

    // Handle typing notifications
    connection.on("UserTyping", (typingUser) => {
      if (typingUser === userName) return; // Don't show our own typing

      setTypingUsers((prev) => new Set(prev).add(typingUser));

      // Clear typing indicator after 3 seconds
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setTypingUsers((prev) => {
          const updated = new Set(prev);
          updated.delete(typingUser);
          return updated;
        });
      }, 3000);
    });

    // Handle message errors
    connection.on("MessageError", (error) => {
      console.error("Message error:", error);
      alert("Failed to send message. Please try again.");
    });

    // Connection lifecycle events
    connection.onreconnecting(() => {
      console.log("🔄 Reconnecting...");
      setIsConnected(false);
    });

    connection.onreconnected(() => {
      console.log("✅ Reconnected!");
      setIsConnected(true);
      setConnectionError(null);
    });

    connection.onclose(() => {
      console.log("❌ Connection closed");
      setIsConnected(false);
    });
  };

  // Initialize single SignalR connection
  useEffect(() => {
    if (!accessToken) return;

    const hubUrl = baseUrl.replace('/api', '') + 'chatHub';
    console.log('🔌 Connecting to Chat Hub:', hubUrl);

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => accessToken,
        // Additional options to help with CORS
        transport: signalR.HttpTransportType.WebSockets,
        skipNegotiation: true,
        headers: {
          "Authorization": `Bearer ${accessToken}`
        }
      })
      .withAutomaticReconnect([0, 2000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Warning) // Reduce logging noise
      .build();

    hubConnection.current = connection;

    // Connection event handlers
    connection.start()
      .then(() => {
        console.log("✅ Connected to chat hub");
        setIsConnected(true);
        setConnectionError(null);
      })
      .catch(async (error) => {
        console.error("❌ Chat connection failed:", error);
        setIsConnected(false);
        
        // Try alternative connection method if CORS fails
        if (error.message.includes("CORS") || error.message.includes("negotiate")) {
          console.log("🔄 Trying alternative connection method...");
          await tryFallbackConnection();
        } else {
          setConnectionError("Connection failed - check network");
        }
      });

    // Set up connection event handlers
    setupConnectionHandlers(connection);

    return () => {
      clearTimeout(typingTimeoutRef.current);
      connection.stop();
    };
  }, [accessToken, userName]);

  // Load messages when course selection changes
  useEffect(() => {
    if (selectedCourseId) {
      loadMessages(selectedCourseId);
    }
  }, [selectedCourseId, loadMessages]);

  // Fetch groups on mount
  useEffect(() => {
    fetchChatGroups();
  }, [fetchChatGroups]);

  // Send message via SignalR only
  const sendMessage = useCallback(async () => {
    if (!input.trim() || !selectedCourseId || !hubConnection.current) return;

    const messageText = input.trim();
    setInput(""); // Clear input immediately for better UX

    try {
      if (hubConnection.current.state === signalR.HubConnectionState.Connected) {
        await hubConnection.current.invoke("SendMessageToGroup", selectedCourseId, messageText);
        console.log("✅ Message sent via SignalR");
      } else {
        throw new Error("Not connected to chat hub");
      }
    } catch (err) {
      console.error("❌ Send message failed:", err);
      setInput(messageText); // Restore input on error
      alert("Failed to send message. Please check your connection.");
    }
  }, [input, selectedCourseId]);

  // Send typing notification with throttling
  const sendTypingNotification = useCallback(() => {
    if (!hubConnection.current || !selectedCourseId || 
        hubConnection.current.state !== signalR.HubConnectionState.Connected) return;

    hubConnection.current.invoke("SendTypingNotification", selectedCourseId, userName)
      .catch((error) => console.error("Typing notification failed:", error));
  }, [selectedCourseId, userName]);

  // Handle input change with throttled typing notification
  const handleInputChange = (e) => {
    setInput(e.target.value);
    
    // Throttle typing notifications
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(sendTypingNotification, 300);
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (isLoading) {
    return (
      <div className={styles.content}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading teacher chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.content}>
      {/* Connection Status */}
      {connectionError && (
        <div className={styles.connectionError}>
          ⚠️ {connectionError}
          {connectionError.includes("CORS") && (
            <div style={{ marginTop: '8px', fontSize: '0.875rem' }}>
              💡 <strong>Solution:</strong> Ask your backend developer to fix CORS configuration for SignalR
            </div>
          )}
        </div>
      )}
      
      <div className={styles.container}>
        {/* Sidebar */}
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h2 className={styles.headerTitle}>Course Chats</h2>
            <div className={styles.connectionStatus}>
              <span className={isConnected ? styles.connected : styles.disconnected}>
                {isConnected ? "🟢" : "🔴"} {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>
          
          <div className={styles.chatList}>
            {chatGroups.map((group, index) => (
              <div
                key={group.groupId || index}
                className={`${styles.chatItem} ${
                  selectedCourseId === group.groupId ? styles.selectedChat : ""
                }`}
                onClick={() => setSelectedCourseId(group.groupId)}
              >
                <div className={styles.chatAvatar}>
                  <div className={styles.avatarPlaceholder}>
                    {group.groupName?.charAt(0) || "?"}
                  </div>
                </div>
                <div className={styles.chatDetails}>
                  <div className={styles.chatNameTime}>
                    <p className={styles.chatName}>
                      {group.groupName || "Unknown Course"}
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
          {selectedCourseId ? (
            <>
              {/* Chat Header */}
              <div className={styles.chatHeader}>
                <div className={styles.chatHeaderContent}>
                  <div className={styles.chatAvatar}>
                    <div className={styles.avatarPlaceholder}>
                      {chatGroups.find((g) => g.groupId === selectedCourseId)?.groupName?.charAt(0) || "?"}
                    </div>
                  </div>
                  <div className={styles.chatHeaderDetails}>
                    <h2 className={styles.headerTitle}>
                      {chatGroups.find((g) => g.groupId === selectedCourseId)?.groupName || "Select a chat"}
                    </h2>
                    {typingUsers.size > 0 && (
                      <p className={styles.typingIndicator}>
                        {Array.from(typingUsers).join(", ")} {typingUsers.size === 1 ? "is" : "are"} typing...
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className={styles.messageArea}>
                {messages.length === 0 ? (
                  <div className={styles.emptyMessages}>
                    <p>No messages yet. Start the conversation with your students! 👨‍🏫💬</p>
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <div
                      key={`${msg.sendAt}-${msg.senderId}-${index}`}
                      className={msg.senderId === id ? styles.messageSent : styles.messageReceived}
                    >
                      <div className={styles.messageContent}>
                        {msg.senderId !== id && (
                          <span className={styles.senderName}>{msg.senderName}</span>
                        )}
                        <p className={styles.messageText}>{msg.message}</p>
                        <span className={styles.messageTime}>
                          {new Date(msg.sendAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className={styles.inputArea}>
                <div className={styles.inputContainer}>
                  <input
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyPress}
                    placeholder={isConnected ? "Type a message to your students..." : "Connecting..."}
                    className={styles.messageInput}
                    disabled={!isConnected}
                  />
                  <button 
                    className={styles.sendButton} 
                    onClick={sendMessage}
                    disabled={!input.trim() || !isConnected}
                  >
                    <i className="fa-solid fa-paper-plane"></i>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.noSelection}>
              <p>Select a course to start messaging with your students</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
