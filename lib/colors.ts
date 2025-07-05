import { Gdk } from "ags/gtk4";

export function newGdkRgba(value: string) {
  const gRgba = new Gdk.RGBA();
  return gRgba.parse(value) ? gRgba : null;
}

export function hexToRgb(value: string) {
  const gRgba = newGdkRgba(value);
  return gRgba ? gRgba.to_string() : null;
}

function asHex(n: number) {
  return Math.trunc(n).toString(16).padStart(2, "0");
}

export function gRgbaToHex(g: Gdk.RGBA) {
  const red = g.red * 255;
  const green = g.green * 255;
  const blue = g.blue * 255;

  const main = "#" + asHex(red) + asHex(green) + asHex(blue);
  return g.alpha === 1.0 ? main : main + asHex(g.alpha);
}

export function rgbToHex(value: string) {
  const gRgba = newGdkRgba(value);
  return gRgba ? gRgbaToHex(gRgba) : null;
}

export function gRgbaToHsl({ red, green, blue, alpha }: Gdk.RGBA) {
  const cmax = Math.max(red, green, blue);
  const cmin = Math.min(red, green, blue);
  const diff = cmax - cmin;

  let l = (cmax + cmin) / 2;
  let s = 0;
  let h = 0;

  if (diff != 0) {
    s = diff / (1 - Math.abs(2 * l - 1));

    switch (cmax) {
      case red:
        h = ((green - blue) / diff) % 6;
        break;
      case green:
        h = (blue - green) / diff + 2;
        break;
      default:
        h = (red - green) / diff + 4;
        break;
    }

    h = Math.round(h * 60);
    if (h < 0) h += 360;

    s = Math.round(+(s * 100).toFixed(1));
  }

  l = Math.round(+(l * 100).toFixed(1));

  return alpha === 1.0
    ? `hsl(${h},${s}%,${l}%)`
    : `hsla(${h},${s}%,${l}%,${alpha})`;
}

export function hexToHsl(value: string) {
  const gRgba = newGdkRgba(value);
  return gRgba ? gRgbaToHsl(gRgba) : null;
}
