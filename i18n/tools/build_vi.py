# Builds design/vi.json from one source table so vi/en keys can never drift.
import json, re, unicodedata, sys, os
OUT = os.path.join(os.path.dirname(__file__), '..', 'vi.json')

S = []  # (key, vi, en)
def s(k, vi, en): S.append((k, vi, en))

# ---------- common ----------
s('common.continue','Tiếp tục','Continue')
s('common.next','Tiếp','Next')
s('common.back','Quay lại','Back')
s('common.close','Đóng','Close')
s('common.cancel','Hủy','Cancel')
s('common.done','Xong','Done')
s('common.save','Lưu','Save')
s('common.retry','Thử lại','Try again')
s('common.skip','Bỏ qua','Skip')
s('common.skipEffects','Bỏ qua hiệu ứng','Skip effect')
s('common.draftSaved','Bản nháp đã lưu','Draft saved')
s('common.yes','Có','Yes')
s('common.no','Không','No')
s('common.ok','Được rồi','OK')
s('common.loading','Đang tải…','Loading…')
s('common.share','Chia sẻ','Share')
s('common.copyLink','Sao chép liên kết','Copy link')
s('common.copied','Đã sao chép!','Copied!')
s('common.replay','Xem lại từ đầu','Replay from the start')
s('common.soundOn','Bật nhạc','Sound on')
s('common.soundOff','Tắt nhạc','Sound off')
s('common.sfx','Âm thanh hiệu ứng','Sound effects')
s('common.haptics','Rung','Vibration')
s('common.tapToPlaySound','Chạm để bật nhạc','Tap to play music')
s('common.optional','(không bắt buộc)','(optional)')
s('common.learnMore','Tìm hiểu thêm','Learn more')

# ---------- in-app browser (Zalo / Messenger / Facebook / Instagram / TikTok) ----------
s('inapp.banner.title','Mở bằng trình duyệt để xem trọn vẹn nhé','Open in your browser for the full experience')
s('inapp.banner.body','Trang đang mở bên trong {app}, nên máy ảnh, nhạc hoặc nút tải ảnh có thể không hoạt động.','This page is open inside {app}, so the camera, music or image download may not work.')
s('inapp.steps.ios','Nhấn ⋯ ở góc màn hình, rồi chọn mở bằng Safari.','Tap ⋯ in the corner, then choose to open in Safari.')
s('inapp.steps.android','Nhấn ⋮ ở góc màn hình, rồi chọn mở bằng trình duyệt (Chrome).','Tap ⋮ in the corner, then choose to open in your browser (Chrome).')
s('inapp.openChrome','Mở bằng Chrome','Open in Chrome')
s('inapp.copyForSafari','Sao chép liên kết để dán vào Safari','Copy the link to paste into Safari')
s('inapp.continueHere','Vẫn xem ở đây','Continue here anyway')
s('inapp.cameraFallback','Dùng ứng dụng máy ảnh của điện thoại','Use your phone\'s camera app instead')
s('inapp.saveHint','Nhấn giữ ảnh để lưu vào máy','Press and hold the image to save it')

