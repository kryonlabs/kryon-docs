# Components

Components in KRY allow you to create reusable, parameterized UI elements that encapsulate both structure and behavior. They enable modular design, code reuse, and consistent interfaces across your application.

## Basic Component Definition

Components are defined using the `Define` keyword followed by a template structure:

```kry
Define SimpleButton {
    Button {
        text: "Default Button"
        background_color: "#007BFFFF"
        text_color: "#FFFFFFFF"
        padding: 12
        border_radius: 6
    }
}

# Usage
Container {
    SimpleButton { }
    SimpleButton { }
}
```

## Component Properties

### Property Declaration

Components can accept properties using the `Properties` block:

```kry
Define CustomButton {
    Properties {
        button_text: String = "Click Me"
        is_primary: Bool = true
        button_size: Enum(small, medium, large) = medium
        click_handler: String = "defaultHandler"
    }
    
    Button {
        text: $button_text
        background_color: $is_primary ? "#007BFFFF" : "#6C757DFF"
        padding: $button_size == small ? 8 : ($button_size == large ? 16 : 12)
        onClick: $click_handler
    }
}

# Usage with custom properties
Container {
    CustomButton {
        button_text: "Save"
        is_primary: true
        button_size: large
        click_handler: "handleSave"
    }
    
    CustomButton {
        button_text: "Cancel"
        is_primary: false
        button_size: medium
        click_handler: "handleCancel"
    }
}
```

### Property Types

Components support various property types:

```kry
Define FlexibleCard {
    Properties {
        # Basic types
        title: String = "Default Title"
        subtitle: String = ""
        is_visible: Bool = true
        width: Number = 300
        
        # Color properties
        background: Color = "#FFFFFFFF"
        border_color: Color = "#E5E7EBFF"
        
        # Enum properties
        card_size: Enum(small, medium, large) = medium
        alignment: Enum(start, center, end) = start
        
        # Style references
        custom_style: StyleID = "default_card"
        
        # Event handlers
        on_click: String = ""
        on_hover: String = ""
        
        # Optional properties (runtime-dependent)
        icon_source?: String
        badge_count?: Number
    }
    
    Container {
        style: $custom_style
        width: $width
        background_color: $background
        border_color: $border_color
        visibility: $is_visible
        text_alignment: $alignment
        onClick: $on_click
        onHover: $on_hover
        
        # Conditional content
        @if $icon_source {
            Image {
                source: $icon_source
                width: 24
                height: 24
            }
        }
        
        Text {
            text: $title
            font_size: $card_size == small ? 14 : ($card_size == large ? 20 : 16)
            font_weight: bold
        }
        
        @if $subtitle != "" {
            Text {
                text: $subtitle
                font_size: 12
                text_color: "#6B7280FF"
            }
        }
        
        @if $badge_count {
            Container {
                Text {
                    text: $badge_count
                    background_color: "#EF4444FF"
                    text_color: "#FFFFFFFF"
                    padding: 4
                    border_radius: 10
                }
            }
        }
    }
}
```

## Advanced Component Patterns

### Composition Components

Create components that compose other components:

```kry
Define IconButton {
    Properties {
        icon: String
        button_text: String = ""
        variant: Enum(primary, secondary, ghost) = primary
        size: Enum(small, medium, large) = medium
        on_click: String = ""
    }
    
    Button {
        layout: row center
        gap: 8
        onClick: $on_click
        
        Image {
            source: $icon
            width: $size == small ? 16 : ($size == large ? 24 : 20)
            height: $size == small ? 16 : ($size == large ? 24 : 20)
        }
        
        @if $button_text != "" {
            Text {
                text: $button_text
                font_size: $size == small ? 12 : ($size == large ? 16 : 14)
            }
        }
        
        # Apply variant styling
        @if $variant == primary {
            background_color: "#007BFFFF"
            text_color: "#FFFFFFFF"
        } @elif $variant == secondary {
            background_color: "transparent"
            text_color: "#007BFFFF"
            border_color: "#007BFFFF"
            border_width: 1
        } @else {
            background_color: "transparent"
            text_color: "#6B7280FF"
        }
    }
}

Define Toolbar {
    Properties {
        actions: Array<Object> = []
    }
    
    Container {
        layout: row center
        gap: 8
        padding: 12
        background_color: "#F9FAFBFF"
        border_color: "#E5E7EBFF"
        border_width: 1
        
        @foreach action in $actions {
            IconButton {
                icon: $action.icon
                button_text: $action.text
                variant: $action.variant ?? secondary
                on_click: $action.handler
            }
        }
    }
}

# Usage
Toolbar {
    actions: [
        { icon: "assets/save.svg", text: "Save", variant: primary, handler: "handleSave" },
        { icon: "assets/copy.svg", text: "Copy", handler: "handleCopy" },
        { icon: "assets/delete.svg", text: "Delete", variant: ghost, handler: "handleDelete" }
    ]
}
```

### Container Components

Create layout components that accept child content:

```kry
Define Card {
    Properties {
        card_title: String = ""
        padding: Number = 20
        elevated: Bool = false
        max_width: Number = 400
    }
    
    Children {
        # Declare that this component accepts child elements
    }
    
    Container {
        max_width: $max_width
        padding: $padding
        background_color: "#FFFFFFFF"
        border_radius: 8
        border_color: "#E5E7EBFF"
        border_width: 1
        
        @if $elevated {
            shadow_color: "#0000001A"
            shadow_offset_y: 2
            shadow_blur: 8
        }
        
        @if $card_title != "" {
            Text {
                text: $card_title
                font_size: 18
                font_weight: bold
                margin_bottom: 12
            }
        }
        
        # Child content goes here
        @children
    }
}

# Usage with child content
Card {
    card_title: "User Profile"
    elevated: true
    
    # These elements become children of the Card
    Image {
        source: "assets/avatar.jpg"
        width: 60
        height: 60
        border_radius: 30
    }
    
    Text {
        text: "John Doe"
        font_weight: bold
    }
    
    Text {
        text: "Software Developer"
        text_color: "#6B7280FF"
    }
    
    Button {
        text: "View Profile"
        style: "button_primary"
    }
}
```

### State Management Components

Components can manage internal state and behavior:

```kry
Define ToggleSwitch {
    Properties {
        initial_state: Bool = false
        on_toggle: String = ""
        disabled: Bool = false
        label: String = ""
    }
    
    State {
        # Internal component state
        is_active: Bool = $initial_state
    }
    
    Container {
        layout: row center
        gap: 8
        opacity: $disabled ? 0.6 : 1.0
        
        @if $label != "" {
            Text {
                text: $label
                font_size: 14
            }
        }
        
        Button {
            width: 44
            height: 24
            border_radius: 12
            background_color: $is_active ? "#10B981FF" : "#E5E7EBFF"
            border_width: 0
            disabled: $disabled
            
            # Toggle indicator
            Container {
                width: 20
                height: 20
                border_radius: 10
                background_color: "#FFFFFFFF"
                pos_x: $is_active ? 20 : 2
                pos_y: 2
                
                # Transition animation (runtime-dependent)
                transition: "all 0.2s ease"
            }
            
            onClick: {
                if (!$disabled) {
                    $is_active = !$is_active
                    if ($on_toggle != "") {
                        callHandler($on_toggle, $is_active)
                    }
                }
            }
        }
    }
}

# Usage
ToggleSwitch {
    label: "Enable Notifications"
    initial_state: true
    on_toggle: "handleNotificationToggle"
}
```

## Component Libraries

### Creating a Button Library

