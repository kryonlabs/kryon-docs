# Kryon Implementation Specification v1.2  
*Complete implementation guide for building Kryon compilers and runtimes*

## Implementation Architecture

### Compiler Implementation (kryc)

#### Phase 1: Lexical Analysis
```cpp
enum TokenType {
    // Keywords
    TOK_APP, TOK_CONTAINER, TOK_TEXT, TOK_BUTTON, TOK_INPUT, TOK_IMAGE,
    TOK_STYLE, TOK_DEFINE, TOK_PROPERTIES, TOK_INCLUDE, TOK_VARIABLES, TOK_SCRIPT,
    
    // Operators and punctuation  
    TOK_LBRACE, TOK_RBRACE, TOK_COLON, TOK_SEMICOLON, TOK_COMMA,
    TOK_AMPERSAND, TOK_DOLLAR, TOK_EQUALS,
    
    // Literals
    TOK_STRING, TOK_NUMBER, TOK_BOOLEAN, TOK_COLOR, TOK_IDENTIFIER,
    
    // Special
    TOK_EOF, TOK_NEWLINE, TOK_COMMENT
};

struct Token {
    TokenType type;
    std::string value;
    size_t line;
    size_t column;
    std::string filename;
};

class Lexer {
    const char* source;
    size_t position;
    size_t line;
    size_t column;
    
public:
    Token nextToken();
    void skipWhitespace();
    Token readString();      // Handle "quoted strings" with escapes
    Token readNumber();      // Handle integers and floats
    Token readColor();       // Handle #RRGGBBAA colors
    Token readIdentifier();  // Handle keywords and identifiers
    bool isKeyword(const std::string& word);
};
```

#### Phase 2: Parsing and AST Construction
```cpp
// Abstract Syntax Tree nodes
struct ASTNode {
    enum Type {
        NODE_APP, NODE_ELEMENT, NODE_PROPERTY, NODE_STYLE, NODE_DEFINE,
        NODE_VARIABLES, NODE_VARIABLE, NODE_SCRIPT, NODE_INCLUDE,
        NODE_PSEUDO_SELECTOR, NODE_COMPONENT_PROPERTIES
    };
    Type type;
    std::vector<std::unique_ptr<ASTNode>> children;
    std::string value;
    std::map<std::string, std::string> attributes;
};

class Parser {
    std::vector<Token> tokens;
    size_t current;
    
public:
    std::unique_ptr<ASTNode> parseFile();
    std::unique_ptr<ASTNode> parseApp();
    std::unique_ptr<ASTNode> parseElement();
    std::unique_ptr<ASTNode> parseProperties();
    std::unique_ptr<ASTNode> parsePseudoSelector();
    std::unique_ptr<ASTNode> parseStyle();
    std::unique_ptr<ASTNode> parseDefine();
    std::unique_ptr<ASTNode> parseVariables();
    std::unique_ptr<ASTNode> parseScript();
    
private:
    Token peek();
    Token consume(TokenType expected);
    bool match(TokenType type);
    void parsePropertyList(ASTNode* parent);
    void parseElementChildren(ASTNode* parent);
};

// Grammar rules (recursive descent)
/*
File := (Include | Variables | Style | Define | Script)* App

App := 'App' '{' PropertyList ElementList '}'

Element := ElementType ('{' PropertyList '}' ('{' ElementList '}')?)
         | ElementType '{' PropertyList PseudoSelectorList? ElementList '}'

ElementType := 'Container' | 'Text' | 'Button' | 'Input' | 'Image' | IDENTIFIER

PropertyList := (Property (';' Property)*)? 

Property := IDENTIFIER ':' Value

PseudoSelectorList := PseudoSelector+

PseudoSelector := '&:' ('hover'|'active'|'focus'|'disabled'|'checked') '{' PropertyList '}'

Value := STRING | NUMBER | BOOLEAN | COLOR | VARIABLE | IDENTIFIER

Variables := '@variables' '{' VariableList '}'

VariableList := (Variable)*

Variable := IDENTIFIER ':' Value

Style := 'style' STRING '{' ('extends' ':' (STRING | '[' StringList ']'))? PropertyList '}'

Define := 'Define' IDENTIFIER '{' 'Properties' '{' PropertyDefList '}' Element '}'

PropertyDefList := (PropertyDef)*

PropertyDef := IDENTIFIER ':' TypeHint ('=' Value)?

TypeHint := 'String' | 'Int' | 'Float' | 'Bool' | 'Color' | 'StyleID' | 'Resource' 
          | 'Enum' '(' IdentifierList ')'

Script := '@script' STRING (('from' STRING) | ('{' ScriptCode '}')) ('mode' '=' STRING)?

Include := '@include' STRING
*/
```

