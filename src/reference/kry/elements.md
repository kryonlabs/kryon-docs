# Elements

Elements are the fundamental building blocks of Kryon user interfaces. Each element type serves a specific purpose and supports different properties and behaviors. This reference covers all available elements and their usage.

## Element Hierarchy

All Kryon UIs start with an `App` element as the root, containing other elements in a tree structure:

```
App
├── Container
│   ├── Text
│   ├── Button
│   └── Container
│       ├── Input
│       └── Image
└── Container
    └── Text
```

## Core Elements

### App

The root element that defines application-level properties and contains all other UI elements.

```kry
App {
    # Window properties
    window_width: 800
    window_height: 600
    window_title: "My Application"
    
    # Application behavior
    resizable: true
    keep_aspect: false
    scale_factor: 1.0
    
    # Metadata
    version: "1.0.0"
    author: "Developer Name"
    icon: "assets/app_icon.png"
    
    # Main UI content
    Container {
        # App content goes here
    }
}
```

**App-Specific Properties:**
- `window_width`, `window_height` - Window dimensions in pixels
- `window_title` - Application title bar text
- `resizable` - Whether window can be resized
- `keep_aspect` - Maintain aspect ratio during resize
- `scale_factor` - UI scaling factor (1.0 = 100%)
- `version` - Application version string
- `author` - Developer/company name
- `icon` - Path to application icon

**Usage Notes:**
- Must be the root element for runnable applications
- Only one App element per file
- Can contain any other elements as children

### Container

A generic layout element that groups and organizes other elements. The workhorse of Kryon layouts.

```kry
Container {
    # Layout configuration
    layout: column center
    gap: 16
    padding: 20
    
    # Visual styling
    background_color: "#F8F9FAFF"
    border_radius: 8
    
    # Child elements
    Text { text: "Header" }
    Button { text: "Action" }
    Text { text: "Footer" }
}
```

**Common Layout Patterns:**

```kry
# Vertical stack
Container {
    layout: column
    gap: 12
    
    Text { text: "Item 1" }
    Text { text: "Item 2" }
    Text { text: "Item 3" }
}

# Horizontal row
Container {
    layout: row center
    gap: 8
    
    Button { text: "Cancel" }
    Button { text: "OK" }
}

# Centered content
Container {
    layout: column center
    padding: 40
    
    Text { text: "Centered Content" }
}

# Flexible layout with growing element
Container {
    layout: row
    
    Text { text: "Fixed"; width: 100 }
    Container { layout: grow; /* content */ }
    Button { text: "Fixed"; width: 80 }
}
```

### Text

Displays text content with configurable typography and styling.

```kry
Text {
    text: "Hello, World!"
    font_size: 16
    font_weight: normal
    text_color: "#333333FF"
    text_alignment: start
}
```

**Typography Properties:**
- `text` - The text content to display
- `font_size` - Text size in pixels
- `font_weight` - `normal`, `bold`, `light`, `heavy`
- `text_alignment` - `start`, `center`, `end`, `justify`
- `text_color` - Text color in hex format

**Text Examples:**

```kry
# Heading text
Text {
    text: "Application Title"
    font_size: 24
    font_weight: bold
    text_color: "#1A1A1AFF"
    text_alignment: center
}

# Body text
Text {
    text: "This is regular body text with normal weight and smaller size."
    font_size: 14
    font_weight: normal
    text_color: "#666666FF"
    text_alignment: start
}

# Caption text
Text {
    text: "Small caption or helper text"
    font_size: 12
    font_weight: light
    text_color: "#999999FF"
}
```

### Button

Interactive element that responds to clicks and touch input.

```kry
Button {
    text: "Click Me"
    background_color: "#007BFFFF"
    text_color: "#FFFFFFFF"
    padding: 12
    border_radius: 6
    onClick: "handleButtonClick"
    
    &:hover {
        background_color: "#0056B3FF"
        cursor: "pointer"
    }
    
    &:active {
        background_color: "#004085FF"
    }
    
    &:disabled {
        background_color: "#6C757DFF"
        cursor: "not_allowed"
    }
}
```

**Button Variants:**

```kry
# Primary button
Button {
    text: "Primary Action"
    background_color: "#007BFFFF"
    text_color: "#FFFFFFFF"
    padding: 12
    border_radius: 6
}

# Secondary button
Button {
    text: "Secondary Action"
    background_color: "transparent"
    text_color: "#007BFFFF"
    border_color: "#007BFFFF"
    border_width: 1
    padding: 12
    border_radius: 6
}

# Text button
Button {
    text: "Text Action"
    background_color: "transparent"
    text_color: "#007BFFFF"
    padding: 8
}

# Icon button
Button {
    text: "+"
    width: 40
    height: 40
    background_color: "#28A745FF"
    text_color: "#FFFFFFFF"
    border_radius: 20
    font_size: 18
    font_weight: bold
}
```

