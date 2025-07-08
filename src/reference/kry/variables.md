# Variables

Variables in KRY provide a powerful way to define reusable values that can be referenced throughout your application. They enable consistent theming, easy maintenance, and flexible design systems.

## Variable Definition

Variables are defined using the `@variables` directive and referenced with the `$` prefix:

```kry
@variables {
    primary_color: "#007BFFFF"
    default_spacing: 16
    app_title: "My Application"
    debug_enabled: true
}

# Usage
Button {
    background_color: $primary_color
    padding: $default_spacing
    text: $app_title
}

App {
    window_title: $app_title
}
```

## Variable Types

### String Variables

String values for text content, colors, and identifiers:

```kry
@variables {
    app_name: "Kryon Application"
    primary_color: "#007BFFFF"
    secondary_color: "#6C757DFF"
    success_color: "#28A745FF"
    error_color: "#DC3545FF"
    
    # File paths
    app_icon: "assets/icon.png"
    logo_image: "assets/logo.svg"
    
    # Event handlers
    save_handler: "handleSave"
    cancel_handler: "handleCancel"
}

# Usage
App {
    window_title: $app_name
    icon: $app_icon
}

Button {
    text: "Save"
    background_color: $primary_color
    onClick: $save_handler
}

Image {
    source: $logo_image
}
```

### Numeric Variables

Integer and floating-point values for dimensions, spacing, and measurements:

```kry
@variables {
    # Spacing scale
    spacing_xs: 4
    spacing_sm: 8
    spacing_md: 16
    spacing_lg: 24
    spacing_xl: 32
    
    # Typography scale
    font_xs: 12
    font_sm: 14
    font_md: 16
    font_lg: 18
    font_xl: 24
    font_xxl: 32
    
    # Layout dimensions
    sidebar_width: 250
    header_height: 60
    footer_height: 40
    
    # Visual properties
    border_radius: 6
    border_width: 1
    shadow_blur: 4
    opacity_disabled: 0.6
}

Container {
    padding: $spacing_md
    gap: $spacing_sm
    width: $sidebar_width
}

Text {
    font_size: $font_lg
    text_color: $primary_color
}
```

### Boolean Variables

True/false values for feature flags and configuration:

```kry
@variables {
    # Feature flags
    debug_mode: true
    show_tooltips: false
    enable_animations: true
    
    # UI configuration
    window_resizable: true
    show_status_bar: false
    dark_mode: false
}

App {
    resizable: $window_resizable
}

@script "lua" {
    if $debug_mode then
        print("Debug mode enabled")
    end
}
```

### Percentage Variables

Percentage values stored as strings:

```kry
@variables {
    content_width: "80%"
    sidebar_width: "20%"
    full_height: "100%"
    half_width: "50%"
}

Container {
    layout: row
    
    Container {
        width: $sidebar_width
        height: $full_height
    }
    
    Container {
        width: $content_width
        height: $full_height
    }
}
```

## Variable Scoping

### Global Variables

Variables defined at the file level are available throughout that file:

```kry
@variables {
    global_primary: "#007BFFFF"
    global_spacing: 16
}

style "button_style" {
    background_color: $global_primary  # Available here
    padding: $global_spacing
}

App {
    Container {
        Button {
            background_color: $global_primary  # Available here too
        }
    }
}
```

### File-Level Scope

Variables are scoped to individual files and included files:

```kry
# theme.kry
@variables {
    theme_primary: "#007BFFFF"
    theme_spacing: 16
}

# main.kry
@include "theme.kry"

@variables {
    local_font_size: 14
}

Button {
    background_color: $theme_primary    # From included file
    padding: $theme_spacing            # From included file
    font_size: $local_font_size       # From local variables
}
```

### Variable Resolution Order

When variables are defined in multiple places, resolution follows this order:

1. **Local file variables** (highest priority)
2. **Included file variables** (in order of inclusion)
3. **Default values** (lowest priority)

```kry
# base.kry
@variables {
    button_color: "#6C757DFF"    # Default gray
    text_size: 14
}

# main.kry
@include "base.kry"

@variables {
    button_color: "#007BFFFF"    # Overrides base.kry value
    # text_size: 14 inherited from base.kry
}

Button {
    background_color: $button_color  # Uses "#007BFFFF" (local override)
    font_size: $text_size           # Uses 14 (from base.kry)
}
```

