# Syntax

The KRY language uses a clean, structured syntax designed for readability and ease of use. This page covers the fundamental syntax rules, file structure, and formatting guidelines.

## File Structure

Every KRY file follows a predictable structure with optional sections:

```kry
# 1. File-level directives (optional)
@include "other_file.kry"
@variables { /* ... */ }

# 2. Style definitions (optional)
style "my_style" { /* ... */ }

# 3. Component definitions (optional)
Define MyComponent { /* ... */ }

# 4. Script blocks (optional)
@script "lua" { /* ... */ }

# 5. Main UI definition (required for runnable apps)
App {
    # Application content
}
```

## Basic Syntax Rules

### Encoding and Format
- Files must be UTF-8 encoded
- File extension: `.kry`
- Case-sensitive keywords and identifiers
- Whitespace and indentation are flexible but recommended for readability

### Comments
Single-line comments start with `#`:

```kry
# This is a comment
App {
    # Comments can be anywhere
    window_title: "My App"  # End-of-line comment
}
```

Block comments are not supported - use multiple single-line comments:

```kry
# This is a multi-line comment
# that spans several lines
# to describe complex functionality
```

### Identifiers and Keywords

**Keywords** (case-sensitive):
- Elements: `App`, `Container`, `Text`, `Button`, `Input`, `Image`
- Directives: `@include`, `@variables`, `@script`
- Definitions: `style`, `Define`, `Properties`
- Pseudo-selectors: `&:hover`, `&:active`, `&:focus`, `&:disabled`, `&:checked`

**Identifiers** for IDs, variable names, style names:
- Must start with letter or underscore: `my_id`, `_private`, `buttonStyle`
- Can contain letters, numbers, underscores: `button_1`, `primaryColor`
- Cannot be keywords: `App`, `style`, `true`, `false`

## Block Structure

### Basic Blocks
Blocks are defined with curly braces `{}`:

```kry
ElementName {
    property1: value1
    property2: value2
    
    ChildElement {
        child_property: value
    }
}
```

### Single-Line Elements
Elements with only properties (no children) can be written on one line:

```kry
# Single-line form
Text { text: "Hello"; font_size: 16; text_color: "#333333FF" }

# Equivalent multi-line form
Text {
    text: "Hello"
    font_size: 16
    text_color: "#333333FF"
}
```

Properties in single-line form are separated by semicolons (`;`). The last property doesn't require a trailing semicolon.

### Mixed Form
Elements can have properties on the declaration line and children in a block:

```kry
Container { layout: row; gap: 10 } {
    Button { text: "First" }
    Button { text: "Second" }
}

# Equivalent to:
Container {
    layout: row
    gap: 10
    
    Button { text: "First" }
    Button { text: "Second" }
}
```

## Property Syntax

### Basic Property Assignment
Properties use colon syntax:

```kry
Element {
    property_name: value
    another_property: "string value"
    numeric_property: 42
}
```

### Property Types and Values

**Strings** - Enclosed in double quotes:
```kry
Text {
    text: "Hello World"
    id: "greeting_text"
    placeholder: "Enter your name..."
}
```

**Numbers** - Integers and floats:
```kry
Container {
    width: 200          # Integer (pixels)
    height: 150         # Integer (pixels)
    opacity: 0.8        # Float (0.0-1.0)
    font_size: 16       # Integer (pixels)
}
```

**Percentages** - Strings ending with `%`:
```kry
Container {
    width: "50%"        # 50% of parent width
    height: "100%"      # Full parent height
    max_width: "80%"    # Maximum 80% of parent
}
```

**Colors** - Hex format with alpha:
```kry
Button {
    background_color: "#007BFFFF"    # Blue with full alpha
    text_color: "#FFFFFFFF"         # White
    border_color: "#00000080"       # Black with 50% alpha
}

# Short form (3-digit hex expanded)
Text {
    text_color: "#F00"              # Expands to "#FF0000FF"
}
```

**Booleans** - `true` or `false`:
```kry
Button {
    disabled: false
    visibility: true
}
```

**Enums** - Predefined keywords:
```kry
Container {
    layout: column              # row, column, center, grow
    text_alignment: center      # start, center, end, justify
}

Text {
    font_weight: bold          # normal, bold, light, heavy
}
```

**Variables** - Reference with `$` prefix:
```kry
@variables {
    primary_color: "#007BFFFF"
    default_padding: 16
}

Button {
    background_color: $primary_color
    padding: $default_padding
}
```

## Pseudo-Selector Syntax

Interactive states use CSS-like pseudo-selector syntax:

```kry
Button {
    # Base properties
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
        text_color: "#CCCCCCFF"
        cursor: "not_allowed"
    }
    
    # Checked state (for checkboxes/radio buttons)
    &:checked {
        background_color: "#28A745FF"
    }
}
```

### Combining Pseudo-Selectors
Multiple states can be combined:

```kry
Button {
    background_color: "#007BFFFF"
    
    # Hover when not disabled
    &:hover:not(:disabled) {
        background_color: "#0056B3FF"
    }
    
    # Focus when hovered
    &:hover:focus {
        border_color: "#FFFF00FF"
    }
}
```

## Directive Syntax

