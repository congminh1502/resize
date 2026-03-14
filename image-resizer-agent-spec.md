# Image Resizer App Spec for AI Coding Agent

## 1. Mục tiêu

Xây dựng một web app resize ảnh với 2 module độc lập:

1. **Preset Resize**
   - Resize theo bộ kích thước có sẵn hoặc preset do người dùng tự tạo.
   - App **không được kéo méo ảnh**.
   - App **không auto crop** ở phiên bản đầu.
   - App chỉ resize các ảnh đầu vào sang các output **cùng tỉ lệ**.
   - Với mỗi preset, app phải yêu cầu **đủ bộ ảnh nguồn tối thiểu** để có thể generate full pack.

2. **Free Resize**
   - Người dùng upload 1 ảnh.
   - Resize tự do theo phần trăm tăng/giảm.
   - Luôn giữ nguyên tỉ lệ ảnh.
   - Có thể nhập 1 hoặc nhiều mức % để xuất nhiều file.

## 2. Đối tượng người dùng

- Media buyer / performance marketer.
- Người dùng phổ thông không rành ratio ảnh.
- Team nội bộ cần tạo nhanh bộ ảnh cho Meta, Google, Moloco, TikTok.

## 3. Nguyên tắc xử lý ảnh

### 3.1 Bắt buộc
- Không stretch ảnh.
- Không làm méo ảnh.
- Không auto crop ở bản đầu.
- Chỉ resize giữa các kích thước cùng aspect ratio.
- Nếu ảnh đầu vào sai ratio so với block yêu cầu thì báo lỗi rõ ràng.

### 3.2 Chưa làm ở phiên bản đầu
- Không auto crop center.
- Không smart crop.
- Không background fill.
- Không AI expand.

## 4. Kiến trúc tính năng

### 4.1 Module A: Preset Resize

Gồm 2 nhánh:

#### A1. Preset có sẵn
Ví dụ:
- Meta Basic Pack
- Google Display Pack
- Moloco Pack
- TikTok Pack

#### A2. Custom Preset Builder
Người dùng có thể:
- Tạo preset mới.
- Nhập danh sách size mong muốn.
- App tự nhóm size theo ratio.
- App tự suy ra bộ ảnh nguồn tối thiểu cần có.
- Lưu preset để dùng lần sau.

### 4.2 Module B: Free Resize
Người dùng:
- Upload 1 ảnh.
- Nhập 1 hoặc nhiều mức resize theo %.
- App xuất ảnh tương ứng.
- Giữ nguyên aspect ratio.

## 5. Luồng người dùng

### 5.1 Preset Resize - preset có sẵn
1. Mở tab **Preset Resize**.
2. Chọn 1 preset.
3. App hiển thị:
   - Danh sách output sizes.
   - Danh sách required source blocks.
   - Chú thích dễ hiểu cho từng block.
4. Upload đủ ảnh vào từng block.
5. App validate:
   - Có thiếu block không.
   - Ảnh có đúng ratio block không.
6. Nếu thiếu hoặc sai ratio:
   - Disable nút **Generate Full Pack**.
   - Báo rõ block nào đang lỗi.
7. Khi đủ toàn bộ:
   - Generate full pack.
   - Cho download ZIP.

### 5.2 Preset Resize - custom preset
1. Bấm **Tạo preset mới**.
2. Nhập:
   - Tên preset.
   - Danh sách output sizes.
3. App tự phân tích:
   - Gom nhóm theo ratio.
   - Tạo required source blocks.
   - Tính số ảnh nguồn tối thiểu cần có.
4. Người dùng có thể sửa metadata từng block:
   - Tên hiển thị.
   - Chú thích.
   - Kích thước gợi ý.
5. Lưu preset.
6. Sau khi lưu, preset hoạt động giống preset có sẵn.

### 5.3 Free Resize
1. Mở tab **Free Resize**.
2. Upload 1 ảnh.
3. Nhập 1 hoặc nhiều giá trị %, ví dụ: 50, 75, 120, 150.
4. App preview kích thước đầu ra.
5. Bấm generate.
6. App xuất file và cho download từng file hoặc ZIP.

## 6. Quy tắc preset

### 6.1 Khái niệm

#### Output size
Một kích thước đầu ra cụ thể. Ví dụ:
- 1080x1080
- 1080x1350
- 1200x628

#### Ratio group
Nhóm các output cùng aspect ratio. Ví dụ:
- 1:1
- 4:5
- 16:9
- 1.91:1

#### Required source block
Một block upload đại diện cho 1 ảnh nguồn bắt buộc của 1 ratio group.

