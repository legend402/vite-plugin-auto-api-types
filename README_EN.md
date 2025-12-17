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
      debounceDelay: 500 // Debounce delay (ms), default: 500
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
| `typeFileName` | `string` | `api-types.d.ts` | Generated type declaration file name |
| `debounceDelay` | `number` | `500` | Debounce delay (ms), to avoid frequent file writing caused by multiple requests in a short time |

## 🎨 Type Generation Rules
1. **Type Naming**: Generated based on the request URL, with the following rules:
    - Remove the domain part: `https://api.example.com/user` → `user`
    - Replace special characters with underscores: `/api/user/list?page=1` → `api_user_list_page_1`
    - Final generation: `Api_${processed URL}` → `Api_api_user_list_page_1`
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
- Plugin source code address: [GitHub repository address] (can be replaced with the actual repository address)

## ✨ Best Practices
1. Only use this plugin in the development environment (no need to automatically generate types in the production environment)
2. After development is complete, you can submit the generated type files to the code repository for team use
3. Use it in conjunction with interface documentation tools (such as Swagger) for double security of type accuracy
4. Regularly clean up outdated type declarations to keep type files concise
