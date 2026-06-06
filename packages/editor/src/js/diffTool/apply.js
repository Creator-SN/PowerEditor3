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
        const nodeChange = node.attrs?.trackedChange

        if (nodeChange?.groupId === groupId) {
            const from = pos
            const to = pos + node.nodeSize

            if (shouldDelete(nodeChange.type)) {
                deleteRanges.push({ from, to })
                return false
            }

            clearNodeAttrPositions.push({ pos })
        }

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
                    removeMarkRanges.push({ from, to })
                }
            }
        }

        return true
    })

    let tr = state.tr

    deleteRanges
        .sort((a, b) => b.from - a.from)
        .forEach(({ from, to }) => {
            const mappedFrom = tr.mapping.map(from, -1)
            const mappedTo = tr.mapping.map(to, 1)

            if (mappedFrom < mappedTo) {
                tr.delete(mappedFrom, mappedTo)
            }
        })

    removeMarkRanges
        .sort((a, b) => b.from - a.from)
        .forEach(({ from, to }) => {
            const mappedFrom = tr.mapping.map(from, -1)
            const mappedTo = tr.mapping.map(to, 1)

            if (mappedFrom < mappedTo) {
                tr.removeMark(mappedFrom, mappedTo, markType)
            }
        })

    clearNodeAttrPositions
        .sort((a, b) => b.pos - a.pos)
        .forEach(({ pos }) => {
            const mapped = tr.mapping.mapResult(pos, -1)

            if (mapped.deleted) {
                return
            }

            const currentNode = tr.doc.nodeAt(mapped.pos)

            if (!currentNode?.attrs?.trackedChange) {
                return
            }

            if (currentNode.attrs.trackedChange.groupId !== groupId) {
                return
            }

            const newAttrs = {
                ...currentNode.attrs,
                trackedChange: null,
            }

            try {
                tr.setNodeMarkup(mapped.pos, undefined, newAttrs, currentNode.marks)
            } catch (e) {
                // ignore nodes already invalidated by earlier transaction steps
            }
        })

    if (!tr.docChanged) return false

    view.dispatch(tr)
    return true
}

export { applyTrackedGroup }
