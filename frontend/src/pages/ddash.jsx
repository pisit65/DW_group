// import { useEffect, useState,useMemo } from "react";
// import axios from "axios";
// import {
//   Line,LineChart,BarChart, Bar,Legend, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
// } from "recharts";

// import { io } from "socket.io-client";
// const socket = io("http://localhost:3001/");
// export default function Ddash() {
//   const [users, setUsers] = useState([]);
//   const [analytics, setAnalytics] = useState([]);

//   useEffect(() => {
//     axios.get("http://localhost:3001/users")
//       .then(res =>{ setUsers(res.data)})
//       .catch(err => console.error(err));

//     // ตัวอย่างให้ analytics ใช้ sales_amount + product_name
//     axios.get("http://localhost:3001/sales-sample")
//       .then(res => {
//         console.log('data',res.data); // ตรวจสอบ data
//         setAnalytics(res.data);
//         // console.log('analytics', analytics); // ตรวจสอบ analytics
//       })
//       .catch(err => console.error(err));
//   }, []);

//   useEffect(() => {
//     if (analytics.length > 0) {
//       console.log('Chart data:', analytics.map(item => ({
//         product_name: item.product,
//         sales_amount: item.price * item.quantity
//       })));
//     }
//   }, [analytics]);
//   useEffect(() => {
//     console.log('Users updated:', users);
//   }, [users]);


// const chartData = Object.values(
//   analytics.reduce((acc, item) => {
//     if (!item.product_name) return acc; // skip empty names
//     if (!acc[item.product_name]) {
//       acc[item.product_name] = { product_name: item.product_name, sales_amount: 0 };
//     }
//     acc[item.product_name].sales_amount += Number(item.sales_amount || 0);
//     return acc;
//   }, {})
// );

//   const [sales, setSales] = useState([]);

//   useEffect(() => {
//     socket.on("sales_update", (data) => {
//       console.log("📥 Real-time data:", data);
//       setSales(data);
//     });

//     return () => {
//       socket.off("sales_update"); 
//     };
//   }, []);

//   const [sales_dayly, setSalessales_dayly] = useState([]);

//   useEffect(() => {
//     socket.on("sales_day", (data2) => {
//       console.log("📥 Real-time data Day:", data2);
//       setSalessales_dayly(data2);
      
//     });

//     return () => {
//       socket.off("sales_day"); 
//     };
//   }, []);


//   return (
//     <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
//       <h1>🚀 React + Express + PostgreSQL + ClickHouse</h1>

//       {/* ===== Users Table ===== */}
//       <h2>Users (Postgres)</h2>
//       <table style={{ borderCollapse: "collapse", width: "100%" }}>
//         <thead>
//           <tr>
//             <th>Product ID</th>
//             <th>Name</th>
//             <th>Category</th>
//             <th>Brand</th>
//             <th>Customer</th>
//             <th>Gender</th>
//             <th>Region</th>
//             <th>Store</th>
//             <th>Price</th>
//             <th>Quantity</th>
//             <th>Discount</th>
//             <th>Sales</th>
//             <th>Profit</th>
//           </tr>
//         </thead>
//         <tbody>
//           {users.map(u => (
//             <tr key={u.id}>
//               <td>{u.product_id}</td>
//               <td>{u.product_name}</td>
//               <td>{u.category}</td>
//               <td>{u.brand}</td>
//               <td>{u.customer_name}</td>
//               <td>{u.gender}</td>
//               <td>{u.region}</td>
//               <td>{u.store_name}</td>
//               <td>{u.unit_price} บาท</td>
//               <td>{u.quantity} ชิ้น</td>
//               <td>{u.discount}</td>
//               <td>{u.sales_amount}</td>
//               <td>{u.profit}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {/* ===== Analytics Chart ===== */}
//       <h2>Analytics (ClickHouse)</h2>
//       {analytics.length > 0 ? (
//         <ResponsiveContainer width="100%" height={400}>
//           <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="product_name" />
//             <YAxis />
//             <Tooltip />
//             <Bar dataKey="sales_amount" fill="#8884d8" />
//           </BarChart>

//         </ResponsiveContainer>
//       ) : (
//         <p>Loading chart...</p>
//       )}