# ---------- gift: recipient flow (sender voice; uses {self}/{you}/{we}/{nha}) ----------
s('gift.loading','Đang gói quà…','Wrapping your gift…')
s('gift.landing.from','{Self} có một món quà nhỏ cho {you} nè','I have a little gift for you')
s('gift.landing.fromName','Từ {senderName}, gửi {recipientName}','From {senderName}, to {recipientName}')
s('gift.tapToOpen','Chạm để mở','Tap to open')
s('gift.tapToReveal','Chạm để xem {nha}','Tap to reveal')
s('gift.label.tapToOpen','chạm để mở','tap to open')
s('gift.label.tapToReveal','chạm để xem {nha}','tap to see')
s('gift.label.pullRibbon','kéo nơ','pull the ribbon')
s('gift.pill.replay','xem lại','again')
s('gift.liXi.tapToOpen','Chạm để mở bao lì xì','Tap to open the red envelope')
s('gift.liXi.slideUp','Vuốt lên để rút thiệp','Swipe up to pull out the card')
s('gift.liXi.wish','Chúc {you} một năm mới thật nhiều niềm vui, và năm nào cũng có {self} bên cạnh.','Wishing you a joyful new year, and every year with me by your side.')
s('gift.box.pullRibbon','Kéo nơ','Pull the ribbon')
s('gift.box.pullHint','Kéo dải nơ sang bên để mở hộp','Drag the ribbon aside to open the box')
s('gift.box.tapFallback','Hoặc chạm vào nơ','Or tap the bow')
s('gift.box.opened','Mở rồi nè!','It\'s open!')
s('gift.treats.prompt','Chạm vào một món để nếm thử','Tap a treat to take a bite')
s('gift.treats.firstBite','Ngon không? Còn {count} món nữa thôi','Tasty? Just {count} treats to go')
s('gift.treats.left','Còn {count} món nữa','{count} treats to go')
s('gift.treats.lastBite','Miếng cuối rồi đó!','Last bite!')
s('gift.treats.done','Hết sạch rồi! Mở thư {nha}','All gone! Time for the letter')
s('gift.notebook.yes','Có chứ!','Yes!')
s('gift.notebook.later','Để sau','Later')
s('gift.notebook.laterHold','{Self} vẫn ở đây đợi {you}. Khi nào sẵn sàng thì mở quà {nha}.','I\'ll be right here. Open it whenever you\'re ready.')
s('gift.notebook.tapObject','Chạm vào món quà nhỏ này {nha}','Tap the little gift')
s('gift.notebook.next','Mở thư thôi','On to the letter')
s('gift.phin.dripping','Cà phê đang nhỏ giọt…','The coffee is dripping…')
s('gift.phin.ready','Cà phê xong rồi, mời {you}!','Your coffee is ready!')
s('gift.mooncake.cut','Chạm để cắt bánh','Tap to cut the mooncake')
s('gift.mooncake.slicesLeft','Còn {count} miếng bánh','{count} slices left')
s('gift.letter.open','Đọc thư','Read the letter')
s('gift.letter.eyebrow','Thư gửi {you}','A letter for you')
s('gift.letter.salutation','Gửi {recipientName},','Dear {recipientName},')
s('gift.letter.signoff','Thương {you} nhiều,','With all my love,')
s('gift.letter.close','Gấp thư lại','Fold the letter')
s('gift.photos.title','Kỷ niệm của {we}','Our memories')
s('gift.photos.tapToView','Chạm vào ảnh để xem lớn','Tap a photo to enlarge')
s('gift.photos.counter','{index} / {total}','{index} / {total}')
s('gift.photos.prev','Ảnh trước','Previous photo')
s('gift.photos.next','Ảnh tiếp theo','Next photo')
s('gift.songs.title','Băng nhạc {self} thu cho {you}','A mixtape I made for you')
s('gift.songs.trackLabel','Bài {number}','Track {number}')
s('gift.songs.starting','Đang mở: {title}','Starting: {title}')
s('gift.songs.playing','Đang phát','Now playing')
s('gift.songs.paused','Tạm dừng','Paused')
s('gift.songs.openIn','Nghe trên {service}','Listen on {service}')
s('gift.songs.previewOnly','Đang phát đoạn nghe thử 30 giây. Đăng nhập {service} để nghe trọn bài.','Playing a 30-second preview. Log in to {service} for the full song.')
s('gift.songs.ourSong','Bài hát của {we}','Our song')
s('gift.more.pill','Còn quà nữa đó','Another little surprise')
s('gift.more.drawerTitle','Ngăn kéo bí mật','Secret drawer')
s('gift.more.voiceNote','Lời nhắn thoại','Voice note')
s('gift.more.voiceDuration','{duration}','{duration}')
s('gift.more.days','Đếm ngày bên nhau','Our day count')
s('gift.more.map','Bản đồ kỷ niệm','Memory map')
s('gift.more.mapPlace','{place} · {date}','{place} · {date}')
s('gift.days.together','{We} đã bên nhau {days} ngày','We\'ve been together for {days} days')
s('gift.days.since','Kể từ {date}','Since {date}')
s('gift.days.milestoneToday','Hôm nay tròn {days} ngày!','{days} days today!')
s('gift.days.untilMilestone','Còn {count} ngày nữa là tròn {milestone} ngày','{count} days until {milestone} days')
s('gift.days.monthsYears','{years} năm {months} tháng {days} ngày','{years} years {months} months {days} days')
s('gift.finale.cta','Tiếp tục','Continue')
s('gift.finale.tooltip','Đọc hết thư rồi hẵng chạm {nha}','Finish the letter first, then tap')
s('gift.finale.thanks','Cảm ơn {you} vì đã ở đây.','Thank you for being here.')
s('gift.finale.replay','Mở lại món quà','Open the gift again')
s('gift.reply.title','Gửi lại một lời nhắn','Send a message back')
s('gift.reply.placeholder','Viết vài dòng cho {senderName}…','Write a few lines to {senderName}…')
s('gift.reply.react','Thả tim','Send a heart')
s('gift.reply.sent','Đã gửi! {senderName} sẽ nhận được ngay.','Sent! {senderName} will get it right away.')
s('gift.reply.makeYourOwn','Tạo một món quà như thế này','Make a gift like this')
s('gift.reply.strip','Gửi lại một dải ảnh','Send a photo strip back')
s('gift.end.replay','Xem lại từ đầu','Watch again from the start')
s('gift.lite','Mạng hơi chậm, đang dùng bản nhẹ','Slow connection, showing the light version')
s('gift.updatedPill','Có cập nhật mới','Updated')
s('gift.report','Báo cáo','Report')
s('gift.removeMyPhoto','Gỡ ảnh của tôi','Remove my photo')
s('gift.lock.title','Chưa đến giờ mở quà đâu','It\'s not time to open this yet')
s('gift.lock.opensAt','Quà sẽ mở lúc {time}, {date}','This gift opens at {time} on {date}')
s('gift.lock.countdown','Còn {days} ngày {hours} giờ {minutes} phút','{days} days {hours} hours {minutes} minutes left')
s('gift.lock.waitHint','Đợi chút {nha}, sắp tới rồi!','Hang on, almost there!')
s('gift.secret.title','Câu hỏi bí mật','Secret question')
s('gift.secret.placeholder','Nhập câu trả lời','Type your answer')
s('gift.secret.wrong','Chưa đúng rồi, thử lại {nha}','Not quite, try again')
s('gift.secret.hint','Gợi ý: {hint}','Hint: {hint}')
s('gift.secret.tooMany','Thử nhiều quá rồi. Đợi {minutes} phút rồi thử lại nhé.','Too many tries. Wait {minutes} minutes and try again.')

# gift errors (app voice)
s('gift.error.notFound','Không tìm thấy món quà này. Bạn kiểm tra lại liên kết nhé.','We couldn\'t find this gift. Please check the link.')
s('gift.error.expired','Món quà này đã hết hạn và đã được xóa.','This gift has expired and was deleted.')
s('gift.error.revoked','Người gửi đã thu hồi món quà này.','The sender has withdrawn this gift.')
s('gift.error.offline','Mất kết nối mạng. Đang thử kết nối lại…','You\'re offline. Reconnecting…')
s('gift.error.slow','Mạng hơi chậm, ảnh sẽ rõ dần sau ít giây.','The network is slow; photos will sharpen in a few seconds.')
s('gift.error.songUnavailable','Không phát được bài này trong trang. Nghe trên {service} nhé?','This song can\'t play here. Listen on {service}?')
s('gift.error.voiceUnavailable','Không phát được lời nhắn thoại. Thử tải lại trang nhé.','The voice note couldn\'t play. Try reloading the page.')
s('gift.error.generic','Có lỗi nhỏ xảy ra. Bạn thử lại giúp mình nhé.','Something went wrong. Please try again.')

