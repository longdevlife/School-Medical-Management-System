import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Upload,
  Space,
  Typography,
  Tag,
  Popconfirm,
  message,
  Row,
  Col,
  Switch,
  DatePicker,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UploadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

function NewsManagement() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [previewNews, setPreviewNews] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [form] = Form.useForm();

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockNews = [
      {
        id: 1,
        title: "5 Cách Phòng Ngừa Cảm Cúm Mùa Đông Cho Trẻ Em",
        content: `
          <h3>Giới thiệu</h3>
          <p>Mùa đông là thời điểm trẻ em dễ mắc các bệnh về đường hô hấp, đặc biệt là cảm cúm. Dưới đây là 5 cách hiệu quả để phòng ngừa cảm cúm cho trẻ em trong mùa đông.</p>
          
          <h3>1. Rửa tay thường xuyên</h3>
          <p>Việc rửa tay bằng xà phòng thường xuyên là biện pháp đơn giản nhưng hiệu quả nhất để ngăn ngừa virus xâm nhập vào cơ thể.</p>
          
          <h3>2. Tăng cường dinh dưỡng</h3>
          <p>Cung cấp đầy đủ vitamin C, vitamin D và các chất dinh dưỡng cần thiết để tăng cường hệ miễn dịch cho trẻ.</p>
          
          <h3>3. Giữ ấm cơ thể</h3>
          <p>Mặc đồ ấm, đặc biệt chú ý giữ ấm cổ, ngực và chân khi ra ngoài trời lạnh.</p>
          
          <h3>4. Vận động thể dục</h3>
          <p>Duy trì việc tập thể dục nhẹ nhàng để tăng cường sức khỏe và hệ miễn dịch.</p>
          
          <h3>5. Đảm bảo giấc ngủ đầy đủ</h3>
          <p>Trẻ em cần ngủ đủ 8-10 tiếng mỗi ngày để cơ thể có thể phục hồi và tăng cường miễn dịch.</p>
        `,
        excerpt:
          "Hướng dẫn các biện pháp phòng ngừa cảm cúm hiệu quả cho trẻ em trong mùa đông",
        category: "Phòng ngừa",
        author: "Y tá Nguyễn Thị An",
        authorId: "user1",
        publishDate: "2024-12-01",
        lastModified: "2024-12-01",
        status: "published",
        featured: true,
        views: 1250,
        tags: ["cảm cúm", "phòng ngừa", "trẻ em", "mùa đông"],
        thumbnail: null,
      },
      {
        id: 2,
        title: "Dinh Dưỡng Cân Bằng Cho Học Sinh Tiểu Học",
        content: `
          <h3>Tầm quan trọng của dinh dưỡng</h3>
          <p>Dinh dưỡng đóng vai trò quan trọng trong sự phát triển thể chất và trí tuệ của trẻ em ở độ tuổi tiểu học.</p>
          
          <h3>Các nhóm thực phẩm cần thiết</h3>
          <ul>
            <li>Protein: Thịt, cá, trứng, đậu</li>
            <li>Carbohydrate: Cơm, bánh mì, khoai</li>
            <li>Vitamin và khoáng chất: Rau xanh, trái cây</li>
            <li>Chất béo: Dầu ăn, hạt</li>
          </ul>
          
          <h3>Thực đơn mẫu</h3>
          <p>Gợi ý thực đơn cân bằng cho một ngày của học sinh tiểu học...</p>
        `,
        excerpt:
          "Tầm quan trọng của dinh dưỡng cân bằng và cách xây dựng thực đơn phù hợp",
        category: "Dinh dưỡng",
        author: "Bác sĩ Trần Văn Minh",
        authorId: "user2",
        publishDate: "2024-11-28",
        lastModified: "2024-11-30",
        status: "published",
        featured: false,
        views: 980,
        tags: ["dinh dưỡng", "học sinh", "thực đơn", "sức khỏe"],
        thumbnail: null,
      },
      {
        id: 3,
        title: "Hướng Dẫn Sơ Cứu Cơ Bản Cho Trẻ Em",
        content: `
          <h3>Các bước sơ cứu cơ bản</h3>
          <p>Nội dung đang được hoàn thiện...</p>
        `,
        excerpt:
          "Kỹ năng sơ cứu cần thiết cho giáo viên và phụ huynh khi trẻ gặp tai nạn",
        category: "Sơ cứu",
        author: "Bác sĩ Lê Thị Hoa",
        authorId: "user3",
        publishDate: null,
        lastModified: "2024-12-02",
        status: "draft",
        featured: false,
        views: 0,
        tags: ["sơ cứu", "tai nạn", "trẻ em"],
        thumbnail: null,
      },
    ];
    setTimeout(() => {
      setNews(mockNews);
      setLoading(false);
    }, 1000);
  }, []);

  const handleCreate = () => {
    setEditingNews(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (newsItem) => {
    setEditingNews(newsItem);
    form.setFieldsValue({
      ...newsItem,
      publishDate: newsItem.publishDate ? dayjs(newsItem.publishDate) : null,
    });
    setModalVisible(true);
  };

  const handleDelete = async (newsId) => {
    try {
      // API call to delete news
      setNews(news.filter((newsItem) => newsItem.id !== newsId));
      message.success("Xóa bài viết thành công!");
    } catch (error) {
      message.error("Xóa bài viết thất bại!");
    }
  };

  const handlePreview = (newsItem) => {
    setPreviewNews(newsItem);
    setPreviewModalVisible(true);
  };
  const handleSubmit = async (values) => {
    try {
      const newsData = {
        ...values,
        publishDate: values.publishDate
          ? values.publishDate.format("YYYY-MM-DD")
          : null,
        lastModified: new Date().toISOString().split("T")[0],
        author: "Manager Name", // Get from current user
        authorId: "current_user_id",
        views: editingNews ? editingNews.views : 0,
      };

      if (editingNews) {
        // Update existing news
        const updatedNews = news.map((newsItem) =>
          newsItem.id === editingNews.id
            ? { ...newsItem, ...newsData }
            : newsItem
        );
        setNews(updatedNews);
        message.success("Cập nhật bài viết thành công!");
      } else {
        // Create new news
        const newNewsItem = {
          id: Date.now(),
          ...newsData,
        };
        setNews([newNewsItem, ...news]);
        message.success("Tạo bài viết thành công!");
      }

      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error("Lưu bài viết thất bại!");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "published":
        return "green";
      case "draft":
        return "orange";
      case "archived":
        return "red";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "published":
        return "Đã xuất bản";
      case "draft":
        return "Bản nháp";
      case "archived":
        return "Đã lưu trữ";
      default:
        return status;
    }
  };
  const filteredNews = news.filter((newsItem) => {
    const matchesSearch =
      newsItem.title.toLowerCase().includes(searchText.toLowerCase()) ||
      newsItem.content.toLowerCase().includes(searchText.toLowerCase()) ||
      newsItem.tags.some((tag) =>
        tag.toLowerCase().includes(searchText.toLowerCase())
      );

    const matchesCategory =
      categoryFilter === "all" || newsItem.category === categoryFilter;
    const matchesStatus =
      statusFilter === "all" || newsItem.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const columns = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          {record.featured && (
            <Tag color="gold" className="ml-2">
              Nổi bật
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      width: 120,
      render: (category) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: "Tác giả",
      dataIndex: "author",
      key: "author",
      width: 150,
    },
    {
      title: "Ngày xuất bản",
      dataIndex: "publishDate",
      key: "publishDate",
      width: 130,
      render: (date) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "-",
    },
    {
      title: "Lượt xem",
      dataIndex: "views",
      key: "views",
      width: 80,
      sorter: (a, b) => a.views - b.views,
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 180,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handlePreview(record)}
          >
            Xem
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa bài viết này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const categories = [
    "Phòng ngừa",
    "Dinh dưỡng",
    "Tiêm chủng",
    "Sơ cứu",
    "Tâm lý",
  ];
  const statuses = ["published", "draft", "archived"];

  return (
    <div className="p-6">
      <div className="mb-6">
        {" "}
        <Title level={2} className="text-blue-600 mb-2">
          <EditOutlined className="mr-2" />
          Quản Lý Tin Tức
        </Title>
        <Text type="secondary">
          Tạo, chỉnh sửa và quản lý các bài viết tin tức về sức khỏe
        </Text>
      </div>
      {/* Filter and Actions */}
      <Card className="mb-6">
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Tìm kiếm bài viết..."
              prefix={<SearchOutlined />}
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={6} md={4}>
            <Select
              placeholder="Danh mục"
              style={{ width: "100%" }}
              value={categoryFilter}
              onChange={setCategoryFilter}
            >
              <Option value="all">Tất cả danh mục</Option>
              {categories.map((category) => (
                <Option key={category} value={category}>
                  {category}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={6} md={4}>
            <Select
              placeholder="Trạng thái"
              style={{ width: "100%" }}
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Option value="all">Tất cả trạng thái</Option>
              {statuses.map((status) => (
                <Option key={status} value={status}>
                  {getStatusText(status)}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={24} md={8} className="text-right">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={handleCreate}
            >
              Tạo bài viết mới
            </Button>
          </Col>
        </Row>
      </Card>
      {/* Blogs Table */}
      <Card>
        {" "}
        <Table
          columns={columns}
          dataSource={filteredNews}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} bài viết`,
          }}
        />
      </Card>
      {/* Create/Edit Modal */}{" "}
      <Modal
        title={editingNews ? "Chỉnh Sửa Bài Viết" : "Tạo Bài Viết Mới"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item
                name="title"
                label="Tiêu đề"
                rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
              >
                <Input placeholder="Nhập tiêu đề bài viết..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="category"
                label="Danh mục"
                rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}
              >
                <Select placeholder="Chọn danh mục">
                  {categories.map((category) => (
                    <Option key={category} value={category}>
                      {category}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[
                  { required: true, message: "Vui lòng chọn trạng thái!" },
                ]}
              >
                <Select placeholder="Chọn trạng thái">
                  {statuses.map((status) => (
                    <Option key={status} value={status}>
                      {getStatusText(status)}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="excerpt" label="Tóm tắt">
                <TextArea
                  rows={2}
                  placeholder="Nhập tóm tắt ngắn gọn về bài viết..."
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="content"
                label="Nội dung"
                rules={[{ required: true, message: "Vui lòng nhập nội dung!" }]}
              >
                <TextArea
                  rows={10}
                  placeholder="Nhập nội dung bài viết... (Hỗ trợ HTML)"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="tags" label="Tags">
                <Select
                  mode="tags"
                  placeholder="Nhập và chọn tags..."
                  tokenSeparators={[","]}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="featured"
                label="Nổi bật"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="publishDate" label="Ngày xuất bản">
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <div className="text-right mt-4">
            <Space>
              <Button onClick={() => setModalVisible(false)}>Hủy</Button>{" "}
              <Button type="primary" htmlType="submit">
                {editingNews ? "Cập nhật" : "Tạo mới"}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
      {/* Preview Modal */}
      <Modal
        title="Xem Trước Bài Viết"
        open={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {" "}
        {previewNews && (
          <div>
            <Title level={3}>{previewNews.title}</Title>
            <div className="mb-4">
              <Space wrap>
                <Text type="secondary">Tác giả: {previewNews.author}</Text>
                <Text type="secondary">
                  Ngày xuất bản:{" "}
                  {previewNews.publishDate
                    ? new Date(previewNews.publishDate).toLocaleDateString(
                        "vi-VN"
                      )
                    : "Chưa xuất bản"}
                </Text>
                <Tag color={getStatusColor(previewNews.status)}>
                  {getStatusText(previewNews.status)}
                </Tag>
                {previewNews.featured && <Tag color="gold">Nổi bật</Tag>}
              </Space>
            </div>
            <div className="mb-4">
              {previewNews.tags.map((tag) => (
                <Tag key={tag} color="blue">
                  {tag}
                </Tag>
              ))}
            </div>
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: previewNews.content }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}

export default NewsManagement;