```kry
# buttons.kry - Button component library
@variables {
    button_radius: 6
    button_font_weight: 500
    transition_speed: "200ms"
}

Define BaseButton {
    Properties {
        text: String = "Button"
        variant: Enum(primary, secondary, ghost, danger) = primary
        size: Enum(xs, sm, md, lg, xl) = md
        disabled: Bool = false
        loading: Bool = false
        full_width: Bool = false
        on_click: String = ""
    }
    
    Button {
        text: $loading ? "Loading..." : $text
        disabled: $disabled || $loading
        width: $full_width ? "100%" : "auto"
        border_radius: $button_radius
        font_weight: $button_font_weight
        onClick: $on_click
        
        # Size-based properties
        padding: $size == xs ? 4 : ($size == sm ? 8 : ($size == md ? 12 : ($size == lg ? 16 : 20)))
        font_size: $size == xs ? 12 : ($size == sm ? 14 : ($size == md ? 16 : ($size == lg ? 18 : 20)))
        min_width: $size == xs ? 60 : ($size == sm ? 80 : ($size == md ? 100 : ($size == lg ? 120 : 140)))
        
        # Variant-based styling
        @if $variant == primary {
            background_color: "#007BFFFF"
            text_color: "#FFFFFFFF"
            
            &:hover {
                background_color: "#0056B3FF"
            }
            
            &:active {
                background_color: "#004085FF"
            }
        } @elif $variant == secondary {
            background_color: "transparent"
            text_color: "#007BFFFF"
            border_color: "#007BFFFF"
            border_width: 1
            
            &:hover {
                background_color: "#007BFF1A"
            }
        } @elif $variant == ghost {
            background_color: "transparent"
            text_color: "#6B7280FF"
            
            &:hover {
                background_color: "#F3F4F6FF"
                text_color: "#374151FF"
            }
        } @elif $variant == danger {
            background_color: "#EF4444FF"
            text_color: "#FFFFFFFF"
            
            &:hover {
                background_color: "#DC2626FF"
            }
            
            &:active {
                background_color: "#B91C1CFF"
            }
        }
        
        &:disabled {
            background_color: "#E5E7EBFF"
            text_color: "#9CA3AFFF"
            cursor: "not_allowed"
        }
    }
}

# Convenience components
Define PrimaryButton {
    Properties {
        text: String = "Primary"
        size: Enum(xs, sm, md, lg, xl) = md
        disabled: Bool = false
        full_width: Bool = false
        on_click: String = ""
    }
    
    BaseButton {
        text: $text
        variant: primary
        size: $size
        disabled: $disabled
        full_width: $full_width
        on_click: $on_click
    }
}

Define DangerButton {
    Properties {
        text: String = "Delete"
        size: Enum(xs, sm, md, lg, xl) = md
        disabled: Bool = false
        on_click: String = ""
    }
    
    BaseButton {
        text: $text
        variant: danger
        size: $size
        disabled: $disabled
        on_click: $on_click
    }
}
```

### Form Component Library