# ---------- create: sender flow (app voice, addresses sender as "bạn") ----------
s('create.title','Tạo món quà','Create a gift')
s('create.group.prepare','Chuẩn bị','Set up')
s('create.group.content','Nội dung','Content')
s('create.group.send','Gửi','Send')
s('create.step.mechanic','Kiểu mở quà','How it opens')
s('create.step.theme','Chủ đề','Theme')
s('create.step.people','Gửi cho ai','Who it\'s for')
s('create.step.photos','Ảnh kỷ niệm','Photos')
s('create.step.letter','Viết thư','Letter')
s('create.step.voice','Lời nhắn thoại','Voice note')
s('create.step.songs','Bài hát','Songs')
s('create.step.map','Bản đồ kỷ niệm','Memory map')
s('create.step.schedule','Hẹn ngày mở','Opening date')
s('create.step.review','Xem trước & gửi','Preview & send')
s('create.mechanic.prompt','Chọn kiểu mở quà','Choose how the gift opens')
s('create.mechanic.envelope','Phong thư','Envelope')
s('create.mechanic.box','Hộp quà','Gift box')
s('create.mechanic.booth','Photobooth','Photobooth')
s('create.mechanic.notebook','Sổ tay','Notebook')
s('create.occasion.prompt','Món quà này cho dịp gì?','What\'s the occasion?')
s('create.theme.prompt','Chọn một giao diện','Pick a theme')
s('create.theme.premiumBadge','Cao cấp','Premium')
s('create.theme.free','Miễn phí','Free')
s('create.pronouns.prompt','Bạn và người ấy xưng hô thế nào?','How do you two address each other?')
s('create.pronouns.help','Lời chúc và câu chữ trong quà sẽ đổi theo cách xưng hô bạn chọn.','The wording in your gift follows the pronouns you choose.')
s('create.pronouns.anhEm','Anh – Em (bạn là anh)','Anh – Em (you are "anh")')
s('create.pronouns.emAnh','Em – Anh (bạn là em)','Em – Anh (you are "em")')
s('create.pronouns.toCau','Tớ – Cậu','Tớ – Cậu')
s('create.pronouns.minhBan','Mình – Bạn','Mình – Bạn')
s('create.pronouns.none','Không dùng đại từ','No pronouns')
s('create.pronouns.preview','Ví dụ: “{example}”','Example: "{example}"')
s('create.tone.prompt','Giọng văn','Tone')
s('create.tone.north','Miền Bắc (… nhé)','Northern (… nhé)')
s('create.tone.south','Miền Nam (… nha)','Southern (… nha)')
s('create.names.recipient','Tên người nhận','Recipient\'s name')
s('create.names.nickname','Tên gọi thân mật','Nickname')
s('create.names.nicknamePlaceholder','Ví dụ: Bống, Su, Mèo','e.g. Bống, Su, Mèo')
s('create.names.sender','Tên của bạn','Your name')
s('create.names.hint','Người Việt thường gọi nhau bằng tên (chữ cuối), nên hãy nhập tên gọi bạn hay dùng.','Vietnamese people go by their given name, so enter the name you actually call them.')
s('create.message.title','Viết thư','Write your letter')
s('create.message.placeholder','Viết điều bạn muốn nói…','Write what you want to say…')
s('create.message.counter','{count}/{max} ký tự','{count}/{max} characters')
s('create.message.tooLong','Thư hơi dài rồi. Rút gọn còn {max} ký tự nhé.','Your letter is a bit long. Please keep it under {max} characters.')
s('create.message.suggestions','Gợi ý mở đầu','Opening ideas')
s('create.message.suggest1','Hôm nay {self} muốn nói với {you} một điều…','Today I want to tell you something…')
s('create.message.suggest2','Cảm ơn {you} vì đã đến bên {self}.','Thank you for coming into my life.')
s('create.message.suggest3','Nhớ hôm đầu tiên {we} gặp nhau không?','Remember the first day we met?')
s('create.message.previewTyping','Xem thử gõ chữ','Preview the typing')
s('create.photos.add','Thêm ảnh','Add photos')
s('create.photos.limit','Tối đa {max} ảnh','Up to {max} photos')
s('create.photos.reorder','Kéo để sắp xếp','Drag to reorder')
s('create.photos.caption','Chú thích…','Caption…')
s('create.photos.uploading','Đang tải ảnh lên… {percent}%','Uploading photos… {percent}%')
s('create.photos.tooBig','Ảnh quá lớn (tối đa {mb} MB).','Photo too large (max {mb} MB).')
s('create.photos.badFormat','Định dạng chưa hỗ trợ. Hãy dùng JPG, PNG, HEIC hoặc WebP.','Unsupported format. Use JPG, PNG, HEIC or WebP.')
s('create.photos.consent','Tôi xác nhận những người có trong ảnh đã đồng ý cho chia sẻ.','I confirm everyone in these photos has agreed to share them.')
s('create.music.prompt','Dán liên kết bài hát (YouTube hoặc Spotify)','Paste a song link (YouTube or Spotify)')
s('create.music.startAt','Bắt đầu từ {time}','Start at {time}')
s('create.music.linkOnly','Liên kết này không phát được trong quà. Người nhận sẽ được mở sang {service}.','This link can\'t play inside the gift. The recipient will be sent to {service}.')
s('create.music.invalid','Liên kết chưa đúng. Hãy dán liên kết bài hát từ YouTube hoặc Spotify.','That link doesn\'t look right. Paste a song link from YouTube or Spotify.')
s('create.music.embedBlocked','Video này không cho phép phát trên trang khác. Hãy chọn video khác nhé.','This video doesn\'t allow playback on other sites. Please choose another.')
s('create.voice.title','Ghi âm lời nhắn','Record a voice note')
s('create.voice.record','Bắt đầu ghi','Start recording')
s('create.voice.recording','Đang ghi… {time}','Recording… {time}')
s('create.voice.stop','Dừng','Stop')
s('create.voice.redo','Ghi lại','Record again')
s('create.voice.listen','Nghe thử','Play back')
s('create.voice.max','Tối đa {seconds} giây','Up to {seconds} seconds')
s('create.memories.add','Thêm kỷ niệm','Add a memory')
s('create.memories.date','Ngày','Date')
s('create.memories.place','Địa điểm','Place')
s('create.memories.startDate','Ngày bắt đầu yêu nhau','The day you got together')
s('create.memories.countFirstDay','Tính ngày đầu tiên là ngày 1','Count the first day as day 1')
s('create.map.pickCity','Chọn thành phố trên bản đồ vẽ tay','Pick a city on the painted map')
s('create.map.otherCity','Nơi khác (chỉ ghi tên)','Somewhere else (name only)')
s('create.map.dropPin','Chạm vào bản đồ để cắm ghim','Tap the map to drop a pin')
s('create.map.warning','Ai có liên kết cũng xem được tên địa điểm bạn ghi.','Anyone with the link can see the place names you add.')
s('create.schedule.title','Hẹn giờ mở quà','Schedule the opening')
s('create.schedule.now','Mở ngay khi nhận','Opens as soon as it\'s received')
s('create.schedule.at','Mở lúc {time}, {date}','Opens at {time} on {date}')
s('create.schedule.timezone','Giờ Việt Nam (GMT+7)','Vietnam time (GMT+7)')
s('create.secret.toggle','Thêm câu hỏi bí mật','Add a secret question')
s('create.secret.question','Câu hỏi','Question')
s('create.secret.answer','Câu trả lời','Answer')
s('create.secret.example','Ví dụ: “Mình gặp nhau lần đầu ở đâu?”','e.g. "Where did we first meet?"')
s('create.secret.publicHint','Gợi ý (ai có liên kết cũng thấy)','Hint (visible to anyone with the link)')
s('create.expiry.label','Tự xóa sau {days} ngày','Auto-delete after {days} days')
s('create.preview.cta','Xem trước như người nhận','Preview as the recipient')
s('create.preview.lowEnd','Xem như máy yếu','Preview as a low-end phone')
s('create.preview.fastForward','Tua nhanh ×3','Fast-forward ×3')
s('create.publish.cta','Gói quà','Wrap the gift')
s('create.publish.wrapping','Đang gói quà…','Wrapping your gift…')
s('create.publish.ready','Quà đã sẵn sàng!','Your gift is ready!')
s('create.share.zalo','Gửi qua Zalo','Send via Zalo')
s('create.share.messenger','Gửi qua Messenger','Send via Messenger')
s('create.share.qr','Tải mã QR','Download QR code')
s('create.share.message','{Self} có quà cho {you} nè: {url}','I have a gift for you: {url}')
s('create.share.manage','Quản lý món quà','Manage this gift')
s('create.share.update','Gửi bản cập nhật','Send an update')
s('create.status.sent','Đã gửi','Sent')
s('create.status.opened','Đã mở','Opened')
s('create.status.replied','Đã trả lời','Replied')
s('create.share.revoke','Thu hồi món quà','Withdraw this gift')
s('create.share.revokeLink','Thu hồi liên kết này','Revoke this link')
s('create.share.revokeConfirm','Thu hồi xong thì liên kết sẽ không mở được nữa. Bạn chắc chứ?','Once withdrawn, the link will stop working. Are you sure?')