### Include Directive
```kry
# Include other KRY files
@include "styles/theme.kry"
@include "components/buttons.kry"
@include "../shared/common.kry"
```

### Variables Directive
```kry
@variables {
    # Variable definitions
    primary_color: "#007BFFFF"
    secondary_color: "#6C757DFF"
    
    # Numbers
    default_spacing: 16
    border_radius: 6
    
    # Strings
    default_font: "Arial"
    app_title: "My Application"
    
    # Booleans
    debug_mode: true
}
```

### Script Directive
```kry
# Inline script
@script "lua" {
    function handleClick()
        print("Button clicked!")
    end
}

# External script file
@script "lua" from "scripts/app.lua"

# Named script block
@script "lua" name "button_handlers" {
    function primaryAction()
        -- Handle primary button
    end
}

# Script with mode control
@script "lua" mode="external" {
    function heavyProcessing()
        -- Large script that should be external
    end
}
```

## Style Definition Syntax

```kry
# Basic style
style "button_primary" {
    background_color: "#007BFFFF"
    text_color: "#FFFFFFFF"
    padding: 12
    border_radius: 6
}

# Style with inheritance
style "button_large" {
    extends: "button_primary"
    font_size: 18
    padding: 16
}

# Multiple inheritance
style "button_special" {
    extends: ["button_primary", "elevated_shadow"]
    background_color: "#28A745FF"
}
```

## Component Definition Syntax

```kry
Define ComponentName {
    # Optional: Declare accepted properties
    Properties {
        text_label: String = "Default Text"
        is_enabled: Bool = true
        button_style: StyleID = "default_button"
        status: Enum(active, inactive, pending) = active
    }
    
    # Required: Component template
    Container {
        # Component structure using standard elements
        Button {
            text: $text_label
            disabled: !$is_enabled
            style: $button_style
        }
    }
}
```

## Whitespace and Formatting

### Indentation
Indentation is flexible but consistent indentation is strongly recommended:

```kry
# Good: Consistent 4-space indentation
Container {
    layout: column
    padding: 16
    
    Text {
        text: "Header"
        font_size: 18
    }
    
    Button {
        text: "Action"
        onClick: "handleAction"
    }
}

# Also acceptable: 2-space indentation
Container {
  layout: column
  
  Text { text: "Content" }
  Button { text: "OK" }
}
```

### Line Breaks and Spacing
```kry
# Good: Logical grouping with blank lines
@variables {
    # Colors
    primary: "#007BFFFF"
    secondary: "#6C757DFF"
    
    # Spacing
    padding_sm: 8
    padding_md: 16
}

style "card" {
    background_color: $primary
    padding: $padding_md
}

App {
    Container {
        # Header section
        Text { text: "Title" }
        
        # Content section
        Container {
            # Content here
        }
        
        # Footer section
        Button { text: "Done" }
    }
}
```

## Syntax Validation

The compiler performs comprehensive syntax validation:

### Valid Syntax
```kry
App {
    window_title: "Valid App"
    
    Container {
        layout: column center
        gap: 16
        
        Text {
            text: "Hello World"
            font_size: 18
        }
    }
}
```

### Common Syntax Errors

**Missing quotes around strings:**
```kry
# ERROR: String values must be quoted
Text { text: Hello World }

# CORRECT: Quoted string
Text { text: "Hello World" }
```

**Missing colons in property assignments:**
```kry
# ERROR: Missing colon
Button { text "Click Me" }

# CORRECT: Colon required
Button { text: "Click Me" }
```

**Invalid property names:**
```kry
# ERROR: Unknown property
Button { colour: "#FF0000FF" }

# CORRECT: Valid property name
Button { background_color: "#FF0000FF" }
```

**Mismatched braces:**
```kry
# ERROR: Missing closing brace
Container {
    Text { text: "Hello"
}

# CORRECT: Matched braces
Container {
    Text { text: "Hello" }
}
```

## Best Practices

### 1. Consistent Formatting
- Use consistent indentation (2 or 4 spaces)
- Group related properties together
- Use blank lines to separate logical sections
- Align similar properties for readability

### 2. Clear Naming
```kry
# Good: Descriptive names
@variables {
    primary_button_color: "#007BFFFF"
    large_font_size: 18
    standard_border_radius: 6
}

# Avoid: Unclear abbreviations
@variables {
    pbc: "#007BFFFF"    # Unclear
    lfs: 18            # Unclear
    sbr: 6             # Unclear
}
```

### 3. Logical Organization
```kry
# Good: Grouped by functionality
Container {
    # Layout properties
    layout: column center
    gap: 16
    
    # Visual properties
    background_color: "#F8F9FAFF"
    border_radius: 8
    padding: 20
    
    # Interactive properties
    id: "main_container"
    onClick: "handleContainerClick"
}
```

## Error Messages

The compiler provides helpful error messages with location information:

```
error: Unexpected token 'hello' 
  ┌─ main.kry:5:10
  │
5 │     text: hello world
  │           ^^^^^ expected quoted string
  │
help: String values must be enclosed in double quotes
      try: text: "hello world"
```

---

Understanding these syntax rules will help you write clean, maintainable KRY code. Next, explore the [Elements](elements.md) reference to learn about all available UI elements.