//           <div>
//       <h2>📊 Real-time Sales</h2>
//       <ul>
//         {sales.map((row, idx) => (
//           <li key={idx}>
//             {row.product_name} - {row.category} - {row.date}
//           </li>
//         ))}
//       </ul>
//       <ResponsiveContainer width="100%" height={400}>
//         <LineChart data={sales_dayly} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="date" />
//           <YAxis yAxisId="left" label={{ value: "Amount", angle: -90, position: "insideLeft" }} />
//           <YAxis yAxisId="right" orientation="right" label={{ value: "Qty", angle: 90, position: "insideRight" }} />
//           <Tooltip />
//           <Legend />
//           <Line yAxisId="left" type="monotone" dataKey="total_sales" stroke="#8884d8" name="Total Sales" />
//           <Line yAxisId="left" type="monotone" dataKey="total_profit" stroke="#82ca9d" name="Total Profit" />
//           <Line yAxisId="right" type="monotone" dataKey="total_qty" stroke="#ff7300" name="Total Qty" />
//         </LineChart>
//       </ResponsiveContainer>
//       <ul>
//         {sales_dayly.map((row, idx) => (
//           <li key={idx}>
//             {row.date} - {row.total_qty} - {row.total_sales}- {row.total_profit}
//           </li>
//         ))}
//       </ul>
//     </div>
//     </div>
//   );
// }




// import React, { useState, useMemo,useEffect } from 'react';
// import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// import { Calendar, TrendingUp, ShoppingCart, Users, MapPin, Target, DollarSign, Award } from 'lucide-react';
// import axios from 'axios';
// const Dashboard = () => {
//   const [activeTab, setActiveTab] = useState('overview');
//   const [salesData, setSalesData] = useState([]);
//   const [topProducts, setTopProducts] = useState([]);
//   const [categoryData, setCategoryData] = useState([]);
//   const [regionData, setRegionData] = useState([]);
//   const [customerData, setCustomerData] = useState([]);
//   const defaultColors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#14B8A6"];

  // const mockSalesData = [ { date: '2025-01-01', sales_amount: 125000, profit: 35000, quantity: 150, discount: 0.10 }, 
  //   { date: '2025-01-02', sales_amount: 98000, profit: 28000, quantity: 120, discount: 0.08 }, 
  //   { date: '2025-01-03', sales_amount: 142000, profit: 42000, quantity: 180, discount: 0.12 }, 
  //   { date: '2025-01-04', sales_amount: 167000, profit: 48000, quantity: 210, discount: 0.15 }, 
  //   { date: '2025-01-05', sales_amount: 134000, profit: 38000, quantity: 165, discount: 0.09 }, 
  //   { date: '2025-01-06', sales_amount: 189000, profit: 55000, quantity: 230, discount: 0.11 }, 
  //   { date: '2025-01-07', sales_amount: 156000, profit: 44000, quantity: 190, discount: 0.13 } ]; 
  // const topProducts = [ { product_name: 'iPhone 15 Pro Max', total_sales: 450000, total_qty: 180, profit: 135000 }, 
  //     { product_name: 'Samsung Galaxy S24', total_sales: 380000, total_qty: 160, profit: 114000 }, 
  //     { product_name: 'MacBook Air M3', total_sales: 320000, total_qty: 80, profit: 96000 }, 
  //     { product_name: 'iPad Pro 12.9"', total_sales: 280000, total_qty: 140, profit: 84000 }, 
  //     { product_name: 'AirPods Pro 2', total_sales: 240000, total_qty: 200, profit: 72000 }, 
  //     { product_name: 'Surface Pro 9', total_sales: 220000, total_qty: 110, profit: 66000 }, 
  //     { product_name: 'Sony WH-1000XM5', total_sales: 180000, total_qty: 150, profit: 54000 }, 
  //     { product_name: 'Nintendo Switch OLED', total_sales: 160000, total_qty: 120, profit: 48000 } ]; 
  // const categoryData = [ { category: 'Smartphones', total_profit: 580000, total_sales: 1200000, color: '#3B82F6' }, 
  //       { category: 'Laptops', total_profit: 420000, total_sales: 950000, color: '#10B981' }, 
  //       { category: 'Audio', total_profit: 280000, total_sales: 650000, color: '#F59E0B' }, 
  //       { category: 'Gaming', total_profit: 240000, total_sales: 580000, color: '#EF4444' }, 
  //       { category: 'Accessories', total_profit: 180000, total_sales: 450000, color: '#8B5CF6' }, 
  //       { category: 'Smart Home', total_profit: 150000, total_sales: 380000, color: '#06B6D4' } ]; 
  // const regionData = [ { region: 'Central', store_city: 'Bangkok', total_sales: 2800000, customers: 1250 },
  //          { region: 'North', store_city: 'Chiang Mai', total_sales: 1200000, customers: 580 },
  //          { region: 'Northeast', store_city: 'Ubon Ratchathani', total_sales: 950000, customers: 420 }, 
  //          { region: 'South', store_city: 'Hat Yai', total_sales: 880000, customers: 390 }, 
  //          { region: 'East', store_city: 'Pattaya', total_sales: 760000, customers: 350 }, 
  //          { region: 'West', store_city: 'Kanchanaburi', total_sales: 420000, customers: 180 } ]; 
  // const customerData = [ { gender: 'Male', customers: 1580, total_sales: 3200000, avg_order: 2025 },
  //           { gender: 'Female', customers: 1720, total_sales: 3800000, avg_order: 2209 } ];



