# Implementation & Renderer Guide

This guide provides comprehensive instructions for implementing KRB parsers and renderers, covering everything from basic parsing to complete runtime systems. It's designed to help developers build new backends or integrate Kryon into existing frameworks.

## Overview

### Implementation Stack

```
┌─────────────────────────────────────┐
│         Application Layer           │ ← Your Application
├─────────────────────────────────────┤
│         Runtime System             │ ← Events, Scripts, DOM API
├─────────────────────────────────────┤
│         Rendering Backend           │ ← Platform-specific rendering
├─────────────────────────────────────┤
│         Layout Engine               │ ← Flex/Grid/Absolute positioning
├─────────────────────────────────────┤
│         Core Types & Parser         │ ← KRB parsing and element management
└─────────────────────────────────────┘
```

### Key Repositories

- **Reference implementation**: `kryon-renderer` workspace
- **Examples**: `kryon-renderer/examples/` directory
- **Test files**: Use snapshot testing with `kryon-ratatui` backend

## Phase 1: Basic KRB Parser

### 1.1 Core Data Structures

```rust
// Core element representation
#[derive(Debug, Clone)]
pub struct Element {
    pub id: String,
    pub element_type: ElementType,
    pub position: Vec2,
    pub size: Vec2,
    pub layout_flags: u8,
    pub style_id: u8,
    pub checked: bool,
    pub properties: HashMap<u8, PropertyValue>,
    pub custom_properties: HashMap<String, PropertyValue>,
    pub children: Vec<u32>,
    pub parent: Option<u32>,
}

// Property values with type safety
#[derive(Debug, Clone)]
pub enum PropertyValue {
    None,
    Byte(u8),
    Short(u16),
    Color(Vec4),
    String(String),
    Float(f32),
    Int(i32),
    Bool(bool),
    CSSUnit(f64, UnitType),
    Transform(Transform),
    // ... other types
}

// CSS-like unit support
#[derive(Debug, Clone)]
pub enum UnitType {
    Px, Em, Rem, Vw, Vh, Percent,
    Deg, Rad, Turn, Number,
}
```

### 1.2 KRB Parser Implementation

```rust
pub struct KRBParser {
    data: Vec<u8>,
    position: usize,
}

impl KRBParser {
    pub fn new(data: Vec<u8>) -> Result<Self> {
        Ok(Self { data, position: 0 })
    }
    
    pub fn parse(&mut self) -> Result<KRBFile> {
        // Parse header
        let header = self.parse_header()?;
        self.validate_header(&header)?;
        
        // Parse sections
        let strings = self.parse_string_table(&header)?;
        let elements = self.parse_element_tree(&header, &strings)?;
        let styles = self.parse_style_table(&header, &strings)?;
        let components = self.parse_component_table(&header, &strings)?;
        let scripts = self.parse_script_table(&header, &strings)?;
        let template_variables = self.parse_template_variables(&header, &strings)?;
        let template_bindings = self.parse_template_bindings(&header, &strings)?;
        let transforms = self.parse_transforms(&header)?;
        
        Ok(KRBFile {
            header,
            strings,
            elements,
            styles,
            components,
            scripts,
            template_variables,
            template_bindings,
            transforms,
        })
    }
    
    // Binary reading utilities
    fn read_u8(&mut self) -> u8 {
        let value = self.data[self.position];
        self.position += 1;
        value
    }
    
    fn read_u16(&mut self) -> u16 {
        let bytes = [self.data[self.position], self.data[self.position + 1]];
        self.position += 2;
        u16::from_le_bytes(bytes)
    }
    
    fn read_u32(&mut self) -> u32 {
        let bytes = [
            self.data[self.position],
            self.data[self.position + 1],
            self.data[self.position + 2],
            self.data[self.position + 3],
        ];
        self.position += 4;
        u32::from_le_bytes(bytes)
    }
    
    fn read_color(&mut self) -> Vec4 {
        let r = self.read_u8() as f32 / 255.0;
        let g = self.read_u8() as f32 / 255.0;
        let b = self.read_u8() as f32 / 255.0;
        let a = self.read_u8() as f32 / 255.0;
        Vec4::new(r, g, b, a)
    }
    
    fn read_css_unit(&mut self) -> CSSUnit {
        let value = f64::from_le_bytes([
            self.data[self.position],
            self.data[self.position + 1],
            self.data[self.position + 2],
            self.data[self.position + 3],
            self.data[self.position + 4],
            self.data[self.position + 5],
            self.data[self.position + 6],
            self.data[self.position + 7],
        ]);
        self.position += 8;
        
        let unit_type = match self.read_u8() {
            0x01 => UnitType::Px,
            0x02 => UnitType::Em,
            0x03 => UnitType::Rem,
            0x04 => UnitType::Vw,
            0x05 => UnitType::Vh,
            0x06 => UnitType::Percent,
            0x07 => UnitType::Deg,
            0x08 => UnitType::Rad,
            0x09 => UnitType::Turn,
            0x0A => UnitType::Number,
            _ => UnitType::Px,
        };
        
        CSSUnit { value, unit: unit_type }
    }
}
```

