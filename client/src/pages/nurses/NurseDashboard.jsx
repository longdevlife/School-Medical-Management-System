/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  List,
  Typography,
  Badge,
  Progress,
  Space,
  Button,
  Modal,
  Checkbox,
  Select,
  DatePicker,
  message,
  Dropdown,
  Divider,
  Table,
  Tag,
} from "antd";
import {
  UserOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  TeamOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  DownloadOutlined,
  DragOutlined,
  EyeOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import authService from "../../services/authService";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

function NurseDashboard() {
  const currentUser = authService.getCurrentUser();
  const userRole = currentUser ? currentUser.role : "USER";

  // Widget configuration state
  const [widgets, setWidgets] = useState([
    {
      id: "stats",
      type: "statistics",
      title: "Thống kê tổng quan",
      enabled: true,
      position: 0,
    },
    {
      id: "quickStats",
      type: "quickStats",
      title: "Thống kê nhanh",
      enabled: true,
      position: 1,
    },
    {
      id: "activities",
      type: "activities",
      title: "Hoạt động gần đây",
      enabled: true,
      position: 2,
    },
    {
      id: "tasks",
      type: "tasks",
      title: "Nhiệm vụ sắp tới",
      enabled: true,
      position: 3,
    },
    {
      id: "charts",
      type: "charts",
      title: "Biểu đồ phân tích",
      enabled: userRole === "MANAGER",
      position: 4,
    },
    {
      id: "reports",
      type: "reports",
      title: "Báo cáo nhanh",
      enabled: userRole === "MANAGER",
      position: 5,
    },
  ]);

  // Modal states
  const [customizeModalVisible, setCustomizeModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState([]);
  const [exportFormat, setExportFormat] = useState("pdf");
  // Mock data - thay thế bằng API calls thực tế
  const dashboardData = {
    totalStudents: 150,
    totalMedicines: 45,
    upcomingEvents: 8,
    healthStaff: userRole === "MANAGER" ? 5 : 1,
    pendingCheckups: 12,
    vaccinations: 25,
    accidents: 3,
    completedTasks: 85,
    monthlyRevenue: userRole === "MANAGER" ? 25000000 : 0,
    satisfactionRate: userRole === "MANAGER" ? 95 : 0,
    efficiency: userRole === "MANAGER" ? 88 : 0,
  };

  // Chart data for Manager dashboard
  const chartData = {
    monthlyStats: [
      { month: "T1", students: 140, checkups: 85, accidents: 2 },
      { month: "T2", students: 145, checkups: 92, accidents: 1 },
      { month: "T3", students: 150, checkups: 88, accidents: 3 },
      { month: "T4", students: 148, checkups: 95, accidents: 1 },
      { month: "T5", students: 152, checkups: 90, accidents: 2 },
      { month: "T6", students: 150, checkups: 87, accidents: 3 },
    ],
    healthStatus: [
      { status: "Khỏe mạnh", count: 120, color: "#52c41a" },
      { status: "Cần theo dõi", count: 25, color: "#faad14" },
      { status: "Cần điều trị", count: 5, color: "#ff4d4f" },
    ],
  };

  // Widget drag and drop handler
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const newWidgets = Array.from(widgets);
    const [reorderedWidget] = newWidgets.splice(result.source.index, 1);
    newWidgets.splice(result.destination.index, 0, reorderedWidget);

    // Update positions
    const updatedWidgets = newWidgets.map((widget, index) => ({
      ...widget,
      position: index,
    }));

    setWidgets(updatedWidgets);
    message.success("Đã cập nhật bố cục dashboard!");
  };

  // Widget visibility toggle
  const toggleWidget = (widgetId, enabled) => {
    const updatedWidgets = widgets.map((widget) =>
      widget.id === widgetId ? { ...widget, enabled } : widget
    );
    setWidgets(updatedWidgets);
  };

  // Export dashboard functionality
  const handleExportDashboard = () => {
    const exportData = {
      dashboardData,
      dateRange: selectedDateRange,
      format: exportFormat,
      widgets: widgets.filter((w) => w.enabled),
      timestamp: new Date().toISOString(),
    };

    // Simulate export process
    message.loading("Đang xuất báo cáo...", 2);
    setTimeout(() => {
      message.success(
        `Đã xuất báo cáo dashboard dạng ${exportFormat.toUpperCase()}!`
      );
      setExportModalVisible(false);
    }, 2000);
  };

  const recentActivities = [
    {
      id: 1,
      type: "vaccination",
      student: "Nguyễn Văn A",
      activity: "Tiêm vaccine COVID-19",
      time: "2 giờ trước",
      status: "completed",
    },
    {
      id: 2,
      type: "checkup",
      student: "Trần Thị B",
      activity: "Khám sức khỏe định kỳ",
      time: "4 giờ trước",
      status: "pending",
    },
    {
      id: 3,
      type: "accident",
      student: "Lê Văn C",
      activity: "Xử lý vết thương nhỏ",
      time: "1 ngày trước",
      status: "completed",
    },
    {
      id: 4,
      type: "medicine",
      student: "Phạm Thị D",
      activity: "Cấp phát thuốc hạ sốt",
      time: "2 ngày trước",
      status: "completed",
    },
  ];

  const upcomingTasks = [
    {
      id: 1,
      task: "Khám sức khỏe định kỳ lớp 1A",
      date: "Hôm nay",
      priority: "high",
    },
    {
      id: 2,
      task: "Tiêm vaccine cho học sinh mới",
      date: "Ngày mai",
      priority: "medium",
    },
    { id: 3, task: "Kiểm tra kho thuốc", date: "2 ngày nữa", priority: "low" },
    { id: 4, task: "Báo cáo tháng", date: "1 tuần nữa", priority: "medium" },
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case "vaccination":
        return <SafetyCertificateOutlined style={{ color: "#52c41a" }} />;
      case "checkup":
        return <CheckCircleOutlined style={{ color: "#1890ff" }} />;
      case "accident":
        return <AlertOutlined style={{ color: "#ff4d4f" }} />;
      case "medicine":
        return <MedicineBoxOutlined style={{ color: "#722ed1" }} />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
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

  // Render different widget types
  const renderWidget = (widget) => {
    switch (widget.type) {
      case "statistics":
        return renderStatisticsWidget();
      case "quickStats":
        return renderQuickStatsWidget();
      case "activities":
        return renderActivitiesWidget();
      case "tasks":
        return renderTasksWidget();
      case "charts":
        return userRole === "MANAGER" ? renderChartsWidget() : null;
      case "reports":
        return userRole === "MANAGER" ? renderReportsWidget() : null;
      default:
        return null;
    }
  };

  const renderStatisticsWidget = () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={6}>
        <Card hoverable>
          <Statistic
            title="Tổng số học sinh"
            value={dashboardData.totalStudents}
            prefix={<TeamOutlined style={{ color: "#0F6CBD" }} />}
            valueStyle={{ color: "#0F6CBD" }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card hoverable>
          <Statistic
            title="Số lượng thuốc"
            value={dashboardData.totalMedicines}
            prefix={<MedicineBoxOutlined style={{ color: "#722ed1" }} />}
            valueStyle={{ color: "#722ed1" }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card hoverable>
          <Statistic
            title="Sự kiện sắp tới"
            value={dashboardData.upcomingEvents}
            prefix={<CalendarOutlined style={{ color: "#faad14" }} />}
            valueStyle={{ color: "#faad14" }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card hoverable>
          <Statistic
            title={
              userRole === "MANAGER" ? "Doanh thu tháng" : "Nhiệm vụ hoàn thành"
            }
            value={
              userRole === "MANAGER"
                ? `${dashboardData.monthlyRevenue.toLocaleString()} VNĐ`
                : `${dashboardData.completedTasks}%`
            }
            prefix={<UserOutlined style={{ color: "#52c41a" }} />}
            valueStyle={{ color: "#52c41a" }}
          />
        </Card>
      </Col>
    </Row>
  );

  const renderQuickStatsWidget = () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Space>
            <CheckCircleOutlined
              style={{ fontSize: "24px", color: "#1890ff" }}
            />
            <div>
              <Text strong>{dashboardData.pendingCheckups}</Text>
              <br />
              <Text type="secondary">Khám chờ xử lý</Text>
            </div>
          </Space>
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Space>
            <SafetyCertificateOutlined
              style={{ fontSize: "24px", color: "#52c41a" }}
            />
            <div>
              <Text strong>{dashboardData.vaccinations}</Text>
              <br />
              <Text type="secondary">Tiêm chủng tháng này</Text>
            </div>
          </Space>
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Space>
            <AlertOutlined style={{ fontSize: "24px", color: "#ff4d4f" }} />
            <div>
              <Text strong>{dashboardData.accidents}</Text>
              <br />
              <Text type="secondary">Sự cố y tế</Text>
            </div>
          </Space>
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Progress
            type="circle"
            percent={
              userRole === "MANAGER"
                ? dashboardData.satisfactionRate
                : dashboardData.completedTasks
            }
            size={60}
            strokeColor={{
              "0%": "#108ee9",
              "100%": "#87d068",
            }}
          />
          <br />
          <Text type="secondary">
            {userRole === "MANAGER" ? "Mức độ hài lòng" : "Tiến độ công việc"}
          </Text>
        </Card>
      </Col>
    </Row>
  );

  const renderActivitiesWidget = () => (
    <Card
      title="Hoạt động gần đây"
      extra={<Button type="link">Xem tất cả</Button>}
    >
      <List
        itemLayout="horizontal"
        dataSource={recentActivities}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              avatar={getActivityIcon(item.type)}
              title={<Text strong>{item.student}</Text>}
              description={
                <div>
                  <Text>{item.activity}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    {item.time} •
                    <Badge
                      status={
                        item.status === "completed" ? "success" : "processing"
                      }
                      text={
                        item.status === "completed"
                          ? "Hoàn thành"
                          : "Đang xử lý"
                      }
                    />
                  </Text>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );

  const renderTasksWidget = () => (
    <Card
      title="Nhiệm vụ sắp tới"
      extra={<Button type="link">Quản lý nhiệm vụ</Button>}
    >
      <List
        itemLayout="horizontal"
        dataSource={upcomingTasks}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              avatar={
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: getPriorityColor(item.priority),
                  }}
                />
              }
              title={<Text strong>{item.task}</Text>}
              description={<Text type="secondary">{item.date}</Text>}
            />
          </List.Item>
        )}
      />
    </Card>
  );

  const renderChartsWidget = () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={12}>
        <Card title="Thống kê theo tháng" extra={<BarChartOutlined />}>
          <div
            style={{
              height: "200px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text type="secondary">Biểu đồ cột thống kê 6 tháng gần đây</Text>
          </div>
        </Card>
      </Col>
      <Col xs={24} lg={12}>
        <Card title="Tình trạng sức khỏe" extra={<PieChartOutlined />}>
          <div style={{ padding: "16px" }}>
            {chartData.healthStatus.map((item, index) => (
              <div key={index} style={{ marginBottom: "8px" }}>
                <Space>
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      backgroundColor: item.color,
                      borderRadius: "2px",
                    }}
                  />
                  <Text>{item.status}: </Text>
                  <Text strong>{item.count} học sinh</Text>
                </Space>
              </div>
            ))}
          </div>
        </Card>
      </Col>
    </Row>
  );

  const renderReportsWidget = () => (
    <Card
      title="Báo cáo nhanh"
      extra={
        <Space>
          <Button type="link" icon={<EyeOutlined />}>
            Xem chi tiết
          </Button>
          <Button type="primary" icon={<DownloadOutlined />}>
            Tải báo cáo
          </Button>
        </Space>
      }
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <div className="text-center p-4 border rounded">
            <Title level={4} className="text-blue-600">
              {dashboardData.efficiency}%
            </Title>
            <Text type="secondary">Hiệu quả hoạt động</Text>
          </div>
        </Col>
        <Col xs={24} md={8}>
          <div className="text-center p-4 border rounded">
            <Title level={4} className="text-green-600">
              {dashboardData.satisfactionRate}%
            </Title>
            <Text type="secondary">Mức độ hài lòng</Text>
          </div>
        </Col>
        <Col xs={24} md={8}>
          <div className="text-center p-4 border rounded">
            <Title level={4} className="text-purple-600">
              {dashboardData.healthStaff}
            </Title>
            <Text type="secondary">Nhân viên hoạt động</Text>
          </div>
        </Col>
      </Row>
    </Card>
  );
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ padding: "24px" }}
    >
      {/* Header with Dashboard Controls */}
      <div className="flex justify-between items-center mb-6">
        <Title level={2} style={{ marginBottom: 0, color: "#0F6CBD" }}>
          Tổng quan hệ thống {userRole === "MANAGER" ? "Quản lý" : "Y tế"}
        </Title>

        {userRole === "MANAGER" && (
          <Space>
            <Button
              icon={<SettingOutlined />}
              onClick={() => setCustomizeModalVisible(true)}
            >
              Tùy chỉnh
            </Button>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => setExportModalVisible(true)}
            >
              Xuất báo cáo
            </Button>
          </Space>
        )}
      </div>

      {/* Draggable Widgets */}
      {userRole === "MANAGER" ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="dashboard-widgets">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {widgets
                  .filter((widget) => widget.enabled)
                  .sort((a, b) => a.position - b.position)
                  .map((widget, index) => (
                    <Draggable
                      key={widget.id}
                      draggableId={widget.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          style={{
                            marginBottom: "24px",
                            backgroundColor: snapshot.isDragging
                              ? "#f6f6f6"
                              : "transparent",
                            borderRadius: snapshot.isDragging ? "8px" : "0",
                            padding: snapshot.isDragging ? "8px" : "0",
                            ...provided.draggableProps.style,
                          }}
                        >
                          <Card
                            title={
                              <div className="flex items-center">
                                <div
                                  {...provided.dragHandleProps}
                                  className="mr-2 cursor-move"
                                >
                                  <DragOutlined />
                                </div>
                                {widget.title}
                              </div>
                            }
                            className="shadow-sm"
                          >
                            {renderWidget(widget)}
                          </Card>
                        </div>
                      )}
                    </Draggable>
                  ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        // Standard layout for non-managers
        <div>
          {/* Statistics Cards */}
          <div style={{ marginBottom: "24px" }}>{renderStatisticsWidget()}</div>

          {/* Quick Stats */}
          <div style={{ marginBottom: "24px" }}>{renderQuickStatsWidget()}</div>

          {/* Recent Activities and Tasks */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              {renderActivitiesWidget()}
            </Col>
            <Col xs={24} lg={12}>
              {renderTasksWidget()}
            </Col>
          </Row>
        </div>
      )}

      {/* Customize Modal */}
      <Modal
        title="Tùy chỉnh Dashboard"
        open={customizeModalVisible}
        onCancel={() => setCustomizeModalVisible(false)}
        onOk={() => {
          setCustomizeModalVisible(false);
          message.success("Đã lưu cài đặt dashboard!");
        }}
        width={600}
      >
        <div className="space-y-4">
          <Text strong>Chọn các widget hiển thị:</Text>
          <div className="space-y-2">
            {widgets.map((widget) => (
              <div
                key={widget.id}
                className="flex items-center justify-between p-3 border rounded"
              >
                <Space>
                  <DragOutlined className="text-gray-400" />
                  <Text>{widget.title}</Text>
                </Space>
                <Checkbox
                  checked={widget.enabled}
                  onChange={(e) => toggleWidget(widget.id, e.target.checked)}
                />
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Export Modal */}
      <Modal
        title="Xuất báo cáo Dashboard"
        open={exportModalVisible}
        onCancel={() => setExportModalVisible(false)}
        onOk={handleExportDashboard}
        okText="Xuất báo cáo"
        cancelText="Hủy"
      >
        <div className="space-y-4">
          <div>
            <Text strong>Khoảng thời gian:</Text>
            <RangePicker
              style={{ width: "100%", marginTop: "8px" }}
              value={selectedDateRange}
              onChange={setSelectedDateRange}
            />
          </div>
          <div>
            <Text strong>Định dạng:</Text>
            <Select
              style={{ width: "100%", marginTop: "8px" }}
              value={exportFormat}
              onChange={setExportFormat}
            >
              <Option value="pdf">PDF</Option>
              <Option value="excel">Excel</Option>
              <Option value="png">PNG</Option>
            </Select>
          </div>
          <div>
            <Text strong>Nội dung báo cáo:</Text>
            <div className="mt-2 space-y-2">
              {widgets
                .filter((w) => w.enabled)
                .map((widget) => (
                  <Tag key={widget.id} color="blue">
                    {widget.title}
                  </Tag>
                ))}
            </div>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}

export default NurseDashboard;
