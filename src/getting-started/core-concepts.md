# Core Concepts

Now that you've built your first Kryon app, let's explore the fundamental concepts that make Kryon powerful and efficient. Understanding these core ideas will help you build more complex and maintainable applications.

## Elements: The Building Blocks

Every Kryon UI is built from **elements** - the fundamental building blocks that represent different types of UI components.

### Core Elements

```kry
# App - The root container for your application
App {
    window_title: "My App"
    window_width: 400
    window_height: 300
}

# Container - Groups and layouts other elements
Container {
    layout: column
    padding: 16
}

# Text - Displays text content
Text {
    text: "Hello World"
    font_size: 18
}

# Button - Interactive clickable element
Button {
    text: "Click Me"
    onClick: "handleClick"
}

# Input - Text input field
Input {
    placeholder: "Enter text..."
    onChange: "handleInputChange"
}

# Image - Displays images
Image {
    source: "assets/logo.png"
    width: 100
    height: 100
}
```

### Element Hierarchy

Elements form a tree structure where each element can contain child elements:

```kry
App {
    Container {
        Text { text: "Header" }
        
        Container {
            Button { text: "Button 1" }
            Button { text: "Button 2" }
        }
        
        Text { text: "Footer" }
    }
}
```

This creates a hierarchy:
```
App
└── Container
    ├── Text ("Header")
    ├── Container
    │   ├── Button ("Button 1")
    │   └── Button ("Button 2")
    └── Text ("Footer")
```

## Properties: Customizing Elements

Properties control how elements look and behave. Every element type supports different properties.

### Common Properties

```kry
Container {
    # Layout & Positioning
    width: 200
    height: 100
    padding: 16
    margin: 8
    
    # Visual Styling
    background_color: "#F0F0F0FF"
    border_color: "#CCCCCCFF"
    border_width: 1
    border_radius: 8
    
    # Element Identification
    id: "main_container"
}
```

### Property Types

**Numbers**
```kry
Text {
    font_size: 16        # Integer pixels
    opacity: 0.8         # Float 0.0-1.0
}
```

**Strings**
```kry
Text {
    text: "Hello World"
    id: "greeting"
}
```

**Colors**
```kry
Button {
    background_color: "#007BFFFF"    # Hex RGBA
    text_color: "#FFFFFFFF"         # White
    border_color: "#0056B3FF"       # Darker blue
}
```

**Booleans**
```kry
Button {
    disabled: false
    visibility: true
}
```

**Percentages**
```kry
Container {
    width: "50%"         # 50% of parent width
    height: "100%"       # Full parent height
}
```

## Layout System

Kryon uses a flexible layout system similar to CSS Flexbox for arranging elements.

### Layout Direction

```kry
# Vertical layout (column)
Container {
    layout: column
    
    Text { text: "First" }
    Text { text: "Second" }
    Text { text: "Third" }
}

# Horizontal layout (row)
Container {
    layout: row
    
    Button { text: "Left" }
    Button { text: "Center" }
    Button { text: "Right" }
}
```

### Alignment

```kry
# Center alignment
Container {
    layout: column center
    
    Text { text: "Centered content" }
}

# Start alignment (default)
Container {
    layout: row start
    
    Button { text: "Left aligned" }
}

# End alignment
Container {
    layout: column end
    
    Text { text: "Bottom aligned" }
}

# Space between
Container {
    layout: row space_between
    
    Button { text: "Left" }
    Button { text: "Right" }
}
```

### Spacing

```kry
Container {
    layout: column
    gap: 16          # Space between children
    padding: 20      # Internal spacing
    margin: 10       # External spacing
    
    Text { text: "Item 1" }
    Text { text: "Item 2" }
    Text { text: "Item 3" }
}
```

### Flexible Sizing

```kry
Container {
    layout: row
    
    # Fixed size
    Text {
        text: "Fixed"
        width: 100
    }
    
    # Grows to fill available space
    Container {
        layout: grow
        background_color: "#F0F0F0FF"
        
        Text { text: "Flexible content" }
    }
    
    # Another fixed size
    Button {
        text: "Fixed"
        width: 80
    }
}
```

## Styling and Theming

### Inline Styles

The simplest way to style elements is with inline properties:

```kry
Button {
    text: "Styled Button"
    background_color: "#007BFFFF"
    text_color: "#FFFFFFFF"
    padding: 12
    border_radius: 6
    font_size: 16
    font_weight: bold
}
```

### Reusable Styles

Create reusable styles with `style` blocks:

```kry
style "primary_button" {
    background_color: "#007BFFFF"
    text_color: "#FFFFFFFF"
    padding: 12
    border_radius: 6
    font_size: 16
    font_weight: bold
}

style "secondary_button" {
    extends: "primary_button"
    background_color: "#6C757DFF"
}

# Use the styles
Button {
    text: "Primary Action"
    style: "primary_button"
}

Button {
    text: "Secondary Action"
    style: "secondary_button"
}
```