### 1.3 Element Tree Construction

```rust
impl KRBParser {
    fn parse_element_tree(&mut self, header: &KRBHeader, strings: &[String]) -> Result<HashMap<u32, Element>> {
        self.position = header.element_offset as usize;
        let mut elements = HashMap::new();
        
        for element_id in 0..header.element_count {
            let element = self.parse_element(element_id as u32, strings)?;
            elements.insert(element_id as u32, element);
        }
        
        // Build parent-child relationships
        self.build_element_hierarchy(&mut elements)?;
        
        Ok(elements)
    }
    
    fn parse_element(&mut self, element_id: u32, strings: &[String]) -> Result<Element> {
        // Parse 19-byte element header
        let element_type = ElementType::from(self.read_u8());
        let id_index = self.read_u8();
        let pos_x = self.read_u16() as f32;
        let pos_y = self.read_u16() as f32;
        let width = self.read_u16() as f32;
        let height = self.read_u16() as f32;
        let layout_flags = self.read_u8();
        let style_id = self.read_u8();
        let checked = self.read_u8() != 0;
        let property_count = self.read_u8();
        let child_count = self.read_u8();
        let event_count = self.read_u8();
        let animation_count = self.read_u8();
        let custom_prop_count = self.read_u8();
        let state_prop_count = self.read_u8();
        
        let mut element = Element {
            id: if id_index > 0 && id_index as usize <= strings.len() {
                strings[id_index as usize - 1].clone()
            } else {
                format!("element_{}", element_id)
            },
            element_type,
            position: Vec2::new(pos_x, pos_y),
            size: Vec2::new(width, height),
            layout_flags,
            style_id,
            checked,
            properties: HashMap::new(),
            custom_properties: HashMap::new(),
            children: Vec::new(),
            parent: None,
        };
        
        // Parse standard properties
        for _ in 0..property_count {
            self.parse_standard_property(&mut element, strings)?;
        }
        
        // Parse custom properties
        for _ in 0..custom_prop_count {
            self.parse_custom_property(&mut element, strings)?;
        }
        
        // Parse state properties (hover, active, etc.)
        for _ in 0..state_prop_count {
            self.parse_state_property_set(&mut element, strings)?;
        }
        
        // Parse child relationships
        for _ in 0..child_count {
            let child_id = self.read_u16() as u32;
            element.children.push(child_id);
        }
        
        // Skip events and animations for now
        self.position += (event_count * 2) as usize; // Each event: 2 bytes
        self.position += (animation_count * 4) as usize; // Each animation: 4 bytes
        
        Ok(element)
    }
    
    fn parse_standard_property(&mut self, element: &mut Element, strings: &[String]) -> Result<()> {
        let property_id = self.read_u8();
        let value_type = self.read_u8();
        let size = self.read_u8();
        
        let value = match value_type {
            0x00 => PropertyValue::None,
            0x01 => PropertyValue::Byte(self.read_u8()),
            0x02 => PropertyValue::Short(self.read_u16()),
            0x03 => PropertyValue::Color(self.read_color()),
            0x04 => {
                let string_index = self.read_u8() as usize;
                if string_index > 0 && string_index <= strings.len() {
                    PropertyValue::String(strings[string_index - 1].clone())
                } else {
                    PropertyValue::String(String::new())
                }
            },
            0x0D => PropertyValue::Float(f32::from_le_bytes([
                self.read_u8(), self.read_u8(), self.read_u8(), self.read_u8()
            ])),
            0x0E => PropertyValue::Int(i32::from_le_bytes([
                self.read_u8(), self.read_u8(), self.read_u8(), self.read_u8()
            ])),
            0x0F => PropertyValue::Bool(self.read_u8() != 0),
            0x19 => PropertyValue::CSSUnit(self.read_css_unit()),
            _ => {
                // Skip unknown value types
                for _ in 0..size {
                    self.read_u8();
                }
                PropertyValue::None
            }
        };
        
        element.properties.insert(property_id, value);
        Ok(())
    }
}
```

