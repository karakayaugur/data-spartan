# İstemci hata yönetimi

`app.config.ts`, `GlobalErrorHandler` sınıfını Angular `ErrorHandler` olarak kaydeder. `provideBrowserGlobalErrorListeners()` tarayıcıdaki yakalanmamış hataları ve Promise rejection olaylarını Angular'a aktarır. Angular tarafından yakalanan component hataları da aynı işleyiciye ulaşır.

İşleyici genel bir hata toast'ı gösterir ve teknik ayrıntıları konsola yazar. `core/http/error/error.service.ts` içindeki `ClientErrorReporter` mesaj, stack ve sayfa adresini `POST /proxyUrl/error` üzerinden BFF'e gönderir. BFF mevcut logger ile raporu kaydeder ve 204 döndürür.

Raporlama isteği `HttpBackend` üzerinden gönderilir, HTTP interceptor'larını atlar. Beş saniyelik zaman aşımı ve sessiz hata yakalama sayesinde raporun başarısız olması yeni toast veya hata döngüsü oluşturmaz. HTTP hataları zaten `ErrorInterceptor` tarafından gösterildiği için genel işleyicide tekrar bildirilmez.

Sidebar'daki **Test client error**, gerçek bir JavaScript hatası fırlatır. **Test HTTP error** ise BFF'in 500 döndüren `/proxyUrl/error-test` endpoint'ini çağırır.
