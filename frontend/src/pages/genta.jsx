import React, { useState, useRef } from "react";
import axios from "axios";

const Genta = () => {
  const [data, setData] = useState([]);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:3001/gendata");
      setData((prev) => [...prev, response.data]); // เก็บเพิ่มเรื่อย ๆ
      console.log("Fetched:", response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const startLoop = () => {
    if (!running) {
      setRunning(true);
      fetchData(); // เรียกทันที 1 ครั้ง
      intervalRef.current = setInterval(fetchData, 10); // ทุก 10 วิ
    }
  };

  const stopLoop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRunning(false);
  };

  return (
    <div>
      <button
        onClick={startLoop}
        disabled={running}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
      >
        Start Generate
      </button>

      <button
        onClick={stopLoop}
        disabled={!running}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition ml-4"
      >
        Stop
      </button>

      <div className="mt-4">
        <h2 className="text-lg font-bold">Generated Data</h2>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  );
};

export default Genta;
