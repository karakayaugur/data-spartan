# Star Wars BFF

Angular → ApiService → Express `/proxyUrl` → SWAPI.

| BFF endpoint | Angular servisi | Cevap |
| --- | --- | --- |
| GET /proxyUrl/films | FilmService.getList() | FilmSummary[]; bölüm sırasıyla |
| GET /proxyUrl/films/:id | FilmService.getById(id) | Film; açılış metni ve tüm oyuncu kadrosu |
| GET /proxyUrl/characters/:id | CharacterService.getById(id) | RobotCharacter veya OrganicCharacter |

Cevap tipleri `core/http/film/film.interface.ts` ve `core/http/character/character.interface.ts` dosyalarındadır. Kimlikler SWAPI kaynak kimliğidir; bölüm numarası film kimliği değildir.

Robot ayrımı tür adı `Droid` veya sınıflandırma `artificial` olduğunda yapılır. Robot cevabı boy, kütle ve üretim yılı; organik karakter cevabı boy, doğum yılı, gezegen ve tür/sınıflandırma bilgilerini içerir. SWAPI ayrı üretim yılı sunmadığından robotlarda `birth_year` alanı `manufacturingYear` olarak aktarılır. Tür bağlantısı boşsa `species: []` döner; UI bunu bilinmiyor olarak göstermelidir. `unknown` ve `n/a` değerleri korunur.

BFF, film kadrosunun bağlantılarını altılı gruplarla çözer. Aynı kaynak için eşzamanlı istekler birleştirilir; başarılı kaynaklar beş dakika bellekte tutulur. Her upstream isteğin 15 saniye zaman aşımı vardır. Başarısız istekler önbellekten çıkarılır. Yeniden başlatma önbelleği temizler.

`SWAPI_BASE_URL` varsayılan olarak `https://swapi.dev/api/` değerindedir. Gelen istek URL'si upstream hedefi belirleyemez. Yalnızca açıkça tanımlanmış GET uçları sunulur; eski genel proxy kaldırılmıştır. SWAPI bağlantılarından sadece izin verilen kaynak yolları çıkarılıp yapılandırılmış upstream adresinde çağrılır.

Hatalar `{ message: string }` biçimindedir: geçersiz kimlik 400, bulunamayan kaynak/uç 404, upstream hatası 502, zaman aşımı 504. Film kadrosunun bir parçası yüklenemezse eksik kadro göstermek yerine istek hata verir. Film listesi açılışta sol menüde yüklenir. `/films/:id` sayfası film metnini ve tam kadroyu gösterir; karakter düğmeleri kadro listesinin yanındaki ayrıntı panelini günceller. Yükleme, hata ve tekrar deneme durumları desteklenir; film değiştirildiğinde önceki istek iptal edilir. Her filmin izleme geçmişi düğmesi bir modal açar; zorunlu tarih/saat ve isteğe bağlı açıklamayla birden fazla kayıt ekleme, listeleme ve silme desteklenir. Bu kayıtlar `data-spartan.films` anahtarı altında film listesiyle birlikte `sessionStorage` içinde tutulur; sayfa yenilendiğinde geri yüklenir ve sekme oturumu boyunca korunur.

Kaynak şema: https://swapi.dev/documentation

Doğrulama: `npm run test:server`, `npm test`, `npm run build`.
