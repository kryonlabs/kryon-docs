# KRY Language Specification

The KRY language is a declarative UI language designed for building cross-platform applications. It combines modern web technologies (HTML/CSS concepts) with efficient binary compilation for optimal performance.

## File Structure

```kry
# Optional includes
@include "path/to/file.kry"

# Optional variables block
@variables {
    variable_name: value
    primary_color: "#007BFFFF"
    counter: 0
}

# Optional font declarations
font "custom_font" "path/to/font.ttf"

# Style definitions
style "style_name" {
    property: value
    extends: ["parent_style"]
    
    &:hover {
        property: hover_value
    }
}

# Component definitions
Define ComponentName {
    Properties {
        prop_name: Type = default_value
    }
    
    Container {
        // Component template
    }
}

# Optional scripts
@script "lua" name="script_name" {
    // Script code
}

# Main application
App {
    window_title: "My Application"
    window_width: 800
    window_height: 600
    
    Container {
        // UI elements
    }
}
```

## Element Types

### Core Elements

#### App (Root Element)
The root element of any KRY application. Only one App element is allowed per file.

```kry
App {
    window_title: "Application Title"
    window_width: 800
    window_height: 600
    resizable: true
    keep_aspect_ratio: false
    scale_factor: 1.0
    icon: "app_icon.ico"
    version: "1.0.0"
    author: "Developer Name"
}
```

**Properties:**
- `window_title`: String - Window title
- `window_width`, `window_height`: Number - Initial window size
- `resizable`: Boolean - Whether window can be resized
- `keep_aspect_ratio`: Boolean - Maintain aspect ratio on resize
- `scale_factor`: Number - UI scaling factor
- `icon`: String - Path to icon file
- `version`: String - Application version
- `author`: String - Application author

#### Container
Layout container for grouping elements.

```kry
Container {
    id: "main_container"
    width: 100%
    height: 100%
    padding: 10px
    gap: 5px
    
    // Child elements
}
```

#### Text
Text display element.

```kry
Text {
    id: "label"
    text: "Hello World"
    font_size: 16px
    text_color: "#000000"
    text_alignment: center
    font_weight: bold
    font_family: "Arial"
}
```

#### Button
Interactive button element.

```kry
Button {
    id: "submit_button"
    text: "Submit"
    onClick: handleSubmit
    
    style "button_style" {
        background_color: "#007BFF"
        text_color: "#FFFFFF"
        border_radius: 4px
        padding: 8px 16px
        
        &:hover {
            background_color: "#0056B3"
        }
        
        &:active {
            background_color: "#004085"
        }
    }
}
```

#### Input
Text input field.

```kry
Input {
    id: "username"
    placeholder: "Enter username"
    value: $input_value
    onChange: updateValue
    max_length: 50
}
```

#### Image
Image display element.

```kry
Image {
    id: "logo"
    src: "logo.png"
    width: 100px
    height: 100px
    aspect_ratio: 1.0
}
```

#### Checkbox
Checkbox input element.

```kry
Checkbox {
    id: "agree_terms"
    checked: false
    text: "I agree to the terms"
    onChange: toggleAgreement
}
```

#### Radio
Radio button element.

```kry
Radio {
    id: "option_a"
    name: "selection"
    value: "a"
    text: "Option A"
    checked: false
}
```

#### Slider
Slider control element.

```kry
Slider {
    id: "volume"
    min: 0
    max: 100
    value: 50
    step: 1
    onChange: updateVolume
}
```

### Layout Elements

#### List
List container for dynamic content.

```kry
List {
    id: "items"
    orientation: vertical
    item_spacing: 5px
    
    // List items
}
```

#### Grid
Grid layout container.

```kry
Grid {
    id: "photo_grid"
    grid_template_columns: "repeat(3, 1fr)"
    grid_template_rows: "auto"
    gap: 10px
    
    // Grid items
}
```

#### Scrollable
Scrollable container.

```kry
Scrollable {
    id: "content_area"
    scroll_direction: vertical
    show_scrollbar: true
    
    // Scrollable content
}
```

