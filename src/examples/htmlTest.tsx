import { html } from '../mark';
import { Glyph } from '../compile';

export const htmlTest: Glyph = {
  children: {
    "html": html({
      width: 100,
      height: 300,
      html: <div>The quick brown fox jumps over the lazy dog.Pack my box with five dozen liquor jugs</div>
    })
  },
}
