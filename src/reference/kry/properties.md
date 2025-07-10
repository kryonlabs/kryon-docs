# Properties

Properties define the appearance, behavior, and layout of elements in Kryon UIs. This comprehensive reference covers all available properties, their types, values, and how they interact with each other.

## Property Types

### String Properties

String values must be enclosed in double quotes:

```kry
Text {
    text: "Hello, World!"
    id: "greeting_text"
    placeholder: "Enter your name..."
    onClick: "handleButtonClick"
}
```

**Common String Properties:**
- `text` - Display text for Text and Button elements
- `id` - Unique identifier for script access
- `placeholder` - Hint text for Input elements
- Event handlers: `onClick`, `onChange`, `onFocus`, etc.
- `style` - Reference to defined style name

### Numeric Properties

Numbers can be integers or floating-point values:

```kry
Container {
    width: 200              # Integer pixels
    height: 150             # Integer pixels
    opacity: 0.8            # Float (0.0 to 1.0)
    z_index: 10             # Layer ordering
    border_radius: 6        # Corner rounding
    font_size: 16           # Text size in pixels
}
```

**Numeric Ranges:**
- Dimensions: `0` to `32767` pixels
- Opacity: `0.0` (transparent) to `1.0` (opaque)
- Z-index: `-1000` to `1000`
- Font size: `1` to `144` pixels

### Percentage Properties

Percentages are strings ending with `%`, relative to parent dimensions:

```kry
Container {
    width: "50%"            # Half of parent width
    height: "100%"          # Full parent height
    max_width: "80%"        # Maximum 80% of parent
    padding: "5%"           # 5% of container size
}
```

### Color Properties

Colors use hex format with alpha channel (RGBA):

```kry
Element {
    background_color: "#007BFFFF"    # Blue with full opacity
    text_color: "#333333FF"          # Dark gray text
    border_color: "#00000080"        # Black with 50% opacity
}

# Short form (3-digit expands to 6-digit + FF alpha)
Element {
    background_color: "#F00"         # Expands to "#FF0000FF"
    text_color: "#333"               # Expands to "#333333FF"
}

# Special color values
Element {
    background_color: "transparent"  # Fully transparent
    background_color: "inherit"      # Inherit from parent
}
```

### Boolean Properties

True/false values control element behavior:

```kry
Button {
    disabled: false         # Element is interactive
    visibility: true        # Element is visible
    resizable: true         # Window can be resized
}
```

### Enum Properties

Predefined keywords for specific behaviors:

```kry
Container {
    layout: column          # row, column, center, grow
    text_alignment: center  # start, center, end, justify
    cursor: "pointer"       # default, pointer, text, not_allowed
}

Text {
    font_weight: bold       # normal, bold, light, heavy
}
```

## Layout Properties

### Positioning

Control element placement and sizing:

```kry
Element {
    # Absolute positioning
    pos_x: 10               # X coordinate from left
    pos_y: 20               # Y coordinate from top
    
    # Dimensions
    width: 200              # Fixed width in pixels
    height: 100             # Fixed height in pixels
    width: "50%"            # Percentage of parent
    height: "auto"          # Size to content
    
    # Constraints
    min_width: 50           # Minimum width
    max_width: 400          # Maximum width
    min_height: 30          # Minimum height
    max_height: 200         # Maximum height
}
```

### Container Layout

Configure how child elements are arranged:

```kry
Container {
    # Layout modes
    layout: column          # Stack children vertically
    layout: row             # Arrange children horizontally
    layout: center          # Center children in both directions
    layout: grow            # Expand to fill available space
    
    # Combined layout modes
    layout: column center   # Vertical stack, centered
    layout: row center      # Horizontal row, centered
    
    # Spacing
    gap: 16                 # Space between child elements
    padding: 20             # Internal spacing around edges
    margin: 10              # External spacing around element
}
```

**Layout Examples:**

```kry
# Vertical stack with spacing
Container {
    layout: column
    gap: 12
    padding: 16
    
    Text { text: "First" }
    Text { text: "Second" }
    Text { text: "Third" }
}

# Horizontal button row
Container {
    layout: row center
    gap: 8
    
    Button { text: "Cancel" }
    Button { text: "OK" }
}

# Flexible layout with growing center
Container {
    layout: row
    width: "100%"
    
    Container { width: 200; /* fixed sidebar */ }
    Container { layout: grow; /* expanding content */ }
    Container { width: 150; /* fixed panel */ }
}

# Centered content
Container {
    layout: center
    width: "100%"
    height: "100%"
    
    Text { text: "Perfectly Centered" }
}
```