#### Tabs
Tab container element.

```kry
Tabs {
    id: "main_tabs"
    active_tab: 0
    
    Tab {
        title: "Home"
        // Tab content
    }
    
    Tab {
        title: "Settings"
        // Tab content
    }
}
```

### Media Elements

#### Canvas
Drawing canvas element.

```kry
Canvas {
    id: "drawing_area"
    width: 400px
    height: 300px
    onDraw: renderCanvas
}
```

#### Video
Video player element.

```kry
Video {
    id: "player"
    src: "video.mp4"
    controls: true
    autoplay: false
    loop: false
}
```

## Property System

### Common Properties

All elements support these common properties:

#### Layout Properties
- `width`, `height`: Size in pixels, percentages, or units
- `min_width`, `min_height`: Minimum size constraints
- `max_width`, `max_height`: Maximum size constraints
- `padding`: Internal spacing (shorthand or individual: `padding_top`, `padding_right`, `padding_bottom`, `padding_left`)
- `margin`: External spacing (shorthand or individual)
- `gap`: Spacing between child elements
- `position`: Positioning type (`static`, `relative`, `absolute`, `fixed`)
- `top`, `right`, `bottom`, `left`: Position offsets

#### Visual Properties
- `background_color`: Background color
- `text_color`: Text/foreground color
- `border_color`: Border color
- `border_width`: Border thickness
- `border_radius`: Corner rounding
- `opacity`: Transparency (0.0 to 1.0)
- `z_index`: Stacking order
- `visibility`: Show/hide element (`visible`, `hidden`)
- `overflow`: Content overflow behavior (`visible`, `hidden`, `scroll`)
- `cursor`: Mouse cursor type

#### Flexbox Properties
- `display`: Display type (`flex`, `block`, `inline`, `grid`)
- `flex_direction`: Flex direction (`row`, `column`, `row-reverse`, `column-reverse`)
- `flex_wrap`: Flex wrapping (`nowrap`, `wrap`, `wrap-reverse`)
- `flex_grow`: Flex grow factor
- `flex_shrink`: Flex shrink factor
- `flex_basis`: Flex basis size
- `align_items`: Cross-axis alignment (`flex-start`, `center`, `flex-end`, `stretch`)
- `align_self`: Individual cross-axis alignment
- `align_content`: Multi-line cross-axis alignment
- `justify_content`: Main-axis alignment (`flex-start`, `center`, `flex-end`, `space-between`, `space-around`, `space-evenly`)
- `justify_items`: Grid item main-axis alignment
- `justify_self`: Individual grid item main-axis alignment

#### Grid Properties
- `grid_template_columns`: Grid column track definitions
- `grid_template_rows`: Grid row track definitions
- `grid_column`: Grid column placement
- `grid_row`: Grid row placement
- `grid_area`: Grid area placement
- `grid_column_gap`: Column gap
- `grid_row_gap`: Row gap
- `grid_auto_flow`: Auto-placement algorithm
- `grid_auto_columns`: Auto-generated column sizes
- `grid_auto_rows`: Auto-generated row sizes

#### Text Properties
- `font_size`: Text size in pixels, em, rem, etc.
- `font_weight`: Text weight (`normal`, `bold`, `100`-`900`)
- `font_family`: Font family name
- `text_alignment`: Text alignment (`left`, `center`, `right`, `justify`)
- `line_height`: Line spacing
- `letter_spacing`: Character spacing
- `text_decoration`: Text decoration (`none`, `underline`, `overline`, `line-through`)

#### Transform Properties
- `transform`: Transform object with multiple properties

```kry
transform: {
    scale: 1.5              // Uniform scale
    scale_x: 2.0           // X-axis scale
    scale_y: 0.5           // Y-axis scale
    rotate: 45deg          // Rotation
    translate_x: 50px      // X translation
    translate_y: 20px      // Y translation
    skew_x: 10deg         // X skew
    skew_y: 5deg          // Y skew
}
```

## Value Types and Units

### Numbers
- Integers: `42`, `-10`
- Floats: `3.14`, `-2.5`