#### Phase 3: Semantic Analysis
```cpp
class SemanticAnalyzer {
    std::map<std::string, VariableInfo> variables;
    std::map<std::string, StyleInfo> styles;
    std::map<std::string, ComponentInfo> components;
    std::vector<std::string> errors;
    
public:
    bool analyze(ASTNode* root);
    
private:
    void resolveVariables(ASTNode* node);
    void resolveStyleInheritance();
    void validatePropertyTypes(ASTNode* element);
    void checkComponentProperties(ASTNode* componentUsage);
    void detectCircularDependencies();
    
    struct VariableInfo {
        std::string name;
        std::string value;
        std::string type;
        bool resolved;
    };
    
    struct StyleInfo {
        std::string name;
        std::vector<std::string> extends;
        std::map<std::string, std::string> properties;
        bool resolved;
    };
    
    struct ComponentInfo {
        std::string name;
        std::map<std::string, PropertyDef> declaredProperties;
        ASTNode* templateRoot;
    };
};

// Variable resolution algorithm
void SemanticAnalyzer::resolveVariables(ASTNode* node) {
    if (node->type == ASTNode::NODE_VARIABLES) {
        // First pass: collect all variable declarations
        for (auto& child : node->children) {
            if (child->type == ASTNode::NODE_VARIABLE) {
                VariableInfo info;
                info.name = child->value;
                info.value = child->attributes["value"];
                info.resolved = false;
                variables[info.name] = info;
            }
        }
        
        // Second pass: resolve dependencies
        bool changed = true;
        while (changed) {
            changed = false;
            for (auto& [name, info] : variables) {
                if (!info.resolved) {
                    std::string resolved = resolveVariableReferences(info.value);
                    if (resolved != info.value) {
                        info.value = resolved;
                        changed = true;
                    }
                    if (resolved.find('$') == std::string::npos) {
                        info.resolved = true;
                        changed = true;
                    }
                }
            }
        }
        
        // Check for unresolved circular references
        for (const auto& [name, info] : variables) {
            if (!info.resolved) {
                errors.push_back("Circular variable dependency: " + name);
            }
        }
    }
    
    // Recursively process children
    for (auto& child : node->children) {
        resolveVariables(child.get());
    }
}
```

