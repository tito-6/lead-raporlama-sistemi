# Birebir Görüşme Veri İçe Aktarma Rehberi

## Genel Bakış

LeadTrackerPro artık birebir görüşme verilerini içe aktarmayı desteklemektedir. Bu özellik, satış personellerinin yaptığı görüşmeleri sisteme kaydetmenizi ve detaylı analiz yapmanızı sağlar.

## Nasıl Kullanılır

### Adım 1: Veri Dosyanızı Hazırlayın

Birebir görüşme verilerinizi aşağıdaki formatlardan birinde hazırlayabilirsiniz:

#### JSON Format Örneği:
```json
[
  {
    "Müşteri Adı Soyadı(105)": "Neslihan Lloyd",
    "Tarih": "01/05/2025",
    "Personel Adı(105)": "Yasemin Kaya",
    "Ofis": "İkitelli",
    "Notlar": "Ali beyin onayı ile Son kdv dahil 308.000 USD bırakıldı. Ödeme planı ve kimlik bilgielri alındı.",
    "Müşteri Haberleşme Tipi": "Birebir Görüşme",
    "Görüşme Tipi": "Daha Önce Ziyaret Eden",
    "Saat": "17:55",
    "Son Sonuç Adı": "Satış",
    "Puan": "20",
    "Cep Tel": "447961071624",
    "Email": "",
    "Kriter": "Satış Müşterisi",
    "AktifMi": "TRUE"
  }
]
```

#### CSV Format Örneği:
```csv
Müşteri Adı Soyadı(105),Tarih,Personel Adı(105),Ofis,Notlar,Müşteri Haberleşme Tipi,Görüşme Tipi,Saat,Son Sonuç Adı,Puan,Cep Tel,Email,Kriter,AktifMi
"Neslihan Lloyd","01/05/2025","Yasemin Kaya","İkitelli","Görüşme notları","Birebir Görüşme","İlk Geliş","17:55","Satış","20","447961071624","","Satış Müşterisi","TRUE"
```

### Adım 2: Desteklenen Sütunlar

| Sütun Adı | Açıklama | Zorunlu |
|-----------|----------|---------|
| Müşteri Adı Soyadı(105) | Müşterinin tam adı | ✅ Evet |
| Tarih | Görüşme tarihi (DD/MM/YYYY formatında) | ✅ Evet |
| Personel Adı(105) | Satış personelinin adı | ✅ Evet |
| Ofis | Görüşmenin yapıldığı ofis | ❌ Hayır |
| Notlar | Görüşme ile ilgili notlar | ❌ Hayır |
| Müşteri Haberleşme Tipi | İletişim türü | ❌ Hayır |
| Görüşme Tipi | Görüşmenin türü | ❌ Hayır |
| Saat | Görüşme saati | ❌ Hayır |
| Son Sonuç Adı | Görüşmenin sonucu | ❌ Hayır |
| Puan | Görüşme puanı | ❌ Hayır |
| Cep Tel | Müşteri telefon numarası | ❌ Hayır |
| Email | Müşteri e-posta adresi | ❌ Hayır |
| Kriter | Müşteri kriteri | ❌ Hayır |
| AktifMi | Aktif durumu (TRUE/FALSE) | ❌ Hayır |

### Adım 3: İçe Aktarma İşlemi

1. LeadTrackerPro'da "Veri Girişi" sekmesine gidin
2. "Birebir Görüşme İçe Aktarma" bölümünü seçin
3. İki seçeneğiniz var:
   - **Dosya Yükleme**: CSV veya JSON dosyanızı sürükleyip bırakın
   - **Manuel JSON Girişi**: JSON verinizi doğrudan metin alanına yapıştırın
4. "İçe Aktar" butonuna tıklayın
5. Sonuçları gözden geçirin

### Adım 4: Sonuçları Görüntüleme

İçe aktarma işlemi tamamlandıktan sonra:

- Ana sayfadaki "🤝 Birebir Görüşme Özeti" tablosunda personel bazında özet görebilirsiniz
- Her personelin toplam görüşme sayısı, satış, takipte, olumsuz ve bilinmiyor sayıları görüntülenir
- Başarı oranları otomatik olarak hesaplanır

## Desteklenen Dosya Formatları

- **JSON**: `.json` uzantılı dosyalar
- **CSV**: `.csv` uzantılı dosyalar
- **Excel**: Şu anda desteklenmemektedir (CSV'ye dönüştürün)

## Şablon Dosyaları

Sisteme veri girişinizi kolaylaştırmak için şablon dosyaları indirebilirsiniz:

- **JSON Şablon**: Doğru JSON formatını gösterir
- **CSV Şablon**: Excel'de açabileceğiniz CSV formatını gösterir

## Sonuç Kategorileri

Sistem "Son Sonuç Adı" alanındaki değerleri otomatik olarak kategorize eder:

- **Satış**: "satış" kelimesini içeren sonuçlar
- **Takipte**: "takip" kelimesini içeren sonuçlar  
- **Olumsuz**: "olumsuz" veya "red" kelimelerini içeren sonuçlar
- **Bilinmiyor**: Diğer tüm sonuçlar

## Sorun Giderme

### Yaygın Hatalar:

1. **"Missing required fields"**: Zorunlu alanları kontrol edin
2. **"Invalid date format"**: Tarih formatının DD/MM/YYYY olduğundan emin olun
3. **"File upload failed"**: Dosya boyutunu ve formatını kontrol edin

### İpuçları:

- CSV dosyalarında Türkçe karakterler için UTF-8 kodlaması kullanın
- Tarih formatında gün/ay/yıl sırasını takip edin
- Personel isimlerinin ana lead sistemindeki isimlerle eşleştiğinden emin olun

## Teknik Notlar

- Veriler bellekte saklanır (gerçek uygulamada veritabanına kaydedilir)
- Her içe aktarma işlemi mevcut verilere eklenir
- Yinelenen kayıt kontrolü şu anda yapılmaz
- Global veri senkronizasyonu otomatik çalışır

Bu özellik sayesinde satış ekibinizin performansını daha detaylı takip edebilir ve birebir görüşmelerin etkisini analiz edebilirsiniz.