//   useEffect(() => {
//   axios.get("http://localhost:3001/sales-trend")
//     .then(res => setSalesData(res.data.map(row => ({
//         ...row,
//         sales_amount: Number(row.sales_amount),
//         profit: Number(row.profit),
//         discount: Number(row.discount),
//           })))
//           )
//     .catch(err => console.error(err));  

//   axios.get("http://localhost:3001/top-products")
//     .then(res => setTopProducts(res.data))
//     .catch(err => console.error(err));

//   axios.get("http://localhost:3001/category-profit")
//     .then(res => setCategoryData(res.data))
//     .catch(err => console.error(err));

//   axios.get("http://localhost:3001/region-sales")
//     .then(res => setRegionData(res.data))
//     .catch(err => console.error(err));

//   axios.get("http://localhost:3001/customer-segment")
//     .then(res => setCustomerData(res.data))
//     .catch(err => console.error(err));
// }, []);


//   const totalSales = useMemo(() => 
//     salesData.reduce((sum, day) => sum + (day.sales_amount || 0), 0), 
//   [salesData]);

//   const totalProfit = useMemo(() => 
//     salesData.reduce((sum, day) => sum + (day.profit || 0), 0), 
//   [salesData]);

//   const avgDiscount = useMemo(() => 
//     salesData.length > 0 
//       ? salesData.reduce((sum, day) => sum + (day.discount || 0), 0) / salesData.length 
//       : 0, 
//   [salesData]);

//   const totalCustomers = useMemo(() => 
//     customerData.reduce((sum, segment) => sum + (segment.customers || 0), 0), 
//   [customerData]);


