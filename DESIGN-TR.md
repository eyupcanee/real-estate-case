# Estate Case Study

## Project Overview

Estate case study projesi emlakçıların mülklerini, danışmanlarını ve mülklerinin satış veya kira işlemlerini yönetebildiği, işlem sonucunda pay dağıtımını otomatize eden full-stack bir yönetim panelidir.

## Tech Stack

### Backend

- NestJS
- Mongoose
- Validation Pipe
- Swagger
- Jest

### Database

- MongoDB Atlas

### Frontend

- Nuxt3
- Pinia
- TailwindCSS
- Lucide Icons

## Backend Architecture & Business Logic

### Data Table Modelling

- Veritabanı şu 4 tablodan oluşmaktadır: 'agents', 'properties', 'transactions', 'audit-logs'

#### Agent Table Structure

- Projenin bir case çalışması olması ve süre kısıtı sebebiyle agents tablosu sadece email ve fullname alanları ile oluşturulmuştur.
- Gerçek dünyada agents tablosuna authentication ve authorization eklenmesi ile birlikte, username, passsword, address, phoneNumber, refreshToken, role vb. alanların da eklenmesi gerekmektedir.

#### Properties Table Structure

- Case study'nin asıl odak noktası transaction yönetimi olması sebebiyle, bu tablo da title, location, price ve type (RESIDENTIAL, COMMERCIAL, LAND) olmak üzere basit tutulmuştur.
- Gerçek dünyada bir property'nin cephe, oda ve salon sayısı, kat, metrekare gibi pek çok farklı alanın da bu tabloda tutulması gerekmektedir.

#### Audit-Logs Table Structure

- Case çalışmasında istenen izlenebilirlik gereği yapılan işlemleri net bir şekilde kayıt altına alan ve inkar edilemezliği ve logların veritabanı düzeyinde dahi değiştirilmediğini garanti altına almak için hash chain ile korunan bir tablodur.
- Tablo entityType, entityId, action, payload, previousHash, currentHash ve timestamp alanlarını içerir.
- Gerçek dünyada bu işlemlerin kimin tarafından, ne zaman, hangi ip ve rol ile yapıldığına kadar bu tabloda tutulması gerekmektedir.
- Hash chain: Her bir log'un kendinden bir önceki logun verileri ile kendi verilerinin toplanıp SHA-256 algoritması ile birlikte hashlenip currentHash alanında saklanmasıdır. Aynı zamanda bir önceki log'un hash'ini de kendi previousHash alanında tutar. Bu veritabanı düzeyinde dahi herhangi bir logda bir harf dahi değiştirilse zincirin kırılmasına sebep olur. Bu da kayıtların inkar edilemezliğini sağlar.

#### Transactions Table Structure

- Transaction tablosu içerisinde propertyID, stage, totalServiceFee, listingAgentID, sellingAgentId, type ve financialBreakdown bulunduran işlemlerin kaydedildiği tablodur.
- Financial breakdown yani ajans payı, satan ve listeleyen danışman payı embedded olarak tutulmuştur.
- Embedded tercih edilmesinin sebepleri:
  - NoSQL: SQL bir veritabanında çalışıyor olsaydım veri normalizasyonları kuralları gereği işlem sonucu elde edilen finansal veriyi ayrı bir tabloda tutar ve one-to-one bir ilişki içerisinde kurgulardım. Fakat Document tabanlı NoSQL'in avantajı olan denormalizasyon saysesinde ayrı bir tablo olarak tutmadan istek başı join maliyetine bulaşmadan bu veriyi elde etmemi sağlıyor. Eğer ileride transactiondan bağımsız danışmanların pay aktarımı söz konusu olursa ayrı bir tablo tutmak mantıklı gibi gözüküyor fakat bu hali ile bile NoSQL'in hız avantajı ile stage alanı indexlenmiş bir tabloda bu işlemi gerçekleştirmek yeterince hızlıdır. Ekstra kod yükü ve maliyetine bu sebeple girilmemiştir.
  - Tek seferlik işlem: Finansal breakdown sadece bir transaction'un completed stage'ine geçince tek seferlik hesaplanıp yazılıyor. Daha sonra güncellenemiyor veya üzerinde başka bir işlem yapılmıyor. İçerisine yazmamızın sebebi de aslında aynıdır. Eğer bu bir dijital cüzdan veya benzeri bir proje olsaydı event-sourcing benzeri işlem anında hesaplanıp kullanıcıya gösterilebilirdi. Fakat bu çalışma özelinde event-sourcing benzeri bir yaklaşım her istekte ekstra işlem maliyeti ve hız kaybı bu kaybın tolere edilebilmesi için de gerekli olacak cron ve önbellekleme yine buna rağmen yaşanabilecek veri senkronizasyonu sorunları sebebiyle gereksiz görülmüştür.

