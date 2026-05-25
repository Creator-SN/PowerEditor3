import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { VueNodeViewRenderer } from "@tiptap/vue-3";

import codeBlockX from "../source/codeBlockX.vue";

function getLanguageFromElement(element, languageClassPrefix = "language-") {
    if (!element) {
        return null;
    }

    const attrLanguage =
        element.getAttribute?.("data-language") ||
        element.getAttribute?.("language") ||
        element.getAttribute?.("lang");

    if (attrLanguage) {
        return attrLanguage;
    }

    if (!languageClassPrefix) {
        return null;
    }

    const classNames = [...(element.classList || [])];
    const languageClass = classNames.find((className) =>
        className.startsWith(languageClassPrefix),
    );

    if (!languageClass) {
        return null;
    }

    return languageClass.replace(languageClassPrefix, "") || null;
}

function readCodeText(element) {
    if (!element) {
        return "";
    }

    const pieces = [];
    const blockTags = new Set(["DIV", "P"]);

    const walk = (node) => {
        if (!node) {
            return;
        }

        if (node.nodeType === Node.TEXT_NODE) {
            pieces.push(node.nodeValue || "");
            return;
        }

        if (node.nodeType !== Node.ELEMENT_NODE) {
            return;
        }

        if (node.tagName === "BR") {
            pieces.push("\n");
            return;
        }

        const startLength = pieces.length;
        Array.from(node.childNodes).forEach(walk);

        if (
            blockTags.has(node.tagName) &&
            pieces.length > startLength &&
            pieces[pieces.length - 1] !== "\n"
        ) {
            pieces.push("\n");
        }
    };

    walk(element);

    return pieces.join("").replace(/\r\n?/g, "\n").replace(/\n$/, "");
}

export default CodeBlockLowlight.extend({
    transformPastedHTML(html) { // 处理粘贴的代码块, 一般粘贴的代码会套娃两层pre.
        if (!html || typeof DOMParser === "undefined") {
            return html;
        }

        const parser = new DOMParser();
        const document = parser.parseFromString(html, "text/html");
        const { languageClassPrefix } = this.options;

        document
            .querySelectorAll("[hidden], [aria-hidden='true'], script, style, meta, link")
            .forEach((node) => node.remove());

        document.querySelectorAll("pre").forEach((preElement) => {
            const nestedPre = preElement.querySelector("pre code")?.closest("pre");

            if (!nestedPre || nestedPre === preElement) {
                return;
            }

            const codeElement = nestedPre.querySelector("code");
            const codeText = readCodeText(codeElement || nestedPre);
            const language =
                getLanguageFromElement(codeElement, languageClassPrefix) ||
                getLanguageFromElement(nestedPre, languageClassPrefix);

            const normalizedPre = document.createElement("pre");
            const normalizedCode = document.createElement("code");

            if (language && languageClassPrefix) {
                normalizedCode.classList.add(`${languageClassPrefix}${language}`);
            }

            normalizedCode.textContent = codeText;
            normalizedPre.appendChild(normalizedCode);
            preElement.replaceWith(normalizedPre);
        });

        document.querySelectorAll("pre").forEach((preElement) => {
            const codeElement = preElement.querySelector("code");
            const language =
                getLanguageFromElement(codeElement, languageClassPrefix) ||
                getLanguageFromElement(preElement, languageClassPrefix);

            if (
                language &&
                codeElement &&
                languageClassPrefix &&
                ![...codeElement.classList].some((className) =>
                    className.startsWith(languageClassPrefix),
                )
            ) {
                codeElement.classList.add(`${languageClassPrefix}${language}`);
            }
        });

        return document.body.innerHTML;
    },
    addNodeView() {
        return VueNodeViewRenderer(codeBlockX);
    },
});