//   console.log('totalSales', totalSales);
//   console.log('totalProfit', totalProfit);
//   console.log('avgDiscount', avgDiscount);
//   console.log('totalCustomers', totalCustomers);





  
//   const kpiCards = [
//     {
//       title: 'ยอดขายรวม',
//       value: `฿${(totalSales / 1000000).toFixed(5)}M`,
//       change: '+12.5%',
//       icon: DollarSign,
//       color: 'bg-blue-500'
//     },
//     {
//       title: 'กำไร',
//       value: `฿${(totalProfit / 1000).toFixed(5)}K`,
//       change: '+8.3%',
//       icon: TrendingUp,
//       color: 'bg-green-500'
//     },
//     {
//       title: 'ลูกค้า',
//       value: totalCustomers.toLocaleString(),
//       change: '+15.2%',
//       icon: Users,
//       color: 'bg-purple-500'
//     },
//     {
//       title: 'ส่วนลดเฉลี่ย',
//       value: `${(avgDiscount * 100).toFixed(1)}%`,
//       change: '-2.1%',
//       icon: Target,
//       color: 'bg-orange-500'
//     }
//   ];
import React, { useState, useMemo,useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, TrendingUp, ShoppingCart, Users, MapPin, Target, DollarSign, Award } from 'lucide-react';
import axios from 'axios';
const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [regionData, setRegionData] = useState([]);
  const [customerData, setCustomerData] = useState([]);
  const defaultColors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#14B8A6"];
  // hook โหลดข้อมูล
  useEffect(() => {
    axios.get("http://localhost:3001/sales-trend")
      .then(res => setSalesData(res.data.map(row => ({
        ...row,
        sales_amount: Number(row.sales_amount),
        profit: Number(row.profit),
        discount: Number(row.discount),
      }))))
      .catch(err => console.error(err));

    axios.get("http://localhost:3001/top-products")
      .then(res => setTopProducts(res.data))
      .catch(err => console.error(err));
    axios.get("http://localhost:3001/top-products")
      .then(res => console.log(res.data))
      .catch(err => console.error(err));

    axios.get("http://localhost:3001/category-profit")
      .then(res => setCategoryData(res.data))
      .catch(err => console.error(err));

    axios.get("http://localhost:3001/region-sales")
    .then(res => setRegionData(res.data))
      .catch(err => console.error(err));
    axios.get("http://localhost:3001/region-sales")
    .then(res => console.log('region',res.data))
      .catch(err => console.error(err));

    axios.get("http://localhost:3001/customer-segment")
      .then(res => setCustomerData(res.data))
      .catch(err => console.error(err));
  }, []);

  // helper: คำนวณ % เปลี่ยนแปลง
  const getChangePercent = (current, prev) => {
    if (prev === 0) return "+0%";
    const diff = ((current - prev) / prev) * 100;
    const sign = diff >= 0 ? "+" : "";
    return `${sign}${diff.toFixed(1)}%`;
  };

  // คำนวณ KPI
  const totalSales = useMemo(() => 
    salesData.reduce((sum, day) => sum + (day.sales_amount || 0), 0), 
  [salesData]);

  const totalProfit = useMemo(() => 
    salesData.reduce((sum, day) => sum + (day.profit || 0), 0), 
  [salesData]);

  const avgDiscount = useMemo(() => 
    salesData.length > 0 
      ? salesData.reduce((sum, day) => sum + (day.discount || 0), 0) / salesData.length 
      : 0, 
  [salesData]);

  const totalCustomers = useMemo(() => 
    customerData.reduce((sum, seg) => sum + (seg.customers || 0), 0), 
  [customerData]);

  // เปรียบเทียบข้อมูลล่าสุดกับก่อนหน้า
  const half = Math.floor(salesData.length / 2);

  const prevSales = salesData.slice(0, half).reduce((sum, d) => sum + (d.sales_amount || 0), 0);
  const currSales = salesData.slice(half).reduce((sum, d) => sum + (d.sales_amount || 0), 0);

  const prevProfit = salesData.slice(0, half).reduce((sum, d) => sum + (d.profit || 0), 0);
  const currProfit = salesData.slice(half).reduce((sum, d) => sum + (d.profit || 0), 0);

  // สร้าง KPI Cards
  const kpiCards = [
    {
      title: 'ยอดขายรวม',
      value: `฿${(totalSales / 1000000).toFixed(2)}M`,
      change: getChangePercent(currSales, prevSales),
      icon: DollarSign,
      color: 'bg-blue-500'
    },
    {
      title: 'กำไร',
      value: `฿${(totalProfit / 1000).toFixed(2)}K`,
      change: getChangePercent(currProfit, prevProfit),
      icon: TrendingUp,
      color: 'bg-green-500'
    },
    {
      title: 'ลูกค้า',
      value: totalCustomers.toLocaleString(),
      change: getChangePercent(currSales, prevSales),
      icon: Users,
      color: 'bg-purple-500'
    },
    {
      title: 'ส่วนลดเฉลี่ย',
      value: `${(avgDiscount * 100).toFixed(1)}%`,
      change: getChangePercent(currSales, prevSales),
      icon: Target,
      color: 'bg-orange-500'
    }
  ];


  const tabButtons = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'products', label: 'Products', icon: ShoppingCart },
    { id: 'regions', label: 'Regions', icon: MapPin },
    { id: 'customers', label: 'Customers', icon: Users }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 w-full p-6 m-5">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-800 mb-2">Sales Analytics Dashboard</h1>
        <p className="text-slate-600">Real-time business intelligence and insights</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiCards.map((kpi, index) => {
          const IconComponent = kpi.icon;
          return (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className={`${kpi.color} rounded-xl p-3`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
                  kpi.change.startsWith('+') ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
                }`}>
                  {kpi.change}
                </span>
              </div>
              <h3 className="text-slate-600 text-sm font-medium mb-1">{kpi.title}</h3>
              <p className="text-3xl font-bold text-slate-800">{kpi.value}</p>
            </div>
          );
        })}
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl shadow-lg mb-8 border border-slate-200">
        <div className="flex overflow-x-auto">
          {tabButtons.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-6 py-4 font-medium transition-all duration-300 border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <IconComponent className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
          {/* Sales Trend */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Sales Trend (7 Days)
            </h2>
            <ResponsiveContainer width="100%" height={500}>
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748B"
                  fontSize={12}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })}
                />
                <YAxis 
                  stroke="#64748B"
                  fontSize={12}
                  tickFormatter={(value) => `${(value/1000)}K`}
                />
                <Tooltip 
                  formatter={(value) => [`฿${value.toLocaleString()}`, 'Sales']}
                  labelFormatter={(label) => new Date(label).toLocaleDateString('th-TH')}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales_amount" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  fill="url(#salesGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Category Profit */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Award className="w-5 h-5 text-green-500" />
              Profit by Category
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={categoryData}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name, props) => [
                    `฿${value.toLocaleString()}`, 
                    `Profit in ${props.payload.category}`
                  ]}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    padding: '10px',
                  }}
                />
                <Bar dataKey="total_profit">
                  {categoryData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color || defaultColors[index % defaultColors.length]} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-500" />
            Top Products Performance
          </h2>
          <ResponsiveContainer width="100%" height={500}>
            <BarChart
              data={topProducts}
              layout="vertical" // <-- ใช้ vertical จะง่ายสำหรับ category ที่เป็นชื่อสินค้า
              margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis type="number" stroke="#64748B" fontSize={12} tickFormatter={(value) => `฿${value.toLocaleString()}`} />
              <YAxis type="category" dataKey="product_name" stroke="#64748B" fontSize={12} width={200} />
              <Tooltip
                formatter={(value, name) => [
                  name === 'total_sales' ? `฿${value.toLocaleString()}` : value,
                  name === 'total_sales' ? 'Sales' : name === 'total_qty' ? 'Quantity' : 'Profit'
                ]}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="total_sales" fill="#3B82F6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>

        </div>
      )}

      {activeTab === 'regions' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {['Central','North','Northeast','South','East','West'].map((reg, idx) => {
            const data = regionData.filter(d => d.region === reg);
            if (!data.length) return null;

            return (
              <div key={idx} className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
                <h2 className="text-xl font-bold text-slate-800 mb-6">{reg} Region Sales</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="store_city" stroke="#64748B" fontSize={12} />
                    <YAxis stroke="#64748B" fontSize={12} tickFormatter={v => `${(v/1000).toFixed(1)}K`} />
                    <Tooltip formatter={value => [`฿${value.toLocaleString()}`, 'Sales']} />
                    <Bar dataKey="total_sales" fill="#10B981" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )
          })}
        </div>
      )}



      {/* {activeTab === 'regions' && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-500" />
            Sales by Region
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={regionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis 
                dataKey="store_city" 
                stroke="#64748B"
                fontSize={12}
              />
              <YAxis 
                stroke="#64748B"
                fontSize={12}
                tickFormatter={(value) => `${(value/1000000).toFixed(1)}M`}
              />
              <Tooltip 
                formatter={(value) => [`฿${value.toLocaleString()}`, 'Sales']}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="total_sales" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )} */}

      {activeTab === 'customers' && (
        <div className="grid grid-cols-1 gap-8">
          {/* Customer Demographics */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" />
              Customer Demographics
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {customerData.map((segment, index) => (
                <div key={index} className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-slate-700">{segment.gender}</span>
                    <span className="text-sm text-slate-500">{segment.customers.toLocaleString()} customers</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-slate-800">฿{segment.total_sales.toLocaleString()}</span>
                    <span className="text-sm text-slate-600">Avg: ฿{segment.avg_order.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Regional Performance */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Regional Performance</h2>
            <div className="grid grid-cols-3 gap-3 h-[400px] overflow-y-auto border rounded p-3">
              {regionData.map((region, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <div>
                    <div className="font-semibold text-slate-800">{region.store_city}</div>
                    <div className="text-sm text-slate-600">{region.region} • {region.customers} customers</div>
                  </div>
                  <div className="text-right">
                    {/* <div className="font-bold text-slate-800">฿{(region.total_sales/1000000).toFixed(1)}M</div> */}
                    <div className="font-bold text-slate-800">฿{(region.total_sales)}฿</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;