#### Phase 4: KRB Code Generation
```cpp
class KRBGenerator {
    std::vector<uint8_t> output;
    StringTable stringTable;
    ResourceTable resourceTable;
    StyleTable styleTable;
    ComponentTable componentTable;
    ScriptTable scriptTable;
    
public:
    std::vector<uint8_t> generate(ASTNode* root);
    
private:
    void writeHeader();
    void writeStringTable();
    void writeElementTree(ASTNode* app);
    void writeStyleTable();
    void writeComponentTable();
    void writeScriptTable();
    void writeResourceTable();
    
    uint16_t addString(const std::string& str);
    uint8_t addStyle(const StyleInfo& style);
    uint8_t addComponent(const ComponentInfo& component);
    uint16_t addResource(const std::string& path, ResourceType type);
    
    void writeElement(ASTNode* element);
    void writeProperty(const std::string& name, const std::string& value);
    void writeCustomProperty(const std::string& key, const std::string& value);
    void writeStateProperty(const std::string& state, const PropertyList& props);
};

// KRB file header generation
void KRBGenerator::writeHeader() {
    // Magic number "KRB1"
    output.insert(output.end(), {'K', 'R', 'B', '1'});
    
    // Version (little-endian)
    writeUint16(0x0005); // v0.5
    
    // Flags
    uint16_t flags = 0;
    if (!styleTable.empty()) flags |= FLAG_HAS_STYLES;
    if (!componentTable.empty()) flags |= FLAG_HAS_COMPONENT_DEFS;
    if (!scriptTable.empty()) flags |= FLAG_HAS_SCRIPTS;
    if (!resourceTable.empty()) flags |= FLAG_HAS_RESOURCES;
    if (hasStateProperties) flags |= FLAG_HAS_STATE_PROPERTIES;
    if (hasFixedPoint) flags |= FLAG_FIXED_POINT;
    writeUint16(flags);
    
    // Section counts
    writeUint16(elementCount);
    writeUint16(styleTable.size());
    writeUint16(componentTable.size());
    writeUint16(animationCount);
    writeUint16(scriptTable.size());
    writeUint16(stringTable.size());
    writeUint16(resourceTable.size());
    
    // Section offsets (filled in later)
    size_t offsetBase = output.size();
    for (int i = 0; i < 8; i++) {
        writeUint32(0); // Placeholder
    }
    
    // Total size (filled in at end)
    writeUint32(0);
}

// Element tree generation with component handling
void KRBGenerator::writeElement(ASTNode* element) {
    // Element header (18 bytes)
    uint8_t elementType = getElementType(element->value);
    output.push_back(elementType);
    
    // ID (string table index)
    uint8_t idIndex = 0;
    if (element->attributes.count("id")) {
        idIndex = addString(element->attributes["id"]);
    }
    output.push_back(idIndex);
    
    // Position and size
    writeUint16(getProperty(element, "pos_x", 0));
    writeUint16(getProperty(element, "pos_y", 0));
    writeUint16(getProperty(element, "width", 0));
    writeUint16(getProperty(element, "height", 0));
    
    // Layout byte
    uint8_t layout = computeLayoutByte(element);
    output.push_back(layout);
    
    // Style ID
    uint8_t styleId = 0;
    if (element->attributes.count("style")) {
        styleId = getStyleId(element->attributes["style"]);
    }
    output.push_back(styleId);
    
    // Count properties, children, events, etc.
    std::vector<Property> standardProps = collectStandardProperties(element);
    std::vector<CustomProperty> customProps = collectCustomProperties(element);
    std::vector<StatePropertySet> stateProps = collectStateProperties(element);
    std::vector<ASTNode*> children = collectChildren(element);
    std::vector<Event> events = collectEvents(element);
    
    output.push_back(standardProps.size());
    output.push_back(children.size());
    output.push_back(events.size());
    output.push_back(0); // Animation count
    output.push_back(customProps.size());
    output.push_back(stateProps.size());
    
    // Write standard properties
    for (const auto& prop : standardProps) {
        writeProperty(prop);
    }
    
    // Write custom properties  
    for (const auto& prop : customProps) {
        writeCustomProperty(prop);
    }
    
    // Write state properties
    for (const auto& stateSet : stateProps) {
        writeStatePropertySet(stateSet);
    }
    
    // Write events
    for (const auto& event : events) {
        writeEvent(event);
    }
    
    // Write child references (offsets calculated later)
    for (const auto& child : children) {
        writeUint16(0); // Placeholder offset
    }
    
    // Recursively write children
    for (auto* child : children) {
        writeElement(child);
    }
}
```

### Runtime Implementation

#### Core Runtime Architecture
```cpp
class KryonRuntime {
    std::unique_ptr<KRBLoader> loader;
    std::unique_ptr<ElementSystem> elementSystem;
    std::unique_ptr<LayoutEngine> layoutEngine;
    std::unique_ptr<RenderEngine> renderEngine;
    std::unique_ptr<ScriptManager> scriptManager;
    std::unique_ptr<EventManager> eventManager;
    
public:
    bool loadApplication(const std::string& krbPath);
    void update(float deltaTime);
    void render();
    void handleInput(const InputEvent& event);
    
private:
    void processElements();
    void updateLayout();
    void updateScripts(float deltaTime);
    void processEvents();
};

// KRB file loading and parsing
class KRBLoader {
    struct KRBFile {
        const uint8_t* data;
        size_t size;
        bool mapped;
        
        // Parsed header
        uint16_t version;
        uint16_t flags;
        
        // Section pointers
        const uint8_t* stringTable;
        const uint8_t* elementTree;
        const uint8_t* styleTable;
        const uint8_t* componentTable;
        const uint8_t* scriptTable;
        const uint8_t* resourceTable;
        
        // Section counts
        uint16_t stringCount;
        uint16_t elementCount;
        uint16_t styleCount;
        uint16_t componentCount;
        uint16_t scriptCount;
        uint16_t resourceCount;
    };
    
    KRBFile file;
    std::vector<std::string> strings;
    std::vector<ComponentDefinition> components;
    
public:
    bool loadFile(const std::string& path);
    const std::string& getString(uint8_t index);
    const ComponentDefinition& getComponent(const std::string& name);
    Element* parseElement(const uint8_t* data);
    
private:
    bool validateHeader();
    void parseStringTable();
    void parseComponentTable();
    void parseScriptTable();
    Element* parseElementHeader(const uint8_t*& data);
    void parseElementProperties(Element* element, const uint8_t*& data);
    void parseCustomProperties(Element* element, const uint8_t*& data);
    void parseStateProperties(Element* element, const uint8_t*& data);
};
```