## Phase 2: Layout Engine

### 2.1 Layout System Architecture

```rust
pub struct LayoutEngine {
    viewport_size: Vec2,
    scale_factor: f32,
}

impl LayoutEngine {
    pub fn new(viewport_size: Vec2, scale_factor: f32) -> Self {
        Self { viewport_size, scale_factor }
    }
    
    pub fn layout_tree(&mut self, elements: &mut HashMap<u32, Element>, root_id: u32) -> Result<()> {
        // First pass: resolve units to pixels
        self.resolve_units(elements)?;
        
        // Second pass: layout elements
        self.layout_element(elements, root_id, Vec2::ZERO, self.viewport_size)?;
        
        Ok(())
    }
    
    fn layout_element(&mut self, elements: &mut HashMap<u32, Element>, element_id: u32, parent_pos: Vec2, parent_size: Vec2) -> Result<()> {
        let element = elements.get(&element_id).ok_or("Element not found")?.clone();
        
        match self.get_layout_type(&element) {
            LayoutType::Absolute => {
                self.layout_absolute(elements, element_id, parent_pos, parent_size)?;
            },
            LayoutType::Flex => {
                self.layout_flex(elements, element_id, parent_pos, parent_size)?;
            },
        }
        
        // Layout children
        let children = element.children.clone();
        for child_id in children {
            let element_pos = elements[&element_id].position;
            let element_size = elements[&element_id].size;
            self.layout_element(elements, child_id, element_pos, element_size)?;
        }
        
        Ok(())
    }
    
    fn layout_absolute(&mut self, elements: &mut HashMap<u32, Element>, element_id: u32, parent_pos: Vec2, parent_size: Vec2) -> Result<()> {
        let element = elements.get_mut(&element_id).unwrap();
        
        // Apply absolute positioning
        if let Some(PropertyValue::CSSUnit(left)) = element.properties.get(&0x54) {
            element.position.x = parent_pos.x + self.resolve_unit_to_pixels(left, parent_size.x);
        }
        
        if let Some(PropertyValue::CSSUnit(top)) = element.properties.get(&0x51) {
            element.position.y = parent_pos.y + self.resolve_unit_to_pixels(top, parent_size.y);
        }
        
        // Apply size constraints
        self.apply_size_constraints(element, parent_size);
        
        Ok(())
    }
    
    fn layout_flex(&mut self, elements: &mut HashMap<u32, Element>, element_id: u32, parent_pos: Vec2, parent_size: Vec2) -> Result<()> {
        let element = elements.get(&element_id).unwrap();
        let children = element.children.clone();
        
        if children.is_empty() {
            return Ok(());
        }
        
        let flex_direction = self.get_flex_direction(&element);
        let justify_content = self.get_justify_content(&element);
        let align_items = self.get_align_items(&element);
        
        // Calculate flex layout
        match flex_direction {
            FlexDirection::Row => {
                self.layout_flex_row(elements, &children, parent_pos, parent_size, justify_content, align_items)?;
            },
            FlexDirection::Column => {
                self.layout_flex_column(elements, &children, parent_pos, parent_size, justify_content, align_items)?;
            },
        }
        
        Ok(())
    }
    
    fn resolve_unit_to_pixels(&self, unit: &CSSUnit, parent_size: f32) -> f32 {
        match unit.unit {
            UnitType::Px => unit.value as f32,
            UnitType::Percent => (unit.value as f32 / 100.0) * parent_size,
            UnitType::Vw => (unit.value as f32 / 100.0) * self.viewport_size.x,
            UnitType::Vh => (unit.value as f32 / 100.0) * self.viewport_size.y,
            UnitType::Em => unit.value as f32 * 16.0, // Default font size
            UnitType::Rem => unit.value as f32 * 16.0, // Root font size
            _ => unit.value as f32,
        }
    }
}
```