### Variables for Consistency

Use variables to maintain consistent values:

```kry
@variables {
    primary_color: "#007BFFFF"
    secondary_color: "#6C757DFF"
    text_color: "#333333FF"
    border_radius: 6
    standard_padding: 12
}

Button {
    background_color: $primary_color
    text_color: "#FFFFFFFF"
    padding: $standard_padding
    border_radius: $border_radius
}
```

## Interactive States

Elements can have different appearances based on user interaction:

```kry
Button {
    text: "Interactive Button"
    background_color: "#007BFFFF"
    text_color: "#FFFFFFFF"
    
    # Hover state
    &:hover {
        background_color: "#0056B3FF"
        cursor: "pointer"
    }
    
    # Active (being clicked) state
    &:active {
        background_color: "#004085FF"
    }
    
    # Focus state (keyboard navigation)
    &:focus {
        border_color: "#80BDFFFF"
        border_width: 2
    }
    
    # Disabled state
    &:disabled {
        background_color: "#6C757DFF"
        cursor: "not_allowed"
    }
}
```

## Events and Interactivity

Connect UI elements to code with event handlers:

```kry
@script "lua" {
    function handleButtonClick()
        print("Button was clicked!")
        
        local button = kryon.getElementById("my_button")
        button.text = "Clicked!"
    end
    
    function handleInputChange(value)
        print("Input changed to: " .. value)
        
        local display = kryon.getElementById("display")
        display.text = "You typed: " .. value
    end
}

Container {
    Button {
        id: "my_button"
        text: "Click Me"
        onClick: "handleButtonClick"
    }
    
    Input {
        placeholder: "Type something..."
        onChange: "handleInputChange"
    }
    
    Text {
        id: "display"
        text: "Output will appear here"
    }
}
```

### Common Event Types

- **`onClick`** - Mouse click or touch
- **`onChange`** - Input value changed
- **`onFocus`** - Element gained focus
- **`onBlur`** - Element lost focus
- **`onHover`** - Mouse entered element
- **`onPress`** - Mouse/touch pressed down
- **`onRelease`** - Mouse/touch released

## File Organization

As your apps grow, organize code across multiple files:

```kry
# main.kry
@include "styles/theme.kry"
@include "components/button.kry"

App {
    window_title: "Organized App"
    
    Container {
        MyCustomButton {
            text: "Custom Component"
            theme: "dark"
        }
    }
}
```

```kry
# styles/theme.kry
@variables {
    primary_color: "#007BFFFF"
    text_color: "#333333FF"
}

style "app_container" {
    background_color: "#FAFAFAFF"
    padding: 20
}
```

```kry
# components/button.kry
Define MyCustomButton {
    Properties {
        text: String = "Button"
        theme: String = "light"
    }
    
    Button {
        text: $text
        style: "custom_button_style"
        # Component-specific styling based on theme
    }
}
```

## Performance Considerations

### Binary Size

Kryon compiles to extremely compact binary files:

```bash
# Check your compiled file size
ls -la build/app.krb
# Typical results: 800 bytes - 5KB for complete apps
```

### Memory Usage

- Elements are lightweight - minimal memory per element
- Properties are stored efficiently in binary format
- No runtime parsing overhead

### Compilation Speed

- Fast compilation from `.kry` to `.krb`
- Incremental compilation for large projects
- Watch mode for development

## Best Practices

### 1. Use Semantic Element Structure
```kry
# Good: Clear hierarchy
App {
    Container {  # Header
        Text { text: "App Title" }
    }
    
    Container {  # Main content
        # ... main UI ...
    }
    
    Container {  # Footer
        # ... footer content ...
    }
}
```

### 2. Consistent Naming
```kry
# Use clear, descriptive IDs
Button { id: "save_button"; text: "Save" }
Container { id: "user_profile_section" }
Text { id: "error_message_display" }
```

### 3. Organize Styles
```kry
# Group related styles
style "button_base" { /* common button properties */ }
style "button_primary" { extends: "button_base"; /* primary styling */ }
style "button_secondary" { extends: "button_base"; /* secondary styling */ }
```

### 4. Use Variables for Consistency
```kry
@variables {
    # Spacing scale
    spacing_xs: 4
    spacing_sm: 8
    spacing_md: 16
    spacing_lg: 24
    
    # Color palette
    color_primary: "#007BFFFF"
    color_success: "#28A745FF"
    color_danger: "#DC3545FF"
}
```

## What's Next?

Now that you understand the core concepts, you're ready to explore:

**[→ Language Reference](../reference/kry/index.md)** - Complete syntax and features

**[→ Styling Guide](../styling/basics.md)** - Advanced styling techniques

**[→ Examples](../examples/calculator.md)** - Learn from complete projects

**[→ Components](../reference/kry/components.md)** - Build reusable UI components

The core concepts you've learned here form the foundation for everything in Kryon. Practice building small UIs using these patterns, and you'll quickly become proficient at creating efficient, maintainable applications.