### Spacing Properties

Control whitespace around and within elements:

```kry
Element {
    # Uniform spacing
    padding: 16             # 16px on all sides
    margin: 8               # 8px on all sides
    
    # Individual sides (if supported by runtime)
    padding_top: 12
    padding_right: 16
    padding_bottom: 12
    padding_left: 16
    
    # Shorthand for different sides
    padding: "12 16"        # 12px top/bottom, 16px left/right
    padding: "8 12 16"      # 8px top, 12px left/right, 16px bottom
    padding: "8 12 16 20"   # 8px top, 12px right, 16px bottom, 20px left
}
```

## Visual Properties

### Colors and Backgrounds

```kry
Element {
    # Background
    background_color: "#F8F9FAFF"    # Light gray background
    background_color: "transparent"  # No background
    
    # Text color
    text_color: "#333333FF"          # Dark text
    
    # Borders
    border_color: "#CCCCCCFF"        # Border color
    border_width: 1                  # Border thickness
    border_radius: 6                 # Rounded corners
    
    # Visual effects
    opacity: 0.9                     # Slight transparency
    z_index: 10                      # Layer stacking order
    visibility: true                 # Show/hide element
}
```

### Shadows and Effects

```kry
Element {
    # Drop shadow (runtime-dependent)
    shadow_color: "#00000040"        # Semi-transparent black
    shadow_offset_x: 2               # Horizontal shadow offset
    shadow_offset_y: 2               # Vertical shadow offset
    shadow_blur: 4                   # Shadow blur radius
    
    # Border styles (runtime-dependent)
    border_style: "solid"            # solid, dashed, dotted
}
```

### Transform Properties

CSS-equivalent transforms for scaling, rotation, and translation:

```kry
Element {
    # Object literal syntax for transforms
    transform: {
        scale: 1.5                   # Uniform scaling
        scale_x: 2.0                 # Scale X-axis only
        scale_y: 0.5                 # Scale Y-axis only
        rotate: 45deg                # Rotation (supports deg, rad, turn)
        translate_x: 10px            # X-axis translation
        translate_y: 20px            # Y-axis translation
    }
}
```

**Transform Examples:**

```kry
# Simple scaling
Container {
    width: 100
    height: 100
    background_color: "#FF0000FF"
    transform: {
        scale: 1.2                   # 20% larger
    }
}

# Rotation with different units
Container {
    width: 100
    height: 100
    background_color: "#00FF00FF"
    transform: {
        rotate: 90deg               # Quarter turn clockwise
        # Alternative units:
        # rotate: 1.57rad           # ~90 degrees in radians
        # rotate: 0.25turn          # Quarter turn
    }
}

# Translation (movement)
Container {
    pos_x: 100
    pos_y: 100
    width: 50
    height: 50
    background_color: "#0000FFFF"
    transform: {
        translate_x: 25             # Move 25px right
        translate_y: -10            # Move 10px up
    }
}

# Combined transforms
Container {
    width: 80
    height: 80
    background_color: "#FFFF00FF"
    transform: {
        scale: 1.1                  # Slightly larger
        rotate: 30deg               # Rotate 30 degrees
        translate_x: 15             # Move right
        translate_y: 5              # Move down
    }
}

# Non-uniform scaling
Container {
    width: 100
    height: 50
    background_color: "#FF00FFFF"
    transform: {
        scale_x: 0.8                # Narrower
        scale_y: 1.5                # Taller
    }
}
```

**Supported CSS Units:**
- **Length**: `px`, `em`, `rem`, `vw`, `vh`, `%`
- **Angle**: `deg`, `rad`, `turn`
- **Number**: Unitless values (treated as pixels for translation, scalar for scale)

**Transform Order:**
Transforms are applied in the order: scale → rotate → translate, with rotation and scaling applied around the element's center point.

**Backend Support:**
- **WGPU**: Full transform support with GPU acceleration
- **Raylib**: Complete transform support with matrix transformations
- **Ratatui**: Basic support (translation and scaling only, no rotation)

## Text Properties

### Typography

