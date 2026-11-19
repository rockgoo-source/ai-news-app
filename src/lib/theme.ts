export const THEME_STORAGE_KEY = "theme";

// 첫 페인트 전에 실행해 깜빡임 없이 테마를 적용한다.
// 저장된 값이 없으면 시스템 설정(prefers-color-scheme)을 따른다.
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;
