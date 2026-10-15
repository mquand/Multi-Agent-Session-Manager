# Multi-Agent Session Manager

## Dự án làm gì?

**Multi-Agent Session Manager** là VS Code Extension giúp developer theo dõi và quản lý các phiên làm việc (session) từ nhiều AI agent khác nhau (Claude, Cursor, Gemini, Devin, v.v.) trong cùng một giao diện thống nhất.

### Vấn đề giải quyết

Khi làm việc với nhiều AI agent cùng lúc:
- Bạn mở nhiều task trên nhiều agent khác nhau nhưng không quản lý được tổng quan
- Mỗi agent có giao diện riêng, khó switch nhanh giữa các session
- Lịch sử chat bị phân tán, khó tìm lại đúng ngữ cảnh cũ

### Cách hoạt động

Extension quét trực tiếp:
- Session data từ từng agent (Claude: `~/.claude/projects/`, Cursor: `~/.cursor/projects/`, Gemini: `~/.gemini/antigravity/brain/`)
- Phân tích format riêng của từng agent (role-based, step-based, v.v.)
- Map tất cả về unified interface thống nhất

Sau đó hiển thị thành Dashboard với:
- Filter theo agent type (All, Claude, Cursor, Gemini, v.v.)
- Agent badge để phân biệt nguồn
- Dashboard thống nhất cho tất cả agent

### Giá trị mang lại

- **Một giao diện cho nhiều agent**: Không cần switch giữa các UI khác nhau
- **Tổng quan toàn bộ**: Xem tất cả session từ tất cả agent ở một nơi
- **Filter nhanh**: Chỉ xem session của agent cụ thể khi cần
- **Architecture mở rộng**: Dễ dàng thêm agent mới thông qua adapter pattern

## Tính năng chính

- 🤖 Hỗ trợ đa AI agent (Claude, Cursor, Gemini)
- 📊 Dashboard thời gian thực theo dõi trạng thái (Running, Need Accept, Done)
- 🔍 Phân tích token, branch git, repo
- 🎯 Filter và switch nhanh giữa các session
- 📱 Hiển thị trên Activity Bar, Explorer, Source Control

## Trạng thái

🚧 Phase thiết kế kiến trúc - Sẵn sàng refactoring từ Claude-only sang Multi-Agent. Repository đã được push lên GitHub.
