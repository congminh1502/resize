# update_111

## 1. Thêm tính năng xóa và sửa Preset

### 1.1. Mục tiêu

Cho phép người dùng xóa và sửa preset đã tạo.

### 1.2. Yêu cầu

- Thêm nút xóa preset trên giao diện danh sách preset.
- Thêm nút sửa preset trên giao diện danh sách preset.
- Khi xóa preset, cần có xác nhận từ người dùng.
- Sau khi xóa, preset không còn xuất hiện trên giao diện.
- Sau khi sửa, preset phải được cập nhật trong danh sách preset.

### 1.3. Giao diện

```
[ Tên preset ] [ Xóa ] [ Sửa ]
```

### 1.4. Logic

- Khi người dùng bấm nút xóa, hiển thị modal xác nhận:
  ```
  Bạn có chắc chắn muốn xóa preset "Tên preset"?
  [ Hủy ] [ Xóa ]
  ```
- Nếu người dùng bấm "Xóa", xóa preset khỏi danh sách.
- Nếu người dùng bấm "Hủy", đóng modal.
- Khi người dùng bấm nút sửa, hiển thị modal sửa preset:
  ```
  Sửa preset "Tên preset"
  [ Tên preset ]
  [ Danh sách output sizes ]
  [ Danh sách required source blocks ]
  [ Nút lưu ]
  ```
- Nếu người dùng bấm "Lưu", cập nhật preset trong danh sách.
- Nếu người dùng bấm "Hủy", đóng modal.

### 1.5. Lưu ý

- Chỉ cho phép xóa và sửa preset do người dùng tạo, không cho phép xóa và sửa preset hệ thống.
- Preset hệ thống được đánh dấu bằng thuộc tính `type: "system"`.
- Preset do người dùng tạo có thuộc tính `type: "custom"`.