# ---------- occasions ----------
for k, vi, en in [
 ('valentine','Valentine 14/2','Valentine\'s Day (14 Feb)'),
 ('whiteDay','Valentine Trắng 14/3','White Day (14 Mar)'),
 ('womensDay','Quốc tế Phụ nữ 8/3','International Women\'s Day (8 Mar)'),
 ('vnWomensDay','Ngày Phụ nữ Việt Nam 20/10','Vietnamese Women\'s Day (20 Oct)'),
 ('menDay','Ngày Quốc tế Nam giới 19/11','International Men\'s Day (19 Nov)'),
 ('thatTich','Thất Tịch 7/7 âm lịch','Thất Tịch (7th day, 7th lunar month)'),
 ('tet','Tết Nguyên Đán','Lunar New Year (Tết)'),
 ('trungThu','Tết Trung Thu','Mid-Autumn Festival'),
 ('christmas','Giáng sinh','Christmas'),
 ('newYear','Năm mới','New Year'),
 ('birthday','Sinh nhật','Birthday'),
 ('anniversary','Kỷ niệm ngày yêu nhau','Relationship anniversary'),
 ('dayMilestone','Tròn {days} ngày yêu','{days} days together'),
 ('graduation','Tốt nghiệp','Graduation'),
 ('sorry','Xin lỗi','Saying sorry'),
 ('missYou','Nhớ nhau / Yêu xa','Missing you / long distance'),
 ('justBecause','Không cần lý do','Just because'),
 ('selfLove','Tự thưởng cho mình','Treat yourself'),
]: s('occasion.'+k, vi, en)

# ---------- themes (original names) ----------
for k, vi, en in [
 ('gardenEnvelope','Phong Thư Vườn','Garden envelope'),
 ('sweetGingham','Hộp Ngọt','Sweet box'),
 ('boothStripes','Sọc Hồng','Pink stripes'),
 ('cloudLyric','Mây Lời Ca','Lyric clouds'),
 ('oliNotebook','Vở Ô Li','School notebook'),
 ('liXiRed','Lì xì đỏ','Red envelope'),
 ('maiDao','Mai vàng – Đào hồng','Apricot & peach blossoms'),
 ('hoaSua','Hà Nội mùa hoa sữa','Hanoi milk-flower autumn'),
 ('cucHoaMi','Cúc họa mi tháng Mười Một','November daisies'),
 ('phuong','Mùa phượng','Flame-tree summer'),
 ('daLat','Sương Đà Lạt','Đà Lạt mist'),
 ('sen','Sen hồng','Pink lotus'),
 ('phin','Cà phê phin','Phin coffee'),
 ('cheFlan','Hộp chè & bánh flan','Chè & flan box'),
 ('mooncake','Hộp bánh trung thu','Mooncake box'),
 ('lantern','Phố đèn lồng','Lantern street'),
 ('oThuoc','Cầu Ô Thước','Magpie bridge'),
 ('cassette','Băng cát-xét Sài Gòn','Saigon cassette'),
 ('bikeFlowers','Xe đạp chở hoa','Flower bicycle'),
 ('photoStrip','Dải ảnh photobooth','Photobooth strip'),
]: s('theme.'+k, vi, en)

