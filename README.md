# Data Spartan

`fe-berlin-admin` yapısı temel alınarak oluşturulmuş Angular 20 + Express 5 başlangıç projesi. Node.js 24 kullanılır; kaynak projenin paket sürümleri ve kilit dosyaları korunmuştur.

```text
client/
  src/app/
    core/        # HTTP, interceptor, guard, servis ve signal store katmanları
    shared/      # Ortak UI, filtre, tablo, pipe, directive ve validator'lar
    layouts/     # app ve overlay yerleşimleri
    pages/       # Route üzerinden yüklenen sayfalar
  src/assets/    # Font, ikon, görsel, i18n ve stil sistemi
  public/        # Statik genel dosyalar
server/
  index.js       # Express, Helmet, health ve SPA sunumu
  routes/        # API proxy ve istemci hata raporu
  lib/           # HTTP logger
 deployment/     # Docker Compose
 docs/           # Mimari notları
```

## Geliştirme

```sh
npm run install-packages
cp .env.example .env
npm run dev
```

İstemci: http://localhost:4201 — Express: http://localhost:3001

`/proxyUrl` istekleri Angular geliştirme sunucusundan Express BFF'e aktarılır. Express, `SWAPI_BASE_URL` değerini kullanır; varsayılan `https://swapi.dev/api/` adresidir. Angular dış API'ye doğrudan erişmez. BFF uçları ve cevap sözleşmeleri için `docs/bff.md` dosyasına bakın.

## Doğrulama ve üretim

```sh
npm run build
npm test
npm run test:server
npm start
```

`npm test` için Chrome/Chromium gerekir. `npm start`, derlenmiş istemciyi 3001 portunda sunar. `/health` sağlık kontrolüdür. Docker için `make build` ve `make run` kullanılır. Compose API adresi `SWAPI_BASE_URL` ortam değişkeninden alınır.

## Kaynaktan taşınan yapı

Katmanlar, TypeScript alias'ları (`@core`, `@shared`, `@app`), ayrı HTML/CSS dosyaları, signal tabanlı UI, tema/dil store'ları, stil token'ları, ortak bileşenler ve BFF düzeni korunmuştur. Form kuralları `.instructions.md` dosyasındadır.

Bu bir temiz başlangıçtır. Berlin'in ödeme/banka/merchant ekranları, bunlara özel API servisleri ve API'ye bağlı seçim bileşenleri taşınmadı. Kimlik doğrulama henüz uygulanmadığı için dashboard açıktır; auth guard ve interceptor eklemek için `core/guards` ve `core/http` katmanları hazırdır. Berlin `.env`, Git geçmişi, agent/editor ayarları ve canlı AWS dağıtım hedefleri kopyalanmadı. AWS yerine yerel Docker Compose tanımı eklendi.

## Film ekranı ve izleme geçmişi

Sol menüde film listesi ve her film için ayrı `Viewing log` düğmesi bulunur. Film seçildiğinde üstte film adı ve açılış metni, altta solda kadro listesi ve sağda seçilen karakterin bilgileri gösterilir. Küçük ekranlarda kadro ve karakter paneli alt alta yerleşir. Sidebar ayrı `layouts/app/sidebar` bileşenindedir. KISS admin örneğindeki gibi 640px ve altında hamburger düğmesinden açılan sol panel, karartılmış arka plan ve kapatma düğmesi kullanılır; Escape, film seçimi ve masaüstüne geçiş menüyü kapatır. Mobil menü açıkken klavye odağı panelde tutulur.

İzleme geçmişi modalında tarih ve saat zorunlu, açıklama isteğe bağlıdır. Aynı filme birden fazla kayıt eklenebilir; kayıtlar modal yeniden açıldığında listelenir ve tek tek silinebilir. Her filmin kayıtları ayrıdır. Kayıtlar `data-spartan.films` anahtarı altında film listesiyle birlikte `sessionStorage` içinde tutulur; sayfa yenilenince geri yüklenir. Sekme oturumu sona erdiğinde silinir ve BFF'e gönderilmez.

SWAPI robotlar için ayrı üretim yılı sağlamadığından `birth_year` alanı üretim yılı olarak gösterilir. Tür bağlantısı olmayan karakterlerde tür/sınıflandırma `Unknown` gösterilir; eksik veri tahmin edilmez. PDF çizimlerindeki temel yerleşim korunurken mevcut projenin tema ve stil token'ları kullanılır.

## Film state yönetimi

Örnek projenin AuthStore düzeni izlenir: `core/store/films/films.store.ts` signal state'i, `setState` / `patchState` / `clearState` işlemlerini ve sessionStorage senkronizasyonunu yönetir. `films.services.ts` içindeki `FilmsService`, film listesi ve izleme geçmişini okuma/güncelleme metotlarını sunar. Film listesi ilk HTTP cevabında store'a yazılır; modal kayıtları aynı state'in `viewings[filmId]` alanında güncellenir. Store değişiklikleri `effect` ile kaydedilir. Film listesi yenilenirken izleme kayıtları korunur.

Sidebar, güncel görsel referansın Angular/CSS uyarlamasıdır: masaüstünde sabit 256px genişlikte gösterilir; daraltma veya ikon şeridi modu yoktur. Mobilde tam genişlikte açılan panel, kapatma düğmesi, Escape ve film seçimiyle kapanır. Film listesi, izleme geçmişi ve tema kontrolü ortak sidebar bileşeninde korunur. React/Tailwind eklenmez.
