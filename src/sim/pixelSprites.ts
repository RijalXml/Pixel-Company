// Procedural 16-bit pixel art graphics renderer for INTI office

export interface DrawCharacterOptions {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  skinColor: string;
  hairColor: string;
  shirtColor: string;
  pantsColor: string;
  action: 'idle' | 'typing' | 'walking' | 'carrying' | 'handing' | 'receiving' | 'celebrating' | 'thinking';
  facing: 'left' | 'right' | 'down' | 'up';
  frame: number;
  carryingDoc?: boolean;
  name?: string;
  roleTitle?: string;
  bubbleText?: string | null;
  bubbleIcon?: string | null;
  isSelected?: boolean;
}

// Draw a crisp pixel rectangle
export function drawPixelRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
}

// Draw the animated pixel employee sprite
export function drawPixelEmployee(options: DrawCharacterOptions) {
  const {
    ctx,
    x,
    y,
    skinColor,
    hairColor,
    shirtColor,
    pantsColor,
    action,
    facing,
    frame,
    carryingDoc,
    name,
    bubbleText,
    bubbleIcon,
    isSelected,
  } = options;

  ctx.save();

  // Shadow under character
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(x, y + 2, 12, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  const isLeft = facing === 'left';
  const flip = isLeft ? -1 : 1;

  // Bobbing offset for walking or idle breathing
  let bob = 0;
  if (action === 'walking' || action === 'carrying') {
    bob = Math.sin(frame * 0.3) * 2;
  } else if (action === 'typing') {
    bob = Math.sin(frame * 0.4) * 0.8;
  } else {
    bob = Math.sin(frame * 0.1) * 0.6;
  }

  const charY = y - 26 + bob;

  // Selected bracket indicator
  if (isSelected) {
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 16, charY - 14, 32, 44);

    // Corner pixel notches
    ctx.fillStyle = '#00e5ff';
    drawPixelRect(ctx, x - 18, charY - 16, 4, 4, '#00e5ff');
    drawPixelRect(ctx, x + 14, charY - 16, 4, 4, '#00e5ff');
    drawPixelRect(ctx, x - 18, charY + 28, 4, 4, '#00e5ff');
    drawPixelRect(ctx, x + 14, charY + 28, 4, 4, '#00e5ff');
  }

  // --- LEGS & SHOES ---
  const legOffset = (action === 'walking' || action === 'carrying') ? Math.sin(frame * 0.3) * 3 : 0;
  // Left leg & shoe
  drawPixelRect(ctx, x - 5, y - 8 + legOffset, 4, 6, pantsColor);
  drawPixelRect(ctx, x - 6, y - 2 + legOffset, 5, 3, '#0b0f19'); // dark shoe
  // Right leg & shoe
  drawPixelRect(ctx, x + 1, y - 8 - legOffset, 4, 6, pantsColor);
  drawPixelRect(ctx, x + 1, y - 2 - legOffset, 5, 3, '#0b0f19');

  // --- TORSO (Shirt) ---
  drawPixelRect(ctx, x - 6, charY + 8, 12, 10, shirtColor);
  // Shirt collar/tie accent
  drawPixelRect(ctx, x - 1, charY + 8, 2, 4, '#ffffff');

  // --- ARMS & HANDS ---
  if (action === 'typing') {
    const handJiggle = Math.sin(frame * 0.6) * 2;
    drawPixelRect(ctx, x - 8, charY + 10 + handJiggle, 3, 5, shirtColor);
    drawPixelRect(ctx, x - 8, charY + 15 + handJiggle, 3, 3, skinColor);
    drawPixelRect(ctx, x + 5, charY + 10 - handJiggle, 3, 5, shirtColor);
    drawPixelRect(ctx, x + 5, charY + 15 - handJiggle, 3, 3, skinColor);
  } else if (action === 'carrying' || carryingDoc) {
    // Both hands raised holding yellow file folder
    drawPixelRect(ctx, x - 7, charY + 9, 3, 5, shirtColor);
    drawPixelRect(ctx, x + 4, charY + 9, 3, 5, shirtColor);
    drawPixelRect(ctx, x - 5, charY + 13, 3, 3, skinColor);
    drawPixelRect(ctx, x + 2, charY + 13, 3, 3, skinColor);

    // Golden document folder in hands
    drawPixelRect(ctx, x - 7, charY + 11, 14, 9, '#ffd166');
    drawPixelRect(ctx, x - 5, charY + 9, 7, 3, '#ffe89e'); // tab
    drawPixelRect(ctx, x - 4, charY + 13, 8, 2, '#d4a017'); // lines on folder
    drawPixelRect(ctx, x - 4, charY + 16, 6, 2, '#d4a017');

    // Tiny sparkle particle around active dossier
    const sparkle = Math.sin(frame * 0.5) > 0.5;
    if (sparkle) {
      drawPixelRect(ctx, x + 8, charY + 8, 2, 2, '#ffffff');
      drawPixelRect(ctx, x - 9, charY + 14, 2, 2, '#00e5ff');
    }
  } else if (action === 'handing') {
    // Hands extended forward
    const reachX = isLeft ? x - 10 : x + 6;
    drawPixelRect(ctx, reachX, charY + 10, 8, 3, shirtColor);
    drawPixelRect(ctx, reachX + (isLeft ? -2 : 6), charY + 9, 3, 4, skinColor);

    // Floating folder handed over
    const folderX = isLeft ? x - 16 : x + 8;
    drawPixelRect(ctx, folderX, charY + 8, 12, 8, '#ffd166');
    drawPixelRect(ctx, folderX + 1, charY + 7, 5, 2, '#ffe89e');
  } else if (action === 'receiving') {
    // Hands held open waiting
    drawPixelRect(ctx, x - 7, charY + 10, 3, 4, shirtColor);
    drawPixelRect(ctx, x + 4, charY + 10, 3, 4, shirtColor);
    drawPixelRect(ctx, x - 7, charY + 13, 4, 3, skinColor);
    drawPixelRect(ctx, x + 3, charY + 13, 4, 3, skinColor);
  } else {
    // Idle arm swing
    const armSwing = (action === 'walking') ? Math.sin(frame * 0.3) * 3 : 0;
    drawPixelRect(ctx, x - 8, charY + 9 - armSwing, 3, 6, shirtColor);
    drawPixelRect(ctx, x - 8, charY + 14 - armSwing, 3, 3, skinColor);
    drawPixelRect(ctx, x + 5, charY + 9 + armSwing, 3, 6, shirtColor);
    drawPixelRect(ctx, x + 5, charY + 14 + armSwing, 3, 3, skinColor);
  }

  // --- HEAD & FACE ---
  // Head skin
  drawPixelRect(ctx, x - 6, charY - 2, 12, 10, skinColor);

  // Hair
  drawPixelRect(ctx, x - 7, charY - 6, 14, 5, hairColor);
  drawPixelRect(ctx, x - 7, charY - 2, 3, 6, hairColor);
  drawPixelRect(ctx, x + 4, charY - 2, 3, 6, hairColor);
  if (hairColor === '#ff006e' || hairColor === '#8338ec') {
    // Longer stylish hair for designer/PM
    drawPixelRect(ctx, x - 8, charY + 4, 3, 6, hairColor);
    drawPixelRect(ctx, x + 5, charY + 4, 3, 6, hairColor);
  }

  // Eyes (with periodic blinking)
  const isBlinking = Math.floor(frame / 60) % 4 === 0 && (frame % 60) < 5;
  if (!isBlinking) {
    if (facing === 'down') {
      drawPixelRect(ctx, x - 4, charY + 2, 2, 3, '#1e293b');
      drawPixelRect(ctx, x + 2, charY + 2, 2, 3, '#1e293b');
      // Eye highlight
      drawPixelRect(ctx, x - 4, charY + 2, 1, 1, '#ffffff');
      drawPixelRect(ctx, x + 2, charY + 2, 1, 1, '#ffffff');
    } else if (facing === 'left') {
      drawPixelRect(ctx, x - 5, charY + 2, 2, 3, '#1e293b');
      drawPixelRect(ctx, x - 5, charY + 2, 1, 1, '#ffffff');
    } else if (facing === 'right') {
      drawPixelRect(ctx, x + 3, charY + 2, 2, 3, '#1e293b');
      drawPixelRect(ctx, x + 3, charY + 2, 1, 1, '#ffffff');
    }
  } else {
    // Closed eye line
    drawPixelRect(ctx, x - 4, charY + 3, 3, 1, '#1e293b');
    drawPixelRect(ctx, x + 1, charY + 3, 3, 1, '#1e293b');
  }

  // Smile or expression
  drawPixelRect(ctx, x - 2, charY + 6, 4, 1, '#c2410c');

  // --- NAME LABEL UNDER EMPLOYEE (Only if not at desk or if walking) ---
  if (name && (action === 'walking' || action === 'carrying' || action === 'handing')) {
    ctx.font = '9px "VT323", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(9, 15, 30, 0.85)';
    const textW = ctx.measureText(name).width;
    ctx.fillRect(x - textW / 2 - 4, y + 4, textW + 8, 12);
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - textW / 2 - 4, y + 4, textW + 8, 12);
    ctx.fillStyle = '#00e5ff';
    ctx.fillText(name, x, y + 13);
  }

  // --- SPEECH / EMOTE BUBBLE OVER CHARACTER ---
  if (bubbleText || bubbleIcon) {
    const bubbleY = charY - 26;
    ctx.font = '9px "VT323", monospace';
    const label = bubbleIcon ? `${bubbleIcon} ${bubbleText || ''}`.trim() : (bubbleText || '');
    ctx.textAlign = 'center';
    const bWidth = Math.max(28, ctx.measureText(label).width + 10);
    const bHeight = 16;

    // Bubble background with retro border
    drawPixelRect(ctx, x - bWidth / 2, bubbleY, bWidth, bHeight, '#091224');
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - bWidth / 2, bubbleY, bWidth, bHeight);

    // Bubble pointer tail
    drawPixelRect(ctx, x - 2, bubbleY + bHeight, 4, 3, '#00e5ff');
    drawPixelRect(ctx, x - 1, bubbleY + bHeight, 2, 2, '#091224');

    // Text inside bubble
    ctx.fillStyle = '#ffffff';
    ctx.fillText(label, x, bubbleY + 11);
  }

  ctx.restore();
}

