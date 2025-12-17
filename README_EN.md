# vite-plugin-auto-api-types

<div align="right">
  <a href="./README.md">中文</a> | <a href="./README_EN.md">English</a>
</div>

A Vite plugin that automatically intercepts frontend requests, parses response data structures, and generates TypeScript global type declarations. No need to manually write API interface types—they are automatically generated during development, greatly improving frontend development efficiency.

## 🌟 Core Features
- 🚀 **Automatic Request Interception**: Supports intercepting all requests initiated by `fetch` and `XMLHttpRequest`
- 📝 **Automatic Type Generation**: Parses JSON response data structures and automatically generates corresponding TypeScript types
- 🌍 **Global Type Declarations**: Generates `.d.ts` global type files that can be used without manual import for type hints
- ⚡ **Seamless Development**: Type updates do not trigger page refresh and do not interrupt the development process
- 🎯 **Flexible Configuration**: Supports excluding specified URLs, customizing output directory/file name, debounce delay, etc.
- 📦 **Modular Types**: Supports generating API types from different modules into independent files
- 📂 **Subdirectory Support**: Can centrally store modular type files in a specified subdirectory
- 🎨 **Custom Type Naming**: Supports user-defined type naming rules to generate type names that match project specifications
- 🧠 **LRU Cache Optimization**: Built-in LRU cache mechanism to automatically limit memory usage and avoid memory leaks
- 🗑️ **Manual Cache API**: Provides clearCache() plugin method to support manual cache cleaning for flexible memory control
- 🛡️ **Stable and Reliable**: Complete error handling, and interception logic does not affect the execution of original requests

## 📦 Installation

```bash
# npm
npm install vite-plugin-auto-api-types --save-dev

# yarn
yarn add vite-plugin-auto-api-types -D

# pnpm
pnpm add vite-plugin-auto-api-types -D
```

## 🚀 Usage

### 1. Basic Configuration (vite.config.ts)
```typescript
import { defineConfig } from 'vite';
import autoApiTypesPlugin from 'vite-plugin-auto-api-types';

export default defineConfig({
  plugins: [
    autoApiTypesPlugin({
      // Optional configuration
      outputDir: 'src/types',          // Type file output directory, default: types
      excludeUrls: [/^\/assets/, /\.(svg|png|jpg)$/], // Exclude URLs that do not need to be intercepted
      typeFileName: 'auto-api-types.d.ts', // Generated type file name, default: api-types.d.ts
      debounceDelay: 1000, // Debounce delay (ms), default: 1000
      responsePath: 'result.records', // Specify the path to extract types from API responses, generate types only for this part
      moduleMap: {
        // Modular type configuration, generate types for specific URLs into independent files
        '/api/user': 'user',       // Generate types for requests starting with /api/user into user.d.ts
        '/api/product': 'product', // Generate types for requests starting with /api/product into product.d.ts
        '/api/order': 'order'      // Generate types for requests starting with /api/order into order.d.ts
      },
      moduleDir: 'modules', // Subdirectory for modular type files, default: no subdirectory created
      typeNameGenerator: (url) => {
        // Custom type naming rule
        const path = url.replace(/^https?:\/\/[^\/]+/, '')
          .replace(/^\/api\//, '') // Remove /api prefix
          .replace(/[^a-zA-Z0-9]/g, '_')
          .replace(/_+/g, '_')
          .replace(/^_|_$/g, '');
        return path ? `Api_${path}` : 'Api_Unknown';
      }
    })
  ]
});
```

### 2. Configure tsconfig.json
Ensure TypeScript can recognize the generated type files:
```json
{
  "compilerOptions": {
    "typeRoots": [
      "./node_modules/@types",
      "./src/types" // Corresponding to the plugin's outputDir configuration
    ],
    "types": ["auto-api-types"], // Explicitly introduce the generated type file
    "strict": true // It is recommended to enable strict mode for better type hints
  },
  "include": [
    "src/**/*",
    "src/types/**/*.d.ts" // Include generated type files
  ]
}
```

### 3. Using in Development
The plugin automatically intercepts requests and generates types, which can be used directly in code:
```typescript
// Assuming you requested the /api/user interface, the Api_api_user type will be automatically generated
async function getUser() {
  const res = await fetch('/api/user');
  const data = await res.json() as Api_api_user; // Automatic type hints
  
  // You can directly access the properties of data with complete TS type hints
  console.log(data.id, data.name, data.age);
}

// Array type example (e.g., /api/user/list)
async function getUserList() {
  const res = await fetch('/api/user/list');
  const data = await res.json() as Api_api_user_list; // Array types are automatically generated
  
  // Array items have complete type hints
  data.forEach(user => {
    console.log(user.id, user.name);
  });
}
```

## ⚙️ Configuration Options

