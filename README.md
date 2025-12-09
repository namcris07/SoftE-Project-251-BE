
# 🎓 SoftE-Project-251-BE - Hệ thống Quản lý Gia sư

Backend API cho hệ thống quản lý gia sư, được xây dựng với Node.js, Express và MySQL. 

## 📋 Mục lục

- [Giới thiệu](#giới-thiệu)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Cài đặt và chạy dự án](#cài-đặt-và-chạy-dự-án)
- [API Documentation](#api-documentation)
- [Tính năng chính](#tính-năng-chính)

---

## 🚀 Giới thiệu

Hệ thống quản lý gia sư là một nền tảng kết nối giữa sinh viên và gia sư, cung cấp các tính năng: 

- **Quản lý người dùng**: Hỗ trợ 3 vai trò (Admin, Tutor, Student)
- **Đăng nhập SSO**: Tích hợp xác thực SSO cho sinh viên HCMUT
- **Quản lý lớp học**: Tạo, đăng ký và quản lý các lớp học
- **Quản lý buổi học**: Lịch học, booking, và trạng thái buổi học
- **Tài liệu học tập**: Upload, duyệt và tải tài liệu
- **Nhắn tin**: Hệ thống chat giữa sinh viên và gia sư
- **Thông báo**: Hệ thống thông báo tự động

---

## 🛠 Công nghệ sử dụng

### Backend Framework & Libraries
- **Node.js** (v18+) - Runtime environment
- **Express. js** (v4.19.2) - Web framework
- **Sequelize** (v6.37.0) - ORM cho MySQL

### Database
- **MySQL** (v8.0+) - Hệ quản trị cơ sở dữ liệu

### Authentication & Security
- **JWT** (jsonwebtoken v9.0.2) - Xác thực token
- **bcrypt** (v6.0.0) - Mã hóa mật khẩu
- **CORS** (v2.8.5) - Cross-Origin Resource Sharing

### File Upload & Processing
- **Multer** (v2.0.2) - Upload file
- **Cheerio** (v1.1.2) - HTML parsing
- **xml2js** (v0.6.2) - XML parsing

### API Documentation
- **Swagger UI Express** (v5.0.1) - API documentation UI
- **Swagger Autogen** (v2.23.7) - Tự động generate Swagger docs

### Other Utilities
- **dotenv** (v16.6.1) - Environment variables
- **node-cron** (v4.2.1) - Scheduled jobs
- **axios** (v1.13.2) - HTTP client
- **dateformat** (v5.0.3) - Date formatting

---

## 📁 Cấu trúc dự án

```
SoftE-Project-251-BE/
│
├── src/
│   ├── config/
│   │   ├── database.js          # Cấu hình kết nối MySQL với Sequelize
│   │   ├── swagger.js            # Cấu hình Swagger API documentation
│   │   └── swagger-output.json   # File swagger tự động generate
│   │
│   ├── models/
│   │   ├── index.js              # Export tất cả models và định nghĩa relationships
│   │   ├── User.js               # Model người dùng (Admin, Tutor, Student)
│   │   ├── Role.js               # Model vai trò
│   │   ├── Tutor.js              # Model hồ sơ gia sư
│   │   ├── Student.js            # Model hồ sơ sinh viên
│   │   ├── Course.js             # Model lớp học
│   │   ├── Session.js            # Model buổi học
│   │   ├── Booking.js            # Model đăng ký buổi học
│   │   ├── Document.js           # Model tài liệu
│   │   ├── Message.js            # Model tin nhắn
│   │   ├── Notification.js       # Model thông báo
│   │   └── TutorSubject.js       # Model môn học của gia sư
│   │
│   ├── controllers/
│   │   ├── auth.controller.js           # Xử lý đăng nhập, đăng ký, SSO
│   │   ├── user.controller.js           # CRUD người dùng
│   │   ├── session.controller.js        # Quản lý buổi học
│   │   ├── booking.controller.js        # Quản lý booking
│   │   ├── course.controller.js         # Quản lý lớp học
│   │   ├── tutorProfile.controller.js   # Quản lý hồ sơ gia sư
│   │   ├── student.controller.js        # Quản lý hồ sơ sinh viên
│   │   ├── adminDocumentController.js   # Admin duyệt tài liệu
│   │   ├── message.controller.js        # Xử lý tin nhắn
│   │   └── notification.controller.js   # Xử lý thông báo
│   │
│   ├── routes/
│   │   ├── auth.routes.js          # Routes xác thực
│   │   ├── user.routes. js          # Routes người dùng
│   │   ├── admin.routes.js         # Routes admin
│   │   ├── session.routes.js       # Routes buổi học
│   │   ├── booking.routes.js       # Routes booking
│   │   ├── course.routes.js        # Routes lớp học
│   │   ├── tutorProfile. routes.js  # Routes hồ sơ gia sư
│   │   ├── student.routes.js       # Routes sinh viên
│   │   ├── documentRoutes.js       # Routes tài liệu
│   │   ├── message.routes.js       # Routes tin nhắn
│   │   ├── conversation.routes.js  # Routes cuộc trò chuyện
│   │   └── contact.routes.js       # Routes danh bạ
│   │
│   ├── middleware/
│   │   └── auth.middleware.js      # Middleware xác thực JWT và phân quyền
│   │
│   ├── cron/
│   │   └── reminder.job.js         # Cronjob gửi thông báo nhắc nhở
│   │
│   ├── utils/
│   │   └── casClient.js            # Xác thực SSO với hệ thống trường
│   │
│   └── server.js                   # Entry point của ứng dụng
│
├── uploads/                        # Thư mục lưu file upload
├── . env                            # Biến môi trường
├── .dockerignore                   # Docker ignore file
├── dockerfile                      # Docker configuration
├── init. sql                        # Script khởi tạo database
├── package.json                    # Dependencies và scripts
└── README.md                       # File này
```

---

## ⚙️ Cài đặt và chạy dự án

### 1️⃣ Yêu cầu hệ thống

- **Node.js** >= 18.x
- **MySQL** >= 8.0
- **npm** hoặc **yarn**

### 2️⃣ Clone repository

```bash
git clone https://github.com/namcris07/SoftE-Project-251-BE.git
cd SoftE-Project-251-BE
```

### 3️⃣ Cài đặt dependencies

```bash
npm install
```

### 4️⃣ Cấu hình database

**Tạo database MySQL:**

```bash
mysql -u root -p < init.sql
```

Hoặc chạy từng lệnh trong MySQL:

```sql
CREATE DATABASE tutor_ss CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tutor_ss;
-- Sau đó import init.sql
```

### 5️⃣ Cấu hình biến môi trường

Tạo file `.env` trong thư mục root với nội dung:

```env
# Database Configuration
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASS=your_password_here
DB_NAME=tutor_ss

# Server Configuration
PORT=3000

# JWT Secret Key
JWT_SECRET=your_secret_key_here
```

**⚠️ Lưu ý:** Thay `your_password_here` và `your_secret_key_here` bằng giá trị thực tế của bạn.

### 6️⃣ Chạy dự án

**Development mode:**

```bash
npm run dev
```

Server sẽ chạy tại:  `http://localhost:3000`

### 7️⃣ Kiểm tra kết nối

```bash
curl http://localhost:3000/health
```

Response:  `{"ok": true}`

---

## 📚 API Documentation

Sau khi chạy server, truy cập Swagger UI tại: 

```
http://localhost:3000/docs
```

### Các endpoint chính:

#### 🔐 Authentication (`/api/auth`)
- `POST /api/auth/login` - Đăng nhập thông thường
- `POST /api/auth/loginSSO` - Đăng nhập SSO (HCMUT)
- `POST /api/auth/register` - Đăng ký tài khoản

#### 👤 Users (`/api/users`)
- `GET /api/users/profile` - Lấy thông tin cá nhân
- `PUT /api/users/profile` - Cập nhật thông tin
- `GET /api/users/: id` - Lấy thông tin user theo ID

#### 🏫 Courses (`/api/courses`)
- `GET /api/courses` - Danh sách lớp học
- `POST /api/courses` - Tạo lớp học (Tutor)
- `GET /api/courses/:id` - Chi tiết lớp học
- `PUT /api/courses/:id` - Cập nhật lớp học
- `DELETE /api/courses/:id` - Xóa lớp học

#### 📖 Sessions (`/api/sessions`)
- `GET /api/sessions` - Danh sách buổi học
- `POST /api/sessions` - Tạo buổi học
- `PUT /api/sessions/:id` - Cập nhật buổi học
- `DELETE /api/sessions/:id` - Xóa buổi học

#### 📝 Bookings (`/api/bookings`)
- `GET /api/bookings` - Danh sách booking
- `POST /api/bookings` - Đăng ký buổi học
- `PUT /api/bookings/:id/confirm` - Xác nhận booking
- `PUT /api/bookings/:id/cancel` - Hủy booking

#### 📄 Documents (`/api/documents`)
- `GET /api/documents` - Danh sách tài liệu
- `POST /api/documents` - Upload tài liệu
- `GET /api/documents/:id` - Tải tài liệu
- `DELETE /api/documents/:id` - Xóa tài liệu

#### 💬 Messages (`/api/messages`)
- `GET /api/messages` - Lấy tin nhắn
- `POST /api/messages` - Gửi tin nhắn
- `PUT /api/messages/:id/read` - Đánh dấu đã đọc

#### 🔔 Notifications (`/api/notifications`)
- `GET /api/notifications` - Danh sách thông báo
- `PUT /api/notifications/:id/read` - Đánh dấu đã đọc
- `DELETE /api/notifications/:id` - Xóa thông báo

#### ⚙️ Admin (`/api/admin`)
- `GET /api/admin/users` - Quản lý người dùng
- `POST /api/admin/users` - Tạo user mới
- `PUT /api/admin/users/:id` - Cập nhật user
- `DELETE /api/admin/users/:id` - Xóa user
- `GET /api/admin/documents` - Quản lý tài liệu
- `PUT /api/admin/documents/approve/: id` - Duyệt tài liệu
- `PUT /api/admin/documents/reject/:id` - Từ chối tài liệu

---

## 🎯 Tính năng chính

### 1. **Hệ thống phân quyền 3 cấp**
- **Admin**: Quản lý toàn bộ hệ thống
- **Tutor**: Tạo lớp học, quản lý buổi học, upload tài liệu
- **Student**: Đăng ký lớp, booking buổi học, tải tài liệu

### 2. **Xác thực SSO**
- Tích hợp với hệ thống CAS của HCMUT
- Tự động tạo tài khoản sinh viên khi đăng nhập lần đầu

### 3. **Quản lý lớp học**
- Tạo lớp học với thông tin chi tiết
- Giới hạn số lượng học sinh
- Yêu cầu duyệt (optional)

### 4. **Hệ thống booking thông minh**
- Đặt lịch học với gia sư
- Xác nhận/hủy booking
- Tự động cập nhật trạng thái

### 5. **Quản lý tài liệu**
- Upload tài liệu theo lớp học
- Admin duyệt tài liệu
- Thống kê số lượt tải

### 6. **Nhắn tin realtime**
- Chat 1-1 giữa sinh viên và gia sư
- Đánh dấu đã đọc/chưa đọc

### 7. **Thông báo tự động**
- Nhắc nhở buổi học sắp diễn ra (Cronjob)
- Thông báo khi có booking mới

---

## 🐳 Chạy bằng Docker (Optional)

```bash
docker build -t tutor-backend .
docker run -p 3000:3000 --env-file .env tutor-backend
```
