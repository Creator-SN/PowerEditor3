# MentionItem 提及项

`MentionItem` 用于配置编辑器里的提及能力，比如 `@用户`、`#话题` 或业务对象选择。你可以通过 `mentionItemAttr` 把候选列表、外部搜索逻辑、加载状态、选择回调与点击回调传给 `PowerEditor`。

<script setup>
import { ref } from "vue";
import { useData } from "vitepress";

const viteData = useData();
const mentionLog = ref("在下面的编辑器里输入 @，然后选择一个 mention 项。");
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
        mentionLog.value = `filterFunc(value: ${value || "空"}, oldValue: ${oldValue || "空"})`;
    },
    chooseItemCallback: (chooseItem, value) => {
        mentionLog.value = `已选择: ${chooseItem.name} (输入值: ${value || "空"})`;
    },
    mentionClickCallback: (chooseItem, value) => {
        mentionLog.value = `点击了 mention: ${chooseItem.name} (文本值: ${value || "空"})`;
    },
    placeholder: (currentItem, value) => {
        if (currentItem?.name) {
            return `请输入 ${currentItem.name}`;
        }

        return value ? "继续输入以搜索" : "输入以搜索 mention";
    },
    isLoading: () => remoteLoading.value,
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

## mentionItemAttr 配置项

| 属性 | 类型 | 必填 | 默认值 | 说明 |
| :-- | :-- | :--: | :-- | :-- |
| `mentionList` | `array \| () => array` | 否 | `[]` | 返回当前需要展示的候选项列表。这里不参与过滤，通常只负责把外部已经准备好的数据直接交给组件渲染。 |
| `filterFunc` | `(value, oldValue) => void \| Promise<void>` | 否 | `() => true` | 作为外部搜索或过滤入口。组件在输入变化时调用它，你可以在这里请求接口、更新缓存或重算列表，然后让 `mentionList()` 返回新的结果。 |
| `chooseItemCallback` | `(chooseItem, value) => void` | 否 | `() => console.log(...)` | 用户选中候选项后触发。`chooseItem` 是最终选中的对象，`value` 是当前输入值。 |
| `mentionClickCallback` | `(chooseItem, value) => void` | 否 | `() => console.log(...)` | 点击已经插入到编辑器中的 mention 节点时触发。 |
| `placeholder` | `(currentItem, value) => string` | 否 | `() => "mention"` | 动态返回输入框占位文案。组件会把结果同步回节点的 `placeholder` 属性。 |
| `isLoading` | `() => boolean` | 否 | `() => true` | 控制候选弹层顶部 loading 条是否显示。通常配合异步 `mentionList` 使用。组件内部请求中的 `loading` 与这个返回值会一起参与显示判断。 |
| `headerForeground` | `string \| () => string` | 否 | `() => this.foreground` | `header` 类型候选项使用的前景色。 |

## 候选项数据结构

`mentionList()` 返回的是一个数组，数组里的每个对象都代表一个候选项。常用字段如下：

| 字段 | 类型 | 必填 | 说明 |
| :-- | :-- | :--: | :-- |
| `key` | `string \| number` | 建议 | 候选项唯一标识，建议始终提供。 |
| `name` | `string \| () => string` | 是 | 列表里显示的文本，同时也是选中后写回节点的默认值。 |
| `type` | `string \| () => string` | 否 | 特殊类型。常见值有 `header` 和 `divider`。`header` 会使用 `headerForeground`，`divider` 通常只用来分组。 |
| `color` | `string` | 否 | mention 文本颜色。 |
| `icon` | `string \| () => string` | 否 | Fluent UI 图标名，例如 `WindowsLogo`。 |
| `iconColor` | `string \| () => string` | 否 | 图标颜色。 |
| `image` | `string \| () => string` | 否 | 候选项左侧图片地址，也会用于已选中 mention 的展示。 |
| `imageWidth` | `string` | 否 | 列表中 `image` 的宽度，例如 `18px`、`24px`。未传时使用默认布局。 |
| `avatarImg` | `boolean \| () => boolean` | 否 | 设为 `true` 时，列表里的 `image` 会按头像样式渲染为圆形。 |

补充说明：

- `name`、`type`、`icon`、`iconColor`、`image`、`avatarImg` 支持直接传值，也支持传函数，组件会在渲染时自动执行。
- 选中候选项后，节点里保存的是整个 `chooseItem` 对象，因此点击已插入的 mention 时，`mentionClickCallback` 拿到的也是这份对象。
- `divider` 项通常只作为结构占位，不建议依赖它的 `name` 做业务逻辑。

## 函数参数说明

### mentionList()

适用场景：

- 本地静态列表：直接返回数组。
- 外部状态管理：返回 `ref`、store 或缓存里当前已经准备好的列表。
- 配合 `filterFunc`：由 `filterFunc` 先完成外部搜索，再由 `mentionList()` 暴露最终结果。

```vue
const mentionSource = ref([]);

const mentionItemAttr = {
    mentionList: () => mentionSource.value,
};
```

### filterFunc(value, oldValue)

- `value`：当前输入框里的最新文本。
- `oldValue`：变更前的旧文本。

适用场景：

- 根据输入值发起外部搜索。
- 更新 store、缓存或 `ref` 中的候选数据。
- 把所有过滤逻辑集中在外部，组件内部只负责展示 `mentionList()` 返回的结果。

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

- `currentItem`：当前节点里保存的候选项对象，初始时通常是空对象，选中后会变成已选项。
- `value`：当前输入框里的最新文本。

适用场景：

- 根据当前已选实体动态显示不同提示词。
- 在用户尚未输入内容时提供更明确的引导文案。
- 根据业务状态切换占位符，比如“输入姓名搜索成员”或“输入编号搜索工单”。

```vue
const mentionItemAttr = {
    placeholder: (currentItem, value) => {
        if (currentItem?.name) {
            return `请输入 ${currentItem.name}`;
        }

        return value ? "继续输入以搜索" : "输入以搜索 mention";
    },
};
```

## 在 PowerEditor 中配置

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
            return `请输入 ${currentItem.name}`;
        }

        return value ? "继续输入以搜索" : "输入以搜索成员";
    },
    isLoading: () => loading.value,
    headerForeground: () => "#0078d4",
};
</script>

<template>
    <power-editor :mention-item-attr="mentionItemAttr" />
</template>
```

## 使用建议

- `mentionList` 更适合做“结果读取器”，直接返回当前要展示的数据。
- `filterFunc` 适合做外部搜索入口，把请求、过滤、缓存更新都放在这里。
- `placeholder` 适合根据当前 mention 类型、已选项或输入状态动态调整提示文案。
- 如果你的候选项来自接口，建议把 loading 状态单独维护，再通过 `isLoading` 返回给组件。
- 如果列表项需要头像样式，传 `image` 并把 `avatarImg` 设为 `true` 即可。