### Strings
- Double-quoted: `"Hello World"`
- Escape sequences: `\n`, `\t`, `\"`, `\\`

### Booleans
- `true`, `false`

### Colors
- Hex RGB: `#FF0000` (red)
- Hex RGBA: `#FF0000FF` (red with alpha)
- Named colors: `red`, `blue`, `green`, etc.

### Units
- **Pixels**: `10px` (absolute)
- **Em**: `1.5em` (relative to font size)
- **Rem**: `2rem` (relative to root font size)
- **Viewport**: `50vw`, `100vh`
- **Percentages**: `50%`
- **Angles**: `45deg`, `1.57rad`, `0.25turn`

### Variables
- Variable reference: `$variable_name`
- String interpolation: `"Count: $counter"`

### Collections
- **Objects**: `{ key: value, key2: value2 }`
- **Arrays**: `[value1, value2, value3]`

## Style System

### Basic Styles

```kry
style "button_style" {
    background_color: "#007BFF"
    text_color: "#FFFFFF"
    border_radius: 4px
    padding: 8px 16px
    font_weight: bold
}
```

### Style Inheritance

```kry
style "base_button" {
    border_radius: 4px
    padding: 8px 16px
    font_weight: bold
}

style "primary_button" {
    extends: ["base_button"]
    background_color: "#007BFF"
    text_color: "#FFFFFF"
}

style "danger_button" {
    extends: ["base_button"]
    background_color: "#DC3545"
    text_color: "#FFFFFF"
}
```

### Pseudo-Selectors

Styles support CSS-like pseudo-selectors for interactive states:

```kry
style "interactive_button" {
    background_color: "#007BFF"
    text_color: "#FFFFFF"
    transition: background_color 0.2s
    
    &:hover {
        background_color: "#0056B3"
    }
    
    &:active {
        background_color: "#004085"
        transform: { scale: 0.95 }
    }
    
    &:focus {
        outline: 2px solid "#80BDFF"
    }
    
    &:disabled {
        background_color: "#6C757D"
        opacity: 0.6
    }
}
```

**Supported pseudo-selectors:**
- `:hover` - Mouse hover state
- `:active` - Active/pressed state
- `:focus` - Keyboard focus state
- `:disabled` - Disabled state
- `:checked` - Checked state (checkboxes, radios)

### Style Application

Styles can be applied to elements in multiple ways:

```kry
// Inline style property
Button {
    style: "button_style"
    text: "Click me"
}

// Style block within element
Button {
    text: "Click me"
    
    style "inline_style" {
        background_color: "#28A745"
    }
}
```

## Variable System

### Variable Declaration

Variables are declared in `@variables` blocks and use unified `$variable` syntax:

```kry
@variables {
    app_title: "My Application"
    primary_color: "#007BFFFF"
    secondary_color: "#6C757DFF"
    counter_value: 0
    user_name: "Guest"
    window_width: 800
    window_height: 600
    debug_mode: false
}
```

### Variable Usage

#### In Styles
Variables in styles are resolved at compile-time:

```kry
style "primary_button" {
    background_color: $primary_color
    text_color: "#FFFFFF"
    border: 2px solid $secondary_color
}
```

#### In Templates
Variables in element properties can be updated at runtime:

```kry
App {
    window_title: $app_title
    window_width: $window_width
    window_height: $window_height
    
    Text {
        text: $counter_value           # Direct variable
        text: "Welcome, $user_name!"   # String interpolation
        text: "Count: $counter_value"  # Variable in string
    }
    
    Button {
        text: "Debug: $debug_mode"
        visible: $debug_mode
    }
}
```

### Variable Scoping

- **Global variables**: Defined in `@variables` blocks, available throughout the file
- **Component variables**: Defined within component property blocks
- **Local variables**: Created and updated by scripts at runtime

### Runtime Variable Updates

Variables can be updated via the script system:

```lua
-- Update template variables
setTemplateVariable("counter_value", 42)
setTemplateVariable("user_name", "Alice")

-- Get current values
local count = getTemplateVariable("counter_value")
```