### 2.2 Layout Flags Interpretation

```rust
#[derive(Debug, Clone, Copy)]
pub enum LayoutType {
    Absolute,
    Flex,
}

impl LayoutEngine {
    fn get_layout_type(&self, element: &Element) -> LayoutType {
        // Check layout flags (bit 6 = absolute positioning)
        if (element.layout_flags & 0x40) != 0 {
            return LayoutType::Absolute;
        }
        
        // Check display property
        if let Some(PropertyValue::Byte(display)) = element.properties.get(&0x40) {
            match display {
                1 => LayoutType::Flex, // flex
                _ => LayoutType::Flex, // default to flex
            }
        } else {
            LayoutType::Flex
        }
    }
    
    fn get_flex_direction(&self, element: &Element) -> FlexDirection {
        // Layout flags bits 0-1: direction
        match element.layout_flags & 0x03 {
            0 => FlexDirection::Row,
            1 => FlexDirection::Column,
            _ => FlexDirection::Row,
        }
    }
    
    fn get_justify_content(&self, element: &Element) -> JustifyContent {
        if let Some(PropertyValue::Byte(justify)) = element.properties.get(&0x49) {
            match justify {
                0 => JustifyContent::FlexStart,
                1 => JustifyContent::Center,
                2 => JustifyContent::FlexEnd,
                3 => JustifyContent::SpaceBetween,
                4 => JustifyContent::SpaceAround,
                5 => JustifyContent::SpaceEvenly,
                _ => JustifyContent::FlexStart,
            }
        } else {
            // Layout flags bits 2-3: alignment
            match (element.layout_flags >> 2) & 0x03 {
                1 => JustifyContent::Center,
                2 => JustifyContent::FlexEnd,
                3 => JustifyContent::SpaceBetween,
                _ => JustifyContent::FlexStart,
            }
        }
    }
}
```

## Phase 3: Rendering Backend

### 3.1 Render Command System

```rust
#[derive(Debug, Clone)]
pub enum RenderCommand {
    Clear(Vec4),
    DrawRect {
        position: Vec2,
        size: Vec2,
        color: Vec4,
        border_radius: f32,
    },
    DrawText {
        text: String,
        position: Vec2,
        color: Vec4,
        font_size: f32,
        font_family: String,
    },
    DrawImage {
        source: String,
        position: Vec2,
        size: Vec2,
    },
    SetClip {
        position: Vec2,
        size: Vec2,
    },
    ResetClip,
}

pub trait RenderBackend {
    fn begin_frame(&mut self);
    fn end_frame(&mut self);
    fn execute_command(&mut self, command: &RenderCommand);
    fn get_text_size(&self, text: &str, font_size: f32, font_family: &str) -> Vec2;
}
```

### 3.2 Element to Command Conversion