#### Element System Implementation
```cpp
struct Element {
    // Core identification
    ElementType type;
    std::string id;
    Element* parent;
    std::vector<std::unique_ptr<Element>> children;
    
    // Layout properties
    float x, y, width, height;
    LayoutFlags layout;
    Padding padding;
    Margin margin;
    
    // Visual properties
    Color backgroundColor;
    Color textColor;
    Color borderColor;
    float borderWidth;
    float borderRadius;
    float opacity;
    bool visible;
    
    // Text properties (for text-bearing elements)
    std::string text;
    float fontSize;
    FontWeight fontWeight;
    TextAlignment textAlignment;
    
    // Interactive properties
    CursorType cursor;
    bool disabled;
    InteractionState currentState;
    
    // Custom properties (for component instances)
    std::map<std::string, PropertyValue> customProperties;
    
    // State-based properties
    std::map<InteractionState, PropertyMap> stateProperties;
    
    // Computed properties (after state resolution)
    PropertyMap computedProperties;
    
    // Events
    std::map<EventType, std::string> eventHandlers;
    
    // Component-specific
    std::string componentName; // For component instances
    bool isComponentInstance;
    ComponentDefinition* componentDef;
};

enum class InteractionState : uint8_t {
    Normal = 0,
    Hover = 1,
    Active = 2,
    Focus = 4,
    Disabled = 8,
    Checked = 16
};

class ElementSystem {
    std::unique_ptr<Element> rootElement;
    std::unordered_map<std::string, Element*> elementById;
    std::vector<Element*> dirtyElements;
    
public:
    Element* createElement(ElementType type);
    void addElement(Element* parent, std::unique_ptr<Element> child);
    Element* getElementById(const std::string& id);
    void markDirty(Element* element);
    void updateElements();
    
    // Component instantiation
    Element* instantiateComponent(const ComponentDefinition& def, 
                                 Element* placeholder);
    
private:
    void registerElement(Element* element);
    void unregisterElement(Element* element);
    void resolveStateProperties(Element* element);
    void applyPropertyInheritance(Element* element);
};

// Component instantiation algorithm
Element* ElementSystem::instantiateComponent(const ComponentDefinition& def, 
                                           Element* placeholder) {
    // 1. Clone template structure
    Element* instance = cloneElementTree(def.templateRoot);
    
    // 2. Apply placeholder properties to instance root
    instance->id = placeholder->id;
    instance->x = placeholder->x;
    instance->y = placeholder->y;
    instance->width = placeholder->width;
    instance->height = placeholder->height;
    instance->layout = placeholder->layout;
    
    // Apply placeholder style to instance
    if (placeholder->styleId != 0) {
        applyStyle(instance, placeholder->styleId);
    }
    
    // 3. Process custom properties for component behavior
    for (const auto& [key, value] : placeholder->customProperties) {
        if (key == "_componentName") continue; // Skip internal property
        
        // Find matching property definition
        if (def.propertyDefs.count(key)) {
            const PropertyDef& propDef = def.propertyDefs.at(key);
            configureComponentProperty(instance, key, value, propDef);
        }
    }
    
    // 4. Re-parent placeholder children to designated slot
    if (!placeholder->children.empty()) {
        Element* contentSlot = findElementById(instance, "content_slot");
        if (!contentSlot) {
            contentSlot = instance; // Use root as fallback
        }
        
        for (auto& child : placeholder->children) {
            contentSlot->children.push_back(std::move(child));
            child->parent = contentSlot;
        }
    }
    
    // 5. Mark as component instance
    instance->isComponentInstance = true;
    instance->componentName = def.name;
    instance->componentDef = const_cast<ComponentDefinition*>(&def);
    
    return instance;
}
```

