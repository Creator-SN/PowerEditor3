# MentionItem 提及项

`MentionItem` 用于配置编辑器里的提及能力，比如 `@用户`、`#话题` 或业务对象选择。你可以通过 `mentionItemAttr` 把候选列表、过滤逻辑、选择回调与点击回调传给 `PowerEditor`。

<script setup>
import { ref } from "vue";
import { useData } from "vitepress";

const viteData = useData();
const mentionLog = ref("在下面的编辑器里输入 @ ，然后选择一个 mention 项。");

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
        mentionLog.value = `已选择: ${chooseItem.name} (输入值: ${value || "空"})`;
    },
    mentionClickCallback: (chooseItem) => {
        mentionLog.value = `点击了 mention: ${chooseItem.name}`;
    },
    headerForeground: () => "#958DF1",
};
</script>

在下面的编辑器里输入 `@`，就能看到这组候选项直接挂在 `power-editor` 上的效果。

<power-editor
    :theme="viteData.isDark.value ? 'dark' : 'light'"
    :mention-item-attr="mentionItemAttr"
    :mobileDisplayWidth="350"
    style="width: 100%;"
/>

<p>{{ mentionLog }}</p>

## Props

| 属性                   | 类型                 | 必填  | 默认值                 | 说明                                 |
| :--------------------- | :------------------- | :---: | :--------------------- | :----------------------------------- |
| `value`                | `string`             |  否   | -                      | 当前输入值。                         |
| `placeholder`          | `string`             |  否   | `Write something...`   | 输入占位文案。                       |
| `mentionList`          | `array \| function`  |  否   | `[]`                   | 候选项列表，或返回候选项列表的函数。 |
| `filterFunc`           | `function`           |  否   | -                      | 自定义候选项过滤函数。               |
| `chooseItemCallback`   | `function`           |  否   | -                      | 选择候选项后触发。                   |
| `mentionClickCallback` | `function`           |  否   | -                      | 点击已插入的提及项时触发。           |
| `headerForeground`     | `string \| function` |  否   | `rgba(0, 120, 212, 1)` | 弹层头部前景色。                     |
| `showPopper`           | `boolean`            |  否   | `false`                | 是否显示候选弹层。                   |
| `theme`                | `'light' \| 'dark'`  |  否   | `light`                | 主题。                               |

## 在 PowerEditor 中配置

`mentionList`、`filterFunc`、`chooseItemCallback`、`mentionClickCallback` 与 `headerForeground` 通常在初始化 `PowerEditor` 时通过 `mentionItemAttr` 传入。

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

## 回调建议

`filterFunc` 只负责筛选候选项，尽量保持同步和轻量。需要远程搜索时，建议在 `mentionList` 中处理数据请求或提前缓存候选数据。

`chooseItemCallback` 适合记录选择行为、补充业务字段或触发联动；`mentionClickCallback` 更适合查看详情、打开卡片或跳转到业务对象页面。