# ---------- booth: self-photobooth (app voice) ----------
s('booth.title','Photobooth tự chụp','Self photobooth')
s('booth.landing.start','Chạm để bắt đầu','Tap to start')
s('booth.landing.coin','Thả xu để chụp','Drop a coin')
s('booth.pill.coin','thả xu','drop a coin')
s('booth.pill.smile','cười lên!','smile!')
s('booth.pill.printing','đang in…','printing…')
s('booth.pill.tapStrip','chạm vào một dải ảnh','tap a strip')
s('booth.pill.paused','tạm dừng · chạm để tiếp','paused · tap to go on')
s('booth.layout.prompt','Chọn kiểu dải ảnh','Choose a strip layout')
s('booth.layout.strip4','Dải 4 ảnh dọc','4-photo strip')
s('booth.layout.grid4','Lưới 2×2','2×2 grid')
s('booth.layout.strip3','Dải 3 ảnh dọc','3-photo strip')
s('booth.layout.single','1 ảnh polaroid','Single polaroid')
s('booth.layout.story','Story 9:16','Story 9:16')
s('booth.layout.pick4of6','Chụp 6 chọn 4','Shoot 6, keep 4')
s('booth.layout.twoUp','Hai dải: một cho bạn, một cho người ấy','Two strips: one for you, one for them')
s('booth.frame.prompt','Chọn khung','Choose a frame')
s('booth.filter.prompt','Chọn màu ảnh','Choose a look')
s('booth.filter.natural','Tự nhiên','Natural')
s('booth.filter.milk','Kem sữa','Milky cream')
s('booth.filter.film','Phim cũ','Old film')
s('booth.filter.bw','Đen trắng','Black & white')
s('booth.filter.peach','Hồng đào','Peach pink')
s('booth.filter.mist','Sương sớm','Morning mist')
s('booth.timer.label','Hẹn giờ: {seconds} giây','Timer: {seconds}s')
s('booth.mirror.label','Lật ảnh','Flip photos')
s('booth.mirror.mirror','Như gương','Like a mirror')
s('booth.mirror.true','Như người khác thấy','As others see you')
s('booth.mode.label','Chế độ','Mode')
s('booth.mode.photo','Ảnh','Photo')
s('booth.mode.boomerang','Boomerang','Boomerang')
s('booth.switchCamera','Đổi camera','Switch camera')
s('booth.screenFlash','Nháy sáng màn hình','Screen flash')
s('booth.permission.title','Cho phép dùng máy ảnh nhé','Allow camera access')
s('booth.permission.body','Ảnh được xử lý ngay trên máy bạn và không được tải lên đâu cả, trừ khi bạn chọn Gửi vào thiệp.','Photos are processed right on your device and are never uploaded anywhere unless you choose Put it in a gift card.')
s('booth.permission.cta','Cho phép máy ảnh','Allow camera')
s('booth.cameraSleep','Máy ảnh đã tắt để tiết kiệm pin','The camera turned off to save battery')
s('booth.cameraWake','Bật lại','Turn back on')
s('booth.error.denied.title','Máy ảnh đang bị chặn','Camera access is blocked')
s('booth.error.denied.ios','Vào Cài đặt › Safari › Máy ảnh, chọn Cho phép, rồi tải lại trang.','Go to Settings › Safari › Camera, choose Allow, then reload the page.')
s('booth.error.denied.android','Nhấn biểu tượng bên trái địa chỉ web › Quyền › Máy ảnh › Cho phép, rồi tải lại trang.','Tap the icon left of the address bar › Permissions › Camera › Allow, then reload.')
s('booth.error.notFound','Không tìm thấy máy ảnh trên thiết bị này.','No camera was found on this device.')
s('booth.error.inUse','Máy ảnh đang được ứng dụng khác dùng. Đóng ứng dụng đó rồi thử lại nhé.','Another app is using the camera. Close it and try again.')
s('booth.error.insecure','Cần mở trang bằng kết nối bảo mật (https) để dùng máy ảnh.','The camera needs a secure (https) connection.')
s('booth.error.overconstrained','Máy ảnh không hỗ trợ chất lượng này, đang thử chế độ thấp hơn…','Your camera doesn\'t support this quality; trying a lower one…')
s('booth.error.inApp','Trình duyệt trong {app} không mở được máy ảnh.','The in-app browser in {app} can\'t open the camera.')
s('booth.fallback.nativeCamera','Chụp bằng ứng dụng máy ảnh','Take photos with the camera app')
s('booth.fallback.pickPhotos','Chọn ảnh có sẵn','Choose existing photos')
s('booth.fallback.progress','Đã có {count}/{total} ảnh','{count}/{total} photos added')
s('booth.getReady','Chuẩn bị nhé!','Get ready!')
s('booth.shotCounter','Kiểu {index}/{total}','Shot {index}/{total}')
s('booth.countdown.3','3','3')
s('booth.countdown.2','2','2')
s('booth.countdown.1','1','1')
s('booth.smile','Cười lên nào!','Smile!')
s('booth.shutter','Tách!','Snap!')
s('booth.nextPose','Đổi dáng nào!','New pose!')
s('booth.pose.heart','Bắn tim nào','Finger heart')
s('booth.pose.silly','Làm mặt xấu đi','Pull a silly face')
s('booth.pose.dreamy','Nhìn xa xăm','Look dreamy')
s('booth.pose.bigSmile','Cười thật tươi','Big smile')
s('booth.printing','Đang in…','Printing…')
s('booth.developing','Đang rửa ảnh…','Developing…')
s('booth.tapAStrip','Chạm vào một dải ảnh','Tap a strip')
s('booth.retakeOne','Chụp lại kiểu này','Retake this shot')
s('booth.retakeAll','Chụp lại từ đầu','Start over')
s('booth.keep','Giữ','Keep')
s('booth.print','In ảnh','Print')
s('booth.again','Chụp tiếp','Shoot again')
s('booth.decorate.title','Trang trí','Decorate')
s('booth.decorate.stickers','Nhãn dán','Stickers')
s('booth.decorate.text','Thêm chữ','Add text')
s('booth.decorate.textPlaceholder','Viết gì đó…','Write something…')
s('booth.decorate.date','Ghi ngày','Date stamp')
s('booth.decorate.remove','Xóa nhãn dán','Remove sticker')
s('booth.decorate.undo','Hoàn tác','Undo')
s('booth.save.cta','Lưu ảnh','Save photo')
s('booth.save.saving','Đang lưu…','Saving…')
s('booth.save.saved','Đã lưu vào máy','Saved to your device')
s('booth.save.longPress','Nhấn giữ ảnh để lưu vào máy','Press and hold the image to save it')
s('booth.save.videoInBrowser','Mở bằng trình duyệt để lưu video','Open in your browser to save the video')
s('booth.share.cta','Chia sẻ dải ảnh','Share the strip')
s('booth.share.toGift','Gửi vào thiệp','Put it in a gift card')
s('booth.share.unsupported','Trình duyệt này chưa chia sẻ ảnh trực tiếp được. Lưu ảnh rồi gửi nhé.','This browser can\'t share images directly. Save it, then send it.')
s('booth.error.lowMemory','Máy hơi quá tải, đang giảm chất lượng ảnh để tiếp tục.','Your device is running low on memory; lowering photo quality to continue.')
s('booth.error.saveFailed','Chưa lưu được ảnh. Thử nhấn giữ ảnh để lưu nhé.','Couldn\'t save. Try pressing and holding the image.')
s('booth.error.storageFull','Bộ nhớ máy đã đầy. Xóa bớt rồi thử lại nhé.','Your storage is full. Free up space and try again.')
s('booth.flashWarning','Màn hình sẽ nháy sáng khi chụp. Bạn có muốn tắt nháy sáng không?','The screen flashes when a photo is taken. Turn the flash off?')
s('booth.deleteAll','Xóa toàn bộ ảnh của tôi','Delete all my photos')
s('booth.deleteAllConfirm','Ảnh sẽ bị xóa vĩnh viễn và không thể khôi phục.','Photos will be permanently deleted and can\'t be recovered.')

# ---------- payments (VND) ----------
s('pay.title','Mở khóa giao diện cao cấp','Unlock a premium theme')
s('pay.price','{price}','{price}')
s('pay.unlockFor','Mở khóa với {price}','Unlock for {price}')
s('pay.method.prompt','Chọn cách thanh toán','Choose a payment method')
s('pay.method.momo','Ví MoMo','MoMo wallet')
s('pay.method.zalopay','ZaloPay','ZaloPay')
s('pay.method.vnpay','VNPay (ứng dụng ngân hàng)','VNPay (banking app)')
s('pay.method.vietqr','Chuyển khoản ngân hàng (VietQR)','Bank transfer (VietQR)')
s('pay.method.card','Thẻ quốc tế','International card')
s('pay.scanQr','Quét mã để thanh toán','Scan to pay')
s('pay.openApp','Mở ứng dụng {wallet}','Open {wallet}')
s('pay.transferNote','Nội dung chuyển khoản: {code}','Transfer reference: {code}')
s('pay.transferNoteHint','Giữ nguyên nội dung này để hệ thống tự xác nhận.','Keep this reference unchanged so we can confirm automatically.')
s('pay.expiresIn','Mã hết hạn sau {time}','Code expires in {time}')
s('pay.pending','Đang chờ xác nhận thanh toán…','Waiting for payment confirmation…')
s('pay.success','Thanh toán thành công! Giao diện đã được mở khóa.','Payment successful! The theme is unlocked.')
s('pay.failed','Thanh toán chưa thành công.','The payment didn\'t go through.')
s('pay.failedRefund','Nếu tài khoản đã bị trừ tiền, tiền sẽ được hoàn lại trong {days} ngày làm việc.','If you were charged, the money will be refunded within {days} working days.')
s('pay.cancelled','Bạn đã hủy thanh toán.','You cancelled the payment.')
s('pay.receipt','Biên nhận','Receipt')
s('pay.orderId','Mã đơn hàng: {orderId}','Order ID: {orderId}')
s('pay.restore','Khôi phục giao dịch đã mua','Restore purchases')
s('pay.support','Cần hỗ trợ? Liên hệ {contact}','Need help? Contact {contact}')

