# MentionItem 提及项

`MentionItem` 用于配置编辑器中的提及能力，例如 `@用户`、`#话题` 或业务对象选择。你可以通过 `mentionItemAttr` 将候选列表、过滤逻辑、选择回调与点击回调传入 `PowerEditor`。

## Props

| 属性 | 类型 | 必填 | 默认值 | 说明 |
| :-- | :-- | :--: | :-- | :-- |
| `value` | `string` | 否 | - | 当前输入值。 |
| `placeholder` | `string` | 否 | `Write something...` | 输入占位文案。 |
| `mentionList` | `array \| function` | 否 | `[]` | 候选项列表，或返回候选项列表的函数。 |
| `filterFunc` | `function` | 否 | - | 自定义候选项过滤函数。 |
| `chooseItemCallback` | `function` | 否 | - | 选择候选项后触发。 |
| `mentionClickCallback` | `function` | 否 | - | 点击已插入的提及项时触发。 |
| `headerForeground` | `string \| function` | 否 | `rgba(0, 120, 212, 1)` | 弹层头部前景色。 |
| `showPopper` | `boolean` | 否 | `false` | 是否显示候选弹层。 |
| `theme` | `'light' \| 'dark'` | 否 | `light` | 主题。 |

## 在 PowerEditor 中配置

`mentionList`、`filterFunc`、`chooseItemCallback`、`mentionClickCallback` 与 `headerForeground` 通常在初始化 `PowerEditor` 时通过 `mentionItemAttr` 传入。

```vue
<template>
    <power-editor :mention-item-attr="mentionItemAttr" />
</template>

<script>
export default {
    data() {
        return {
            mentionItemAttr: {
                mentionList: (value) => [
                    { label: 'Alice', value: 'alice' },
                    { label: 'Bob', value: 'bob' }
                ],
                filterFunc: (listItem, value) => {
                    return listItem.label.toLowerCase().includes(value.toLowerCase());
                },
                chooseItemCallback: (chooseItem, value) => {
                    console.log('chooseItemCallback', chooseItem, value);
                },
                mentionClickCallback: (chooseItem, value) => {
                    console.log('mentionClickCallback', chooseItem, value);
                },
                headerForeground: () => {
                    return '#958DF1';
                }
            }
        };
    }
};
</script>
```

## 回调建议

`filterFunc` 只负责筛选候选项，尽量保持同步和轻量。需要远程搜索时，建议在 `mentionList` 中处理数据请求或提前缓存候选数据。

`chooseItemCallback` 适合记录选择行为、补充业务字段或触发联动；`mentionClickCallback` 更适合查看详情、打开个人卡片或跳转到业务对象页面。