```kry
Text {
    # Content
    text: "Sample Text"
    
    # Font family and style
    text_font: "Open Sans"           # Font family name
    font_style: normal               # normal, italic, oblique
    
    # Size and weight
    font_size: 16                    # Size in pixels
    font_weight: normal              # normal, bold, light, heavy
    
    # Alignment
    text_alignment: start            # start, center, end, justify
    
    # Color
    text_color: "#333333FF"          # Text color
    
    # Line spacing (runtime-dependent)
    line_height: 1.5                 # Relative line height
    letter_spacing: 0.5              # Space between letters
}
```

### Text Examples

```kry
# Large heading
Text {
    text: "Main Title"
    text_font: "Montserrat"
    font_size: 32
    font_weight: bold
    text_color: "#1A1A1AFF"
    text_alignment: center
}

# Subheading
Text {
    text: "Section Header"
    text_font: "Montserrat"
    font_size: 20
    font_weight: bold
    text_color: "#333333FF"
    text_alignment: start
}

# Body text
Text {
    text: "Regular paragraph text with normal formatting."
    text_font: "Open Sans"
    font_size: 16
    font_weight: normal
    text_color: "#666666FF"
    line_height: 1.6
}

# Caption
Text {
    text: "Small helper text"
    text_font: "Open Sans"
    font_size: 12
    font_weight: light
    text_color: "#999999FF"
}

# Monospace code
Text {
    text: "const result = calculate();"
    text_font: "Fira Code"
    font_style: normal
    font_size: 14
    text_color: "#2D2D2DFF"
}
```

## Interactive Properties

### Cursor States

Control mouse cursor appearance:

```kry
Element {
    cursor: "default"       # Standard arrow cursor
    cursor: "pointer"       # Hand pointer (clickable)
    cursor: "text"          # Text selection cursor
    cursor: "wait"          # Loading/busy cursor
    cursor: "not_allowed"   # Disabled/forbidden cursor
    cursor: "move"          # Move/drag cursor
    cursor: "resize"        # Resize cursor
}
```

### Element States

```kry
Button {
    disabled: false         # Interactive state
    visibility: true        # Visible/hidden
    focus_enabled: true     # Can receive keyboard focus
    
    # State-specific styling with pseudo-selectors
    &:hover {
        background_color: "#0056B3FF"
        cursor: "pointer"
    }
    
    &:active {
        background_color: "#004085FF"
    }
    
    &:focus {
        border_color: "#80BDFFFF"
        border_width: 2
    }
    
    &:disabled {
        background_color: "#6C757DFF"
        text_color: "#AAAAAAR"
        cursor: "not_allowed"
    }
}
```

### Event Properties

```kry
Button {
    # Mouse events
    onClick: "handleClick"          # Primary click action
    onPress: "handleMouseDown"      # Mouse button down
    onRelease: "handleMouseUp"      # Mouse button up
    onDoubleClick: "handleDouble"   # Double-click
    
    # Mouse movement
    onHover: "handleHover"          # Mouse enter
    onLeave: "handleLeave"          # Mouse exit
    
    # Keyboard events
    onFocus: "handleFocus"          # Element gains focus
    onBlur: "handleBlur"            # Element loses focus
    onKeyPress: "handleKeyPress"    # Key pressed while focused
}

Input {
    # Input-specific events
    onChange: "handleChange"        # Value changed
    onSubmit: "handleSubmit"        # Enter key or form submit
    onInput: "handleInput"          # Real-time typing
}
```

## Property Inheritance

### Cascading Properties

Some properties automatically cascade from parent to child elements:

```kry
Container {
    # These properties inherit to children
    text_color: "#333333FF"
    font_size: 16
    font_weight: normal
    text_alignment: start
    
    Text { text: "Inherits parent text styling" }
    
    Container {
        # Child containers also inherit and can override
        text_color: "#007BFFFF"     # Override parent color
        
        Text { text: "Uses container's blue color" }
        
        Text {
            text: "Explicitly styled"
            text_color: "#FF0000FF"  # Override inherited color
            font_weight: bold        # Override inherited weight
        }
    }
}
```

### Non-Inheriting Properties

Layout and visual properties generally don't cascade:

