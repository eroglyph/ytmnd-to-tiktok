# ytmnd-to-tiktok
Convert YTMND sites into videos for TikTok.

# ffmpeg
ffmpeg -i timetraveller/image.gif -f mp4 -pix_fmt yuv420p timetraveller/video.mp4

ffmpeg -r 24 -i sites/timetraveller/image.gif -vcodec libx264 -y -an sites/timetraveller/video.mp4 -vf "pad=ceil(iw/2)*2:ceil(ih/2)*2" -pix_fmt yuv420p

ffmpeg -i sites/timetraveller/image.gif -f mp4 -pix_fmt yuv420p sites/timetraveller/video.mp4 -y

