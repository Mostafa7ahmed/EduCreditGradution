import React, { useState, useEffect, useRef, useContext } from "react";
import * as signalR from "@microsoft/signalr";
import { authContext } from "../../Context/AuthContextProvider";
import { baseUrl } from "../../Env/Env";

function ChatTester() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [courseId, setCourseId] = useState(""); // For testing different courses
  const [isConnected, setIsConnected] = useState(false);
  const { accessToken, decodedToken } = useContext(authContext);
  const hubConnection = useRef(null);
  const typingTimeoutRef = useRef(null);

  const userId = decodedToken?.userId;
  const userName = decodedToken?.name || "TestUser";

  // Load old messages when course ID changes
  useEffect(() => {
    if (!courseId || !accessToken) {
      setMessages([]);
      return;
    }

    fetch(`${baseUrl}Chat/${courseId}/messages`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("🧪 Loaded test messages for course:", courseId, data);
        setMessages(data || []);
      })
      .catch((error) => {
        console.error("🧪 Error loading test messages:", error);
        setMessages([]);
      });
  }, [courseId, accessToken]);

  // Initialize SignalR connection and set up handlers
  useEffect(() => {
    if (!courseId || !accessToken) {
      setIsConnected(false);
      return;
    }

    const hubUrl = baseUrl.replace('/api', '') + 'chatHub';
    console.log('🧪 Connecting to Chat Hub for testing:', hubUrl);

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => accessToken,
      })
      .withAutomaticReconnect()
      .build();

    hubConnection.current = connection;

    connection.start()
      .then(() => {
        console.log("🧪✅ Test chat connected for course:", courseId);
        setIsConnected(true);
      })
      .catch((error) => {
        console.error("🧪❌ Test chat connection failed:", error);
        setIsConnected(false);
      });

    // Receive new message
    connection.on("ReceiveMessage", (newMessage) => {
      console.log("🧪 Test received message:", newMessage);
      if (newMessage.CourseId !== courseId) return;

      setMessages((prev) => [...prev, newMessage]);
    });

    // Receive typing notification
    connection.on("UserTyping", (typingUser) => {
      console.log("🧪 Test user typing:", typingUser);
      if (typingUser === userName) return;

      setTypingUsers((prev) => new Set(prev).add(typingUser));

      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setTypingUsers((prev) => {
          const updated = new Set(prev);
          updated.delete(typingUser);
          return updated;
        });
      }, 3000);
    });

    // Connection state handlers
    connection.onreconnecting(() => {
      console.log("🧪 Test chat reconnecting...");
      setIsConnected(false);
    });

    connection.onreconnected(() => {
      console.log("🧪 Test chat reconnected!");
      setIsConnected(true);
    });

    connection.onclose(() => {
      console.log("🧪 Test chat disconnected");
      setIsConnected(false);
    });

    return () => {
      connection.stop();
      setTypingUsers(new Set());
      setIsConnected(false);
    };
  }, [courseId, accessToken, userName]);

  // Send message
  const sendMessage = async () => {
    if (!input.trim() || !courseId) return;

    const messageText = input.trim();
    setInput("");

    try {
      if (hubConnection.current && hubConnection.current.state === signalR.HubConnectionState.Connected) {
        await hubConnection.current.invoke("SendMessageToGroup", courseId, messageText);
        console.log("🧪 Test message sent via SignalR");
      } else {
        console.log("🧪 SignalR not connected, sending test message via HTTP...");
        const response = await fetch(`${baseUrl}Chat/messages`, {
          method: 'POST',
          headers: { 
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            courseId: courseId,
            message: messageText,
          }),
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log("🧪 Test message sent via HTTP:", result);
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }
    } catch (err) {
      console.error("🧪 Test send message failed:", err);
      setInput(messageText);
      alert("Failed to send test message. Please try again.");
    }
  };

  // Send typing notification
  const sendTypingNotification = () => {
    if (!hubConnection.current || !courseId) return;

    hubConnection.current.invoke("SendTypingNotification", courseId, userName)
      .catch((error) => console.error("🧪 Test typing notification failed:", error));
  };

  // Handle input change with typing notification
  const handleInputChange = (e) => {
    setInput(e.target.value);
    sendTypingNotification();
  };

  const containerStyle = {
    maxWidth: "600px",
    margin: "20px auto",
    padding: "20px",
    border: "2px solid #007bff",
    borderRadius: "8px",
    backgroundColor: "#f8f9fa"
  };

  const headerStyle = {
    backgroundColor: "#007bff",
    color: "white",
    padding: "10px",
    borderRadius: "6px",
    marginBottom: "15px",
    textAlign: "center"
  };

  const statusStyle = {
    padding: "8px",
    borderRadius: "4px",
    marginBottom: "10px",
    backgroundColor: isConnected ? "#d4edda" : "#f8d7da",
    color: isConnected ? "#155724" : "#721c24",
    border: `1px solid ${isConnected ? "#c3e6cb" : "#f5c6cb"}`
  };

  const messagesStyle = {
    border: "1px solid #dee2e6",
    height: "300px",
    overflowY: "scroll",
    padding: "10px",
    marginBottom: "15px",
    backgroundColor: "white",
    borderRadius: "4px"
  };

  const inputStyle = {
    display: "flex",
    gap: "10px",
    marginTop: "10px"
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2>🧪 Chat Component Tester</h2>
      </div>

      <div style={statusStyle}>
        <strong>Status:</strong> {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
        {typingUsers.size > 0 && (
          <span style={{ marginLeft: "20px", fontStyle: "italic" }}>
            👀 {Array.from(typingUsers).join(", ")} typing...
          </span>
        )}
      </div>

      <div>
        <label htmlFor="courseId" style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
          Course ID for Testing:
        </label>
        <input
          id="courseId"
          type="text"
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          placeholder="Enter a course ID (GUID)"
          style={{ width: "100%", padding: "8px", marginBottom: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
      </div>

      <div style={messagesStyle}>
        {messages.length === 0 && <p style={{ color: "#6c757d", fontStyle: "italic" }}>No messages yet. Enter a course ID and start testing!</p>}

        {messages.map((msg, index) => (
          <div
            key={`${msg.sendAt}-${msg.senderId}-${index}`}
            style={{
              marginBottom: "12px",
              textAlign: msg.senderId === userId ? "right" : "left",
            }}
          >
            <div
              style={{
                display: "inline-block",
                backgroundColor: msg.senderId === userId ? "#dcf8c6" : "#e9ecef",
                borderRadius: "12px",
                padding: "10px",
                maxWidth: "70%",
                boxShadow: "0 1px 2px rgba(0,0,0,0.1)"
              }}
            >
              <strong style={{ color: "#495057" }}>{msg.senderName}</strong>
              <p style={{ margin: "5px 0", color: "#212529" }}>{msg.message}</p>
              <small style={{ fontSize: "0.75em", color: "#6c757d" }}>
                {new Date(msg.sendAt).toLocaleTimeString()}
              </small>
            </div>
          </div>
        ))}
      </div>

      <div style={inputStyle}>
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a test message..."
          style={{ 
            flex: 1, 
            padding: "10px", 
            borderRadius: "4px", 
            border: "1px solid #ccc",
            outline: "none"
          }}
          disabled={!courseId}
        />
        <button 
          onClick={sendMessage}
          disabled={!courseId || !input.trim()}
          style={{ 
            padding: "10px 20px", 
            backgroundColor: courseId && input.trim() ? "#007bff" : "#6c757d",
            color: "white", 
            border: "none", 
            borderRadius: "4px",
            cursor: courseId && input.trim() ? "pointer" : "not-allowed"
          }}
        >
          Send
        </button>
      </div>

      <div style={{ marginTop: "15px", fontSize: "0.9em", color: "#6c757d" }}>
        <p><strong>Instructions:</strong></p>
        <ul style={{ paddingLeft: "20px" }}>
          <li>Enter a valid course ID (GUID format) to start testing</li>
          <li>The component will automatically load existing messages</li>
          <li>Type messages to test real-time chat functionality</li>
          <li>Open multiple tabs to test typing notifications</li>
          <li>Check the browser console for detailed logs</li>
        </ul>
      </div>
    </div>
  );
}

export default ChatTester; 