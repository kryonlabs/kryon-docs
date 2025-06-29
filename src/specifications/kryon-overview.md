# Kryon UI Framework - Overview Specification v1.2
*Complete conceptual guide for understanding the Kryon ecosystem*

## Executive Summary

Kryon is a declarative UI framework designed for universal deployment across desktop, mobile, web, and embedded platforms. It consists of three core components:

1. **KRY Language**: Human-readable UI definition language with component system and scripting
2. **KRB Binary Format**: Ultra-compact binary representation (65-75% size reduction)
3. **Kryon Runtime**: Cross-platform execution environment with script integration

## Architecture Overview

```
Source Files (.kry) 
    ↓ [Kryon Compiler]
Binary Files (.krb)
    ↓ [Kryon Runtime]
Running Application
```

### Development Workflow
1. Write UI in KRY language (declarative, component-based)
2. Compile to KRB binary (optimized, compressed)
3. Deploy KRB files to target platforms
4. Runtime loads and executes KRB files

## KRY Language Fundamentals

### File Structure Pattern
```kry
# File inclusion and modularity
@include "components/navigation.kry"
@include "themes/dark.kry"

# Compile-time variables
@variables {
    app_title: "My Application"
    primary_color: "#007BFF"
    spacing_unit: 16
}

# Reusable styling
style "primary_button" {
    background_color: $primary_color
    border_radius: 6
    padding: 12
}

# Custom components
Define NavigationBar {
    Properties {
        position: Enum(top, bottom) = bottom
        items: Array[String] = []
    }
    # Component implementation
}

# Embedded scripting
@script "lua" {
    function handleNavigation(item)
        kryon.navigateTo(item)
    end
}

# Application root
App {
    window_title: $app_title
    window_width: 800
    window_height: 600
    
    # UI hierarchy
    NavigationBar { position: top }
    # Main content area
    # Footer
}
```

### Core Element Types

#### Structural Elements
```kry
# Application root - required
App {
    window_title: "Application Name"
    window_width: 1024
    window_height: 768
    resizable: true
    
    # All other elements go inside App
}

# Layout containers
Container {
    layout: column              # row, column, center, grow, wrap
    gap: 16                    # spacing between children
    padding: 12                # internal spacing
    margin: 8                  # external spacing
    
    # Child elements
    Text { text: "Item 1" }
    Text { text: "Item 2" }
}
```

#### Content Elements
```kry
# Text display
Text {
    text: "Display text here"
    font_size: 18
    font_weight: bold          # normal, bold, light, heavy
    text_alignment: center     # start, center, end, justify
    text_color: "#333333"
}

# Image display  
Image {
    src: "images/logo.png"
    width: 200
    height: 100
    opacity: 0.8
}
```

#### Interactive Elements
```kry
# Clickable button
Button {
    text: "Click Me"
    background_color: "#007BFF"
    text_color: "#FFFFFF"
    onClick: "handleButtonClick"
    
    # Pseudo-selectors for interactive states
    &:hover {
        background_color: "#0056B3"
        cursor: "pointer"
    }
    
    &:active {
        background_color: "#004085"
    }
    
    &:disabled {
        background_color: "#6C757D"
        cursor: "not_allowed"
    }
}

# Text input
Input {
    placeholder: "Enter text here"
    value: ""
    onChange: "handleTextChange"
    onFocus: "handleFocus"
    onBlur: "handleBlur"
}
```

### Variable System

#### Variable Declaration and Usage
```kry
@variables {
    # Basic types
    app_name: "My Application"
    primary_color: "#007BFF"
    spacing_base: 16
    is_debug: true
    
    # Calculated values
    secondary_color: "#6C757D"
    large_spacing: $spacing_base * 2
    button_height: 40
    
    # Conditional values (evaluated at compile time)
    theme_bg: $is_debug ? "#FF0000" : "#FFFFFF"
}

# Variable usage with $ prefix
Text {
    text: $app_name
    color: $primary_color
    margin: $large_spacing
}

Button {
    height: $button_height
    background_color: $theme_bg
}
```

