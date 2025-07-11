# School Medical Management System
# School Medical Management System

Hệ thống quản lý y tế học đường hỗ trợ quản lý hồ sơ sức khỏe, sự kiện y tế, thuốc men, tiêm chủng, báo cáo và nhiều chức năng khác cho trường học.

## 1. Giới thiệu
- **Frontend:** ReactJS (thư mục `client/`)
- **Backend:** .NET (C#) (thư mục `Sever/`)
- Quản lý học sinh, phụ huynh, nhân viên y tế, sự kiện y tế, thuốc, tiêm chủng, báo cáo, v.v.

## 2. Yêu cầu hệ thống
- **Node.js** >= 16.x (cho frontend)
- **.NET SDK** >= 8.0 (cho backend)
- **SQL Server** (hoặc cấu hình database tương ứng)

## 3. Cài đặt & chạy Backend
```bash
cd Sever/Sever
# Cài đặt package nếu cần (thường không cần với .NET)
dotnet restore
# Chạy migration (nếu cần)
dotnet ef database update
# Chạy server
 dotnet run
```
- File cấu hình: `appsettings.json`, `appsettings.Development.json`

## 4. Cài đặt & chạy Frontend
```bash
cd client
npm install
npm run dev
```
- Truy cập: http://localhost:5173 (hoặc port được hiển thị)

## 5. Cấu trúc thư mục chính
```text
School-Medical-Management-System/
├── client/           # ReactJS frontend
│   └── src/
│       ├── api/      # Giao tiếp API
│       ├── components/ # UI components
│       ├── pages/    # Các trang chức năng
│       └── ...
├── Sever/            # .NET backend
│   ├── Controllers/  # API controllers
│   ├── DTO/          # Data Transfer Objects
│   ├── Model/        # Entity models
│   ├── Repository/   # Data access
│   ├── Service/      # Business logic
│   └── ...
└── README.md         # File hướng dẫn này
```

## 6. Đóng góp
- Fork repo, tạo branch mới, commit và gửi pull request.
- Mọi ý kiến đóng góp hoặc báo lỗi xin gửi về nhóm phát triển.

## 7. Thông tin liên hệ
- (Bổ sung thông tin nhóm hoặc email nếu cần)