## Design System Variables

### Color System

Create a comprehensive color palette:

```kry
@variables {
    # Brand colors
    brand_primary: "#007BFFFF"
    brand_secondary: "#6C757DFF"
    brand_accent: "#FFC107FF"
    
    # Semantic colors
    success_color: "#28A745FF"
    warning_color: "#FFC107FF"
    error_color: "#DC3545FF"
    info_color: "#17A2B8FF"
    
    # Neutral palette
    white: "#FFFFFFFF"
    gray_50: "#F8F9FAFF"
    gray_100: "#E9ECEFFF"
    gray_200: "#DEE2E6FF"
    gray_300: "#CED4DAFF"
    gray_400: "#ADB5BDFF"
    gray_500: "#6C757DFF"
    gray_600: "#495057FF"
    gray_700: "#343A40FF"
    gray_800: "#212529FF"
    gray_900: "#000000FF"
    
    # Alpha variants
    overlay_light: "#FFFFFF80"
    overlay_dark: "#00000080"
    shadow_color: "#00000020"
}
```

### Spacing System

Define a consistent spacing scale:

```kry
@variables {
    # Base spacing unit
    space_unit: 4
    
    # Spacing scale (multiples of base unit)
    space_1: 4      # 1 × base_unit
    space_2: 8      # 2 × base_unit
    space_3: 12     # 3 × base_unit
    space_4: 16     # 4 × base_unit
    space_5: 20     # 5 × base_unit
    space_6: 24     # 6 × base_unit
    space_8: 32     # 8 × base_unit
    space_10: 40    # 10 × base_unit
    space_12: 48    # 12 × base_unit
    space_16: 64    # 16 × base_unit
    space_20: 80    # 20 × base_unit
    space_24: 96    # 24 × base_unit
    
    # Semantic spacing
    padding_xs: 4
    padding_sm: 8
    padding_md: 16
    padding_lg: 24
    padding_xl: 32
    
    gap_xs: 4
    gap_sm: 8
    gap_md: 12
    gap_lg: 16
    gap_xl: 20
}
```

### Typography System

Define text sizing and hierarchy:

```kry
@variables {
    # Font sizes
    text_xs: 12
    text_sm: 14
    text_base: 16
    text_lg: 18
    text_xl: 20
    text_2xl: 24
    text_3xl: 30
    text_4xl: 36
    text_5xl: 48
    text_6xl: 60
    
    # Line heights (if supported)
    leading_tight: 1.25
    leading_snug: 1.375
    leading_normal: 1.5
    leading_relaxed: 1.625
    leading_loose: 2.0
    
    # Semantic text sizes
    caption_size: 12
    body_size: 16
    heading_size: 24
    title_size: 32
    display_size: 48
}

# Usage in styles
style "heading_primary" {
    font_size: $title_size
    font_weight: bold
    text_color: $gray_900
}

style "body_text" {
    font_size: $body_size
    text_color: $gray_700
}
```

### Component Variables

Create component-specific variable groups:

```kry
@variables {
    # Button variables
    button_padding_sm: 8
    button_padding_md: 12
    button_padding_lg: 16
    button_radius: 6
    button_font_weight: bold
    
    # Card variables
    card_padding: 20
    card_radius: 8
    card_shadow: "#00000010"
    card_border: "#E9ECEFFF"
    
    # Form variables
    input_padding: 8
    input_radius: 4
    input_border: "#CED4DAFF"
    input_focus: "#007BFFFF"
    input_error: "#DC3545FF"
    
    # Navigation variables
    nav_height: 60
    nav_padding: 16
    nav_background: "#343A40FF"
    nav_text: "#FFFFFFFF"
}

# Button styles using variables
style "button_primary" {
    background_color: $brand_primary
    text_color: $white
    padding: $button_padding_md
    border_radius: $button_radius
    font_weight: $button_font_weight
}

style "button_small" {
    padding: $button_padding_sm
    font_size: $text_sm
}

style "button_large" {
    padding: $button_padding_lg
    font_size: $text_lg
}
```

## Theme Systems

### Light and Dark Themes

Create theme-aware variables:

