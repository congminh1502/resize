
# Image Resizer – Part 3 Specification
## Resize + Fill / Crop (Block-based Workflow)

This document defines **Part 3** of the image resizer application.

Part 3 introduces a flexible **block-based resizing workflow** where each block processes one input image and generates multiple outputs.

---

# 1. Goal

Part 3 allows users to:

- Upload multiple images
- Configure output sizes independently per image
- Choose how the image fits into the target size
- Batch generate all outputs in one run

Unlike Part 1, this mode does **not require strict ratio matching**.

Images may be:
- cropped
- padded with background
- resized proportionally

---

# 2. Output File Naming

All generated images must follow the naming format:

```
[prefix]_[width]x[height].[ext]
```

Example:

```
VTS_1080x1080.jpg
```

### Prefix behavior

- User may enter a **prefix** before generating images.
- The prefix applies to **all outputs in the current session**.

If prefix is empty:

```
1080x1080.jpg
```

### Notes

- The system **must not use the original filename**.
- The system **must not automatically append timestamps or block IDs**.

---

# 3. Global Session Structure

At the top of the interface:

```
Prefix input field
```

Example:

```
Prefix: VTS
```

All generated files will follow:

```
VTS_1080x1080.jpg
VTS_1920x1080.jpg
```

---

# 4. Block-based Workflow

Users can add multiple **resize blocks**.

Each block represents **one resize job**.

Structure:

```
Session
 ├─ Prefix
 └─ Blocks[]
```

Each block contains:

```
Block
 ├─ Input Image
 ├─ Output Sizes
 └─ Options
```

Users can add blocks using:

```
+ Add Block
```

---

# 5. Block Structure

Each block contains:

### Input

```
Upload Image
```

Only **one image per block**.

---

### Output Sizes

A block may contain multiple output sizes.

Users can obtain sizes from:

1. Preset packs
2. Public shared presets
3. Presets created by the user
4. Manually entered sizes

Example:

```
1080 x 1920
1000 x 1200
```

---

### Options

Each block supports the following resize behaviors:

#### 1. Fill with background

Image is resized to fit entirely inside the frame.

Empty space is filled with a background color.

```
contain_with_background
```

---

#### 2. Fill without background

Image is resized proportionally but background remains transparent or default.

```
contain_no_background
```

---

#### 3. Crop

Image is resized to **cover the entire frame**.

Overflow is cropped.

```
cover_crop
```

---

### Alignment Options

When cropping or fitting, alignment may be:

```
center
left
right
```

Future extensions may include:

```
top
bottom
```

---

# 6. Example Workflow

Example session:

```
Prefix: VTS
```

Block 1:

```
Input:
imageA.jpg

Outputs:
1080x1920
1000x1200

Mode:
cover_crop
Align:
center
```

Block 2:

```
Input:
imageB.jpg

Outputs:
900x900
1200x1100

Mode:
contain_with_background
Align:
center
```

Generated files:

```
VTS_1080x1920.jpg
VTS_1000x1200.jpg
VTS_900x900.jpg
VTS_1200x1100.jpg
```

---

# 7. Preset System

Output size presets can be used in blocks.

A preset defines a list of output sizes.

Example preset:

```
Social Pack
```

Outputs:

```
1080x1080
1080x1920
1920x1080
```

Users may:

- select existing presets
- use presets created by other users
- create new presets

---

# 8. Preset Sharing

Users can save presets for public use.

No authentication is required.

When saving a preset, the user must provide:

```
preset_name
author_name
```

The preset becomes **publicly available**.

---

# 9. Database Integration (Supabase)

Shared presets are stored in:

```
shared_presets
```

Schema:

```sql
create table public.shared_presets (
  id uuid not null default gen_random_uuid(),
  name text not null,
  author_name text not null,
  outputs jsonb not null,
  source_blocks jsonb null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint shared_presets_pkey primary key (id)
);
```

For Part 3:

```
source_blocks = null
```

Example preset record:

```json
{
  "name": "Social Pack",
  "author_name": "Minh",
  "outputs": [
    { "width": 1080, "height": 1080 },
    { "width": 1080, "height": 1920 }
  ]
}
```

---

# 10. Data Model (TypeScript)

```ts
export interface ResizeSession {
  prefix?: string
  blocks: ResizeBlock[]
}

export interface ResizeBlock {
  id: string
  inputImage?: File
  outputs: OutputSize[]
  fitMode: 'contain_with_background' | 'contain_no_background' | 'cover_crop'
  align: 'center' | 'left' | 'right'
}

export interface OutputSize {
  width: number
  height: number
}
```

---

# 11. Definition of Done

Part 3 is complete when:

- User can enter a prefix
- User can add multiple blocks
- Each block accepts one input image
- Each block can define multiple output sizes
- Users can choose resize mode
- Users can choose alignment
- Outputs follow `[prefix]_[width]x[height]` format
- Presets can be saved
- Presets can be shared publicly
- All outputs can be downloaded as ZIP

---

# 12. Relationship with Other Parts

| Part | Description |
|-----|-------------|
Part 1 | Strict preset resizing |
Part 2 | Free resize by percentage |
Part 3 | Flexible block-based resizing with crop/fill |