# ---------- privacy / consent (separate, unticked by default) ----------
s('privacy.title','Quyền riêng tư của bạn','Your privacy')
s('privacy.notice','Trước khi tiếp tục, bạn đọc nhanh cách chúng tôi xử lý ảnh, giọng nói và lời nhắn của bạn nhé.','Before you continue, here is how we handle your photos, voice and messages.')
s('privacy.consent.photos','Tôi đồng ý cho xử lý ảnh của tôi để tạo và gửi món quà này.','I agree to my photos being processed to create and deliver this gift.')
s('privacy.consent.voice','Tôi đồng ý cho xử lý bản ghi âm giọng nói của tôi để gửi kèm món quà.','I agree to my voice recording being processed to include in the gift.')
s('privacy.consent.marketing','Nhận tin về giao diện mới và ưu đãi','Get news about new themes and offers')
s('privacy.age','Tôi đã đủ 16 tuổi','I am 16 or older')
s('privacy.storageLocation','Dữ liệu được lưu tại máy chủ ở {region}.','Your data is stored on servers in {region}.')
s('privacy.retention','Món quà và ảnh sẽ tự xóa sau {days} ngày.','The gift and its photos are deleted automatically after {days} days.')
s('privacy.noFaceId','Chúng tôi không dùng ảnh hay giọng nói của bạn để nhận diện khuôn mặt hoặc giọng nói.','We never use your photos or voice for face or voice recognition.')
s('privacy.withdraw','Rút lại sự đồng ý','Withdraw consent')
s('privacy.export','Tải dữ liệu của tôi','Download my data')
s('privacy.delete','Xóa dữ liệu của tôi','Delete my data')
s('privacy.deleteConfirm','Đã ghi nhận yêu cầu. Dữ liệu của bạn sẽ được xóa trong vòng 72 giờ.','Request received. Your data will be deleted within 72 hours.')
s('privacy.policyLink','Chính sách bảo vệ dữ liệu cá nhân','Personal data protection policy')
s('privacy.mic.title','Cho phép dùng micro nhé','Allow microphone access')
s('privacy.mic.body','Micro chỉ bật khi bạn bấm ghi âm.','The microphone is only on while you record.')
s('privacy.mic.denied','Micro đang bị chặn. Hãy cho phép micro trong cài đặt trình duyệt rồi thử lại.','The microphone is blocked. Allow it in your browser settings and try again.')

# ---------- accessibility labels ----------
s('a11y.moreDrawer','Mở ngăn kéo kỷ niệm','Open the memories drawer')
s('a11y.closeDrawer','Đóng ngăn kéo','Close the drawer')
s('a11y.toggleMusic','Bật hoặc tắt nhạc','Toggle music')
s('a11y.shutter','Nút chụp','Shutter')
s('a11y.continueObject','Tiếp tục sang phần kế tiếp','Continue to the next part')
s('a11y.envelope','Phong bì quà, chạm để mở','Gift envelope, tap to open')
s('a11y.ribbon','Dải nơ, kéo sang bên để mở hộp','Ribbon, drag aside to open the box')
s('a11y.box','Hộp quà, kéo nơ hoặc chạm vào nơ để mở','Gift box, pull or tap the bow to open')
s('a11y.insertCoin','Thả xu để bắt đầu chụp','Drop the coin to start the photos')
s('a11y.notebook','Sổ tay quà, chạm để lật trang','Gift notebook, tap to turn the page')
s('a11y.reducedMotion','Đã giảm hiệu ứng chuyển động theo cài đặt của máy','Motion reduced to match your device settings')
s('a11y.reducedMotionToggle','Giảm chuyển động','Reduce motion')
s('a11y.openFallback','Mở','Open')

# ---------- link preview (OG; server-rendered, never shows content) ----------
s('og.title','{senderName} gửi {recipientName} một món quà 💌','{senderName} sent {recipientName} a gift 💌')
s('og.anonymousTitle','Ai đó gửi bạn một món quà','Someone sent you a gift')
s('og.description','Chạm để mở','Tap to open')
s('og.lockedDescription','Mở vào {date}','Opens on {date}')

# ---------- starter kit: app shell, landing, lab (owner: scaffold; app voice) ----------
s('app.title','Quà tặng','Gifts')
s('app.home','Về trang đầu','Home')
s('app.notFound','Không tìm thấy trang này.','Page not found.')
s('landing.title','Một món quà nhỏ cho người thương','A little gift for someone you love')
s('landing.subtitle','Gói một lá thư, vài tấm ảnh và thật nhiều hoa, rồi gửi bằng một đường liên kết.','Wrap a letter, a few photos and plenty of flowers, then send it as a link.')
s('landing.gift','Tặng quà','Send a gift')
s('landing.giftHint','Tạo thiệp và gửi liên kết cho người ấy','Make a card and send the link')
s('landing.booth','Photobooth','Photobooth')
s('landing.boothHint','Tự chụp dải ảnh ngay trên máy của bạn','Shoot a photo strip on your own device')
s('landing.sample','Mở thử một món quà mẫu','Open a sample gift')
s('lab.title','Phòng thử chuyển động','Motion lab')
s('lab.intro','Mỗi mục là một chuyển động gốc. Chạm “Chạy lại” để xem lần nữa.','Each entry is one primitive. Tap “Replay” to run it again.')
s('lab.replay','Chạy lại','Replay')
s('lab.empty','Chưa có mục nào trong phòng thử.','No lab entries yet.')
s('lab.all','Tất cả','All')
s('lab.stub','Chưa làm','Not built yet')
s('lab.speed','Tốc độ ×{speed}','Speed ×{speed}')

