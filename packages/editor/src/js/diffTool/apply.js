function applyTrackedGroup(editor, groupId, action) {
    const { state, view } = editor
    const { doc, schema } = state
    const markType = schema.marks.trackedChange

    if (!groupId || !markType) return false

    const deleteRanges = []
    const removeMarkRanges = []
    const clearNodeAttrPositions = []

    function shouldDelete(type) {
        if (action === 'accept') return type === 'delete'
        if (action === 'reject') return type === 'insert'
        return false
    }

    doc.descendants((node, pos) => {
        // A. 处理节点 attrs.trackedChange，例如 inlineEquation / listItem / paragraph
        const nodeChange = node.attrs?.trackedChange

        if (nodeChange?.groupId === groupId) {
            const from = pos
            const to = pos + node.nodeSize

            if (shouldDelete(nodeChange.type)) {
                deleteRanges.push({ from, to })

                // 这个节点整体要删，就不要继续深入它的子节点，避免重复删除 paragraph/listItem
                return false
            } else {
                clearNodeAttrPositions.push({ pos, node })
                // 这里不要 return false，因为你 accept insert 时，
                // listItem 和内部 paragraph 都可能带 trackedChange，需要一起清掉
            }
        }

        // B. 处理文本 mark trackedChange
        if (node.isText && node.marks?.length) {
            const mark = node.marks.find(
                m => m.type === markType && m.attrs?.groupId === groupId
            )

            if (mark) {
                const from = pos
                const to = pos + node.nodeSize

                if (shouldDelete(mark.attrs.type)) {
                    deleteRanges.push({ from, to })
                } else {
                    removeMarkRanges.push({ from, to, mark })
                }
            }
        }

        return true
    })

    let tr = state.tr

    // 很关键：从后往前处理，避免前面的删除导致后面的 pos 偏移
    deleteRanges
        .sort((a, b) => b.from - a.from)
        .forEach(({ from, to }) => {
            tr.delete(from, to)
        })

    removeMarkRanges
        .sort((a, b) => b.from - a.from)
        .forEach(({ from, to }) => {
            tr.removeMark(from, to, markType)
        })

    clearNodeAttrPositions
        .sort((a, b) => b.pos - a.pos)
        .forEach(({ pos, node }) => {
            // 注意：如果这个节点已经被 delete 覆盖了，可能位置失效。
            // 所以上面删除和清 attr 最好不要同时作用在同一个节点。
            const newAttrs = {
                ...node.attrs,
                trackedChange: null,
            }

            try {
                tr.setNodeMarkup(pos, undefined, newAttrs, node.marks)
            } catch (e) {
                // 被前面的 delete 删除掉的节点可以忽略
            }
        })

    if (!tr.docChanged) return false

    view.dispatch(tr)
    return true
}

export { applyTrackedGroup }
