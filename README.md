# ytmnd-to-tiktok
Convert YTMND sites into videos for TikTok. Works on, maybe, 50% of sites due to inconsistencies in GIF and audio encoding.

Requirements:
- ImageMagick
- ffmpeg
- sox
- Node 10.15.0+

Install:
`npm install`

Run:
`$ node bin/ytmnd.js --ytmnd getreadyforcoconuts` will render an uploadable tiktok.mp4 in /sites/getreadyforcoconuts.
