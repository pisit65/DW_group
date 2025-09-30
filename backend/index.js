const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const { createClient } = require("@clickhouse/client");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Server } = require("socket.io");
const http = require("http");
const { faker } = require("@faker-js/faker");
const cron = require('node-cron');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: ["http://localhost:3000", "http://localhost:5000", "http://192.168.1.155:51251", "http://192.168.1.155:51251", "http://localhost:51251"] }
});

app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5000", "http://192.168.1.155:51251", "http://192.168.1.155:51251", "http://localhost:51251"]
}));

app.use(express.json());
const PORT = process.env.PORT || 3001;

const pgPool = new Pool({
  user: process.env.POSTGRES_USER || "dicek",
  host: process.env.POSTGRES_HOST || "postgres",
  database: process.env.POSTGRES_DB || "mydb",
  password: process.env.POSTGRES_PASSWORD || "2546",
  port: 5432,
});

const clickhouseHost = process.env.CLICKHOUSE_HOST || "clickhouse";
const chClient = createClient({
  host: `http://${clickhouseHost}:8123`,
  username: "default",
  password: "2546",
  database: "default",
});

const provincesByRegion = {
  North: ["เชียงใหม่", "เชียงราย", "ลำพูน", "ลำปาง", "แพร่", "น่าน", "พะเยา", "แม่ฮ่องสอน", "อุตรดิตถ์", "พิษณุโลก", "พิจิตร", "กำแพงเพชร", "สุโขทัย", "ตาก"],
  Northeast: ["ขอนแก่น", "กาฬสินธุ์", "มหาสารคาม", "ร้อยเอ็ด", "นครราชสีมา", "ชัยภูมิ", "บุรีรัมย์", "สุรินทร์", "ศรีสะเกษ", "อุบลราชธานี", "ยโสธร", "อำนาจเจริญ", "นครพนม", "สกลนคร", "มุกดาหาร", "บึงกาฬ", "หนองคาย", "หนองบัวลำภู", "เลย"],
  Central: ["กรุงเทพมหานคร", "นครปฐม", "นนทบุรี", "ปทุมธานี", "พระนครศรีอยุธยา", "อ่างทอง", "ลพบุรี", "สิงห์บุรี", "สระบุรี", "ชัยนาท", "เพชรบูรณ์"],
  West: ["กาญจนบุรี", "ราชบุรี", "เพชรบุรี", "ประจวบคีรีขันธ์"],
  East: ["ชลบุรี", "ระยอง", "จันทบุรี", "ตราด", "ฉะเชิงเทรา", "ปราจีนบุรี", "สระแก้ว"],
  South: ["ภูเก็ต", "กระบี่", "พังงา", "สุราษฎร์ธานี", "ชุมพร", "ระนอง", "นครศรีธรรมราช", "ตรัง", "พัทลุง", "สงขลา", "สตูล", "ปัตตานี", "ยะลา", "นราธิวาส"]
};

function generateSalesRecord(id) {
  const productId = faker.helpers.replaceSymbols("?????").toUpperCase();
  const customerId = faker.helpers.replaceSymbols("?????").toUpperCase();
  const selectedRegion = faker.helpers.arrayElement(Object.keys(provincesByRegion));
  const possibleStores = provincesByRegion[selectedRegion];
  const selectedStore = faker.helpers.arrayElement(possibleStores);

  return {
    id,
    date: faker.date.between('2020-01-01', '2025-09-30').toISOString().split("T")[0],
    product_id: productId,
    product_name: faker.commerce.productName(),
    category: faker.commerce.department(),
    brand: faker.company.name(),
    customer_id: customerId,
    customer_name: faker.name.findName(),
    gender: faker.helpers.arrayElement(["Male", "Female"]),
    region: selectedRegion,
    store_id: faker.helpers.replaceSymbols("?????").toUpperCase(),
    store_name: faker.company.name(),
    store_city: selectedStore,
    quantity: faker.datatype.number({ min: 1, max: 20 }),
    unit_price: Number(faker.commerce.price(10, 500, 2)),
    discount: faker.datatype.float({ min: 0, max: 0.3, precision: 0.01 }),
    sales_amount: 0,
    profit: 0,
  };
}