```kry
# forms.kry - Form component library
Define FormField {
    Properties {
        label: String
        required: Bool = false
        error_message: String = ""
        help_text: String = ""
    }
    
    Children { }
    
    Container {
        layout: column
        gap: 4
        margin_bottom: 16
        
        # Label
        Container {
            layout: row center
            gap: 4
            
            Text {
                text: $label
                font_weight: 500
                font_size: 14
                text_color: "#374151FF"
            }
            
            @if $required {
                Text {
                    text: "*"
                    text_color: "#EF4444FF"
                    font_weight: bold
                }
            }
        }
        
        # Input field (from children)
        @children
        
        # Help text or error message
        @if $error_message != "" {
            Text {
                text: $error_message
                font_size: 12
                text_color: "#EF4444FF"
            }
        } @elif $help_text != "" {
            Text {
                text: $help_text
                font_size: 12
                text_color: "#6B7280FF"
            }
        }
    }
}

Define TextInput {
    Properties {
        value: String = ""
        placeholder: String = ""
        disabled: Bool = false
        error: Bool = false
        on_change: String = ""
        on_focus: String = ""
        on_blur: String = ""
    }
    
    Input {
        value: $value
        placeholder: $placeholder
        disabled: $disabled
        padding: 8
        border_radius: 4
        border_width: 1
        border_color: $error ? "#EF4444FF" : "#D1D5DBFF"
        font_size: 14
        onChange: $on_change
        onFocus: $on_focus
        onBlur: $on_blur
        
        &:focus {
            border_color: $error ? "#EF4444FF" : "#007BFFFF"
            border_width: 2
        }
        
        &:disabled {
            background_color: "#F9FAFBFF"
            text_color: "#9CA3AFFF"
        }
    }
}

Define FormGroup {
    Properties {
        title: String = ""
    }
    
    Children { }
    
    Container {
        layout: column
        gap: 16
        padding: 20
        background_color: "#FFFFFFFF"
        border_radius: 8
        border_color: "#E5E7EBFF"
        border_width: 1
        margin_bottom: 20
        
        @if $title != "" {
            Text {
                text: $title
                font_size: 18
                font_weight: bold
                text_color: "#111827FF"
                margin_bottom: 8
            }
        }
        
        @children
    }
}

# Usage
FormGroup {
    title: "User Information"
    
    FormField {
        label: "Full Name"
        required: true
        
        TextInput {
            placeholder: "Enter your full name"
            on_change: "handleNameChange"
        }
    }
    
    FormField {
        label: "Email Address"
        required: true
        help_text: "We'll never share your email"
        
        TextInput {
            placeholder: "you@example.com"
            on_change: "handleEmailChange"
        }
    }
}
```

## Component Integration

### Using Components with Styles

Components can reference and use style definitions:

```kry
style "card_elevated" {
    background_color: "#FFFFFFFF"
    border_radius: 8
    shadow_color: "#0000001A"
    shadow_offset_y: 2
    shadow_blur: 8
    padding: 20
}

style "card_flat" {
    background_color: "#FFFFFFFF"
    border_radius: 8
    border_color: "#E5E7EBFF"
    border_width: 1
    padding: 20
}

Define StyledCard {
    Properties {
        title: String = ""
        elevated: Bool = false
        custom_style: StyleID = ""
    }
    
    Children { }
    
    Container {
        # Use conditional style selection
        style: $custom_style != "" ? $custom_style : ($elevated ? "card_elevated" : "card_flat")
        
        @if $title != "" {
            Text {
                text: $title
                font_size: 18
                font_weight: bold
                margin_bottom: 12
            }
        }
        
        @children
    }
}

# Usage
StyledCard {
    title: "Settings"
    elevated: true
    
    Text { text: "Configure your preferences" }
}

StyledCard {
    title: "Custom Styling"
    custom_style: "my_special_card"
    
    Text { text: "Uses custom style" }
}
```

### Component Events and Scripts

Components can integrate with application scripts:

```kry
@script "lua" {
    local userPreferences = {
        theme = "light",
        notifications = true,
        language = "en"
    }
    
    function updatePreference(key, value)
        userPreferences[key] = value
        savePreferences()
    end
    
    function getPreference(key)
        return userPreferences[key]
    end
    
    function handleThemeChange(newTheme)
        updatePreference("theme", newTheme)
        applyTheme(newTheme)
    end
    
    function handleNotificationToggle(enabled)
        updatePreference("notifications", enabled)
        updateNotificationSettings(enabled)
    end
}

Define PreferenceToggle {
    Properties {
        label: String
        preference_key: String
        on_change: String = ""
    }
    
    Container {
        layout: row center
        gap: 12
        padding: 12
        
        Text {
            text: $label
            font_size: 14
        }
        
        ToggleSwitch {
            initial_state: getPreference($preference_key)
            on_toggle: $on_change
        }
    }
}

# Usage
Container {
    PreferenceToggle {
        label: "Dark Mode"
        preference_key: "theme"
        on_change: "handleThemeChange"
    }
    
    PreferenceToggle {
        label: "Enable Notifications"
        preference_key: "notifications"
        on_change: "handleNotificationToggle"
    }
}
```

