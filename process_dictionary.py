
import json
import re
import os

# Absolute path to the file
file_path = r"d:\Masaustu\master-plan\data\master-curriculum.json"

raw_data = """
Açık Devre (Open Circuit) : Devre anahtarının devreden akım geçmeyecek konumda olması durumu.
Adi Anahtar : Bir lambayı veya bir grup lambayı aynı anda, aynı yerden yakıp söndürmeye yarayan anahtarlara denir.
Admitans ( Admitance) : Alternatif gerilim devrelerinde empedans‘ın tersidir. Y ile gösterilir. Y=1/Z
Akım ( Current) : İletkenin bir noktasından bir saniyede geçen elektron miktarı. Birimi Amper (A)’dir. I=V/R
Akım Yoğunluğu ( Current Density) : İletkenin 1mm2’lik kesitinden geçen akım miktarına akım yoğunluğu denir. J harfi ile gösterilir. Birimi A/mm2’dir. J=I/S formülü ile hesaplanır. I=İletkenden geçen akım (A) S=İletkenin kesidi (mm2)
Aktif Enerji : ( Real Energy) Aktif gücün zamanla çarpımıyla elde edilen enerji. Mesela 10 kW’lık bir motor 2 saat çalışırsa 2×10=20 kWh aktif enerji harcar.
Aktif Güç ( Real Power) : Birimi Watt olan görünür gücün faz açısının kosinüsü ile çarpımı ile elde edilen elektriğin iş yapan gücü. P=VxIxcosφ
Alçak Geçiren Filtre ( Low Pass Filter) : Düşük frekansları geçiren, alçak frekansları engelleyen filtre devresi.
Alternans ( Alternans) : Her bir yarım saykıla alternans denir.
Alternatif Akım ( Alternative Current) : Yönü ve büyüklüğü zamana göre sinüs dalgası biçiminde değişen akımdır.
Ampermetre ( Ampermeter) : Doğru veya alternatif akım devrelerinde alıcının çektiği akımı ölçen ölçü aleti olup devreye seri bağlanır. Ampermetreler (A) harfi ile belirtilir.
Anahtar ( Switch) : Devreyi açıp kapatmaya yarayan araçlardır.
Anma Akımı ( Rated Current) : Bir elektrikli alet veya makinanın gerek ısınmasına, gerekse çalışmasına ilişkin yapılan hesapların dayandırıldığı olağan çalışma akım değeri.
Anma Değeri ( Rated Value) : Bir bileşen, aygıt ya da donatım için çoğunlukla yapımcısı tarafından atanmış ve belirli çalışma koşullarında geçerli nicel değer.
Anma Frekansı ( Rated Frequency) : Elektrikli bir aletin çalışma sınırlarının ve test koşullarının tanımlanmasını sağlamak üzere belirtilmiş frekans değeri.
Anma Gerilimi ( Rated Voltage) : Bir elektrikli alet veya makinanın gerek gerilim sınırlarının gerekse işlemesine ilişkin hesapların dayandırıldığı gerilim değeri.
Anma Hızı ( Rated Speed) : Döner makinalarda, bir motorun en büyük dönme hızı.
Armatür ( Armatur) : DC veya üniversal elektrik motorlarında motorun dönen parçası.
Aşırı Yük ( Overload) : Bir elektrikli alete veya elektrik sistemine taşıyabileceğinden çok fazla elektriğin veya yükün yüklenmesi.
Avometre : Multimetre, Ampermetre, Voltmetre, Ohmmetre; Amper, Volt, Ohm ölçebilen elektronik cihazlardır.
Aydınlatma Armatürü ( Lighting Fixture) : Lambaların bir veya birden çoğunu bünyesinde taşıyan onlara dekoratif bir görünüm veren ve bazen de olumsuz dış etkilerden koruyan aydınlatma araçlarıdır.
Aydınlatma Şiddeti ( Luminous Intensity) : Aydınlanan bir yüzeyin 1 m2’sine, bu yüzeyi aydınlatan ışık kaynaklarından gelen ışık akılarının toplamıdır. Birimi Lüx (lx) veya lümen/m2
Balast ( Ballast) : Floresan lambalarda ilk anda lambaya enerji uygulanıp flamanların ısınması sonunda, starter aracılığı ile flamanları ısıtmak ve atlama gerilimi oluşturmak ve lambanın yanmasından sonra çalışma geriliminin yaklaşık %50′si oranında gerilim düşümü meydana getirmek için kullanılan elektrik devre elemanı.
Baskı Devre ( Printed Circuit) : Elektronik devre elemanlarının üzerine yerleştirildiği ve bu elemanlar arasındaki elektriksel bağlantının bakırlı yüzde oluşturulan yollarla sağlandığı plakalara baskı devre veya baskı devre kartı (Printed Circuit Board) (PCB) denir.
Besleme Gerilimi ( Supply Voltage) : Bir devrenin çalışabilmesi için devreye uygulanan gerilim.
Bobin ( Coil) : İletken bir telin nüve denilen bir malzeme üzerine ardışıl bir şekilde ve belli bir çapta sarılmasıyla elde edilen devre elemanı. Nüve yerine hava da olabilir.
Boşalma ( Discharge) : Elektriksel potansiyeli çevresinden daha yüksek olan bir cismin yükünü yitirmesi veya gaz içerisinden akım geçmesi.
Buat ( Conduit Box) : Elektrik tesisatlarında içerisinde iletkenlerin eklendiği ve dağıtımlarının yapıldığı ek kutularıdır.
Buton ( Push Button) : Çağırma ve bildirim tesisatlarında devreye enerji verip kesmeye yarayan elemanlara buton denir.
Candela ( Candela) : Bir atmosfer ( 101325 N/m2) basınç altında ve platinin ergime sıcaklığındaki ( 1769 oC ) bir siyah cismin 1/60000 m2 büyüklüğündeki yüzeyinin kendisine dik olan bir doğruda verdiği ışık şiddetine candela denir. I ile gösterilir.
Dağıtım ( Distribution) : Elektrik enerjisinin ev, ofis gibi kullanıcılara ulaştırılması.
Dağıtım Hattı ( Distribution System) : Elektrik enerjisini son kullanıcılara ulaştıran elektrik enerji sistemi.
Delinme ( Breakdown) : Gazlarda istenmeyen bir boşalma etkisiyle bir aralığın direncinin, birden bire pratik olarak sonsuz olan değerden görece alçak bir değere düşmesi.
Desibel ( Decibel) : İki sinyal seviyesinin oranını ölçen logaritmik ölçüm. dB ile gösterilir. dB=10log(Güç1/Güç2)
Devre ( Circuit) : Elektrik akımının aktığı iletken veya iletkenlerden ve elektrik elemanlarından oluşan sistem.
Devrilme Momenti ( Breakdown Torque) : Elektrik motorlarında bir motorun üretebileceği maksimum moment.
Dinamo ( Dynamo) : Hareket enerjisini doğru akım elektrik enerjisine dönüştüren makinelere dinamo denir.
Direnç ( Resistance) : Elektrik akımının akışına direnç gösteren ve iki kutbu arasında gerilim düşümüne neden olan devre elemanı. Birimi Ohm’dur. R=V/I
Diyot ( Diode) : Anot ve katottan oluşan anodunun katoduna göre pozitif alternansta olması durumunda kapalı durumda olan ve akımı ileten kontrolsüz anahtarlama elemanı.
Doğru Akım ( Direct Current) : Zamana göre değeri değişmesine rağmen yönü değişmeyen pozitif (+) veya negatif (-) değerde olan akım.
Doğrultucu ( Rectifier) : Alternatif gerilimleri doğru gerilime dönüştüren devrelerdir. Tam dalga, yarım dalga, kontrollü veya kontrolsüz doğrultucular bulunmaktadır.
Doğruluk Tablosu ( Truth Table): Lojik (sayısal) devrelerde giriş değişkenlerinin alabileceği bütün olası değerlere karşı çıkış değerlerini gösteren tasarım ve analiz tablosudur.
Duy ( Lamp Base) : Elektrik lambasının, vidalanarak veya takılarak elektrik tesisine bağlanmasını sağlayan gereçtir
Duyarlılık ( Sensitivity) : Ölçü aletinde ölçülen büyüklüğün çok küçük değişimlerinin skala veya göstergede ifade edilebilmesidir.
Elektrik Dağıtımı ( Distribution) : Elektrik enerjisinin 36kV gerilim altındaki hatlar ile yerleşim birimleri içinde nakli.
Elektrik Sayacı ( Electric Meter) : Elektrik devrelerinde alıcıların harcadığı elektrik enerjisini, yani harcanan güç ile zaman çarpımını ölçen ölçü aletleridir. sayaçlarda akım ve gerilim bobini olmak üzere iki bobin bulunur. Akım bobini devreye seri, gerilim bobine devreye paralel bağlanır.
Elektromanyetizma ( Electromagnetism) : Elektrik akımı ile elde edilen manyetik alana genel olarak elektromanyetizma denir.
Elektrostatik Voltmetre ( Electrostatic Voltmeter) : Elektrostatik etkiden yararlanarak iki nokta arasındaki gerilimi ölçen alete elektrostatik voltmetre denir.
EMK ( EMF – Electro Motor Force) : Elektromotor kuvvet, elektrik devrelerinde, devrenin açık olduğu ve devreden elektrik akımı çekilmediği durumda devredeki kaynağın iki kutbu arasındaki potansiyel farka denir. Elektromotor kuvvet emk harfleri ile tanımlanır ve sembolü ise E dir. Birimi V’dir.
Empedans ( Impedance) : Alternatif gerilim devrelerinde kaynağa bağlı olan elemanın akıma gösterdiği dirençtir. Z ile gösterilir.
Endüktans ( Inductance) : Bobinin birimi Henry olan elektriksel değeri.
Fider : Üretici ile müsteri arasındaki besleme hattıdır.
Fırça ( Brush) : Elektrik motorlarında rotor akımının iletilmesi için kullanılan iletken parça.
Fiş ( Power Plug) : Bir aygıt veya uzatma kablosundaki iletkenleri, prizdeki kontaklar aracılığı ile elektrik tesisi iletkenlerine birleştirmeyi veya bunlardan ayırmayı sağlayan bir araçtır.
Fosil Yakıt (Fossil Fuel) : Petrol, kömür, doğalgaz gibi doğada kendiliğinden oluşan yakıtlar.
Foto Diyot ( Photodiode) : Işığa duyarlı olarak iletime geçen diyot. Daha çok sensörlerde kullanılır.
Foton ( Photon) : Işığı oluşturan enerji paketlerin her birine foton denir
Frekans ( Frequency) : Alternatif akımın veya gerilimin bir saniyedeki devir sayısının Hz (hertz) birimi ile ifade edilmesi.
Frekansmetre ( Frequency Meter) : Alternatif akım devrelerinde elektrik enerjisinin frekansını ölçen aletlerdir. Frekansmetreler devreye paralel bağlanır ve (Hz) şeklinde ifade edilir.
Genlik ( Amplitude) : Sinüs biçimli periyodik bir büyüklüğün en yüksek değeri.
Gerilim (Voltaj) ( Voltage) : Elektrik devresinde akım akmasına neden olan güç.
Girdap Akımı ( Eddy Current) : Elektrik makinelerinin demir çekirdeğinde alternatif manyetik akı tarafından oluşturulan akımlar.
Görünür Güç ( Apparent Power) : Birimi VoltAmper olan elektrik gerilimi ve akımının çarpımı ile elde edilen güç. P=VxI
Güç Faktörü ( Power Factor) : Devredeki akım ve gerilim fazörleri arasındaki açının cosinüsüne denir. GF=cosφ
Hava Aralığı ( Air Gap) : Elektrik motorlarında stator ve rotor arasındaki boşluk.
Havya ( Soldering Iron) : Lehim yapmakta kullanılan ısıtıcı alet.
Hidroelektrik Santral ( Hydroelectric Power Plant) : Su gücünün kullanılmasıyla elektrik enerjisi elde edilen santrallerdir
HVAC ( Heating, Ventilation, and Air Conditioning) : Isıtma, soğutma ve iklimlendirme kelimelerinin ingilizce baş harflerinden oluşmuş, ısıtma, soğutma ve iklimlendirme sistemleriyle ilgilenen endüstri dalı.
Işık Akısı ( Luminous Flux) : Işık kaynağından yayılan ve gözün değerlendirebildiği ışınıma ışık akısı denir. Birimi Lümen (Lm)’dir. Φ ile gösterilir.
Işık Şiddeti( Intensity of Light) : Belli bir yöne doğru elde edilen, görülebilen ışınıma ışık şiddeti denir. Birimi Candela (cd)’dır.
İletim Hattı ( Transmission Line) : Elektrik enerjisini üretim merkezlerinden dağıtım merkezlerin taşıyan yüksek gerilim hatları.
İletken ( Conductor) : Elektrik enerji kaynağı ile elektrik enerjisini kullanacak cihaz arasındaki elektrik akımının akışını sağlayan, elektrik akımının taşındığı metal cisim.
İnverter ( Inverter) : Doğru gerilimi alternatif gerilime dönüştüren araçlar.
İzolatör( İnsulator) : Elektrik devre parçalarını birbirinden ayırıp akımın geçişini engelleyen malzeme.
Jeneratör ( Generator) : Mekanik enerjiyi elektrik enerjisine çeviren elektrik makinesi
Joule – Joule kavramı : (Joule etkisi olarak da bilinir), bir iletken üzerinden geçen elektrik akımı ile onun yarattığı ısı arasındaki ilişkiyi veren fiziksel bir kanundur.
Kadmiyum ( Cadmium) : Simgesi Cd, atom numarası 48 olan pil yapımında kullanılan kimyasal enerji.
Kalibrasyon ( Calibration) : Belirli koşullar altında ölçü aletlerinin ölçtüğü değerlerin doğruluğunun karşılaştırılması, ölçme hassasiyetinin belirlenmesi işlemi.
Kalkış Akımı ( Starting Current) : Elektrik motorlarında motorun ilk kalkış anında çektiği akım. Genelde nominal akımın 5-7 katı kadar olur.
Kapalı Devre ( Closed Circuit) : Devre anahtarının devreden akım geçecek konumda olması durumu.
Kapasitans ( Capacitance) : Birimi Farad (F) olan kondansatörün elektrik enerjisini depo edebilme özelliğine kapasitans denir. kondansatörün elektrik enerjisini depo edebilme özelliğine kapasite denir.
Kesinti( Outage) : Elektrik enerji üretim, iletim veya dağıtım sisteminin her hangi bir nedenden dolayı devre dışı kalması, tüketicilere enerji sağlanamaması durumu.
Kesme Gücü ( Breaking Capacity) : Anma şartları altında belirtilmiş bir gerilimde, bir anahtarlama aygıtının ya da sigortanın kesebileceği beklenen akım değeri.
Kinetik Enerji ( Kinetic Energy) : Hareket halindeki cisimlerin sahip oldukları enerjidir. Ek=1/2xmxV2 olarak ifade edilir. Birimi joule’dur. m=cismin kütlesi (kg) V=cismin hızı (m/s)
Kısa Devre ( Short Circuit) : Elektrik akımının akımı kullanacak cihaz veya devre üzerinden geçmeden yolunu tamamlaması durumu.
Klemens ( Electric Terminal) : Aydınlatma ve güç tesislerinde buat (ek kutusu) içinde eklerin (iletken bağlantılarının) yapılması için kullanılan gereçtir.
Kojenerasyon ( Cogeneration) : Tek bir sistemde bileşik olarak hem ısı hem de elektrik gücü üretim sistemi.
Komutatör Anahtar ( Double-Pole Switch) : İki ayrı lamba veya lamba grubunun bir yerden aynı anda veya ayrı ayrı yakılıp söndürülmesinde kullanılan anahtarlardır.
Kondansatör ( Capacitor) : Karşılıklı duran ve aralarında fiziksel bir temas olmayan iki ayrı plaka ve plakalara bağlı iki ayrı iletken telden oluşan elektrik enerjisini depolamak amacıyla kullanılan devre elemanları.
Kontaktör ( Contactor) : Büyük güçteki elektromanyetik anahtarlara kontaktör adı verilir.
Kontrol Kalemi ( Neon Tester) : Bir hatta elektrik olup olmadığını kontrol etmek için kullanılan alet.
Köprü Doğrultucu ( Bridge Rectifier) : Dör adet diyotla yapılan alternatif gerilimi doğru gerilime dönüştüren devrelerdir.
Korona ( Corona) : Bir iletkenin yakın çevresinde oluşan, iletkenin önemli ölçüde ısınmasına yol açmayan ve iletken etrafındaki elektrik alanının belli bir değeri aştığı uzay bölümü ile sınırlanan, zayıf ışıltılı bir elektriksel boşalma.
Kroşe ( Crochet) : Kabloların, boruların duvar veya tavana tutturulmasına yarayan pvc veya sacdan yapılan gereçlerdir
Kumpas ( Caliper) : Milimetrenin yüzde onu, yüzde beşi ve yüzde ikisi oranında ölçüm yapılabilen aletlerdir.
Lehim Pastası ( Soldering Flux Paste) : Lehimlenecek yüzeylerin yağdan ve zararlı kir ve oksitlerden temizlenmesini sağlayan malzeme.
Lermetre : Elektrik devrelerinde değişik amaçlar için kullanılan ve alıcı olarak görev yapan direnç, bobin ve kondansatörün; direnç, endüktans ve kapasite değerlerini ölçen ölçü aletleridir.
Lineer Sistem ( Linear System) : Çıkış sinyalinin direk olarak giriş sinyaline bağlı olan sistem.
Lojik Kapıları ( Logic Gates) : Lojik (sayısal) devrelerde mantıksal işlemler (ve, veya, değil gibi) yapan elektronik devre elemanlarıdır.
Lüksmetre ( Luxmeter) : Aydınlatma şiddetini ölçen aletlere lüksmetre denir.
Lümen ( Lumen) : ışık şiddeti 1 candela ( cd ) olan bir nokta kaynaktan bir metre uzaklıkta, ışınlara dik olarak konmuş 1 m2 lik yüzeye gelen ışık akısıdır.
Lüx ( Lux) : 1 m yarıçaplı küre merkezinde bulunan 1 cd şiddetindeki kaynağın 1 m2’lik küre yüzeyine yaptığı aydınlanma şiddetidir.
Ohm ( Ohm) : Elektriksel direnci ölçme birimi. Simgesi Ω’dur.
Ohmmetre ( Ohmmeter) : Bir direncin değerini ölçmek için kullanılan cihazdır.
Osiloskop ( Oscilloscope) : Elektrik ve elektronik devrelerinde akım ve gerilimin değeri, frekans ve faz farkı ölçümlerini dijital veya analog ekranda grafiksel olarak gösteren aletlerdir.
Özdirenç ( Specific Resistance) : Birim uzunluk (1 metre) ve birim kesitteki (1mm2) iletkenin direncine özdirenç denir.
Öziletkenlik ( Specific Conductance) : Özdirencin tersine öziletkenlik denir.
Pano ( Cubicle) : Elektrik devresinin, elektrik ekipmanlarının içerisinde bulunduğu sayaç giriş çıkışının içinde bulunduğu kutu.
Pensampermetre ( Clamp Ammeter) : Akım ölçme işlemini daha pratik hale getirmek için ampermetre ve akım trafosu aynı gövde içerisinde birleştirilerek oluşturulmuş ölçü aletleridir. Aletin gövdesinden dışarı doğru açılan demir nüvesi, pens gibi açılıp kapanacak şekilde yapılmıştır. Böylece akımı ölçülecek iletken kesilmeden pens içerisine alınır.
Pense ( Pliers) : İletkenleri, küçük parçaları tutmaya, çekmeye, sıkıştırmaya ve bükerek şekil vermeye yarayan bir alet olan pensenin sap kısımları izole edilmiştir.
Periyod ( Period) : Bir saykılın tamamlanması için geçen zamana periyod denir.
Piezoelektrik ( Piezoelectricity) : Yapısındaki atomların düzenli olarak dizilmemiş olan moleküller mekanik bir basınç altında kaldığında elektrik akımı oluşur, veya tam tersi olarak elektrik akımı verilen bu maddelerin hacminde değişiklik olur. Buna piezoelektrik denir.
Potansiyel Enerji ( Potential Energy) : Cisimlerin bulundukları konum ya da şekil değişikliğine bağlı olarak sahip oldukları enerjidir. Ep=mxgxh olarak ifade edilir. Birimi joule’dur. m=cismin kütlesi (kg) g=yer çekimi ivmesi (m/s2) h=cismin yerden yüksekliği (m)
Priz ( Electric Outlet) : Elektrik cihazlarına, bir elektrik devresinden fiş aracılığı ile doğrudan veya uzatma kablosu ile enerji alınması için kullanılan araçtır.
PTC ( Positive Temperature Coefficient) : Üzerindeki sıcaklık arttıkça direnci artan, sıcaklık azaldıkça direnci azalan; yani direnci sıcaklıkla doğru orantılı olarak değişen pozitif ısı katsayılı termistörler.
Reaktif Güç ( Reactive Power) : Birimi Var olan görünür gücün faz açısının sinüsü ile çarpımı ile elde edilen elektrik makinelerinde mıknatıslanma için kullanılan güç. Q=VxIxsinφ
Regülasyon ( Regulation) : Gerilimi sabit tutma işlemine denir.
Regülatör ( Regulator) : Elektrik gerilimini sabit tutan cihazlardır.
Rezistans ( Resistance) : Elektrik enerjisinden yararlı ısı elde etmek için ihtiyaç duyulan direnç değeri yüksek ve ısıya dayanıklı iletkenlere rezistans denir.
Röle ( Relay) : Bobin, palet ve kapak olmak üzere üç ana bölümden meydana gelen, bir elektrik devresinin açılıp kapanmasını sağlayan elektromekanik anahtarlama elemanıdır.
Rotor ( Rotor) : Hareketli elektrik makinelerinde (motor, jeneratör) ince sac tabakalarının üst üste konulmasıyla oluşturulmuş makinenin dönen parçası.
Rüzgar Elektrik Santrali ( Wind Power Plant) : Rüzgâr alan açık arazilerde, rüzgârın etkisiyle rüzgâr türbinlerinde elde edilen mekanik enerji alternatör yardımıyla elektrik enerjisine dönüştürülen santrallere denir.
Saykıl ( Cycle) : Alternatif akım veya gerilim sıfırdan başlar, maksimum değerini alır ve sıfıra döner, ters yönde de aynı işlem gerçekleşerek tekrar başlangıç noktası sıfıra döner. Akım veya gerilimin her iki yöndeki bütün değerleri almasına denir.
Selenoid ( Selenoid) : Üzerindeki bobine enerji verilince kullanıldığı yere göre sıvı ve hava geçişini kontrol etmeye yarayan elektromekanik vanadır.
Senkron ( Synchronous) : Eş zamanlı. Elektrik motorlarında döner alanın devir sayısına senkron hız denir.
Sigorta ( Fuse) : Alternatif veya doğru akım devrelerinde elektrik tesisatını, tesisata bağlanan elektrikli aletleri veya elektrik devrelerini aşırı akımlara karşı korumaya yarayan açma elemanıdır.
Sorti : Enerjinin anahtar prize getirilmesine kadar oluşan tesisat.
Starter ( Fluorescent Starter) : İçi neon gazı ile doldurulmuş cam bir balon içinde iki elektrodu bulunan silindir şeklinde bimetal şeritten oluşmuş floresan lambalarda ilk ateşlemeyi sağlayan elektrik devre elemanı.
Şönt Kapasitör ( Shunt Capacitor) : Reaktif (kapasitif) güç üreten sisteme paralel bağlı olan kondansatör grubu.
Takometre ( Tachometer) : Devir sayısını ölçen aletlere takometre denir.
Talep Güç ( Demand Power) : Enerji hattına bağlı olan yüklerin çalışması için ihtiyaç duyulan güç.
Termik Elektrik Santrali ( Thermal Power Plant) : Kömür, doğalgaz, petrol ürünleri gibi fosil yakıtların yanmasıyla elde edilen ısı enerjisini kullanarak elektrik üreten santrallere termik elektrik santrali denir.
Termokupl ( Thermocouple) : İki farklı metalden yapılmış, sıcaklığı okuyarak elektrik sinyaline çeviren sıcaklık ölçüm aracı.
Topraklama ( Grounding) : Gerilim altında olmayan bütün tesisat kısımlarının, uygun iletkenlerle toprak kitlesi içerisine yerleştirilmiş bir iletken cisme (elektrot) bağlanmasıdır
Topraklama Menholü ( Grounding Manhole) : Topraklama iletkenlerinin bağlandığı topraklama elektrodunun toprağa gömüldüğü kuyu.
Tornavida ( Screw Driver) : Vidaları söküp takmaya yarayan alet. Farklı uçlarda tornavidalar bulunmasına rağmen en çok kullanılanı yıldız uçlu ve düz uçlu olan tornavidalarardır.
Transformatör –  Trafo ( Transformer) : Alternatif elektrik gerilimini veya akımını belirli oranda dönüştüren veya yükselten elektrik makinası. Giriş ve çıkış bobinlerinin sarım sayıları oranına göre çıkış gerilimi yükselir veya düşer.
Transistör ( Transistor) : Girişine uygulanan sinyali yükselterek gerilim ve akım kazancı sağlayan, gerektiğinde anahtarlama elemanı olarak kullanılan yarı iletken bir elektronik devre elemanıdır. Base, Emiter ve Kollektör uçları bulunan transistörlerde PNP veya NPN olmak üzere iki çeşittir.
Vaviyen Anahtar ( Three-Way Switch) : Bir lambayı veya bir grup lambayı iki ayrı yerden aynı zamanda veya farklı zamanlarda yakıp söndüren anahtar çeşididir.
Volt ( Volt) : akım, direnç, gerilim, potansiyel fark, volt
Voltmetre ( Voltmeter) : Doğru ve alternatif akım devresinin ya da devreye bağlı bir alıcının uçlarındaki gerilim değerini ölçmeye yarayan ölçü aleti olup devreye paralel bağlanır. Voltmetreler (V) harfi ile belirtilir.
Wattmetre ( Wattmeter) : Doğru ve alternatif akım devrelerinde alıcıların çektikleri elektriksel gücü ölçen aletleridir. Wattmetreler akım ve gerilim bobinlerine sahip olup akım bobini devreye seri, gerilim bobini devreye paralel bağlanır. Güç hesaplamalarda (P) harfi ile ifade edilir.
Yan Keski( Side Cutter) : İletkenleri kesmek amacıyla kullanılan pense türü bir alet.
Yarı İletken ( Semiconductor) : Elektrik akımını çok az ileten materyaller. Silikon, Germanyum başlıca yarı iletkenlerdir.
Yük ( Load) [Elektriksel Yük] : Belli bir miktar enerji tüketen, enerji hattından güç çeken sistem.
Yüksek Geçiren Filtre ( High Pass Filter) : Yüksek frekanslı sinyalleri geçiren düşük frekansları engelleyen filtre devresi.
Yüksek Gerilim : ( High Voltage) Elektrik enerji sistemlerinde 100.000 volttan yüksek gerilimler.
"""

