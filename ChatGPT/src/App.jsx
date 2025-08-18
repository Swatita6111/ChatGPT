import { useEffect, useState } from "react";
import * as webllm from "@mlc-ai/web-llm";
import "./app.scss";

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "system",
      content: "You are a helpful assistant that can help me with my tasks",
    },
  ]);
  const [engine, setEngine] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const selectedModel = "Llama-3.1-8B-Instruct-q4f32_1-MLC";

    webllm
      .CreateMLCEngine(selectedModel, {
        initProgressCallback: (initProgress) => {
          console.log("initProgress", initProgress);
        },
      })
      .then((eng) => {
        setEngine(eng);
        setIsLoading(false);
        console.log("Engine initialized!");
      })
      .catch((err) => {
        console.error("Engine init error:", err);
        setIsLoading(false);
      });
  }, []); // ✅ only run once

  async function sendMessageToLlm() {
    if (!input.trim() || !engine) return;

    const userMessage = { role: "user", content: input };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const reply = await engine.chat.completions.create({
        messages: updatedMessages,
      });

      const text = reply.choices[0].message.content;

      setMessages([...updatedMessages, { role: "assistant", content: text }]);
    } catch (error) {
      console.error("Error generating response:", error);
      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content:
            "⚠️ Sorry, I encountered an error while processing your request.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main>
      <section>
        <div className="conversional-area">
          <div className="messages">
            {messages
              .filter((message) => message.role !== "system")
              .map((message, index) => (
                <div className={`message ${message.role}`} key={index}>
                  {message.content}
                </div>
              ))}
          </div>

          <div className="input-area">
            <input
              onChange={(e) => setInput(e.target.value)}
              value={input}
              type="text"
              placeholder={
                isLoading ? "Loading model... please wait" : "Message LLM"
              }
              disabled={isLoading || !engine}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessageToLlm();
                }
              }}
            />
            <button onClick={sendMessageToLlm} disabled={isLoading || !engine}>
              {isLoading ? "..." : "Send"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