**Nguyên tắc:**
- Mỗi ratio group cần ít nhất 1 ảnh nguồn.
- Số required source block = số ratio group duy nhất.

### 6.2 Logic suy ra bộ ảnh nguồn tối thiểu
Ví dụ output sizes:
- 1080x1080
- 1200x1200
- 1080x1350
- 1200x628

App nhóm như sau:
- 1:1 -> 1080x1080, 1200x1200
- 4:5 -> 1080x1350
- 1.91:1 -> 1200x628

=> Cần tối thiểu 3 ảnh nguồn:
- 1 ảnh 1:1
- 1 ảnh 4:5
- 1 ảnh 1.91:1

### 6.3 Rule generate full pack
Chỉ cho phép **Generate Full Pack** khi:
- Tất cả required source blocks đã có ảnh.
- Tất cả ảnh đều đúng ratio block yêu cầu.

Nếu không đạt:
- Disable nút generate.
- Hiển thị lỗi rõ ràng theo block.

## 7. UX của block ảnh yêu cầu

Người dùng phổ thông không quen ratio, nên mỗi block upload phải có metadata dễ hiểu.

### 7.1 Nội dung bắt buộc trong block
- `displayName`: tên dễ hiểu.
- `ratioLabel`: ví dụ 16:9.
- `recommendedSize`: ví dụ 1920x1080.
- `description`: mô tả ngắn.
- `usageHint`: dùng cho mục đích gì.

### 7.2 Thứ tự hiển thị ưu tiên
Hiển thị theo thứ tự:
1. Tên dễ hiểu
2. Kích thước gợi ý
3. Tỉ lệ
4. Mô tả

Ví dụ UI:

**Ảnh ngang**  
Gợi ý: **1920 x 1080**  
Tỉ lệ: **16:9**  
Dùng cho banner ngang, thumbnail hoặc placement landscape.

[ Upload ảnh ]

### 7.3 Chỉnh sửa chú thích
Admin hoặc user khi tạo preset phải sửa được các field này cho từng block:
- displayName
- recommendedSize
- description
- usageHint

Ví dụ thay vì `Source 1`, user có thể đặt:
- Ảnh vuông sản phẩm
- Ảnh dọc chính
- Ảnh ngang banner

## 8. Validation

### 8.1 Validation ảnh nguồn preset
Kiểm tra:
- File có phải ảnh hợp lệ không.
- Có đọc được width/height không.
- Ratio ảnh có khớp ratio block không.

### 8.2 Logic ratio matching
So sánh ratio theo sai số nhỏ, không so số thực tuyệt đối.

Đề xuất:
- Tính ratio thực = width / height
- So sánh với target ratio bằng tolerance nhỏ, ví dụ `0.01`

### 8.3 Validation free resize
- Phần trăm phải là số > 0.
- Cho phép số thập phân nếu muốn.
- Không cho giá trị âm hoặc 0.

## 9. Yêu cầu giao diện

### 9.1 Layout chính
Trang chính có 2 tab:
- Preset Resize
- Free Resize

### 9.2 Tab Preset Resize
Các khu vực:
1. Preset selector
2. Danh sách output sizes
3. Danh sách required source blocks
4. Nút generate
5. Nút download ZIP

### 9.3 Tab Free Resize
Các khu vực:
1. Upload ảnh
2. Input % resize
3. Preview kích thước đầu ra
4. Nút generate
5. Download file / ZIP

### 9.4 Custom Preset Builder
Form gồm:
- Preset name
- Danh sách output size rows
- Nút phân tích preset
- Danh sách ratio groups được sinh ra
- Danh sách required source blocks được sinh ra
- Form sửa metadata block
- Nút lưu preset

## 10. Tên file output
Đề xuất format:
- `{baseName}_{label}_{width}x{height}.{ext}`

Ví dụ:
- `campaign_square_1080x1080.jpg`
- `campaign_portrait_1080x1350.jpg`
- `campaign_landscape_1200x628.jpg`
- `image_50pct.jpg`

## 11. Cấu trúc dữ liệu đề xuất

```ts
export type RatioKey = string;

export interface OutputSize {
  id: string;
  label: string;
  width: number;
  height: number;
  ratioKey: RatioKey;
  sourceBlockId: string;
}

export interface SourceBlock {
  id: string;
  ratioKey: RatioKey;
  displayName: string;
  ratioLabel: string;
  recommendedSize: string;
  description?: string;
  usageHint?: string;
  required: true;
}

export interface Preset {
  id: string;
  name: string;
  type: 'system' | 'custom';
  outputs: OutputSize[];
  sourceBlocks: SourceBlock[];
  createdAt?: string;
  updatedAt?: string;
}
```