## Component System

### Component Definition

Components are reusable UI elements with customizable properties:

```kry
Define UserCard {
    Properties {
        user_name: String = "Unknown"
        avatar_url: String = ""
        role: Enum(user, admin, moderator) = user
        online: Bool = false
    }
    
    Container {
        display: flex
        flex_direction: row
        align_items: center
        padding: 16px
        gap: 12px
        
        style "user_card" {
            background_color: "#FFFFFF"
            border: 1px solid "#E0E0E0"
            border_radius: 8px
            
            &:hover {
                border_color: "#007BFF"
            }
        }
        
        Image {
            src: $avatar_url
            width: 48px
            height: 48px
            border_radius: 24px
        }
        
        Container {
            display: flex
            flex_direction: column
            flex_grow: 1
            
            Text {
                text: $user_name
                font_weight: bold
                font_size: 16px
            }
            
            Text {
                text: $role
                font_size: 14px
                text_color: "#6C757D"
            }
        }
        
        Container {
            width: 12px
            height: 12px
            border_radius: 6px
            background_color: $online ? "#28A745" : "#DC3545"
        }
    }
}
```

### Component Usage

```kry
App {
    Container {
        UserCard {
            user_name: "Alice Smith"
            avatar_url: "avatars/alice.jpg"
            role: admin
            online: true
        }
        
        UserCard {
            user_name: "Bob Jones"
            avatar_url: "avatars/bob.jpg"
            role: user
            online: false
        }
    }
}
```

### Property Types

Components support various property types:

- **String**: Text values
- **Int**: Integer numbers
- **Float**: Floating-point numbers
- **Bool**: Boolean values
- **Color**: Color values
- **StyleID**: Reference to a style
- **Resource**: Resource reference
- **Enum(...)**: Enumeration with specific values

### Default Values

Properties can have default values that are used when not specified:

```kry
Define Button {
    Properties {
        text: String = "Button"
        variant: Enum(primary, secondary, danger) = primary
        disabled: Bool = false
        size: Enum(small, medium, large) = medium
    }
    
    // Component template
}
```

## Include System

### File Inclusion

The `@include` directive allows modular file organization:

```kry
# main.kry
@include "styles/theme.kry"
@include "components/buttons.kry"
@include "components/forms.kry"

App {
    // Use included styles and components
}
```

### Include Resolution

- Paths are relative to the including file
- Circular includes are detected and prevented
- Included files are processed in order

### Common Patterns

```kry
# styles/theme.kry
@variables {
    primary_color: "#007BFF"
    secondary_color: "#6C757D"
    background_color: "#F8F9FA"
}

style "theme_button" {
    background_color: $primary_color
    text_color: "#FFFFFF"
}
```

```kry
# components/ui.kry
Define IconButton {
    Properties {
        icon: String = "default"
        size: Int = 24
    }
    
    Button {
        // Icon button implementation
    }
}
```

## Script System

### Script Languages

KRY supports multiple scripting languages:

- **Lua**: `lua`
- **JavaScript**: `javascript`, `js`
- **Python**: `python`, `py`
- **Wren**: `wren`

### Inline Scripts

```kry
@script "lua" name="counter_logic" {
    local counter = 0
    
    function increment()
        counter = counter + 1
        setTemplateVariable("counter_value", counter)
    end
    
    function decrement()
        counter = counter - 1
        setTemplateVariable("counter_value", counter)
    end
}
```

### External Scripts

```kry
@script "lua" from="scripts/game_logic.lua"
@script "javascript" from="scripts/animations.js"
```

### Script Functions

```kry
@function "lua" calculateTotal(items) {
    local total = 0
    for i, item in ipairs(items) do
        total = total + item.price
    end
    return total
}
```

### DOM API

Scripts have access to a comprehensive DOM-like API:

```lua
-- Element access
local button = getElementById("submit_button")
local texts = getElementsByTag("Text")
local styled = getElementsByClass("primary_button")

-- Element manipulation
button:setText("Loading...")
button:setVisible(false)
button:setChecked(true)
button:setStyle("disabled_style")

-- DOM traversal
local parent = button:getParent()
local children = parent:getChildren()
local next = button:getNextSibling()
local prev = button:getPreviousSibling()

-- Root access
local root = getRootElement()
```

