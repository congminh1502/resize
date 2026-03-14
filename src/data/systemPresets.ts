import { Preset } from '../lib/types';

export const systemPresets: Preset[] = [
    {
        id: "moloco-basic",
        name: "Moloco Basic Pack",
        type: "system",
        outputs: [
            { id: "o1", label: "square_200", width: 200, height: 200, ratioKey: "1:1", sourceBlockId: "src-square" },
            { id: "o2", label: "square_720", width: 720, height: 720, ratioKey: "1:1", sourceBlockId: "src-square" },
            { id: "o3", label: "portrait_320x568", width: 320, height: 568, ratioKey: "9:16", sourceBlockId: "src-portrait" },
            { id: "o4", label: "portrait_360x640", width: 360, height: 640, ratioKey: "9:16", sourceBlockId: "src-portrait" },
            { id: "o5", label: "portrait_375x667", width: 375, height: 667, ratioKey: "9:16", sourceBlockId: "src-portrait" },
            { id: "o6", label: "portrait_720x1280", width: 720, height: 1280, ratioKey: "9:16", sourceBlockId: "src-portrait" },
            { id: "o7", label: "landscape_640x360", width: 640, height: 360, ratioKey: "16:9", sourceBlockId: "src-landscape" }
        ],
        sourceBlocks: [
            {
                id: "src-square",
                ratioKey: "1:1",
                displayName: "Ảnh vuông",
                ratioLabel: "1:1",
                recommendedSize: "720 x 720",
                description: "Ảnh vuông cho inventory Moloco.",
                usageHint: "Giữ chủ thể ở trung tâm.",
                required: true
            },
            {
                id: "src-portrait",
                ratioKey: "9:16",
                displayName: "Ảnh dọc",
                ratioLabel: "9:16",
                recommendedSize: "720 x 1280",
                description: "Ảnh dọc cho mobile inventory Moloco.",
                usageHint: "Thiết kế giống story hoặc reels.",
                required: true
            },
            {
                id: "src-landscape",
                ratioKey: "16:9",
                displayName: "Ảnh ngang",
                ratioLabel: "16:9",
                recommendedSize: "640 x 360",
                description: "Ảnh ngang cho placement landscape.",
                usageHint: "Phù hợp banner ngang.",
                required: true
            }
        ]
    }
];