#### Variable Scoping Rules
1. Variables are globally available after definition
2. Variables from included files are merged
3. Later definitions override earlier ones
4. Compiler warns about redefinitions
5. Undefined variable usage causes compile error

### Style System

#### Basic Style Definition
```kry
style "button_base" {
    border_radius: 6
    padding: 12
    font_weight: bold
    cursor: "pointer"
}

style "button_primary" {
    extends: "button_base"
    background_color: "#007BFF"
    text_color: "#FFFFFF"
    border_color: "#0056B3"
}

style "button_secondary" {
    extends: "button_base"  
    background_color: "#6C757D"
    text_color: "#FFFFFF"
}
```

#### Multiple Inheritance
```kry
style "typography" {
    font_family: "Arial, sans-serif"
    font_size: 14
    line_height: 1.4
}

style "spacing" {
    margin: 8
    padding: 12
}

style "borders" {
    border_width: 1
    border_color: "#DEE2E6"
    border_radius: 4
}

# Multiple inheritance - later styles override earlier ones
style "card" {
    extends: ["typography", "spacing", "borders"]
    background_color: "#FFFFFF"
    box_shadow: "0 2px 4px rgba(0,0,0,0.1)"
}
```

### Component System

#### Component Definition
```kry
Define Card {
    Properties {
        title: String = "Card Title"
        content: String = ""
        width: String = "auto"
        elevation: Int = 1
        clickable: Bool = false
    }
    
    Container {
        width: $width
        style: "card_container"
        
        # Card header
        Container {
            style: "card_header"
            Text { 
                text: $title
                style: "card_title"
            }
        }
        
        # Card content  
        Container {
            style: "card_content"
            Text {
                text: $content
                style: "card_text"
            }
        }
    }
}
```

#### Component Usage and Instance Children
```kry
# Basic usage with properties
Card {
    title: "Welcome"
    content: "This is a welcome message"
    width: "300px"
    elevation: 2
}

# Usage with instance children
Card {
    title: "Custom Content"
    width: "400px"
    
    # These children get inserted into component template
    Image { src: "custom.png"; width: "100%" }
    Button { text: "Action"; onClick: "handleAction" }
}
```

### Scripting Integration

#### Multi-Language Support
```kry
# Lua scripting (primary, lightweight)
@script "lua" {
    function handleButtonClick()
        local count = kryon.getState("click_count") or 0
        count = count + 1
        kryon.setState("click_count", count)
        
        local button = kryon.getElementById("my_button")
        button.text = "Clicked " .. count .. " times"
    end
    
    function updateTheme(isDark)
        if isDark then
            kryon.setGlobalStyle("background_color", "#1E1E1E")
            kryon.setGlobalStyle("text_color", "#FFFFFF")
        else
            kryon.setGlobalStyle("background_color", "#FFFFFF") 
            kryon.setGlobalStyle("text_color", "#000000")
        end
    end
}

# JavaScript support (web-familiar)
@script "javascript" {
    function validateInput(value) {
        const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.test(value)) {
            kryon.showError("Invalid email format");
            return false;
        }
        return true;
    }
}
```

#### Runtime API Overview
```kry
@script "lua" {
    -- Element manipulation
    local element = kryon.getElementById("my_element")
    element.text = "New text"
    element.background_color = "#FF0000"
    
    -- Event handling
    kryon.addEventListener("button", "click", function(event)
        print("Button clicked:", event.elementId)
    end)
    
    -- State management
    kryon.setState("user_name", "John Doe")
    local name = kryon.getState("user_name")
    
    -- Variable access
    local theme = kryon.getVariable("theme_color")
    
    -- Timers and animation
    kryon.setTimer(1000, function()
        updateClock()
    end)
    
    -- System integration
    kryon.showMessage("Operation completed")
    kryon.navigateTo("settings_page")
}
```

### Interactive States and Pseudo-Selectors

