# Known Issue: Element Visibility

## Problem
The `visible` property is not currently working in the KRY compiler/renderer pipeline. When setting `visible: false` in styles, elements still appear on screen.

## Current Workarounds

### 1. Opacity Method (NOT RECOMMENDED)
Using `opacity: 0.0` hides the entire element including text, but the element still takes up space and can receive events.

### 2. Off-Screen Positioning (NOT SUPPORTED IN STYLES)
Properties like `pos_x` and `pos_y` are element-level properties and cannot be used in style definitions.

### 3. Script-Based Visibility
Use the DOM API to control visibility:
```lua
element:setVisible(false)  -- This works at runtime
```

## Required Fix

The compiler needs to:
1. Recognize and compile the `visible` property in styles (Property ID 0x0F)
2. Write the visibility byte to the KRB binary format
3. Ensure the renderer respects the visible property during initial render

### Implementation Notes

In `kryon-compiler/src/semantic.rs`, the visible property handler needs to write the property to the KRB:
```rust
"visible" | "visibility" => {
    // Parse boolean value
    let visible = match value {
        "true" | "visible" => true,
        "false" | "hidden" => false,
        _ => return Err(...)
    };
    
    // Write as PropertyId::Visibility (0x0F)
    properties.push(KrbProperty {
        property_id: PropertyId::Visibility as u8,
        value_type: ValueType::Bool,
        size: 1,
        value: vec![if visible { 1 } else { 0 }],
    });
}
```

The renderer already supports the visible property and will hide elements with `visible: false`.