# Read existing JSON file
with open(file_path, "r", encoding="utf-8") as f:
    data = json.load(f)

new_entries = []

for line in raw_data.strip().split('\n'):
    line = line.strip()
    if not line:
        continue

    # Improved Regex Patterns (More robust)
    
    # Pattern 1: TR (EN) ... : Def
    # Handles cases where there might be extra brackets like [Elektriksel Yük] before the colon
    match1 = re.match(r'^(.+?)\s*\(\s*(.+?)\s*\).*?[:]\s*(.+)$', line)
    
    # Pattern 2: TR : (EN) Def
    match2 = re.match(r'^(.+?)\s*[:]\s*\(\s*(.+?)\s*\)\s*(.+)$', line)
    
    # Pattern 3: TR : Def
    match3 = re.match(r'^(.+?)\s*[:]\s*(.+)$', line)

    term = ""
    tr = ""
    definition = ""
    
    if match1:
        tr = match1.group(1).strip()
        term = match1.group(2).strip()
        definition = match1.group(3).strip()
    elif match2:
        tr = match2.group(1).strip()
        term = match2.group(2).strip()
        definition = match2.group(3).strip()
    elif match3:
        tr = match3.group(1).strip()
        definition = match3.group(2).strip()
        term = tr # Fallback if no english found
    else:
        # If no regex matches, it might be a weird line.
        # Let's try to split by colon as last resort
        if ':' in line:
            parts = line.split(':', 1)
            tr = parts[0].strip()
            definition = parts[1].strip()
            term = tr
        else:
            print(f"Skipping line: {line}")
            continue

    # Cleanup terms
    if "–" in term:
        term = term.split("–")[0].strip()
    if "–" in tr:
        tr = tr.split("–")[0].strip()
        
    # User Request: "English terms first"
    # So we want 'term' field to be the english one.
    
    # Check for duplicates? User said "just add them", but avoiding raw duplicates is good.
    # We will assume they are new.

    entry = {
        "term": term,
        "tr": tr,
        "category": "Engineering",
        "definition": definition
    }
    new_entries.append(entry)

# Append to dictionary
if "dictionary" in data:
    data["dictionary"].extend(new_entries)
else:
    data["dictionary"] = new_entries

# Write back to file with proper formatting
with open(file_path, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=4, ensure_ascii=False)

print(f"Successfully added {len(new_entries)} entries to master-curriculum.json")
