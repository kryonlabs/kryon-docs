# KRY Language Reference

The KRY source language is Kryon's human-readable format for defining user interfaces. This reference covers the complete syntax, elements, properties, and features available in KRY v1.2.

## Language Overview

KRY files (`.kry`) are text-based source files that compile to compact KRB binary files. The language is designed to be:

- **Readable** - Clean syntax that's easy to understand
- **Expressive** - Supports complex UI patterns and layouts  
- **Modular** - File inclusion and component definition system
- **Efficient** - Compiles to ultra-compact binary format

## Basic Structure

Every KRY file follows this general structure:

```kry
# Optional: Include other files
@include "styles/theme.kry"
@include "components/buttons.kry"

# Optional: Define variables
@variables {
    primary_color: "#007BFFFF"
    font_size: 16
}

# Optional: Define reusable styles
style "my_style" {
    background_color: $primary_color
    padding: 16
}

# Optional: Define custom components  
Define MyComponent {
    Properties {
        text: String = "Default"
    }
    
    Button {
        text: $text
        style: "my_style"
    }
}

# Optional: Embed scripts
@script "lua" {
    function handleClick()
        print("Button clicked!")
    end
}

# Required: Main UI definition
App {
    window_title: "My App"
    
    Container {
        MyComponent {
            text: "Custom Button"
            onClick: "handleClick"
        }
    }
}
```

## Reference Sections

### [Syntax](syntax.md)
- File structure and basic syntax rules
- Comments, whitespace, and formatting
- Block structure and property syntax
- Include directives and file organization

### [Elements](elements.md)
- Core elements: App, Container, Text, Button, Input, Image
- Interactive elements and their properties
- Element hierarchy and nesting rules
- Element-specific properties and behaviors

### [Properties](properties.md)
- Complete property reference with types and values
- Layout properties: positioning, sizing, alignment
- Visual properties: colors, fonts, borders, spacing
- Interactive properties: events, states, cursors
- Property inheritance and cascading rules

### [Styles](styles.md)
- Creating reusable style definitions
- Style inheritance with `extends`
- Style composition and organization
- Best practices for maintainable styling

### [Variables](variables.md)
- Defining and using variables with `@variables`
- Variable types and scoping rules
- Using variables for theming and consistency
- Variable resolution and compilation

### [Components](components.md)
- Custom component definition with `Define`
- Component properties and default values
- Component instantiation and usage
- Advanced component patterns and best practices

### [Scripts](scripts.md)
- Embedding scripts with `@script` blocks
- Supported languages: Lua, JavaScript, Python, Wren
- Script-UI integration and event handling
- Runtime API for element manipulation

### [Pseudo-Selectors](pseudo-selectors.md)
- Interactive state styling with `&:hover`, `&:active`, etc.
- State-based property overrides
- Combining pseudo-selectors
- Performance considerations

## Quick Reference

### File Extensions
- **`.kry`** - Source files (human-readable)
- **`.krb`** - Compiled binary files (deployment)

### Core Elements
```kry
App { }          # Application root
Container { }    # Layout container  
Text { }         # Text display
Button { }       # Interactive button
Input { }        # Text input field
Image { }        # Image display
```

### Common Properties
```kry
# Layout
layout: column           # row, column, center, grow
width: 200              # pixels
height: "50%"           # percentage
padding: 16             # all sides
gap: 8                  # spacing between children

# Visual
background_color: "#FF0000FF"  # hex RGBA
text_color: "#333333FF"        # text color
font_size: 16                  # pixels
border_radius: 6               # pixels

# Interactive
id: "my_element"        # element identifier
onClick: "handleClick"  # event handler
disabled: false         # boolean state
```

### Pseudo-Selectors
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
    
    &:disabled {
        background_color: "#6C757DFF"
    }
}
```

### Variables and Styles
```kry
@variables {
    primary: "#007BFFFF"
    spacing: 16
}

style "button_style" {
    background_color: $primary
    padding: $spacing
    border_radius: 6
}

Button {
    text: "Styled Button"
    style: "button_style"
}
```

### Script Integration
```kry
@script "lua" {
    function handleButtonClick()
        local element = kryon.getElementById("my_button")
        element.text = "Clicked!"
    end
}

Button {
    id: "my_button"
    text: "Click Me"
    onClick: "handleButtonClick"
}
```

## Language Features by Version

### KRY v1.2 (Current)
- ✅ Full script integration (`@script` blocks)
- ✅ Pseudo-selector styling (`&:hover`, `&:active`, etc.)
- ✅ Cursor property for interactive elements
- ✅ Enhanced component system
- ✅ State-based property resolution

### KRY v1.1
- ✅ Enhanced component system with `Define`
- ✅ Component properties and runtime instantiation
- ✅ Standard component library foundation
- ✅ Improved property inheritance

### KRY v1.0
- ✅ Core element syntax (App, Container, Text, etc.)
- ✅ Property system with standard properties
- ✅ Style inheritance via `extends`
- ✅ File inclusion via `@include`
- ✅ Variables with `@variables`
- ✅ Basic component definition system
- ✅ Event handling syntax

## Compilation Process

Understanding how KRY compiles to KRB:

```
KRY Source (.kry)
       ↓
   Preprocessing
   - Resolve @include directives
   - Substitute @variables
   - Parse @script blocks
       ↓
     Parsing
   - Build element tree
   - Resolve properties
   - Validate syntax
       ↓
   Code Generation
   - Generate KRB binary
   - Optimize for size
   - Create string/resource tables
       ↓
   KRB Binary (.krb)
```

### Compiler Options

```bash
# Basic compilation
kryc input.kry -o output.krb

# Development mode (debug info, larger size)
kryc input.kry --dev -o output.krb

# Production mode (maximum optimization)
kryc input.kry --release -o output.krb

# Include paths for @include directives
kryc main.kry -I styles/ -I components/ -o app.krb

# Watch mode (recompile on changes)
kryc main.kry --watch -o app.krb
```

## Error Handling

The KRY compiler provides detailed error messages:

```
error: Unknown property 'colour' on element 'Button'
  ┌─ main.kry:15:5
  │
15│     colour: "#FF0000FF"
  │     ^^^^^^ did you mean 'background_color'?
  │
help: Valid color properties for Button:
      - background_color
      - text_color  
      - border_color
```

## Best Practices

### 1. File Organization
```
project/
├── main.kry              # Main app definition
├── styles/
│   ├── theme.kry         # Variables and base styles
│   └── components.kry    # Component-specific styles
├── components/
│   ├── buttons.kry       # Button components
│   └── forms.kry         # Form components
└── scripts/
    └── app.lua           # Application logic
```

### 2. Naming Conventions
- **Files**: `snake_case.kry`
- **Elements**: `PascalCase` (Button, Container)
- **Properties**: `snake_case` (background_color, font_size)
- **IDs**: `snake_case` (save_button, user_profile)
- **Variables**: `snake_case` (primary_color, default_spacing)
- **Styles**: `snake_case` (button_primary, card_elevated)

### 3. Code Organization
- Use `@include` to split large files
- Group related styles together
- Define variables before using them
- Put scripts at the top of files
- Use consistent indentation (2 or 4 spaces)

## Tools and Editors

- [VS Code Extension](../../tools/editors/vscode.md) - Full language support
- [Vim Plugin](../../tools/editors/vim.md) - Syntax highlighting
- [Live Preview Tool](../../tools/preview.md) - Real-time development

---

This reference provides comprehensive documentation for the KRY language. Use the navigation above to explore specific topics, or jump to the [Examples](../../examples/calculator.md) to see complete applications.