#### State-Based Styling
```kry
Button {
    # Base state
    background_color: "#007BFF"
    text_color: "#FFFFFF"
    border_width: 2
    border_color: "#0056B3"
    
    # Hover state
    &:hover {
        background_color: "#0056B3"
        border_color: "#004085"
        cursor: "pointer"
        transform: "scale(1.02)"
    }
    
    # Active/pressed state
    &:active {
        background_color: "#004085"
        transform: "scale(0.98)"
    }
    
    # Focused state (keyboard navigation)
    &:focus {
        border_color: "#80BDFF"
        box_shadow: "0 0 0 3px rgba(0,123,255,0.25)"
    }
    
    # Disabled state
    &:disabled {
        background_color: "#6C757D"
        text_color: "#FFFFFF"
        opacity: 0.65
        cursor: "not_allowed"
    }
}

# Checkbox/radio button checked state
Input {
    type: "checkbox"
    
    &:checked {
        background_color: "#007BFF"
        border_color: "#007BFF"
    }
}
```

## KRB Binary Format Concepts

### Binary Structure Overview
The KRB format organizes data into sections for optimal loading and memory usage:

```
[File Header - 54 bytes]
├── Magic number: "KRB1"
├── Version: 0x0005 (v1.2)
├── Feature flags (scripts, compression, etc.)
├── Section counts and offsets
└── File integrity checksum

[String Table - Variable size]
├── Deduplicated UTF-8 strings
├── LZ4 compression for large tables
└── Indexed access (0-based)

[Element Tree - Variable size]  
├── Hierarchical UI structure
├── Parent-child relationships
├── Element type and property references
└── Lazy loading support

[Property Blocks - Variable size]
├── Shared property definitions
├── Type-specific encoding
└── Reference-based reuse

[Style Definitions - Variable size]
├── Inheritance-resolved styling
├── Property block references
└── Pseudo-selector support

[Component Templates - Variable size]
├── Reusable component definitions
├── Property schemas with defaults
└── Template instantiation data

[Script Code - Variable size]
├── Multi-language support
├── Entry point mapping
├── External file references

[Resource References - Variable size]
├── External file metadata
├── Integrity checksums
└── Platform-specific variants
```

### Optimization Techniques

#### String Deduplication
```
Source KRY has repeated strings:
Button { text: "Save" }
Button { text: "Save" }  
Text { text: "Save your work" }

Optimized KRB string table:
Index 0: ""
Index 1: "Save"
Index 2: "Save your work"

Elements reference by index:
Button[0].text → String[1]
Button[1].text → String[1]  
Text[0].text → String[2]
```

#### Property Block Sharing
```
Multiple elements with same properties:
Button { background_color: "#007BFF"; padding: 12 }
Button { background_color: "#007BFF"; padding: 12 }
Container { background_color: "#007BFF" }

Become shared property blocks:
Block A: background_color = #007BFF
Block B: padding = 12

Element references:
Button[0] → [Block A, Block B]
Button[1] → [Block A, Block B]
Container[0] → [Block A]
```

## Runtime Architecture

### Platform Support Matrix
```
Platform    | Memory | Performance | Features
------------|--------|-------------|------------------
Desktop     | 256MB  | 60 FPS      | Full feature set
Mobile      | 128MB  | 60 FPS      | Touch, battery opt
Web         | 64MB   | 30 FPS      | WebAssembly, PWA
Embedded    | 32KB   | 24 FPS      | Minimal runtime
```

### Loading Process
1. **Memory Map**: Map KRB file into memory (desktop/mobile)
2. **Header Parse**: Validate magic, version, checksums
3. **Section Index**: Build offset table for lazy loading
4. **String Table**: Load and decompress string data
5. **Root Parse**: Parse App element and immediate children
6. **Lazy Load**: Load additional sections on demand
7. **Script Init**: Initialize script engines and load code
8. **Render Start**: Begin UI rendering pipeline