### Input

Text input field for user data entry.

```kry
Input {
    placeholder: "Enter your name..."
    value: ""
    font_size: 14
    padding: 8
    border_color: "#CCCCCCFF"
    border_width: 1
    border_radius: 4
    onChange: "handleInputChange"
    onFocus: "handleInputFocus"
    onBlur: "handleInputBlur"
    
    &:focus {
        border_color: "#007BFFFF"
        border_width: 2
    }
}
```

**Input Types and Patterns:**

```kry
# Basic text input
Input {
    placeholder: "Enter text..."
    onChange: "handleTextChange"
}

# Password input (if supported by runtime)
Input {
    placeholder: "Password"
    type: "password"
    onChange: "handlePasswordChange"
}

# Number input
Input {
    placeholder: "Enter number..."
    type: "number"
    min: 0
    max: 100
    onChange: "handleNumberChange"
}

# Email input
Input {
    placeholder: "email@example.com"
    type: "email"
    onChange: "handleEmailChange"
}
```

### Image

Displays images from local or remote sources.

```kry
Image {
    src: "assets/logo.png"
    width: 100
    height: 100
    border_radius: 8
}
```

**Image Properties:**
- `src` - Path to the image file (local or URL)
- `width`, `height` - Image dimensions in pixels
- `border_radius` - Rounded corners for the image
- `opacity` - Image transparency (0.0 to 1.0)

**Image Sizing and Scaling:**

```kry
# Fixed size
Image {
    src: "assets/icon.png"
    width: 32
    height: 32
}

# Responsive with aspect ratio
Image {
    src: "assets/banner.jpg"
    width: "100%"
    height: 200
    # Image will scale to fit width, height is maximum
}

# Circular avatar
Image {
    src: "assets/avatar.jpg"
    width: 60
    height: 60
    border_radius: 30
}

# Card image with rounded corners
Image {
    src: "assets/card_image.jpg"
    width: "100%"
    height: 160
    border_radius: 8
}

# Image with opacity
Image {
    src: "assets/watermark.png"
    width: 200
    height: 100
    opacity: 0.5
}
```

**Note:** Currently, the Raylib renderer displays image placeholders showing the filename. Full image rendering will be implemented in future versions.

## Interactive Elements

### Event Handling

All interactive elements support event handlers:

```kry
Button {
    text: "Interactive Button"
    onClick: "handleClick"        # Primary interaction
    onPress: "handlePress"        # Mouse/touch down
    onRelease: "handleRelease"    # Mouse/touch up
    onHover: "handleHover"        # Mouse enter
    onFocus: "handleFocus"        # Keyboard focus
    onBlur: "handleBlur"          # Focus lost
}

Input {
    placeholder: "Type here..."
    onChange: "handleChange"      # Value changed
    onSubmit: "handleSubmit"      # Enter key pressed
    onFocus: "handleFocus"        # Input focused
    onBlur: "handleBlur"          # Input unfocused
}
```

### State Management

Elements can be controlled via properties and scripts:

```kry
@script "lua" {
    local isButtonEnabled = true
    
    function toggleButton()
        isButtonEnabled = not isButtonEnabled
        local button = kryon.getElementById("toggle_btn")
        button.disabled = not isButtonEnabled
        button.text = isButtonEnabled and "Enabled" or "Disabled"
    end
    
    function updateInput()
        local input = kryon.getElementById("user_input")
        local display = kryon.getElementById("display_text")
        display.text = "You typed: " .. input.value
    end
}

Container {
    Button {
        id: "toggle_btn"
        text: "Enabled"
        onClick: "toggleButton"
    }
    
    Input {
        id: "user_input"
        placeholder: "Type something..."
        onChange: "updateInput"
    }
    
    Text {
        id: "display_text"
        text: "Output will appear here"
    }
}
```

## Advanced Elements

### Canvas

Low-level drawing element for custom graphics (runtime-dependent):

```kry
Canvas {
    width: 300
    height: 200
    background_color: "#F0F0F0FF"
    onDraw: "handleCanvasDraw"
    onClick: "handleCanvasClick"
}
```

### List

Container optimized for displaying collections (runtime-dependent):

