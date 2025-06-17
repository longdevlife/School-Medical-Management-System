/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Select,
  DatePicker,
  Typography,
  Statistic,
  Table,
  Progress,
  Tag,
  Space,
  Button,
  Tooltip,
  Alert,
  Switch,
  Divider,
  Badge,
  Modal,
  Form,
  InputNumber,
  message,
} from "antd";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  ReferenceLine,
} from "recharts";
import {
  RiseOutlined,
  FallOutlined,
  WarningOutlined,
  HeartOutlined,
  MedicineBoxOutlined,
  SafetyCertificateOutlined,
  ExportOutlined,
  CalendarOutlined,
  UserOutlined,
  DollarOutlined,
  FundProjectionScreenOutlined,
  AlertOutlined,
  BarChartOutlined,
  LineChartOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

function AdvancedAnalytics() {
  const [timeRange, setTimeRange] = useState("6months");
  const [selectedMetric, setSelectedMetric] = useState("health_incidents");
  const [loading, setLoading] = useState(false);
  const [showPrediction, setShowPrediction] = useState(true);
  const [predictionModelVisible, setPredictionModelVisible] = useState(false);
  const [revenueForecastVisible, setRevenueForecastVisible] = useState(false);
  const [predictionMonths, setPredictionMonths] = useState(3);
  const [seasonalFactor, setSeasonalFactor] = useState(1.2);

  // Mock data for analytics
  const healthTrendData = [
    {
      month: "Tháng 7",
      incidents: 12,
      checkups: 45,
      vaccinations: 89,
      medications: 23,
    },
    {
      month: "Tháng 8",
      incidents: 8,
      checkups: 52,
      vaccinations: 76,
      medications: 18,
    },
    {
      month: "Tháng 9",
      incidents: 15,
      checkups: 48,
      vaccinations: 92,
      medications: 31,
    },
    {
      month: "Tháng 10",
      incidents: 6,
      checkups: 58,
      vaccinations: 67,
      medications: 15,
    },
    {
      month: "Tháng 11",
      incidents: 11,
      checkups: 41,
      vaccinations: 84,
      medications: 27,
    },
    {
      month: "Tháng 12",
      incidents: 9,
      checkups: 55,
      vaccinations: 78,
      medications: 21,
    },
  ];

  const diseaseDistribution = [
    { name: "Cảm cúm", value: 35, color: "#FF6B6B" },
    { name: "Đau bụng", value: 20, color: "#4ECDC4" },
    { name: "Đau đầu", value: 15, color: "#45B7D1" },
    { name: "Dị ứng", value: 12, color: "#FFA07A" },
    { name: "Khác", value: 18, color: "#98D8C8" },
  ];

  const classHealthStats = [
    {
      class: "6A",
      totalStudents: 35,
      healthyStudents: 32,
      atRiskStudents: 3,
      healthRate: 91.4,
    },
    {
      class: "6B",
      totalStudents: 38,
      healthyStudents: 36,
      atRiskStudents: 2,
      healthRate: 94.7,
    },
    {
      class: "7A",
      totalStudents: 36,
      healthyStudents: 33,
      atRiskStudents: 3,
      healthRate: 91.7,
    },
    {
      class: "7B",
      totalStudents: 39,
      healthyStudents: 37,
      atRiskStudents: 2,
      healthRate: 94.9,
    },
    {
      class: "8A",
      totalStudents: 34,
      healthyStudents: 30,
      atRiskStudents: 4,
      healthRate: 88.2,
    },
    {
      class: "8B",
      totalStudents: 37,
      healthyStudents: 35,
      atRiskStudents: 2,
      healthRate: 94.6,
    },
  ];

  const vaccinationProgress = [
    { vaccine: "COVID-19", completed: 285, total: 300, percentage: 95 },
    { vaccine: "Hepatitis B", completed: 295, total: 300, percentage: 98.3 },
    { vaccine: "Sởi", completed: 278, total: 300, percentage: 92.7 },
    { vaccine: "Quai bị", completed: 245, total: 300, percentage: 81.7 },
    { vaccine: "Bại liệt", completed: 298, total: 300, percentage: 99.3 },
  ];

  const riskFactors = [
    { factor: "Dị ứng thực phẩm", students: 23, trend: "up", severity: "high" },
    { factor: "Hen suyễn", students: 15, trend: "stable", severity: "medium" },
    { factor: "Tiểu đường", students: 3, trend: "down", severity: "high" },
    { factor: "Bệnh tim", students: 2, trend: "stable", severity: "high" },
    {
      factor: "Khuyết tật vận động",
      students: 8,
      trend: "stable",
      severity: "medium",
    },
  ];

  // Enhanced data with trend prediction and revenue forecasting
  const enhancedHealthTrendData = [
    {
      month: "Tháng 7",
      incidents: 12,
      checkups: 45,
      vaccinations: 89,
      medications: 23,
      revenue: 18500000,
      costs: 12000000,
    },
    {
      month: "Tháng 8",
      incidents: 8,
      checkups: 52,
      vaccinations: 76,
      medications: 18,
      revenue: 21000000,
      costs: 13500000,
    },
    {
      month: "Tháng 9",
      incidents: 15,
      checkups: 48,
      vaccinations: 92,
      medications: 31,
      revenue: 19800000,
      costs: 14200000,
    },
    {
      month: "Tháng 10",
      incidents: 6,
      checkups: 58,
      vaccinations: 67,
      medications: 15,
      revenue: 23200000,
      costs: 15100000,
    },
    {
      month: "Tháng 11",
      incidents: 11,
      checkups: 41,
      vaccinations: 84,
      medications: 27,
      revenue: 20500000,
      costs: 13800000,
    },
    {
      month: "Tháng 12",
      incidents: 9,
      checkups: 55,
      vaccinations: 78,
      medications: 21,
      revenue: 22800000,
      costs: 14600000,
    },
  ];

  // Prediction algorithm (simple linear regression with seasonal adjustment)
  const generatePredictions = (data, metric, months = 3) => {
    const values = data.map((item) => item[metric]);
    const n = values.length;

    // Calculate trend slope
    const xMean = (n - 1) / 2;
    const yMean = values.reduce((sum, val) => sum + val, 0) / n;

    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < n; i++) {
      numerator += (i - xMean) * (values[i] - yMean);
      denominator += (i - xMean) ** 2;
    }

    const slope = denominator === 0 ? 0 : numerator / denominator;
    const intercept = yMean - slope * xMean;

    // Generate predictions
    const predictions = [];
    for (let i = 0; i < months; i++) {
      const predictedValue = intercept + slope * (n + i);
      const seasonalAdjustment = metric === "revenue" ? seasonalFactor : 1;
      predictions.push({
        month: `Dự đoán ${i + 1}`,
        [metric]: Math.max(0, Math.round(predictedValue * seasonalAdjustment)),
        isPrediction: true,
      });
    }

    return predictions;
  };

  // Revenue forecasting with confidence intervals
  const generateRevenueForecast = (months = 6) => {
    const revenueData = enhancedHealthTrendData.map((item) => item.revenue);
    const predictions = generatePredictions(
      enhancedHealthTrendData,
      "revenue",
      months
    );

    // Calculate confidence intervals (±10% for simplicity)
    const forecastWithConfidence = predictions.map((pred) => ({
      ...pred,
      revenueMin: Math.round(pred.revenue * 0.9),
      revenueMax: Math.round(pred.revenue * 1.1),
      confidence: 85 + Math.random() * 10, // Simulated confidence score
    }));

    return forecastWithConfidence;
  };

  // Trend analysis with recommendations
  const analyzeTrends = () => {
    const metrics = ["incidents", "checkups", "vaccinations", "medications"];
    const analysis = {};

    metrics.forEach((metric) => {
      const values = enhancedHealthTrendData.map((item) => item[metric]);
      const recent = values.slice(-3);
      const earlier = values.slice(0, 3);

      const recentAvg =
        recent.reduce((sum, val) => sum + val, 0) / recent.length;
      const earlierAvg =
        earlier.reduce((sum, val) => sum + val, 0) / earlier.length;

      const trendDirection =
        recentAvg > earlierAvg ? "increasing" : "decreasing";
      const changePercent = Math.abs(
        ((recentAvg - earlierAvg) / earlierAvg) * 100
      );

      analysis[metric] = {
        direction: trendDirection,
        changePercent: changePercent.toFixed(1),
        severity:
          changePercent > 20 ? "high" : changePercent > 10 ? "medium" : "low",
      };
    });

    return analysis;
  };

  // Get combined data with predictions
  const getCombinedData = () => {
    if (!showPrediction) return enhancedHealthTrendData;

    const predictions = generatePredictions(
      enhancedHealthTrendData,
      selectedMetric,
      predictionMonths
    );
    return [...enhancedHealthTrendData, ...predictions];
  };

  const trendAnalysis = analyzeTrends();
  const revenueForecast = generateRevenueForecast(6);

  // Risk assessment based on trends
  const getRiskLevel = (metric) => {
    const analysis = trendAnalysis[metric];
    if (!analysis) return "low";

    if (
      metric === "incidents" &&
      analysis.direction === "increasing" &&
      analysis.severity === "high"
    ) {
      return "high";
    }
    if (
      (metric === "checkups" || metric === "vaccinations") &&
      analysis.direction === "decreasing" &&
      analysis.severity === "high"
    ) {
      return "high";
    }
    return analysis.severity;
  };

  const getRiskColor = (level) => {
    switch (level) {
      case "high":
        return "#ff4d4f";
      case "medium":
        return "#faad14";
      case "low":
        return "#52c41a";
      default:
        return "#d9d9d9";
    }
  };

  const exportReport = () => {
    // Mock export functionality
    console.log("Exporting analytics report...");
    // In real implementation, generate and download PDF/Excel report
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "up":
        return <TrendingUpOutlined style={{ color: "#ff4d4f" }} />;
      case "down":
        return <TrendingDownOutlined style={{ color: "#52c41a" }} />;
      default:
        return <Text type="secondary">—</Text>;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high":
        return "red";
      case "medium":
        return "orange";
      case "low":
        return "green";
      default:
        return "default";
    }
  };

  const classColumns = [
    {
      title: "Lớp",
      dataIndex: "class",
      key: "class",
      align: "center",
    },
    {
      title: "Tổng HS",
      dataIndex: "totalStudents",
      key: "totalStudents",
      align: "center",
    },
    {
      title: "HS khỏe mạnh",
      dataIndex: "healthyStudents",
      key: "healthyStudents",
      align: "center",
      render: (value) => <Text style={{ color: "#52c41a" }}>{value}</Text>,
    },
    {
      title: "HS cần theo dõi",
      dataIndex: "atRiskStudents",
      key: "atRiskStudents",
      align: "center",
      render: (value) => (
        <Text style={{ color: value > 0 ? "#fa8c16" : "#52c41a" }}>
          {value}
        </Text>
      ),
    },
    {
      title: "Tỷ lệ khỏe mạnh",
      dataIndex: "healthRate",
      key: "healthRate",
      align: "center",
      render: (value) => (
        <Progress
          type="circle"
          size={50}
          percent={value}
          format={(percent) => `${percent}%`}
          strokeColor={
            value >= 95 ? "#52c41a" : value >= 90 ? "#fa8c16" : "#ff4d4f"
          }
        />
      ),
    },
  ];

  const riskColumns = [
    {
      title: "Yếu tố nguy cơ",
      dataIndex: "factor",
      key: "factor",
    },
    {
      title: "Số HS",
      dataIndex: "students",
      key: "students",
      align: "center",
      render: (value) => <Text strong>{value}</Text>,
    },
    {
      title: "Xu hướng",
      dataIndex: "trend",
      key: "trend",
      align: "center",
      render: (trend) => getTrendIcon(trend),
    },
    {
      title: "Mức độ",
      dataIndex: "severity",
      key: "severity",
      align: "center",
      render: (severity) => (
        <Tag color={getSeverityColor(severity)}>
          {severity === "high"
            ? "Cao"
            : severity === "medium"
            ? "Trung bình"
            : "Thấp"}
        </Tag>
      ),
    },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 bg-gray-50 min-h-screen"
    >
      <div className="flex justify-between items-center mb-6">
        <Title level={2} className="text-blue-600 mb-0">
          <TrendingUpOutlined className="mr-2" />
          Phân tích nâng cao
        </Title>
        <Space>
          <Button
            icon={<SettingOutlined />}
            onClick={() => setPredictionModelVisible(true)}
          >
            Cấu hình dự đoán
          </Button>
          <Button
            icon={<DollarOutlined />}
            onClick={() => setRevenueForecastVisible(true)}
          >
            Dự báo doanh thu
          </Button>
          <Button
            type="primary"
            icon={<ExportOutlined />}
            onClick={exportReport}
          >
            Xuất báo cáo
          </Button>
        </Space>
      </div>
      {/* Enhanced Filter Controls */}
      <Card className="mb-6">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={6}>
            <Space>
              <CalendarOutlined />
              <Text strong>Thời gian:</Text>
              <Select
                value={timeRange}
                onChange={setTimeRange}
                style={{ width: 120 }}
              >
                <Option value="3months">3 tháng</Option>
                <Option value="6months">6 tháng</Option>
                <Option value="1year">1 năm</Option>
              </Select>
            </Space>
          </Col>
          <Col xs={24} sm={6}>
            <Space>
              <Text strong>Chỉ số:</Text>
              <Select
                value={selectedMetric}
                onChange={setSelectedMetric}
                style={{ width: 150 }}
              >
                <Option value="incidents">Sự cố y tế</Option>
                <Option value="checkups">Khám sức khỏe</Option>
                <Option value="vaccinations">Tiêm chủng</Option>
                <Option value="medications">Dùng thuốc</Option>
                <Option value="revenue">Doanh thu</Option>
              </Select>
            </Space>
          </Col>
          <Col xs={24} sm={6}>
            <Space>
              <FundProjectionScreenOutlined />
              <Text strong>Dự đoán:</Text>
              <Switch
                checked={showPrediction}
                onChange={setShowPrediction}
                checkedChildren="Bật"
                unCheckedChildren="Tắt"
              />
            </Space>
          </Col>
          <Col xs={24} sm={6}>
            <Space>
              <Text strong>Số tháng dự đoán:</Text>
              <InputNumber
                min={1}
                max={12}
                value={predictionMonths}
                onChange={setPredictionMonths}
                style={{ width: 80 }}
              />
            </Space>
          </Col>
        </Row>
      </Card>{" "}
      {/* Trend Analysis Alert */}
      {Object.values(trendAnalysis).some(
        (trend) => getRiskLevel(selectedMetric) === "high"
      ) && (
        <Alert
          message="Cảnh báo xu hướng"
          description={`Chỉ số ${selectedMetric} đang có xu hướng ${
            trendAnalysis[selectedMetric]?.direction === "increasing"
              ? "tăng"
              : "giảm"
          } đáng lo ngại (${trendAnalysis[selectedMetric]?.changePercent}%)`}
          type="warning"
          showIcon
          closable
          className="mb-6"
        />
      )}
      {/* Enhanced Key Metrics */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng học sinh"
              value={300}
              prefix={<UserOutlined style={{ color: "#1890ff" }} />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Sự cố y tế (tháng)"
              value={9}
              prefix={
                <WarningOutlined
                  style={{ color: getRiskColor(getRiskLevel("incidents")) }}
                />
              }
              suffix={
                <Tooltip
                  title={`${
                    trendAnalysis.incidents?.direction === "increasing"
                      ? "Tăng"
                      : "Giảm"
                  } ${trendAnalysis.incidents?.changePercent}% so với trước`}
                >
                  {trendAnalysis.incidents?.direction === "increasing" ? (
                    <TrendingUpOutlined
                      style={{ color: "#ff4d4f", fontSize: 14 }}
                    />
                  ) : (
                    <TrendingDownOutlined
                      style={{ color: "#52c41a", fontSize: 14 }}
                    />
                  )}
                </Tooltip>
              }
              valueStyle={{ color: getRiskColor(getRiskLevel("incidents")) }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tỷ lệ tiêm chủng"
              value={94.2}
              prefix={
                <SafetyCertificateOutlined
                  style={{ color: getRiskColor(getRiskLevel("vaccinations")) }}
                />
              }
              suffix={
                <Space>
                  <span>%</span>
                  <Tooltip
                    title={`${
                      trendAnalysis.vaccinations?.direction === "increasing"
                        ? "Tăng"
                        : "Giảm"
                    } ${trendAnalysis.vaccinations?.changePercent}%`}
                  >
                    {trendAnalysis.vaccinations?.direction === "increasing" ? (
                      <TrendingUpOutlined
                        style={{ color: "#52c41a", fontSize: 12 }}
                      />
                    ) : (
                      <TrendingDownOutlined
                        style={{ color: "#ff4d4f", fontSize: 12 }}
                      />
                    )}
                  </Tooltip>
                </Space>
              }
              valueStyle={{ color: getRiskColor(getRiskLevel("vaccinations")) }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Doanh thu (tháng)"
              value={22800000}
              prefix={<DollarOutlined style={{ color: "#52c41a" }} />}
              formatter={(value) => `${(value / 1000000).toFixed(1)}M`}
              suffix="VNĐ"
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>{" "}
      {/* Enhanced Charts Row 1 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={16}>
          <Card
            title={
              <Space>
                <LineChartOutlined />
                <span>Xu hướng sức khỏe theo thời gian</span>
                {showPrediction && (
                  <Badge
                    count="Dự đoán"
                    style={{ backgroundColor: "#52c41a" }}
                  />
                )}
              </Space>
            }
            className="h-full"
            extra={
              <Space>
                <Text type="secondary">Độ tin cậy: 85%</Text>
                <Button size="small" icon={<BarChartOutlined />}>
                  Chế độ xem
                </Button>
              </Space>
            }
          >
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={getCombinedData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="incidents"
                  stroke="#ff4d4f"
                  name="Sự cố y tế"
                  strokeDasharray={
                    showPrediction
                      ? (data) => (data.isPrediction ? "5 5" : "0")
                      : "0"
                  }
                />
                <Line
                  type="monotone"
                  dataKey="checkups"
                  stroke="#1890ff"
                  name="Khám sức khỏe"
                  strokeDasharray={
                    showPrediction
                      ? (data) => (data.isPrediction ? "5 5" : "0")
                      : "0"
                  }
                />
                <Line
                  type="monotone"
                  dataKey="vaccinations"
                  stroke="#52c41a"
                  name="Tiêm chủng"
                  strokeDasharray={
                    showPrediction
                      ? (data) => (data.isPrediction ? "5 5" : "0")
                      : "0"
                  }
                />
                <Line
                  type="monotone"
                  dataKey="medications"
                  stroke="#fa8c16"
                  name="Dùng thuốc"
                  strokeDasharray={
                    showPrediction
                      ? (data) => (data.isPrediction ? "5 5" : "0")
                      : "0"
                  }
                />
                {showPrediction && (
                  <ReferenceLine
                    x={`Dự đoán 1`}
                    stroke="#d9d9d9"
                    strokeDasharray="3 3"
                    label="Dự đoán"
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Phân bố bệnh thường gặp" className="h-full">
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={diseaseDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {diseaseDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
      {/* Revenue Forecasting Chart */}
      {selectedMetric === "revenue" && (
        <Row gutter={[16, 16]} className="mb-6">
          <Col span={24}>
            <Card
              title={
                <Space>
                  <DollarOutlined />
                  <span>Dự báo doanh thu 6 tháng tới</span>
                  <Badge
                    count="AI Forecast"
                    style={{ backgroundColor: "#722ed1" }}
                  />
                </Space>
              }
            >
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={revenueForecast}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip
                    formatter={(value, name) => [
                      name === "revenue"
                        ? `${(value / 1000000).toFixed(1)}M VNĐ`
                        : value,
                      name === "revenue" ? "Doanh thu dự đoán" : name,
                    ]}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="revenueMax"
                    stackId="1"
                    stroke="#d9d9d9"
                    fill="#f0f0f0"
                    name="Dự đoán cao"
                  />
                  <Area
                    type="monotone"
                    dataKey="revenueMin"
                    stackId="1"
                    stroke="#d9d9d9"
                    fill="#ffffff"
                    name="Dự đoán thấp"
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#52c41a"
                    strokeWidth={3}
                    name="Dự đoán trung bình"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>
      )}
      {/* Charts Row 2 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={12}>
          <Card title="Tiến độ tiêm chủng theo vaccine">
            <Space direction="vertical" style={{ width: "100%" }}>
              {vaccinationProgress.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <Text>{item.vaccine}</Text>
                    <Text>
                      {item.completed}/{item.total}
                    </Text>
                  </div>
                  <Progress
                    percent={item.percentage}
                    strokeColor={
                      item.percentage >= 95
                        ? "#52c41a"
                        : item.percentage >= 90
                        ? "#fa8c16"
                        : "#ff4d4f"
                    }
                  />
                </div>
              ))}
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Yếu tố nguy cơ sức khỏe">
            {riskFactors.some((factor) => factor.severity === "high") && (
              <Alert
                message="Cảnh báo"
                description="Có các yếu tố nguy cơ cao cần được theo dõi đặc biệt"
                type="warning"
                showIcon
                className="mb-4"
              />
            )}
            <Table
              columns={riskColumns}
              dataSource={riskFactors}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>{" "}
      {/* Health Statistics by Class */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Thống kê sức khỏe theo lớp">
            <Table
              columns={classColumns}
              dataSource={classHealthStats}
              pagination={false}
              scroll={{ x: 800 }}
            />
          </Card>
        </Col>
      </Row>
      {/* Prediction Model Configuration Modal */}
      <Modal
        title="Cấu hình mô hình dự đoán"
        open={predictionModelVisible}
        onCancel={() => setPredictionModelVisible(false)}
        onOk={() => {
          setPredictionModelVisible(false);
          message.success("Đã cập nhật cấu hình dự đoán!");
        }}
        okText="Lưu cấu hình"
        cancelText="Hủy"
      >
        <Form layout="vertical">
          <Form.Item label="Số tháng dự đoán">
            <InputNumber
              min={1}
              max={12}
              value={predictionMonths}
              onChange={setPredictionMonths}
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item label="Hệ số điều chỉnh theo mùa">
            <InputNumber
              min={0.5}
              max={2.0}
              step={0.1}
              value={seasonalFactor}
              onChange={setSeasonalFactor}
              style={{ width: "100%" }}
            />
          </Form.Item>{" "}
          <Divider />
          <Text type="secondary">
            Hệ số điều chỉnh theo mùa giúp cải thiện độ chính xác của dự đoán
            dựa trên các yếu tố thời vụ. Giá trị lớn hơn 1.0 sẽ tăng dự đoán,
            nhỏ hơn 1.0 sẽ giảm dự đoán.
          </Text>
        </Form>
      </Modal>
      {/* Revenue Forecast Modal */}
      <Modal
        title="Dự báo doanh thu chi tiết"
        open={revenueForecastVisible}
        onCancel={() => setRevenueForecastVisible(false)}
        footer={[
          <Button key="close" onClick={() => setRevenueForecastVisible(false)}>
            Đóng
          </Button>,
          <Button key="export" type="primary" icon={<ExportOutlined />}>
            Xuất báo cáo
          </Button>,
        ]}
        width={800}
      >
        <Table
          columns={[
            {
              title: "Tháng",
              dataIndex: "month",
              key: "month",
            },
            {
              title: "Dự đoán (VNĐ)",
              dataIndex: "revenue",
              key: "revenue",
              render: (value) => `${(value / 1000000).toFixed(1)}M`,
            },
            {
              title: "Khoảng tin cậy",
              key: "confidence",
              render: (_, record) => (
                <span>
                  {(record.revenueMin / 1000000).toFixed(1)}M -{" "}
                  {(record.revenueMax / 1000000).toFixed(1)}M
                </span>
              ),
            },
            {
              title: "Độ tin cậy",
              dataIndex: "confidence",
              key: "confidence",
              render: (value) => `${value.toFixed(1)}%`,
            },
          ]}
          dataSource={revenueForecast}
          pagination={false}
          size="small"
        />
      </Modal>
    </motion.div>
  );
}

export default AdvancedAnalytics;