```rust
pub struct Renderer {
    backend: Box<dyn RenderBackend>,
    commands: Vec<RenderCommand>,
}

impl Renderer {
    pub fn render_tree(&mut self, elements: &HashMap<u32, Element>, root_id: u32) {
        self.commands.clear();
        self.render_element(elements, root_id);
        
        self.backend.begin_frame();
        for command in &self.commands {
            self.backend.execute_command(command);
        }
        self.backend.end_frame();
    }
    
    fn render_element(&mut self, elements: &HashMap<u32, Element>, element_id: u32) {
        let element = &elements[&element_id];
        
        // Render background
        if let Some(PropertyValue::Color(bg_color)) = element.properties.get(&0x01) {
            let border_radius = element.properties.get(&0x05)
                .and_then(|p| if let PropertyValue::Float(r) = p { Some(*r) } else { None })
                .unwrap_or(0.0);
                
            self.commands.push(RenderCommand::DrawRect {
                position: element.position,
                size: element.size,
                color: *bg_color,
                border_radius,
            });
        }
        
        // Render text content
        if let Some(PropertyValue::String(text)) = element.properties.get(&0x08) {
            let font_size = element.properties.get(&0x09)
                .and_then(|p| if let PropertyValue::Float(s) = p { Some(*s) } else { None })
                .unwrap_or(16.0);
                
            let text_color = element.properties.get(&0x02)
                .and_then(|p| if let PropertyValue::Color(c) = p { Some(*c) } else { None })
                .unwrap_or(Vec4::new(0.0, 0.0, 0.0, 1.0));
                
            let font_family = element.properties.get(&0x0C)
                .and_then(|p| if let PropertyValue::String(f) = p { Some(f.clone()) } else { None })
                .unwrap_or_else(|| "default".to_string());
            
            self.commands.push(RenderCommand::DrawText {
                text: text.clone(),
                position: element.position,
                color: text_color,
                font_size,
                font_family,
            });
        }
        
        // Render image
        if element.element_type == ElementType::Image {
            if let Some(PropertyValue::String(src)) = element.properties.get(&0x0D) {
                self.commands.push(RenderCommand::DrawImage {
                    source: src.clone(),
                    position: element.position,
                    size: element.size,
                });
            }
        }
        
        // Render children
        for &child_id in &element.children {
            self.render_element(elements, child_id);
        }
    }
}
```

### 3.3 Example Backend Implementation (Ratatui)

```rust
use ratatui::prelude::*;

pub struct RatatuiBackend {
    terminal: Terminal<CrosstermBackend<std::io::Stdout>>,
}

impl RenderBackend for RatatuiBackend {
    fn begin_frame(&mut self) {
        // Clear terminal
    }
    
    fn end_frame(&mut self) {
        // Flush to terminal
    }
    
    fn execute_command(&mut self, command: &RenderCommand) {
        match command {
            RenderCommand::DrawRect { position, size, color, .. } => {
                let rect = Rect::new(
                    position.x as u16,
                    position.y as u16,
                    size.x as u16,
                    size.y as u16,
                );
                
                let bg_color = Color::Rgb(
                    (color.x * 255.0) as u8,
                    (color.y * 255.0) as u8,
                    (color.z * 255.0) as u8,
                );
                
                // Draw rectangle using ratatui
                self.terminal.draw(|frame| {
                    let block = Block::default().style(Style::default().bg(bg_color));
                    frame.render_widget(block, rect);
                }).unwrap();
            },
            
            RenderCommand::DrawText { text, position, color, .. } => {
                let text_color = Color::Rgb(
                    (color.x * 255.0) as u8,
                    (color.y * 255.0) as u8,
                    (color.z * 255.0) as u8,
                );
                
                self.terminal.draw(|frame| {
                    let paragraph = Paragraph::new(text.as_str())
                        .style(Style::default().fg(text_color));
                    let area = Rect::new(
                        position.x as u16,
                        position.y as u16,
                        text.len() as u16,
                        1,
                    );
                    frame.render_widget(paragraph, area);
                }).unwrap();
            },
            
            // ... other commands
            _ => {}
        }
    }
    
    fn get_text_size(&self, text: &str, _font_size: f32, _font_family: &str) -> Vec2 {
        // Terminal-based approximation
        Vec2::new(text.len() as f32, 1.0)
    }
}
```

## Phase 4: Runtime System

### 4.1 Event System