#### Layout Engine Implementation
```cpp
class LayoutEngine {
public:
    void computeLayout(Element* root, ConstraintBox constraints);
    
private:
    void measureElement(Element* element, ConstraintBox constraints);
    void layoutChildren(Element* container, ConstraintBox constraints);
    void layoutFlexChildren(Element* container, ConstraintBox constraints);
    void layoutAbsoluteChildren(Element* container);
    
    struct ConstraintBox {
        float minWidth, maxWidth;
        float minHeight, maxHeight;
        bool definiteWidth, definiteHeight;
    };
    
    struct FlexItem {
        Element* element;
        float flexBasis;
        float flexGrow;
        float flexShrink;
        float mainAxisSize;
        float crossAxisSize;
    };
};

// Flexbox-inspired layout algorithm
void LayoutEngine::layoutFlexChildren(Element* container, ConstraintBox constraints) {
    if (container->children.empty()) return;
    
    LayoutFlags layout = container->layout;
    bool isRow = (layout & LAYOUT_DIRECTION_MASK) == LAYOUT_ROW;
    bool isCenter = (layout & LAYOUT_ALIGN_MASK) == LAYOUT_CENTER;
    bool isGrow = (layout & LAYOUT_GROW_BIT) != 0;
    
    // 1. Collect flex items
    std::vector<FlexItem> items;
    float totalFlexGrow = 0;
    float usedMainAxisSpace = 0;
    
    for (auto& child : container->children) {
        FlexItem item;
        item.element = child.get();
        item.flexBasis = isRow ? child->width : child->height;
        item.flexGrow = isGrow ? 1.0f : 0.0f;
        item.flexShrink = 1.0f;
        
        if (item.flexBasis == 0) {
            // Measure content size
            ConstraintBox childConstraints = constraints;
            measureElement(child.get(), childConstraints);
            item.flexBasis = isRow ? child->width : child->height;
        }
        
        item.mainAxisSize = item.flexBasis;
        usedMainAxisSpace += item.flexBasis;
        totalFlexGrow += item.flexGrow;
        
        items.push_back(item);
    }
    
    // 2. Distribute remaining space
    float containerMainSize = isRow ? constraints.maxWidth : constraints.maxHeight;
    float remainingSpace = containerMainSize - usedMainAxisSpace;
    
    if (remainingSpace > 0 && totalFlexGrow > 0) {
        for (auto& item : items) {
            if (item.flexGrow > 0) {
                float growAmount = (item.flexGrow / totalFlexGrow) * remainingSpace;
                item.mainAxisSize += growAmount;
            }
        }
    }
    
    // 3. Position elements
    float currentPosition = 0;
    float gap = container->gap;
    
    for (size_t i = 0; i < items.size(); i++) {
        FlexItem& item = items[i];
        Element* child = item.element;
        
        if (isRow) {
            child->x = currentPosition;
            child->width = item.mainAxisSize;
            
            // Cross-axis alignment
            if (isCenter) {
                child->y = (constraints.maxHeight - child->height) / 2;
            }
        } else {
            child->y = currentPosition;
            child->height = item.mainAxisSize;
            
            // Cross-axis alignment
            if (isCenter) {
                child->x = (constraints.maxWidth - child->width) / 2;
            }
        }
        
        currentPosition += item.mainAxisSize;
        if (i < items.size() - 1) {
            currentPosition += gap;
        }
        
        // Recursively layout child's children
        ConstraintBox childConstraints;
        childConstraints.maxWidth = child->width;
        childConstraints.maxHeight = child->height;
        computeLayout(child, childConstraints);
    }
}
```

