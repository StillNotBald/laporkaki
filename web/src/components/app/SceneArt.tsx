export type Scene = "road" | "path" | "drain" | "light" | "tree" | "water";

const BLUE = "#0a64d6";

function Road() {
  return (
    <>
      <rect width="350" height="220" fill="#f4f4f4" />
      <path d="M0 38h350v22H0z" fill="#e4e4e4" />
      <path d="M0 60h350M0 84h350M0 38h350M48 38v22m74-22v22m74-22v22m74-22v22" fill="none" stroke="#b3b3b3" strokeWidth="1" />
      <path d="M0 85h350v135H0z" fill="#ededed" />
      <path d="M12 170h64m198 0h64" fill="none" stroke="#fff" strokeWidth="6" />
      <path d="M119 127c12-13 27-5 42-13 18-8 42 1 51 11 8 9 19 12 13 23-5 11-24 9-36 15-16 7-44-1-55-7-13-6-26-18-15-29Z" fill="#d1d1d1" stroke="#8e8e93" strokeWidth="1.5" />
      <path d="M137 135c13-9 21-4 36-10m-27 23 14 4m31-21 15 9" fill="none" stroke="#a1a1a6" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="239" cy="105" r="17" fill="#fff" stroke={BLUE} strokeWidth="1.5" />
      <path d="M243 102a4 4 0 1 0-8 0c0 3 4 7 4 7s4-4 4-7Z" fill="none" stroke={BLUE} strokeWidth="1.5" />
    </>
  );
}

function Path() {
  return (
    <>
      <rect width="350" height="220" fill="#f4f4f4" />
      <path d="M100 0h140l74 220H30Z" fill="#e6e6e6" />
      <path d="M100 0 30 220M240 0l74 220" fill="none" stroke="#9e9e9e" strokeWidth="1.5" />
      <path d="M7 68h65M284 68h57M8 95h52m239 0h42" fill="none" stroke="#c6c6c6" strokeWidth="1.5" />
      <path d="m132 98 12-4 5 13-12 4Zm58 38 14-4 6 12-17 6Zm-33 41 9-5 8 9-9 5Z" fill="#fff" stroke="#8e8e93" strokeWidth="1.5" />
      <path d="m215 87 8 3-4 12-8-3Z" fill="#d1d1d1" stroke="#8e8e93" strokeWidth="1.5" />
      <circle cx="176" cy="52" r="15" fill="#fff" stroke={BLUE} strokeWidth="1.5" />
      <path d="M180 49a4 4 0 1 0-8 0c0 3 4 7 4 7s4-4 4-7Z" fill="none" stroke={BLUE} strokeWidth="1.5" />
    </>
  );
}

function Drain() {
  return (
    <>
      <rect width="350" height="220" fill="#f4f4f4" />
      <path d="M0 0h350v96H0z" fill="#ececec" />
      <path d="M0 96h350M0 196h350" fill="none" stroke="#c9c9c9" strokeWidth="2" />
      <rect x="36" y="118" width="278" height="58" rx="6" fill="#dcdcdc" stroke="#8e8e93" strokeWidth="1.5" />
      <path d="M70 122v50m32-50v50m32-50v50m32-50v50m32-50v50m32-50v50" fill="none" stroke="#a1a1a6" strokeWidth="2" />
      <ellipse cx="96" cy="188" rx="52" ry="9" fill="#cfe1fb" />
      <ellipse cx="258" cy="184" rx="38" ry="7" fill="#cfe1fb" />
      <path d="m203 104 11-6 4 9-11 5Zm-24 6 8-4 4 7-9 4Z" fill="#fff" stroke="#8e8e93" strokeWidth="1.2" />
      <circle cx="300" cy="46" r="16" fill="#fff" stroke={BLUE} strokeWidth="1.5" />
      <path d="M304 43a4 4 0 1 0-8 0c0 3 4 7 4 7s4-4 4-7Z" fill="none" stroke={BLUE} strokeWidth="1.5" />
    </>
  );
}

