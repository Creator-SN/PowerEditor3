# Markdown Decoder Plugins

`PowerEditor` 内置 Markdown 解码器，可以将编辑器中的 ProseMirror 节点和标记转换为 Markdown。通过 `mdDecNodeFuncsPlugins` 与 `mdFlags`，你可以覆盖或补充某些节点、标记的输出方式。

## 工作方式

解码器会按深度优先顺序递归遍历 ProseMirror 文档。普通节点会使用默认解码函数；你只需要为自定义节点或需要特殊格式的节点编写插件函数。

插件函数名需要与节点名或标记名保持一致。函数可以返回字符串，也可以返回包含 `prefix` 与 `suffix` 的对象。

```ts
type DecoderResult = string | {
    prefix: string;
    suffix: string;
};
```

## 自定义节点

下面示例为 `blockquote` 输出对应层级的 `>` 前缀。

```markdown
> 一级引用
>> 二级引用
>>> 三级引用
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

`PowerEditor` 的 `blockquote` 中可能包含 `paragraph`、`text` 等子节点。通常你不需要手动处理这些子节点，解码器会继续使用默认规则完成递归转换。

## 使用 flags 识别层级

`flags` 用来记录当前节点位于哪些父级节点之内，以及嵌套层级是多少。默认值通常如下：

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

当遍历进入某个被 flags 记录的节点时，对应字段会从 `false` 变成 `1`；如果继续进入同类嵌套节点，则递增为 `2`、`3`，依此类推。

## 传入 PowerEditor

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

## 自定义标记

标记插件同样遵循“函数名等于标记名”的规则。下面示例将 `textStyle` 中的 `color` 输出为 HTML `font` 标签：

```markdown
<font color="red">红色文字</font>
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

当返回对象时，`prefix` 会写在文本前，`suffix` 会写在文本后，适合处理成对包裹的 Markdown 或 HTML 语法。