## 12. Ví dụ preset system

```json
{
  "id": "meta-basic",
  "name": "Meta Basic Pack",
  "type": "system",
  "outputs": [
    {
      "id": "out-1",
      "label": "square",
      "width": 1080,
      "height": 1080,
      "ratioKey": "1:1",
      "sourceBlockId": "src-square"
    },
    {
      "id": "out-2",
      "label": "portrait",
      "width": 1080,
      "height": 1350,
      "ratioKey": "4:5",
      "sourceBlockId": "src-portrait"
    },
    {
      "id": "out-3",
      "label": "landscape",
      "width": 1200,
      "height": 628,
      "ratioKey": "1.91:1",
      "sourceBlockId": "src-landscape"
    }
  ],
  "sourceBlocks": [
    {
      "id": "src-square",
      "ratioKey": "1:1",
      "displayName": "Ảnh vuông",
      "ratioLabel": "1:1",
      "recommendedSize": "1080x1080",
      "description": "Ảnh vuông dùng cho placement vuông.",
      "usageHint": "Chọn ảnh bố cục vuông, chủ thể không sát mép.",
      "required": true
    },
    {
      "id": "src-portrait",
      "ratioKey": "4:5",
      "displayName": "Ảnh dọc",
      "ratioLabel": "4:5",
      "recommendedSize": "1080x1350",
      "description": "Ảnh dọc dùng cho feed dọc.",
      "usageHint": "Ưu tiên bố cục cao, không cắt đầu sản phẩm/chủ thể.",
      "required": true
    },
    {
      "id": "src-landscape",
      "ratioKey": "1.91:1",
      "displayName": "Ảnh ngang",
      "ratioLabel": "1.91:1",
      "recommendedSize": "1200x628",
      "description": "Ảnh ngang cho placement landscape.",
      "usageHint": "Dùng cho banner ngang hoặc link ads.",
      "required": true
    }
  ]
}
```

## 13. Hàm nghiệp vụ cần có

### 13.1 Ratio utilities
- `getRatioKey(width, height)`
- `normalizeRatio(width, height)`
- `isRatioMatch(width, height, targetRatioKey, tolerance)`
- `groupOutputsByRatio(outputs)`

### 13.2 Preset builder utilities
- `buildSourceBlocksFromOutputs(outputs)`
- `validatePresetDefinition(preset)`
- `countRequiredSources(preset)`

### 13.3 File/image utilities
- `readImageDimensions(file)`
- `resizeImage(file, width, height)`
- `generateZip(files)`

### 13.4 Validation utilities
- `validateSourceUploads(preset, uploadedFilesBySourceBlockId)`
- `canGenerateFullPack(validationResult)`
- `parseResizePercentInput(input)`

## 14. Logic xử lý ảnh

### 14.1 Preset Resize
Với mỗi source block:
- Lấy ảnh người dùng upload.
- Resize ảnh đó thành tất cả output liên kết với source block tương ứng.
- Không dùng 1 ảnh nguồn cho source block khác ratio.

### 14.2 Free Resize
Với ảnh gốc có kích thước `originalWidth x originalHeight`:

```ts
newWidth = Math.round(originalWidth * percent / 100)
newHeight = Math.round(originalHeight * percent / 100)
```

## 15. Trạng thái lỗi cần hiển thị rõ
Ví dụ message:
- `Thiếu ảnh nguồn: Ảnh dọc`
- `Ảnh upload cho block Ảnh ngang không đúng tỉ lệ 16:9`
- `Preset này cần tối thiểu 4 ảnh nguồn`
- `Giá trị resize % phải lớn hơn 0`

## 16. Gợi ý tech stack

### Option khuyên dùng
- **Frontend**: Next.js + React + TypeScript
- **UI**: Tailwind CSS + shadcn/ui
- **Image processing**:
  - Ưu tiên dùng phía client cho MVP nếu muốn đơn giản.
  - Dùng backend với `sharp` nếu cần ổn định hơn, xử lý batch tốt hơn.
- **ZIP download**: JSZip hoặc tương đương.
- **State**: React state / Zustand.

## 17. Ưu tiên triển khai

### Phase 1
- 2 tab: Preset Resize / Free Resize
- Preset system
- Custom preset builder cơ bản
- Validate ratio
- Upload đủ source blocks mới cho generate
- Resize không méo
- Download ZIP

