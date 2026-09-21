const TRIP_DATA = {
  destinations: [
    {
      id: "dalat",
      name: "Đà Lạt - Thành Phố Mộng Mơ",
      city: "Lâm Đồng",
      category: "chill",
      categoryName: "Nghỉ dưỡng & Chill",
      badge: "Yêu thích nhất",
      image: "https://cdn3.ivivu.com/2023/10/du-lich-Da-Lat-ivivu.jpg",
      rating: 4.9,
      reviewCount: 342,
      avgCostPerDay: 750000,
      costLevel: "Tiết kiệm",
      idealDays: "3 ngày 2 đêm",
      description: "Thành phố ngàn hoa với không khí se lạnh, đồi thông bạt ngàn, quán cà phê ngắm hoàng hôn và ẩm thực ấm nóng.",
      tags: ["Săn mây", "Cà phê view đồi", "Lẩu gà lá é", "Đồi thông"],
    },
    {
      id: "hagiang",
      name: "Hà Giang - Chinh Phục Cực Bắc",
      city: "Hà Giang",
      category: "adventure",
      categoryName: "Khám phá mạo hiểm",
      badge: "Hùng vĩ",
      image: "https://dulich3mien.vn/wp-content/uploads/2023/01/Cot-co-Lung-Cu-1.jpg",
      rating: 4.95,
      reviewCount: 280,
      avgCostPerDay: 900000,
      costLevel: "Vừa phải",
      idealDays: "3 ngày 2 đêm",
      description: "Cung đường phượt huyền thoại với đèo Mã Pí Lèng hiểm trở, dòng sông Nho Quế xanh ngọc bích và văn hóa H'Mông.",
      tags: ["Đèo Mã Pí Lèng", "Sông Nho Quế", "Cột cờ Lũng Cú", "Phượt xe máy"],
    },
    {
      id: "sapa",
      name: "Sa Pa - Xứ Sở Sương Mù & Fansipan",
      city: "Lào Cai",
      category: "chill",
      categoryName: "Nghỉ dưỡng & Núi non",
      badge: "Săn mây",
      image: "https://cdn.ohanapreschool.edu.vn/wp-content/uploads/2025/12/lang-le-sa-pa-sang-tac-nam-nao-1.jpg",
      rating: 4.88,
      reviewCount: 310,
      avgCostPerDay: 800000,
      costLevel: "Vừa phải",
      idealDays: "3 ngày 2 đêm",
      description: "Đỉnh Fansipan 3.143m Nóc nhà Đông Dương, ruộng bậc thang kỳ vĩ và bản làng thổ cẩm người Dao Đỏ, H'Mông.",
      tags: ["Fansipan", "Bản Cát Cát", "Lẩu cá hồi", "Đèo Ô Quy Hồ"],
    },
    {
      id: "ninhbinh",
      name: "Ninh Bình - Vịnh Hạ Long Trên Cạn",
      city: "Ninh Bình",
      category: "nature",
      categoryName: "Thiên nhiên & Di sản",
      badge: "Di sản UNESCO",
      image: "https://amazingourworld.com/wp-content/uploads/2020/05/Tour-Ninh-Binh-Ha-Lonh-.jpg",
      rating: 4.9,
      reviewCount: 198,
      avgCostPerDay: 650000,
      costLevel: "Tiết kiệm",
      idealDays: "2 ngày 1 đêm",
      description: "Ngồi thuyền nan xuôi dòng Tràng An xuyên qua hang động kỳ bí, leo đỉnh Hang Múa ngắm trọn Tam Cốc.",
      tags: ["Tràng An", "Hang Múa", "Dê núi Ninh Bình", "Tuyệt Tình Cốc"],
    },
    {
      id: "halong",
      name: "Hạ Long - Kỳ Quan Thiên Nhiên Thế Giới",
      city: "Quảng Ninh",
      category: "nature",
      categoryName: "Thiên nhiên & Biển đảo",
      badge: "Kỳ quan thế giới",
      image: "https://storage.attractionsvietnam.com/images/m-1/lqCwfs9pkW2I5wib.jpg?w=1200&fm=webp&q=80",
      rating: 4.93,
      reviewCount: 620,
      avgCostPerDay: 1100000,
      costLevel: "Cao cấp",
      idealDays: "2 ngày 1 đêm",
      description: "Du thuyền 5 sao giữa hàng ngàn đảo đá vôi kỳ vĩ nhô lên từ làn nước ngọc bích, khám phá Hang Sửng Sốt và Đảo Ti Tốp.",
      tags: ["Du thuyền Hạ Long", "Hang Sửng Sốt", "Đảo Ti Tốp", "Chả mực Bãi Cháy"],
    },
    {
      id: "taxua",
      name: "Tà Xùa - Thiên Đường Săn Mây Vùng Tây Bắc",
      city: "Sơn La",
      category: "adventure",
      categoryName: "Phượt & Săn mây",
      badge: "Cực hot",
      image: "https://dulichtaxua.com.vn/wp-content/uploads/2022/11/le-huynh-1-16640686508761668459475-1536x1024.jpeg",
      rating: 4.94,
      reviewCount: 295,
      avgCostPerDay: 720000,
      costLevel: "Tiết kiệm",
      idealDays: "2 ngày 1 đêm",
      description: "Sống lưng khủng long Háng Đồng giữa biển mây trắng muốt bồng bềnh, mỏm cá heo và cây táo mèo cô đơn.",
      tags: ["Sống lưng khủng long", "Mỏm cá heo", "Biển mây Tà Xùa", "Trà Shan Tuyết"],
    },
    {
      id: "mocchau",
      name: "Mộc Châu - Cao Nguyên Xanh & Mùa Hoa Mận",
      city: "Sơn La",
      category: "nature",
      categoryName: "Cao nguyên & Mùa hoa",
      badge: "Thơ mộng",
      image: "https://media-cdn-v2.laodong.vn/storage/newsportal/2025/2/11/1461380/Vuon_Hoa_Man-03.jpg",
      rating: 4.85,
      reviewCount: 210,
      avgCostPerDay: 650000,
      costLevel: "Tiết kiệm",
      idealDays: "2 ngày 1 đêm",
      description: "Đồi chè trái tim xanh mướt uốn lượn, thung lũng mận Nà Ka trắng muốt và rừng thông Bản Áng thanh bình.",
      tags: ["Đồi chè trái tim", "Thung lũng Nà Ka", "Rừng thông Bản Áng", "Bê chao"],
    },
    {
      id: "caobang",
      name: "Cao Bằng - Thác Bản Giốc & Suối Lê-Nin",
      city: "Cao Bằng",
      category: "nature",
      categoryName: "Non nước & Di sản",
      badge: "Kỳ vĩ",
      image: "https://thienthanhlimousine.com/wp-content/uploads/2025/12/Canh-nui-rung-Cao-Bang-hien-ra-hung-vi-suot-doc-tuyen-duong-di-Ban-Gioc.jpg",
      rating: 4.91,
      reviewCount: 170,
      avgCostPerDay: 750000,
      costLevel: "Tiết kiệm",
      idealDays: "3 ngày 2 đêm",
      description: "Thác nước tự nhiên lớn nhất Đông Nam Á tuôn trào trắng xóa giữa biên cương và dòng suối Lê-Nin xanh màu ngọc bích.",
      tags: ["Thác Bản Giốc", "Suối Lê-Nin", "Động Ngườm Ngao", "Vịt quay 7 vị"],
    },
    {
      id: "hanoi",
      name: "Hà Nội - Thủ Đô 36 Phố Phường Nghìn Năm",
      city: "Hà Nội",
      category: "city",
      categoryName: "Văn hóa & Thủ đô",
      badge: "Văn hiến",
      image: "https://nguoikesu.com/images/wiki/ho-hoan-kiem/1cb42f288faf93b63e65aa01d3d4629d.jpg",
      rating: 4.88,
      reviewCount: 520,
      avgCostPerDay: 700000,
      costLevel: "Tiết kiệm",
      idealDays: "2 ngày 1 đêm",
      description: "Dạo Hồ Hoàn Kiếm, ngắm phố cổ rêu phong, thưởng thức phở bò Bát Đàn, bún chả Hương Liên và cà phê trứng Giảng.",
      tags: ["Hồ Gươm", "Phố cổ Hà Nội", "Phở bò Bát Đàn", "Cà phê trứng"],
    },
    {
      id: "maichau",
      name: "Mai Châu - Bản Lát Yên Bình & Thung Lũng Xanh",
      city: "Hòa Bình",
      category: "chill",
      categoryName: "Nghỉ dưỡng & Bản làng",
      badge: "Bình yên",
      image: "https://bizweb.dktcdn.net/100/072/558/files/ban-lac-mai-chau-1.jpg?v=1573550153255",
      rating: 4.82,
      reviewCount: 160,
      avgCostPerDay: 600000,
      costLevel: "Rất tiết kiệm",
      idealDays: "2 ngày 1 đêm",
      description: "Đạp xe ngắm những cánh đồng lúa xanh ngút ngàn tại Bản Lác, trải nghiệm ngủ nhà sàn người Thái và múa sạp.",
      tags: ["Bản Lác Mai Châu", "Cơm lam thịt nướng", "Múa xòe Thái", "Đạp xe ngắm lúa"],
    },
    {
      id: "coto",
      name: "Cô Tô - Thiên Đường Biển Đảo Đông Bắc",
      city: "Quảng Ninh",
      category: "beach",
      categoryName: "Biển đảo hoang sơ",
      badge: "Nước trong vắt",
      image: "https://cdn-petrotimes.mastercms.vn/stores/news_dataimages/2023/112023/26/19/co-to-thien-duong-cua-nhung-hon-dao-dep-20231126191456.jpg?rt=20231126191544",
      rating: 4.86,
      reviewCount: 190,
      avgCostPerDay: 850000,
      costLevel: "Vừa phải",
      idealDays: "3 ngày 2 đêm",
      description: "Bãi biển Vàn Chảy, Hồng Vàn hoang sơ với bãi cát dài trắng mịn, bãi đá Cầu Mỵ sóng vỗ rì rào và hải sản tươi sống.",
      tags: ["Bãi đá Cầu Mỵ", "Bãi biển Hồng Vàn", "Hải sản Cô Tô", "Đảo Cô Tô con"],
    },
    {
      id: "catba",
      name: "Cát Bà - Vịnh Lan Hạ & Vườn Quốc Gia",
      city: "Hải Phòng",
      category: "nature",
      categoryName: "Biển đảo & Vịnh biển",
      badge: "Xanh mướt",
      image: "https://www.tauhalong.vn/wp-content/uploads/2024/08/di-san-dia-chat-vinh-ha-long.jpg",
      rating: 4.87,
      reviewCount: 275,
      avgCostPerDay: 800000,
      costLevel: "Vừa phải",
      idealDays: "2 ngày 1 đêm",
      description: "Chèo thuyền Kayak khám phá Vịnh Lan Hạ trong xanh, thám hiểm Vườn quốc gia Cát Bà và ngắm khỉ tại Đảo Khỉ.",
      tags: ["Vịnh Lan Hạ", "Kayak Cát Bà", "Vườn quốc gia", "Bánh đa cua Hải Phòng"],
    },
    {
      id: "tamdao",
      name: "Tam Đảo - Thị Trấn Bồng Bềnh Trong Mây",
      city: "Vĩnh Phúc",
      category: "chill",
      categoryName: "Nghỉ dưỡng gần",
      badge: "Gần Hà Nội",
      image: "https://baogiaothong.mediacdn.vn/stores/news_dataimages/thuylinh/082019/17/23/230914baoxaydung_anh3.jpg",
      rating: 4.79,
      reviewCount: 310,
      avgCostPerDay: 680000,
      costLevel: "Tiết kiệm",
      idealDays: "2 ngày 1 đêm",
      description: "Được ví như Đà Lạt miền Bắc với thời tiết 4 mùa trong 1 ngày, Cổng Trời Tam Đảo, Cầu Mây và đặc sản ngọn su su xào tỏi.",
      tags: ["Cổng Trời Tam Đảo", "Cầu Mây", "Ngọn su su", "Khí hậu mát mẻ"],
    },
    {
      id: "danang",
      name: "Đà Nẵng & Hội An - Hành Trình Di Sản",
      city: "Đà Nẵng / Quảng Nam",
      category: "city",
      categoryName: "Văn hóa & Đô thị",
      badge: "Đáng sống nhất",
      image: "https://hoangphuan.com/wp-content/uploads/2024/05/thanh0310-230322020312-du-lich-hoi-an-ve-dem-04.jpg",
      rating: 4.92,
      reviewCount: 460,
      avgCostPerDay: 850000,
      costLevel: "Vừa phải",
      idealDays: "3 ngày 2 đêm",
      description: "Biển Mỹ Khê cát trắng, Cầu Vàng Bà Nà Hills và vẻ đẹp trầm mặc lung linh đèn lồng của Phố cổ Hội An.",
      tags: ["Cầu Rồng", "Bà Nà Hills", "Phố cổ Hội An", "Mì Quảng"],
    },
    {
      id: "hue",
      name: "Huế - Cố Đô Trầm Mặc & Ẩm Thực Cung Đình",
      city: "Thừa Thiên Huế",
      category: "city",
      categoryName: "Văn hóa & Cố đô",
      badge: "Di sản",
      image: "https://image.vialala.com/width=1792,ratio=1.46,type=webp/2026/02/que-faire-a-hue-6984c3e3c7c38.jpeg",
      rating: 4.86,
      reviewCount: 220,
      avgCostPerDay: 600000,
      costLevel: "Rất tiết kiệm",
      idealDays: "2 ngày 1 đêm",
      description: "Đại Nội Hoàng Cung uy nghiêm, nghe ca Huế trên sông Hương và thưởng thức Bún bò Huế gốc cùng bánh bèo nậm lọc.",
      tags: ["Đại Nội Huế", "Sông Hương", "Bún bò Huế", "Chùa Thiên Mụ"],
    },
    {
      id: "quynhon",
      name: "Quy Nhơn - Eo Gió & Kỳ Co Trong Vắt",
      city: "Bình Định",
      category: "beach",
      categoryName: "Biển đảo hoang sơ",
      badge: "Mới nổi",
      image: "https://datviettour.com.vn/uploads/images/tin-tuc-SEO/mien-trung/quy-nhon/danh-thang/ky-co-eo-gio-2.jpg",
      rating: 4.82,
      reviewCount: 165,
      avgCostPerDay: 700000,
      costLevel: "Tiết kiệm",
      idealDays: "3 ngày 2 đêm",
      description: "Bãi biển Kỳ Co 2 màu nước xanh ngọc thấu đáy, con đường ven biển Eo Gió hùng vĩ và hải sản giá hạt dẻ.",
      tags: ["Kỳ Co", "Eo Gió", "Bánh xèo tôm nhảy", "Hải sản Nhơn Lý"],
    },
    {
      id: "nhatrang",
      name: "Nha Trang - Vịnh Biển Nắng Vàng & San Hô",
      city: "Khánh Hòa",
      category: "beach",
      categoryName: "Biển đảo & Nghỉ dưỡng",
      badge: "Sôi động",
      image: "https://cotrang.org/dia-diem/images/nha-trang/dia-diem/thap-tram-huong/thap-tram-huong-nha-trang-bk-002.jpg",
      rating: 4.87,
      reviewCount: 540,
      avgCostPerDay: 950000,
      costLevel: "Vừa phải",
      idealDays: "3 ngày 2 đêm",
      description: "Lặn biển ngắm san hô tại Hòn Mun, vui chơi công viên giải trí VinWonders Hòn Tre và tắm bùn khoáng nóng thư giãn.",
      tags: ["VinWonders Hòn Tre", "Lặn biển Hòn Mun", "Tắm bùn khoáng", "Nem nướng"],
    },
    {
      id: "phuyen",
      name: "Phú Yên - Xứ Sở Hoa Vàng Trên Cỏ Xanh",
      city: "Phú Yên",
      category: "nature",
      categoryName: "Thiên nhiên & Biển",
      badge: "Nguyên sơ",
      image: "https://tropicaltrip.vn/wp-content/uploads/2025/09/Shutterstock_2239799547-2048x1154.jpg",
      rating: 4.89,
      reviewCount: 230,
      avgCostPerDay: 650000,
      costLevel: "Tiết kiệm",
      idealDays: "3 ngày 2 đêm",
      description: "Ghềnh Đá Đĩa độc nhất vô nhị, Bãi Xép khung cảnh phim 'Tôi thấy hoa vàng trên cỏ xanh' và đón bình minh đầu tiên tại Mũi Điện.",
      tags: ["Ghềnh Đá Đĩa", "Mũi Điện", "Bãi Xép", "Mắt cá ngừ đại dương"],
    },
    {
      id: "quangbinh",
      name: "Quảng Bình - Vương Quốc Hang Động Thế Giới",
      city: "Quảng Bình",
      category: "adventure",
      categoryName: "Thám hiểm hang động",
      badge: "Đỉnh cao thám hiểm",
      image: "https://quangbinhtravel.vn/wp-content/uploads/2024/09/hang-kieu.jpg",
      rating: 4.96,
      reviewCount: 380,
      avgCostPerDay: 1100000,
      costLevel: "Cao cấp",
      idealDays: "3 ngày 2 đêm",
      description: "Kỳ quan Động Phong Nha, Động Thiên Đường tráng lệ, đu dây Zipline Sông Chày - Hang Tối và thám hiểm Sơn Đoòng.",
      tags: ["Động Phong Nha", "Động Thiên Đường", "Sông Chày Hang Tối", "Cháo canh"],
    },
    {
      id: "mangden",
      name: "Măng Đen - Nàng Thơ Của Đại Ngàn",
      city: "Kon Tum",
      category: "chill",
      categoryName: "Nghỉ dưỡng & Rừng thông",
      badge: "Chữa lành",
      image: "https://vpsglobal.vn/travel/wp-content/uploads/2026/05/PKMD3.jpg",
      rating: 4.89,
      reviewCount: 145,
      avgCostPerDay: 680000,
      costLevel: "Tiết kiệm",
      idealDays: "3 ngày 2 đêm",
      description: "Đà Lạt thứ hai của Tây Nguyên với rừng thông bạt ngàn, thác Pa Sỹ hoang sơ, hồ Đắc Ke và không khí trong lành quanh năm.",
      tags: ["Rừng thông Măng Đen", "Hồ Đắc Ke", "Thác Pa Sỹ", "Gà nướng cơm lam"],
    },
    {
      id: "buonmathuot",
      name: "Buôn Ma Thuột - Thủ Phủ Cà Phê & Thác Dray Nur",
      city: "Đắc Lắc",
      category: "culture",
      categoryName: "Văn hóa Tây Nguyên",
      badge: "Đậm đà",
      image: "https://vlstudies.com/wp-content/uploads/2024/06/Buon-Ma-Thuot.jpg",
      rating: 4.84,
      reviewCount: 205,
      avgCostPerDay: 680000,
      costLevel: "Tiết kiệm",
      idealDays: "2 ngày 1 đêm",
      description: "Bảo tàng Thế giới Cà phê kiến trúc độc đáo, cụm thác Dray Nur - Dray Sáp hùng vĩ và trải nghiệm cưỡi voi Bản Đôn.",
      tags: ["Bảo tàng Cà Phê", "Thác Dray Nur", "Hồ Lắc", "Bún chìa Đắc Lắc"],
    },
    {
      id: "phanthiet",
      name: "Phan Thiết & Mũi Né - Tiểu Sa Mạc Ven Biển",
      city: "Bình Thuận",
      category: "adventure",
      categoryName: "Phượt đồi cát & Biển",
      badge: "Trải nghiệm đỉnh",
      image: "https://vietrektravel.com/Upload/News/Huong-Dan-Chi-Tiet-Duong-Di-Doi-Cat-Bay-Mui-Ne-Phan-Thiet.jpg",
      rating: 4.83,
      reviewCount: 310,
      avgCostPerDay: 780000,
      costLevel: "Vừa phải",
      idealDays: "2 ngày 1 đêm",
      description: "Lái xe Jeep địa hình trên những đồi cát trắng Bàu Trắng, lội suối Tiên đỏ rực và thưởng thức hải sản bờ kè tươi ngon.",
      tags: ["Đồi cát Bàu Trắng", "Xe Jeep địa hình", "Suối Tiên", "Hải sản Mũi Né"],
    },
    {
      id: "ninhthuan",
      name: "Ninh Thuận - Vịnh Vĩnh Hy & Vườn Nho Trĩu Quả",
      city: "Ninh Thuận",
      category: "nature",
      categoryName: "Biển & Vườn nho",
      badge: "Nắng gió kỳ thú",
      image: "https://i.ytimg.com/vi/6gyslkmoyWY/maxresdefault.jpg",
      rating: 4.85,
      reviewCount: 180,
      avgCostPerDay: 700000,
      costLevel: "Tiết kiệm",
      idealDays: "2 ngày 1 đêm",
      description: "Vịnh Vĩnh Hy xanh biếc lọt thỏm giữa núi rừng, Hang Rái kỳ ảo khi sóng vỗ và tự tay hái nho chín mọng tại Vườn nho Ba Mọi.",
      tags: ["Vịnh Vĩnh Hy", "Hang Rái", "Vườn nho Ba Mọi", "Tháp Chàm Po Klong Garai"],
    },
    {
      id: "phuquoc",
      name: "Phú Quốc - Thiên Đường Đảo Ngọc",
      city: "Kiên Giang",
      category: "beach",
      categoryName: "Biển đảo & Nghỉ dưỡng",
      badge: "Hot Trend",
      image: "https://eaglegroup.com.vn/wp-content/uploads/2023/06/den-phu-quoc.jpeg",
      rating: 4.85,
      reviewCount: 512,
      avgCostPerDay: 1200000,
      costLevel: "Cao cấp",
      idealDays: "3 ngày 2 đêm",
      description: "Nước biển trong vắt như gương, bãi cát trắng mịn, ngắm hoàng hôn rực rỡ tại Sunset Sanato và thưởng thức Bún Quậy.",
      tags: ["Bãi Sao", "Lặn ngắm san hô", "Hoàng hôn Phú Quốc", "Bún Quậy"],
    },
    {
      id: "condao",
      name: "Côn Đảo - Vẻ Đẹp Hoang Sơ & Biển Xanh",
      city: "Bà Rịa - Vũng Tàu",
      category: "beach",
      categoryName: "Biển đảo & Tâm linh",
      badge: "Hoang sơ",
      image: "https://scootersaigontour.com/wp-content/uploads/2023/02/Con-Dao-Top-10-most-beautiful-islands-in-Vietnam.jpg",
      rating: 4.96,
      reviewCount: 185,
      avgCostPerDay: 1300000,
      costLevel: "Cao cấp",
      idealDays: "3 ngày 2 đêm",
      description: "Làn nước xanh thấu đáy, Bãi Đầm Trầu ngắm máy bay hạ cánh sát đầu và viếng Nghĩa trang Hàng Dương thiêng liêng.",
      tags: ["Bãi Đầm Trầu", "Nghĩa trang Hàng Dương", "Lặn ngắm rùa biển", "Cua mặt trăng"],
    },
    {
      id: "vungtau",
      name: "Vũng Tàu - Chuyến Đi Trốn Cuối Tuần Nhanh Gọn",
      city: "Bà Rịa - Vũng Tàu",
      category: "chill",
      categoryName: "Nghỉ dưỡng gần",
      badge: "Gần TP.HCM",
      image: "https://mia.vn/media/uploads/blog-du-lich/tuong-chua-kito-vung-tau-tuong-chua-jesus-lon-nhat-chau-a-06-1633683878.jpg",
      rating: 4.8,
      reviewCount: 380,
      avgCostPerDay: 600000,
      costLevel: "Rất tiết kiệm",
      idealDays: "2 ngày 1 đêm",
      description: "Đi trốn số 1 của giới trẻ Sài Gòn, ngắm hoàng hôn Mũi Nghinh Phong, Hải Đăng cổ và thưởng thức bánh khọt giòn rụm.",
      tags: ["Mũi Nghinh Phong", "Ngọn Hải Đăng", "Bánh khọt Gốc Vú Sữa", "Lẩu cá đuối"],
    },
    {
      id: "cantho",
      name: "Cần Thơ - Sông Nước Miền Tây & Chợ Nổi",
      city: "Cần Thơ",
      category: "city",
      categoryName: "Văn hóa & Sông nước",
      badge: "Đặc sắc",
      image: "https://mia.vn/media/uploads/blog-du-lich/kham-pha-cho-noi-cai-rang-net-dac-sac-cua-rieng-mien-tay-song-nuoc-01-1663048025.jpg",
      rating: 4.84,
      reviewCount: 230,
      avgCostPerDay: 580000,
      costLevel: "Rất tiết kiệm",
      idealDays: "2 ngày 1 đêm",
      description: "Chợ nổi Cái Răng tấp nập thuyền bè sáng sớm, dạo Bến Ninh Kiều lung linh về đêm và miệt vườn trái cây trĩu quả.",
      tags: ["Chợ nổi Cái Răng", "Bến Ninh Kiều", "Lẩu mắm", "Vườn trái cây"],
    },
    {
      id: "tayninh",
      name: "Tây Ninh - Chinh Phục Nóc Nhà Nam Bộ Núi Bà Đen",
      city: "Tây Ninh",
      category: "adventure",
      categoryName: "Leo núi & Tâm linh",
      badge: "Nóc nhà Nam Bộ",
      image: "https://bizweb.dktcdn.net/100/052/508/files/su-tich-nui-ba-den.jpg?v=1765902358358",
      rating: 4.87,
      reviewCount: 290,
      avgCostPerDay: 620000,
      costLevel: "Tiết kiệm",
      idealDays: "2 ngày 1 đêm",
      description: "Chinh phục đỉnh Núi Bà Đen 986m ngắm biển mây Tây Ninh, chiêm bái Tượng Phật Bà bằng đồng cao nhất Châu Á và Tòa Thánh Tây Ninh.",
      tags: ["Núi Bà Đen", "Tòa Thánh Tây Ninh", "Bánh tráng phơi sương", "Bò tơ Tây Ninh"],
    },
    {
      id: "angiang",
      name: "An Giang - Rừng Tràm Trà Sư & Miếu Bà Chúa Xứ",
      city: "An Giang",
      category: "nature",
      categoryName: "Sinh thái & Tâm linh",
      badge: "Mùa nước nổi",
      image: "https://media.loveitopcdn.com/40838/rung-tram-tra-su-an-giang-mua-nuoc-noi.jpg",
      rating: 4.86,
      reviewCount: 240,
      avgCostPerDay: 600000,
      costLevel: "Rất tiết kiệm",
      idealDays: "2 ngày 1 đêm",
      description: "Ngồi xuồng ba lá lướt trên thảm bèo cám xanh mướt Rừng tràm Trà Sư, viếng Miếu Bà Chúa Xứ Núi Sam và ăn lẩu cá linh bông điên điển.",
      tags: ["Rừng tràm Trà Sư", "Miếu Bà Chúa Xứ", "Bún cá Châu Đốc", "Thốt nốt"],
    },
    {
      id: "saigon",
      name: "TP. Hồ Chí Minh - Hòn Ngọc Viễn Đông Sôi Động",
      city: "Hồ Chí Minh",
      category: "city",
      categoryName: "Đô thị & Ẩm thực",
      badge: "Không ngủ",
      image: "https://kichcaudulichtphcm.vn/wp-content/uploads/2024/10/dia-diem-vui-choi-sai-gon-ve-dem-04.jpg",
      rating: 4.9,
      reviewCount: 780,
      avgCostPerDay: 750000,
      costLevel: "Tiết kiệm",
      idealDays: "2 ngày 1 đêm",
      description: "Dạo Phố đi bộ Nguyễn Huệ, ngắm Landmark 81 cao nhất Việt Nam, ngắm Sài Gòn từ xe buýt 2 tầng và food tour Chợ Bến Thành, Hẻm 200 Xóm Chiếu.",
      tags: ["Phố đi bộ Nguyễn Huệ", "Landmark 81", "Cà phê bệt", "Cơm tấm Sài Gòn"],
    },
  ],

  categories: [
    { id: "all", name: "Tất cả", icon: "✨" },
    { id: "chill", name: "Nghỉ dưỡng / Chill", icon: "☕" },
    { id: "adventure", name: "Khám phá / Phượt", icon: "🏍️" },
    { id: "beach", name: "Biển đảo", icon: "🏖️" },
    { id: "nature", name: "Thiên nhiên / Núi", icon: "⛰️" },
    { id: "city", name: "Văn hóa / Đô thị", icon: "🏮" },
  ],
};

