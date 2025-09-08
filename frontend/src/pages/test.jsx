import { useEffect, useState,useMemo } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from "recharts";

export default function Test() {
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:3001/users")
      .then(res =>{ setUsers(res.data)})
      .catch(err => console.error(err));

    // ตัวอย่างให้ analytics ใช้ sales_amount + product_name
    axios.get("http://localhost:3001/sales-sample")
      .then(res => {
        console.log('data',res.data); // ตรวจสอบ data
        setAnalytics(res.data);
        // console.log('analytics', analytics); // ตรวจสอบ analytics
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (analytics.length > 0) {
      console.log('Chart data:', analytics.map(item => ({
        product_name: item.product,
        sales_amount: item.price * item.quantity
      })));
    }
  }, [analytics]);
  useEffect(() => {
    console.log('Users updated:', users);
  }, [users]);

  // const chartData = Object.values(
  //   analytics.reduce((acc, item) => {
  //     if (!acc[item.product]) {
  //       acc[item.product] = {
  //         product_name: item.product,
  //         sales_amount: 0
  //       };
  //     }
  //     acc[item.product].sales_amount += item.price * item.quantity;
  //     return acc;
  //   }, {})
  // );
const chartData = Object.values(
  analytics.reduce((acc, item) => {
    if (!item.product_name) return acc; // skip empty names
    if (!acc[item.product_name]) {
      acc[item.product_name] = { product_name: item.product_name, sales_amount: 0 };
    }
    acc[item.product_name].sales_amount += Number(item.sales_amount || 0);
    return acc;
  }, {})
);



  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>🚀 React + Express + PostgreSQL + ClickHouse</h1>

      {/* ===== Users Table ===== */}
      <h2>Users (Postgres)</h2>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th>Product ID</th>
            <th>Name</th>
            <th>Category</th>
            <th>Brand</th>
            <th>Customer</th>
            <th>Gender</th>
            <th>Region</th>
            <th>Store</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Discount</th>
            <th>Sales</th>
            <th>Profit</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.product_id}</td>
              <td>{u.product_name}</td>
              <td>{u.category}</td>
              <td>{u.brand}</td>
              <td>{u.customer_name}</td>
              <td>{u.gender}</td>
              <td>{u.region}</td>
              <td>{u.store_name}</td>
              <td>{u.unit_price} บาท</td>
              <td>{u.quantity} ชิ้น</td>
              <td>{u.discount}</td>
              <td>{u.sales_amount}</td>
              <td>{u.profit}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ===== Analytics Chart ===== */}
      <h2>Analytics (ClickHouse)</h2>
      {analytics.length > 0 ? (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="product_name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="sales_amount" fill="#8884d8" />
          </BarChart>

        </ResponsiveContainer>
      ) : (
        <p>Loading chart...</p>
      )}
    </div>
  );
}
