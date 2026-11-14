# HTTP servisi

Ortak taşıma servisi `core/http/api/` altında bulunur. Kaynak projedeki gibi tipler `api.interface.ts`, servis `api.service.ts`, dışa aktarımlar `index.ts` dosyalarındadır.

```ts
import { inject, Injectable } from "@angular/core";
import { ApiService } from "@core/http";

// Yalnızca kullanım örneği; gerçek Data Spartan endpoint'i değildir.
interface Item {
  id: number;
  name: string;
}

@Injectable({ providedIn: "root" })
export class ExampleService {
  private readonly api = inject(ApiService);

  getList() {
    return this.api.get<Item[]>("items", {
      params: { active: true },
    });
  }
}
```

`get`, `post`, `put`, `patch`, `delete` metotları JSON gövdesini `Observable<T>` olarak döndürür. Endpoint'i `items` veya `/items` biçiminde verin; `/proxyUrl` otomatik eklenir. Query parametreleri, header ve `HttpContext` seçenekleri desteklenir.

Cevap gövdeleri değiştirilmeden döndürülür; otomatik sayfalama veya header dönüşümü uygulanmaz.

Servis hataları yutmaz, otomatik tekrar deneme veya abonelik oluşturmaz. Hata çağırana aktarılır. Kimlik doğrulama henüz eklenmediğinden Authorization header'ı otomatik üretilmez.

BFF bağlantısı için `.env` içinde `SWAPI_BASE_URL` tanımlanabilir (varsayılan: `https://swapi.dev/api/`). `FilmService` ve `CharacterService`, `ApiService` üzerinden BFF uçlarını çağırır. Bu uçlar tipli cevapları doğrudan döndürür.
