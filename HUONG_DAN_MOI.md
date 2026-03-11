# Hướng dẫn sử dụng - Tracking Google Slides (Next.js 14 + Firebase)

Dự án đã được làm mới hoàn toàn bằng **Next.js 14** để mang lại hiệu năng cao nhất và dễ dàng triển khai lên Vercel.

## Chuẩn bị Firebase (Bắt buộc)

1. Truy cập [Firebase Console](https://console.firebase.google.com/).
2. Vào **Project Settings** -> **Service Accounts**.
3. Nhấn **Generate new private key** để tải file JSON.
4. Bạn sẽ cần `project_id`, `client_email`, và `private_key` từ file này.

## Triển khai lên Vercel Web (Cách nhanh nhất)

1. Đẩy mã nguồn này lên một repository **GitHub** mới.
2. Truy cập [Vercel Dashboard](https://vercel.com/dashboard).
3. Nhấn **Add New** -> **Project** và chọn repository của bạn.
4. **Quan trọng:** Trong phần **Environment Variables**, hãy thêm 3 biến sau:
   - `FIREBASE_PROJECT_ID`: giá trị từ JSON.
   - `FIREBASE_CLIENT_EMAIL`: giá trị từ JSON.
   - `FIREBASE_PRIVATE_KEY`: giá trị từ JSON (bao gồm cả BEGIN/END).
5. Nhấn **Deploy**.

## Cách sử dụng Tracking

Sau khi deploy thành công:
1. Truy cập trang chủ dự án của bạn (ví dụ: `https://ten-du-an.vercel.app`).
2. Nhấn **+ Tạo Tracker mới**, đặt tên cho slide của bạn.
3. Nhấn **Copy Link**. Link sẽ có dạng: `https://ten-du-an.vercel.app/api/t/ABCDEF`.
4. Mở Google Slides -> **Insert** -> **Image** -> **By URL** và dán link này vào.
5. Thu nhỏ ảnh vừa chèn xuống mức tối thiểu (1px) và đặt ở góc trang slide.

## Theo dõi dữ liệu
- Quay lại trang Dashboard, số lượt mở sẽ được cập nhật tự động mỗi 5 giây.
- Nhấn **Nhật ký** để xem chi tiết IP, thiết bị và thời gian của từng người xem.

---
*Lưu ý: Vì đây là môi trường Serverless, ảnh pixel có thể bị cache bởi Google. Một lượt xem thường được ghi nhận chính xác cho lần mở đầu tiên của mỗi người dùng.*
