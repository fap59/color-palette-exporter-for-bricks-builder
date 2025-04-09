"use strict";
figma.showUI(__html__, { width: 400, height: 300 });
const selection = figma.currentPage.selection[0];
if (!selection || selection.type !== "FRAME") {
    figma.closePlugin("یک فریم انتخاب نشده یا نوع آن فریم نیست.");
}
function rgbToHex(rgb) {
    const toHex = (v) => Math.round(v * 255).toString(16).padStart(2, '0');
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}
function generateId(length = 6) {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}
const groups = selection.children.filter(n => n.type === "GROUP");
const variables = groups.map(group => {
    const textNode = group.children.find(n => n.type === "TEXT");
    const rectNode = group.children.find(n => n.type === "RECTANGLE");
    const name = (textNode === null || textNode === void 0 ? void 0 : textNode.characters) || "بدون‌نام";
    let value = "#000000";
    if (rectNode &&
        Array.isArray(rectNode.fills) &&
        rectNode.fills.length > 0 &&
        rectNode.fills[0].type === "SOLID") {
        value = rgbToHex(rectNode.fills[0].color);
    }
    return {
        id: generateId(),
        name,
        value,
        category: "ilzsve"
    };
});
figma.ui.postMessage({ type: 'show-json', payload: { variables } });