# ---------- starter kit: primitives builder adds keys here (owner: primitives) ----------
s('lab.prim.typeShort','Hôm nay trời trong, mình đi dạo một vòng nhé.','The sky is clear today, let us take a little walk.')
s('lab.prim.typeLong','Có những ngày rất bình thường: một ly cà phê sữa đá, một cơn mưa bóng mây, một tin nhắn hỏi đã ăn cơm chưa. Vậy mà nhớ lại, chính những ngày ấy làm mình thấy ấm lòng nhất. Cảm ơn vì đã ở cạnh nhau qua từng ngày như thế.','Some days are very ordinary: an iced milk coffee, a sun shower, a message asking whether you have eaten. Looking back, those are the days that warm me most. Thank you for being there through each of them.')
s('lab.prim.lyric','Chiều nay nắng vàng như mật ong','This afternoon the sun is honey-gold')
s('lab.prim.lyricDreamy','Mình cứ đi chậm thôi, hoa nở dọc đường','Let us walk slowly, flowers bloom along the way')
s('lab.prim.pageOne','Trang một: hồi mình mới quen','Page one: when we first met')
s('lab.prim.pageTwo','Trang hai: chuyến đi biển đầu tiên','Page two: our first trip to the sea')
s('lab.prim.next','Đổi trang','Next page')
s('lab.prim.toggle','Mở / đóng','Open / close')
s('lab.prim.fire','Chụp','Shoot')
s('lab.prim.impulse','Chạm nhẹ','Nudge')
s('lab.prim.play','Phát','Play')
s('lab.prim.pause','Dừng','Pause')
s('lab.prim.buffer','Đang chờ','Waiting')
s('lab.prim.ready','Đã đọc xong','Read it all')
s('lab.prim.bite','Bánh bò','Honeycomb cake')
s('lab.prim.tooltip','Chạm vào nơ để mở','Tap the ribbon to open')
s('lab.prim.stateA','Phong bì','Envelope')
s('lab.prim.stateB','Thư mở','Letter open')

# ---------- starter kit: fx builder adds keys here (owner: fx) ----------
s('fx.lab.play','Chạy','Play')
s('fx.lab.pause','Dừng','Pause')
s('fx.lab.scrub','Tua hiệu ứng','Scrub the effect')
s('fx.lab.time','{ms} / {total} ms','{ms} / {total} ms')
s('fx.lab.cover','Che phủ {pct}%','Cover {pct}%')
s('fx.lab.covered','Đã che kín, đổi cảnh','Covered, swap now')
s('fx.lab.sprites','{n} hình','{n} sprites')
s('fx.lab.tier','Cấu hình máy: {tier}','Device tier: {tier}')
s('fx.lab.reducedNote','Giảm chuyển động: chỉ mờ dần','Reduced motion: short fade only')

# ---------- starter kit: booth builder adds keys here (owner: booth) ----------
s('booth.frame.stripes','Sọc kẹo','Candy stripes')
s('booth.frame.garden','Vườn hoa','Garden')
s('booth.frame.gingham','Ca rô','Gingham')
s('booth.cadence.label','Nhịp chụp','Pace')
s('booth.cadence.product','Thong thả','Relaxed')
s('booth.cadence.quick','Nhanh','Quick')
s('booth.timer.option','{seconds} giây','{seconds} s')
s('booth.option.on','Bật','On')
s('booth.option.off','Tắt','Off')
s('booth.caption.default','Mình bên nhau','Us, together')
s('booth.footer.date','{solar} · {lunar}','{solar} · {lunar}')
s('booth.error.unknown','Chưa mở được máy ảnh. Thử lại hoặc chọn ảnh có sẵn nhé.','Could not open the camera. Try again or pick existing photos.')
s('booth.fallback.or','Hoặc dùng ảnh trong máy','Or use photos from your phone')
s('booth.fallback.needMore','Chọn thêm {count} ảnh nữa nhé','Pick {count} more photos')
s('booth.a11y.preview','Khung hình máy ảnh','Camera preview')
s('booth.a11y.shot','Ảnh {index}','Photo {index}')
s('booth.a11y.strip','Dải ảnh vừa in, nhấn giữ để lưu','The printed strip, long-press to save')
s('booth.a11y.shutter','Thả xu để chụp – bắt đầu chụp 4 kiểu','Drop a coin – start the 4-shot countdown')
s('booth.privacy','Ảnh chỉ nằm trên máy bạn.','Photos stay on your device.')
s('booth.lab.strip','Dải ảnh 600×1800 (ảnh mẫu)','600×1800 strip (sample photos)')
s('booth.lab.lunar','Ngày âm lịch','Lunar date')

# ---------- starter kit: gift builder adds keys here (owner: gift) ----------
s('create.link.cta','Tạo liên kết','Create link')
s('create.link.title','Liên kết quà của bạn','Your gift link')
s('create.link.open','Mở thử liên kết','Open the link')
s('create.link.long','Liên kết khá dài vì có ảnh bên trong. Gửi qua tin nhắn vẫn được, nhưng vài ứng dụng có thể cắt bớt.','The link is long because the photos are inside it. Messaging works, but some apps may cut it.')
s('create.link.edit','Sửa tiếp','Keep editing')
s('create.photos.tooHeavy','Liên kết đã đầy ảnh rồi. Bớt một ảnh để thêm ảnh mới nhé.','The link is full of photos. Remove one to add another.')
s('create.photos.remove','Xóa ảnh {index}','Remove photo {index}')
s('create.photos.count','{count}/{max} ảnh','{count}/{max} photos')
s('create.photos.local','Ảnh được thu nhỏ ngay trên máy và nằm trong liên kết, không tải lên đâu cả.','Photos are shrunk on your device and live inside the link; nothing is uploaded.')
s('create.photos.consentNeeded','Đánh dấu ô xác nhận để tiếp tục nhé.','Tick the confirmation box to continue.')
s('create.photos.failed','Không đọc được ảnh này. Thử ảnh khác nhé.','Could not read this photo. Try another one.')
s('create.names.recipientRequired','Nhập tên người nhận nhé.','Enter the recipient name.')
s('create.names.senderRequired','Nhập tên của bạn nhé.','Enter your name.')
s('create.names.tooLong','Tối đa {max} ký tự.','Up to {max} characters.')
s('create.letter.greeting','Lời mở đầu','Greeting')
s('create.letter.body','Nội dung thư','Letter')
s('create.letter.signature','Ký tên','Signature')
s('create.letter.font','Kiểu chữ','Lettering')
s('create.letter.fontHandBody','Nét tròn','Rounded hand')
s('create.letter.fontScriptSignature','Nét ký','Signature script')
s('create.letter.fontScriptDisplay','Nét bay','Flowing script')
s('create.letter.bodyRequired','Viết ít nhất một chữ nhé.','Write at least one character.')
s('create.music.title','Tên bài hát','Song title')
s('create.music.titlePlaceholder','Ví dụ: Bài hát của hai đứa','For example: our song')
s('create.music.ok','Đã nhận liên kết {service}.','{service} link added.')
s('create.music.link','Liên kết bài hát','Song link')
s('create.preview.close','Thoát xem trước','Close preview')
s('create.preview.badge','Xem trước ×3','Preview ×3')
s('create.review.ready','Xem lại một lượt rồi tạo liên kết nhé.','Have a last look, then create the link.')
s('create.mechanic.envelopeHint','Chạm mở thư, hoa nở kín màn hình','Tap to open; flowers bloom across the screen')
s('create.mechanic.boxHint','Kéo nơ, mở nắp, nếm từng món ngọt','Pull the ribbon, lift the lid, taste each treat')
s('gift.treats.aria','Món ngọt {index}, chạm để nếm thử','Treat {index}, tap to taste')
s('gift.photos.open','Xem ảnh {index}','View photo {index}')
s('gift.songs.empty','Chưa có bài hát nào.','No songs yet.')
s('gift.songs.openLink','Mở bài hát','Open the song')
s('gift.end.from','Từ {senderName}, với thật nhiều thương mến','From {senderName}, with love')

