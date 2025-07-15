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
import { getNewsByManager, createNewsByManager } from "../../api/newsApi";

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

  // Hàm lấy danh sách ảnh từ nhiều cấu trúc backend khác nhau
  function getImagesFromNewsItem(item) {
    let images = [];
    // Debug chi tiết các trường có thể chứa ảnh
    console.log("🔍 Debugging all possible image fields for", item.id || item.NewsID || item.newsID);
    console.log("📋 item.image:", item.image);
    console.log("📋 item.file:", item.file);
    console.log("📋 item.files:", item.files);
    console.log("📋 Full item:", item);

    // Nếu item.image là mảng string (kiểu ['url1', ...])
    if (Array.isArray(item.image) && typeof item.image[0] === "string") {
      images = item.image.filter((img) => typeof img === "string" && img.startsWith("http"));
    }
    // Nếu item.image là mảng object (kiểu [{url: "..."}])
    else if (item.image && Array.isArray(item.image) && item.image.length > 0) {
      images = item.image
        .map((imageData) => {
          const link = imageData.url;
          if (link && typeof link === "string" && link.startsWith("http")) {
            console.log(`✅ Found image URL from 'image' field: ${link}`);
            return link;
          }
          return null;
        })
        .filter(Boolean);
    }
    // Fallback cho cấu trúc cũ với 'file' field
    else if (item.file && Array.isArray(item.file) && item.file.length > 0) {
      images = item.file
        .map((fileData) => {
          const link = fileData.fileLink;
          if (link && typeof link === "string" && link.startsWith("http")) {
            console.log(`✅ Found image URL from 'file' field: ${link}`);
            return link;
          }
          return null;
        })
        .filter(Boolean);
    }
    // Fallback cho các trường khác (backward compatibility)
    else if (item.files && Array.isArray(item.files)) {
      images = item.files
        .map((fileData) => {
          const link =
            fileData.FileLink || fileData.fileLink || fileData.file_link;
          if (link && typeof link === "string" && link.startsWith("http"))
            return link;
          if (typeof fileData === "string" && fileData.startsWith("http"))
            return fileData;
          return null;
        })
        .filter(Boolean);
    } else if (
      item.fileLink &&
      typeof item.fileLink === "string" &&
      item.fileLink.startsWith("http")
    ) {
      images = [item.fileLink];
    } else if (Array.isArray(item.images)) {
      images = item.images
        .map((img) =>
          typeof img === "string"
            ? img.startsWith("http")
              ? img
              : null
            : img.FileLink || img.fileLink || img.file_link || null
        )
        .filter(Boolean);
    }

    console.log(`🖼️ Final images for ${item.id || item.NewsID || item.newsID}:`, images);
    return images;
  }

  // Mock data - replace with actual API call
  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await getNewsByManager();
        const newsArr = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setNews(
          newsArr.map((item, idx) => {
            // Nếu có trường image là mảng string, ưu tiên lấy trường này
            let images = getImagesFromNewsItem(item);

            // Nếu không có ảnh, kiểm tra trường image nhập từ form (nếu có)
            if (
              (!images || images.length === 0) &&
              item.image &&
              typeof item.image === "string" &&
              item.image.startsWith("http")
            ) {
              images = [item.image];
            }
            // Đảm bảo status đúng kiểu boolean với mọi trường hợp (0/1, "0"/"1", true/false)
            // Log để kiểm tra kiểu dữ liệu thực tế của status
            console.log("DEBUG status fields:", item.status, typeof item.status, item.Status, typeof item.Status, item);

            // Nếu status là boolean thì giữ nguyên, nếu không thì kiểm tra các trường hợp khác
            let statusValue = false;
            if (typeof item.status === "boolean") {
              statusValue = item.status;
            } else if (typeof item.status === "number") {
              statusValue = Number(item.status) === 1;
            } else if (typeof item.status === "string") {
              statusValue = item.status === "1" || item.status === "true";
            } else if (typeof item.Status === "boolean") {
              statusValue = item.Status;
            } else if (typeof item.Status === "number") {
              statusValue = Number(item.Status) === 1;
            } else if (typeof item.Status === "string") {
              statusValue = item.Status === "1" || item.Status === "true";
            }
            // Nếu statusValue vẫn là false, log cảnh báo để kiểm tra dữ liệu backend
            if (!statusValue) {
              console.warn("⚠️ Bản ghi có status=false hoặc không xác định, kiểm tra dữ liệu backend:", item);
            }
            return {
              ...item,
              id: item.id || item.NewsID || item.newsID || item.newsID || `N${idx + 1}`,
              title: item.title || item.Title,
              publishDate: item.publishDate || item.PublishDate || item.dateTime || null,
              status: statusValue,
              tags: item.tags || item.Tags || [],
              featured: item.featured ?? item.Featured ?? false,
              author:
                item.author ||
                item.Author ||
                (item.user && (item.user.name || item.user.userName)) ||
                item.userName ||
                item.UserName ||
                "",
              images: images.length > 0 && images[0].startsWith("http") ? images : [],
            };
          })
        );
      } catch (error) {
        message.error("Không thể tải danh sách tin tức!");
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, []);

  const handleCreate = () => {
    setEditingNews(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (newsItem) => {
    setEditingNews(newsItem);

    // Nếu có ảnh (images[0]), hiển thị lên trường Upload
    let imageFileList = [];
    if (newsItem.images && newsItem.images.length > 0) {
      imageFileList = [
        {
          uid: "-1",
          name: "Ảnh đại diện",
          status: "done",
          url: newsItem.images[0],
        },
      ];
    }

    form.setFieldsValue({
      ...newsItem,
      image: imageFileList,
      publishDate: newsItem.publishDate ? dayjs(newsItem.publishDate) : null,
    });
    setModalVisible(true);
  };

  const handleDelete = async (newsId) => {
    try {
      // Nếu newsId là object hoặc có trường khác, lấy đúng trường id thực tế (newsID)
      const realId = typeof newsId === "object" && newsId.newsID ? newsId.newsID : newsId;
      const response = await fetch(
        `https://localhost:7040/api/manager/delete-news/${realId}`,
        {
          method: "DELETE",
          credentials: "include",
          headers:
            localStorage.getItem("token")
              ? { Authorization: "Bearer " + localStorage.getItem("token") }
              : undefined,
        }
      );
      if (response.status === 401) {
        message.error("Bạn chưa đăng nhập hoặc không có quyền xóa bài viết này (401 Unauthorized). Vui lòng đăng nhập lại.");
        return;
      }
      if (!response.ok) {
        let errorMsg = "Xóa bài viết thất bại!";
        try {
          const errorData = await response.json();
          if (errorData?.message) errorMsg = errorData.message;
        } catch (e) {}
        message.error(errorMsg);
        return;
      }
      // Reload lại danh sách từ backend để đồng bộ với database
      const res = await getNewsByManager();
      const newsArr = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setNews(
        newsArr.map((item, idx) => {
          let images = getImagesFromNewsItem(item);
          if (
            (!images || images.length === 0) &&
            item.image &&
            typeof item.image === "string" &&
            item.image.startsWith("http")
          ) {
            images = [item.image];
          }
          return {
            ...item,
            id: item.id || item.NewsID || item.newsID || item.newsID || `N${idx + 1}`,
            title: item.title || item.Title,
            publishDate: item.publishDate || item.PublishDate || item.dateTime || null,
            // Giữ nguyên status là boolean nếu backend trả về boolean
            status: typeof item.status === "boolean"
              ? item.status
              : item.status || item.Status || false,
            tags: item.tags || item.Tags || [],
            featured: item.featured ?? item.Featured ?? false,
            author:
              item.author ||
              item.Author ||
              (item.user && (item.user.name || item.user.userName)) ||
              item.userName ||
              item.UserName ||
              "",
            images: images.length > 0 && images[0].startsWith("http") ? images : [],
          };
        })
      );
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
      // Chuẩn bị dữ liệu cho API /api/manager/create-news
      const { title, excerpt, content, image } = values;
      const formData = new FormData();

      // Lấy file ảnh từ trường image (Antd Upload)
      let fileObj = null;
      let previewUrl = "";
      if (image && Array.isArray(image)) {
        if (image[0]?.originFileObj) {
          fileObj = image[0].originFileObj;
        } else if (image[0]?.url) {
          // Nếu là ảnh preview (edit), lấy url để hiển thị ngay sau khi tạo
          previewUrl = image[0].url;
        }
      }

      // Nếu không có file mới (chỉ có url cũ), không gửi request tạo mới
      if (!fileObj) {
        message.error("Vui lòng chọn lại ảnh đại diện mới để tạo bài viết!");
        return;
      }
      formData.append("Image", fileObj, fileObj.name);

      // Thêm các trường query vào URL
      const params = new URLSearchParams({
        Title: title?.trim() || "",
        Summary: excerpt?.trim() || "",
        Body: content?.trim() || "",
      }).toString();

      // Gọi API tạo mới bài viết
      let response;
      try {
        response = await fetch(
          "https://localhost:7040/api/manager/create-news?" + params,
          {
            method: "POST",
            body: formData,
            credentials: "include",
            // Không gửi Authorization nếu không có token
            headers:
              localStorage.getItem("token")
                ? { Authorization: "Bearer " + localStorage.getItem("token") }
                : undefined,
          }
        );
        if (response.status === 401) {
          message.error("Bạn chưa đăng nhập hoặc không có quyền thực hiện thao tác này (401 Unauthorized). Vui lòng đăng nhập lại.");
          // Gợi ý đăng nhập lại
          // window.location.href = "/login"; // Nếu muốn chuyển hướng sang trang đăng nhập
          return;
        }
        if (!response.ok) {
          const errorData = await response.json();
          if (errorData?.errors?.Image) {
            message.error("Ảnh đại diện là bắt buộc. " + errorData.errors.Image[0]);
          } else if (errorData?.message) {
            message.error(errorData.message);
          } else {
            message.error("Lưu bài viết thất bại!");
          }
          return;
        }
      } catch (error) {
        message.error("Lưu bài viết thất bại!");
        return;
      }

      // Sau khi tạo thành công, thêm bài viết mới vào đầu danh sách với dữ liệu vừa nhập
      const newNews = {
        id: "NEW_" + Date.now(),
        title,
        publishDate: new Date().toISOString(),
        status: "draft",
        tags: [],
        featured: false,
        author: "Bạn",
        images: previewUrl ? [previewUrl] : [],
        excerpt,
        content,
      };
      setNews((prev) => [newNews, ...prev]);

      message.success("Tạo bài viết thành công!");
      setModalVisible(false);
      form.resetFields();
      // Không reload lại danh sách từ backend để giữ đúng dữ liệu vừa nhập
    } catch (error) {
      // Hiển thị lỗi chi tiết từ backend nếu có
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else if (error.response?.data) {
        message.error(JSON.stringify(error.response.data));
      } else {
        message.error("Lưu bài viết thất bại!");
      }
    }
  };

  // Hàm cập nhật bài viết (PUT /api/manager/update-news)
  const handleUpdate = async (values) => {
    try {
      // Lấy đúng trường NewsID từ editingNews hoặc values
      const newsId = editingNews?.newsID || editingNews?.id || values.id;
      const { title, excerpt, content, image } = values;
      const formData = new FormData();

      if (!newsId || !title || !content) {
        message.error("Vui lòng nhập đầy đủ các trường bắt buộc (ID, tiêu đề, nội dung)!");
        return;
      }

      // Lấy file ảnh từ trường image (Antd Upload)
      let fileObj = null;
      let previewUrl = "";
      if (image && Array.isArray(image)) {
        if (image[0]?.originFileObj) {
          fileObj = image[0].originFileObj;
        } else if (image[0]?.url) {
          previewUrl = image[0].url;
        }
      }
      if (fileObj) {
        formData.append("Image", fileObj, fileObj.name);
      }

      // Đảm bảo gửi đúng trường NewsID cho backend
      formData.append("NewsID", newsId);
      formData.append("Title", title?.trim() || "");
      formData.append("Summary", excerpt?.trim() || "");
      formData.append("Body", content?.trim() || "");

      // Debug dữ liệu gửi lên
      for (let pair of formData.entries()) {
        console.log("UPDATE FORM DATA:", pair[0], pair[1]);
      }

      const response = await fetch("https://localhost:7040/api/manager/update-news", {
        method: "PUT",
        body: formData,
        credentials: "include",
        headers:
          localStorage.getItem("token")
            ? { Authorization: "Bearer " + localStorage.getItem("token") }
            : undefined,
      });

      if (response.status === 400) {
        let errorMsg = "Cập nhật bài viết thất bại! (400 Bad Request)";
        try {
          const errorData = await response.json();
          if (errorData?.errors) {
            errorMsg = Object.values(errorData.errors).flat().join(" ");
          } else if (errorData?.message) {
            errorMsg = errorData.message;
          }
        } catch (e) {}
        message.error(errorMsg);
        return;
      }
      if (response.status === 401) {
        message.error("Bạn chưa đăng nhập hoặc không có quyền cập nhật bài viết này (401 Unauthorized). Vui lòng đăng nhập lại.");
        return;
      }
      if (!response.ok) {
        let errorMsg = "Cập nhật bài viết thất bại!";
        try {
          const errorData = await response.json();
          if (errorData?.errors?.Image) {
            errorMsg = "Ảnh đại diện là bắt buộc. " + errorData.errors.Image[0];
          } else if (errorData?.message) {
            errorMsg = errorData.message;
          }
        } catch (e) {}
        message.error(errorMsg);
        return;
      }

      // Sau khi cập nhật thành công, reload lại danh sách
      const res = await getNewsByManager();
      const newsArr = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setNews(
        newsArr.map((item, idx) => {
          // Nếu có trường image là mảng string, ưu tiên lấy trường này
          let images = getImagesFromNewsItem(item);

          // Nếu không có ảnh, kiểm tra trường image nhập từ form (nếu có)
          if (
            (!images || images.length === 0) &&
            item.image &&
            typeof item.image === "string" &&
            item.image.startsWith("http")
          ) {
            images = [item.image];
          }
          // Đảm bảo status đúng kiểu boolean với mọi trường hợp (0/1, "0"/"1", true/false)
          // Log để kiểm tra kiểu dữ liệu thực tế của status
          console.log("DEBUG status fields:", item.status, typeof item.status, item.Status, typeof item.Status, item);

          // Nếu status là boolean thì giữ nguyên, nếu không thì kiểm tra các trường hợp khác
          let statusValue = false;
          if (typeof item.status === "boolean") {
            statusValue = item.status;
          } else if (typeof item.status === "number") {
            statusValue = Number(item.status) === 1;
          } else if (typeof item.status === "string") {
            statusValue = item.status === "1" || item.status === "true";
          } else if (typeof item.Status === "boolean") {
            statusValue = item.Status;
          } else if (typeof item.Status === "number") {
            statusValue = Number(item.Status) === 1;
          } else if (typeof item.Status === "string") {
            statusValue = item.Status === "1" || item.Status === "true";
          }
          return {
            ...item,
            id: item.id || item.NewsID || item.newsID || item.newsID || `N${idx + 1}`,
            title: item.title || item.Title,
            publishDate: item.publishDate || item.PublishDate || item.dateTime || null,
            status: statusValue,
            tags: item.tags || item.Tags || [],
            featured: item.featured ?? item.Featured ?? false,
            author:
              item.author ||
              item.Author ||
              (item.user && (item.user.name || item.user.userName)) ||
              item.userName ||
              item.UserName ||
              "",
            images: images.length > 0 && images[0].startsWith("http") ? images : [],
          };
        })
      );
      message.success("Cập nhật bài viết thành công!");
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error("Cập nhật bài viết thất bại!");
    }
  };

  // Chuyển đổi status boolean thành string cho hiển thị
  const getStatusText = (status) => {
    // Nếu status là boolean, false = "Đã xóa", true = "Đã lưu"
    if (status === false) return "Đã xóa";
    if (status === true) return "Đã lưu";
    switch (status) {
      case "published":
        return "Đã lưu";
      case "draft":
        return "Đã xóa";
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    if (status === true) return "green";
    if (status === false) return "orange";
    switch (status) {
      case "published":
        return "green";
      case "draft":
        return "orange";
      default:
        return "default";
    }
  };
  // Lọc trạng thái: nếu chọn 'Đã lưu' (published) thì chỉ hiện status===true, các trạng thái khác lọc như cũ
  // Chỉ tìm kiếm theo title
  const filteredNews = news.filter((newsItem) => {
    const matchesSearch =
      newsItem.title.toLowerCase().includes(searchText.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || newsItem.category === categoryFilter;

    let matchesStatus = true;
    if (statusFilter === "published") {
      matchesStatus = newsItem.status === true;
    } else if (statusFilter === "draft") {
      matchesStatus = newsItem.status === false;
    } else if (statusFilter !== "all") {
      matchesStatus = newsItem.status === statusFilter;
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const columns = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status, record) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status, record)}</Tag>
      ),
    },
    {
      title: "News ID",
      dataIndex: "id",
      key: "id",
      width: 100,
      render: (id) => <span>{id}</span>,
    },
    {
      title: "Ngày xuất bản",
      dataIndex: "publishDate",
      key: "publishDate",
      width: 180,
      render: (date) => (date ? date : "-"),
    },
    {
      title: "Ảnh",
      dataIndex: "images",
      key: "images",
      width: 100,
      render: (images) =>
        images && images.length > 0 ? (
          <img
            src={images[0]}
            alt="thumbnail"
            style={{
              width: "100%",
              height: "auto",
              maxHeight: 80,
              objectFit: "cover",
              borderRadius: 4,
              display: "block"
            }}
          />
        ) : (
          <span style={{ color: "#aaa" }}>Không có ảnh</span>
        ),
    },

    {
      title: "Thao tác",
      key: "actions",
      width: 180,
      render: (_, record) => (
        <Space>
          <Button
            type="default"
            shape="circle"
            icon={<EyeOutlined />}
            onClick={() => handlePreview(record)}
          />
          <Button
            type="default"
            shape="circle"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa bài viết này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              type="default"
              shape="circle"
              danger
              icon={<DeleteOutlined />}
            />
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
  const statuses = ["published", "draft"];

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
        <Form
          form={form}
          layout="vertical"
          onFinish={editingNews ? handleUpdate : handleSubmit}
        >
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
            {/* Bỏ trường danh mục */}
            {/* 
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
            */}
          
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
            {/* Bỏ 3 trường: Tags, Nổi bật, Ngày xuất bản */}
            {/* 
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
            */}
            <Col span={24}>
              <Form.Item
                name="image"
                label="Ảnh đại diện"
                valuePropName="fileList"
                getValueFromEvent={(e) => {
                  if (Array.isArray(e)) {
                    return e;
                  }
                  return e?.fileList;
                }}
              >
                <Upload
                  name="image"
                  listType="picture"
                  accept="image/*"
                  beforeUpload={() => false}
                  maxCount={1}
                >
                  <Button icon={<UploadOutlined />}>Tải lên ảnh</Button>
                </Upload>
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
        {previewNews && (
          <div>
            <Title level={2} className="mb-2">{previewNews.title}</Title>
            <div className="mb-2">
              <Space wrap>
                <Text type="secondary">
                  Ngày xuất bản: {previewNews.publishDate || "Chưa xuất bản"}
                </Text>
                <Tag color={getStatusColor(previewNews.status)}>
                  {getStatusText(previewNews.status)}
                </Tag>
              </Space>
            </div>
            {previewNews.images && previewNews.images.length > 0 && (
              <div className="mb-4">
                <img
                  src={previewNews.images[0]}
                  alt="Ảnh đại diện"
                  style={{
                    width: "100%",
                    height: "auto",
                    objectFit: "contain",
                    borderRadius: 8,
                    marginBottom: 16,
                    display: "block"
                  }}
                />
              </div>
            )}
            {previewNews.excerpt && (
              <div className="mb-4">
                <Text strong>Tóm tắt:</Text>
                <div style={{ marginTop: 4 }}>{previewNews.excerpt}</div>
              </div>
            )}
            {/* Thêm phần body chi tiết */}
            {previewNews.body && (
              <div className="mb-4">
                <Text strong>Nội dung chi tiết:</Text>
                <div
                  style={{
                    marginTop: 4,
                    background: "#fff",
                    padding: 16,
                    borderRadius: 8,
                  }}
                  dangerouslySetInnerHTML={{ __html: previewNews.body }}
                />
              </div>
            )}
            <div className="mb-4">
              {previewNews.tags &&
                previewNews.tags.map((tag, idx) => (
                  <Tag key={tag + "-" + idx} color="blue">
                    {tag}
                  </Tag>
                ))}
            </div>
            <div
              className="prose max-w-none"
              style={{ background: "#fff", padding: 16, borderRadius: 8 }}
              dangerouslySetInnerHTML={{ __html: previewNews.content }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}

export default NewsManagement;