```kry
@variables {
    # Theme toggle
    is_dark_theme: false
    
    # Light theme colors
    light_background: "#FFFFFFFF"
    light_surface: "#F8F9FAFF"
    light_primary: "#007BFFFF"
    light_text: "#212529FF"
    light_text_muted: "#6C757DFF"
    light_border: "#DEE2E6FF"
    
    # Dark theme colors
    dark_background: "#121212FF"
    dark_surface: "#1E1E1EFF"
    dark_primary: "#4FC3F7FF"
    dark_text: "#FFFFFFFF"
    dark_text_muted: "#AAAAAAR"
    dark_border: "#333333FF"
    
    # Current theme (could be changed via script)
    current_background: "#FFFFFFFF"
    current_surface: "#F8F9FAFF"
    current_primary: "#007BFFFF"
    current_text: "#212529FF"
    current_text_muted: "#6C757DFF"
    current_border: "#DEE2E6FF"
}

# Theme switching script
@script "lua" {
    function toggleTheme()
        local isDark = kryon.getVariable("is_dark_theme")
        
        if isDark then
            -- Switch to light theme
            kryon.setVariable("current_background", kryon.getVariable("light_background"))
            kryon.setVariable("current_surface", kryon.getVariable("light_surface"))
            kryon.setVariable("current_primary", kryon.getVariable("light_primary"))
            kryon.setVariable("current_text", kryon.getVariable("light_text"))
            kryon.setVariable("is_dark_theme", false)
        else
            -- Switch to dark theme
            kryon.setVariable("current_background", kryon.getVariable("dark_background"))
            kryon.setVariable("current_surface", kryon.getVariable("dark_surface"))
            kryon.setVariable("current_primary", kryon.getVariable("dark_primary"))
            kryon.setVariable("current_text", kryon.getVariable("dark_text"))
            kryon.setVariable("is_dark_theme", true)
        end
    end
}

# Theme-aware styles
style "themed_container" {
    background_color: $current_background
    text_color: $current_text
}

style "themed_surface" {
    background_color: $current_surface
    border_color: $current_border
}
```

### Brand Customization

Allow easy brand customization through variables:

```kry
@variables {
    # Brand identity
    brand_name: "Acme Corporation"
    brand_tagline: "Excellence in Everything"
    
    # Brand colors
    brand_primary: "#FF6B35FF"
    brand_secondary: "#004E89FF"
    brand_accent: "#FFD23FFF"
    
    # Brand assets
    brand_logo: "assets/acme_logo.png"
    brand_favicon: "assets/acme_favicon.ico"
    brand_background: "assets/brand_bg.jpg"
    
    # Brand typography
    brand_font_heading: "Montserrat"
    brand_font_body: "Open Sans"
    
    # Brand spacing (tighter for professional look)
    brand_spacing_unit: 6
    brand_border_radius: 3
}

App {
    window_title: $brand_name
    icon: $brand_favicon
}

style "brand_header" {
    background_color: $brand_primary
    text_color: $white
    font_family: $brand_font_heading
    padding: $brand_spacing_unit
}

style "brand_button" {
    background_color: $brand_secondary
    text_color: $white
    border_radius: $brand_border_radius
    font_family: $brand_font_body
}
```

## Variable Calculations

### Derived Variables

Create variables based on other variables:

```kry
@variables {
    # Base values
    base_size: 16
    scale_factor: 1.25
    
    # Calculated sizes (conceptual - actual calculation depends on runtime)
    size_sm: 12      # base_size ÷ scale_factor
    size_md: 16      # base_size
    size_lg: 20      # base_size × scale_factor
    size_xl: 25      # base_size × scale_factor²
    
    # Color variations (manual definition)
    primary_base: "#007BFFFF"
    primary_light: "#66B2FFFF"    # Manually lightened
    primary_dark: "#0056B3FF"     # Manually darkened
    
    # Spacing relationships
    content_padding: 24
    content_gap: 12              # Half of padding
    content_margin: 48           # Double padding
}
```

### Responsive Variables

Define variables for different screen sizes:

