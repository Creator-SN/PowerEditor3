import { diffArrays } from "diff";

function dfsExpandCompute(node, result = []) {
    if (!node || typeof node !== "object") {
        return result;
    }

    result.push(node);

    if (Array.isArray(node.content)) {
        node.content.forEach((child) => {
            dfsExpandCompute(child, result);
        });
    }

    return result;
}

function computeTargetDiffResult(diff) {
    let result = []
    diff.forEach((item) => {
        if (!item.removed) {
            result.push(...item.value);
        }
    })
    return result;
}

function computeSourceDiffResult(diff) {
    let result = []
    diff.forEach((item) => {
        if (!item.added) {
            result.push(...item.value);
        }
    })
    return result;
}

function Guid() {
    return crypto.randomUUID();
}

function computeDiff(source, target) {
    let sourceFlat = dfsExpandCompute(source, []);
    let targetFlat = dfsExpandCompute(target, []);
    sourceFlat = sourceFlat.filter((item) => item.type !== "doc");
    targetFlat = targetFlat.filter((item) => item.type !== "doc");
    console.log('sourceFlat', sourceFlat);
    console.log('targetFlat', targetFlat);
    const sourceFlatStr = sourceFlat.map((item) => JSON.stringify(item));
    const targetFlatStr = targetFlat.map((item) => JSON.stringify(item));

    return diffArrays(sourceFlatStr, targetFlatStr);
}

export { dfsExpandCompute, computeDiff };
