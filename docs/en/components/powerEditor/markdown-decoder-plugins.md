# Markdown Decoder Plugins

`PowerEditor` includes a Markdown decoder that converts ProseMirror nodes and marks into Markdown. With `mdDecNodeFuncsPlugins` and `mdFlags`, you can override or extend how specific nodes and marks are rendered.

## How It Works

The decoder walks the ProseMirror document recursively in depth-first order. Built-in nodes use default decoder functions. You only need custom plugin functions for custom nodes or special output formats.

Plugin function names must match node names or mark names. A function can return a string, or an object with `prefix` and `suffix`.

```ts
type DecoderResult = string | {
    prefix: string;
    suffix: string;
};
```

## Custom Nodes

This example renders `blockquote` with the correct number of `>` prefixes.

```markdown
> Level one
>> Level two
>>> Level three
```

```js
blockquote(node, flags) {
    const { blockquote: level } = flags;
    let prefix = '';

    for (let i = 0; i < level; i++) {
        prefix += '>';
    }

    return `\n${prefix} `;
}
```

A `blockquote` may contain child nodes such as `paragraph` and `text`. In most cases you do not need to handle those children manually, because the decoder continues with its default recursive rules.

## Use Flags For Nesting

`flags` records whether the current node is inside specific parent nodes, and how deeply it is nested. Default flags usually look like this:

```js
const flags = {
    inline: false,
    inlineWrapper: false,
    heading: false,
    bulletList: false,
    orderedList: false,
    blockquote: false,
    powerTaskItem: false,
    powerTaskList: false,
    tableHeader: false,
    tableCell: false,
    tableRow: false,
    table: false
};
```

When traversal enters a tracked node, its flag changes from `false` to `1`. Nested nodes of the same type increment the value to `2`, `3` and so on.

## Pass Plugins To PowerEditor

```vue
<power-editor
    :md-dec-node-funcs-plugins="mdDecNodeFuncsPlugins"
    :md-flags="mdFlags"
/>
```

```js
export default {
    data() {
        return {
            mdDecNodeFuncsPlugins: {
                blockquote: (node, flags) => {
                    const { blockquote: level } = flags;
                    let prefix = '';

                    for (let i = 0; i < level; i++) {
                        prefix += '>';
                    }

                    return `\n${prefix} `;
                }
            },
            mdFlags: {
                blockquote: false
            }
        };
    }
};
```

## Custom Marks

Mark plugins follow the same rule: the function name must match the mark name. This example outputs the `color` value from `textStyle` as an HTML `font` tag.

```markdown
<font color="red">Red text</font>
```

```js
textStyle(text, mark) {
    const { color } = mark.attrs;

    return {
        prefix: `<font color="${color}">`,
        suffix: '</font>'
    };
}
```

When an object is returned, `prefix` is written before the text and `suffix` after it. This is useful for paired Markdown or HTML syntax.