```kry
Container {
    # These do NOT inherit to children
    background_color: "#F0F0F0FF"
    padding: 20
    border_radius: 8
    width: 300
    height: 200
    
    # Each child needs its own styling
    Container {
        background_color: "#FFFFFFFF"    # Must be explicit
        padding: 10                      # Must be explicit
        border_radius: 4                 # Must be explicit
    }
}
```

## Property Resolution Order

When multiple sources define the same property, resolution follows this priority:

1. **Inline Properties** - Directly on element (highest priority)
2. **Pseudo-Selector Properties** - State-based overrides
3. **Style Properties** - From referenced styles
4. **Inherited Properties** - From parent elements
5. **Default Properties** - Element defaults (lowest priority)

```kry
@variables {
    button_color: "#007BFFFF"
}

style "primary_button" {
    background_color: $button_color     # Priority 3: Style
    text_color: "#FFFFFFFF"
    padding: 12
}

Container {
    text_color: "#333333FF"             # Priority 4: Inherited
    
    Button {
        style: "primary_button"
        background_color: "#28A745FF"   # Priority 1: Inline (wins)
        
        &:hover {
            background_color: "#1E7E34FF"  # Priority 2: Pseudo-selector
        }
        
        # Final computed properties:
        # background_color: "#28A745FF" (inline)
        # text_color: "#FFFFFFFF" (from style)
        # padding: 12 (from style)
    }
}
```

## Property Aliases

### Smart Alias Resolution

The Kryon compiler includes smart property alias resolution to make the language more intuitive. Common shorthand properties are automatically mapped to their canonical names:

```kry
Text {
    text: "Hello World"
    color: "#FF0000FF"          # Automatically becomes 'text_color'
    font: "Arial"               # Automatically becomes 'text_font'
    size: 16                    # Automatically becomes 'font_size'
    align: center               # Automatically becomes 'text_alignment'
    style: italic               # Automatically becomes 'font_style'
}

Container {
    x: 50                       # Automatically becomes 'pos_x'
    y: 100                      # Automatically becomes 'pos_y'
    w: 200                      # Automatically becomes 'width'
    h: 150                      # Automatically becomes 'height'
    bg: "#0088FFFF"            # Automatically becomes 'background_color'
    border: 2                   # Automatically becomes 'border_width'
}

Image {
    src: "photo.jpg"            # Automatically becomes 'source'
    url: "image.png"            # Automatically becomes 'source'
    x: 10                       # Automatically becomes 'pos_x'
    y: 20                       # Automatically becomes 'pos_y'
}

App {
    title: "My App"             # Automatically becomes 'window_title'
    w: 800                      # Automatically becomes 'window_width'
    h: 600                      # Automatically becomes 'window_height'
}
```

### Supported Aliases

#### Text and Button Elements
- `color` → `text_color`
- `font` → `text_font`
- `size` → `font_size`
- `align` → `text_alignment`
- `style` → `font_style` (when used in Text context)

#### Container Elements
- `x` → `pos_x`
- `y` → `pos_y`
- `bg` → `background_color`
- `bg_color` → `background_color`
- `border` → `border_width`

#### Image Elements
- `src` → `source`
- `url` → `source`
- `x` → `pos_x`
- `y` → `pos_y`

#### App Elements
- `title` → `window_title`
- `w` → `window_width`
- `h` → `window_height`

#### Universal Aliases (All Elements)
- `x` → `pos_x`
- `y` → `pos_y`
- `w` → `width`
- `h` → `height`
- `bg` → `background_color`
- `bg_color` → `background_color`
- `visible` → `visibility`

### Compiler Warnings

When aliases are used, the compiler shows helpful warnings:

```bash
$ kryc example.kry example.krb
warning: Line 14: Property 'color' on Text element is automatically mapped to 'text_color' (consider updating your code)
Compilation successful!
```

These warnings help you:
- Understand which properties are being resolved
- Gradually migrate to canonical property names
- Maintain consistency across your codebase

### Best Practices

**During Development:**
Use aliases freely for rapid prototyping:
```kry
Container {
    x: 50
    y: 100
    w: 200
    h: 150
    bg: "#F0F0F0FF"
    
    Text {
        text: "Quick prototype"
        color: "#333333FF"
        size: 16
    }
}
```

**For Production:**
Consider using canonical names for clarity:
```kry
Container {
    pos_x: 50
    pos_y: 100
    width: 200
    height: 150
    background_color: "#F0F0F0FF"
    
    Text {
        text: "Production ready"
        text_color: "#333333FF"
        font_size: 16
    }
}
```