### Backend Structure

#### Backend Architecture

- Mimari olarak bu case kapsamında modüler monolith yaklaşımı tercih edilmiştir. Kod halihazırda modül bazlı yazılmıştır. Bazı çapraz kontroller için diğer agent ve property modüllerinin şeması transaction tarafında import edilmiştir. Fakat bu şemalar hızlıca shared kernel üzerinde taşınıp tam bir modüler monolith elde edilebilir. Aynı zamanda her bir modül kolayca ayrı servisler olarak ayağa kaldırılıp, ihtiyaç durumunda bir message bus ile birlikte mikroservis mimarisine geçiş yapılabilir. Bu projede zaman ve kapsam göz önünde bulundurulduğunda modüler monolith mantıklı bulunmuştur.

#### Data Validation & Backend Normalization

- Gerçek dünya projelerinde transaction gibi yüksek takip edilebilirlik isteyen, katı kurallara tabi olan iş akışları DDD gibi rich model entityler ile birlikte, iş kuralları direkt entity'e (bizim projemizde şemaya) gömülü şekilde tasarlanır. Fakat bizim projemizde eldeki transaction'un iş kuralları DDD gibi nispeten karmaşık bir mimariye ihtiyaç duymadan sağlanabilir. Bunu daha basit olan Validation Pipe ve Schema bazlı kısıtlar koyarak karşılamak ekstra bakım maliyetini ve teknik borç bırakma ihtimalini azaltması ve projenin zaman ve kapsamı dahilinde aşırı mühendisliğe kaçmaması için daha iyi bulunmuştur.
- Validasyon için ilk katman DTO'lar üzerinde kullanılan global tanımlı validation pipe'dır. İkini aşaması ise mongoose schema'ları üzerinde tanımlı olan dekoratörler ile birlikte sağlanmıştır.

- Özellikle takım içi çalışmalarda, iş akışının kolaylaşması, kod kalitesinin ve okunulabilirliğinin artması için backend apilerinden dönen değerlerin belirli bir şemaya uygun olması gerekmektedir. Bunun için global bir interceptor kullanılarak backendden dönen her bir isteğin belirli bir şemaya:

```json
{
  "success": boolean,
  "message": string,
  "data": any
}
```

uyması sağlanmıştır.

- Başarılı sonuçların döndüğü gibi başarısız ve hatalı sonuçların da aynı normalize olmuş şema içerisinde dönmesi gerekmektedir. Bunun için de global bir exception filter kullanılmıştır.

- Bunlara ek olarak özellikle frontend developerler için önemli olan swagger dokümantasyonu da eklenmiştir.

#### Server Side Pagination & Filtering

- Sistemdeki tüm listeleme endpoint'leri (Properties, Agents, Transactions) varsayılan olarak Server Side Pagination ve Regex tabanlı Server Side Search destekleyecek şekilde tasarlanmıştır.
- Proje kapsamı ve zaman kısıtından dolayı mongoose sorguları ile tasarlanmıştır. Sistemin kullanıcı sayısı arttığında, trafik yükseldiğinde elastic search gibi kuvvetli arama motorları kullanılabilir.
- Tüm veriyi frontend'e çekip client-side filtrelemek küçük veri setlerinde çalışsa da kayıt sayısı arttığında hem network yükü hem de bellek kullanımı açısından sürdürülemez hale gelir. Bu sebeple pagination ve filtreleme veritabanı düzeyinde yapılmaktadır.

