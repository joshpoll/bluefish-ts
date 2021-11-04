import { html } from '../mark';
import { Glyph } from '../compile';

export const htmlTest: Glyph = {
  children: {
    "html": html({
      width: 100,
      height: 300,
      html: <div>The quick brown fox <u>jumps</u> over the lazy dog.<br />Pack my box with <a href="google.com">five</a> dozen liquor jugs</div>
    })
  },
}
