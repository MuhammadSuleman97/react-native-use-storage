# react-native-use-storage

> Type-safe storage hooks for React Native — works with AsyncStorage, MMKV, or any key-value backend.

```bash
npm install react-native-use-storage
```

---

## Quick Start

```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Storage, useStorage } from 'react-native-use-storage';

const storage = new Storage(AsyncStorage);

function Settings() {
  const [theme, setTheme] = useStorage(storage, 'theme', 'light');
  // ^ typed as string, auto-persisted
}
```

Works with **MMKV** too:
```tsx
import { MMKV } from 'react-native-mmkv';
const storage = new Storage(new MMKV());
const [token, setToken] = useStorage(storage, 'auth_token', '');
```

---

## API

### `Storage` class

```ts
const storage = new Storage(adapter);
await storage.get('key', fallback);
await storage.set('key', value);
await storage.remove('key');
storage.subscribe('key', callback); // returns unsubscribe
```

### `useStorage(storage, key, fallback)`

React hook — reads from storage, writes on change, subscribes to external updates.

```tsx
const [value, setValue] = useStorage(storage, 'key', defaultValue);
```

### `createNamespacedStorage(storage, namespace)`

Prefixes all keys with a namespace.

```ts
const user = createNamespacedStorage(storage, 'user');
await user.set('name', 'John');  // stored as 'user:name'
```

### `StorageAdapter` interface

Implement to support any backend:
```ts
interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}
```

---

## Features

- ✅ Fully typed — no `any`, no casting
- ✅ JSON serialization handled automatically
- ✅ Real-time sync across tabs/components
- ✅ Works with AsyncStorage, MMKV, or custom adapters
- ✅ Namespacing for modular storage
- ✅ Zero dependencies (bring your own storage engine)
- ✅ < 2KB gzipped

---

## License

MIT © [Muhammad Suleman](https://github.com/MuhammadSuleman97)