```kry
@variables {
    # Breakpoint-aware spacing
    mobile_padding: 12
    tablet_padding: 16
    desktop_padding: 24
    
    # Responsive font sizes
    mobile_heading: 20
    tablet_heading: 24
    desktop_heading: 32
    
    # Current responsive values (set by script)
    current_padding: 16
    current_heading: 24
    current_sidebar_width: 250
}

@script "lua" {
    function updateResponsiveVariables(screenWidth)
        if screenWidth < 768 then
            -- Mobile
            kryon.setVariable("current_padding", kryon.getVariable("mobile_padding"))
            kryon.setVariable("current_heading", kryon.getVariable("mobile_heading"))
            kryon.setVariable("current_sidebar_width", 0)  -- Hide sidebar
        elseif screenWidth < 1024 then
            -- Tablet
            kryon.setVariable("current_padding", kryon.getVariable("tablet_padding"))
            kryon.setVariable("current_heading", kryon.getVariable("tablet_heading"))
            kryon.setVariable("current_sidebar_width", 200)
        else
            -- Desktop
            kryon.setVariable("current_padding", kryon.getVariable("desktop_padding"))
            kryon.setVariable("current_heading", kryon.getVariable("desktop_heading"))
            kryon.setVariable("current_sidebar_width", 250)
        end
    end
}
```

## Variable Documentation

### Self-Documenting Variables

Use descriptive names and comments:

```kry
@variables {
    # Application metadata
    app_name: "Task Manager Pro"
    app_version: "2.1.0"
    app_author: "Development Team"
    
    # UI spacing - based on 8px grid system
    grid_unit: 8                    # Base grid unit
    space_tight: 4                 # 0.5 × grid_unit - very tight spacing
    space_cozy: 8                  # 1 × grid_unit - comfortable spacing
    space_relaxed: 16              # 2 × grid_unit - generous spacing
    space_loose: 24                # 3 × grid_unit - very loose spacing
    
    # Color palette - accessibility compliant (WCAG AA)
    color_primary: "#1366D9FF"     # Primary brand blue (4.5:1 contrast)
    color_secondary: "#6C757DFF"   # Neutral gray for secondary elements
    color_success: "#198754FF"     # Success green (4.5:1 contrast)
    color_warning: "#FFC107FF"     # Warning amber
    color_danger: "#DC3545FF"      # Error red (4.5:1 contrast)
    
    # Typography scale - harmonious ratios
    text_caption: 12               # Small captions and labels
    text_body: 16                  # Body text and most content
    text_emphasis: 18              # Emphasized text
    text_heading: 24               # Section headings
    text_title: 32                 # Page titles
    text_display: 48               # Hero/display text
    
    # Interactive element sizing - touch-friendly
    touch_target_min: 44           # Minimum touch target (iOS/Android guidelines)
    button_height_sm: 32           # Small buttons
    button_height_md: 40           # Standard buttons
    button_height_lg: 48           # Large buttons
    
    # Layout dimensions
    sidebar_width_collapsed: 60    # Collapsed sidebar (icon-only)
    sidebar_width_expanded: 280    # Expanded sidebar
    header_height: 64              # Application header
    footer_height: 48              # Application footer
}
```

### Variable Categories

Organize variables into logical groups:

```kry
@variables {
    # === BRAND IDENTITY ===
    brand_name: "MyApp"
    brand_logo: "assets/logo.svg"
    brand_primary: "#007BFFFF"
    brand_secondary: "#6C757DFF"
    
    # === LAYOUT SYSTEM ===
    layout_max_width: 1200
    layout_padding: 20
    layout_gap: 16
    
    # === TYPOGRAPHY SYSTEM ===
    font_family_sans: "Inter"
    font_family_mono: "Fira Code"
    font_size_base: 16
    font_weight_normal: 400
    font_weight_medium: 500
    font_weight_bold: 700
    
    # === COLOR SYSTEM ===
    # Primary palette
    primary_50: "#EFF6FFFF"
    primary_100: "#DBEAFEFF"
    primary_500: "#007BFFFF"
    primary_600: "#0056B3FF"
    primary_900: "#003A75FF"
    
    # Semantic colors
    success: "#10B981FF"
    warning: "#F59E0BFF"
    error: "#EF4444FF"
    info: "#3B82F6FF"
    
    # === SPACING SYSTEM ===
    # Based on 4px grid
    space_0: 0
    space_1: 4
    space_2: 8
    space_3: 12
    space_4: 16
    space_5: 20
    space_6: 24
    space_8: 32
    space_10: 40
    space_12: 48
    space_16: 64
    space_20: 80
    space_24: 96
    
    # === COMPONENT TOKENS ===
    # Buttons
    button_border_radius: 6
    button_font_weight: 500
    button_padding_x: 16
    button_padding_y: 8
    
    # Cards
    card_border_radius: 8
    card_padding: 20
    card_shadow: "#0000001A"
    
    # Forms
    input_border_radius: 4
    input_padding: 8
    input_border_width: 1
    
    # === ANIMATION SYSTEM ===
    transition_fast: "150ms"
    transition_normal: "300ms"
    transition_slow: "500ms"
    
    # === Z-INDEX SYSTEM ===
    z_dropdown: 1000
    z_modal: 2000
    z_tooltip: 3000
    z_notification: 4000
}
```

