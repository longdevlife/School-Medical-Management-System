import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Input,
  Select,
  Button,
  Typography,
  Spin,
  Empty,
  Tag,
  Space,
  message,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  CalendarOutlined,
  UserOutlined,
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

function HomePage() {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Mock data for blogs - replace with actual API call
  useEffect(() => {
    const mockBlogs = [
      {
        id: 1,
        title: "5 Cách Phòng Ngừa Cảm Cúm Mùa Đông Cho Trẻ Em",
        content:
          "Mùa đông là thời điểm trẻ em dễ mắc các bệnh về đường hô hấp...",
        excerpt:
          "Hướng dẫn các biện pháp phòng ngừa cảm cúm hiệu quả cho trẻ em trong mùa đông",
        category: "Phòng ngừa",
        author: "Y tá Nguyễn Thị An",
        publishDate: "2024-12-01",
        views: 1250,
        tags: ["cảm cúm", "phòng ngừa", "trẻ em", "mùa đông"],
        featured: true,
      },
      {
        id: 2,
        title: "Dinh Dưỡng Cân Bằng Cho Học Sinh Tiểu Học",
        content:
          "Dinh dưỡng đóng vai trò quan trọng trong sự phát triển của trẻ...",
        excerpt:
          "Tầm quan trọng của dinh dưỡng cân bằng và cách xây dựng thực đơn phù hợp",
        category: "Dinh dưỡng",
        author: "Bác sĩ Trần Văn Minh",
        publishDate: "2024-11-28",
        views: 980,
        tags: ["dinh dưỡng", "học sinh", "thực đơn", "sức khỏe"],
        featured: false,
      },
      {
        id: 3,
        title: "Lịch Tiêm Chủng Cần Thiết Cho Trẻ Mầm Non",
        content: "Tiêm chủng là biện pháp phòng ngừa bệnh tật hiệu quả nhất...",
        excerpt:
          "Hướng dẫn chi tiết về lịch tiêm chủng theo độ tuổi cho trẻ mầm non",
        category: "Tiêm chủng",
        author: "Y tá Phạm Thị Lan",
        publishDate: "2024-11-25",
        views: 1540,
        tags: ["tiêm chủng", "mầm non", "vaccine", "lịch tiêm"],
        featured: true,
      },
      {
        id: 4,
        title: "Xử Lý Sơ Cứu Khi Trẻ Bị Chấn Thương Nhẹ",
        content: "Hướng dẫn các bước sơ cứu cơ bản khi trẻ gặp tai nạn nhỏ...",
        excerpt:
          "Kỹ năng sơ cứu cần thiết cho giáo viên và phụ huynh khi trẻ bị thương",
        category: "Sơ cứu",
        author: "Bác sĩ Lê Thị Hoa",
        publishDate: "2024-11-20",
        views: 2100,
        tags: ["sơ cứu", "chấn thương", "tai nạn", "trẻ em"],
        featured: false,
      },
    ];

    setTimeout(() => {
      setBlogs(mockBlogs);
      setFilteredBlogs(mockBlogs);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter and search blogs
  useEffect(() => {
    let filtered = blogs;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((blog) => blog.category === selectedCategory);
    }

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(
        (blog) =>
          blog.title.toLowerCase().includes(searchText.toLowerCase()) ||
          blog.content.toLowerCase().includes(searchText.toLowerCase()) ||
          blog.tags.some((tag) =>
            tag.toLowerCase().includes(searchText.toLowerCase())
          )
      );
    }

    // Sort blogs
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.publishDate) - new Date(a.publishDate);
        case "oldest":
          return new Date(a.publishDate) - new Date(b.publishDate);
        case "most-viewed":
          return b.views - a.views;
        case "alphabetical":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    setFilteredBlogs(filtered);
  }, [blogs, searchText, selectedCategory, sortBy]);

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const categories = [
    { value: "all", label: "Tất cả danh mục" },
    { value: "Phòng ngừa", label: "Phòng ngừa" },
    { value: "Dinh dưỡng", label: "Dinh dưỡng" },
    { value: "Tiêm chủng", label: "Tiêm chủng" },
    { value: "Sơ cứu", label: "Sơ cứu" },
  ];

  const sortOptions = [
    { value: "newest", label: "Mới nhất" },
    { value: "oldest", label: "Cũ nhất" },
    { value: "most-viewed", label: "Xem nhiều nhất" },
    { value: "alphabetical", label: "Theo tên A-Z" },
  ];
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 text-center">
        <Title level={2} className="text-blue-600 mb-2">
          Trang Chủ - Kiến Thức Y Tế
        </Title>
        <Typography.Paragraph className="text-gray-600">
          Khám phá các bài viết hữu ích về sức khỏe và chăm sóc trẻ em
        </Typography.Paragraph>
      </div>

      {/* Search and Filter Section */}
      <Card className="mb-6 rounded-lg shadow-md">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Tìm kiếm bài viết..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleSearch}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={6} md={4}>
            <Select
              placeholder="Danh mục"
              size="large"
              style={{ width: "100%" }}
              value={selectedCategory}
              onChange={handleCategoryChange}
            >
              {categories.map((category) => (
                <Option key={category.value} value={category.value}>
                  {category.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={6} md={4}>
            <Select
              placeholder="Sắp xếp"
              size="large"
              style={{ width: "100%" }}
              value={sortBy}
              onChange={handleSortChange}
            >
              {sortOptions.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Blog Content */}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <Spin size="large" />
        </div>
      ) : filteredBlogs.length === 0 ? (
        <Empty description="Không tìm thấy bài viết nào" />
      ) : (
        <Row gutter={[16, 16]}>
          {filteredBlogs.map((blog) => (
            <Col xs={24} sm={12} lg={8} key={blog.id}>
              <Card
                className={`h-full rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative ${
                  blog.featured ? "border-2 border-yellow-400" : ""
                }`}
                hoverable
                actions={[
                  <Button
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() =>
                      message.info("Chức năng xem chi tiết sẽ được cập nhật")
                    }
                  >
                    Xem chi tiết
                  </Button>,
                ]}
              >
                {blog.featured && (
                  <div className="absolute top-3 right-3 z-10">
                    <Tag color="gold">Nổi bật</Tag>
                  </div>
                )}

                <Card.Meta
                  title={
                    <Title
                      level={4}
                      className="mb-2 text-gray-800 leading-tight line-clamp-2"
                    >
                      {blog.title}
                    </Title>
                  }
                  description={
                    <div>
                      <Paragraph
                        ellipsis={{ rows: 2 }}
                        className="text-gray-600 mb-4"
                      >
                        {blog.excerpt}
                      </Paragraph>

                      <div className="mb-3">
                        <Space direction="vertical" size="small">
                          <div className="text-gray-500 text-sm">
                            <UserOutlined className="mr-1" /> {blog.author}
                          </div>
                          <div className="text-gray-500 text-sm">
                            <CalendarOutlined className="mr-1" />{" "}
                            {formatDate(blog.publishDate)}
                          </div>
                          <div className="text-gray-500 text-sm">
                            <EyeOutlined className="mr-1" /> {blog.views} lượt
                            xem
                          </div>
                        </Space>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {blog.tags.map((tag, index) => (
                          <Tag key={index} color="blue" size="small">
                            {tag}
                          </Tag>
                        ))}
                      </div>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}

export default HomePage;
