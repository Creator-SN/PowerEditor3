# MentionItem

`MentionItem` configures mention behavior inside the editor, such as `@user`, `#topic` or custom business entities. Pass `mentionItemAttr` to `PowerEditor` to define candidates, filtering, selection callbacks and click callbacks.

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

## Configure PowerEditor

`mentionList`, `filterFunc`, `chooseItemCallback`, `mentionClickCallback` and `headerForeground` are usually passed through `mentionItemAttr` when `PowerEditor` is initialized.

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

## Callback Notes

Keep `filterFunc` lightweight and focused on filtering. For remote search, handle data loading in `mentionList` or cache candidates before filtering.

Use `chooseItemCallback` to record selection behavior or enrich business data. Use `mentionClickCallback` for detail cards, navigation or entity inspection.