## Runtime Variable Manipulation

### Script-Based Variable Updates

Variables can be modified at runtime through scripts:

```kry
@variables {
    theme_mode: "light"
    ui_scale: 1.0
    sidebar_collapsed: false
}

@script "lua" {
    function setTheme(mode)
        kryon.setVariable("theme_mode", mode)
        updateThemeColors()
    end
    
    function setUIScale(scale)
        kryon.setVariable("ui_scale", scale)
        updateScaling()
    end
    
    function toggleSidebar()
        local collapsed = kryon.getVariable("sidebar_collapsed")
        kryon.setVariable("sidebar_collapsed", not collapsed)
        updateSidebarLayout()
    end
    
    function updateThemeColors()
        local mode = kryon.getVariable("theme_mode")
        if mode == "dark" then
            kryon.setVariable("current_bg", "#121212FF")
            kryon.setVariable("current_text", "#FFFFFFFF")
        else
            kryon.setVariable("current_bg", "#FFFFFFFF")
            kryon.setVariable("current_text", "#000000FF")
        end
    end
}

# Settings panel
Container {
    Button {
        text: "Toggle Theme"
        onClick: "setTheme"
    }
    
    Button {
        text: "Toggle Sidebar"
        onClick: "toggleSidebar"
    }
}
```

## Best Practices

### 1. Use Semantic Naming

```kry
# Good: Semantic names that describe purpose
@variables {
    primary_action_color: "#007BFFFF"
    danger_action_color: "#DC3545FF"
    content_max_width: 800
    touch_target_size: 44
}

# Avoid: Implementation-specific names
@variables {
    blue_color: "#007BFFFF"         # Tied to color
    big_width: 800                  # Vague description
    button_size: 44                 # Too specific
}
```

### 2. Create Systematic Scales

```kry
# Good: Consistent mathematical scales
@variables {
    # Spacing scale (4px base)
    space_1: 4
    space_2: 8
    space_3: 12
    space_4: 16
    space_5: 20
    space_6: 24
    space_8: 32
    
    # Typography scale (1.25 ratio)
    text_xs: 12
    text_sm: 14
    text_base: 16
    text_lg: 20
    text_xl: 25
    text_2xl: 31
}

# Avoid: Random values
@variables {
    padding_1: 7
    padding_2: 13
    padding_3: 19
    padding_4: 27
}
```

### 3. Group Related Variables

```kry
# Good: Logical grouping
@variables {
    # Button system
    button_radius: 6
    button_padding: 12
    button_font_weight: 500
    button_min_width: 80
    
    # Card system
    card_radius: 8
    card_padding: 20
    card_shadow: "#00000010"
    card_border: "#E5E7EBFF"
}

# Avoid: Random organization
@variables {
    button_radius: 6
    card_padding: 20
    button_padding: 12
    card_radius: 8
    button_font_weight: 500
}
```

### 4. Document Variable Purpose

```kry
@variables {
    # Touch targets - iOS/Android accessibility guidelines
    touch_min: 44                   # Minimum touch target size
    
    # Grid system - 8px base for consistent spacing
    grid_unit: 8                    # Base unit for all spacing
    
    # Brand colors - approved by design team
    brand_primary: "#1366D9FF"      # Primary brand blue
    brand_secondary: "#6366F1FF"    # Secondary brand indigo
    
    # Accessibility - WCAG AA compliant contrast ratios
    text_primary: "#111827FF"       # 16.94:1 contrast on white
    text_secondary: "#6B7280FF"     # 4.69:1 contrast on white
}
```

### 5. Plan for Maintainability

