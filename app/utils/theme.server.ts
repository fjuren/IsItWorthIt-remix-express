import * as cookie from 'cookie';

export type Theme = 'light' | 'dark';

export function getTheme(request: Request): Theme {
  const cookieHeaders = request.headers.get('cookie');
  // check if the theme color is set in the cookie. If so return the set theme, else return default 'light'
  const cookieThemeValue = cookieHeaders
    ? cookie.parse(cookieHeaders).theme
    : 'light';

  const theme =
    cookieThemeValue &&
    (cookieThemeValue == 'light' || cookieThemeValue == 'dark')
      ? cookieThemeValue
      : 'light';

  return theme;
}

export function setTheme(theme: Theme) {
  const cookieSerialized = cookie.serialize('theme', theme, {
    path: '/',
  });

  return cookieSerialized;
}
