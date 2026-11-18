# Aura Glass — Enhanced Edition

[🇬🇧 English](README.md) · [🇪🇸 Español](README.es.md) · [🇹🇷 Türkçe](README.tr.md)

**Spotify'a cam gibi bir görünüm.** Her şarkı, albüm kapağının renkleriyle uygulamanın tamamını yeniden renklendirir.

Aura Glass, Apple'ın Liquid Glass tasarımından ilham alan bir [Spicetify](https://spicetify.app) temasıdır. Çalan parçanın kapak görseli arka plana dönüşür; paneller o görselin renklerini alan buzlu cam katmanlarına dönüşür. Müzik çalar, dönen bir plakla birlikte havada süzülen bir kapsül gibi görünür. Şarkı değiştiğinde tüm renkler de değişir.

![Aura Glass](preview.png)

## Neden seveceksin?

- **Müziğinle birlikte değişir.** Arka plan, camın tonu, düğmeler, ilerleme çubuğu ve ses seviyesi her şarkının kapak görseline uyum sağlar.
- **Plak ruhunu taşıyan bir müzik çalar.** Albüm kapağı bir plak gibi döner; müzik duraklatıldığında o da durur.
- **Vitrin modu.** `Alt + S` kısayoluyla Spotify'ı salonunda veya ikinci monitöründe kullanabileceğin tam ekran bir müzik ekranına dönüştürür. Dönen plak, saat, oynatma kontrolleri ve senkronize şarkı sözleri görünür. Etkin dize vurgulanır; herhangi bir dizeye tıklayarak şarkıda o ana atlayabilirsin.
- **Kodla uğraşmadan kişiselleştir.** Cam rengini (kapak görselinden, dört hazır paletten veya kendi renginden), bulanıklığı, saydamlığı, köşe yuvarlaklığını ve parlaklığı ayarlar panelinden değiştirebilirsin. Değişiklikler anında uygulanır ve kaydedilir.
- **Uyku zamanlayıcısı.** 15, 30, 45 veya 60 dakika sonrasına ya da şarkının bitimine zamanlayabilirsin. Müzik duraklatılmadan önce ses yavaşça azaltılır; ardından önceki seviyesine döndürülür.
- **Şık ve okunaklı.** Cam efekti listelerin üzerine binmez; kenar çubuklarında ve panellerde kullanılır. Kapak görselinin rengi metni okumayı zorlaştırırsa tema okunabilirliği korumak için rengi otomatik olarak ayarlar.
- **Bilgisayarını yormaz.** Spotify arka plandayken animasyonlar durur. Düşük güç tüketimi modu bulanıklığı azaltır ve animasyonları kapatır.
- **Erişilebilir.** İşletim sisteminin saydamlığı azaltma, yüksek karşıtlık ve hareketi azaltma tercihlerini dikkate alır. Ayarlar paneli ve vitrin modu klavyeyle kullanılabilir.

## Görünüm

### Her kapak görseliyle renk değiştiren müzik çalar

Düğmeler, süre göstergeleri, ilerleme çubuğu, ses seviyesi ve oynat düğmesi çalan parçanın kapak görseline göre renk değiştirir. Aynı müzik çaların dört farklı görünümü:

![Dört farklı renkte müzik çalar](capturas/colores.png)

### Dönen plak görünümündeki kapak

Ortası delikli yuvarlak bir plak görünümü. Müzik çalarken döner, duraklatıldığında durur.

![Plak görünümündeki kapak](capturas/disco.gif)

### Vitrin modu (`Alt + S`)

Kapak görseli, dönen plak, saat ve senkronize şarkı sözleriyle tam ekran görünüm. Önceden çalınan dizeler solar, etkin dize belirginleşir, sıradaki dizeler bulanık kalır.

![Vitrin modu](capturas/escaparate.png)

### Ayarlar paneli

Cam rengi, bulanıklık, saydamlık, köşe yuvarlaklığı, parlaklık, efektler ve uyku zamanlayıcısı. Kod değiştirmen gerekmez.