function Light() {
  return (
    <>
      <rect width="350" height="220" fill="#f4f4f4" />
      <path d="M0 150h350v70H0z" fill="#e9e9e9" />
      <path d="M0 150h350" fill="none" stroke="#c6c6c6" strokeWidth="2" />
      <path d="M0 176h56m48 0h52m60 0h50m48 0h36" fill="none" stroke="#fff" strokeWidth="5" />
      <path d="M266 34v122" fill="none" stroke="#8e8e93" strokeWidth="6" strokeLinecap="round" />
      <path d="M266 34h-32" fill="none" stroke="#8e8e93" strokeWidth="6" strokeLinecap="round" />
      <rect x="204" y="26" width="34" height="14" rx="5" fill="#d1d1d1" stroke="#8e8e93" strokeWidth="1.5" />
      <path d="M221 46v26c0 8-14 10-20 14" fill="none" stroke="#cfe1fb" strokeWidth="10" strokeLinecap="round" opacity="0.9" />
      <rect x="252" y="150" width="28" height="8" rx="3" fill="#d1d1d1" stroke="#8e8e93" strokeWidth="1.2" />
      <circle cx="221" cy="104" r="16" fill="#fff" stroke={BLUE} strokeWidth="1.5" />
      <path d="M225 101a4 4 0 1 0-8 0c0 3 4 7 4 7s4-4 4-7Z" fill="none" stroke={BLUE} strokeWidth="1.5" />
    </>
  );
}

function Tree() {
  return (
    <>
      <rect width="350" height="220" fill="#f4f4f4" />
      <path d="M0 58h350v162H0z" fill="#ededed" />
      <path d="M0 58h350" fill="none" stroke="#c9c9c9" strokeWidth="2" />
      <path d="M36 134 318 66" fill="none" stroke="#a9a2a0" strokeWidth="13" strokeLinecap="round" />
      <path d="M64 127 42 96m58 6-6-32m96 8 18-28m14 39 30-14" fill="none" stroke="#a9a2a0" strokeWidth="5" strokeLinecap="round" />
      <path d="M236 46c14-12 38-8 42 8 14 2 16 22 2 26-4 14-28 18-38 6-16 2-24-18-10-26-2-6 0-10 4-14Z" fill="#d8d8d8" stroke="#a1a1a6" strokeWidth="1.5" />
      <path d="M76 84c10-8 24-6 28 4 8 2 8 14-2 16-4 8-18 8-24 0-10 0-12-14-2-20Z" fill="#dedede" stroke="#a1a1a6" strokeWidth="1.4" />
      <circle cx="300" cy="166" r="16" fill="#fff" stroke={BLUE} strokeWidth="1.5" />
      <path d="M304 163a4 4 0 1 0-8 0c0 3 4 7 4 7s4-4 4-7Z" fill="none" stroke={BLUE} strokeWidth="1.5" />
    </>
  );
}

function Water() {
  return (
    <>
      <rect width="350" height="220" fill="#f4f4f4" />
      <path d="M0 0h350v96H0z" fill="#ececec" />
      <path d="M0 96h350" fill="none" stroke="#c9c9c9" strokeWidth="2" />
      <path d="M18 132h150a10 10 0 0 1 10 10v18" fill="none" stroke="#9e9e9e" strokeWidth="9" strokeLinecap="round" />
      <path d="M178 168v14" fill="none" stroke="#cfe1fb" strokeWidth="7" strokeLinecap="round" />
      <ellipse cx="196" cy="192" rx="92" ry="17" fill="#cfe1fb" />
      <ellipse cx="138" cy="196" rx="34" ry="9" fill="#cfe1fb" />
      <path d="M226 110c0 8-6 14-6 14s-6-6-6-14a6 6 0 0 1 12 0Z" fill="#fff" stroke={BLUE} strokeWidth="1.5" />
      <path d="M246 118c1 5-2 9-2 9s-5-3-5-8a3.5 3.5 0 0 1 7-1Z" fill="#fff" stroke={BLUE} strokeWidth="1.2" />
      <circle cx="300" cy="48" r="16" fill="#fff" stroke={BLUE} strokeWidth="1.5" />
      <path d="M304 45a4 4 0 1 0-8 0c0 3 4 7 4 7s4-4 4-7Z" fill="none" stroke={BLUE} strokeWidth="1.5" />
    </>
  );
}

export const sceneLabels: Record<Scene, string> = {
  road: "Road drawing",
  path: "Walkway drawing",
  drain: "Drain drawing",
  light: "Streetlight drawing",
  tree: "Tree and walkway drawing",
  water: "Pipe and water drawing",
};

export function SceneArt({ scene, className }: { scene: Scene; className?: string }) {
  const art = { road: Road, path: Path, drain: Drain, light: Light, tree: Tree, water: Water }[scene];
  const Art = art ?? Road;
  return (
    <svg
      viewBox="0 0 350 220"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={sceneLabels[scene] ?? "Problem drawing"}
      className={className}
    >
      <Art />
    </svg>
  );
}
