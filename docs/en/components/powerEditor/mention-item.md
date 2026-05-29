# MentionItem

`MentionItem` configures mention behavior inside the editor, such as `@user`, `#topic`, or custom business entities. Pass `mentionItemAttr` to `PowerEditor` to define candidates, external search logic, loading state, selection callbacks, and click callbacks.

<script setup>
import { ref } from "vue";
import { useData } from "vitepress";

const viteData = useData();
const mentionLog = ref("Type @ in the editor below, then select a mention item.");
const remoteLoading = ref(false);

const mentionSource = ref([
    { key: 0, name: "Mention Color", type: "header" },
    {
        key: 1,
        name: "Blue",
        color: "rgba(85, 153, 202, 1)",
        icon: "WindowsLogo",
        iconColor: "rgba(85, 153, 202, 1)",
    },
    {
        key: 2,
        name: "Purple",
        color: "#958DF1",
        icon: "DelveAnalyticsLogo",
        iconColor: "#958DF1",
    },
    { key: 3, name: "AI Models", type: "header" },
    { key: 9, name: "", type: "divider" },
    {
        key: 5,
        name: "DeepSeek",
        image: "https://cdn.jsdelivr.net/npm/@lobehub/icons-static-svg@latest/icons/deepseek.svg",
        imageWidth: "18px",
    },
    {
        key: 6,
        name: "OpenAI",
        image: "https://cdn.jsdelivr.net/npm/@lobehub/icons-static-svg@latest/icons/openai.svg",
        imageWidth: "18px",
    },
    {
        key: 7,
        name: "Alever",
        color: "#2563eb",
        image: "https://api.dicebear.com/9.x/initials/svg?seed=Alever",
        avatarImg: true,
    },
]);

const mentionItemAttr = {
    mentionList: () => mentionSource.value,
    filterFunc: async (value, oldValue) => {
        remoteLoading.value = true;

        await new Promise((resolve) => setTimeout(resolve, 150));

        const keyword = (value || "").toLowerCase();
        mentionSource.value = [
            { key: 0, name: "Mention Color", type: "header" },
            {
                key: 1,
                name: "Blue",
                color: "rgba(85, 153, 202, 1)",
                icon: "WindowsLogo",
                iconColor: "rgba(85, 153, 202, 1)",
            },
            {
                key: 2,
                name: "Purple",
                color: "#958DF1",
                icon: "DelveAnalyticsLogo",
                iconColor: "#958DF1",
            },
            { key: 3, name: "AI Models", type: "header" },
            { key: 9, name: "", type: "divider" },
            {
                key: 5,
                name: "DeepSeek",
                image: "https://cdn.jsdelivr.net/npm/@lobehub/icons-static-svg@latest/icons/deepseek.svg",
                imageWidth: "18px",
            },
            {
                key: 6,
                name: "OpenAI",
                image: "https://cdn.jsdelivr.net/npm/@lobehub/icons-static-svg@latest/icons/openai.svg",
                imageWidth: "18px",
            },
            {
                key: 7,
                name: "Alever",
                color: "#2563eb",
                image: "https://api.dicebear.com/9.x/initials/svg?seed=Alever",
                avatarImg: true,
            },
        ].filter((item) => {
            if (item.type === "header" || item.type === "divider") {
                return true;
            }

            return !keyword || item.name.toLowerCase().includes(keyword);
        });

        remoteLoading.value = false;
        mentionLog.value = `filterFunc(value: ${value || "empty"}, oldValue: ${oldValue || "empty"})`;
    },
    chooseItemCallback: (chooseItem, value) => {
        mentionLog.value = `Selected: ${chooseItem.name} (input: ${value || "empty"})`;
    },
    mentionClickCallback: (chooseItem, value) => {
        mentionLog.value = `Clicked mention: ${chooseItem.name} (text value: ${value || "empty"})`;
    },
    placeholder: (currentItem, value) => {
        if (currentItem?.name) {
            return `Type for ${currentItem.name}`;
        }

        return value ? "Keep typing to search" : "Type to search mentions";
    },
    isLoading: () => remoteLoading.value,
    headerForeground: () => "#958DF1",
};
</script>

Type `@` in the editor below to see the mention list attached directly to `power-editor`.

<power-editor
    :theme="viteData.isDark.value ? 'dark' : 'light'"
    :mention-item-attr="mentionItemAttr"
    :mobileDisplayWidth="350"
    style="width: 100%;"
/>

<p>{{ mentionLog }}</p>

## mentionItemAttr Options

| Option | Type | Required | Default | Description |
| :-- | :-- | :--: | :-- | :-- |
| `mentionList` | `array \| () => array` | No | `[]` | Returns the candidate list that should currently be rendered. It does not perform filtering itself and usually just exposes data already prepared outside the component. |
| `filterFunc` | `(value, oldValue) => void \| Promise<void>` | No | `() => true` | Acts as the external search or filtering entry point. The component calls it whenever the input changes, and you can request data, update cache, or rebuild the list here before `mentionList()` returns the new result. |
| `chooseItemCallback` | `(chooseItem, value) => void` | No | `() => console.log(...)` | Called after a candidate is selected. `chooseItem` is the final selected object and `value` is the current input text. |
| `mentionClickCallback` | `(chooseItem, value) => void` | No | `() => console.log(...)` | Called when the user clicks a mention node that has already been inserted into the editor. |
| `placeholder` | `(currentItem, value) => string` | No | `() => "mention"` | Returns the input placeholder dynamically. The component also syncs the result back to the node's `placeholder` attribute. |
| `isLoading` | `() => boolean` | No | `() => true` | Controls whether the loading bar at the top of the mention popper is visible. Usually used together with an async `mentionList`. The component also combines it with its internal request `loading` state. |
| `headerForeground` | `string \| () => string` | No | `() => this.foreground` | Foreground color used by `header` items. |