![Ayarlar paneli](capturas/ajustes.png)

## Kurulum

### Marketplace üzerinden (önerilen)

1. Spicetify ile Spotify'ı aç ve **Marketplace** bölümüne (alışveriş sepeti simgesi) gir.
2. **Temalar** sekmesinde **Aura Glass** temasını bul ve **Yükle**'ye tıkla.

Marketplace senden `current_theme` değerini `marketplace` olarak ayarlamanı isterse şu komutları çalıştır ve Spotify'ı yeniden aç:

```bash
spicetify config current_theme marketplace
spicetify apply
```

### Manuel kurulum

1. Bu klasörü Spicetify tema klasörüne `AuraGlass` adıyla kopyala:
   - Windows: `%APPDATA%\\spicetify\\Themes\\AuraGlass`
   - macOS / Linux: `~/.config/spicetify/Themes/AuraGlass`
2. Şu komutları çalıştır:

```bash
spicetify config current_theme AuraGlass color_scheme Gece inject_css 1 replace_colors 1 inject_theme_js 1
spicetify apply
```

## Kullanım

| İşlem | Nasıl yapılır? |
| --- | --- |
| Ayarları aç | Sol üstteki palet simgesine tıkla |
| Vitrin modunu aç | `Alt + S` tuşlarına bas veya sol üstteki plak simgesine tıkla |
| Vitrin modundan çık | `Esc` tuşuna bas veya ✕ düğmesine tıkla |
| Bir dizeye atla | Vitrin modunda şarkı sözü satırına tıkla |
| İleri veya geri sar | İlerleme çubuğunda ok tuşlarını kullan (`Shift` ile 30 saniye) |
| Zamanlayıcı kur | Ayarlar → Uyku zamanlayıcısı |

## Gereksinimler

- Spicetify destekleyen masaüstü Spotify sürümü. Microsoft Store sürümü Spicetify'ı desteklemez.
- Spicetify 2.x.

Windows 11 üzerinde Spotify 1.3.8 ve Spicetify 2.46.4 ile test edilmiştir.

## Katkı sahipleri ve lisans

[issacleral tarafından geliştirilen Aura Glass](https://github.com/issacleral/aura-glass-spicetify) temel alınmıştır. Bu geliştirilmiş sürüm bağımsız olarak sürdürülür. Orijinal telif bildirimi ve MIT lisansı korunmuştur; [ATTRIBUTION.md](ATTRIBUTION.md) ve [LICENSE](LICENSE) dosyalarına bak.


## Çeviri katkısı nasıl yapılır?

Aura Glass'ı kendi diline çevirmek ister misin? Programlama bilmeden de katkıda bulunabilirsin.

1. README.md dosyasını kopyala ve kopyanın adını README.<dil-kodu>.md yap (örneğin Fransızca için README.fr.md). [ISO 639-1 dil kodunu](https://en.wikipedia.org/wiki/ISO_639-1_codes) kullan.
2. Başlıkları, açıklamaları, özellik listelerini, kurulum ve kullanım talimatlarını çevir.
3. Komutları, kod bloklarını, dosya yollarını, ayar adlarını, klavye kısayollarını, URL'leri ve ürün adlarını değiştirme. AuraGlass, color_scheme ve spicetify gibi teknik tanımlayıcıları aynen koru.
4. Yeni dile özel bir görsel eklemiyorsan görsel bağlantılarını ve göreli dosya yollarını değiştirme.
5. Yeni dil bağlantısını tüm README çevirilerinin en üstündeki dil seçicisine, aynı sıralama ve biçimi koruyarak ekle.
6. Yeni dosyayı ve güncellenmiş dil bağlantılarını içeren bir pull request aç.

Anlaşılır ve doğal bir dil kullan; teknik talimatların anlamını diğer dillerle tutarlı tut. Çeviri tamamlanmadıysa pull request açıklamasında bunu belirt ki gözden geçirilebilsin.

Mevcut dokümantasyon dilleri: İngilizce (varsayılan), İspanyolca ve Türkçe.
