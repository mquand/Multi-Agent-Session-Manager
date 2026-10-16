# Multi-Agent Session Manager (VS Code Extension)

[![Visual Studio Code](https://img.shields.io/badge/VS%20Code-Extension-blue.svg)](https://marketplace.visualstudio.com)
[![Platform](https://img.shields.io/badge/Platform-macOS%20%7C%20Linux%20%7C%20Windows-brightgreen.svg)]()
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Release](https://img.shields.io/badge/Release-v0.1.0-orange.svg)](https://github.com/mquand/Multi-Agent-Session-Manager/releases)

> Extension trực quan, nhẹ và thời gian thực giúp bạn theo dõi, quản lý, phân loại và chuyển đổi nhanh giữa các phiên làm việc (session) từ **nhiều AI coding agent khác nhau** (Claude Code, Google Antigravity / Gemini, Cursor AI, OpenAI Codex, GitHub Copilot Chat và Windsurf Cascade) trực tiếp trên VS Code. Hỗ trợ cả quy trình **Issue/Ticket (`#xxxx`)** lẫn **chat tự do hàng ngày**.

---

## 💡 Vấn đề extension giải quyết

Khi lập trình viên sử dụng kết hợp nhiều AI Agent cùng lúc:
- **Claude Code** chạy trên terminal giải quyết các tác vụ agentic lớn.
- **Google Antigravity / Gemini** thực hiện phân tích logic sâu và thao tác code đa file.
- **Cursor AI** xử lý composer và trao đổi dự án.
- **OpenAI Codex** chạy các rollout CLI.
- **GitHub Copilot Chat** hỗ trợ trực tiếp trong trình soạn thảo.
- **Windsurf (Cascade)** biên tập luồng code phức tạp.

Lịch sử chat và phiên làm việc bị phân tán ở nhiều thư mục và định dạng khác nhau (JSONL, SQLite DB, Protobuf). Bạn không biết task nào đang **chạy (running)**, task nào đang **chờ duyệt lệnh (`need accept`)**, task nào đã xong.

**Multi-Agent Session Manager** tự động quét dữ liệu cục bộ của tất cả các AI trên máy tính, chuẩn hóa về một giao diện thống nhất và đưa lên Dashboard tiện lợi ngay trên thanh công cụ VS Code.

---

## ✨ Các AI Agent được hỗ trợ

| AI Agent | Định dạng lưu trữ | Thư mục mặc định | Tính năng nổi bật |
| :--- | :--- | :--- | :--- |
| 🤖 **Claude Code** | JSONL + JSON runtime | `~/.claude/projects/` | Theo dõi runtime PID, phân tích token, bắt sự kiện chờ duyệt lệnh |
| ✨ **Google Antigravity / Gemini** | JSONL transcript + SQLite DB | `~/.gemini/antigravity/brain/` | Phân tích step-based planner, tự động trích xuất Git Repo & Branch |
| 🎯 **Cursor AI** | JSONL transcript | `~/.cursor/projects/` | Quét lịch sử transcript theo từng dự án, phát hiện Issue ID |
| 💻 **OpenAI Codex** | Rollout JSONL | `~/.codex/sessions/` | Quét đệ quy cây thư mục rollout, theo dõi prompt và token |
| 🐙 **GitHub Copilot Chat** | SQLite Database | `AppData/.../github.copilot-chat/` | Truy vấn trực tiếp `session-store.db`, ánh xạ Repo & Git Branch |
| 🌊 **Windsurf (Cascade)** | Protocol Buffer (`.pb`) | `~/.codeium/windsurf/cascade/` | Theo dõi dung lượng phiên, hỗ trợ xoá file phình to tránh đơ IDE |

---

## 🚀 Các tính năng chính

### 1. Dashboard trạng thái thời gian thực
- 🔵 **RUNNING**: Nhận diện task đang thực thi (qua Process ID của Claude hoặc cập nhật hoạt động gần nhất của các agent khác).
- 🟡 **NEED ACCEPT**: Bắt chính xác thời điểm AI dừng lại xin phép bạn duyệt lệnh terminal hoặc áp dụng file code.
- 🟢 **DONE**: Hiển thị các task đã xong với mốc thời gian tương đối (`vừa xong`, `5 phút trước`, `2 giờ trước`).

### 2. Thanh lọc Agent linh hoạt (Filter Pills)
- Các nút lọc nhanh trên đầu giao diện: **Tất cả AI**, **Claude**, **Gemini**, **Cursor**, **Codex**, **Copilot**, và **Windsurf**.
- Hiển thị số lượng phiên thời gian thực trên từng nút lọc.
- Badge màu sắc riêng biệt cho từng AI trên mỗi card session.

### 3. Nhận diện Git Branch & Worktree thông minh
- Tự động nhận diện Git Repository và nhánh Git tương ứng với từng session.
- Tương thích hoàn toàn với Git Worktree (tự động phân giải file `.git` trỏ đến `gitdir`).
- 1 click để lọc session theo dự án hiện tại hoặc theo từng nhánh/worktree cụ thể.

### 4. Tích hợp thanh trạng thái (Status Bar)
- Dòng trạng thái tổng hợp trực quan ở góc dưới màn hình:  
  `AI: 9 Claude • 50 Gemini • 7 Cursor • 15 Copilot • 38 Windsurf`
- Nhấp chuột để mở menu chọn lọc nhanh và chuyển thẳng vào danh sách session của agent mong muốn.

### 5. Đa vị trí hiển thị tiện dụng
- **Activity Bar (Thanh bên trái)**: Biểu tượng AI riêng biệt với badge số lượng thông báo theo thời gian thực.
- **Thanh Explorer (Cây thư mục)**: Xem danh sách session ngay trong panel quản lý file.
- **Source Control (SCM)**: Xem danh sách session đặt cạnh tab Git.

### 6. Xoá phiên hội thoại an toàn & Dọn dẹp ổ đĩa
- Xoá triệt để các phiên chat cũ hoặc các file `.pb` dung lượng lớn của Windsurf Cascade để giải phóng bộ nhớ và tránh lỗi treo IDE.
- Hộp thoại xác nhận an toàn tránh xoá nhầm dữ liệu.

### 7. Mở nhanh phiên làm việc (Instant Session Jump)
- Click vào card session để kích hoạt AI agent tương ứng hoặc mở file transcript trực tiếp trong trình biên soạn VS Code.

### 8. Tự động kiểm tra & Cập nhật từ GitHub Releases
- Tự động kiểm tra phiên bản mới trên GitHub mỗi khi khởi động VS Code.
- Cập nhật chỉ với **1 click**: Extension tự tải file `.vsix` mới nhất và cài đặt trực tiếp, không cần thao tác thủ công.

---

## ⚙️ Cài đặt cấu hình

Mở Cài đặt VS Code (`Ctrl+,` hoặc `Cmd+,`) và tìm kiếm `multiAgentSessionManager`:

| Thiết lập | Mặc định | Ý nghĩa |
| :--- | :--- | :--- |
| `enabledAgents` | `["claude", "gemini", "cursor", "codex", "copilot", "windsurf"]` | Danh sách các AI agent được bật theo dõi |
| `autoRefreshInterval` | `10` | Chu kỳ tự động quét lại (giây) |
| `language` | `"auto"` | Ngôn ngữ hiển thị giao diện (`auto`, `vi`, `en`) |
| `showInExplorer` | `true` | Hiển thị trong thanh Explorer |
| `showInSourceControl` | `true` | Hiển thị trong thanh Source Control (Git) |
| `storagePath` | `~/.claude/projects` | Đường dẫn lưu trữ Claude Code |
| `geminiStoragePath` | `""` | Đường dẫn lưu trữ Gemini / Antigravity |
| `cursorStoragePath` | `""` | Đường dẫn lưu trữ Cursor AI |
| `codexStoragePath` | `""` | Đường dẫn lưu trữ OpenAI Codex |
| `copilotStoragePath` | `""` | Đường dẫn lưu trữ GitHub Copilot (`session-store.db`) |
| `windsurfStoragePath` | `""` | Đường dẫn lưu trữ Windsurf Cascade (`.pb`) |

---

## 📦 Hướng dẫn cài đặt

### Cách 1: Cài đặt từ file `.vsix` đóng gói sẵn (Khuyến nghị)
1. Tải bản `.vsix` mới nhất tại [GitHub Releases](https://github.com/mquand/Multi-Agent-Session-Manager/releases).
2. Trong VS Code, nhấn tổ hợp phím `Ctrl+Shift+P` (hoặc `Cmd+Shift+P` trên macOS).
3. Nhập `Extensions: Install from VSIX...` và chọn file `.vsix` vừa tải.
4. Chọn **Reload Window** để áp dụng.

### Cách 2: Biên dịch từ mã nguồn
```bash
git clone https://github.com/mquand/Multi-Agent-Session-Manager.git
cd "Multi-Agent-Session-Manager"
npm install
npm run compile
```

---

## 📄 Bản quyền (License)

MIT © [mhquan](https://github.com/mquand)