```rust
#[derive(Debug, Clone)]
pub enum Event {
    Click { element_id: u32, position: Vec2 },
    Hover { element_id: u32, entered: bool },
    KeyPress { key: String },
    TextInput { element_id: u32, text: String },
    WindowResize { size: Vec2 },
}

pub struct EventManager {
    handlers: HashMap<u32, Vec<EventHandler>>,
    hover_state: HashMap<u32, bool>,
}

impl EventManager {
    pub fn handle_event(&mut self, event: Event, script_system: &mut ScriptSystem) {
        match event {
            Event::Click { element_id, .. } => {
                if let Some(handlers) = self.handlers.get(&element_id) {
                    for handler in handlers {
                        if handler.event_type == EventType::Click {
                            script_system.call_function(&handler.function_name, &[]);
                        }
                    }
                }
            },
            
            Event::Hover { element_id, entered } => {
                let was_hovering = self.hover_state.get(&element_id).copied().unwrap_or(false);
                self.hover_state.insert(element_id, entered);
                
                if entered != was_hovering {
                    // Trigger style state change
                    self.update_element_state(element_id, "hover", entered);
                }
            },
            
            // ... other events
        }
    }
    
    fn hit_test(&self, elements: &HashMap<u32, Element>, position: Vec2) -> Option<u32> {
        // Find topmost element at position
        for (&id, element) in elements.iter() {
            if self.point_in_element(element, position) {
                return Some(id);
            }
        }
        None
    }
    
    fn point_in_element(&self, element: &Element, point: Vec2) -> bool {
        point.x >= element.position.x &&
        point.x <= element.position.x + element.size.x &&
        point.y >= element.position.y &&
        point.y <= element.position.y + element.size.y
    }
}
```

### 4.2 Script System Integration

```rust
pub struct ScriptSystem {
    lua: mlua::Lua,
    elements: HashMap<u32, Element>,
    template_variables: HashMap<String, String>,
}

impl ScriptSystem {
    pub fn new() -> Result<Self> {
        let lua = mlua::Lua::new();
        Ok(Self {
            lua,
            elements: HashMap::new(),
            template_variables: HashMap::new(),
        })
    }
    
    pub fn register_dom_functions(&mut self, elements: &HashMap<u32, Element>) -> Result<()> {
        let elements_clone = elements.clone();
        
        // Register getElementById function
        let get_element_by_id = self.lua.create_function(move |_, id: String| {
            for (element_id, element) in &elements_clone {
                if element.id == id {
                    return Ok(Some(*element_id));
                }
            }
            Ok(None)
        })?;
        
        self.lua.globals().set("getElementById", get_element_by_id)?;
        
        // Register element manipulation functions
        self.register_element_functions()?;
        
        Ok(())
    }
    
    fn register_element_functions(&mut self) -> Result<()> {
        // setText function
        let set_text = self.lua.create_function(|_, (element_id, text): (u32, String)| {
            // Update element text property
            // This would need access to the element storage
            Ok(())
        })?;
        
        self.lua.globals().set("setText", set_text)?;
        
        // setVisible function
        let set_visible = self.lua.create_function(|_, (element_id, visible): (u32, bool)| {
            // Update element visibility
            Ok(())
        })?;
        
        self.lua.globals().set("setVisible", set_visible)?;
        
        // Template variable functions
        let set_template_var = self.lua.create_function(|_, (name, value): (String, String)| {
            // Update template variable
            Ok(())
        })?;
        
        self.lua.globals().set("setTemplateVariable", set_template_var)?;
        
        Ok(())
    }
    
    pub fn execute_script(&mut self, script: &str) -> Result<()> {
        self.lua.load(script).exec()?;
        Ok(())
    }
    
    pub fn call_function(&mut self, function_name: &str, args: &[String]) -> Result<()> {
        let function: mlua::Function = self.lua.globals().get(function_name)?;
        function.call::<_, ()>(args.to_vec())?;
        Ok(())
    }
}
```

### 4.3 Complete Application Runner

