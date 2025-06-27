# KRY Language - Minimal AI Specification

## Overview
KRY is a declarative UI language that compiles to compact KRB binaries. Version 1.2.

## Basic Syntax

### File Structure
```kry
# Comments start with #
@include "other.kry"           # Optional includes
@variables { /* vars */ }      # Optional variables
style "name" { /* ... */ }     # Optional styles
Define Component { /* ... */ } # Optional components
@script "lua" { /* ... */ }    # Optional scripts
App { /* main UI */ }          # Required root element
```

### Property Assignment
```kry
property_name: value
text: "Hello World"     # Strings in quotes
width: 200              # Numbers
height: "50%"           # Percentages as strings
visible: true           # Booleans
color: "#FF0000FF"      # Colors (RGBA hex)
```

## Core Elements

### App (Root)
```kry
App {
    window_title: "My App"
    window_width: 800
    window_height: 600
    # UI content here
}
```

### Container (Layout)
```kry
Container {
    layout: column          # column, row, center, grow
    gap: 16                # Space between children
    padding: 12            # Inner spacing
    margin: 8              # Outer spacing
    # Child elements here
}
```

### Interactive Elements
```kry
Text { text: "Hello" }
Button { 
    text: "Click me"
    onClick: "handleClick"
}
Input { 
    placeholder: "Enter text"
    onChange: "handleInput"
}
Image { 
    src: "image.png"
    width: 100
    height: 100
}
```

## Common Properties
- **Layout**: `pos_x`, `pos_y`, `width`, `height`
- **Visual**: `background_color`, `text_color`, `border_radius`, `opacity`
- **Text**: `font_size`, `font_weight`, `text_alignment`
- **Spacing**: `padding`, `margin`, `gap`
- **Events**: `onClick`, `onChange`, `onHover`

## Variables
```kry
@variables {
    primary_color: "#007BFFFF"
    spacing: 16
    title: "My App"
}

# Usage: $variable_name
Button { background_color: $primary_color }
```

## Styles
```kry
style "button_primary" {
    background_color: "#007BFFFF"
    text_color: "#FFFFFFFF"
    padding: 12
    border_radius: 6
}

# Usage: style_id: "style_name"
Button { style_id: "button_primary" }
```

## Pseudo-Selectors
```kry
Button {
    background_color: "#007BFFFF"
    
    &:hover {
        background_color: "#0056B3FF"
        cursor: "pointer"
    }
    
    &:active {
        background_color: "#004085FF"
    }
}
```

## Components
```kry
Define CustomButton {
    Properties {
        button_text: String = "Click Me"
        is_primary: Bool = true
    }
    
    Button {
        text: $button_text
        background_color: $is_primary ? "#007BFFFF" : "#6C757DFF"
    }
}

# Usage
CustomButton { 
    button_text: "Submit"
    is_primary: false
}
```

## Scripts
```kry
@script "lua" {
    function handleClick()
        local element = kryon.getElementById("button1")
        element.text = "Clicked!"
    end
}

Button {
    id: "button1"
    text: "Click Me"
    onClick: "handleClick"
}
```

## Key Concepts
- **Compilation**: `.kry` → `.krb` binary
- **Property Types**: String, Number, Bool, Color, Enum
- **Layout Modes**: column, row, center, grow (combinable)
- **Event Handling**: Function names reference scripts
- **Component System**: Reusable UI definitions with properties
- **Inheritance**: Styles support single/multiple inheritance
- **State Management**: Pseudo-selectors for UI states