#### Transaction & Business Logic

- Transaction tarafında tuttuğumuz stage için sıralı bir sistem kullanılmıştır. Transaction bellirli bir stagede iken sadece izin verilen stage'e geçiş yapabilir. Bunun haricinde 'completed' olan transactionlar dışında kalan bütün aşamalarda transaction ekstra olarak sadece iptal edilebilir.
- Bunun tek yönlü bir akış olarak tasarlanmasının sebepleri:
  - Yanlışlıkları Engellemek: Arayüz kullanıcıların iş mantığına aykırı olabilecek stage geçişlerini kod tabanında engellemek.
  - Öngörülebilirlik: Aşamaların ardı ardına belli olması hem kullanıcı hem de ileride arayüzden oluşturulacak raporları inceleyen kişi tarafından anlaşılabilir ve sonraki adımın net olmasını sağlamak.
  - İzlenebilirlik: Aşamaların ne zaman hangi adımdan nereye geçtiğini geçmişe dönük olarak izleyebilmek, yanlış adımları veya hatalı işlemleri kolayca tespit edebilmek için.

- Transaction akışı tasarlanırken iki kere satış probleminin de önüne geçilmiştir. Halihazırda bir property üzerinde bir transaction kaydı bulunuyor ve bu kayıt 'completed' veya 'cancelled' değilse sistem aynı property üzerine yeni bir transaction oluşturulmasına izin vermeyecek şekilde dizayn edilmiştir.

- Transactiondaki komisyonların hesaplanması sadece transaction stage'i 'completed''e geçirilirken hesaplanır ve embedded olarak içeriye yazılır. Bu alan daha sonradan değiştirilemez veya silinemez.

#### Commission Rules

- Toplam servis ücretinin %50'si her durumda acenteye aittir.
- Kalan %50 danışmanlara aşağıdaki kurala göre dağıtılır:

| Senaryo   | Koşul           | Listeleyen Danışman | Satan Danışman |
| --------- | --------------- | ------------------- | -------------- |
| Senaryo 1 | Aynı danışman   | %50                 | —              |
| Senaryo 2 | Farklı danışman | %25                 | %25            |

#### Testing

- Backend tarafında iş mantığını, komisyon hesaplamalarını ve durum geçişlerini doğrulamak amacıyla birim testleri yazılmıştır. Test framework'ü olarak Jest kullanılmıştır.
- Testler yazılırken izolasyon prensibine sadık kalınmış, veritabanı bağımlılığını ortadan kaldırmak ve testlerin hızlı çalışmasını sağlamak için Mongoose model ve repository'leri mock'lanmıştır. Sadece Servis katmanının iş mantığına odaklanılmıştır.

#### Rate Limiting & Cors

- Case çalışması olması sebebiyle apiye bir rate limit koymadım ve corsu da default hali olan "all" da bıraktım.
- Gerçek dünyaya çıkacak olan projelerde cors sadece ilgili domaine bağlanmalı ve api için bir rate limit olmalıdır.

### Future Improvements & Good To Haves

#### Central Logging

- Seq veya benzeri bir merkezi log toplama aracı ile sistemdeki önemli işlemler sürekli takip edilebilir ve sorumlu yazılım ekibine bir rapor geçilebilir.

#### Observability

- Grafana, prometheus, jaeger gibi araçlarla, backend yükü, host edilen makinenin donanım yükü, anlık istek sayısı vb. metrikler takip edilebilir ve bu bağlamda gerekli geliştirmeler uygulanabilir.

#### Containerization

