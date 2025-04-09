// نمایش UI پلاگین
figma.showUI(__html__, { width: 400, height: 300 });

// بررسی اینکه یک فریم یا گروه انتخاب شده باشد
const selection = figma.currentPage.selection[0];

if (!selection || (selection.type !== "FRAME" && selection.type !== "GROUP")) {
  figma.closePlugin("یک فریم یا گروه انتخاب نشده است.");
  return;
}

// تابع برای تبدیل مقدار رنگ به فرمت HEX
const toHex = (v: number) => Math.round(v).toString(16).padStart(2, '0');

// تابع برای استخراج اطلاعات رنگ‌ها و نوشتن خروجی JSON
const extractPalette = (node: BaseNode) => {
  const result = {
    id: "czfevt", // شناسه ثابت برای پالت رنگی
    name: "main-palette", // نام پالت
    colors: [] as Array<{ raw: string, id: string, name: string, hex?: string, rgb?: string, hsl?: string }>
  };

  // بررسی اینکه آیا گره دارای فرزندان است
  if (node.type === "FRAME" || node.type === "GROUP") {
    const textNode = (node.children || []).find(n => n.type === "TEXT") as TextNode;

    // در صورتی که گره متنی یافت شود، متن آن را در raw و name قرار می‌دهیم
    if (textNode) {
      const colorData = {
        raw: textNode.characters,
        id: textNode.id,
        name: textNode.name // یا نام متنی که می‌خواهید
      };
      result.colors.push(colorData);
    }

    // جستجوی رنگ‌ها از داخل گره‌ها
    const colorNodes = (node.children || []).filter(n => n.type === "RECTANGLE" || n.type === "ELLIPSE");

    colorNodes.forEach((colorNode: any) => {
      const fills = colorNode.fills;
      if (fills && fills.length > 0) {
        const color = fills[0];
        if (color.type === "SOLID") {
          const colorInfo = {
            raw: color.color.toString(),
            id: colorNode.id,
            name: colorNode.name,
            hex: rgbToHex(color.color),
            rgb: `rgba(${Math.round(color.color.r * 255)}, ${Math.round(color.color.g * 255)}, ${Math.round(color.color.b * 255)}, 1)`,
            hsl: rgbToHsl(color.color)
          };
          result.colors.push(colorInfo);
        }
      }
    });
  }

  return result;
};

// تابع برای تبدیل RGB به Hex
const rgbToHex = (color: RGB): string => {
  return `#${toHex(color.r * 255)}${toHex(color.g * 255)}${toHex(color.b * 255)}`;
};

// تابع برای تبدیل RGB به HSL
const rgbToHsl = (color: RGB): string => {
  const r = color.r, g = color.g, b = color.b;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }

  return `hsla(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%, 1)`;
};

// استخراج پالت رنگ‌ها از فریم یا گروه انتخاب‌شده
const result = extractPalette(selection);

// ارسال داده‌های JSON به UI پلاگین
figma.ui.postMessage({ type: 'show-json', payload: result });

// بستن پلاگین
figma.closePlugin();