// Draw a detailed pixel workstation desk
export function drawWorkstationDesk(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  title: string,
  screenContent: 'code' | 'palette' | 'document' | 'chart' | 'test' | 'audit' | 'ceo',
  isActive: boolean,
  frame: number
) {
  ctx.save();

  // Chair behind or at desk
  drawPixelRect(ctx, x - 14, y - 18, 28, 6, '#334155');
  drawPixelRect(ctx, x - 12, y - 24, 24, 8, '#1e293b'); // Chair backrest

  // Desk surface (wooden warm hue or sleek cyber steel)
  drawPixelRect(ctx, x - 28, y - 2, 56, 18, '#243048'); // Desk top
  drawPixelRect(ctx, x - 28, y - 4, 56, 3, '#3a4b6e'); // Highlight edge
  drawPixelRect(ctx, x - 26, y + 15, 6, 16, '#182030'); // Left leg
  drawPixelRect(ctx, x + 20, y + 15, 6, 16, '#182030'); // Right leg

  // Under-desk computer PC Tower with blinking LED
  drawPixelRect(ctx, x + 16, y + 4, 10, 16, '#0f172a');
  const ledColor = (frame % 20 < 10) ? '#06d6a0' : '#00b4d8';
  drawPixelRect(ctx, x + 23, y + 6, 2, 2, ledColor);

  // Monitor stand & screen
  drawPixelRect(ctx, x - 3, y - 5, 6, 4, '#475569');
  drawPixelRect(ctx, x - 16, y - 22, 32, 18, '#0b0f19'); // Monitor frame
  drawPixelRect(ctx, x - 14, y - 20, 28, 14, '#131b2e'); // Screen glass

  // Screen glow & content
  const glow = isActive ? (Math.sin(frame * 0.2) * 0.2 + 0.8) : 0.4;
  ctx.globalAlpha = glow;

  if (screenContent === 'code') {
    // Developer matrix/code lines
    drawPixelRect(ctx, x - 12, y - 18, 10, 2, '#06d6a0');
    drawPixelRect(ctx, x - 12, y - 14, 18, 2, '#00e5ff');
    drawPixelRect(ctx, x - 8, y - 10, 14, 2, '#06d6a0');
  } else if (screenContent === 'palette') {
    // Designer color swatches
    drawPixelRect(ctx, x - 12, y - 18, 6, 6, '#ff006e');
    drawPixelRect(ctx, x - 4, y - 18, 6, 6, '#8338ec');
    drawPixelRect(ctx, x + 4, y - 18, 6, 6, '#ffbe0b');
    drawPixelRect(ctx, x - 12, y - 10, 22, 2, '#cbd5e1');
  } else if (screenContent === 'chart') {
    // Researcher / PM bar charts
    drawPixelRect(ctx, x - 12, y - 8, 4, 4, '#00b4d8');
    drawPixelRect(ctx, x - 6, y - 12, 4, 8, '#00b4d8');
    drawPixelRect(ctx, x, y - 16, 4, 12, '#00e5ff');
    drawPixelRect(ctx, x + 6, y - 10, 4, 6, '#ffd166');
  } else if (screenContent === 'test') {
    // QA test radar & checkmarks
    drawPixelRect(ctx, x - 12, y - 16, 8, 8, '#10b981');
    drawPixelRect(ctx, x - 10, y - 12, 4, 2, '#ffffff');
    drawPixelRect(ctx, x - 1, y - 17, 12, 2, '#4ade80');
    drawPixelRect(ctx, x - 1, y - 13, 10, 2, '#4ade80');
    drawPixelRect(ctx, x - 1, y - 9, 8, 2, '#4ade80');
  } else if (screenContent === 'audit') {
    // Reviewer gold seal & stamp
    drawPixelRect(ctx, x - 6, y - 16, 12, 10, '#ffd166');
    drawPixelRect(ctx, x - 3, y - 13, 6, 4, '#92400e');
  } else {
    // CEO Dashboard
    drawPixelRect(ctx, x - 12, y - 18, 24, 3, '#ffd166');
    drawPixelRect(ctx, x - 12, y - 13, 11, 6, '#60a5fa');
    drawPixelRect(ctx, x + 1, y - 13, 11, 6, '#34d399');
  }

  ctx.globalAlpha = 1.0;

  // Keyboard and mouse on desk
  drawPixelRect(ctx, x - 10, y + 1, 14, 4, '#1e293b');
  drawPixelRect(ctx, x + 8, y + 2, 4, 3, '#334155');

  // Decorative desk accessory
  if (title.includes('CEO')) {
    // Gold desk plaque
    drawPixelRect(ctx, x - 24, y + 2, 10, 5, '#ffd166');
    drawPixelRect(ctx, x - 23, y + 3, 8, 3, '#b45309');
  } else if (title.includes('Writer')) {
    // Coffee mug
    drawPixelRect(ctx, x - 24, y + 2, 5, 6, '#ef4444');
    drawPixelRect(ctx, x - 20, y + 4, 2, 2, '#ef4444');
  } else if (title.includes('Designer')) {
    // Stylus tablet
    drawPixelRect(ctx, x - 25, y + 1, 10, 7, '#0284c7');
  } else if (title.includes('QA')) {
    // Warning status light
    const alertLight = isActive ? '#ef4444' : '#10b981';
    drawPixelRect(ctx, x - 24, y - 4, 5, 8, '#0f172a');
    drawPixelRect(ctx, x - 23, y - 8, 3, 4, alertLight);
  }

  // Workstation plaque below desk
  ctx.save();
  ctx.font = '9px "VT323", monospace';
  ctx.textAlign = 'center';
  const plaqueW = ctx.measureText(title).width + 12;
  const plaqueH = 14;
  const px = x - plaqueW / 2;
  const py = y + 20;

  // Brass/gold or cyber plaque
  drawPixelRect(ctx, px, py, plaqueW, plaqueH, '#111a2e');
  ctx.strokeStyle = isActive ? '#00e5ff' : '#334155';
  ctx.lineWidth = 1;
  ctx.strokeRect(px, py, plaqueW, plaqueH);

  // Status indicator dot on plaque
  const statusDotColor = isActive ? '#00e5ff' : '#475569';
  drawPixelRect(ctx, px + 3, py + 5, 4, 4, statusDotColor);

  ctx.fillStyle = isActive ? '#38bdf8' : '#94a3b8';
  ctx.fillText(title, x + 3, py + 11);
  ctx.restore();

  ctx.restore();
}

