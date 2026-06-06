import { Mark, mergeAttributes } from "@tiptap/core";

function buildTrackedChangeDataAttributes(attrs = {}) {
    const dataAttrs = {};

    if (attrs.id) {
        dataAttrs["data-suggestion-id"] = attrs.id;
    }

    if (attrs.type) {
        dataAttrs["data-suggestion-type"] = attrs.type;
    }

    if (attrs.groupId) {
        dataAttrs["data-suggestion-group-id"] = attrs.groupId;
    }

    if (attrs.userId) {
        dataAttrs["data-user-id"] = attrs.userId;
    }

    if (attrs.createdAt) {
        dataAttrs["data-created-at"] = attrs.createdAt;
    }

    return dataAttrs;
}

function parseTrackedChangeDataAttributes(element) {
    const id = element.getAttribute("data-suggestion-id");
    const type = element.getAttribute("data-suggestion-type");
    const groupId = element.getAttribute("data-suggestion-group-id");
    const userId = element.getAttribute("data-user-id");
    const createdAt = element.getAttribute("data-created-at");

    if (!id && !type && !groupId && !userId && !createdAt) {
        return null;
    }

    return {
        id: id || null,
        type: type || "insert",
        groupId: groupId || null,
        userId: userId || null,
        createdAt: createdAt || null,
    };
}

function buildTrackedChangeNodeAttribute() {
    return {
        default: null,
        parseHTML: (element) => parseTrackedChangeDataAttributes(element),
        renderHTML: (attrs) => {
            if (!attrs.trackedChange) return {};
            return buildTrackedChangeDataAttributes(attrs.trackedChange);
        },
    };
}

function getTrackedChangeClassName(trackedChange) {
    if (!trackedChange?.type) {
        return "";
    }

    return `tracked-change tracked-change-${trackedChange.type}`;
}

export const TrackedChange = Mark.create({
    name: "trackedChange",

    addOptions() {
        return {
            HTMLAttributes: {},
        };
    },

    addAttributes() {
        return {
            id: {
                default: null,
                parseHTML: (element) => element.getAttribute("data-suggestion-id"),
                renderHTML: (attrs) => {
                    if (!attrs.id) return {}
                    return {
                        "data-suggestion-id": attrs.id,
                    };
                },
            },

            type: {
                default: "insert",
                parseHTML: (element) => element.getAttribute("data-suggestion-type"),
                renderHTML: (attrs) => {
                    return {
                        "data-suggestion-type": attrs.type,
                    };
                },
            },

            groupId: {
                default: null,
                parseHTML: (element) => element.getAttribute("data-suggestion-group-id"),
                renderHTML: (attrs) => {
                    if (!attrs.groupId) return {}
                    return {
                        "data-suggestion-group-id": attrs.groupId,
                    };
                },
            },

            userId: {
                default: null,
                parseHTML: (element) => element.getAttribute("data-user-id"),
                renderHTML: (attrs) => {
                    if (!attrs.userId) return {}
                    return {
                        "data-user-id": attrs.userId,
                    };
                },
            },

            createdAt: {
                default: null,
                parseHTML: (element) => element.getAttribute("data-created-at"),
                renderHTML: (attrs) => {
                    if (!attrs.createdAt) return {}
                    return {
                        "data-created-at": attrs.createdAt,
                    };
                },
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: "span[data-suggestion-id]",
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        const type = HTMLAttributes["data-suggestion-type"];

        return [
            "span",
            mergeAttributes(
                this.options.HTMLAttributes,
                HTMLAttributes,
                {
                    class: `tracked-change tracked-change-${type}`,
                },
            ),
            0,
        ];
    },
});

export {
    buildTrackedChangeDataAttributes,
    buildTrackedChangeNodeAttribute,
    getTrackedChangeClassName,
    parseTrackedChangeDataAttributes,
};
