# MentionItem

`MentionItem` configures mention behavior inside the editor, such as `@user`, `#topic`, or custom business entities. Pass `mentionItemAttr` to `PowerEditor` to define candidates, filtering logic, selection callbacks, and click callbacks.

<script setup>
import { ref } from "vue";
import { useData } from "vitepress";

const viteData = useData();
const mentionLog = ref("Type @ in the editor below, then select a mention item.");

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
    { key: 3, name: "Mention Text", type: "header" },
    { key: 9, name: "", type: "divider" },
    { key: 5, name: "Deepseek", image: "https://cdn.jsdelivr.net/npm/@lobehub/icons-static-svg@latest/icons/deepseek.svg" },
    { key: 6, name: "OpenAI", image: "https://cdn.jsdelivr.net/npm/@lobehub/icons-static-svg@latest/icons/openai.svg" },
];

const mentionItemAttr = {
    mentionList: () => mentionList,
    filterFunc: (listItem, value) => {
        if (listItem.type === "header" || listItem.type === "divider") {
            return true;
        }

        if (!value) {
            return true;
        }

        return listItem.name.toLowerCase().includes(value.toLowerCase());
    },
    chooseItemCallback: (chooseItem, value) => {
        mentionLog.value = `Selected: ${chooseItem.name} (input: ${value || "empty"})`;
    },
    mentionClickCallback: (chooseItem) => {
        mentionLog.value = `Clicked mention: ${chooseItem.name}`;
    },
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

## Props

| Prop | Type | Required | Default | Description |
| :-- | :-- | :--: | :-- | :-- |
| `value` | `string` | No | - | Current input value. |
| `placeholder` | `string` | No | `Write something...` | Placeholder text. |
| `mentionList` | `array \| function` | No | `[]` | Candidate list, or a function that returns candidates. |
| `filterFunc` | `function` | No | - | Custom candidate filter. |
| `chooseItemCallback` | `function` | No | - | Called after a candidate is selected. |
| `mentionClickCallback` | `function` | No | - | Called when an inserted mention is clicked. |
| `headerForeground` | `string \| function` | No | `rgba(0, 120, 212, 1)` | Popper header foreground color. |
| `showPopper` | `boolean` | No | `false` | Whether to show the candidate popper. |
| `theme` | `'light' \| 'dark'` | No | `light` | Theme. |

## Configure In PowerEditor

`mentionList`, `filterFunc`, `chooseItemCallback`, `mentionClickCallback`, and `headerForeground` are usually passed through `mentionItemAttr` when `PowerEditor` is initialized.

```vue
<script setup>
const mentionItemAttr = {
    mentionList: () => [
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
        { key: 3, name: "Mention Text", type: "header" },
        { key: 9, name: "", type: "divider" },
        { key: 5, name: "Text1" },
        { key: 6, name: "Text2" },
    ],
    filterFunc: (listItem, value) => {
        if (listItem.type === "header" || listItem.type === "divider") {
            return true;
        }

        return listItem.name.toLowerCase().includes(value.toLowerCase());
    },
    chooseItemCallback: (chooseItem, value) => {
        console.log("chooseItemCallback", chooseItem, value);
    },
    mentionClickCallback: (chooseItem, value) => {
        console.log("mentionClickCallback", chooseItem, value);
    },
    headerForeground: () => "#0078d4",
};
</script>

<template>
    <power-editor :mention-item-attr="mentionItemAttr" />
</template>
```

## Callback Notes

`filterFunc` should stay lightweight and focused on filtering. If remote search is needed, load data in `mentionList` or cache candidate data in advance.

`chooseItemCallback` is a good place to record selection behavior, enrich business fields, or trigger follow-up actions. `mentionClickCallback` is better suited for opening detail cards, navigation, or inspecting related entities.