```kry
List {
    layout: column
    gap: 1
    item_height: 40
    data_source: "listItems"
    onItemClick: "handleItemClick"
}
```

### Grid

Container for grid-based layouts (runtime-dependent):

```kry
Grid {
    columns: 3
    gap: 16
    padding: 16
    
    # Grid items added as children
    Container { background_color: "#FF0000FF" }
    Container { background_color: "#00FF00FF" }
    Container { background_color: "#0000FFFF" }
}
```

## Element Properties

### Common Properties

All elements support these base properties:

```kry
Element {
    # Identification
    id: "unique_identifier"
    
    # Positioning and sizing
    pos_x: 10                    # X coordinate
    pos_y: 20                    # Y coordinate
    width: 200                   # Width in pixels or percentage
    height: 100                  # Height in pixels or percentage
    min_width: 50                # Minimum width
    max_width: 400               # Maximum width
    min_height: 30               # Minimum height
    max_height: 200              # Maximum height
    
    # Visual styling
    background_color: "#FFFFFFFF"
    border_color: "#CCCCCCFF"
    border_width: 1
    border_radius: 4
    opacity: 1.0
    visibility: true
    z_index: 0
    
    # Layout and spacing
    padding: 10                  # Internal spacing
    margin: 5                    # External spacing
    layout: column               # Child layout mode
    gap: 8                       # Spacing between children
    
    # Interactive
    cursor: "default"
    disabled: false
    
    # Styling
    style: "my_custom_style"
}
```

### Property Inheritance

Some properties cascade from parent to child elements:

```kry
Container {
    # These properties inherit to child Text elements
    text_color: "#333333FF"
    font_size: 16
    font_weight: normal
    text_alignment: start
    
    Text { text: "Inherits parent text styling" }
    
    Text {
        text: "Overrides parent styling"
        text_color: "#007BFFFF"     # Overrides inherited color
        font_weight: bold           # Overrides inherited weight
    }
}
```

## Best Practices

### 1. Semantic Element Usage

Use elements for their intended purpose:

```kry
# Good: Semantic usage
Container {
    Text { text: "Form Title" }     # Use Text for content
    
    Input {                         # Use Input for user entry
        placeholder: "Enter name..."
        onChange: "handleNameChange"
    }
    
    Button {                        # Use Button for actions
        text: "Submit"
        onClick: "handleSubmit"
    }
}

# Avoid: Using wrong elements
Button { text: "Not clickable text" }  # Use Text instead
Text { onClick: "handleClick" }        # Use Button instead
```

### 2. Consistent Hierarchy

Maintain logical parent-child relationships:

```kry
# Good: Logical structure
App {
    Container {                    # Page container
        Container {                # Header section
            Text { text: "Title" }
        }
        
        Container {                # Content section
            # Main content
        }
        
        Container {                # Footer section
            Button { text: "Close" }
        }
    }
}
```

### 3. Proper Event Handling

Connect events to appropriate functions:

```kry
@script "lua" {
    function handleSave()
        -- Save logic here
        print("Saving data...")
    end
    
    function handleCancel()
        -- Cancel logic here
        print("Operation cancelled")
    end
}

Container {
    Button {
        text: "Save"
        onClick: "handleSave"      # Clear, descriptive function name
    }
    
    Button {
        text: "Cancel"
        onClick: "handleCancel"    # Matches button purpose
    }
}
```

### 4. Accessibility Considerations

Make interfaces accessible:

```kry
Button {
    text: "Save Document"         # Clear, descriptive text
    id: "save_button"            # Meaningful ID
    disabled: false              # Proper state management
    
    &:focus {
        border_color: "#007BFFFF"  # Clear focus indicator
        border_width: 2
    }
}

Input {
    placeholder: "Enter email address"  # Helpful placeholder
    onChange: "validateEmail"           # Immediate feedback
    
    &:focus {
        border_color: "#007BFFFF"       # Focus indication
    }
}
```

## Element Lifecycle

Understanding how elements are created and managed:

1. **Definition** - Element defined in KRY source
2. **Compilation** - Converted to binary KRB format
3. **Runtime Creation** - Element instantiated by runtime
4. **Property Resolution** - Properties calculated (inheritance, defaults)
5. **Layout** - Position and size calculated
6. **Rendering** - Element drawn to screen
7. **Event Handling** - User interactions processed
8. **Updates** - Properties modified via scripts
9. **Re-rendering** - Element redrawn as needed

---

Elements form the foundation of all Kryon interfaces. Master these core elements and their properties to build effective user interfaces. Next, explore [Properties](properties.md) for detailed information about styling and behavior configuration.