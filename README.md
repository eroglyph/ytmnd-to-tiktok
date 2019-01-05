# ytmnd-to-tiktok
Convert YTMND sites into videos for TikTok.

# Specs

Video Size: 375x812px

convert sites/hippohippo/stacked_image.gif -resize 375x375 sites/hippohippo/resized_image.gif


# Tiled Foreground (http://steamsteamlol.ytmnd.com/)

convert -size 375x812 xc:#000000 sites/steamsteamlol/background.png && convert sites/steamsteamlol/image.gif -resize 375x375 sites/steamsteamlol/image_resized.gif

sox sites/steamsteamlol/sound.wav sites/steamsteamlol/sound_looped.mp3 repeat 20 && ffmpeg -ss 0 -t 60 -i sites/steamsteamlol/sound_looped.mp3 sites/steamsteamlol/sound_final.mp3 && rm sites/steamsteamlol/sound_looped.mp3

ffmpeg -i sites/hippohippo/image.gif -i sites/hippohippo/image.gif -i sites/hippohippo/image.gif -filter_complex vstack=inputs=3 sites/hippohippo/stacked_image.gif

ffmpeg -i assets/bg0.mp4 -i sites/steamsteamlol/background.png \
-filter_complex "[0:v][1:v] overlay=0:0" \
-pix_fmt yuv420p -c:a copy \
sites/steamsteamlol/video_background.mp4

ffmpeg -i assets/bg.mp4 -ignore_loop 0 -i sites/hippohippo/image_stacked.gif -filter_complex "[0:v][1:v] overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2:enable='between(t,0,60):shortest=1" -pix_fmt yuv420p -c:a copy sites/hippohippo/video.mp4

ffmpeg -i sites/steamsteamlol/video.mp4 -i sites/steamsteamlol/sound_final.mp3  -filter_complex "[1:0] adelay=0|0 [delayed];[0:1][delayed] amix=inputs=2" -map 0:0 -c:a aac -strict -2 -c:v copy sites/steamsteamlol/tiktok.mp4

# Image w/Color Background (http://ualuealuealeuale.ytmnd.com/)

Generate background:
convert -size 375x812 xc:#000000 sites/ualuealuealeuale/background.png

Resize foreground image:
convert sites/ualuealuealeuale/image.gif -resize 375x375 sites/ualuealuealeuale/image_resized.gif

Create 60s audio:
sox sites/ualuealuealeuale/sound.wav sites/ualuealuealeuale/sound_looped.mp3 repeat 20 && ffmpeg -ss 0 -t 60 -i sites/ualuealuealeuale/sound_looped.mp3 sites/ualuealuealeuale/sound_final.mp3 && rm sites/ualuealuealeuale/sound_looped.mp3

Generate video:
ffmpeg -i assets/bg0.mp4 -i sites/ualuealuealeuale/background.png \
-filter_complex "[0:v][1:v] overlay=0:0" \
-pix_fmt yuv420p -c:a copy \
sites/ualuealuealeuale/video_background.mp4 \
&& \
ffmpeg -i sites/ualuealuealeuale/video_background.mp4 -ignore_loop 0 -i sites/ualuealuealeuale/image_resized.gif \
-filter_complex "[0:v][1:v] overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2:enable='between(t,0,60):shortest=1" \
-pix_fmt yuv420p -c:a copy \
sites/ualuealuealeuale/video.mp4

Add sound:
ffmpeg -i sites/ualuealuealeuale/video.mp4 \
  -i sites/ualuealuealeuale/sound_final.mp3 \
  -filter_complex "[1:0] adelay=0|0 [delayed];[0:1][delayed] amix=inputs=2" \
  -map 0:0 \
  -c:a aac -strict -2 \
  -c:v copy \
  sites/ualuealuealeuale/tiktok.mp4

# Media Formatting Reference

Create background:

convert -size 375x812 xc:#000000 sites/ualuealuealeuale/background.png

Loop short audio:

sox sites/steamsteamlol/sound.wav sites/steamsteamlol/sound_full.wav repeat 20

Clip long audio:

ffmpeg -ss 0 -t 60 -i sites/steamsteamlol/sound_full.wav sites/pi/sound_final.wav

Composite sound and video:

ffmpeg -i sites/steamsteamlol/video.mp4 \
  -i sites/steamsteamlol/sound_final.wav \
  -filter_complex "[1:0] adelay=0|0 [delayed];[0:1][delayed] amix=inputs=2" \
  -map 0:0 \
  -c:a aac -strict -2 \
  -c:v copy \
  sites/steamsteamlol/tiktok.mp4

Resize image to fit width:

convert sites/pi/image.jpg -resize 375x375 sites/pi/resize_image.jpg

Static image:

ffmpeg -i assets/bg0.mp4 -i sites/pi/resize_image.jpg -filter_complex "[0:v][1:v] overlay=0:0" -pix_fmt yuv420p -c:a copy sites/pi/video.mp4

GIF:

ffmpeg -i assets/bg0.mp4 -ignore_loop 0 -i sites/steamsteamlol/image.gif \
-filter_complex "[0:v][1:v] overlay=0:0:enable='between(t,0,60):shortest=1" \
-pix_fmt yuv420p -c:a copy \
sites/steamsteamlol/video.mp4

