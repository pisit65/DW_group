import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Pie,PieChart,BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import graphIcon from "../assets/graph-svgrepo-com.svg";
import ReactMarkdown from "react-markdown";
const Chat = () => {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [apiStatus, setApiStatus] = useState(null);
  const [chatMode, setChatMode] = useState("demo");
  const [selectedMode, setSelectedMode] = useState("gemini");
  const [analysisData, setAnalysisData] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    checkApiStatus();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // ---------------- Chat API ----------------
  const handleRequest = async (endpoint, onSuccess, onExtra) => {
    setLoading(true);
    setError("");
    try {
      const url = `http://localhost:3001/${endpoint}`;
      let res;

      if (endpoint === "chat") {
        res = await axios.post(url, { message, mode: selectedMode });
      } else {
        res = await axios.get(url);
      }

      const data = res.data;
      onSuccess?.(data);
      onExtra?.(data);
    } catch (err) {
      console.error("Axios error:", err);
      setError(err.response?.data?.error || "Error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Fixed sendDataToChat function
const sendDataToChat = async (data, customMessage) => {
  if (!data) {
    setError("No analysis data to send.");
    return;
  }

  // จัดเรียงข้อมูลให้อ่านง่าย (Markdown-style)
  const regionSummary = {};
  data.salesByRegion.forEach(r => {
    if (!regionSummary[r.name]) regionSummary[r.name] = 0;
    regionSummary[r.name] += r.sales_amount;
  });

  const summaryText = `
**Overall Performance**
- Total Sales: $${data.totalSales.toLocaleString(undefined, {minimumFractionDigits:2})}
- Total Profit: $${data.totalProfit.toLocaleString(undefined, {minimumFractionDigits:2})}

**Top Categories**
${data.salesByCategory.slice(0,3).map(c => `- ${c.name}: $${c.sales_amount.toLocaleString(undefined, {minimumFractionDigits:2})}`).join('\n')}

**Top Brands**
${data.salesByBrand.slice(0,3).map(b => `- ${b.name}: $${b.sales_amount.toLocaleString(undefined, {minimumFractionDigits:2})}`).join('\n')}

**Sales by Region**
${Object.entries(regionSummary).map(([k,v]) => `- ${k}: $${v.toLocaleString(undefined, {minimumFractionDigits:2})}`).join('\n')}
`;

  const messageToSend = customMessage 
    ? `${customMessage}\nจากข้อมูลต่อไปนี้:\n${summaryText}` 
    : `ช่วยสรุปข้อมูลโดยใช้ข้อมูลตัวนี้ให้หน่อย:\n${summaryText}`;

  if (!messageToSend.trim()) {
    setError("Generated message is empty.");
    return;
  }

  // ส่งข้อความไป AI
  setChatHistory(prev => [...prev, { sender: "user", text: messageToSend }]);
  setLoading(true);
  setError("");
  try {
    const res = await axios.post("http://localhost:3001/chat", { 
      message: messageToSend, 
      mode: selectedMode 
    });
    setChatHistory(prev => [...prev, { sender: "bot", text: res.data.reply }]);
    setChatMode(res.data.mode || "unknown");
    if (res.data.note) setError(res.data.note);
  } catch (err) {
    console.error("Chat request error:", err);
    setError(err.response?.data?.error || "Failed to send message to AI");
  } finally {
    setLoading(false);
  }

  setMessage("");
};


  const sendMessage = () => {
    if (!message.trim()) return;

    setChatHistory((prev) => [...prev, { sender: "user", text: message }]);

    handleRequest("chat", (data) => {
      setChatHistory((prev) => [...prev, { sender: "bot", text: data.reply }]);
      setChatMode(data.mode || "unknown");
      if (data.note) setError(data.note);
    });

    setMessage("");
  };

  const checkApiStatus = () =>
    handleRequest("chat-test", setApiStatus, (data) =>
      setChatMode(data.demo_mode ? "demo" : "openai")
    );

  const modeColors = {
    openai: "bg-green-500 text-white",
    gemini: "bg-blue-500 text-white",
    demo: "bg-yellow-500 text-black",
    demo_quota_exceeded: "bg-red-500 text-white",
    default: "bg-gray-500 text-white",
  };
  const modeTexts = {
    openai: "OpenAI Active",
    gemini: "Gemini Active",
    demo: "Demo Mode",
    demo_quota_exceeded: "Quota Exceeded - Demo Mode",
    demo_invalid_key: "Invalid Key - Demo Mode",
    demo_error: "API Error - Demo Mode",
    default: "Unknown Mode",
  };
  const getModeClass = (mode) => modeColors[mode] || modeColors.default;
  const getModeText = (mode) => modeTexts[mode] || modeTexts.default;

  // ---------------- Data Analysis ----------------
  // const analyzeData = async () => {
  //   setLoading(true);
  //   setError("");
  //   try {
  //     const res = await axios.get("http://localhost:3001/sales-sample");
  //     const data = res.data;

  //     // Aggregate sales by category, brand, region
  //     const aggregate = (key) =>
  //       Object.values(
  //         data.reduce((acc, row) => {
  //           if (!acc[row[key]]) acc[row[key]] = { name: row[key], sales_amount: 0 };
  //           acc[row[key]].sales_amount += row.sales_amount;
  //           return acc;
  //         }, {})
  //       ).sort((a, b) => b.sales_amount - a.sales_amount); // Sort by highest sales

  //     setAnalysisData({
  //       totalSales: data.reduce((sum, r) => sum + r.sales_amount, 0),
  //       totalProfit: data.reduce((sum, r) => sum + r.profit, 0),
  //       salesByCategory: aggregate("category"),
  //       salesByBrand: aggregate("brand"),
  //       salesByRegion: aggregate("region"),
  //     });
  //   } catch (err) {
  //     console.error(err);
  //     setError("Failed to fetch sales data for analysis");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const analyzeData = async () => {
    setLoading(true);
    try {
      const [
        salesRes,
        topProductsRes,
        categoryRes,
        regionRes,
        customerRes,
      ] = await Promise.all([
        axios.get("http://localhost:3001/sales-trend"),
        axios.get("http://localhost:3001/top-products"),
        axios.get("http://localhost:3001/category-profit"),
        axios.get("http://localhost:3001/region-sales"),
        axios.get("http://localhost:3001/customer-segment"),
      ]);

      // ✅ สรุปยอดรวมจาก sales-trend
      const totalSales = salesRes.data.reduce(
        (sum, r) => sum + Number(r.sales_amount || 0),
        0
      );
      const totalProfit = salesRes.data.reduce(
        (sum, r) => sum + Number(r.profit || 0),
        0
      );

      // ✅ แปลงข้อมูลจาก endpoint ให้ match UI เดิม
      setAnalysisData({
        totalSales,
        totalProfit,

        // ✅ Category → ใช้ total_sales
        salesByCategory: categoryRes.data.map((c) => ({
          name: c.category,
          sales_amount: Number(c.total_sales || c.sales_amount || 0),
        })),

        // ✅ Top Products → ใช้ sales_amount
        salesByBrand: topProductsRes.data.map((p) => ({
          name: p.product_name,
          sales_amount: Number(p.sales_amount || p.total_sales || 0),
        })),

        // ✅ Region → ใช้ total_sales
        salesByRegion: regionRes.data.map((r) => ({
          name: r.region,
          sales_amount: Number(r.total_sales || r.sales_amount || 0),
        })),

        raw: {
          salesData: salesRes.data,
          customerData: customerRes.data,
        },
      });

    } catch (err) {
      console.error("Error fetching analysis data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    analyzeData();
  }, []);

  // ----------------- Predefined Questions -----------------
  const quickQuestions = [
    "สรุปยอดขายรายเดือน",
    "แบรนด์ไหนขายดีที่สุด",
    "หมวดหมู่สินค้าที่ทำกำไรสูงสุด",
    "ลูกค้ากลุ่มไหนสร้างรายได้มากที่สุด",
    "ภูมิภาคไหนมียอดขายสูงสุด",
    "สินค้าใดควรโปรโมทเพิ่ม",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 w-full p-6 m-5">
      <div className="flex flex-row items-center mb-5">
        <div className="w-1/2">
          <h2 className="text-2xl font-bold mb-4">Data Warehouse Chat Interface</h2>

          {/* Status */}
          <div className="flex justify-between items-center p-3 mb-3 bg-gray-100 border-2 rounded-lg">
            <div className="flex items-center space-x-2">
              <strong>Status: </strong>
              <span className={`px-2 py-1 rounded text-xs ${getModeClass(chatMode)}`}>
                {getModeText(chatMode)}
              </span>
            </div>
            <button
              onClick={checkApiStatus}
              className="px-3 py-1 text-sm rounded bg-blue-500 text-white hover:bg-blue-600"
            >
              Refresh Status
            </button>
          </div>

          {/* Select Mode */}
          <div className="mb-3">
            <label className="mr-2 text-sm font-medium">Select Mode:</label>
            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="gemini">Gemini</option>
              <option value="gpt">GPT</option>
              <option value="demo">Demo</option>
            </select>
          </div>

          {/* Chat Box */}
          {/* Chat Box */}
          {/* <div
            className="flex-1 flex flex-col min-h-[500px] max-h-[500px] max-w-full bg-gray-100 border rounded p-3
                      overflow-y-auto overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200"
          >
            {chatHistory.map((chat, idx) => (
              <div
                key={idx}
                className={`mb-2 p-2 rounded max-w-[80%] break-words
                            ${chat.sender === "user" ? "bg-blue-500 text-white self-end" : "bg-gray-300 text-black self-start"}`}
              >
                <div className="whitespace-pre-wrap">
                  <ReactMarkdown>{chat.text}</ReactMarkdown>
                </div>
              </div>
            ))}
            <div ref={chatEndRef}></div>
          </div> */}
          <div className="flex-1 flex flex-col min-h-[500px] max-h-[500px] max-w-full bg-gray-100 border rounded p-3
          overflow-y-auto overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
          {chatHistory.map((chat, idx) => (
            <div
              key={idx}
              className={`mb-2 p-2 rounded max-w-[80%] break-words
                          ${chat.sender === "user" ? "bg-blue-500 text-white self-end" : "bg-gray-300 text-black self-start"}`}
            >
              <div className="whitespace-pre-wrap">
                {chat.sender === "user" ? (
                  // แสดงแค่ข้อความคำถามของผู้ใช้
                  chat.text.split("\n")[0] // เอาเฉพาะบรรทัดแรก (คำถาม)
                ) : (
                  // ฝั่ง AI ยังแสดง Markdown
                  <ReactMarkdown>{chat.text}</ReactMarkdown>
                )}
              </div>
            </div>
          ))}
          <div ref={chatEndRef}></div>
        </div>


          <div className="p-5 bg-white border rounded mb-3">
            {/* Input */}
            <div className="flex mb-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  chatMode === "demo"
                    ? "Try: Hello, how are you, weather..."
                    : "Ask me anything..."
                }
                onKeyDown={(e) => e.key === "Enter" && !loading && sendMessage()}
                className="flex-1 p-3 border rounded mr-2 text-sm"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !message.trim()}
                className={`px-6 py-3 text-sm rounded text-white ${
                  loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {loading ? "Sending..." : "Send"}
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 mt-2 rounded text-sm bg-red-100 border border-red-300 text-red-700">
                <strong>Error:</strong> {error}
              </div>
            )}
            {/* Action Buttons */}
            <div className="flex space-x-2 mb-3">
              <button
                onClick={analyzeData}
                disabled={loading}
                className={`px-5 py-2 rounded text-white ${
                  loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
                }`}
              >
                Analyze Sales Data
              </button>
              <button
                onClick={() => sendDataToChat(analysisData, "คุณสามารถให้รายงานสรุปข้อมูลการขายที่ครอบคลุมแก่ฉันได้หรือไม่?")}
                disabled={loading || !analysisData}
                className={`px-5 py-2 rounded text-white ${
                  loading || !analysisData ? "bg-gray-400 cursor-not-allowed" : "bg-purple-500 hover:bg-purple-600"
                }`}
              >
                Ask AI to Summarize Analysis
              </button>

              {/* Quick Questions */}
              <div className="flex flex-wrap gap-2 mb-3">
                {quickQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (!analysisData) {
                        setError("กรุณากด 'Analyze Sales Data' ก่อนใช้งานคำถามนี้");
                        return;
                      }
                      // ส่งไปให้ AI พร้อมสรุปจาก analysisData
                      sendDataToChat(analysisData, q);
                    }}
                    className="px-3 py-2 rounded text-sm bg-gray-200 hover:bg-gray-300"
                  >
                    {q}
                  </button>
                ))}
              </div>


            </div>
          </div>
        </div>

        <div className="w-1/2 pl-5">
          {/* Analysis Results */}
          {analysisData ? (
            <div className="p-3 bg-white min-h-[450px] border rounded overflow-x-auto">
              <h3 className="font-semibold mb-2">Sales Summary</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-2 bg-blue-50 rounded">
                  <p className="text-sm text-gray-600">Total Sales</p>
                  <p className="text-xl font-bold text-blue-600">
                    ${analysisData.totalSales.toFixed(2)}
                  </p>
                </div>
                <div className="p-2 bg-green-50 rounded">
                  <p className="text-sm text-gray-600">Total Profit</p>
                  <p className="text-xl font-bold text-green-600">
                    ${analysisData.totalProfit.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Sales by Category */}
              <div className="my-4 p-4 bg-white rounded border">
                <h4 className="font-semibold mb-2">Sales by Category</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={analysisData.salesByCategory}
                      dataKey="sales_amount"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      fill="#3b82f6"
                      label
                    />
                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Sales by Brand */}
              <div className="my-4">
                <h4 className="font-semibold mb-2">Sales by Brand</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={analysisData.salesByBrand}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sales_amount" fill="#8884d8" />
                  </BarChart>

                </ResponsiveContainer>
              </div>

              {/* Sales by Region */}
              <div className="my-4">
                <h4 className="font-semibold mb-2">Sales by Region</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={analysisData.salesByRegion}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sales_amount" fill="#8884d8" />
                  </BarChart>

                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-white min-h-[450px] border rounded flex items-center justify-center text-gray-400">
              No analysis data yet. Click "Analyze Sales Data" to generate.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Chat;