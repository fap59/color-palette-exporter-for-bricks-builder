figma.showUI(__html__, { width: 400, height: 300 });

const selection = figma.currentPage.selection[0];

if (!selection || selection.type !== "FRAME") {
  figma.closePlugin("یک فریم انتخاب نشده یا نوع آن فریم نیست.");
}

function rgbToHex(rgb: RGB): string {
  const toHex = (v: number) => Math.round(v * 255).toString(16).padStart(2, '0');
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

function generateId(length = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

const groups = (selection as FrameNode).children.filter(n => n.type === "GROUP") as GroupNode[];

const variables = groups.map(group => {
  const textNode = group.children.find(n => n.type === "TEXT") as TextNode;
  const rectNode = group.children.find(n => n.type === "RECTANGLE") as RectangleNode;

  const name = textNode?.characters || "بدون‌نام";
  let value = "#000000";

  if (
    rectNode &&
    Array.isArray(rectNode.fills) &&
    rectNode.fills.length > 0 &&
    rectNode.fills[0].type === "SOLID"
  ) {
    value = rgbToHex((rectNode.fills[0] as SolidPaint).color);
  }

  return {
    id: generateId(),
    name,
    value,
    category: "ilzsve"
  };
});

figma.ui.postMessage({ type: 'show-json', payload: { variables } });