## Event Handling

### Event Types

Elements support various event types:

- `onClick`: Mouse click/tap
- `onPress`: Mouse/touch press
- `onRelease`: Mouse/touch release
- `onHover`: Mouse hover (enter/leave)
- `onFocus`: Element gains focus
- `onBlur`: Element loses focus
- `onChange`: Value changes (inputs)
- `onSubmit`: Form submission

### Event Handler Assignment

```kry
Button {
    text: "Click me"
    onClick: handleButtonClick
}

Input {
    placeholder: "Enter text"
    onChange: handleTextChange
    onFocus: handleInputFocus
}
```

### Event Handler Implementation

```kry
@script "lua" {
    function handleButtonClick()
        print("Button was clicked!")
        local button = getElementById("my_button")
        button:setText("Clicked!")
    end
    
    function handleTextChange(value)
        print("Input changed to: " .. value)
        setTemplateVariable("input_value", value)
    end
    
    function handleInputFocus()
        print("Input gained focus")
        local input = getElementById("text_input")
        input:setStyle("focused_input")
    end
}
```

## Font System

### Font Declaration

Custom fonts can be declared and used throughout the application:

```kry
font "heading_font" "fonts/Roboto-Bold.ttf"
font "body_font" "fonts/OpenSans-Regular.ttf"
font "mono_font" "fonts/FiraCode-Regular.ttf"

style "heading" {
    font_family: "heading_font"
    font_size: 24px
    font_weight: bold
}

style "code" {
    font_family: "mono_font"
    font_size: 14px
    background_color: "#F5F5F5"
}
```

### Font Usage

```kry
Text {
    text: "Main Heading"
    font_family: "heading_font"
    font_size: 32px
}

Text {
    text: "Body text content"
    font_family: "body_font"
    font_size: 16px
}
```

## Comments

KRY supports single-line comments:

```kry
# This is a comment
// This is also a comment

App {
    # Application configuration
    window_title: "My App"  # Window title
    window_width: 800       // Window width in pixels
}
```

## Best Practices

### File Organization

```
project/
├── main.kry           # Main application file
├── styles/
│   ├── theme.kry      # Global variables and base styles
│   ├── components.kry # Component-specific styles
│   └── utilities.kry  # Utility styles
├── components/
│   ├── buttons.kry    # Button components
│   ├── forms.kry      # Form components
│   └── layout.kry     # Layout components
├── scripts/
│   ├── app.lua        # Main application logic
│   ├── utils.lua      # Utility functions
│   └── api.js         # API communication
└── assets/
    ├── fonts/
    ├── images/
    └── icons/
```

### Naming Conventions

- **Variables**: `snake_case` (e.g., `primary_color`, `user_name`)
- **Components**: `PascalCase` (e.g., `UserCard`, `NavigationBar`)
- **Styles**: `kebab-case` or `snake_case` (e.g., `primary-button`, `card_style`)
- **IDs**: `snake_case` (e.g., `submit_button`, `user_list`)
- **Functions**: `camelCase` (e.g., `handleClick`, `updateCounter`)

### Performance Tips

1. **Use variables**: Define colors, sizes, and common values as variables
2. **Leverage style inheritance**: Use `extends` to avoid duplication
3. **Optimize includes**: Group related styles and components
4. **Minimize inline styles**: Prefer named styles for reusability
5. **Use appropriate units**: Choose units that scale well across devices

### Accessibility

```kry
Button {
    text: "Submit Form"
    aria_label: "Submit the contact form"
    aria_describedby: "form_help_text"
    tab_index: 1
}

Text {
    id: "form_help_text"
    text: "All fields are required"
    aria_live: "polite"
}
```

This specification provides the complete foundation for understanding and working with the KRY declarative UI language. The language is designed to be intuitive for web developers while providing the performance benefits of binary compilation for cross-platform applications.