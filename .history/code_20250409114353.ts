figma.showUI(__html__, { width: 400, height: 300 });

const selection = figma.currentPage.selection[0];

if (!selection || selection.type !== "FRAME") {
  figma.closePlugin("یک فریم انتخاب نشده یا نوع آن فریم نیست.");
} else {
  const colors: any[] = [];

  for (const node of selection.children) {
    if ("fills" in node && Array.isArray(node.fills) && node.fills.length > 0) {
      const fill = node.fills[0];
      let hex = null, rgb = null, hsl = null;

      if (fill.type === "SOLID") {
        const r = fill.color.r * 255;
        const g = fill.color.g * 255;
        const b = fill.color.b * 255;
        const a = ('opacity' in fill) ? fill.opacity : fill.color.a ?? 1;

        const toHex = (v: number) => Math.round(v).toString(16).padStart(2, '0');
        hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
        rgb = `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a.toFixed(2)})`;

        // Convert RGB to HSL
        const [rNorm, gNorm, bNorm] = [r, g, b].map(v => v / 255);
        const max = Math.max(rNorm, gNorm, bNorm);
        const min = Math.min(rNorm, gNorm, bNorm);
        const delta = max - min;
        let h = 0, s = 0, l = (max + min) / 2;

        if (delta !== 0) {
          s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
          switch (max) {
            case rNorm: h = (gNorm - bNorm) / delta + (gNorm < bNorm ? 6 : 0); break;
            case gNorm: h = (bNorm - rNorm) / delta + 2; break;
            case bNorm: h = (rNorm - gNorm) / delta + 4; break;
          }
          h /= 6;
        }

        hsl = `hsla(${Math.round(h * 360)}, ${(s * 100).toFixed(0)}%, ${(l * 100).toFixed(0)}%, ${a.toFixed(2)})`;
      }

      const textNode = node.findChild(n => n.type === "TEXT") as TextNode;
      const name = textNode ? textNode.characters : `Color ${colors.length + 1}`;
      const raw = `var(--${name})`;

      const colorData: any = {
        id: node.id,
        name: name.trim(),
        raw: raw.trim()
      };

      if (hex) colorData.hex = hex;
      if (rgb) colorData.rgb = rgb;
      if (hsl) colorData.hsl = hsl;

      colors.push(colorData);
    }
  }

  const result = {
    id: selection.id,
    name: selection.name,
    colors
  };

  figma.ui.postMessage({ type: 'show-json', payload: result });
}