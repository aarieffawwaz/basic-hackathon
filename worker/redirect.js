// The live site is Cloudflare Pages (shiftreplay.pages.dev). This Worker only keeps the
// old shiftreplay.<account>.workers.dev link alive by forwarding every path to it.
const TARGET = 'https://shiftreplay.pages.dev';

export default {
  fetch(request) {
    const { pathname, search } = new URL(request.url);
    return Response.redirect(TARGET + pathname + search, 301);
  },
};