#### Script Manager Implementation  
```cpp
class ScriptManager {
    struct ScriptEngine {
        LanguageType language;
        void* engineHandle; // Language-specific engine pointer
        std::map<std::string, void*> functions;
    };
    
    std::vector<ScriptEngine> engines;
    std::map<std::string, std::pair<size_t, std::string>> globalFunctions;
    
public:
    bool loadScripts(const KRBFile& file);
    bool callFunction(const std::string& name, const std::vector<Value>& args);
    void setGlobalAPI(const ScriptAPI& api);
    
private:
    bool initializeEngine(LanguageType language);
    bool loadScript(const ScriptEntry& script);
    bool loadExternalScript(const ScriptEntry& script, const ResourceTable& resources);
    void registerFunction(const std::string& name, size_t engineIndex, 
                         const std::string& funcName);
};

// Lua script integration example
class LuaEngine {
    lua_State* L;
    
public:
    bool initialize() {
        L = luaL_newstate();
        luaL_openlibs(L);
        
        // Register kryon API
        registerKryonAPI();
        
        return L != nullptr;
    }
    
    bool loadScript(const std::string& code) {
        int result = luaL_dostring(L, code.c_str());
        if (result != LUA_OK) {
            const char* error = lua_tostring(L, -1);
            // Log error
            return false;
        }
        return true;
    }
    
    bool callFunction(const std::string& name, const std::vector<Value>& args) {
        lua_getglobal(L, name.c_str());
        if (!lua_isfunction(L, -1)) {
            lua_pop(L, 1);
            return false;
        }
        
        // Push arguments
        for (const auto& arg : args) {
            pushValue(arg);
        }
        
        // Call function
        int result = lua_pcall(L, args.size(), 0, 0);
        if (result != LUA_OK) {
            const char* error = lua_tostring(L, -1);
            // Log error
            lua_pop(L, 1);
            return false;
        }
        
        return true;
    }
    
private:
    void registerKryonAPI() {
        // Register kryon.getElementById
        lua_newtable(L);
        lua_pushcfunction(L, lua_getElementById);
        lua_setfield(L, -2, "getElementById");
        
        lua_pushcfunction(L, lua_setProperty);
        lua_setfield(L, -2, "setProperty");
        
        lua_pushcfunction(L, lua_getProperty);
        lua_setfield(L, -2, "getProperty");
        
        lua_pushcfunction(L, lua_setState);
        lua_setfield(L, -2, "setState");
        
        lua_pushcfunction(L, lua_getState);
        lua_setfield(L, -2, "getState");
        
        lua_setglobal(L, "kryon");
    }
    
    static int lua_getElementById(lua_State* L) {
        const char* id = luaL_checkstring(L, 1);
        ElementSystem* elements = getElementSystem();
        Element* element = elements->getElementById(id);
        
        if (element) {
            // Return element handle/userdata
            pushElementHandle(L, element);
        } else {
            lua_pushnil(L);
        }
        
        return 1;
    }
    
    static int lua_setProperty(lua_State* L) {
        ElementHandle* handle = checkElementHandle(L, 1);
        const char* property = luaL_checkstring(L, 2);
        // Get value from stack and convert
        Value value = getValue(L, 3);
        
        // Set property on element
        setElementProperty(handle->element, property, value);
        
        return 0;
    }
};
```

### Build System Implementation

#### Build Configuration
```cpp
struct BuildConfig {
    enum Target { Desktop, Mobile, Web, Embedded };
    enum OptimizationLevel { None, Basic, Aggressive };
    enum CompressionLevel { NoCompression, Fast, Max };
    
    Target target;
    OptimizationLevel optimization;
    CompressionLevel compression;
    bool developmentMode;
    bool embedScripts;
    bool generateDebugInfo;
    
    std::vector<std::string> includePaths;
    std::string outputPath;
    
    // Target-specific settings
    struct {
        uint32_t maxMemory;
        bool enableFloatingPoint;
        bool enableScripting;
    } embedded;
    
    struct {
        bool enableWebAssembly;
        bool enableServiceWorker;
        std::string manifestPath;
    } web;
};

class BuildSystem {
    BuildConfig config;
    
public:
    bool build(const std::string& inputFile);
    
private:
    bool preprocess(const std::string& file, std::string& output);
    bool compile(const std::string& source, std::vector<uint8_t>& krb);
    bool optimize(std::vector<uint8_t>& krb);
    bool compress(std::vector<uint8_t>& krb);
    bool writeOutput(const std::vector<uint8_t>& krb);
    
    // Optimization passes
    void optimizeStringTable(KRBData& data);
    void optimizePropertyBlocks(KRBData& data);
    void optimizeComponentTemplates(KRBData& data);
    void deadCodeElimination(KRBData& data);
};
```