```rust
pub struct KryonApp {
    krb_file: KRBFile,
    elements: HashMap<u32, Element>,
    layout_engine: LayoutEngine,
    renderer: Renderer,
    event_manager: EventManager,
    script_system: ScriptSystem,
    running: bool,
}

impl KryonApp {
    pub fn from_krb_file(data: Vec<u8>, backend: Box<dyn RenderBackend>) -> Result<Self> {
        let mut parser = KRBParser::new(data)?;
        let krb_file = parser.parse()?;
        
        let mut elements = krb_file.elements.clone();
        
        // Apply styles to elements
        Self::apply_styles(&mut elements, &krb_file.styles);
        
        // Find viewport size from App element
        let viewport_size = Self::find_app_viewport_size(&elements).unwrap_or(Vec2::new(800.0, 600.0));
        
        let layout_engine = LayoutEngine::new(viewport_size, 1.0);
        let renderer = Renderer::new(backend);
        let event_manager = EventManager::new();
        let script_system = ScriptSystem::new()?;
        
        Ok(Self {
            krb_file,
            elements,
            layout_engine,
            renderer,
            event_manager,
            script_system,
            running: true,
        })
    }
    
    pub fn run(&mut self) -> Result<()> {
        // Initialize script system
        self.script_system.register_dom_functions(&self.elements)?;
        
        // Execute initialization scripts
        for script in &self.krb_file.scripts {
            if script.language == ScriptLanguage::Lua {
                self.script_system.execute_script(&script.code)?;
            }
        }
        
        // Find root element (App type)
        let root_id = self.find_root_element_id()?;
        
        // Main loop
        while self.running {
            // Handle events
            self.handle_input_events()?;
            
            // Update layout
            self.layout_engine.layout_tree(&mut self.elements, root_id)?;
            
            // Render frame
            self.renderer.render_tree(&self.elements, root_id);
            
            // Frame timing
            std::thread::sleep(std::time::Duration::from_millis(16)); // ~60 FPS
        }
        
        Ok(())
    }
    
    fn apply_styles(elements: &mut HashMap<u32, Element>, styles: &HashMap<u8, Style>) {
        for element in elements.values_mut() {
            if let Some(style) = styles.get(&element.style_id) {
                // Apply style properties to element
                for (&prop_id, prop_value) in &style.properties {
                    element.properties.insert(prop_id, prop_value.clone());
                }
            }
        }
    }
    
    fn find_root_element_id(&self) -> Result<u32> {
        for (&id, element) in &self.elements {
            if element.element_type == ElementType::App {
                return Ok(id);
            }
        }
        Err("No App element found".into())
    }
    
    fn find_app_viewport_size(elements: &HashMap<u32, Element>) -> Option<Vec2> {
        for element in elements.values() {
            if element.element_type == ElementType::App {
                let width = element.properties.get(&0x20)
                    .and_then(|p| if let PropertyValue::Short(w) = p { Some(*w as f32) } else { None })
                    .unwrap_or(800.0);
                let height = element.properties.get(&0x21)
                    .and_then(|p| if let PropertyValue::Short(h) = p { Some(*h as f32) } else { None })
                    .unwrap_or(600.0);
                return Some(Vec2::new(width, height));
            }
        }
        None
    }
}
```

## Phase 5: Testing and Validation

### 5.1 Snapshot Testing

The Kryon project uses snapshot testing with the `ratatui` backend as the "source of truth":

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use insta::assert_snapshot;

    #[test]
    fn test_basic_layout() {
        let krb_data = std::fs::read("examples/basic_layout.krb").unwrap();
        let backend = Box::new(TestRatatuiBackend::new(80, 24));
        let mut app = KryonApp::from_krb_file(krb_data, backend).unwrap();
        
        // Render one frame
        let root_id = app.find_root_element_id().unwrap();
        app.layout_engine.layout_tree(&mut app.elements, root_id).unwrap();
        app.renderer.render_tree(&app.elements, root_id);
        
        // Capture output
        let output = app.renderer.backend.capture_output();
        assert_snapshot!(output);
    }
    
    #[test]
    fn test_flexbox_layout() {
        // Test flex direction, alignment, etc.
    }
    
    #[test]
    fn test_absolute_positioning() {
        // Test absolute positioning and overlays
    }
    
    #[test]
    fn test_script_integration() {
        // Test DOM API and script execution
    }
}
```

### 5.2 Running Tests

```bash
# Run snapshot tests
cargo test -p kryon-ratatui