## Candidate Item Shape

`mentionList()` returns an array, and each object in that array represents one candidate item. Common fields are:

| Field | Type | Required | Description |
| :-- | :-- | :--: | :-- |
| `key` | `string \| number` | Recommended | Unique identifier for the item. It is recommended to always provide one. |
| `name` | `string \| () => string` | Yes | Display text in the list. It is also used as the default inserted value after selection. |
| `type` | `string \| () => string` | No | Special item type. Common values are `header` and `divider`. `header` uses `headerForeground`, and `divider` is typically used only for grouping. |
| `color` | `string` | No | Mention text color. |
| `icon` | `string \| () => string` | No | Fluent UI icon name, such as `WindowsLogo`. |
| `iconColor` | `string \| () => string` | No | Icon color. |
| `image` | `string \| () => string` | No | Image URL shown on the left side of the candidate item. It is also used when rendering the selected mention. |
| `imageWidth` | `string` | No | Width of the list image, such as `18px` or `24px`. The default layout is used when omitted. |
| `avatarImg` | `boolean \| () => boolean` | No | When `true`, the list `image` is rendered as a circular avatar. |

Additional notes:

- `name`, `type`, `icon`, `iconColor`, `image`, and `avatarImg` can be provided as plain values or functions. The component resolves those functions during rendering.
- After selection, the entire `chooseItem` object is stored on the node, so `mentionClickCallback` receives the same object when the mention is clicked later.
- `divider` items are meant for structure only and should generally not carry business logic.

## Function Parameters

### mentionList()

Typical use cases:

- Local static data: return an array directly.
- External state management: return the list currently stored in a `ref`, store, or cache.
- Combined with `filterFunc`: let `filterFunc` finish the external search first, then expose the final result through `mentionList()`.

```vue
const mentionSource = ref([]);

const mentionItemAttr = {
    mentionList: () => mentionSource.value,
};
```

### filterFunc(value, oldValue)

- `value`: latest text in the input.
- `oldValue`: previous text before the latest change.

Typical use cases:

- Trigger an external search based on the current input.
- Update candidate data stored in a `ref`, store, or cache.
- Keep all filtering logic outside the component, while the component only renders what `mentionList()` returns.

```vue
const mentionSource = ref([]);

const mentionItemAttr = {
    mentionList: () => mentionSource.value,
    filterFunc: async (value, oldValue) => {
        const result = await fetchUsers(value);

        console.log("filterFunc", { value, oldValue });
        mentionSource.value = result;
    },
};
```

### placeholder(currentItem, value)

- `currentItem`: the candidate object currently stored on the node. It is usually an empty object at first, and becomes the selected item after the user picks one.
- `value`: latest text in the input.

Typical use cases:

- Show different helper text for different mention entity types.
- Provide clearer guidance before the user starts typing.
- Switch placeholder text by business context, such as "Type a name to search members" or "Type an ID to search tickets".

```vue
const mentionItemAttr = {
    placeholder: (currentItem, value) => {
        if (currentItem?.name) {
            return `Type for ${currentItem.name}`;
        }

        return value ? "Keep typing to search" : "Type to search mentions";
    },
};
```

## Configure In PowerEditor

```vue
<script setup>
import { ref } from "vue";

const loading = ref(false);
const mentionSource = ref([]);

const mentionItemAttr = {
    mentionList: () => mentionSource.value,
    filterFunc: async (value, oldValue) => {
        loading.value = true;

        const items = [
            { key: 0, name: "Mention Color", type: "header" },
            {
                key: 1,
                name: "Blue",
                color: "rgba(0, 120, 212, 1)",
                icon: "WindowsLogo",
                iconColor: "rgba(0, 153, 204, 1)",
            },
            {
                key: 2,
                name: "Purple",
                color: "#958DF1",
                icon: "DelveAnalyticsLogo",
                iconColor: "#958DF1",
            },
            { key: 3, name: "Teams", type: "header" },
            { key: 9, name: "", type: "divider" },
            {
                key: 5,
                name: "Power Editor",
                image: "https://api.dicebear.com/9.x/shapes/svg?seed=PowerEditor",
                imageWidth: "20px",
            },
            {
                key: 6,
                name: "Alever",
                image: "https://api.dicebear.com/9.x/initials/svg?seed=Alever",
                avatarImg: true,
                color: "#2563eb",
            },
        ];

        const keyword = (value || "").toLowerCase();
        mentionSource.value = items.filter((item) => {
            if (item.type === "header" || item.type === "divider") {
                return true;
            }

            return !keyword || item.name.toLowerCase().includes(keyword);
        });

        loading.value = false;
        console.log("filterFunc", value, oldValue);
    },
    chooseItemCallback: (chooseItem, value) => {
        console.log("chooseItemCallback", chooseItem, value);
    },
    mentionClickCallback: (chooseItem, value) => {
        console.log("mentionClickCallback", chooseItem, value);
    },
    placeholder: (currentItem, value) => {
        if (currentItem?.name) {
            return `Type for ${currentItem.name}`;
        }

        return value ? "Keep typing to search" : "Type to search members";
    },
    isLoading: () => loading.value,
    headerForeground: () => "#0078d4",
};
</script>

<template>
    <power-editor :mention-item-attr="mentionItemAttr" />
</template>
```

## Usage Notes

- `mentionList` works best as a result reader that simply returns the data that should currently be displayed.
- `filterFunc` is the right place for external search, request orchestration, filtering, and cache updates.
- `placeholder` works well when the helper text should react to the current mention type, selected item, or input state.
- If your candidates come from an API, keep the loading state outside the component and expose it through `isLoading`.
- For avatar-style list items, provide `image` and set `avatarImg` to `true`.