app.get("/gendata", async (req, res) => {
  const count = parseInt(req.query.count) || 5;
  const records = Array.from({ length: count }, (_, i) => {
    const rec = generateSalesRecord(i + 1);
    rec.sales_amount = Number((rec.quantity * rec.unit_price * (1 - rec.discount)).toFixed(2));
    rec.profit = Number((rec.sales_amount * 0.2).toFixed(2));
    if (isNaN(rec.sales_amount) || isNaN(rec.profit)) {
      console.warn("Generated NaN value, skipping record:", rec);
      return null;
    }
    return rec;
  }).filter(Boolean);

  try {
    for (const r of records) {
      await pgPool.query(
        `INSERT INTO public.sales_data (date, product_id, product_name, category, brand, customer_id, customer_name, gender, region, store_id, store_name, store_city, quantity, unit_price, discount, sales_amount, profit) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
        [r.date, r.product_id, r.product_name, r.category, r.brand, r.customer_id, r.customer_name, r.gender, r.region, r.store_id, r.store_name, r.store_city, r.quantity, r.unit_price, r.discount, r.sales_amount, r.profit]
      );
    }
    res.json({ success: true, inserted: records.length });
  } catch (err) {
    console.error("Insert error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

async function migrateSales(batchSize = 10000) {
  let offset = 0;
  while (true) {
    const pgResult = await pgPool.query(
      `SELECT * FROM sales_data ORDER BY id LIMIT ${batchSize} OFFSET ${offset}`
    );
    if (pgResult.rows.length === 0) break;
    try {
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
        table: "sales_data_ch",
        values: transformedData,
        format: "JSONEachRow",
      });
      console.log(`Inserted ${pgResult.rows.length} rows (offset: ${offset})`);
    } catch (err) {
      console.error("ClickHouse insert error:", err);
    }
    offset += batchSize;
  }
  console.log("Migration finished!");
}

migrateSales().catch(console.error);

async function updateDailySummary() {
    try {
        await chClient.command({
            query: `ALTER TABLE sales_summary_daily DELETE WHERE date = today()`
        });
        await chClient.command({
            query: `
              INSERT INTO sales_summary_daily
              SELECT
                date,
                SUM(quantity) AS total_qty,
                SUM(sales_amount) AS total_sales,
                SUM(profit) AS total_profit,
                AVG(discount) AS avg_discount
              FROM sales_data_ch
              GROUP BY date
            `
        });
    } catch (e) {
        // Ignore if table does not exist yet etc.
    }
}

async function dailySummaryMiddleware(req, res, next) {
  try {
    await updateDailySummary();
    next();
  } catch (err) {
    console.error("Error updating daily summary:", err);
    res.status(500).json({ error: err.message });
  }
}

// **แก้ไขชื่อตารางทั้งหมดในทุก Endpoint ให้ถูกต้อง**
const CLICKHOUSE_TABLE = 'sales_data_pg';
app.get("/sales-trend", dailySummaryMiddleware, async (req, res) => {
  const range = req.query.range || 'daily';
  let groupBy;

  switch (range) {
    case 'weekly': groupBy = "toStartOfWeek(date)"; break;
    case 'monthly': groupBy = "toStartOfMonth(date)"; break;
    case 'yearly': groupBy = "toStartOfYear(date)"; break;
    default: groupBy = "date";
  }

  try {
    const result = await chClient.query({
      query: `
        SELECT ${groupBy} as period,
               SUM(sales_amount) as sales_amount,
               SUM(profit) as profit,
               AVG(discount) as discount
        FROM ${CLICKHOUSE_TABLE}
        GROUP BY period
        ORDER BY period DESC
        LIMIT 30
      `,
      format: "JSONEachRow"
    });
    const data = await result.json();
    res.json(data.reverse());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/pd/customer-segment", async (req, res) => {
    const range = req.query.range || 'daily';
    let groupBy;
    let whereClause;

    switch (range) {
        case 'weekly':
            groupBy = "toStartOfWeek(date)";
            whereClause = `WHERE toStartOfWeek(date) = toStartOfWeek(now())`;
            break;
        case 'monthly':
            groupBy = "toStartOfMonth(date)";
            whereClause = `WHERE toStartOfMonth(date) = toStartOfMonth(now())`;
            break;
        case 'yearly':
            groupBy = "toStartOfYear(date)";
            whereClause = `WHERE toStartOfYear(date) = toStartOfYear(now())`;
            break;
        default:
            groupBy = "date";
            whereClause = `WHERE date = toDate(now())`;
    }

    try {
        const result = await chClient.query({
            query: `
              SELECT
                ${groupBy} as period,
                gender,
                COUNT(DISTINCT customer_id) as customers,
                SUM(sales_amount) as total_sales,
                AVG(sales_amount) as avg_order
              FROM ${CLICKHOUSE_TABLE}
              ${whereClause}
              GROUP BY ${groupBy}, gender
              ORDER BY period DESC
            `,
            format: "JSONEachRow"
        });
        const data = await result.json();
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.get("/top-products", dailySummaryMiddleware, async (req, res) => {
  try {
    const result = await chClient.query({
      query: `
        SELECT product_name, SUM(sales_amount) as total_sales, SUM(quantity) as total_qty
        FROM ${CLICKHOUSE_TABLE}
        GROUP BY product_name
        ORDER BY total_sales DESC
        LIMIT 10
      `,
      format: "JSONEachRow"
    });
    res.json(await result.json());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/category-profit", dailySummaryMiddleware, async (req, res) => {
  try {
    const result = await chClient.query({
      query: `
        SELECT
          category,
          SUM(profit) as total_profit,
          SUM(sales_amount) as total_sales  
        FROM ${CLICKHOUSE_TABLE}
        GROUP BY category
        ORDER BY total_sales DESC
      `,
      format: "JSONEachRow"
    });
    res.json(await result.json());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/region-sales", dailySummaryMiddleware, async (req, res) => {
  try {
    const result = await chClient.query({
      query: `
        SELECT region, store_city, SUM(sales_amount) as total_sales, COUNT(DISTINCT customer_id) as customers
        FROM ${CLICKHOUSE_TABLE}
        GROUP BY region, store_city
        ORDER BY total_sales DESC
      `,
      format: "JSONEachRow"
    });
    res.json(await result.json());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


app.get("/customer-segment", dailySummaryMiddleware, async (req, res) => {
  try {
    const result = await chClient.query({
      query: `
        SELECT gender, COUNT(DISTINCT customer_id) as customers, SUM(sales_amount) as total_sales, AVG(sales_amount) as avg_order
        FROM ${CLICKHOUSE_TABLE}
        GROUP BY gender
      `,
      format: "JSONEachRow"
    });
    res.json(await result.json());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});





// Socket.IO
io.on("connection", (socket) => {
  console.log("✅ Client connected:", socket.id);

  // ส่งข้อมูล sales ทันทีเมื่อ connect
  sendSalesData(socket);

  // disconnect
  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// ฟังก์ชันดึงข้อมูลจาก ClickHouse แล้ว push ผ่าน socket
async function sendSalesData(socket) {
  try {
    const result = await chClient.query({
      query: "SELECT * FROM sales_data_ch ORDER BY id DESC LIMIT 5;",
      format: "JSONEachRow",
    });
    const data = await result.json();
    socket.emit("sales_update", data);
  } catch (err) {
    console.error("ClickHouse error:", err);
  }
}


async function broadcastSales() {
  try {
    const [result1, result2] = await Promise.all([
      chClient.query({ query: "SELECT * FROM sales_data_ch ORDER BY id DESC LIMIT 5;", format: "JSONEachRow" }),
      chClient.query({ query: "SELECT * FROM sales_summary_daily ORDER BY date DESC LIMIT 5;", format: "JSONEachRow" })
    ]);

    const data1 = await result1.json();
    const data2 = await result2.json();

    io.emit("sales_update", data1);
    io.emit("sales_day", data2);
  } catch (err) {
    console.error("Broadcast error:", err);
  } finally {
    setTimeout(broadcastSales, 5000); // เรียกตัวเองต่อ
  }
}




// Initialize Gemini only when needed
let gemini = null;
const initializeGemini = () => {
  if (!gemini && process.env.GOOGLE_API_KEY) {
    gemini = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  }
  return gemini;
};
// เริ่ม broadcast
broadcastSales();


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


// // Replace your /chat route with this improved version
// app.post("/chat", async (req, res) => {
//   try {
//     const { message, mode } = req.body;
    
//     // Better validation
//     if (!message) {
//       return res.status(400).json({ 
//         error: "Message is required",
//         details: "Request body must include a 'message' field"
//       });
//     }
    
//     if (typeof message !== 'string') {
//       return res.status(400).json({ 
//         error: "Message must be a string",
//         details: "Received message type: " + typeof message
//       });
//     }
    
//     if (message.trim() === "") {
//       return res.status(400).json({ 
//         error: "Message cannot be empty",
//         details: "Message content cannot be only whitespace"
//       });
//     }

//     // Log the incoming request for debugging
//     console.log(`Chat request - Mode: ${mode}, Message length: ${message.length}`);

//     // --- Select mode based on client request ---
//     if (mode === "gemini") {
//       const geminiClient = initializeGemini();
//       if (geminiClient) {
//         try {
//           const model = geminiClient.getGenerativeModel({ model: "gemini-2.0-flash" });
//           const result = await model.generateContent(message);
//           const text = result.response.candidates[0]?.content?.parts[0]?.text || "No response";
//           return res.json({ reply: text, mode: "gemini" });
//         } catch (err) {
//           console.error("Gemini Error:", err.message);
//           // Don't return here, let it fall through to demo mode
//         }
//       }
//     }

//     if (mode === "gpt") {
//       try {
//         const OpenAI = require("openai");
//         const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        
//         if (process.env.OPENAI_API_KEY) {
//           const response = await openai.chat.completions.create({
//             model: "gpt-4o-mini",
//             messages: [{ role: "user", content: message }],
//             max_tokens: 150,
//           });
//           const reply = response.choices[0].message.content;
//           return res.json({ reply, mode: "openai" });
//         }
//       } catch (err) {
//         console.error("OpenAI Error:", err.message);
//         // Don't return here, let it fall through to demo mode
//       }
//     }

//     // Fallback to demo mode
//     const demoResponse = getDemoResponse(message);
//     return res.json({
//       reply: demoResponse,
//       mode: "demo",
//       note: "Running in demo mode (no valid API key or mode error)"
//     });

//   } catch (error) {
//     console.error("Chat Error:", error);
//     res.status(500).json({ 
//       error: "Internal server error",
//       details: error.message 
//     });
//   }
// });


// เพิ่มในส่วนบนของไฟล์ backend
const conversationMemory = new Map(); // เก็บประวัติการสนทนาแต่ละ session

// ฟังก์ชันสำหรับสร้าง session ID
function generateSessionId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ฟังก์ชันจัดการประวัติการสนทนา
function getConversationHistory(sessionId) {
  if (!conversationMemory.has(sessionId)) {
    conversationMemory.set(sessionId, []);
  }
  return conversationMemory.get(sessionId);
}

function addToConversationHistory(sessionId, role, content) {
  const history = getConversationHistory(sessionId);
  history.push({ role, content, timestamp: new Date() });
  
  // จำกัดประวัติไว้แค่ 20 ข้อความล่าสุด (เพื่อไม่ให้ token เกิน)
  if (history.length > 20) {
    history.shift();
  }
}

function clearOldSessions() {
  const now = Date.now();
  const ONE_HOUR = 60 * 60 * 1000;
  
  for (const [sessionId, history] of conversationMemory.entries()) {
    const lastMessage = history[history.length - 1];
    if (lastMessage && now - new Date(lastMessage.timestamp).getTime() > ONE_HOUR) {
      conversationMemory.delete(sessionId);
    }
  }
}

// ล้าง session เก่าทุก 30 นาที
setInterval(clearOldSessions, 30 * 60 * 1000);

// API endpoint สำหรับสร้าง session ใหม่
app.post("/chat/session", (req, res) => {
  const sessionId = generateSessionId();
  res.json({ sessionId });
});

// API endpoint สำหรับล้างประวัติ session
app.delete("/chat/session/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  conversationMemory.delete(sessionId);
  res.json({ success: true, message: "Session cleared" });
});

// แก้ไข endpoint /chat เพื่อรองรับ conversation history
app.post("/chat", async (req, res) => {
  try {
    const { message, mode, sessionId } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        error: "Message is required",
        details: "Request body must include a 'message' field"
      });
    }
    
    if (typeof message !== 'string' || message.trim() === "") {
      return res.status(400).json({ 
        error: "Message must be a non-empty string"
      });
    }

    // ถ้าไม่มี sessionId ให้สร้างใหม่
    const currentSessionId = sessionId || generateSessionId();
    
    // เพิ่มข้อความของ user เข้าประวัติ
    addToConversationHistory(currentSessionId, "user", message);
    
    // ดึงประวัติการสนทนาทั้งหมด
    const history = getConversationHistory(currentSessionId);

    console.log(`Chat request - Session: ${currentSessionId}, Mode: ${mode}, Message length: ${message.length}`);

    // --- Gemini Mode with Conversation History ---
    if (mode === "gemini") {
      const geminiClient = initializeGemini();
      if (geminiClient) {
        try {
          const model = geminiClient.getGenerativeModel({ model: "gemini-2.0-flash" });
          
          // สร้าง chat session พร้อมประวัติ
          const chat = model.startChat({
            history: history.slice(0, -1).map(h => ({
              role: h.role === "user" ? "user" : "model",
              parts: [{ text: h.content }]
            })),
            generationConfig: {
              maxOutputTokens: 500,
            },
          });
          
          const result = await chat.sendMessage(message);
          const text = result.response.text() || "No response";
          
          // เพิ่มคำตอบของ AI เข้าประวัติ
          addToConversationHistory(currentSessionId, "assistant", text);
          
          return res.json({ 
            reply: text, 
            mode: "gemini",
            sessionId: currentSessionId 
          });
        } catch (err) {
          console.error("Gemini Error:", err.message);
        }
      }
    }

    // --- GPT Mode with Conversation History ---
    if (mode === "gpt") {
      try {
        const OpenAI = require("openai");
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        
        if (process.env.OPENAI_API_KEY) {
          // แปลงประวัติเป็นรูปแบบของ OpenAI
          const messages = history.map(h => ({
            role: h.role === "assistant" ? "assistant" : "user",
            content: h.content
          }));

          const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: messages,
            max_tokens: 500,
          });
          
          const reply = response.choices[0].message.content;
          
          // เพิ่มคำตอบของ AI เข้าประวัติ
          addToConversationHistory(currentSessionId, "assistant", reply);
          
          return res.json({ 
            reply, 
            mode: "openai",
            sessionId: currentSessionId 
          });
        }
      } catch (err) {
        console.error("OpenAI Error:", err.message);
      }
    }

    // Fallback to demo mode
    const demoResponse = getDemoResponse(message);
    addToConversationHistory(currentSessionId, "assistant", demoResponse);
    
    return res.json({
      reply: demoResponse,
      mode: "demo",
      sessionId: currentSessionId,
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

// API endpoint สำหรับดูประวัติการสนทนา
app.get("/chat/history/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  const history = getConversationHistory(sessionId);
  res.json({ 
    sessionId, 
    history,
    messageCount: history.length 
  });
});



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

// app.listen(PORT, () => {
//   console.log(`Backend running on port ${PORT}`);
//   console.log(`- Gemini configured: ${!!process.env.GOOGLE_API_KEY}`);
//   console.log(`- OpenAI configured: ${!!process.env.OPENAI_API_KEY}`);
//   if (!process.env.GOOGLE_API_KEY && !process.env.OPENAI_API_KEY) {
//     console.log('Note: Running in DEMO mode. Add an API key to your .env file.');
//   }
// });

server.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
  console.log(`- Gemini configured: ${!!process.env.GOOGLE_API_KEY}`);
  console.log(`- OpenAI configured: ${!!process.env.OPENAI_API_KEY}`);
  if (!process.env.GOOGLE_API_KEY && !process.env.OPENAI_API_KEY) {
    console.log("Note: Running in DEMO mode. Add an API key to your .env file.");
  }
});