### Error Handling and Diagnostics

#### Comprehensive Error System  
```cpp
enum class ErrorSeverity {
    Info, Warning, Error, Fatal
};

struct DiagnosticMessage {
    ErrorSeverity severity;
    std::string message;
    std::string filename;
    size_t line;
    size_t column;
    std::string sourceContext; // Line of source code
    std::vector<std::string> suggestions;
};

class DiagnosticManager {
    std::vector<DiagnosticMessage> messages;
    bool hasErrors;
    
public:
    void report(ErrorSeverity severity, const std::string& message,
               const std::string& filename, size_t line, size_t column);
    void reportWithSuggestion(ErrorSeverity severity, const std::string& message,
                             const std::string& filename, size_t line, size_t column,
                             const std::vector<std::string>& suggestions);
    
    bool hasAnyErrors() const { return hasErrors; }
    void printMessages() const;
    void writeToFile(const std::string& path) const;
};

// Specific error types with helpful messages
class CompilerErrors {
public:
    static void undefinedVariable(DiagnosticManager& diag, const std::string& varName,
                                 const Token& token) {
        diag.reportWithSuggestion(
            ErrorSeverity::Error,
            "Undefined variable: $" + varName,
            token.filename, token.line, token.column,
            {"Check variable name spelling", "Define variable in @variables block"}
        );
    }
    
    static void circularDependency(DiagnosticManager& diag, 
                                  const std::vector<std::string>& cycle,
                                  const std::string& filename) {
        std::string message = "Circular dependency detected: ";
        for (size_t i = 0; i < cycle.size(); i++) {
            message += cycle[i];
            if (i < cycle.size() - 1) message += " -> ";
        }
        message += " -> " + cycle[0];
        
        diag.report(ErrorSeverity::Error, message, filename, 0, 0);
    }
    
    static void invalidPropertyType(DiagnosticManager& diag, const std::string& property,
                                   const std::string& expectedType, 
                                   const std::string& actualValue,
                                   const Token& token) {
        diag.reportWithSuggestion(
            ErrorSeverity::Error,
            "Invalid value for property '" + property + "': expected " + expectedType + 
            ", got '" + actualValue + "'",
            token.filename, token.line, token.column,
            {"Check property value format", "See documentation for " + property}
        );
    }
};
```

### Testing Framework

#### Unit Testing Infrastructure
```cpp
class KryonTestFramework {
public:
    static bool runAllTests();
    static bool runCompilerTests();
    static bool runRuntimeTests();
    static bool runParserTests();
    
private:
    static bool testLexer();
    static bool testParser();
    static bool testSemanticAnalysis();
    static bool testCodeGeneration();
    static bool testLayoutEngine();
    static bool testScriptIntegration();
    static bool testComponentInstantiation();
};

// Example test cases
bool KryonTestFramework::testParser() {
    struct TestCase {
        std::string input;
        bool shouldSucceed;
        std::string expectedError;
    };
    
    std::vector<TestCase> testCases = {
        {
            R"(
            App {
                window_title: "Test"
                Text { text: "Hello" }
            }
            )",
            true, ""
        },
        {
            R"(
            App {
                Text { text: "Missing property separator" }
            }
            )",
            false, "Expected ':' after property name"
        },
        // ... more test cases
    };
    
    for (const auto& test : testCases) {
        Lexer lexer(test.input);
        auto tokens = lexer.tokenize();
        Parser parser(tokens);
        
        try {
            auto ast = parser.parseFile();
            if (!test.shouldSucceed) {
                std::cout << "Test failed: Expected error but parsing succeeded\n";
                return false;
            }
        } catch (const ParseError& e) {
            if (test.shouldSucceed) {
                std::cout << "Test failed: Unexpected parse error: " << e.what() << "\n";
                return false;
            }
            if (test.expectedError != "" && e.what() != test.expectedError) {
                std::cout << "Test failed: Wrong error message\n";
                return false;
            }
        }
    }
    
    return true;
}
```

This implementation specification provides the complete technical details needed to build a fully functional Kryon compiler and runtime. It includes algorithms, data structures, error handling, and testing frameworks necessary for a production-quality implementation.