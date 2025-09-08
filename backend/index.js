const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const { createClient } = require("@clickhouse/client");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors({
  origin: ["http://localhost:3000"] // React dev server
}));
app.use(express.json());
const PORT = process.env.PORT || 3001;

// PostgreSQL
const pgPool = new Pool({
  user: process.env.POSTGRES_USER || "dicek",
  host: process.env.POSTGRES_HOST || "postgres",
  database: process.env.POSTGRES_DB || "mydb",
  password: process.env.POSTGRES_PASSWORD || "2546",
  port: 5432,
});

// ClickHouse
const clickhouseHost = process.env.CLICKHOUSE_HOST || "clickhouse";
const chClient = createClient({
  host: `http://${clickhouseHost}:8123`,
  username: "default",
  password: "2546",
  database: "default",
});

// Function: migrate PostgreSQL → ClickHouse
async function migrateSales(batchSize = 1000) {
  let offset = 0;

  while (true) {
    const pgResult = await pgPool.query(
      `SELECT * FROM sales_data ORDER BY product_id LIMIT ${batchSize} OFFSET ${offset}`
    );

    if (pgResult.rows.length === 0) break;

    try {
      // Transform data before inserting - convert dates to proper format
      const transformedData = pgResult.rows.map((row) => ({
        ...row,
        date:
          row.date instanceof Date
            ? row.date.toISOString().split("T")[0]
            : typeof row.date === "string"
            ? row.date.split("T")[0]
            : row.date,
      }));

      await chClient.insert({
        table: "sales_data",
        values: transformedData,
        format: "JSONEachRow",
      }); 

      console.log(`Inserted ${pgResult.rows.length} rows (offset: ${offset})`);
    } catch (err) {
      console.error("ClickHouse insert error:", err);
      console.error(
        "Sample data:",
        JSON.stringify(pgResult.rows.slice(0, 2), null, 2)
      );
    }

    offset += batchSize;
  }

  console.log("Migration finished!");
}

// Run auto-sync on startup
migrateSales().catch(console.error);

// API: fetch from PostgreSQL
app.get("/users", async (req, res) => {
  try {
    const result = await pgPool.query("SELECT * FROM sales_data LIMIT 10");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// API: fetch from ClickHouse
app.get("/sales-sample", async (req, res) => {
  try {
    const result = await chClient.query({
      // query: "SELECT * FROM sales LIMIT 2500",
      query: "SELECT * FROM sales_data LIMIT 2500",
      format: "JSONEachRow",
    });

    const data = await result.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Initialize Gemini only when needed
let gemini = null;
const initializeGemini = () => {
  if (!gemini && process.env.GOOGLE_API_KEY) {
    gemini = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  }
  return gemini;
};


// Demo responses for when OpenAI is not available
const getDemoResponse = (message) => {
  const responses = [
    `You asked about: "${message}". This is a demo response since OpenAI API is not available.`,
    `Interesting question about "${message}". I'm running in demo mode right now.`,
    `Thanks for your message: "${message}". Please add OpenAI credits for full AI responses.`,
    `I see you mentioned: "${message}". This is a fallback response while OpenAI is unavailable.`
  ];
  
  // Simple keyword-based responses
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('สวัสดี')) {
    return 'Hello! I\'m currently running in demo mode. How can I help you today?';
  }
  if (lowerMessage.includes('how are you')) {
    return 'I\'m doing well, thank you! I\'m running in demo mode right now.';
  }
  if (lowerMessage.includes('weather')) {
    return 'I can\'t check the weather in demo mode, but I hope it\'s nice where you are!';
  }
  
  return responses[Math.floor(Math.random() * responses.length)];
};


// Replace your /chat route with this improved version
app.post("/chat", async (req, res) => {
  try {
    const { message, mode } = req.body;
    
    // Better validation
    if (!message) {
      return res.status(400).json({ 
        error: "Message is required",
        details: "Request body must include a 'message' field"
      });
    }
    
    if (typeof message !== 'string') {
      return res.status(400).json({ 
        error: "Message must be a string",
        details: "Received message type: " + typeof message
      });
    }
    
    if (message.trim() === "") {
      return res.status(400).json({ 
        error: "Message cannot be empty",
        details: "Message content cannot be only whitespace"
      });
    }

    // Log the incoming request for debugging
    console.log(`Chat request - Mode: ${mode}, Message length: ${message.length}`);

    // --- Select mode based on client request ---
    if (mode === "gemini") {
      const geminiClient = initializeGemini();
      if (geminiClient) {
        try {
          const model = geminiClient.getGenerativeModel({ model: "gemini-2.0-flash" });
          const result = await model.generateContent(message);
          const text = result.response.candidates[0]?.content?.parts[0]?.text || "No response";
          return res.json({ reply: text, mode: "gemini" });
        } catch (err) {
          console.error("Gemini Error:", err.message);
          // Don't return here, let it fall through to demo mode
        }
      }
    }

    if (mode === "gpt") {
      try {
        const OpenAI = require("openai");
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        
        if (process.env.OPENAI_API_KEY) {
          const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: message }],
            max_tokens: 150,
          });
          const reply = response.choices[0].message.content;
          return res.json({ reply, mode: "openai" });
        }
      } catch (err) {
        console.error("OpenAI Error:", err.message);
        // Don't return here, let it fall through to demo mode
      }
    }

    // Fallback to demo mode
    const demoResponse = getDemoResponse(message);
    return res.json({
      reply: demoResponse,
      mode: "demo",
      note: "Running in demo mode (no valid API key or mode error)"
    });

  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ 
      error: "Internal server error",
      details: error.message 
    });
  }
});



