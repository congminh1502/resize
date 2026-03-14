## update for part 3

## Requirement

Focus on Block Resize part.

We need to redesign the Block Resize UI and preset architecture.

## Problems
- Block Resize presets must be separate from Preset Resize presets.
- Presets should NOT be created from inside a resize job block.
- Presets represent only a set of output sizes.
- Output sizes are the most important part of the UI but currently too small.

## Required changes

### Architecture
- Create a separate preset system for Block Resize.
- Use a separate database table for block resize presets.
- Presets contain only output sizes.

### UI
- Output sizes must be the primary focus of the block.
- Reduce input image preview size.
- Remove "save preset from job" behavior.
- Add a dedicated preset library section for Block Resize.

### Conceptual model:
preset = set of output sizes
block = resize job using a preset or manual sizes

Refactor the UI and data model accordingly.