### Phase 2
- Lưu preset theo user
- Quản lý preset system vs custom
- Preview tốt hơn
- Rename output nâng cao

### Phase 3
- Crop center tùy chọn
- Batch upload nhiều ảnh
- Team preset sharing

## 18. Definition of Done

### Done cho Preset Resize khi:
- Chọn được preset có sẵn.
- Tạo được preset custom.
- App tự suy ra đúng số source blocks tối thiểu.
- User sửa được chú thích từng block.
- Chỉ generate full pack khi upload đủ ảnh đúng ratio.
- Export đúng toàn bộ output trong preset.

### Done cho Free Resize khi:
- Upload được 1 ảnh.
- Nhập được 1 hoặc nhiều mức %.
- Tính đúng kích thước đầu ra.
- Không méo ảnh.
- Download được file đơn hoặc ZIP.

## 19. Yêu cầu code cho AI Agent
- Tạo app bằng TypeScript.
- Component tách rõ:
  - `PresetResizeTab`
  - `FreeResizeTab`
  - `PresetBuilder`
  - `SourceUploadBlock`
  - `OutputSizeList`
- Viết utility riêng cho ratio và validation.
- Tổ chức code sạch, dễ mở rộng.
- Không hardcode logic lẫn trong UI component.
- Viết sẵn mock data cho ít nhất 2 preset system.
- Ưu tiên UX rõ ràng hơn là tối ưu sớm.


---

## Moloco Preset (System)

Moloco yêu cầu các kích thước:

- 200 x 200
- 320 x 568
- 360 x 640
- 375 x 667
- 640 x 360
- 720 x 720
- 720 x 1280

### Ratio groups suy ra

| Ratio | Sizes |
|------|------|
| 1:1 | 200x200, 720x720 |
| 9:16 | 320x568, 360x640, 375x667, 720x1280 |
| 16:9 | 640x360 |

### Bộ ảnh nguồn tối thiểu

App phải yêu cầu **3 ảnh nguồn**:

1. **Ảnh vuông (1:1)**  
   Gợi ý: 720x720

2. **Ảnh dọc (9:16)**  
   Gợi ý: 720x1280

3. **Ảnh ngang (16:9)**  
   Gợi ý: 640x360 hoặc 1280x720

### Ví dụ preset JSON

```json
{
  "id": "moloco-basic",
  "name": "Moloco Basic Pack",
  "type": "system",
  "outputs": [
    { "id": "o1", "label": "square_200", "width": 200, "height": 200, "ratioKey": "1:1", "sourceBlockId": "src-square" },
    { "id": "o2", "label": "square_720", "width": 720, "height": 720, "ratioKey": "1:1", "sourceBlockId": "src-square" },

    { "id": "o3", "label": "portrait_320x568", "width": 320, "height": 568, "ratioKey": "9:16", "sourceBlockId": "src-portrait" },
    { "id": "o4", "label": "portrait_360x640", "width": 360, "height": 640, "ratioKey": "9:16", "sourceBlockId": "src-portrait" },
    { "id": "o5", "label": "portrait_375x667", "width": 375, "height": 667, "ratioKey": "9:16", "sourceBlockId": "src-portrait" },
    { "id": "o6", "label": "portrait_720x1280", "width": 720, "height": 1280, "ratioKey": "9:16", "sourceBlockId": "src-portrait" },

    { "id": "o7", "label": "landscape_640x360", "width": 640, "height": 360, "ratioKey": "16:9", "sourceBlockId": "src-landscape" }
  ],
  "sourceBlocks": [
    {
      "id": "src-square",
      "ratioKey": "1:1",
      "displayName": "Ảnh vuông",
      "ratioLabel": "1:1",
      "recommendedSize": "720x720",
      "description": "Ảnh vuông cho inventory Moloco.",
      "usageHint": "Giữ chủ thể ở trung tâm.",
      "required": true
    },
    {
      "id": "src-portrait",
      "ratioKey": "9:16",
      "displayName": "Ảnh dọc",
      "ratioLabel": "9:16",
      "recommendedSize": "720x1280",
      "description": "Ảnh dọc cho mobile inventory Moloco.",
      "usageHint": "Thiết kế giống story hoặc reels.",
      "required": true
    },
    {
      "id": "src-landscape",
      "ratioKey": "16:9",
      "displayName": "Ảnh ngang",
      "ratioLabel": "16:9",
      "recommendedSize": "640x360",
      "description": "Ảnh ngang cho placement landscape.",
      "usageHint": "Phù hợp banner ngang.",
      "required": true
    }
  ]
}
```