## Best Practices

### 1. Design for Reusability

```kry
# Good: Flexible, reusable component
Define ActionCard {
    Properties {
        title: String
        description: String = ""
        action_text: String = "Action"
        action_handler: String = ""
        variant: Enum(default, success, warning, danger) = default
        show_icon: Bool = true
    }
    
    # Flexible structure that works in many contexts
}

# Avoid: Overly specific component
Define SaveUserProfileCardWithBlueButton {
    # Too specific - hard to reuse
}
```

### 2. Provide Sensible Defaults

```kry
Define NotificationCard {
    Properties {
        message: String = "Notification"
        type: Enum(info, success, warning, error) = info
        dismissible: Bool = true
        auto_dismiss: Bool = false
        dismiss_delay: Number = 5000
        on_dismiss: String = ""
    }
    
    # All properties have reasonable defaults
    # Component works with minimal configuration
}
```

### 3. Use Clear Property Names

```kry
# Good: Clear, descriptive property names
Define DataTable {
    Properties {
        column_headers: Array<String> = []
        row_data: Array<Object> = []
        sortable: Bool = true
        show_pagination: Bool = false
        rows_per_page: Number = 10
        on_row_click: String = ""
        on_sort_change: String = ""
    }
}

# Avoid: Unclear or abbreviated names
Define DataTable {
    Properties {
        cols: Array<String> = []      # Unclear abbreviation
        data: Array<Object> = []      # Too generic
        sort: Bool = true             # Unclear what this controls
        pp: Number = 10               # Meaningless abbreviation
    }
}
```

### 4. Document Component Purpose

```kry
# Document component behavior and usage
Define ResponsiveGrid {
    # A responsive grid container that automatically adjusts column count
    # based on available space and minimum item width
    # 
    # Usage:
    #   ResponsiveGrid { min_item_width: 200; gap: 16 }
    #     GridItem { /* content */ }
    #     GridItem { /* content */ }
    #   }
    
    Properties {
        min_item_width: Number = 250    # Minimum width for each grid item
        gap: Number = 16                # Space between grid items
        max_columns: Number = 4         # Maximum number of columns
    }
    
    Children { }
    
    # Implementation...
}
```

### 5. Plan Component Hierarchies

```kry
# Base components
Define BaseCard { /* basic card structure */ }
Define BaseButton { /* basic button structure */ }

# Specialized components
Define ActionCard {
    extends: BaseCard
    # Adds action-specific features
}

Define ProductCard {
    extends: BaseCard
    # Adds product-specific features
}

# Convenience components
Define PrimaryActionCard {
    extends: ActionCard
    # Pre-configured for primary actions
}
```

### 6. Test Component Variations

```kry
# Test all property combinations
Container {
    # Test different sizes
    MyButton { size: small; text: "Small" }
    MyButton { size: medium; text: "Medium" }
    MyButton { size: large; text: "Large" }
    
    # Test different variants
    MyButton { variant: primary; text: "Primary" }
    MyButton { variant: secondary; text: "Secondary" }
    MyButton { variant: danger; text: "Danger" }
    
    # Test states
    MyButton { disabled: true; text: "Disabled" }
    MyButton { loading: true; text: "Loading" }
    
    # Test edge cases
    MyButton { text: ""; }           # Empty text
    MyButton { text: "Very Long Button Text That Might Wrap" }
}
```

---

Components are the key to building scalable, maintainable user interfaces in Kryon. By creating well-designed, reusable components with clear APIs and sensible defaults, you can accelerate development and ensure consistency across your application. Next, explore [Scripts](scripts.md) to learn about adding dynamic behavior and interactivity to your components.