**Mixed Approach:**
Use aliases for common properties, canonical names for complex ones:
```kry
Container {
    x: 50                       # Common alias
    y: 100                      # Common alias
    width: 200                  # Canonical for clarity
    height: 150                 # Canonical for clarity
    background_color: "#F0F0F0FF"  # Canonical for precision
    
    Text {
        text: "Mixed approach"
        color: "#333333FF"          # Alias for simplicity
        font_size: 16               # Canonical for clarity
        text_alignment: center      # Canonical for precision
    }
}
```

## Property Validation

### Type Checking

The compiler validates property types:

```kry
# Valid property assignments
Button {
    width: 200                  # Valid: integer
    height: "50%"              # Valid: percentage string
    disabled: false            # Valid: boolean
    text_color: "#FF0000FF"    # Valid: color hex
    onClick: "handleClick"     # Valid: event handler string
}

# Invalid assignments (compilation errors)
Button {
    width: "not_a_number"      # Error: width expects number
    disabled: "false"          # Error: disabled expects boolean
    text_color: 255            # Error: text_color expects hex string
    nonexistent: "value"       # Error: unknown property
}
```

### Range Validation

Numeric properties have valid ranges:

```kry
Element {
    opacity: 1.5               # Error: opacity must be 0.0-1.0
    font_size: 0               # Error: font_size must be > 0
    z_index: 2000              # Error: z_index range is -1000 to 1000
    border_radius: -5          # Error: border_radius must be >= 0
}
```

## Best Practices

### 1. Use Semantic Properties

Choose properties that match your intent:

```kry
# Good: Clear semantic meaning
Button {
    background_color: "#007BFFFF"    # Primary action color
    text_color: "#FFFFFFFF"          # High contrast text
    padding: 12                      # Comfortable touch target
    border_radius: 6                 # Subtle rounding
}

# Avoid: Unclear or inconsistent styling
Button {
    background_color: "#FF69B4FF"    # Unclear intent
    padding: 1                       # Too small for interaction
    border_radius: 50                # Excessive rounding
}
```

### 2. Consistent Units

Use consistent units throughout your interface:

```kry
@variables {
    # Define consistent spacing scale
    spacing_xs: 4
    spacing_sm: 8
    spacing_md: 16
    spacing_lg: 24
    spacing_xl: 32
}

Container {
    padding: $spacing_md        # Consistent with scale
    gap: $spacing_sm           # Consistent with scale
    margin: $spacing_lg        # Consistent with scale
}
```

### 3. Color System

Establish a systematic color palette:

```kry
@variables {
    # Primary colors
    primary_50: "#EBF5FFFF"
    primary_100: "#DBEAFEFF"
    primary_500: "#007BFFFF"
    primary_600: "#0056B3FF"
    primary_700: "#004085FF"
    
    # Semantic colors
    success: "#28A745FF"
    warning: "#FFC107FF"
    error: "#DC3545FF"
    
    # Neutral colors
    gray_50: "#F8F9FAFF"
    gray_100: "#E9ECEFFF"
    gray_500: "#6C757DFF"
    gray_900: "#212529FF"
}

Button {
    background_color: $primary_500
    
    &:hover {
        background_color: $primary_600
    }
    
    &:active {
        background_color: $primary_700
    }
}
```

### 4. Responsive Design

Design for different screen sizes:

```kry
Container {
    width: "100%"
    max_width: 800              # Limit maximum width
    padding: $spacing_md
    
    # Children adapt to container
    Button {
        width: "100%"           # Full width on small screens
        min_width: 120          # Minimum usable size
    }
}
```

### 5. Performance Considerations

Optimize for rendering performance:

```kry
# Efficient: Static properties
Container {
    background_color: "#F8F9FAFF"
    padding: 16
    border_radius: 8
}

# Less efficient: Frequent dynamic changes
Container {
    # Avoid constantly changing these via scripts
    width: variable_width       # Changes trigger layout
    background_color: animated_color  # Changes trigger repaints
}
```

---

Properties are the foundation of element styling and behavior in Kryon. Understanding property types, inheritance, and best practices will help you create consistent, maintainable interfaces. Next, explore [Styles](styles.md) to learn about organizing and reusing property definitions.