- Docker gibi sanallaştırma araçları kullanılarak takım içi geliştirme hızı ve versiyon uyumluluğu sağlanabilir.

#### RBAC

- Tek bir panel üzerinden hem danışmanların, hem firma sahibinin, hem editörlerin iş yapabilmesi için bir rol tabanlı erişim sistemi eklenebilir.

### Backend Conclusion

- Özetle backend proje ve zaman kapsamı içerisinde yapılması uygun görülen teknolojiler ve mimari kararlar ile geliştirilmiştir. Bu bağlamda geliştirme ve bakım yükü hafif olmasına karşın getirdiği değeri yüksek olan kararlar alınmıştır. Gereksiz ve aşırı mühendislik olabilecek teknik karar ve geliştirmelerden olabilidiğince kaçınılmıştır.

## Frontend Architecture

### Components & UI/UX

- Frontend tarafında componentler yazılırken olabildiğince yeniden kullanılabilir ve teknik tabirle 'dumb' olmasına özen gösterilmiştir. Bu sayede DataTable, Modal vb componentler tekrar tekrar yazılmamıştır.

- Componentler olabildiğince modern ve premium durması için okunması kolay, kontrastı ve renk uyumu yüksek renkler seçilmiştir. Aynı zamanda kullanıcının arayüze alışması, bilinç yükünün azaltılması için sayfalar benzer şemalarda tasarlanmış ve bolca ikonlara yer verilmiştir.

- Arama çubuğunda kullanıcının işini kolaylaştırmak için harici bir 'ara' butonu yerine debounce mekanizması kullanılmıştır.

- Kullanıcının yaptığı işlemlerin sonuçları anlık olarak arayüzde gösterilirken bu hissin desteklenmesi amacıyla harici bir toast message kütüphanesi kullanılmıştır.

- Kullanıcıyı bunaltmaması amacıyla componentler arasındaki margin'e ve component içi paddingler dikkat edilmiş ve ekran genişçe kullanılmıştır.

- Dashboard ekranları her ne kadar masaüstü sistemlerde kullanılıyor olsa da, mobilden işi olan kullanıcı da düşünülmüş tailwind'in sağladığı esneklikten de yararlanarak responsive olarka tasarım yapılmıştır.

- Kullanıcların bilinç yükünü, uı sürtünmesini ve alışma süresini azaltmak amacıyla dashboard yenilikçi bir tasarımdan ziyade insanların alıştığı side menü, top menü ve content üçlüsü içerisinde hazırlanmıştır.

### State Management

- API'den gelen verileri her sayfada sürekli fetch edilmek yerine Pinia store üzerinde tutulmuştur. Backend'deki pagination mimarisi ile uyumlu çalışacak şekilde store yapısı kurgulanmış, gereksiz API isteklerinin önüne geçilmiştir.
- Pinia store'ları domain bazında ayrılmıştır: useTransactionsStore, useAgentsStore usePropertiesStore. Her store kendi domain verisini, loading ve error state'lerini yönetir.
- Bu sayede transaction sayfasında da ihtiyaç olan properties ve agents verilerinin gereksiz yere fetch edilmesi engellenmiştir.

### Error Handling

- Storelar içerisinde yazdığım api isteklerinin mesajları direkt olarak extract edilip, toast message olarka kullanıcıya sunulmuştur. Böylece her bir istek için try, catch bloğu yazılmasına ihtiyaç kalmamamıştır. Başka bir projede http kodlarına göre detaylı error handling ihtiyacı olabilirdi fakat bu projenin zaman ve kapsamında gerek görülmemiştir.

### Hosting

- Halihazırda elimde bir vps/vds server bulunmadığı için free modellere sahip olan hosting servisleri tercih edilmiştir. Backend Render'de frontend ise Vercel'de host edilmiştir.

### NOT

- Render free modelde servis kullanılmayınca ototmatik olarak uyku moduna alıyor. Arayüzü test ederken eğer veriler gelmezse 40-50sn bekleyin.
