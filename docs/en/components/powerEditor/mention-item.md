# MentionItem

`MentionItem` configures mention behavior inside the editor, such as `@user`, `#topic`, or custom business entities. Pass `mentionItemAttr` to `PowerEditor` to define candidates, filtering logic, loading state, selection callbacks, and click callbacks.

<script setup>
import { ref } from "vue";
import { useData } from "vitepress";

const viteData = useData();
const mentionLog = ref("Type @ in the editor below, then select a mention item.");
const remoteLoading = ref(false);

const mentionList = [
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
];

const mentionItemAttr = {
    mentionList: async (value, oldValue) => {
        remoteLoading.value = true;

        await new Promise((resolve) => setTimeout(resolve, 150));

        remoteLoading.value = false;
        mentionLog.value = `mentionList(value: ${value || "empty"}, oldValue: ${oldValue || "empty"})`;
        return mentionList;
    },
    filterFunc: (listItem, value, oldValue) => {
        if (listItem.type === "header" || listItem.type === "divider") {
            return true;
        }

        if (!value) {
            return true;
        }

        mentionLog.value = `filterFunc(value: ${value}, oldValue: ${oldValue || "empty"})`;
        return listItem.name.toLowerCase().includes(value.toLowerCase());
    },
    chooseItemCallback: (chooseItem, value) => {
        mentionLog.value = `Selected: ${chooseItem.name} (input: ${value || "empty"})`;
    },
    mentionClickCallback: (chooseItem, value) => {
        mentionLog.value = `Clicked mention: ${chooseItem.name} (text value: ${value || "empty"})`;
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
| `mentionList` | `array \| (value, oldValue) => array \| Promise<array>` | No | `[]` | Returns the candidate list. Supports sync and async usage. The current implementation passes the latest input `value` and previous input `oldValue`. |
| `filterFunc` | `(listItem, value, oldValue) => boolean \| Promise<boolean>` | No | `() => true` | Applies a second-pass filter to every item returned by `mentionList`. Supports sync and async usage. Usually keeps structural items like `header` and `divider`, while filtering regular entries by text or keywords. |
| `chooseItemCallback` | `(chooseItem, value) => void` | No | `() => console.log(...)` | Called after a candidate is selected. `chooseItem` is the final selected object and `value` is the current input text. |
| `mentionClickCallback` | `(chooseItem, value) => void` | No | `() => console.log(...)` | Called when the user clicks a mention node that has already been inserted into the editor. |
| `isLoading` | `() => boolean` | No | `() => true` | Controls whether the loading bar at the top of the mention popper is visible. Usually used together with an async `mentionList`. The component also combines it with its internal request `loading` state. |
| `headerForeground` | `string \| () => string` | No | `() => this.foreground` | Foreground color used by `header` items. |

## Candidate Item Shape

`mentionList` returns an array, and each object in that array represents one candidate item. Common fields are:

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

### mentionList(value, oldValue)

- `value`: latest text in the input.
- `oldValue`: previous text before the latest change.

Typical use cases:

- Local static data: return an array directly.
- Remote search: request data based on `value` and return the result.
- Incremental search: compare `value` and `oldValue` to decide whether to search again, reuse cache, or return a previous result.

```vue
const mentionItemAttr = {
    mentionList: async (value, oldValue) => {
        console.log("mentionList", { value, oldValue });
        return await fetchUsers(value);
    },
};
```

### filterFunc(listItem, value, oldValue)

- `listItem`: the candidate item currently being evaluated.
- `value`: latest text in the input.
- `oldValue`: previous text before the latest change.

Typical use cases:

- Always keep structural items such as `header` and `divider`.
- Apply local fuzzy matching to static candidates.
- Run a second pass over results from `mentionList` without triggering another remote request.

```vue
const mentionItemAttr = {
    filterFunc: (listItem, value, oldValue) => {
        if (listItem.type === "header" || listItem.type === "divider") {
            return true;
        }

        console.log("filterFunc", { value, oldValue, listItem });
        return listItem.name.toLowerCase().includes((value || "").toLowerCase());
    },
};
```

## Configure In PowerEditor

```vue
<script setup>
import { ref } from "vue";

const loading = ref(false);

const mentionItemAttr = {
    mentionList: async (value, oldValue) => {
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

        loading.value = false;
        console.log("mentionList", value, oldValue);
        return items;
    },
    filterFunc: (listItem, value, oldValue) => {
        if (listItem.type === "header" || listItem.type === "divider") {
            return true;
        }

        console.log("filterFunc", value, oldValue);
        return listItem.name.toLowerCase().includes((value || "").toLowerCase());
    },
    chooseItemCallback: (chooseItem, value) => {
        console.log("chooseItemCallback", chooseItem, value);
    },
    mentionClickCallback: (chooseItem, value) => {
        console.log("mentionClickCallback", chooseItem, value);
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

- `mentionList` is the best place for fetching, caching, and remote search.
- `filterFunc` should stay lightweight and focus on client-side filtering.
- If your candidates come from an API, keep the loading state outside the component and expose it through `isLoading`.
- For avatar-style list items, provide `image` and set `avatarImg` to `true`.