```kry
# Version variables for easier updates
@variables {
    # Design system version
    design_version: "2.1.0"
    
    # Feature flags for gradual rollouts
    new_button_style: true
    experimental_layout: false
    
    # Environment-specific values
    debug_border_width: 1           # Show layout boundaries in debug
    production_analytics: true      # Enable analytics in production
}

# Use feature flags
style "button_modern" {
    # Only apply if feature flag is enabled
    border_radius: 8
    padding: 12
}

style "button_legacy" {
    # Fallback style
    border_radius: 4
    padding: 10
}
```

## Template Variables (Reactive)

Template variables provide Vue-like reactive data binding, allowing variables to be embedded directly in templates with automatic UI updates when values change.

### Template Variable Syntax

Template variables use double curly braces `{{variable_name}}` and automatically update the UI when changed via scripts:

```kry
@variables {
    counter_value: 0
    user_name: "Guest"
    status_message: "Ready"
}

App {
    Text {
        text: "Count: {{counter_value}}"  # Reactive template variable
    }
    
    Text {
        text: "Hello, {{user_name}}!"    # Multi-variable support
    }
    
    Text {
        text: "Status: {{status_message}}"
    }
}

@function "lua" update_counter() {
    local current = getTemplateVariable("counter_value")
    local value = tonumber(current) or 0
    setTemplateVariable("counter_value", tostring(value + 1))
    # UI automatically updates! No manual DOM manipulation needed
}
```

### Template Variable API

Scripts can interact with template variables using these functions:

#### Setting Template Variables
```lua
-- Update a template variable (triggers UI update)
setTemplateVariable("counter_value", "42")
setTemplateVariable("user_name", "John Doe")
setTemplateVariable("status_message", "Processing...")
```

#### Getting Template Variables
```lua
-- Get current template variable value
local count = getTemplateVariable("counter_value")
local name = getTemplateVariable("user_name")

-- Get all template variables as a table
local all_vars = getTemplateVariables()
for name, value in pairs(all_vars) do
    print(name .. " = " .. value)
end
```

### Reactive Counter Example

Here's a complete example showing reactive template variables in action:

```kry
App {
    window_title: "Reactive Counter"
    
    Container {
        style: "counter_container"
        
        # Display uses template variable - updates automatically
        Text {
            text: "Count: {{counter_value}}"
            style: "counter_display"
        }
        
        Container {
            style: "button_row"
            
            Button {
                text: "-"
                onClick: "decrement"
                style: "counter_button"
            }
            
            Button {
                text: "+"
                onClick: "increment"
                style: "counter_button"
            }
            
            Button {
                text: "Reset"
                onClick: "reset"
                style: "reset_button"
            }
        }
    }
}

@variables {
    counter_value: 0  # Template variable with default value
}

# Reactive functions - no manual DOM manipulation needed
@function "lua" increment() {
    local current = getTemplateVariable("counter_value")
    local value = tonumber(current) or 0
    setTemplateVariable("counter_value", tostring(value + 1))
}

@function "lua" decrement() {
    local current = getTemplateVariable("counter_value")
    local value = tonumber(current) or 0
    setTemplateVariable("counter_value", tostring(value - 1))
}

@function "lua" reset() {
    setTemplateVariable("counter_value", "0")
}
```

### Template vs Traditional Variables

| Feature | Traditional Variables (`$var`) | Template Variables (`{{var}}`) |
|---------|-------------------------------|-------------------------------|
| **Definition** | `@variables { color: "#FF0000" }` | `@variables { counter: 0 }` |
| **Usage** | `background_color: $color` | `text: "Count: {{counter}}"` |
| **Compilation** | Resolved at compile time | Embedded as reactive bindings |
| **Runtime Updates** | Static, cannot change | Dynamic, script-updateable |
| **UI Updates** | Manual DOM manipulation | Automatic UI updates |
| **Use Cases** | Styling, configuration | Dynamic content, data binding |

### Advanced Template Features

#### Multi-Variable Templates
```kry
@variables {
    first_name: "John"
    last_name: "Doe"
    score: 0
    level: 1
}

App {
    Text {
        text: "Player: {{first_name}} {{last_name}}"
    }
    
    Text {
        text: "Level {{level}} - Score: {{score}}"
    }
}

@function "lua" update_player_info() {
    setTemplateVariable("first_name", "Jane")
    setTemplateVariable("last_name", "Smith")
    setTemplateVariable("score", "1500")
    setTemplateVariable("level", "3")
    # All UI elements update automatically
}
```