// Draw office ambient furniture: Water cooler, Plants, Window, Whiteboard, Server Rack
export function drawOfficeDecorations(ctx: CanvasRenderingContext2D, width: number, height: number, frame: number) {
  ctx.save();

  // 1. FLOOR TILES (Grid patterned retro tiles)
  const tileSize = 32;
  for (let ty = 64; ty < height; ty += tileSize) {
    for (let tx = 0; tx < width; tx += tileSize) {
      const isAlt = ((tx / tileSize) + (ty / tileSize)) % 2 === 0;
      ctx.fillStyle = isAlt ? '#0f172a' : '#131e35';
      ctx.fillRect(tx, ty, tileSize, tileSize);

      // Subtle pixel grid dots
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(tx, ty, 1, tileSize);
      ctx.fillRect(tx, ty, tileSize, 1);
    }
  }

  // 2. BACK WALL & CEILING CORNICE
  drawPixelRect(ctx, 0, 0, width, 64, '#090d16');
  drawPixelRect(ctx, 0, 62, width, 2, '#00e5ff'); // Neon cyber wall strip

  // 3. LARGE PIXEL WINDOWS (with moving clouds & city skyline)
  const windowXs = [100, 320, 540, 750];
  windowXs.forEach((wx) => {
    // Window frame
    drawPixelRect(ctx, wx - 4, 8, 76, 44, '#1e293b');
    // Glass sky
    drawPixelRect(ctx, wx, 12, 68, 36, '#030712');

    // Distant pixel skyscrapers
    drawPixelRect(ctx, wx + 6, 24, 12, 24, '#111827');
    drawPixelRect(ctx, wx + 22, 18, 16, 30, '#1f2937');
    drawPixelRect(ctx, wx + 42, 28, 14, 20, '#111827');

    // Yellow office windows on distant skyscrapers
    const blink = (frame % 30 < 15);
    drawPixelRect(ctx, wx + 26, 22, 2, 2, '#ffd166');
    drawPixelRect(ctx, wx + 30, 26, 2, 2, blink ? '#00e5ff' : '#ffd166');
    drawPixelRect(ctx, wx + 10, 28, 2, 2, '#ffd166');

    // Moving cloud
    const cloudX = wx + ((frame * 0.1) % 68);
    drawPixelRect(ctx, cloudX, 15, 12, 3, 'rgba(255, 255, 255, 0.25)');
    drawPixelRect(ctx, cloudX + 3, 14, 6, 2, 'rgba(255, 255, 255, 0.35)');

    // Window mullions (crossbars)
    drawPixelRect(ctx, wx + 33, 12, 2, 36, '#1e293b');
    drawPixelRect(ctx, wx, 30, 68, 2, '#1e293b');
  });

  // 4. WATER COOLER (Left side lounge area)
  const wx = 36;
  const wy = 230;
  drawPixelRect(ctx, wx - 2, wy, 16, 24, '#e2e8f0'); // Cooler base
  drawPixelRect(ctx, wx, wy - 14, 12, 14, '#38bdf8'); // Water bottle
  drawPixelRect(ctx, wx + 2, wy - 16, 8, 3, '#0284c7'); // Cap
  // Animated water bubble inside bottle
  const bubbleY = wy - 6 - ((frame * 0.5) % 8);
  drawPixelRect(ctx, wx + 4, bubbleY, 2, 2, '#ffffff');
  // Tap & drip tray
  drawPixelRect(ctx, wx + 3, wy + 6, 2, 3, '#0284c7');
  drawPixelRect(ctx, wx + 8, wy + 6, 2, 3, '#ef4444');

  // 5. COFFEE MAKER TABLE (Right side lounge area)
  const cx = 850;
  const cy = 230;
  drawPixelRect(ctx, cx - 14, cy + 4, 28, 20, '#334155'); // Table
  drawPixelRect(ctx, cx - 8, cy - 8, 16, 12, '#1e293b'); // Coffee machine
  drawPixelRect(ctx, cx - 4, cy - 2, 8, 4, '#78350f'); // Coffee pot
  // Rising steam particle
  const steamY = cy - 10 - ((frame * 0.4) % 10);
  drawPixelRect(ctx, cx, steamY, 2, 2, 'rgba(255,255,255,0.4)');

  // 6. POTTED PLANTS (Corners)
  const plantPositions = [
    { px: 40, py: 90 },
    { px: 855, py: 90 },
    { px: 40, py: 410 },
    { px: 855, py: 410 },
  ];

  plantPositions.forEach(({ px, py }) => {
    // Pot
    drawPixelRect(ctx, px - 7, py + 8, 14, 12, '#c2410c');
    drawPixelRect(ctx, px - 9, py + 6, 18, 3, '#ea580c');
    // Lush green leaves with sway
    const sway = Math.sin(frame * 0.05 + px) * 1.5;
    drawPixelRect(ctx, px - 6 + sway, py - 4, 8, 10, '#15803d');
    drawPixelRect(ctx, px + 1 - sway, py - 6, 9, 12, '#16a34a');
    drawPixelRect(ctx, px - 2, py - 10, 6, 10, '#22c55e');
  });

  // 7. WHITEBOARD (Behind PM & Researcher)
  const wbX = 430;
  const wbY = 70;
  drawPixelRect(ctx, wbX, wbY, 60, 28, '#f8fafc');
  drawPixelRect(ctx, wbX - 2, wbY - 2, 64, 32, '#64748b');
  // Sticky notes & diagram
  drawPixelRect(ctx, wbX + 4, wbY + 4, 8, 8, '#fef08a');
  drawPixelRect(ctx, wbX + 16, wbY + 4, 8, 8, '#fbcfe8');
  drawPixelRect(ctx, wbX + 28, wbY + 4, 8, 8, '#bae6fd');
  // Roadmap flow line
  drawPixelRect(ctx, wbX + 6, wbY + 18, 48, 2, '#3b82f6');

  // 8. SERVER RACKS (Next to dev desk)
  const sX = 36;
  const sY = 320;
  drawPixelRect(ctx, sX - 10, sY, 22, 46, '#0f172a');
  drawPixelRect(ctx, sX - 8, sY + 2, 18, 42, '#1e293b');
  for (let sl = 0; sl < 4; sl++) {
    drawPixelRect(ctx, sX - 6, sY + 6 + sl * 10, 14, 7, '#0b0f19');
    const led1 = (frame + sl * 5) % 15 < 7 ? '#00e5ff' : '#06d6a0';
    const led2 = (frame + sl * 3) % 20 < 10 ? '#ffd166' : '#ef4444';
    drawPixelRect(ctx, sX - 4, sY + 8 + sl * 10, 2, 2, led1);
    drawPixelRect(ctx, sX, sY + 8 + sl * 10, 2, 2, led2);
  }

  ctx.restore();
}
