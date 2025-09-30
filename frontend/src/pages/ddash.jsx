import React, { useState, useMemo,useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, TrendingUp, ShoppingCart, Users, MapPin, Target, DollarSign, Award ,Mars ,Venus} from 'lucide-react';
import axios from 'axios';
const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [regionData, setRegionData] = useState([]);
  const [customerData, setCustomerData] = useState([]);
  const defaultColors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#14B8A6"];
  const [timeRange, setTimeRange] = useState('daily');
  // hook โหลดข้อมูล
  const timeOptions = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' },
];
// โหลดข้อมูลครั้งแรก
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

  axios.get("http://localhost:3001/category-profit")
    .then(res => setCategoryData(res.data))
    .catch(err => console.error(err));

  axios.get("http://localhost:3001/region-sales")
    .then(res => setRegionData(res.data))
    .catch(err => console.error(err));

  // axios.get("http://localhost:3001/customer-segment")
  //   .then(res => setCustomerData(res.data))
  //   .catch(err => console.error(err));
}, []);

// โหลดข้อมูลตามช่วงเวลา
useEffect(() => {
  axios.get(`http://localhost:3001/sales-trend?range=${timeRange}`)
    .then(res => setSalesData(res.data))
    .catch(err => console.error(err));

  axios.get(`http://localhost:3001/pd/customer-segment?range=${timeRange}`)
    .then(res => setCustomerData(res.data))
    .catch(err => console.error(err));
  axios.get(`http://localhost:3001/pd/customer-segment?range=${timeRange}`)
    .then(res => console.log(res.data))
    .catch(err => console.error(err));
  // axios.get(`http://localhost:3001/customer-segment?range=${timeRange}`)
  //   .then(res => setCustomerData(res.data))
  //   .catch(err => console.error(err));
}, [timeRange]);


  // ฟังก์ชันสำหรับจัดรูปแบบแกน X ของกราฟ
  const formatXAxisTick = (tickItem) => {
    const date = new Date(tickItem);
    switch (timeRange) {
      case 'yearly':
        // แสดงแค่ปี: "2025"
        return date.toLocaleDateString('th-TH', { year: 'numeric' });
      case 'monthly':
        // แสดง เดือน (ย่อ) + ปี: "ก.ย. 2025"
        return date.toLocaleDateString('th-TH', { month: 'short', year: 'numeric' });
      case 'weekly':
      case 'daily':
      default:
        // แสดง วัน + เดือน (ย่อ): "30 ก.ย."
        return date.toLocaleDateString('th-TH', { month: 'short', day: 'numeric' });
    }
  };

  // ฟังก์ชันสำหรับจัดรูปแบบ Label ของ Tooltip (เมื่อเอาเมาส์ไปชี้)
  const formatTooltipLabel = (label) => {
    const date = new Date(label);
    switch (timeRange) {
      case 'yearly':
        return `ปี ${date.toLocaleDateString('th-TH', { year: 'numeric' })}`;
      case 'monthly':
        return date.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' });
      case 'weekly':
      case 'daily':
      default:
        return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });
    }
  };




  // helper: คำนวณ % เปลี่ยนแปลง
  const getChangePercent = (curr, prev) => {
    if (prev === 0) {
      if (curr === 0) return "0%";
      return "+100%"; // จาก 0 → มีค่า ถือว่าโตเต็มที่
    }
    const diff = ((curr - prev) / prev) * 100;
    return `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}%`;
  };


  // คำนวณ KPI
  const totalSales = useMemo(() => 
    salesData.reduce((sum, day) => sum + (day.sales_amount || 0), 0), 
  [salesData]);

  const totalProfit = useMemo(() => 
    salesData.reduce((sum, day) => sum + (day.profit || 0), 0), 
  [salesData]);

  // const avgDiscount = useMemo(() => 
  //   salesData.length > 0 
  //     ? salesData.reduce((sum, day) => sum + (day.discount || 0), 0) / salesData.length 
  //     : 0, 
  // [salesData]);

  const totalCustomers = useMemo(() => 
    customerData.reduce((sum, seg) => sum + (seg.customers || 0), 0), 
  [customerData]);


  // เปรียบเทียบข้อมูลล่าสุดกับก่อนหน้า
  const half = Math.floor(salesData.length / 2);

  // Sales
  const prevSales = salesData.slice(0, half).reduce((sum, d) => sum + (d.sales_amount || 0), 0);
  const currSales = salesData.slice(half).reduce((sum, d) => sum + (d.sales_amount || 0), 0);

  // Profit
  const prevProfit = salesData.slice(0, half).reduce((sum, d) => sum + (d.profit || 0), 0);
  const currProfit = salesData.slice(half).reduce((sum, d) => sum + (d.profit || 0), 0);

  // Customers
  // คำนวณลูกค้าแบบแบ่งครึ่ง dataset ของ customerData เอง
  const halfCust = Math.floor(customerData.length / 2);