// app.get("/chat-test", (req, res) => {
//   const hasApiKey = !!process.env.OPENAI_API_KEY;
//   res.json({ 
//     message: "Chat API is working! Use POST /chat with JSON { message }",
//     openai_configured: hasApiKey,
//     openai_key_length: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0,
//     status: hasApiKey ? "ready" : "demo_mode",
//     demo_mode: !hasApiKey
//   });
// });

app.get("/chat-test", (req, res) => {
  res.json({
    message: "Chat API is working! Use POST /chat with JSON { message }",
    gemini_configured: !!process.env.GOOGLE_API_KEY,
    openai_configured: !!process.env.OPENAI_API_KEY,
    status: process.env.GOOGLE_API_KEY ? "gemini_ready" : (process.env.OPENAI_API_KEY ? "openai_ready" : "demo_mode")
  });
});

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    // Test database connections
    const pgTest = await pgPool.query("SELECT 1");
    const chTest = await chClient.query({ query: "SELECT 1", format: "JSONEachRow" });
    
    res.json({
      status: "healthy",
      services: {
        postgresql: "connected",
        clickhouse: "connected",
        openai: !!process.env.OPENAI_API_KEY ? "configured" : "demo_mode"
      },
      migration_status: "completed"
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      error: error.message
    });
  }
});

// Analytics endpoint - show data from both databases
app.get("/analytics", async (req, res) => {
  try {
    // Get count from PostgreSQL
    const pgCount = await pgPool.query("SELECT COUNT(*) as count FROM sales");
    
    // Get count from ClickHouse
    const chResult = await chClient.query({
      query: "SELECT COUNT(*) as count FROM sales",
      format: "JSONEachRow",
    });
    const chData = await chResult.json();
    
    // Get sample data from ClickHouse
    const sampleResult = await chClient.query({
      query: "SELECT * FROM sales ORDER BY id LIMIT 5",
      format: "JSONEachRow",
    });
    const sampleData = await sampleResult.json();

    res.json({
      postgresql_count: parseInt(pgCount.rows[0].count),
      clickhouse_count: parseInt(chData[0].count),
      sample_data: sampleData,
      migration_successful: pgCount.rows[0].count === chData[0].count.toString()
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// app.listen(PORT, () => {
//   console.log(`Backend running on port ${PORT}`);
//   console.log(`Environment info:`);
//   console.log(`- NODE_ENV: ${process.env.NODE_ENV}`);
//   console.log(`- POSTGRES_HOST: ${process.env.POSTGRES_HOST}`);
//   console.log(`- CLICKHOUSE_HOST: ${process.env.CLICKHOUSE_HOST}`);
//   console.log(`- OpenAI configured: ${!!process.env.OPENAI_API_KEY}`);
//   console.log(`- OpenAI key length: ${process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0}`);
  
//   if (!process.env.OPENAI_API_KEY) {
//     console.log('Note: Running in demo mode. Add OPENAI_API_KEY to .env for AI responses');
//   }
// });

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
  console.log(`- Gemini configured: ${!!process.env.GOOGLE_API_KEY}`);
  console.log(`- OpenAI configured: ${!!process.env.OPENAI_API_KEY}`);
  if (!process.env.GOOGLE_API_KEY && !process.env.OPENAI_API_KEY) {
    console.log('Note: Running in DEMO mode. Add an API key to your .env file.');
  }
});