### Component Instantiation
1. **Placeholder Detection**: Find elements with _componentName property
2. **Definition Lookup**: Find component in Component Definition Table
3. **Template Clone**: Create element tree from template
4. **Property Apply**: Apply instance properties to cloned tree
5. **Child Reparent**: Move instance children to designated slots
6. **Tree Replace**: Replace placeholder with instantiated tree

### Script Execution Environment
- **Sandboxed Execution**: Scripts run in isolated environments
- **API Bridge**: Controlled access to UI elements via kryon API
- **Memory Management**: Automatic garbage collection
- **Error Handling**: Graceful degradation on script failures
- **Performance Monitoring**: Script execution time tracking

## Development Toolchain

### Compiler Features
```bash
# Basic compilation
kryc app.kry --output app.krb

# Optimization levels
kryc app.kry --optimize=none|basic|aggressive --output app.krb

# Development mode (external scripts, debug symbols)
kryc app.kry --dev --output app.krb

# Production mode (embedded scripts, compression)
kryc app.kry --prod --compress=max --output app.krb

# Target-specific compilation
kryc app.kry --target=desktop|mobile|web|embedded --output app.krb
```

### Development Tools
```bash
# Binary inspection
krb-inspect app.krb
├── File structure analysis
├── Section size breakdown  
├── String deduplication stats
├── Property usage analysis
└── Component dependency graph

# Performance profiling
krb-profile app.krb --platform=desktop
├── Load time analysis
├── Memory usage projection
├── Render performance estimate
└── Optimization suggestions

# Size optimization
krb-analyze app.krb --size
├── Redundant data identification
├── Compression ratio analysis
├── Tree structure optimization
└── Size reduction opportunities
```

## Performance Characteristics

### File Size Ranges
```
Application Type    | KRY Source | KRB Binary | Compression
--------------------|------------|------------|------------
Simple Form         | 2-5 KB     | 0.8-2 KB   | 60-75%
Business App        | 50-200 KB  | 15-70 KB   | 65-70%
Complex Dashboard   | 500KB-2MB  | 150-700KB  | 65-70%
Game UI             | 1-5 MB     | 350KB-2MB  | 60-65%
```

### Loading Performance
```
Platform | Small (5KB) | Medium (50KB) | Large (500KB)
---------|-------------|---------------|---------------
Desktop  | 0.8ms       | 3.2ms         | 28ms
Mobile   | 1.5ms       | 6.1ms         | 52ms  
Web      | 2.1ms       | 9.4ms         | 78ms
Embedded | 4.2ms       | 18.6ms        | 156ms
```

### Memory Usage
- **Runtime Overhead**: 1.5-3x file size during execution
- **Peak Memory**: File size + decompressed strings + element cache
- **Streaming**: Large files can be partially loaded
- **Garbage Collection**: Automatic cleanup of unused elements

## Error Handling Strategy

### Compile-Time Errors
- **Syntax Errors**: Clear error messages with line/column info
- **Type Validation**: Property type checking and coercion
- **Reference Resolution**: Undefined variables, styles, components
- **Circular Dependencies**: Component and style inheritance cycles

### Runtime Errors  
- **Missing Resources**: Graceful fallbacks for missing images/fonts
- **Script Failures**: Continue UI operation with degraded functionality
- **Memory Pressure**: Automatic cache eviction and optimization
- **Platform Limitations**: Feature detection and graceful degradation

## Security Considerations

### Content Security
- **Script Sandboxing**: Limited API access for embedded scripts
- **Resource Validation**: Cryptographic hashes for external resources
- **Memory Safety**: Bounds checking and safe memory access
- **Input Sanitization**: Protection against malformed KRB files

### Platform Integration
- **Web Security**: Content Security Policy compliance
- **Mobile Security**: App sandbox integration
- **Desktop Security**: Operating system security integration
- **Embedded Security**: Minimal attack surface

This overview provides the conceptual foundation for understanding Kryon. For implementation details, see the Implementation Specification. For complete technical reference, see the Reference Specification.