const prevCustomers = customerData
  .slice(0, halfCust)
  .reduce((sum, d) => sum + (d.customers || 0), 0);

const currCustomers = customerData
  .slice(halfCust)
  .reduce((sum, d) => sum + (d.customers || 0), 0);



  // Average Discount
  // const prevAvgDiscount = salesData.slice(0, half).reduce((sum, d) => sum + (d.discount || 0), 0) / half;
  // const currAvgDiscount = salesData.slice(half).reduce((sum, d) => sum + (d.discount || 0), 0) / (salesData.length - half);
  const avgDiscount = salesData.length > 0 ? salesData.reduce((sum, day) => sum + (day.discount || 0), 0) / salesData.length : 0;

  const prevAvgDiscount = salesData.slice(0, half).reduce((sum, d) => sum + (d.discount || 0), 0) / half;
  const currAvgDiscount = salesData.slice(half).reduce((sum, d) => sum + (d.discount || 0), 0) / (salesData.length - half);


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
      change: getChangePercent(currCustomers, prevCustomers),
      icon: Users,
      color: 'bg-purple-500'
    },
    {
      title: 'ส่วนลดเฉลี่ย',
      value: `${(avgDiscount * 100).toFixed(1)}%`,
      change: getChangePercent(currAvgDiscount, prevAvgDiscount),
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

      <div className="flex gap-2 mb-4">
        {timeOptions.map(opt => (
          <button
            key={opt.id}
            className={`px-4 py-2 rounded ${
              timeRange === opt.id ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
            onClick={() => setTimeRange(opt.id)}
          >
            {opt.label}
          </button>
        ))}
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
              {/* อาจจะเปลี่ยนหัวข้อตามช่วงเวลาด้วยก็ได้ */}
              Sales Trend
            </h2>
            <ResponsiveContainer width="100%" height={500}>
              <AreaChart data={salesData}>
                {/* ... */}
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis 
                  dataKey="period" 
                  stroke="#64748B"
                  fontSize={12}
                  // ใช้ฟังก์ชันใหม่ในการจัดรูปแบบแกน X
                  tickFormatter={formatXAxisTick} 
                />
                <YAxis 
                  stroke="#64748B"
                  fontSize={12}
                  tickFormatter={(value) => `${(value/1000)}K`}
                />
                <Tooltip 
                  formatter={(value) => [`฿${value.toLocaleString()}`, 'Sales']}
                  // ใช้ฟังก์ชันใหม่ในการจัดรูปแบบ Label ของ Tooltip
                  labelFormatter={formatTooltipLabel} 
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
              layout="vertical" 
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
                    <span className="flex items-center gap-2 font-semibold text-slate-700">
                      {segment.gender === "Male" ? (
                        <Mars className="w-5 h-5 text-blue-500" />
                      ) : (
                        <Venus className="w-5 h-5 text-pink-500" />
                      )}
                      {segment.gender}
                    </span>
                    <span className="text-sm text-slate-500">
                      {segment.customers.toLocaleString()} customers
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-slate-800">
                      ฿{segment.total_sales.toLocaleString()}
                    </span>
                    <span className="text-sm text-slate-600">
                      Avg: ฿{segment.avg_order.toLocaleString()}
                    </span>
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