window.TripDataService = {
  getAllDestinations: async () => {
    try {
      const res = await fetch("api/destinations.php");
      if (res.ok) {
        const json = await res.json();
        if ((json.status === "success" || json.success) && json.data && json.data.length > 0) {
          return json.data.map((d) => ({
            id: d.id,
            name: d.name,
            city: d.city,
            category: d.category_code || d.category || "chill",
            categoryName: d.category_name || "Du lịch",
            badge: d.badge || "Khám phá",
            image: d.image,
            rating: parseFloat(d.rating || 4.8),
            reviewCount: parseInt(d.review_count || 100),
            avgCostPerDay: parseInt(d.avg_cost_per_day || 750000),
            costLevel: d.cost_level || "Tiết kiệm",
            idealDays: d.ideal_days || "3 ngày 2 đêm",
            description: d.description,
            tags: [d.city, d.cost_level || "Tiết kiệm", d.category_name || "Khám phá"],
          }));
        }
      }
    } catch (e) {}
    return TRIP_DATA.destinations;
  },

  getDestinationById: async (id) => {
    try {
      const res = await fetch(`api/destinations.php?id=${id}`);
      if (res.ok) {
        const json = await res.json();
        if ((json.status === "success" || json.success) && json.data) {
          const d = json.data;
          return {
            id: d.id,
            name: d.name,
            city: d.city,
            category: d.category_code,
            categoryName: d.category_name,
            badge: d.badge,
            image: d.image,
            gallery: [d.image],
            rating: parseFloat(d.rating),
            avgCostPerDay: parseInt(d.avg_cost_per_day),
            description: d.description,
            tags: [d.city, d.cost_level, d.category_name],
            highlights: d.activities && d.activities.length > 0
              ? d.activities.map((a) => a.title)
              : [d.name],
            activities: d.activities || [],
          };
        }
      }
    } catch (e) {}

    return TRIP_DATA.destinations.find((item) => item.id === id) || null;
  },

  getCategories: () => TRIP_DATA.categories,

  filterDestinations: async (
    categoryId = "all",
    searchTerm = "",
    maxBudget = null,
    sortBy = "rating"
  ) => {
    const allDestinations = await window.TripDataService.getAllDestinations();

    let list = allDestinations.filter((item) => {
      const matchCategory = categoryId === "all" || item.category === categoryId;
      const matchSearch =
        !searchTerm ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.city.toLowerCase().includes(searchTerm.toLowerCase());
      const matchBudget = !maxBudget || item.avgCostPerDay <= maxBudget;

      return matchCategory && matchSearch && matchBudget;
    });

    if (sortBy === "rating") list.sort((a, b) => b.rating - a.rating);
    else if (sortBy === "price_asc") list.sort((a, b) => a.avgCostPerDay - b.avgCostPerDay);
    else if (sortBy === "price_desc") list.sort((a, b) => b.avgCostPerDay - a.avgCostPerDay);

    return list;
  },

  getFavorites: async () => {
    try {
      const res = await fetch("api/favorites.php?action=list");
      if (res.ok) {
        const json = await res.json();
        if (json.status === "success") return json.data;
      }
    } catch (e) {}
    try {
      return JSON.parse(localStorage.getItem("smart_trip_favorites")) || [];
    } catch {
      return [];
    }
  },

  toggleFavorite: async (destId) => {
    try {
      const res = await fetch("api/favorites.php?action=toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination_id: destId }),
      });
      if (res.ok) {
        const json = await res.json();
        return json.isFavorite;
      }
    } catch (e) {}

    let favs = JSON.parse(localStorage.getItem("smart_trip_favorites")) || [];
    if (favs.includes(destId)) favs = favs.filter((id) => id !== destId);
    else favs.push(destId);
    localStorage.setItem("smart_trip_favorites", JSON.stringify(favs));
    return favs.includes(destId);
  },

  getReviews: async (destId) => {
    try {
      const res = await fetch(`api/reviews.php?destination_id=${destId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.status === "success") {
          return json.data.map((r) => ({
            id: r.id,
            userName: r.user_name,
            rating: r.rating,
            date: r.date_posted,
            comment: r.comment,
          }));
        }
      }
    } catch (e) {}
    return [
      {
        userName: "Hải Nam",
        rating: 5,
        date: "15/08/2026",
        comment: "Trải nghiệm rất ấn tượng!",
      },
      {
        userName: "Thu Thảo",
        rating: 5,
        date: "10/08/2026",
        comment: "Cảnh đẹp, ẩm thực phòng phong phú.",
      },
    ];
  },

  addReview: async (destId, reviewObj) => {
    try {
      const res = await fetch("api/reviews.php?action=add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination_id: destId,
          user_name: reviewObj.userName,
          rating: reviewObj.rating,
          comment: reviewObj.comment,
        }),
      });
      if (res.ok) return true;
    } catch (e) {}
    return true;
  },
};