#### Template Variable Types
```kry
@variables {
    # String template variables
    message: "Welcome"
    user_status: "online"
    
    # Numeric template variables (stored as strings)
    count: "0"
    percentage: "75"
    
    # Boolean-like template variables
    is_enabled: "true"
    show_details: "false"
}

App {
    Text { text: "{{message}}" }
    Text { text: "Count: {{count}}" }
    Text { text: "Progress: {{percentage}}%" }
    Text { text: "Enabled: {{is_enabled}}" }
}
```

#### Dynamic Content Updates
```kry
@variables {
    current_time: "00:00:00"
    connection_status: "Disconnected"
    notification_count: "0"
}

App {
    Container {
        Text { text: "Time: {{current_time}}" }
        Text { text: "Status: {{connection_status}}" }
        Text { text: "Notifications: {{notification_count}}" }
    }
}

@function "lua" update_status() {
    -- Update time
    local time = os.date("%H:%M:%S")
    setTemplateVariable("current_time", time)
    
    -- Update connection status
    setTemplateVariable("connection_status", "Connected")
    
    -- Update notification count
    local count = getTemplateVariable("notification_count")
    setTemplateVariable("notification_count", tostring(tonumber(count) + 1))
}
```

### Template Variable Performance

Template variables are optimized for performance:
- **Efficient Updates**: Only affected elements are re-rendered
- **Minimal Overhead**: Template bindings are resolved at compile time
- **Batched Updates**: Multiple variable changes in one script call are batched
- **Memory Efficient**: Template expressions are stored once and reused

### Migration from Manual DOM Updates

**Before** (Manual DOM manipulation):
```kry
@function "lua" update_counter() {
    counter_value = counter_value + 1
    local display = getElementById("counter_display")
    if display then
        display:setText(tostring(counter_value))
    end
}
```

**After** (Template variables):
```kry
@function "lua" update_counter() {
    local current = getTemplateVariable("counter_value")
    setTemplateVariable("counter_value", tostring(tonumber(current) + 1))
    # UI updates automatically!
}
```

### Best Practices for Template Variables

#### 1. Use Template Variables for Dynamic Content
```kry
# Good: Dynamic content that changes at runtime
@variables {
    user_score: "0"
    game_status: "Ready"
    player_name: "Player 1"
}

Text { text: "{{player_name}}: {{user_score}} points" }
Text { text: "Status: {{game_status}}" }
```

#### 2. Combine with Traditional Variables
```kry
# Use traditional variables for static styling
@variables {
    primary_color: "#007BFFFF"     # Traditional - styling
    button_padding: 12             # Traditional - styling
    
    current_page: "Home"           # Template - dynamic content
    notification_count: "0"        # Template - dynamic content
}

Button {
    background_color: $primary_color    # Static styling
    padding: $button_padding           # Static styling
    text: "{{current_page}}"           # Dynamic content
}
```

#### 3. Initialize with Meaningful Defaults
```kry
@variables {
    # Good: Descriptive defaults
    user_name: "Guest User"
    loading_message: "Loading..."
    error_message: "No errors"
    
    # Avoid: Empty or unclear defaults
    data: ""
    value: ""
    text: ""
}
```

#### 4. Use Type-Safe String Values
```kry
@variables {
    # Good: Always store as strings
    counter: "0"
    percentage: "100"
    is_visible: "true"
    
    # Avoid: Mixed types (implementation detail)
    counter: 0          # Will be converted to string
    percentage: 100     # Will be converted to string
}

@function "lua" update_values() {
    # Always handle as strings
    local count = tonumber(getTemplateVariable("counter")) or 0
    setTemplateVariable("counter", tostring(count + 1))
}
```

---

Variables are fundamental to creating maintainable, scalable design systems in Kryon. Traditional variables provide compile-time constants for styling and configuration, while template variables enable reactive, Vue-like data binding for dynamic content. By combining both approaches, you can build flexible interfaces that adapt to evolving requirements. Next, explore [Components](components.md) to learn about creating reusable UI components that leverage your variable system.