# Review visual differences
cargo insta review

# Accept new snapshots
cargo insta accept
```

## Phase 6: Optimization and Production

### 6.1 Performance Optimization

```rust
// Memory-mapped file loading for large KRB files
use memmap2::Mmap;

pub struct MmapKRBParser {
    mmap: Mmap,
    position: usize,
}

impl MmapKRBParser {
    pub fn new(file: std::fs::File) -> Result<Self> {
        let mmap = unsafe { Mmap::map(&file)? };
        Ok(Self { mmap, position: 0 })
    }
    
    // Same parsing logic but reading from memory-mapped data
}

// Lazy loading for large element trees
pub struct LazyElementTree {
    parser: KRBParser,
    loaded_elements: HashMap<u32, Element>,
    element_offsets: HashMap<u32, usize>,
}

// Render command batching
pub struct BatchedRenderer {
    backend: Box<dyn RenderBackend>,
    rect_commands: Vec<RenderCommand>,
    text_commands: Vec<RenderCommand>,
}
```

### 6.2 Cross-Platform Deployment

```rust
// Platform-specific backend selection
pub fn create_platform_backend() -> Box<dyn RenderBackend> {
    #[cfg(feature = "wgpu")]
    return Box::new(WgpuBackend::new());
    
    #[cfg(feature = "ratatui")]
    return Box::new(RatatuiBackend::new());
    
    #[cfg(feature = "raylib")]
    return Box::new(RaylibBackend::new());
    
    panic!("No rendering backend available");
}

// Feature flags in Cargo.toml
[features]
default = ["wgpu"]
wgpu = ["wgpu-rs", "winit"]
ratatui = ["ratatui", "crossterm"]
raylib = ["raylib-rs"]
```

## Examples and Reference Files

### Key Example Files

From the `kryon-renderer/examples/` directory:

1. **`01_getting_started/hello_world.kry`** - Basic app structure
2. **`02_basic_ui/button.kry`** - Interactive elements
3. **`03_layouts/flexbox_guide.kry`** - Layout examples
4. **`04_styling/transform_demo.kry`** - CSS transforms
5. **`07_advanced/calculator.kry`** - Complete application

### Building and Testing Examples

```bash
# Compile KRY to KRB
cd kryon-compiler
./target/debug/kryc ../kryon-renderer/examples/01_getting_started/hello_world.kry

# Run with different backends
cd kryon-renderer
cargo run --no-default-features --features wgpu --bin kryon-renderer-wgpu -- examples/hello_world.krb
cargo run --no-default-features --features ratatui --bin kryon-renderer-ratatui -- examples/hello_world.krb
cargo run --no-default-features --features raylib --bin kryon-renderer-raylib -- examples/hello_world.krb

# Debug output
cargo run --no-default-features --features ratatui --bin kryon-renderer-debug -- examples/hello_world.krb
```

## Troubleshooting Guide

### Common Issues

1. **Layout problems**: Check layout flags in debug output
2. **Property parsing errors**: Validate property IDs and value types
3. **Script system issues**: Ensure DOM functions are registered after element loading
4. **Memory issues**: Use memory-mapped I/O for large files
5. **Cross-platform compatibility**: Test endianness and alignment

### Debug Tools

```bash
# Enable detailed logging
RUST_LOG=debug cargo run -- file.krb

# Use debug renderer for text output
cargo run --bin kryon-renderer-debug -- file.krb

# Run snapshot tests for visual validation
cargo test -p kryon-ratatui
cargo insta review
```

This guide provides a complete foundation for implementing KRB parsers and renderers. The reference implementation in `kryon-renderer` serves as the authoritative example, with snapshot testing ensuring consistency across all backends.