| Configuration Item | Type | Default Value | Description |
|--------------------|------|---------------|-------------|
| `outputDir` | `string` | `types` | Type file output directory (relative to the project root directory) |
| `excludeUrls` | `RegExp[]` | `[]` | Regular expression list of URLs to exclude (e.g., static resources, images, etc.) |
| `typeFileName` | `string` | `api-types.d.ts` | Generated type declaration file name (default type file) |
| `debounceDelay` | `number` | `1000` | Debounce delay (ms), to avoid frequent file writing caused by multiple requests in a short time |
| `moduleMap` | `Record<string, string>` | `{}` | URL prefix mapping table, generate types for matching prefix requests into specified file names (without extension) |
| `moduleDir` | `string` | `undefined` | Subdirectory name for storing modular type files, after setting, modular type files will be generated to `${outputDir}/${moduleDir}` directory |
| `typeNameGenerator` | `(url: string) => string` | Default rule | Custom type naming rule function, generates type name based on URL |
| `cacheSize` | `number` | `100` | LRU cache size, limits the maximum number of API type records to avoid excessive memory usage |
| `responsePath` | `string \| ((data: any) => any)` | `undefined` | Specifies the path to extract types from API responses (e.g., 'result.records'), generates type definitions only for the specified path or custom response path extraction function |

## 🎨 Type Generation Rules
1. **Type Naming**: Generated based on the request URL, with the default rules:
    - Remove the domain part: `https://api.example.com/user` → `user`
    - Replace special characters with underscores: `/api/user/list?page=1` → `api_user_list`
    - Final generation: `Api_${processed URL}` → `Api_api_user_list`
2. **Basic Type Mapping**:
   | JavaScript Type | TypeScript Type |
   |------------------|------------------|
   | string | string |
   | number | number |
   | boolean | boolean |
   | null | null |
   | undefined | undefined |
   | object | Recursively generate interface types |
   | array | Generate array types (e.g., `Type[]`) |
3. **Complex Types**: Automatically recursively parse nested object/array structures and generate complete type declarations.
4. **Modular Type Generation**:
   - Types for requests not matching `moduleMap` are generated into the default file (e.g., `api-types.d.ts`)
   - Types for requests matching `moduleMap` are generated into specified files (e.g., `user.d.ts`)
   - After setting `moduleDir`, modular type files are generated into the specified subdirectory
   - Types from the same module are merged into the same file
5. **Custom Type Naming**:
   - Custom type naming rules can be configured through the `typeNameGenerator` option
   - This function receives the URL parameter and returns the generated type name
   - Supports fully custom type naming to meet the naming requirements of different projects

## 🚫 Excluding URL Examples
```typescript
autoApiTypesPlugin({
  excludeUrls: [
    /^\/assets/, // Exclude requests starting with /assets
    /\.(svg|png|jpg|woff2)$/, // Exclude image/font files
    /^https?:\/\/cdn\.example\.com/, // Exclude CDN requests
    /^\/api\/health/, // Exclude health check interfaces
  ]
})
```

## 🛠️ Common Problem Solutions

### 1. Type files not updated
- Check if the request returns a valid JSON response (the response header must contain `Content-Type: application/json`)
- Confirm that the request URL is not excluded by `excludeUrls`
- Check the browser console for the "API type update notification failed" debug log
- Restart the Vite development server to ensure the plugin loads correctly

### 2. Type hints not working
- Execute the VS Code command: `TypeScript: Restart TS Server` (Ctrl+Shift+P)
- Check if `tsconfig.json` correctly includes the type file directory
- Manually open the generated `.d.ts` file to confirm the types have been correctly generated

### 3. Accidental page refresh
- The plugin has removed all logic that may trigger page refresh; if it still occurs:
    - Ensure you are using the latest version of the plugin
    - Check if any other plugins/code are triggering page refresh
    - Reduce the `debounceDelay` configuration value (e.g., 300ms)

### 4. Interception logic affects normal request execution
- The plugin uses a "clone response" approach to parse data and does not consume the original response
- If a request is abnormal, you can temporarily exclude the interface through `excludeUrls`

## 📋 Compatibility
- **Vite Version**: Supports Vite 3.x / 4.x / 5.x
- **Browser**: Supports all modern browsers (Chrome/Firefox/Safari/Edge)
- **Node Version**: Node 14+

## 📄 License
MIT License

## 📞 Feedback and Contributions
- If you have any questions or suggestions, please feel free to submit an Issue or PR
- Plugin source code address: [GitHub repository address](https://github.com/legend402/vite-plugin-auto-api-types)

## ✨ Best Practices
1. Only use this plugin in the development environment (no need to automatically generate types in the production environment)
2. After development is complete, you can submit the generated type files to the code repository for team use
3. Use it in conjunction with interface documentation tools (such as Swagger) for double security of type accuracy
4. Regularly clean up outdated type declarations to keep type files concise