# ---------- formats ----------
s('format.date','{d}/{m}/{y}','{m}/{d}/{y}')
s('format.lunarDate','{d}/{m} âm lịch','{d}/{m} (lunar)')
s('format.lunarDateLeap','{d}/{m} nhuận âm lịch','{d}/{m} leap (lunar)')
s('format.dayCount','{days} ngày','{days} days')
s('format.duration','{minutes}:{seconds}','{minutes}:{seconds}')

PRONOUN_PH = {'self','Self','you','You','we','We','nha'}
meta = {
  'locale': {'vi': 'vi-VN', 'en': 'en'},
  'normalization': 'NFC (all strings verified with unicodedata.is_normalized)',
  'toneStyle': 'traditional tone placement used consistently in UI copy: hòa, thủy, khỏe, hủy, tùy',
  'format': 'ICU MessageFormat-style {placeholders}. Vietnamese has no plural forms, so counts are interpolated directly; en strings may be wrapped with ICU plural at integration time.',
  'voice': {
    'gift.*': 'sender voice to recipient: resolves {self}/{Self}/{you}/{You}/{we}/{We}/{nha} from pronouns + tone',
    'gift.error.*': 'app voice (neutral, polite "bạn")',
    'gift.report, gift.removeMyPhoto, gift.updatedPill, gift.lite, og.*': 'app voice (neutral; shown to the recipient by the product, not by the sender)',
    'create.*, booth.*, pay.*, privacy.*, inapp.*, common.*, a11y.*': 'app voice addressing the user as "bạn"; booth is self-use so no sender pronouns',
    'create.share.message, create.message.suggest*': 'sender voice (prefilled text the sender can edit)'
  },
  'case': 'Keys under booth.pill.*, gift.pill.* and gift.label.* are diegetic status pills and hand labels: written lowercase in the source (never lowercased at runtime, which would also lowercase names). Everything else (buttons, errors, legal, aria) is sentence case. CSS text-transform is banned on Vietnamese.',
  'placeholderRules': 'Capitalised placeholder ({Self}, {You}, {We}) is used only at sentence start. Never capitalise by CSS text-transform; use the provided capitalised value. Names ({recipientName}, {senderName}) are inserted verbatim after NFC normalisation; never upper-case them.'
}
pronouns = {
  'anh-em':  {'label': 'create.pronouns.anhEm',  'self':'anh','Self':'Anh','you':'em','You':'Em','we':'mình','We':'Mình'},
  'em-anh':  {'label': 'create.pronouns.emAnh',  'self':'em','Self':'Em','you':'anh','You':'Anh','we':'mình','We':'Mình'},
  'to-cau':  {'label': 'create.pronouns.toCau',  'self':'tớ','Self':'Tớ','you':'cậu','You':'Cậu','we':'tụi mình','We':'Tụi mình'},
  'minh-ban':{'label': 'create.pronouns.minhBan','self':'mình','Self':'Mình','you':'bạn','You':'Bạn','we':'chúng mình','We':'Chúng mình'},
  'none':    {'label': 'create.pronouns.none',   'self':'mình','Self':'Mình','you':'{recipientName}','You':'{recipientName}','we':'chúng mình','We':'Chúng mình',
              'note':'Uses the recipient\'s name in place of "you"; resolve {recipientName} after pronoun substitution.'}
}
tone = {
  'north': {'nha':'nhé', 'weOverride': {'to-cau': ['bọn mình','Bọn mình']}},
  'south': {'nha':'nha', 'weOverride': {}}
}

# ---------- validation ----------
errs = []
keys = [k for k,_,_ in S]
dups = {k for k in keys if keys.count(k) > 1}
if dups: errs.append(f'duplicate keys: {dups}')
ph = re.compile(r'\{(\w+)\}')
for k, vi, en in S:
    for lang, t in (('vi',vi),('en',en)):
        if not unicodedata.is_normalized('NFC', t): errs.append(f'not NFC: {k} {lang}')
        if '...' in t: errs.append(f'use … not ... : {k} {lang}')
    pv = set(ph.findall(vi)) - PRONOUN_PH
    pe = set(ph.findall(en)) - PRONOUN_PH
    if pv != pe: errs.append(f'placeholder mismatch {k}: vi={pv} en={pe}')
    if set(ph.findall(vi)) & PRONOUN_PH and not (k.startswith('gift.') or k.startswith('create.share.message') or k.startswith('create.message.suggest')):
        errs.append(f'pronoun placeholder outside sender-voice key: {k}')
LOWER = ('booth.pill.', 'gift.pill.', 'gift.label.')
for k, vi, en in S:
    if k.startswith(LOWER):
        bare = ph.sub('', vi)
        if bare != bare.lower(): errs.append(f'lowercase key has capitals: {k}')
if errs:
    print('\n'.join(errs)); sys.exit(1)

doc = {'$meta': meta, 'pronouns': pronouns, 'tone': tone,
       'vi': {k: vi for k,vi,_ in S}, 'en': {k: en for k,_,en in S}}
with open(OUT,'w',encoding='utf-8') as f:
    json.dump(doc, f, ensure_ascii=False, indent=1)
print('ok', len(S), 'strings ->', os.path.abspath(OUT))

# sample render
def render(t, pset, tn):
    p = dict(pronouns[pset]); p['nha'] = tone[tn]['nha']
    ov = tone[tn]['weOverride'].get(pset)
    if ov: p['we'], p['We'] = ov
    for kk in PRONOUN_PH: t = t.replace('{'+kk+'}', p[kk])
    return t
for pset in pronouns:
    print(pset, '|', render(doc['vi']['gift.landing.from'], pset, 'south'), '|', render(doc['vi']['gift.days.together'], pset, 'north'), '|', render(doc['vi']['gift.treats.done'], pset, 'north'))
