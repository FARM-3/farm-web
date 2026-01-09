import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  RefreshCw,
  Calendar,
  ArrowUp,
  ArrowDown,
  Edit,
  Trash2,
  Search,
  Plus,
  ChevronsDown,
  Loader2,
  UserCircle,
  MapPin,
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  Send,
} from "lucide-react";
import { SideNav } from "../components/SideNav";
import {
  GeoapifyGeocoderAutocomplete,
  GeoapifyContext,
} from "@geoapify/react-geocoder-autocomplete";
import "@geoapify/geocoder-autocomplete/styles/minimal.css";
import LocationSelector from "../components/LocationSelector";
import CustomAutocomplete from "../components/CustomAutocomplete";
import BulkStaffSpreadsheet from "../components/BulkStaffSpreadsheet";
import * as XLSX from "xlsx";

const CoffeeColors = {
  SCREEN_BG: "#FFF8F6",
  ACTIVE_LINK_BG: "#efebe9",
  ACTIVE_LINK_TEXT: "#783A1E",
  DARK_BROWN: "#4A3423",
  MEDIUM_BROWN: "#795548",
  BUTTON_BROWN: "#795548",
  GRAY_TEXT: "#8D8D8D",
  SUCCESS_GREEN: "#34A853",
  ERROR_RED: "#EA4335",
};

const STAFF_API_ENDPOINT = `${import.meta.env.VITE_API_URL}/api/staff/`;

// COMPREHENSIVE UGANDA DISTRICTS DATA (146 Districts)
// Source: Uganda Electoral Commission & UBOS 2025
const LOCATION_DATA = {
  "Abim": ["Abim","Abim Town Council","Alerek","Atunga","Awach (Abim)","Camkok","Kiru Town Council","Lotukei","Magamaga","Morulem","Nyakwae","Opopongo"],
  "Adjumani": ["Adjumani Town Council","Adropi","Arinyapi","Ciforo","Dzaipi","Itirikwa","Ofua","Pachara","Pakele","Pakele Town Council","Ukusijoni"],
  "Agago": ["Adilang","Adilang Town Council","Agago Town Council","Agengo","Ajali","Arum","Geregere","Kalongo Town Council","Kotomor","Kuywee","Lai-Mutto Town Council","Lamiyo","Laperebong","Lapono","Lira Kato","Lira-Palwo","Lira-Palwo Town Council","Lokole","Omiya Pacwa","Omot","Paimol","Parabongo","Patongo","Patongo Town Council","Wol","Wol Town Council"],
  "Alebtong": ["Abako","Abia (Alebtong)","Adwir","Akura","Alebtong Town Council","Aloi","Aloi Town Council","Amugu","Amugu Town Council","Angetta","Apala","Apala Town Council","Awei","Omoro"],
  "Amolatar": ["Abeja","Acii","Agikdak","Agwingiri","Akwon","Amolatar Town Council","Aputi","Arwotcek","Awello","Etam","Etam Town Council","Muntu","Nalubwoyo","Namasale","Namasale Town Council","Opali"],
  "Amudat": ["Abiliyep","Achorichor","Amudat","Amudat Town Council","Karita","Katabok","Kongorok","Lokales","Loroo","Losidok"],
  "Amuria": ["Abarilela","Abia (Amuria)","Akeriau","Amolo","Amuria Town Council","Apeduru","Asamuk","Kuju","Morungatuny","Ogolai","Ogongora","Olwa","Ongongora","Orungo","Wera","Willa"],
  "Amuru": ["Amuru","Amuru Town Council","Atiak","Atiak Town Council","Elegu Town Council","Guru Guru","Lakang","Lamogi","Layima","Opara","Pabbo","Pabbo Town Council","Pogo"],
  "Apac": ["Agulu Division","Akere Division","Akokoro","Akokoro Town Council","Apac","Apoi","Arocha Division","Atik Division","Chegere","Ibuje","Ibuje Town Council","Te-Boke"],
  "Arua": ["Adumi","Aii-Vu/ajivu","Ajia","Anyiribu (Arua)","Arivu","Aroi","Arua Hill","Ayivuni","Beleafe","Dadamu","Ewanga (Arua)","Katrini","Logiri","Manibe","Odupi","Offaka (Arua)","Ogoko (Arua)","Okollo (Arua)","Oli River","Oluko","Omugo","Pajulu","Pawor (Arua)","Rhino Camp (Arua)","Rigbo (Arua)","Uleppi (Arua)","Uriama","Vurra"],
  "Budaka": ["Budaka","Budaka Town Council","Iki-Iki","Iki-Iki Town Council","Kabuna","Kachomo","Kachomo Town Council","Kaderuna","Kadimukoli","Kakoli","Kakule","Kameruka","Kamonkoli","Kamonkoli Town Council","Katira","Lyama","Mugiti","Naboa","Naboa Town Council","Nansanga","Tademeri"],
  "Bududa": ["Bubiita","Bududa","Bududa Town Council","Bufuma","Bukalasi","Bukibino","Bukibokolo","Bukigai","Bukigai Town Council","Bulucheke","Bumasheti","Bumayoka","Bumwalukani","Bunabutiti","Bunatsami","Bundesi","Bushika","Bushiribo","Bushiyi","Busiriwa","Buwali","Kikholo Town Council","Kuushu Town Council","Mabono","Nabweya","Nakatsi","Nalwanza","Nangako Town Council"],
  "Bugiri": ["Budhaya","Bulesa","Bulidha","Buluguyi","Busowa Town Council","Buwunga (Bugiri)","Buwuni Town Council","Eastern Division (Bugiri)","Iwemba","Kapyanga","Muterere","Muterere Towm Council","Nabukalu","Nabukalu Town Council","Namayemba Town Council","Nankoma","Nankoma Town Council","Western Division (Bugiri)"],
  "Bugweri": ["Busembatia Town Council","Buyanga (Bugweri)","Ibulanku","Igombe","Makuutu","Namalemba"],
  "Buhweju": ["Bihanga (Buhweju)","Bitsya","Buhunga (Buhweju)","Burere","Engaju","Karungu","Kashenyi-Kajani Town Council","Kyahenda","Nsiika Town Council","Nyakashaka Town Council","Nyakaziba Town Council","Nyakishana","Rubengye","Rwengwe"],
  "Buikwe": ["Buikwe","Buikwe Town Council","Central Division (Buikwe)","Kawolo Division","Kiyindi Town Council","Najja","Najjembe Division","Ngogwe","Njeru Division","Nkokonjeru Town Council","Nyenga Division","Ssi","Wakisi Division"],
  "Bukedea": ["Aligoi","Aminit","Bukedea","Bukedea Town Council","Kabarwa","Kachumbala","Kamutur","Kangole","Kidongole","Kocheka","Koena","Kolir","Komuge","Kongunga Town Council","Kwarikwar","Malera"],
  "Bukomansimbi": ["Bigasa","Bukango","Bukomansimbi Town Council","Butenga","Kibinge","Kitanda"],
  "Bukwo": ["Amanang","Brim","Bukwa","Bukwo Town Council","Chepkwasta","Chesower","Kabei","Kamet","Kapkoros","Kapsarur","Kaptererwo","Kortek","Lwongon","Mutushet","Riwo","Senendet","Suam","Tulel"],
  "Bulambuli": ["Bufumbo (Bulambuli)","Buginyanya","Bukhalu","Bulago","Bulambuli Town Council","Bulegeni","Bulegeni Town Council","Buluganya","Bumasobo","Bumufuni","Bumugibole","Bunalwere","Bunambutye (Bulambuli)","Buwanyanga","Buyaga Town Council","Bwikhonge","Kamu","Lusha","Masira","Muyembe","Nabbongo","Nabiwutulu","Namisuni","Simu","Sisiyi","Sotti"],
  "Buliisa": ["Biiso","Biiso Town Council","Buliisa","Buliisa Town Council","Butiaba","Butiaba Town Council","Kigwera","Kihungya","Ngwedo"],
  "Bundibugyo": ["Bubandi","Bubukwanga","Buganikere Town Council","Bukonzo","Bundibugyo Town Council","Bundingoma","Burondo","Busaru","Busunga Town Council","Butama-Mitunda Town Council","Harugali","Kagugu","Kasitu","Kirumya","Kisubba","Mabere","Mbatya","Mirambi","Ndugutu","Ngamba","Ngite","Ntandi Town Council","Ntotoro","Nyahuka  Town Council","Sindila","Tokwe"],
  "Bunyangabu": ["Buheesi","Buheesi Town Council","Kabonero","Kateebwa","Kibiito","Kibiito Town Council","Kisomoro","Kiyombya","Kyamukube Town Council","Rubona Town Council","Rwimi","Rwimi Town Council"],
  "Bushenyi": ["Bitooma Town Council","Bumbaire","Central Division (Bushenyi)","Ibaare","Ishaka Division","Kakanju","Kizinda Town Council","Kyabugimbi","Kyabugimbi Town Council","Kyamuhunga","Kyamuhunga Town Council","Kyeizooba","Nkanga","Nyabubare","Nyakabirizi Division","Ruhumuro","Rwentuha Town Council"],
  "Busia": ["Buhehe","Bulumbi","Busime","Busitema","Buteba","Buyanga (Busia)","Dabani","Eastern Division (Busia)","Lumino","Lumino-Majanji Town Council","Lunyo","Majanji","Masaba (Busia)","Masafu","Masafu Town Council","Masinya","Namugondi Town Council","Namungondi Town Council","Sikuda","Tiira Town Council","Western Division (Busia)"],
  "Butaleja": ["Budumba","Bufujja-Kachonga Town Council","Busaba","Busaba Town Council","Busabi","Busolwe","Busolwe Town Council","Butaleja","Butaleja Town Council","Himutu","Kachonga","Mazimasa","Nabiganda Town Council","Nawanjofu","Naweyo"],
  "Butambala": ["Budde","Bulo","Gombe Town Council","Kalamba","Kibibi","Ngando"],
  "Butebo": ["Butebo","Kabelai","Kabwangasi","Kabwangasi Town Council","Kachuru","Kadokolene","Kakoro","Kakoro Town Council","Kanginima","Kanyum (Butebo)","Kapunyasi","Maizimasa","Petete","Putti"],
  "Buvuma": ["Bugaya (Buvuma)","Busamuzi","Buvuma Town Council","Buwooya","Bweema","Lubya","Lubya  Town Council","Lwaje","Lyabaana","Nairambi"],
  "Buyende": ["Bugaya (Buyende)","Bukungu Town Council","Buyanja (Buyende)","Buyende","Buyende Town Council","Gumpi","Irundu","Irundu Town Council","Kagulu (Buyende)","Kidera","Kidera Town Council","Ndolwa","Ngandho","Nkondo"],
  "Dokolo": ["Adeknino","Adok","Agwata Town Council","Agwatta","Amwoma","Bata Town Council","Batta","Dokolo","Dokolo Town Council","Kangai","Kangai Town Council","Kwera","Okwalongwen","Okwongodul"],
  "Gomba": ["Kabulasoke","Kanoni Town Council","Kifampa","Kyayi","Kyegonza","Maddu","Maddu Town Council","Mpenja","Ttaba-Bbinzi"],
  "Gulu": ["Awach (Gulu)","Bar-Dege","Bungatira","Laliya","Laroo","Layibi","Omel","Owalo","Owoo","Paibona","Paicho","Palaro","Patiko","Pece","Pukony","Unyama"],
  "Hoima": ["Bombo","Buhanika","Bujumbura Division","Buraru","Buseruka","Busiisi Division","Kabaale","Kahoora Division","Kapaapi","Kiganja","Kigorobya","Kigorobya Town Council","Kijongo (Hoima)","Kisukuma","Kitoba","Kyabigambire","Mparo Division"],
  "Ibanda": ["Bisheshe Division","Bufunda Division","Igorora Town Council","Ishongororo","Ishongororo Town Council","Kagongo Division","Keihangara","Kicuzi","Kijongo (Ibanda)","Kikyenkye","Nyabuhikye","Nyamarebe","Rukiri","Rushango Town Council","Rwenkobwa Town Council"],
  "Iganga": ["Bulamagi","Central Division (Iganga)","Kidaago","Nabitende","Nakalama","Nakigo","Nambale (Iganga)","Namungalwe","Nawandala","Nawanyingi","Northern Division (Iganga)"],
  "Isingiro": ["Birere","Bugango Town Council","Endiinzi Town Council","Endinzi","Isingiro Town Council","Kaberebere Town Council","Kabingo","Kabuyanda","Kabuyanda Town Council","Kagarama","Kakamba","Kamubeizi","Kamubeizi Town Council","Kashumba","Kikagate","Kikagate Town Council","Masha","Mbaare","Ngarama","Ntungu","Nyakitunda","Nyamuyanja","Ruborogota","Rugaaga","Ruhiira Town Council","Rushasha","Ruyanga","Rwanjogyera","Rwetango"],
  "Jinja": ["Budondo","Bugembe Town Council","Busedde","Butagaya","Buwenge","Buwenge Town Council","Buyengo","Jinja Central","Kakira Town Council","Kimaka /mpumudde","Mafubira","Walukuba/masese"],
  "Kaabong": ["Kaabong East","Kaabong Town Council","Kaabong West","Kakamar","Kakwanga (Kaabong)","Kalapata","Kamion","Kapedo (Kaabong)","Karenga(napore) (Kaabong)","Kathile","Kathile South","Kawalakol (Kaabong)","Lobalangit (Kaabong)","Lobongia","Lodiko","Lokori (Kaabong)","Lolelia","Lolelia South","Lotim","Loyoro","Morungole","Sangar (Kaabong)","Sidok (kopoth)","Timu"],
  "Kabale": ["Buhara","Butanda","Kabale Central","Kabale Northern","Kabale Southern","Kaharo","Kahungye","Kamuganguzi","Katuna Town Council","Kibuga","Kitumba","Kyanamira","Maziba","Rubaya (Kabale)","Ryakarimira Town Council"],
  "Kabarole": ["Bukuuku","Busoro","Eastern Division (Kabarole)","Hakibale","Harugongo","Kabende","Karago Town Council","Karambi (Kabarole)","Karangura","Kasenda","Kasenda Town Council","Kicwamba","Kiguma","Kijura Town Council","Kiko Town Council","Mugusu","Mugusu Town Council","Ruteete (Kabarole)","Rwengaju","Southern Division (Kabarole)","Western  Division"],
  "Kaberamaido": ["Alwa","Anyara (Kaberamaido)","Apapai (Kaberamaido)","Aperikira","Bululu (Kaberamaido)","Kaberamaido","Kaberamaido Town Council","Kakure (Kaberamaido)","Kalaki (Kaberamaido)","Kobulubulu","Ocelakur (Kaberamaido)","Ochero","Ochero Town Council","Ogwolo (Kaberamaido)","Okile","Oriamo","Otuboi (Kaberamaido)","Otuboi Town Council (Kaberamaido)"],
  "Kagadi": ["Buhumuliro","Burora","Bwikara","Galiboleka","Isunga","Kabamba","Kagadi","Kagadi Town Council","Kamuroza","Kanyabeebe","Kicucura","Kinyarugonjo","Kiryanga","Kyakabadiima","Kyanaisoke","Kyaterekera","Kyaterekera Town Council","Kyenzige","Kyenzige Town Council","Mabaale","Mairirwe","Mpeefu","Mpeefu Ya Sande Town Council","Muhorro","Muhorro Town Council","Ndaiga","Nyabutanzi","Nyakarongo","Pachwa","Rugashari","Ruteete (Kagadi)"],
  "Kakumiro": ["Birembo","Bwanswa","Igayaza Town Council","Kakindo","Kakindo Town Council (Kakumiro)","Kakumiro Town Council","Kasambya (Kakumiro)","Katikara","Kibijjo","Kijangi","Kikoora","Kikwaya","Kisengwe","Kisiita","Kisiita Town Council","Kitaihuka","Kyabasaija","Mpasaana","Mwitanzige","Nalweyo","Narweyo","Nkooko"],
  "Kalaki": ["Anyara (Kalaki)","Apapai (Kalaki)","Bululu (Kalaki)","Kakure (Kalaki)","Kalaki (Kalaki)","Ocelakur (Kalaki)","Ogwolo (Kalaki)","Otuboi (Kalaki)","Otuboi Town Council (Kalaki)"],
  "Kalangala": ["Bubeke","Bufumira","Bujumba","Kalangala Town Council","Kyamuswa","Mazinga","Mugoye"],
  "Kaliro": ["Budomero","Bukamba","Bulumba Town Council","Bumanya","Buyinda","Gadumire","Kaliro Town Council","Kasokwe","Kisinda","Namugongo","Namwiwa","Namwiwa Town Council","Nansololo","Nawaikoke","Nawaikoke Town Council"],
  "Kalungu": ["Bukulula","Kalungu","Kalungu Town Council","Kyamulibwa","Kyamulibwa Town Council","Lukaya Town Council","Lwabenge"],
  "Kampala": ["Kampala Central","Kawempe Division","Makerere University","Makindye Division","Nakawa","Rubaga Division"],
  "Kamuli": ["Balawoli","Balawoli Town Council","Bugulumbya","Bulopa","Butansi","Kagumba","Kasambira Town Council","Kisozi","Kisozi Town Council","Kitayunjwa","Magogo","Mbulamuti","Mbulamuti Town Council","Nabwigulu","Namasagali","Namwendwa","Namwendwa Town Council","Nawanyago","Nawanyago Town Council","Northern Division (Kamuli)","Southern Division (Kamuli)","Wankole"],
  "Kamwenge": ["Bigodi Town Council","Biguli","Bihanga (Kamwenge)","Buhanda (Kamwenge)","Busiriba","Bwizi","Kabambiro","Kabuga Town Council","Kahunge","Kahunge Town Council","Kamwenge","Kamwenge Town Council","Kanara (Kamwenge)","Kicheche (Kamwenge)","Mahyoro (Kamwenge)","Nkoma","Nkoma-Katalyeba Town Council","Ntara (Kamwenge)","Nyabbani (Kamwenge)"],
  "Kanungu": ["Butogota Town Council","Kambuga","Kambuga Town Council","Kanungu Town Council","Kanyantorogo","Katete","Kayonza (Kanungu)","Kihiihi","Kihiihi Town Council","Kinaaba","Kirima","Kyeshero","Mpungu","Nyakinoni","Nyamirama","Nyanga","Rugyeyo","Rutenga"],
  "Kapchorwa": ["Amukol","Central Division (Kapchorwa)","Chema","Chepterech","East Division (Kapchorwa)","Gamogo","Kabeywa","Kapsinda","Kaptanya","Kaserem","Kawowo","Munarya","Sipi","Sipi Town Council","West Division (Kapchorwa)"],
  "Kapelebyong": ["Acinga","Acowa","Akoromit","Alito (Kapelebyong)","Kapelebyong","Obalanga","Okungur"],
  "Karenga": ["Kakwanga (Karenga)","Kapedo (Karenga)","Karenga(napore) (Karenga)","Kawalakol (Karenga)","Lobalangit (Karenga)","Lokori (Karenga)","Sangar (Karenga)"],
  "Kasanda": ["Bukuya","Bukuya Town Council","Kalwana","Kamuli","Kassanda","Kassanda Town Council","Kiganda","Kiganda Town Council","Kijjuna","Kitumbi","Makokoto","Manyogaseka","Mbirizi","Myanzi","Nalutuntu"],
  "Kasese": ["Bugoye","Buhuhira","Bulembia Division","Bwera","Bwesumbu","Central Division (Kasese)","Hima Town Council","Ibanda-Kyanya Town Council","Ihandiro","Isango","Kahokya","Karambi (Kasese)","Karusandara","Kilembe","Kinyameseke Town Council","Kisinga","Kisinga Town Council","Kitabu","Kitholu","Kitswamba","Kyabarungira","Kyarumba","Kyarumba Town Council","Kyondo","Lake Kabatoro Town Council","Lake Katwe","Mahango","Maliba","Mbunga","Mpondwe/lhubiriha Town Council","Mubuku Town Council","Muhokya","Munkunyu","Nyakabingo","Nyakatonzi","Nyakiyumbu","Nyamwamba Division","Rugendabara-Kikongo Town Council","Rukoki"],
  "Katakwi": ["Akoboi","Amusia","Angodingod","Getom","Guyaguya","Kapujan","Katakwi","Katakwi Town Council","Magoro","Magoro Town Council","Ngariam","Okore","Okulonyo","Omodoi","Ongongoja","Palam","Toroma","Toroma Town Council","Usuk","Usuk Town Council"],
  "Kayunga": ["Bbaale","Busaana","Busaana Town Council","Galiraya","Kangulumira","Kangulumira Town Council","Kayonza (Kayunga)","Kayunga","Kayunga Town Council","Kitimbwa","Kitimbwa Town Council","Nazigo","Nazigo Town Council"],
  "Kazo": ["Buremba Town Council","Burunga (Kazo)","Engari (Kazo)","Kanoni (Kazo)","Kazo (Kazo)","Kazo Town Council (Kazo)","Kyampangara (Kazo)","Migina (Kazo)","Nkungu (Kazo)","Rwemikoma (Kazo)"],
  "Kibaale": ["Bubango","Bwamiramira","Kabasekende","Karama","Kasimbi","Kayanja","Kibaale Town Council","Kyakazihire","Kyebando","Matale","Mugarama","Nyamarunda","Nyamarwa"],
  "Kiboga": ["Bukomero","Bukomero Town Council","Ddwaniro (Kiboga)","Kapeke","Kayera","Kibiga","Kiboga Town Council","Kyekumbya","Kyomya","Lwamata","Lwamata Town Council","Muwanga","Nakasozi","Nkandwa (Kiboga)"],
  "Kibuku": ["Bulangira","Bulangira Town Council","Buseta","Goli-Goli","Kabweri","Kadama","Kadama Town Council","Kagumu","Kakutu","Kasasira","Kasasira Town Council","Kenkebu","Kibuku","Kibuku Town Council","Kirika","Kituti","Lwatama","Nabiswa","Nandere","Nankodo","Tirinyi","Tirinyi Town Council"],
  "Kikuube": ["Bugambe","Buhimba","Buhimba Town Council","Kabwoya","Kiziranfumbi","Kyangwali"],
  "Kiruhura": ["Akayanja","Buremba","Burunga (Kiruhura)","Engari (Kiruhura)","Kanoni (Kiruhura)","Kanyaryeru","Kashongi","Kazo (Kiruhura)","Kazo Town Council (Kiruhura)","Kenshunga","Kikatsi","Kinoni (Kiruhura)","Kiruhura Town Council","Kitura","Kyampangara (Kiruhura)","Migina (Kiruhura)","Nkungu (Kiruhura)","Nyakashashara","Rushere Town Council","Rwemikoma (Kiruhura)","Rwenshande","Rwetamu","Sanga","Sanga Town Council"],
  "Kiryandongo": ["Bweyale Town Council","Diima","Karuma Town Council","Kichwabugingo","Kigumba","Kigumba Town Council","Kiryandongo","Kiryandongo Town Council","Kyankende","Masindi Port","Mboira","Mutunda","Nyamahasa"],
  "Kisoro": ["Bukimbiri","Bunagana Town Council","Busanza","Central Division (Kisoro)","Chahi","Cyanika Town Council","Kanaba","Kirundo","Muramba","Murora","North Division (Kisoro)","Nyabwishenya","Nyakabande","Nyakinama","Nyarubuye","Nyarusiza","Nyundo","Rubuguri Town Council","South Division (Kisoro)"],
  "Kitagwenda": ["Buhanda (Kitagwenda)","Kabujogera Town Council","Kanara (Kitagwenda)","Kicheche (Kitagwenda)","Mahyoro (Kitagwenda)","Ntara (Kitagwenda)","Nyabbani (Kitagwenda)"],
  "Kitgum": ["Akwang","Central Division (Kitgum)","Kiteny","Kitgum Matidi","Kitgum Matidi Town Council","Labongo-Amida","Labongo-Amida West","Labongo-Layamo","Lagoro","Lalano","Muchwini","Muchwini East","Muchwini West","Nam-Okora","Nam-Okora North","Namokora Town Council","Omiya-Anyima","Omiya-Anyima West","Orom","Orom East","Pager Division","Pandwong Division"],
  "Koboko": ["Abuku","Dranya","Kuluba","Lobule","Ludara","Midia","North Division (Koboko)","South Division (Koboko)","Western Division (Koboko)"],
  "Kole": ["Aboke","Aboke Town Council","Akalo","Akalo Town Council","Alito (Kole)","Alito Town Council","Ayer","Bala","Bala Town Council","Balla","Kole Town Council","Okwerodot"],
  "Kotido": ["Central Division (Kotido)","Kacheri","Kacheri Town Council","Kamor","Kanair","Kapeta","Kotido","Lokitelaebu Town Council","Lokwakial","Loletio","Longaroe","Maaru","Nakapelimoru","Napumpum","North Division (Kotido)","Panyangara","Rengen","South Division (Kotido)","West Division (Kotido)"],
  "Kumi": ["Atutur","Kadami","Kakures","Kamaca","Kanapa","Kanyum (Kumi)","Kumi","Mukongoro","North Division (Kumi)","Nyero","Ogooma","Ongino","South Division (Kumi)","Tisai"],
  "Kwania": ["Abongomola","Aduku","Aduku Town Council","Akali","Atongtidi","Ayabi","Ayabi Town Council","Cawente","Inomo","Inomo Town Council","Nambieso"],
  "Kween": ["Benet","Binyiny","Binyiny Town Council","Chepsukunya Town Council","Greek River","Kapkwata","Kaproron","Kaproron Town Council","Kaptoyoy","Kaptum","Kaseko","Kitawoi","Kwanyiy","Kwosir","Moyok","Ngenge","Sundet","Tuikat"],
  "Kyankwanzi": ["Bananywa","Banda (Kyankwanzi)","Butemba","Butemba Town Council","Byerima","Gayaza","Kigando (Kyankwanzi)","Kiryannongo","Kisala","Kitabona","Kyankwanzi","Kyankwanzi Town Council","Masodde-Kalagi Town Council","Mulagi","Muwangi","Nkandwa (Kyankwanzi)","Nsambya","Ntwetwe","Ntwetwe Town Council","Wattuba","Wattuba Town Council"],
  "Kyegegwa": ["Hapuuyo","Hapuuyo Town Council","Kakabara","Kakabara Town Council","Kasule","Kazinga Town Council","Kigambo","Kyatega","Kyegegwa","Kyegegwa Town Council","Migamba","Migongwe","Mpara","Mpara Town Council","Nkaakwa","Nkanja","Ruyonza","Rwentuha"],
  "Kyenjojo": ["Batalika","Bufunjo","Bugaaki","Butiiti","Butunduzi","Butunduzi Town Council","Kanyegaramire","Katooke","Katooke Town Council","Kigaraale","Kigoyera","Kihuura","Kisojo","Kisojo Town Council","Kitega","Kyakatwire Town Council","Kyamutunzi Town Council","Kyarusozi","Kyarusozi Town Council","Kyembogo","Kyenjojo Town Council","Mabira Town Council","Nyabirongo","Nyabuharwa","Nyakisi","Nyankwanzi","Nyantungo","Rugombe Town Council"],
  "Kyotera": ["Kabira (Kyotera)","Kakuuto","Kalisizo","Kalisizo Town Council","Kasaali Town Council","Kasasa","Kasensero Town Council","Kirumba","Kyebe","Kyotera Town Council","Lwankoni","Mutukula Town Council","Nabigasa","Nangoma"],
  "Lamwo": ["Aceba","Agoro","Katum","Lamwo Town Council","Lokung","Lokung East","Madi-Opei","Ogili","Padibe East","Padibe Town Council","Padibe West","Palabek Abera","Palabek Nyimur","Palabek-Gem","Palabek-Kal","Paloga","Potika"],
  "Lira": ["Adekokwok","Adyel","Agali","Agweng","Agweng Town Council","Amach Town Council","Aromo","Ayami","Barr","Itek","Iwal","Lira","Lira Central","Ngetta","Ogur","Ojwina","Railways","Wiodyek"],
  "Luuka": ["Bukanga","Bukooma","Bulongo (Luuka)","Ikumbya","Irongo","Luuka Town Council","Nawampiti","Waibuga"],
  "Luweero": ["Bamunanika","Bombo Town Council","Butuntumula","Kalagala","Kamira","Katikamu","Kikyusa","Luweero  Town Council","Luwero","Makulubita","Nyimbwa","Wobulenzi Town Council","Zirobwe"],
  "Lwengo": ["Katovu Town Council","Kingo","Kinoni Town Council","Kisekka","Kyazanga","Kyazanga Town Council","Lwengo","Lwengo Town Council","Malongo (Lwengo)","Ndagwe"],
  "Lyantonde": ["Kaliiro","Kaliiro Town Council","Kasagama","Kinuuka","Lyakajura","Lyantonde","Lyantonde Town Council","Mpumudde"],
  "Madi-Okollo": ["Anyiribu (Madi-Okollo)","Ewanga (Madi-Okollo)","Offaka (Madi-Okollo)","Ogoko (Madi-Okollo)","Okollo (Madi-Okollo)","Pawor (Madi-Okollo)","Rhino Camp (Madi-Okollo)","Rigbo (Madi-Okollo)","Uleppi (Madi-Okollo)"],
  "Manafwa": ["Bugobero","Bukewa","Bukhadala","Bukhofu","Bukoma","Bukusu","Bunabutsale","Bunabwana","Busukuya","Butiru","Butiru  Town Council","Butooto","Butta","Buwagogo","Buwangani Town Council","Buyinza Town Council","Kaato","Khabutoola","Kimaluli","Lwanjusi","Maefe","Makenya","Manafwa Town Council","Mayanza","Nalondo","Nangalwe","Sibanga","Sisuni","Weswa"],
  "Maracha": ["Ajira","Alikua","Awiziru","Drambu","Kijomoro","Maracha Town Council","Nyadri","Nyadri South","Obiba","Okokoro Town Council","Oleba","Olufe","Oluvu","Ovujo Town Council","Paranga","Tara","Yivu"],
  "Masaka": ["Bukakata","Buwunga (Masaka)","Kabonera","Katwe/butego","Kimaanya/kyabakuza","Kyanamukaka","Kyesiiga","Mukungwe","Nyendo/senyange"],
  "Masindi": ["Bikonzi","Budongo","Buliima Town Council","Bwijanga","Central Division (Masindi)","Kabango Town Council","Karujubu Division","Kigulya Division","Kijunjubwa","Kijunjubwa Town Council","Kimengo","Kiruli","Kyatiri Town Council","Labongo","Miirya","Nyangahya Division","Nyantonzi","Pakanyi"],
  "Mayuge": ["Baitambogwe","Bugadde Town Council","Bukabooli","Bukatube","Busakira","Buwaaya","Bwondha Town Council","Imanyiro","Jaguzi","Kigandalo","Kityerera","Magamaga  Town Council","Malongo (Mayuge)","Mayuge Town Council","Mpungwe","Wairasa"],
  "Mbale": ["Bubyangu","Budwale","Bufumbo (Mbale)","Bukasakya","Bukhiende","Bukonde","Bumasikye","Bumbobi","Bunambutye (Mbale)","Bungokho","Busano","Busiu","Busiu Town Council","Busoba","Industrial Borough","Jewa Town Council","Lukhonge","Lwasso","Nabumali Town Council","Nakaloke","Nakaloke Town Council","Namabasa","Namanyonyi","Nambale (Mbale)","Nauyo Town Council","Nauyo-Bugema Town Council","Northern Borough","Nyondo","Wanale","Wanale Borough"],
  "Mbarara": ["Biharwe","Bubaare","Bugamba (Mbarara)","Bukiiro","Buteraniro-Nyeihanga Town Council (Mbarara)","Bwizibwera-Rutooma Town Council","Kabura Town Council (Mbarara)","Kagongi","Kakiika","Kakoba","Kamukuzi","Kashare","Mwizi (Mbarara)","Ndeija (Mbarara)","Nyakayojo","Nyamitanga","Rubaya (Mbarara)","Rubindi","Rubindi-Ruhumba Town Council","Rugando (Mbarara)","Rwanyamahembe","Rweibogo-Kibingo Town Council (Mbarara)"],
  "Mitooma": ["Bitereko","Kabira (Mitooma)","Kanyabwanga","Kashenshero","Kashenshero Town Council","Katenga","Kiyanga","Mayanga","Mitooma","Mitooma Town Council","Mutara","Nyakizinga","Rurehe","Rutookye Town Council"],
  "Mityana": ["Bbanda","Bbanda Town Council","Bulera","Busimbi Division","Busunju Town Council","Butayunja","Central Division (Mityana)","Kakindu","Kalangaalo","Kikandwa","Maanyi","Malangala","Namungo","Ssekanyonyi","Ssekanyonyi Town Council","Ttamu Division","Zigoti Town Council"],
  "Moroto": ["Katikekile","Loputuk","Lotisan","Nadunget","North Division (Moroto)","Rupa","South Division (Moroto)","Tapac"],
  "Moyo": ["Aluru","Dufile","Laropi","Lefori","Metu","Moyo","Moyo Town Council","Otce"],
  "Mpigi": ["Buwama","Buwama Town Council","Kammengo","Kayabwe Town Council","Kiringente","Kituntu","Mpigi Town Council","Muduma","Nkozi"],
  "Mubende": ["Bagezza","Butoloogo","East Division (Mubende)","Kalonga","Kasambya (Mubende)","Kasambya Town Council","Kayebe","Kibalinga","Kigando (Mubende)","Kiruuma","Kitenga","Kiyuni","Lubimbiri","Madudu","Nabingoola","Nabingoola Town Council","South Division (Mubende)","West Division (Mubende)"],
  "Mukono": ["Goma Division","Kasawo","Kasawo Town Council","Katosi Town Council","Kimenyedde","Koome Islands","Kyampisi","Mpatta","Mpunge","Mukono Division","Nagojje","Nakifuma-Naggalama Town Council","Nakisunga","Nama","Namataba Town Council","Namuganga","Ntenjeru-Kisoga Town Council","Ntunda"],
  "Nabilatuk": ["Kosike","Lolachat","Lorengedwat","Nabilatuk","Natirae"],
  "Nakapiripirit": ["Kaawach","Kakomongole","Lemusui","Loregae","Loreng","Moruita","Nakapiripirit Town Council","Namalu"],
  "Nakaseke": ["Kaasangombe","Kapeeka","Kikamulo","Kinoni (Nakaseke)","Kinyogoga","Kitto","Kiwoko Town Council","Nakaseke","Nakaseke Butalangu Town Counc","Nakaseke Town Council","Ngoma (Nakaseke)","Ngoma Town Council","Semuto","Semuto Town Council","Wakyato"],
  "Nakasongola": ["Kakooge","Kakooge Town Council","Kalongo","Kalungi","Lwampanga","Lwampanga Town Council","Mayirikiti Town Council","Migyera Town Council","Nabiswera","Nakasongola Town Council","Nakitoma","Rwabyata","Wabinyonyi"],
  "Namayingo": ["Banda (Namayingo)","Banda Town Council","Buhemba","Bukana","Buswale","Buyinja","Lolwe","Mutumba","Mutumba Town Council","Namayingo Town Council","Sigulu Islands"],
  "Namisindwa": ["Bubutu","Bukhabusi","Bukhaweka","Bukiabi","Bukoho","Bumbo","Bumbo Town Council","Bumityero","Bumumali","Bumwoni","Bungati","Bupoto","Buwabwala","Buwambwa","Buwatuwa","Lwakhakha Town Council","Magale","Magale Town Council","Mukhuyu","Mukoto","Nabitsikhi","Namabya","Namboko","Namisindwa Town Council","Namitsa","Tsekululu"],
  "Namutumba": ["Bugobi","Bugobi Town Council","Bulange","Ivukula","Kagulu (Namutumba)","Kibaale","Kibale Town Council (Namutumba)","Kiwanyi","Kizuba","Magada","Mazuba","Nabweyo","Namutumba","Namutumba Town Council","Nangonde","Nawaikona","Nsinze"],
  "Napak": ["Apeitolim","Iriiri","Kangole Town Council","Lokiteded Town Council","Lokopo","Lopei","Lorengecora","Lotome","Matany","Matany Town Council","Nabwal","Napak Town Council","Ngoleriet","Poron"],
  "Nebbi": ["Abindu Division","Acana","Akworo","Alala","Atego","Central Division (Nebbi)","Erussi","Jupangira","Kucwiny","Ndhew","Nebbi","Nyaravur","Padwot","Parombo","Parombo Town Council","Thatha Division"],
  "Ngora": ["Agirigiroi","Atoot","Kapir","Kobwin","Morukakise","Mukura","Mukura Town Council","Ngora","Ngora Town Council","Odwarat","Opot Town Council"],
  "Ntoroko": ["Butungama","Bweramule","Kanara (Ntoroko)","Kanara Town Council","Karugutu","Karugutu Town Council","Kibuuku Town Council","Nombe","Rwebisengo","Rwebisengo Town Council"],
  "Ntungamo": ["Bwongyera","Central Division (Ntungamo)","Eastern Division (Ntungamo)","Ihunga","Itojo","Kafunjo-Mirama Town Council","Kagarama Town Council","Kayonza (Ntungamo)","Kibatsi","Kitwe Town Council","Ngoma (Ntungamo)","Ntungamo","Nyabihoko","Nyabushenyi","Nyakyera","Nyakyera Town Council","Nyamukana Town Council","Nyamunuka Town Council","Nyarutuntu","Rubaare","Rubaare Town Council","Rugarama (Ntungamo)","Rugarama North","Ruhaama","Ruhaama East","Rukoni East","Rukoni West","Rwamabondo Town Council","Rwashamaire Town Council","Rweikiniro","Rwentobo-Rwahi Town Council","Rwoho Town Council","Western Division (Ntungamo)"],
  "Nwoya": ["Alero","Anaka (payira)","Got Apwoyo","Koch Goma Town Council","Koch-Goma","Lii","Lungulu","Nwoya Town Council","Paminyai","Purongo","Purongo Town Council"],
  "Obongi": ["Aliba","Ewafa","Gimara","Itula","Obongi Town Council","Palorinya"],
  "Omoro": ["Abuga","Acet Town Council","Akidi","Aremo","Bobi","Koro","Labora","Lakwana","Lakwaya","Lalogi","Odek","Omoro Town Council","Ongako","Orapwoyo","Palenga Town Council"],
  "Otuke": ["Adwari","Adwari Town Council","Barjobi","Ogor","Ogwette","Okwang","Olilim","Orum","Otuke Town Council"],
  "Oyam": ["Aber","Abok","Achaba","Aleka","Icheme","Icheme Town Council","Kamdini","Kamdini Town Council","Loro","Loro Town Council","Minakulu","Minakulu Town Council","Myene","Ngai","Otwal","Oyam Town Council"],
  "Pader": ["Acholi-Bur","Ajan","Angagura","Atanga","Atanga Town Council","Awere","Bongtiko","Laguti","Lapul","Latanya","Lunyiri","Ogom","Pader","Pader Town Council","Paiula","Pajule","Pajule Town Council","Porogali","Pukor","Puranga","Te-Nam"],
  "Pakwach": ["Alwi","Dei","Pakwach","Pakwach Town Council","Panyango","Panyimur","Panyimur Town Council","Pokwero","Pokworo","Ragem","Wadelai"],
  "Pallisa": ["Agule","Agule Town Council","Akisim","Apopong","Chelekura","Gogonyo","Kameke","Kamuge","Kamuge Town Council","Kasodo","Kaukura","Kibale","Kibale Town Council (Pallisa)","Oboliso","Oboliso I","Obutet","Olok","Opwateta","Pallisa","Pallisa Town Council","Puti-Puti"],
  "Rakai": ["Byakabanda","Ddwaniro (Rakai)","Kacheera","Kagamba (buyamba)","Kasankala","Kibanda","Kifamba","Kiziba","Kyalulangira","Lwamaggwa","Lwanda","Rakai Town Council"],
  "Rubanda": ["Bubare","Bufundi","Hamurwa","Hamurwa Town Council","Ikumba","Muko","Nyamweeru","Rubanda Town Council","Ruhija"],
  "Rubirizi": ["Katanda","Katerera","Katerera Town Council","Katunguru","Kichwamba","Kirugu","Kyabakara","Magambo","Rubirizi Town Council","Rutoto","Ryeru"],
  "Rukiga": ["Bukinda","Kamwezi","Kashambya","Mparo Town Council","Muhanga Town Council","Rwamucucu"],
  "Rukungiri": ["Bikurungu Town Council","Bugangari","Buhunga (Rukungiri)","Buyanja (Rukungiri)","Buyanja Town Council","Bwambara","Eastern Division (Rukungiri)","Kebisoni","Kebisoni Town Council","Nyakagyeme","Nyakishenyi","Nyarushanje","Ruhinda","Rwerere Town Council","Southern Division (Rukungiri)","Western Division (Rukungiri)"],
  "Rwampara": ["Bugamba (Rwampara)","Buteraniro-Nyeihanga Town Council (Rwampara)","Kabura Town Council (Rwampara)","Mwizi (Rwampara)","Ndeija (Rwampara)","Rugando (Rwampara)","Rweibogo-Kibingo Town Council (Rwampara)"],
  "Serere": ["Atiira","Bugondo","Kadungulu","Kadungulu Town Council","Kasilo Town Council","Kateta","Kidetok Town Council","Kyere","Labor","Pingire","Serere Town Council","Serere/olio"],
  "Sheema": ["Bugongi Town Council","Kabwohe Division","Kagango Division","Kakindo Town Council (Sheema)","Kasaana","Kashozi Division","Kigarama","Kitagata","Kitagata Town Council","Kyangyenyi","Masheruka","Masheruka Town Council","Rugarama (Sheema)","Sheema Central Division","Shuuku","Shuuku Town Council"],
  "Sironko": ["Bubbeza","Budadiri Town Council","Bugambi","Bugitimwa","Buhugu","Bukhulo","Bukiise","Bukiyi","Bukyabo","Bukyambi","Bumalimba","Bumasifwa","Bumulisha","Bunyafwa","Busamaga","Busiita","Busulani","Butandiga","Buteza","Buwalasi","Buwasa","Buyobo","Dahami","Elgon","Kikobero","Legenya","Lulena","Mafudu","Masaba (Sironko)","Nalusala","Namaguli","Namugabwe","Sironko Town Council","Zesui"],
  "Soroti": ["Amen Town Council","Arapai","Arapai Town Council","Asuret","Aukot","Awaliwal","Eastern","Gweri","Kamuda","Katine","Lalle","Northern","Ocokican","Oculoi","Soroti","Tubur","Tubur Town Council","Western"],
  "Ssembabule": ["Bulongo (Ssembabule)","Katwe","Kawanda","Kyeera","Lugusulu","Lwebitakuli","Lwemiyaga","Mabindo","Mateete","Mateete Town Council","Mijwala","Mitete","Mitima","Nabitanga","Nakasenyi","Ntuusi Town Council","Ssembabule Town Council"],
  "Tororo": ["Akadot","Apetai","Iyolwa","Iyolwa Town Council","Kalait","Katajula","Kayoro","Kirewa","Kisoko","Kwapa","Magola","Malaba Town Council","Mella","Merikit","Molo","Morukatipe","Mukuju","Mulanda","Mwello","Nabuyoga","Nabuyoga Town Council","Nagongera","Nagongera Town Council","Nyangole","Osia","Osukuru","Pajwenda Town Council","Paya","Petta","Rubongi","Soni","Sopsop","Tororo Eastern","Tororo Western"],
  "Wakiso": ["Bunamwaya Division","Bussi","Busukuma Division","Bweyogerere Division","Division A","Division B","Gombe Division","Kajjansi Town Council","Kakiri","Kakiri Town Council","Kasangati Town Council","Kasanje","Katabi Town Council","Kira Division","Kiziba(masuliita)","Kyengera Town Council","Masajja Division","Masuliita Town Council","Mende","Nabweru Division","Namayumba","Namayumba Town Council","Namugongo Division","Nansana Division","Ndejje Division","Wakiso","Wakiso Town Council"],
  "Yumbe": ["Apo","Arafa","Aria","Arilo","Ariwa","Bijo","Drajini/arajim","Kei","Kerwa","Kochi","Kululu","Kuru","Kuru Town Council","Lodonga","Lodonga Town Council","Lori","Midigo","Midigo Town Council","Odravu","Odravu West","Romogi","Wandi","Yumbe Town Council"],
  "Zombo": ["Abanga","Akaa","Alangi","Athuma","Atyak","Jangokoro","Kango","Nyapea","Paidha","Paidha Town Council","Warr","Zeu","Zombo Town Council"]
};

const PARISHES_BY_SUB_COUNTY = {
  "Abako": ["Alanyi","Amononeno","Angoltok","Anyiti","Awapiny","Awori"],
  "Abanga": ["Asina","Pakadha","Pamitu","Ser","Thanga"],
  "Abarilela": ["Arute","Asilang","Dodos","Katine","Ocal","Olelai"],
  "Abeja": ["Abeja","Akol","Aringo Ceng","Lubiri","Otangocinge"],
  "Aber": ["Adyegi","Akaka","Atura","Wirao"],
  "Abia (Alebtong)": ["Abangoimany","Aberidwogo","Abia","Agwara","Akular","Atinkok","Odongai","Ogudo","Oteno","Tekulu"],
  "Abiliyep": ["Abiliyep","Akorikeya","Lopedot","Loyep"],
  "Abim": ["Abongepach","Adwal","Aninata","Arembwola","Atunga","Kanu","Oima"],
  "Abim Town Council": ["Agwata Ward","Angwee Ward","Kalakala Ward","Kiru Ward","Oringowelo Ward","Oyaro Ward","Wiawer Ward"],
  "Abindu Division": ["Abindu Ward","Nebbi Hill Ward","Nyacara Ward"],
  "Abok": ["Ajerijeri","Ariba","Bar","Barrio","Itubara"],
  "Aboke": ["Apach","Apuru","Opeta"],
  "Aboke Town Council": ["Akwirididi Ward","Aweingwec Ward","Eastern Ward","Ogwangacuma Ward"],
  "Abongomola": ["Abany","Acungi","Amorigoga","Ogwok","Teioro"],
  "Abuga": ["Abuga","Abwoch","Alokolum","Bwobo","Kweyo","Patuda"],
  "Abuku": ["Gborokolongo","Metino","Nyai","Nyoricheku","Onyokunga"],
  "Acana": ["Pagwata North","Pagwata South","Pangere","Pulum North","Pulum South"],
  "Aceba": ["Bobi Abakadyak","Lapyem","Lokili","Ywaya"],
  "Acet Town Council": ["Acet Central Ward","Barolam Ward","Lamincoba Ward","Oratido Ward","Romkituku Ward"],
  "Achaba": ["Abanya","Anyeke","Atekober","Dogapio","Obanga Ngeo","Ogwangapur"],
  "Acholi-Bur": ["Gem-Central","Gem-Onyot","Ogago","Wii Gweng"],
  "Achorichor": ["Achorichor","Iwakai","Lomerai"],
  "Acii": ["Acii","Alwala","Awikori","Kongoro","Muchora","Otike"],
  "Acinga": ["Acinga","Adepar","Cula","Nyaikuro","Olet"],
  "Acowa": ["Acowa","Akum","Amero","Angerepo","Angolebwal"],
  "Adeknino": ["Adeknino","Adwong-Owor","Ajiba","Aridi","Awelo"],
  "Adekokwok": ["Adekokwok","Akia","Angwetangwet","Boke","Boroboro East","Boroboro West","Burlobo"],
  "Adilang": ["Kulaka","Labwa","Lapyem","Nam"],
  "Adilang Town Council": ["Adilang Central Ward","Alaa Ward","Lalal Ward","Lumule Ward"],
  "Adjumani Town Council": ["Biyaya Ward","Central Ward","Cesia Ward"],
  "Adok": ["Adok","Amonoloco","Amunamun","Apye","Bardyang"],
  "Adropi": ["Esia","Lajopi","Obilokong","Openzinzi","Palemo"],
  "Aduku": ["Aboko","Adyeda","Alira","Apire","Ongoceng"],
  "Aduku Town Council": ["Ikwera Ward","Teduka Ward"],
  "Adumi": ["Anyara","Kati","Mite","Nyiovura","Ombachi"],
  "Adwari": ["Adyerakonya","Okee","Okere","Olarokwon"],
  "Adwari Town Council": ["Agweng Ward","Akwera Ward","Alango Ward","Aliwang Ward","Amintenyo Ward","Aweayela Ward","Omito Ward","Otal Ward"],
  "Adwir": ["Adwir","Alolololo","Ocokober","Okomo","Olwero"],
  "Adyel": ["Akwoyo Ward","Junior Quarters","Kirombe","Lango Central","Omitto Ward","Starch Factory","Teso   A","Teso   C"],
  "Agago Town Council": ["Agago Central Ward","Ajali Ward","Ngora Ward","Pampara Ward"],
  "Agali": ["Abongorwot","Adyaka","Alyet","Apanylongo","Ocamonyang","Okile"],
  "Agengo": ["Ademi","Agengo","Alwee","Laguti","Lutome","Tori"],
  "Agikdak": ["Abarikori","Agikdak","Alobo-Okwe","Awonangiro"],
  "Agirigiroi": ["Abatai","Agirigiroi","Ajelo","Ajuket","Akisim","Kokong","Oluwa","Orisai"],
  "Agoro": ["Laruc","Lopulingi","Lorunya","Ngacino","Pobar","Rudi"],
  "Agule": ["Agule Ward","Odusai Ward","Okunguro Ward"],
  "Agule Town Council": ["Kadodio Ward","Morukokume Ward","Odusai Ward","Pasia Ward"],
  "Agulu Division": ["Aminteng","Awir Ward","Odokomac","Te-Ibu Ward","Wormwaka Ward"],
  "Agwata Town Council": ["Acoto Ward","Amuda Central Ward","Amuda Eastern Ward","Kacung East Ward","Kacung West Ward","Mairoangwen Ward","Tetugo A Ward","Tetugo B Ward"],
  "Agwatta": ["Adwoki","Agwiciri","Alyecjuk"],
  "Agweng": ["Abala","Acelela","Angolocom","Barroganda","Orit","Te Adwong","Te-Oburu"],
  "Agweng Town Council": ["Acelela Ward","Agweng Ward","Amiabil Ward","Wiakot Ward","Widam Ward"],
  "Agwingiri": ["Acotedo","Agwingiri","Alemere","Alemere West","Alyecmeda","Anywal Wake","Namiza"],
  "Aii-Vu/ajivu": ["Alia","Aripia","Ayuri","Erea","Idayi","Onai","Onzoro","Otrevu","Paranga"],
  "Ajali": ["Ajali Atede","Kiteny","Ladere","Lajwa","Otumpili"],
  "Ajan": ["Goma","Paibwor","Pakeyo","Wipolo"],
  "Ajia": ["Ajia","Alivu","Ayaa","Ayaa-Yia","Ewaa","Nyirivu","Ochoko","Olevu","Ombokoro"],
  "Ajira": ["Aringa","Ojapi","Olupi","Ombavu"],
  "Akaa": ["Abanga","Amuda","Ayaka","Jupamatho"],
  "Akadot": ["Akadot","Kabiro","Kamuli","Kayoro","Morukonyangai"],
  "Akali": ["Abwong","Aderolongo","Agwa","Akali","Alel"],
  "Akalo": ["Abeli","Bar-Akalo"],
  "Akalo Town Council": ["Eastern A Ward","Eastern B Ward","Western A Ward","Western B Ward"],
  "Akayanja": ["Akayanja","Nombe Ii","Nyankumba","Rushororo","Rwakobo"],
  "Akere Division": ["Angayiki Ward","Ayera Ward","Central Ward","Dam Ward"],
  "Akeriau": ["Aita","Akeriau","Okude","Otubet","Temele"],
  "Akidi": ["Kecokella","Lwala","Parak","Tegot"],
  "Akisim": ["Akisim","Kobuin","Okisiran","Opadoi"],
  "Akoboi": ["Akoboi","Aleles","Alukucok","Dadas","Lalei","Okokoma"],
  "Akokoro": ["Akokoro","Awila","Ayeolyec","Kungu"],
  "Akokoro Town Council": ["Abyeibuti Ward","Pabbo Ward","Tetugu Ward"],
  "Akoromit": ["Akore","Akoromit","Aminito","Kobuin","Olekat"],
  "Akura": ["Akura","Anyanga","Anyanga B","Bardago","Kai","Otweotoke"],
  "Akwang": ["Lamit","Lugwar","Mura","Pajimo"],
  "Akwon": ["Abalodyang","Akwon","Aromi","Okiji"],
  "Akworo": ["Kasatu (angaba)","Kituna","Murusi","Ondier","Pakolo","Reru"],
  "Alala": ["Acwera","Akaba","Ocelo","Vurr"],
  "Alangi": ["Ambele","Angar","Gamba","Ndara","Pasai"],
  "Alebtong Town Council": ["Alyec Ward","Apado Ward","Nakabela Ward"],
  "Aleka": ["Abela","Agwar","Ajul","Aleka","Alibi"],
  "Alerek": ["Kathimongor","Kulodwong","Loyoroit","Ocom","Olem","Otumpili","Wilela"],
  "Alero": ["Bwobonam","Kal","Okura","Panyabono"],
  "Aliba": ["Aringajobi","Drabijo","Indilinga","Odonga","Rodo"],
  "Aligoi": ["Aligoi","Bududa","Kachabule","Kakerei","Kongatuny","Kotia","Mukongoro"],
  "Alikua": ["Alarapi","Alikua","Alipi","Aroi","Egamara","Ewavu","Pakayo"],
  "Alito (Kapelebyong)": ["Akileng","Alito","Amuge","Angica","Apala","Apiioguro","Ayala-Oya","Barongin","Iyalakwe","Matilong","Otkwach"],
  "Alito Town Council": ["Akor Ward","Bua-Atyeno Ward","Owani Adilo Ward","Tekidi Ward"],
  "Aloi": ["Akwangkel","Alebtong","Amuria","Anara"],
  "Aloi Town Council": ["Alal Ward","Anino Ward","Awiepek Ward","Imakioboro Ward","Okoto Ward","Te-Iconga Ward"],
  "Aluru": ["Aluru","Ebihwa","Lea","Ramogi"],
  "Alwa": ["Abalang","Ongolangol","Palatau"],
  "Alwi": ["Abok","Ayila","Fualwonga","Pangieth"],
  "Amach Town Council": ["Alworo Ward","Ayach Ward","Banya Ward","Onyakede","Onyakede Ward"],
  "Amanang": ["Amanang","Chebirbei","Cheboi","Kubulwo","Sosho"],
  "Amen Town Council": ["Amen A Ward","Amen B Ward","Oderai Ward","Opiai Ward","Orwadai Ward"],
  "Aminit": ["Aminit","Angangam","Apopong","Busano","Kalapata","Kalengo","Kayukum","Okum"],
  "Amolatar Town Council": ["Aburkot Ward","Amirimiri Ward","Apale Pe Ward","Epyel Ward","Inomo Ward"],
  "Amolo": ["Ajokomot","Amolo","Amukurat","Aroba","Golokwara","Ocor","Opam","Sugur"],
  "Amudat": ["Alakas","Amudat","Chepongos","Loburin","Nabokotom","Naremit","Ngongosowon"],
  "Amudat Town Council": ["Jumbe Ward","Kalas Ward","Lochengenge Ward","Tingas Ward"],
  "Amugu": ["Abongoatin","Abunga","Omee"],
  "Amugu Town Council": ["Acek Ward","Ajonyi Ward","Okum Ward","Opayeng Ward"],
  "Amukol": ["Amukol","Boron","Kapcheboko","Kapnongore","Mariny"],
  "Amuria Town Council": ["Akisim Ward","Alira Ward","Eastern Ward","Okutoi Ward"],
  "Amuru": ["Acwera","Okunged","Pagak","Pamuca","Toro"],
  "Amuru Town Council": ["Amoyokoma Ward","Lujoro Ward","Otwee Ward","Pogi Ward"],
  "Amusia": ["Abule","Amusia","Asuret","Moru"],
  "Amwoma": ["Aburcero","Adagwoo","Akolodong","Amwoma","Iguli"],
  "Anaka (payira)": ["Pabali","Todora","Ywaya"],
  "Angagura": ["Bur-Lobo","Kalawinya","Pucota","Pungole"],
  "Angetta": ["Angetta","Atelelo","Aweingo","Obuo","Okurango"],
  "Angodingod": ["Acuna","Akisim","Angodingod","Atete"],
  "Anyara (Kaberamaido)": ["Anyara","Moru","Omid"],
  "Anyiribu (Arua)": ["Ayuu","Bondo","Omii","Yilli"],
  "Apac": ["Abedi","Akere","Atana","Atopi"],
  "Apala": ["Abiiting","Amonomito","Obim","Okwangole","Olaoilongo"],
  "Apala Town Council": ["Abongo Awobe Ward","Abongodyang Ward","Apanyapany Ward","Bediworo Ward","Central Ward","Cungaciki Ward","Elupe Ward"],
  "Apapai (Kaberamaido)": ["Apapai","Kamidakan","Ousia"],
  "Apeduru": ["Ajaki","Amucu","Apeduru","Odoon","Omariai"],
  "Apeitolim": ["Achukudu","Apeitolim","Arengepuwa","Kaiungatuk","Kobulin","Lomokori","Narengekitoe"],
  "Aperikira": ["Abirabira","Aperikira","Okapel","Olelai"],
  "Apetai": ["Aukot","Kalachai","Kochoge","Petta","Totokidwe","Totokodwe"],
  "Apo": ["Acholi","Alilia","Aranga","Aria","Aringa","Banika","Bijo","Kena","Kerila","Orinzi","Pena","Yeta"],
  "Apoi": ["Alaro","Amun","Apoi","Ayago","Wansolo"],
  "Apopong": ["Angololo","Apopong","Kadumire","Kapala","Obwanai"],
  "Aputi": ["Alyet","Amai","Anywali","Awinyipany","Oboto Moo"],
  "Arafa": ["Adibo","Alivu","Aupi","Dimu","Omgbokolo","Oyaa","Pajama"],
  "Arapai": ["Agirigiroi","Arabaka","Dakabela","Odudui"],
  "Arapai Town Council": ["Aloet Ward","Amoru Ward","Arapai Ward"],
  "Aremo": ["Kulu Otit","Omunycong","Palwo","Patek","Tekulu"],
  "Aria": ["Acholi","Aranga","Aria","Bilijia","Kowonga","Kuba","Piajo","Yeta"],
  "Arilo": ["Ajoka","Bori","Gichara","Gimere","Gotri","Jalata","Joke","Koka","Lulurunga","Magu","Rukuja","Tuliki"],
  "Arinyapi": ["Arasi","Elegu","Ituji","Liri","Zinyini"],
  "Arivu": ["Awika","Eceko","Ombavu","Omoo","Pajuru","Ulupi"],
  "Ariwa": ["Awinga","Ikafe","Okuyo","Rigbonga"],
  "Arocha Division": ["Adok Ward","Atopi Ward","Barodong Ward","Ngec Ward","Owang Ward","Oyo Ward","Temogo Ward"],
  "Aroi": ["Aliba","Alivu","Bura","Kamule","Micu","Robu"],
  "Aromo": ["Apua","Bar-Pii","Odoca","Odoro","Otara"],
  "Arua Hill": ["Awindiri","Basaar","Mvara"],
  "Arum": ["Achol-Pii","Agelec","Alela","Kazikazi"],
  "Arwotcek": ["Aburkidi","Abwong","Arwotcek","Awac","Ayamawele","Ogenga","Ojem"],
  "Asamuk": ["Aparisa","Asamuk","Atirir","Dokolo","Obur","Ojamai","Olekai"],
  "Asuret": ["Adacar","Asuret","Mukura","Obule","Omulala","Oregia","Otatai"],
  "Atanga": ["Lawiye Adul","Ngoto","Opate"],
  "Atanga Town Council": ["Abora Ward","Gojani Ward","Kal Ward","Labongo Guru Ward"],
  "Atego": ["Paminya Lower","Paminya Upper","Pamora Upper"],
  "Athuma": ["Abaji","Leda","Olyeko","Olyeku","Zulume"],
  "Atiak": ["Okidi","Pacilo","Parwaca","Pupwonya"],
  "Atiak Town Council": ["Amoyokol Ward","Kibogi Ward","Pabuga Ward","Pagimoro Ward"],
  "Atiira": ["Alengo","Asilang","Atiira","Opuure"],
  "Atik Division": ["Bardek Ward","Bung Ward","Industrial Ward","Olili Ward"],
  "Atongtidi": ["Acenlworo","Agolowelo","Atongtidi","Goi","Iwal","Wigweng"],
  "Atoot": ["Atoot","Kaderun","Kadok","Kococwa","Koile","Ojukai","Olukangor"],
  "Atunga": ["Apok","Atunga","Oryeotyene","Otalabar"],
  "Atutur": ["Akalabai","Akibui","Apapai","Ariet","Atutur","Kapokin"],
  "Atyak": ["Angol","Anyola","Ogusi","Pamach"],
  "Aukot": ["Acaboi","Aukot","Awoja","Osuguro"],
  "Awach (Abim)": ["Awach","Barlyech","Burcoro","Gotapwou","Gwengdiya","Oporoth","Paduny","Pageya","Paibona","Pugwinyi"],
  "Awaliwal": ["Awaliwal","Damasiko","Mugenya","Takariamiam","Telamot"],
  "Awei": ["Acede","Ojul","Olyet","Owalo"],
  "Awello": ["Akongomit","Anamwany","Atero","Atomoro","Odyedo"],
  "Awere": ["Agweng","Angole","Atede","Bolo","Kal"],
  "Awiziru": ["Anzupi","Minyoko","Oluvu","Robu"],
  "Ayabi": ["Abuli","Aculawic","Bung","Ogwil","Owiny"],
  "Ayabi Town Council": ["Ayabi Ward","Central Ward","Punuatar Ward"],
  "Ayami": ["Acutkumu","Apuce","Arwot-Omito","Okio","Walela"],
  "Ayer": ["Abur","Alemi","Ilera","Lwala","Okwor","Telela"],
  "Ayivuni": ["Anzu","Kubo","Mbaraka","Olevu"],
  "Bagezza": ["Kalagala","Kijjojolo","Mugungulu"],
  "Baitambogwe": ["Bugodi","Butte","Igeyero","Katonte","Lugolole","Lukone","Mulingilire","Wainha"],
  "Bala Town Council": ["Eastern A Ward","Eastern B Ward","Western A Ward","Western B Ward"],
  "Balawoli": ["Kawaga","Nabulenzi","Namaira"],
  "Balawoli Town Council": ["Northern Ward","Southern Ward"],
  "Balla": ["Agege","Amoilela","Angic","Aumi","Balla","Omoladyang","Omuge","Omwara"],
  "Bamunanika": ["Kibanyi","Kibirizi","Kiteme","Kyampisi (bamunanika)","Mpologoma","Sekamuli"],
  "Bananywa": ["Bananywa","Kazo","Kirimbi","Kiryannongo","Kisoodo","Kiteesa","Lwengo","Mujunza","Ntunda"],
  "Banda (Kyankwanzi)": ["Banda","Buchumba","Bujwanga","Bwaaba","Kamutiika","Lugala","Lwemiganda"],
  "Banda Town Council": ["Bukeda Ward","Buwoya Ward","Buyombo Ward","Lutolo","Magooli Ward","Nangera Ward"],
  "Bar-Dege": ["Bar-Dege","For God","Kanyagoga","Kasubi"],
  "Barjobi": ["Amoyai","Barjobi","Barocok","Ogoro"],
  "Barr": ["Abunga","Ayamo","Ayira","Ober","Obot","Orem"],
  "Bata Town Council": ["Aderolongo South Ward","Aningo Central Ward","Eastern Ward","Northern Ward","Western Ward"],
  "Batalika": ["Batalika","Bigando","Kijebere","Kisansa","Mburara","Mubembe"],
  "Batta": ["Alapata","Apenyo","Atabu","Bardege","Barlela","Ocero"],
  "Bbaale": ["Bbaale","Kavule","Kokotero","Misanga","Mugongo","Nakitokolo"],
  "Bbanda": ["Kayanga","Mpongo"],
  "Bbanda Town Council": ["Bbanda Ward","Buzibazzi Ward","Kanyale Ward"],
  "Beleafe": ["Abindi","Adripi","Ajiraku","Nicu"],
  "Benet": ["Kitany","Likil","Mengya","Piswa","Taragon"],
  "Bigasa": ["Butalaga","Gongwe","Kigangazzi","Kiteera","Mbirizi"],
  "Bigodi Town Council": ["Bigodi Ward","Bujongobe Ward","Kyabakwerere Ward","Nyabubale-Mahango Ward"],
  "Biguli": ["Biguli","Kabuye","Kampala B","Malere"],
  "Bihanga (Buhweju)": ["Bihanga","Kaberebere - Kijungu","Kabingo","Karembe","Nyakaziba","Rukiri"],
  "Biharwe": ["Biharwe East Ward","Biharwe West Ward","Kishasha Ward","Nyabuhama Ward","Nyakinengo Ward","Rwenjeru Ward"],
  "Biiso": ["Biiso","Bubwe","Busingiro","Nyamasoga"],
  "Biiso Town Council": ["Biiso Ward","Kahemura Ward","Kampala Ward","Kigungu Ward","Kihuha Ward"],
  "Bijo": ["Alelinga","Aliapi","Bura","Dukurenga","Geya","Gilla","Lomunga","Meroba","Midia","Neringa","Ojinga","Ojiri","Ujji"],
  "Bikonzi": ["Bikonzi","Kikube","Kitonozi","Rukondwa"],
  "Bikurungu Town Council": ["Central Ward","Eastern Ward","Western Ward"],
  "Binyiny": ["Chepyakaniet","Kisongi","Kono","Tabagon","Tukumo"],
  "Binyiny Town Council": ["Kapkworos Ward","Kisongi Ward","Kwobus Ward"],
  "Birembo": ["Igayaza","Kisiija","Kyakarongo","Nyansimbi"],
  "Birere": ["Kahenda","Kasaana","Kikokwa","Kishuro","Kyera"],
  "Bisheshe Division": ["Bugarama Ward","Kabaare Ward","Kakatsi Ward","Karangara Ward","Kigarama Ward","Rugazi Ward"],
  "Bitereko": ["Bugongo","Busheregyenyi","Karangara","Karimbiro","Kigarama"],
  "Bitooma Town Council": ["Bitooma","Kakira","Kashambya","Kimuri","Ngorora","Nyanga"],
  "Bitsya": ["Bitsya","Kitega"],
  "Bobi": ["Aywee","Kidikal","Paidongo","Paidwe","Palenga"],
  "Bombo": ["Buhirigi","Bwikya","Hanga","Kanyiira","Marongo"],
  "Bombo Town Council": ["Bombo Central Ward","Gangama Ward","Lomule Ward","Mpakawero Ward","Namaliga Ward","Nkokonjeru Ward"],
  "Bongtiko": ["Ato","Gulalela","Ogole","Omogi","Wanglobo"],
  "Brim": ["Brim","Chemukang","Chemuron","Chemusabe","Kapchemogen","Shambabel"],
  "Bubaare": ["Kamushoko","Kashaka","Katojo","Mugarusya","Rugarama","Rwenshanku"],
  "Bubandi": ["Kanankulungo","Njule East","Njuule","Nyambaro","Tombwe"],
  "Bubango": ["Bubango","Kigujju","Rwega"],
  "Bubare": ["Bubare","Bushuura","Ihanga","Kagarama","Kashenyi","Kibuzigye","Kitojo","Muyanje","Nyamiyaga"],
  "Bubbeza": ["Bubbeza","Bumugembe","Bunabuka","Buwakoli","Lwamusabasi"],
  "Bubeke": ["Bubeke","Jaana"],
  "Bubiita": ["Maaba","Shekhulusi","Shishendu","Shiteka"],
  "Bubukwanga": ["Bubukwanga","Bunyamwera","Humya","Mampongya","Saara"],
  "Bubutu": ["Bubutu Town Board","Bukiketi Town Board","Bumulika","Bumusomi","Bumuyonga","Butsemayi","Munamba","Munamba Town Board"],
  "Bubyangu": ["Bubyangu","Bukikoso","Bumadanda","Bunabigubo","Bunabuloli","Bunamoli","Bunawozi","Kilayi","Lusamenta","Madege"],
  "Budadiri Town Council": ["Bugiwumi Ward","Bunyode Ward","Kalawa Ward","Nakiwondwe Ward"],
  "Budaka": ["Chali","Gadumire","Nampangala","Sapiri"],
  "Budaka Town Council": ["Budaka Ward","Bwase Ward","Macholi Ward","Nabweyo Ward","Namengo Ward"],
  "Budde": ["Budde","Gwatiro","Kibugga","Lugala"],
  "Budhaya": ["Budhaya","Bukatu","Buwolya","Mayuge"],
  "Budomero": ["Budomero","Kiyunga","Kyanfuba","Nabitende"],
  "Budondo": ["Buwagi (kakyomya)","Ivunamba","Kibibi","Namizi","Nawangoma"],
  "Budongo": ["Bwinamira","Kabango","Karongo","Kasongoire","Nyabyeya"],
  "Bududa": ["Bukhabusi","Bukhalali","Bukhatondi","Buloli","Bunamashe","Bunamutunyi","Bunawatsi","Buneembe","Busai","Bushimwemwe","Bushinyekwa","Shisabasi"],
  "Bududa Town Council": ["Buloli North Ward","Buloli South Ward","Bunamutunyi Ward","Buwanabisi Ward","Nashula Ward"],
  "Budumba": ["Budumba","Budusu","Bunawale","Bunghanga","Mabale","Masanghe"],
  "Budwale": ["Budwale","Bukingala","Bunamahe","Buwanagadi"],
  "Bufujja-Kachonga Town Council": ["Bufujja Ward","Bugadunya Ward","Kachonga Ward","Mudodo Ward","Nebbo Ward"],
  "Bufuma": ["Bufuma","Bulatse","Bushiswabula","Nabooti","Namakukye"],
  "Bufumbo (Bulambuli)": ["Bufumbo","Bukobe","Bumagira","Bumusiri","Bunamajje","Buzalangizo","Buzemunwa","Kama","Malungi","Mbigi"],
  "Bufumira": ["Bufumira","Lulamba"],
  "Bufunda Division": ["Bufunda Ward","Katongore Ward","Kayenje Ward","Kikoni Ward","Nsasi Ward","Nyamirima Ward","Ruyonza Ward","Rwobuzizi Ward"],
  "Bufundi": ["Kacerere","Kagunga","Kashaasha - Bufundi","Kishanje","Mugyera"],
  "Bufunjo": ["Batalika","Bigando","Bukongwa","Kandama","Kataraza","Kategere","Mbale","Nyamanga","Rwenjaza"],
  "Bugaaki": ["Busasa","Butara","Hiima","Kanyamukwaya","Kasamba","Kasenyi","Kyabagonza","Kyabaranga","Mitoma","Nyamabuga","Rugombe Town Board"],
  "Bugadde Town Council": ["Bugade Ward","Busenda Ward","Kityerera Ward","Nakibengo Ward"],
  "Bugamba (Mbarara)": ["Kabarama","Kamomo","Kitojo","Ngugo","Nyaruhandagazi"],
  "Bugambe": ["Bugambe","Katanga","Nyarugabu","Ruguse"],
  "Bugambi": ["Bugambi","Bukiiti","Bulome","Bumaibira","Bumalunda"],
  "Bugangari": ["Bugangari","Burama","Kakindo","Kashayo","Kazindiro","Kyabureere","Nyabiteete"],
  "Bugango Town Council": ["Kasharira Ward","Kikokwa Ward","Kishunju Ward","Kyabazibwe Ward","Murema Ward","Nshororo Ward"],
  "Buganikere Town Council": ["Buganikire Ward","Bundikakemba Ward","Kyamaizi Ward","Nkisya Ward","Nyahungu Ward","Simbya Ward"],
  "Bugaya (Buvuma)": ["Bugaya","Busaabi","Butaswa","Buwagga","Buye","Iraapa","Kigweri","Namukunyu","Namusikizi","Ndwasi","Zinga"],
  "Bugembe Town Council": ["Budhumbuli East Ward","Budhumbuli West Ward","Katende Ward","Nakanyonyi Ward","Wanyama Ward"],
  "Buginyanya": ["Bunatajje","Giduno","Goozi","Kirwali","Sisiyi","Tabali"],
  "Bugitimwa": ["Bugiboni","Bugitimwa","Bumagabula","Bumulegi","Buwetye","Elgon","Kisali","Lusagali"],
  "Bugobero": ["Bugobero Town Board","Bumasokho","Bunefule","Buwakoro","Khabungu","Kiwata","Nabikulu"],
  "Bugobi": ["Bugobi","Buwanga","Kibigo","Kisiiro","Makenha","Nakazinga"],
  "Bugobi Town Council": ["Bugobi B Ward","Bugobi Central Ward","Bugobi East Ward","Bukenga Ward","Kibigo Ward","Town Side Ward"],
  "Bugondo": ["Agule","Bugondo","Kamod","Kongoto","Ogera","Toror"],
  "Bugongi Town Council": ["Isingiro Ward","Kyamurari North Ward","Kyamurari South Ward","Kyarikunda Ward"],
  "Bugoye": ["Bugoye","Ibanda","Katooke","Kibirizi","Muhambo"],
  "Bugulumbya": ["Bugulumbya","Busandha","Buwoya","Nakibungulya","Nawanende Town Board","Nawangoma"],
  "Buhanda (Kamwenge)": ["Bujumiro","Kakasi","Kitoma","Nyabihoko","Nyakashenyi"],
  "Buhanika": ["Butema","Katereiga","Kikerege","Kitonya","Kitorogya","Kyohairwe"],
  "Buhara": ["Bugarama","Buhara","Karweru (kafunjo)","Kitanga","Muyebe","Ntarabana","Rwene"],
  "Buheesi": ["Kabahango","Kiremezi"],
  "Buheesi Town Council": ["Kiboota Ward","Rwensenene"],
  "Buhehe": ["Buhasaba","Buhehe","Bulwenge"],
  "Buhemba": ["Buhemba","Bukewa","Buwongo","Dohwe","Sinde"],
  "Buhimba": ["Kinogozi","Kyabatalya","Musaijamukuru East","Musaijamukuru West","Ruhunga"],
  "Buhimba Town Council": ["Buhimba East Ward","Buhimba West Ward","Kigaaya East Ward","Kigaaya West Ward"],
  "Buhugu": ["Budindi","Bukitemu","Bumatofu","Kibolo","Miwu"],
  "Buhuhira": ["Bughendero","Buhuhira","Kasambya","Kithoma","Muhumuza"],
  "Buhumuliro": ["Buhumuliro","Bukora","Bweranyange","Kasasa","Namugongo"],
  "Buhunga (Buhweju)": ["Buhunga","Bwanda","Kabingo","Kankara","Kibirizi","Kihanga","Kyaruyenje","Mushasha"],
  "Buikwe": ["Kitazi","Malongwe","Ssugu"],
  "Buikwe Town Council": ["Buikwe Ward","Lweru Ward"],
  "Bujumba": ["Bujumba","Bunyama","Bwendero","Mulabana"],
  "Bujumbura Division": ["Bujuura Ward","Karongo Ward","Kihomboza Ward","Kyesiiga Ward"],
  "Bukabooli": ["Bugoto","Bugumia","Bukabooli","Buyugu","Matovu","Mayirinya"],
  "Bukakata": ["Bukibonga","Makonzi","Ssunga"],
  "Bukalasi": ["Bukalasi","Bukibumbi","Kasuni","Mabina","Masakhanu","Nabulalo","Namarumba","Ngaame","Summee"],
  "Bukamba": ["Bujugu","Bukamba","Busereka","Buvulunguti","Kitega","Nangala","Nawampiti"],
  "Bukana": ["Biisa","Buduma","Bugana"],
  "Bukanga": ["Budondo","Busalamu","Buwologoma","Kiroba","Nabubya","Namukubembe"],
  "Bukango": ["Bukango","Kalungu","Kitemi","Kyaziiza"],
  "Bukasakya": ["Doko","Marale","Nabitiri","Tsabanyanya"],
  "Bukatube": ["Bukaleba","Buyemba","Lwanika","Mauta","Mbirabira"],
  "Bukedea": ["Adodoi","Akero","Akuoro","Aputiputi","Kajamaka","Kaloko","Kamon","Kasoka","Kokutu","Kolimeri","Okichira","Tank"],
  "Bukedea Town Council": ["Bukedea Ward","Emokori Ward","Kachabule Ward","Kide Ward","Okunguro Complex Ward","Okunguro Parents Ward","Oswapai Ward","Tamula Ward"],
  "Bukewa": ["Bukewa","Bunamutso","Buweboya","Nabulando"],
  "Bukhabusi": ["Bukhabikula","Bukhabusi","Bukimaswa","Bukimwanga","Bumakunya","Bumatanda","Bumulanyi","Bumutundi","Butiiru"],
  "Bukhadala": ["Bukhadala","Bumaena","Bumatanda","Khatsonga"],
  "Bukhalu": ["Bukhalu","Bunamaliro","Bunambutye","Bushiende","Busiu","Simu"],
  "Bukhaweka": ["Bubikala","Bukhaweka","Bukhaweka Town Board","Bunamboko","Bunanganda"],
  "Bukhiende": ["Bugwanyi","Bumaena","Bumutsopa","Bunashimolo","Burukuru","Bushangi","Isango"],
  "Bukhofu": ["Bukhofu","Bukhwaya","Ikaali","Nakhendo","Namaloko"],
  "Bukhulo": ["Bubetsye","Bukhulo","Kirombe","Mpogo","Sironko","Soola","Walanga"],
  "Bukiabi": ["Bukiabi","Bukokho","Busereli","Makhonge","Sabino"],
  "Bukibino": ["Bukibino","Bukimuma","Bukirimwa","Bunamanda","Namaitsu","Wameyo"],
  "Bukibokolo": ["Buirimbi","Bukari","Bulumino","Bunamukye","Buwakhata"],
  "Bukigai": ["Bumangoye","Bumirume","Bunamubi","Bunaporo","Butuliku"],
  "Bukigai Town Council": ["Bumakuma Ward","Bumatanda Ward","Bunabwire Ward","Bunakuti Ward","Mbelema Ward","Nabingoma Ward"],
  "Bukiiro": ["Bukiro","Nyanja","Nyarubungo","Rubingo"],
  "Bukiise": ["Bukiise","Bukirindya","Busate","Busiu","Kilulu","Nalugugu","Nandago"],
  "Bukimbiri": ["Iremera","Kagunga"],
  "Bukinda": ["Kandago","Karorwa","Kyerero","Nyakasiru"],
  "Bukiyi": ["Bukigalabo","Bumahaga","Kalasa","Kiwagalo","Nabenekwa","Namengo","Nampanga"],
  "Bukoho": ["Bukoho","Bunamulingi","Kaboole","Soono"],
  "Bukoma": ["Bukamukamu","Bukoma","Buwanzala","Kayombe"],
  "Bukomansimbi Town Council": ["Bukomansimbi Central Ward","Kigungumika Ward","Kirembeko Ward","Kisagazi Ward","Kyango Ward"],
  "Bukomero": ["Kibanda","Kikooba","Matagi","Mwezi","Sogolero"],
  "Bukomero Town Council": ["Kakunyu Ward","Kateera Ward","Kijjojolo Ward","Mataagi Ward"],
  "Bukonde": ["Bulweta","Bumuluya","Bumuyanga","Nanyunza"],
  "Bukonzo": ["Buhundu","Bukangama","Irambura","Katsangirwa","Kituti"],
  "Bukooma": ["Bukooma","Bukyangwa","Nabyoto","Naigobya","Namasenda","Namulanda"],
  "Bukulula": ["Bugonzi","Kasaali","Kiti","Kyambala","Lusango","Lusasa/kalungi","Mabuye","Mukoko"],
  "Bukungu Town Council": ["Bukungu Ward","Kibaale Ward","Kyankoole Ward"],
  "Bukusu": ["Bubutsatsa","Bukhwaya","Bukoma","Bumelele","Bunamukhosi","Bunyinza","Buwaya","Kayombe","Khaungu","Nambaale","Sinyifa"],
  "Bukuuku": ["Kazingo","Kitaka","Mandako"],
  "Bukuya": ["Kasamba","Kizibawo","Namiryango"],
  "Bukuya Town Council": ["Bukuya Ward","Kabosi Ward","Kabuyimba Ward","Kalaata Ward","Nchwamazzi Ward"],
  "Bukwa": ["Chebinyinyi","Kamutungon","Kokopchaya","Kululu","Muimet"],
  "Bukwo Town Council": ["Kabasken Ward","Kapkureson Ward","Kapsukwar Ward","Torasis Ward"],
  "Bukyabo": ["Bukyabo","Bumusabire","Busahe","Buwobudeya","Gombe","Kyambogo","Zebigi"],
  "Bukyambi": ["Bukama","Bukyambi","Bumba","Bunandudu"],
  "Bulago": ["Bugatisa","Bumusamali","Bunasufwa","Busiya"],
  "Bulamagi": ["Bukoyo","Bulamagi","Bulowooza","Bwanalira","Iwawu"],
  "Bulambuli Town Council": ["Burukuru Ward","Butta Ward","Bwikonge Ward","Industrial Ward"],
  "Bulange": ["Bubutya","Bukenga","Bulange","Buwaga","Kirerema","Kisenyi","Mpumiro","Nawankofu"],
  "Bulangira": ["Kautukwi","Pulaka"],
  "Bulangira Town Council": ["Bulangira Ward","Kadoto Ward","Kakunyumunyu Ward","Kangalaba Ward"],
  "Bulegeni": ["Mbigi","Muvule","Samazi"],
  "Bulegeni Town Council": ["Bulegeni Ward","Kavule Ward","Magala Ward"],
  "Bulembia Division": ["Katiri Ward","Kyanjuki Ward","Namuhuga Ward","Nyakabingo Iii Ward"],
  "Bulera": ["Bakijulula","Bulamu","Bulera","Kibaale","Kibogo","Kitemu","Lusanja","Miseebe","Nabumbugu","Nalyankanja","Namutamba","Namutidde"],
  "Bulesa": ["Buluwe","Iggwe","Kitodha","Namasere"],
  "Bulidha": ["Bulidha A","Bulidha B","Isakabusolo","Makoma","Nabigingo","Wakawaka"],
  "Buliima Town Council": ["Kahembe Ward","Kisalizi Ward","Marongo Ward"],
  "Buliisa": ["Bugana","Kakoora","Kigoya","Nyamitete"],
  "Buliisa Town Council": ["Central Ward","Eastern Ward","Northern Ward","Western Ward"],
  "Bulo": ["Bule","Bulo","Butawuka","Kyerima","Nakatooke"],
  "Bulongo (Luuka)": ["Budhabangula","Bugonyoka","Bukendi","Bulongo","Ibaare","Kabukongote","Kakinga","Karushonshomezi","Nakabugu","Namalemba","Rukoma"],
  "Bulopa": ["Bukutu","Bulopa","Mpakitoni","Nagamuli","Nagwenyi"],
  "Bulucheke": ["Bumaemba","Bumasata","Bumwalye","Bunantsushi"],
  "Buluganya": ["Buluganya","Mabugu","Masaka","Namunane","Nataba"],
  "Buluguyi": ["Bufunda","Bugayi","Buluguyi","Muwayo","Nsango"],
  "Bululu (Kaberamaido)": ["Kibimo","Obur"],
  "Bulumba Town Council": ["Bujjejje Ward","Bulumba Central Ward","Busunga Ward","Londe Ward","Masuna Ward","Nalenya Ward","Nkonte Ward"],
  "Bulumbi": ["Bubango","Buhobe"],
  "Bumalimba": ["Bumalimba","Bumudoma","Musene","Mutufu","Nambalenze","Namulanda","Nandere"],
  "Bumanya": ["Bulima","Bumanya","Kalalu","Kasuleta","Kyani","Namusolo"],
  "Bumasheti": ["Bukhura","Bukibokolo","Bunamae","Busamali"],
  "Bumasifwa": ["Bufaka","Bulwala","Bunamahande","Bundagala","Masagala"],
  "Bumasikye": ["Lubaale","Lwaboba","Muanda","Toma"],
  "Bumasobo": ["Bugimwera","Bumasobo","Bushunu","Buwokadala","Nazwazwa"],
  "Bumayoka": ["Bubukasha","Bukhayenjele","Bumayoka","Bunandutu","Matsakha","Namukhuyu","Nangobe"],
  "Bumbaire": ["Bumbaire","Kibaare","Kiyaga","Numba"],
  "Bumbo": ["Bumbo","Buwantsala","Buwundu","Chesoma","Kamusayi","Kisekere"],
  "Bumbo Town Council": ["Bukisasati Ward","Bumbo Town Ward","Busubende Ward","Laaso Ward","Lulangatsi Ward","Lwanda Ward","Mukhuyu Ward","Namwenula Ward","Saboti Ward","Sirekere Ward","Tsebumbeyi Ward"],
  "Bumbobi": ["Bufuya","Bukhumwa","Bumbobi","Busambe"],
  "Bumityero": ["Bumityero","Bumoyayo","Buwambwa","Komono","Makunya","Mulondo"],
  "Bumufuni": ["Bumbocha","Bumufuni","Bumwangu","Buwebele"],
  "Bumugibole": ["Bumasifwa","Bumugibole","Gamangweni","Logoli","Mayiyi","Suguta"],
  "Bumulisha": ["Bumaludye","Bumulisha","Buwagama","Kigunyunyu","Madodo","Nakidowa"],
  "Bumumali": ["Bukhabikula","Bumumali","Busekere","Buttingu","Majenga","Nantseko"],
  "Bumwalukani": ["Bumwalukani","Bunamulembwa","Sakusaku","Shikholo"],
  "Bumwoni": ["Butemulani","Bwiri","Kaboyi","Kisawayi"],
  "Bunabutiti": ["Bubore","Bubungi","Bunabutiti","Bunamanda","Namatiale"],
  "Bunabutsale": ["Bamukhama","Bunabutsale","Bunapondi","Bunapondi A"],
  "Bunabwana": ["Bunabwana","Bunabwila","Buwabula","Nanderema"],
  "Bunagana Town Council": ["Bunagana Ward","Gasasa Ward","Gitowa Ward","Maziba Ward"],
  "Bunalwere": ["Bulumera","Bunalwere","Bunamujje"],
  "Bunambutye (Bulambuli)": ["Buluguya","Bumasari","Bunambutye","Bunanganda","Bushangi","Lwaboba","Makunda","Musese"],
  "Bunamwaya Division": ["Bunamwaya Ward","Mutundwe Ward"],
  "Bunatsami": ["Bufukhula","Bumabala","Bumutu","Bunanyili","Bunatsami"],
  "Bundesi": ["Bukibalera","Bumasime","Bunamboka","Bundesi","Maika","Nakhashisi","Namalila","Namasheti","Nametsi","Renyeli","Shibanga","Tunwatsi"],
  "Bundibugyo Town Council": ["Bimara Ward","Bumadu Ward","Bumate Ward","Bundibugyo Central Ward","Hamutiti Ward","Kanyansimbi Ward"],
  "Bundingoma": ["Bundinamandi","Bundingoma","Busu","Nakasohe"],
  "Bungati": ["Bukhasame","Bukhulyungu","Busela","Busibuta","Buwambete"],
  "Bungatira": ["Atiabar","Atiabar Central","Atiabar South","Lukome","Punena"],
  "Bungokho": ["Bubirabi","Bumageni","Bushikori","Khamoto","Lwambogo"],
  "Bunyafwa": ["Bugalabi","Bunandalo","Bunazami","Buwila","Kigulya","Magga"],
  "Bupoto": ["Bukibumbi","Buwere","Namisindwa"],
  "Buraru": ["Buraru","Busanga","Buyanja","Kyabanati"],
  "Buremba": ["Bigutsyo","Kabingo","Kakoni","Kijooha","Kitamba","Kyabahura","Ngomba"],
  "Buremba Town Council": ["Bigutsyo Ward","Kabingo Ward","Kakoni Ward","Kijooha Ward","Kitamba Ward","Kyabahura Ward","Ngomba Ward"],
  "Burere": ["Rushambya","Rwajere"],
  "Burondo": ["Burondo","Karambi","Mwembi","Sempaya"],
  "Burora": ["Burora","Kamambu","Kayembe","Kihumuro","Nyamigisa","Nyamukaikuru","Rutuuza","Rwentale"],
  "Burunga (Kazo)": ["Burunga","Kiguma","Magondo","Rwigi"],
  "Busaana": ["Kasana","Kiwangula","Lusenke","Nabuganyi","Namirembe","Nampanyi","Namukuma","Namusaala"],
  "Busaana Town Council": ["Kasana Ward","Lusenke Ward","Namirembe Ward","Namukuma Ward"],
  "Busaba": ["Busaba","Buwihula","Mulagi","Mulanga"],
  "Busaba Town Council": ["Bumwami","Busaba Ward","Halanga Ward","Mwiha","Nawinyoha Ward"],
  "Busabi": ["Bugegege","Busabi","Buwesa","Habiga","Malangha","Manyamye"],
  "Busakira": ["Bukunja","Butangala","Kaluuba","Maumu","Wambete"],
  "Busamaga": ["Bugusege","Bukidiya","Bunazomi","Busamaga","Buwamaniala","Kama","Magulu"],
  "Busamuzi": ["Busamuzi","Kirongo","Lunyanja","Mawanga"],
  "Busano": ["Bufooto","Busano","Buyaka","Bwikhonje"],
  "Busanza": ["Buhozi","Buhumbu","Gitovu"],
  "Busaru": ["Bugombwa","Bundimwendi","Busaru","Kinyante","Kirindi"],
  "Busedde": ["Bugobya","Itakaibolu","Kisasi","Nabitambala","Nalinaibi"],
  "Busembatia Town Council": ["Busembatia Central Ward","Busembatia Market Ward","Buyirima Ward","Kakoge Ward","Majengo Ward"],
  "Buseruka": ["Buseruka","Nyakabingo","Rwentale","Tonya"],
  "Buseta": ["Bukamugewo","Bunghole","Buseta","Natoto"],
  "Bushika": ["Bufutsa","Bukhaukha","Bumushiso","Namakuto","Naposhi"],
  "Bushiribo": ["Bukhwaka","Bumasa","Bunambale","Bushiribo","Buswalikha","Nabafu"],
  "Bushiyi": ["Burafula","Bushiyi","Matuwa","Nakungulyu","Namamuka","Namirumba"],
  "Busiisi Division": ["Kasingo Ward","Kibingo Ward","Kiduuma Ward","Kihukya Ward"],
  "Busiita": ["Bugibugi","Bugwa","Bumadyemu","Bumugwedi","Busiita","Kirali"],
  "Busimbi Division": ["East Ward","Kireku Ward","Naama Ward","Nakaseeta Ward","North Ward"],
  "Busime": ["Busime","Bwaniha","Mundindi","Rukaka"],
  "Busiriba": ["Busiriba","Kahondo","Kanimi","Kinoni","Kyakarafa"],
  "Busiriwa": ["Bikimaswa","Bukhone","Buneboshe","Buraba","Busiriwa","Buyi"],
  "Busitema": ["Busitema","Chawo","Habuleke","Syanyonja"],
  "Busiu": ["Bufukhula","Bulusambu","Bunambutye","Buwalasi","Lumbuku","Musese"],
  "Busiu Town Council": ["Alpha Ward","Bufukhula Central Ward","Bufukhula Ward","Buwalasi Ward","Central Ward","Hospital Ward","Kolan Ward","Mabanga Ward","Namirembe Ward","Town Ward"],
  "Busoba": ["Bumasikye","Bunambutye","Bunanimi","Busoba"],
  "Busolwe": ["Bubalya","Buhabeba","Bunghumu","Mugulu"],
  "Busolwe Town Council": ["Busolwe Central Ward","Busolwe Ward","Nakwiga Ward","Nawasu Ward"],
  "Busoro": ["Busoro","Ibaale","Kaswa","Kirere","Rwengaju"],
  "Busowa Town Council": ["Budunduli Ward","Bulume Ward","Nabikaka Ward","Nakawa Ward","Nakidudula Ward","Nawandhuki Ward"],
  "Bussi": ["Balabala","Bussi/kisaba","Gulwe","Tebankiza","Zzinga"],
  "Busukuma Division": ["Busukuma","Guluddene","Kabuumba","Kikoko","Kiwenda","Lugo","Magigye","Wamirongo"],
  "Busukuya": ["Buwekopyo","Buwerayo","Kimaluli","Masaka Town Board","Sisatsa"],
  "Busulani": ["Bugimunye","Bugube","Buluzwala","Bumawosa","Bunagawoya","Bunakirima","Namwejje"],
  "Busunga Town Council": ["Busunga Central Ward","Busunga Ward","Lamia Ward","Mulungitanwa Ward","Rutobo Ward"],
  "Busunju Town Council": ["Central Ward","North Ward","South Ward","West Ward"],
  "Buswale": ["Bubango","Bungecha","Buswale","Madowa","Namayuge","Nansuma"],
  "Butagaya": ["Budima","Lubani","Nakakulwe (kisozi)","Namagera","Nawampanda","Wansiimba"],
  "Butaleja": ["Bugosa","Busibira","Mabale","Mulandu","Nakwasi"],
  "Butaleja Town Council": ["Bunghagi Ward","Butaleja Ward","Hisega Ward","Lujehe Ward","Nanyulu Ward","Sagenda Ward"],
  "Butama-Mitunda Town Council": ["Bundimbuga Ward","Bundinjongya Ward","Butama Central Ward","Kahimbi Ward","Kitengya Ward","Mutunda Ward"],
  "Butanda": ["Bigaaga","Butanda","Kabere","Kahungye","Kifurugutu","Kinyamari","Murambo","Nyamiryango"],
  "Butandiga": ["Bunamahe","Jewa","Mbata","Mbaya","Sigwa"],
  "Butansi": ["Bugeywa","Butansi","Naibowa","Naluwoli"],
  "Butayunja": ["Kitebere","Kitongo","Nakaziba(ggavu)","Ngandwe"],
  "Buteba": ["Abochet","Amonekakinei","Buteba","Mawero"],
  "Butebo": ["Butebo","Kabelai","Kangado","Kanyum","Kasyebai","Odipanya"],
  "Butemba": ["Bulamula","Kikoma","Kisiribya","Kyenda","Lwabalanga","Lwamagali","Lwendagi","Misago","Nabitakuli"],
  "Butemba Town Council": ["Bukwiri Ward","Butemba Ward","Kamirambazzi","Katanabirwa Ward","Lwebisiriza Ward","Lwenkonge Ward","Rwengiri Ward"],
  "Butenga": ["Kabigi","Kassebwera","Kawoko","Kisiita","Kyankole"],
  "Buteraniro-Nyeihanga Town Council (Mbarara)": ["Bujaga Ward","Kakigani Ward","Nyeihanga Ward"],
  "Buteza": ["Bubalinganga","Bugidyonyi","Bugwimbi","Bukwanga","Bumukone","Nangoko"],
  "Butiaba": ["Bugoigo","Walukuba"],
  "Butiaba Town Council": ["Eastern Ward","North Ward","Southern Ward","Western Ward"],
  "Butiiti": ["Busanza","Butiiti","Bwenzi","Isandara","Kaihura","Kakindo","Mukunyu"],
  "Butiru": ["Bumatanda"],
  "Butiru  Town Council": ["Bumagambo Ward","Bunabwana Ward","Busumbu Ward","Buwamalero Ward","Buwanyela Ward","Kholomo Ward"],
  "Butogota Town Council": ["Eastern Ward","Northern Ward","Southern Ward","Western Ward"],
  "Butoloogo": ["Kalama","Kanyogoga","Kidongo","Kisagazi","Kyeza"],
  "Butooto": ["Bubukanza","Bumukhana","Bunamukanda","Butoto","Buwesonga","Isanga"],
  "Butta": ["Busantsa","Butta","Fuluma Butta","Tooma Butta"],
  "Butunduzi": ["Kanyinya","Mateete","Mugali","Nakahuka","Nyabubale","Nyakatoma","Rugorra"],
  "Butunduzi Town Council": ["Butubiri Ward","Butunduzi Ward","Igaali Ward","Kyanyamugabo Ward","Mukonomura Ward","Rubaka Ward","Rwenyunyuzi Ward","Rwibale Ward"],
  "Butungama": ["Budiba","Butungama","Kasungu","Kyabukunguru","Masaka","Nyakasenyi"],
  "Butuntumula": ["Bamugolodde","Bukambagga","Kakabala","Kakinzi","Kalwanga","Kyawangabi","Ngogolo"],
  "Buvuma Town Council": ["Buwanga Central","Buwanga Ward","Mazinga Ward","Tome Ward","Walwanda Ward"],
  "Buwaaya": ["Buwaiswa","Buwolya","Isikiro","Kabaingirire","Nsango"],
  "Buwabwala": ["Bumurwa","Busambatsa I","Busambatsa Ii","Busambatsa Town Board","Buwasu"],
  "Buwagogo": ["Bubwayo","Bukewa","Bunasaka","Buwagogo","Buweboya","Nandubisi","Narurwa","Shamukunga"],
  "Buwalasi": ["Bumudu","Buwira","Nadiso","Nagudi","Sinasi","Sugi"],
  "Buwali": ["Bugobero","Bunamwamba","Buwali","Buwashi"],
  "Buwama": ["Bulunda","Bunjako","Kawumba","Sango"],
  "Buwama Town Council": ["Bongole Ward","Buyijja Ward","Jalamba Ward","Lubugumu Ward","Mbizinya Ward","Nabitete Ward"],
  "Buwambwa": ["Bukhonzo","Bumangasa","Bumoyayo","Buwambwa B","Musiye","Mutufu Town Board"],
  "Buwangani Town Council": ["Bukhisa Ward","Bukitutu Ward","Bunamubi Ward","Buwamboko Ward","Buwangani Town Board","Buwangani Ward","Marongori Ward","Nabikinji Ward"],
  "Buwanyanga": ["Bumusamali","Busabulo","Buwanyanga"],
  "Buwasa": ["Bugusege","Bugwagi","Bukimali","Bumasaba","Bunagami"],
  "Buwatuwa": ["Bulumela","Bunakatembukha","Bunamitsa","Buwabwala","Buwatuwa","Namawondo"],
  "Buwenge": ["Buweera","Kagoma","Kaiira","Kitanaba","Magamaga"],
  "Buwenge Town Council": ["Kagaire Ward","Kalitunsi Ward","Kamwani Ward","Kasalina Ward"],
  "Buwooya": ["Bukinalwa","Buwanzi","Buwooya","Lingira"],
  "Buwunga (Bugiri)": ["Bubugo","Bulando","Bupala","Busoga","Buwunga","Gguluma","Kamwozi","Kanywa","Kasaka","Kavule","Kitengeesa","Luwoko","Magoola","Mawanga","Mazinga","Nambale"],
  "Buwuni Town Council": ["Buwuni Rural Ward","Buwuni Ward","Kasebere Ward","Makhoma North Ward","Makhoma South Ward","Nainala Ward","Namasere B Ward","Nankonkolo Ward"],
  "Buyaga Town Council": ["Bungwanyi Ward","Buyaga Central Ward","Buyaga Market Ward","Industrial Ward"],
  "Buyanga (Bugweri)": ["Bukhubalo","Bulunguli","Bumoozi","Busibembe","Buwembe","Buwooya","Buyunda","Bwigula","Idudi","Kalalu","Lubira"],
  "Buyanja (Buyende)": ["Bugyera","Butayunjwa","Buyanja","Kasheshe","Kyamakanda","Ntaala","Nyabiteete","Nyakabungo","Nyakaina","Rubanga","Rwakirungura"],
  "Buyanja Town Council": ["Katojo Ward","Kyamakanda Ward","Nyakaina Ward"],
  "Buyende": ["Ikanda","Kakooge","Kiribairya","Mango","Namusita"],
  "Buyende Town Council": ["Bumyuka Ward","Buyende Ward","Kinambogo Ward","Makanga Ward","Nakabira Ward"],
  "Buyengo": ["Bulugo","Butamira","Buwabuzi","Iziru"],
  "Buyinda": ["Bukonde","Buyinda","Kiranga","Madibira","Namejje","Wangobo"],
  "Buyinja": ["Gondohera","Kifuyo","Lwangosia","Nsono","Syanyonja"],
  "Buyinza Town Council": ["Bumabimba Ward","Bunabwana Ward","Bunakami Ward","Bunyinza Ward"],
  "Buyobo": ["Bukimenya","Bulambuli","Bumayamba","Bumusi","Bumwambu","Busedani","Buweri","Buyoola"],
  "Bwambara": ["Bwambara","Kikarara","Kikongi","Nyabubare","Rwenshama"],
  "Bwamiramira": ["Kahyoro","Kibaali","Kibingo","Kikaada","Kiribanga"],
  "Bwanswa": ["Bukuumi","Kihumuro","Kihurumba","Nkondo"],
  "Bweema": ["Buziri","Bweema","Malijja","Mpatta"],
  "Bwera": ["Bunyiswa","Kisaka","Kyogha","Rwenguba"],
  "Bweramule": ["Bugando","Bweramule","Haibale","Rukora","Rwamabale"],
  "Bwesumbu": ["Bunyamurwa","Bwesumbu","Kasangali","Kaswa","Mbata"],
  "Bweyale Town Council": ["Central Ward","Northern Ward","Southern Ward"],
  "Bweyogerere Division": ["Bweyogerere Ward","Kirinya Ward"],
  "Bwijanga": ["Kahembe","Kitamba","Ntoma"],
  "Bwikara": ["Kamusegu","Kisuura","Ngoma","Nyamasa"],
  "Bwikhonge": ["Bulumela","Bunalwere","Buwabwala","Buwekanda","Bwikhonge"],
  "Bwizi": ["Bwizi","Kyakaitaba","Ntonwa"],
  "Bwizibwera-Rutooma Town Council": ["Bwizibwera Lower Ward","Bwizibwera Upper Ward","Rutoma Ward","Rwentojo Ward"],
  "Bwondha Town Council": ["Bwondha Central","Bwondha South Ward","Makonko Ward","Musoma Ward","Nalubabwe","Nkalanja Ward"],
  "Bwongyera": ["Kitojo","Nyabubare","Rwanda"],
  "Byakabanda": ["Byakabanda","Kamukalo","Kitaasa"],
  "Byerima": ["Buguluma","Byerima","Kamukanga","Katovu","Kijuubya","Kiryamusunku","Kiteredde"],
  "Camkok": ["Angorom","Kothidany","Okililing"],
  "Cawente": ["Abapiri","Adograo","Ajar","Alido","Apolika","Atule"],
  "Central Division (Buikwe)": ["Barawa Ward","Base Camp Ward","Buligo Ward","Bunyarigi Ward","Central Ward","Central Zone Ward","Chemonges Ward","Chepsikuroi Ward","Civic Centre Ward","Jukiya Hill Ward","Kabowa Ward","Kamaiba Ward","Kapsinda Ward","Kasokoso Ward","Katakala Ward","Kawotto Ward","Kawowo Ward","Kikawula Ward","Kikoni Ward","Kirembe Ward","Kokwomurya Ward","Kotido Central Ward","Kotido East Ward","Kotido North Ward","Kotido Rural Ward","Kotido West Ward","Kyeitembe Ward","Nabidongha Prison Ward","Nabidongha Ward","Nakavule Ward","Nakazadde Ward","Nakibanga Ward","Namengo Ward","Namthin Ward","Narikapet Ward","Nyakabingo Ii Ward","Nyamagana Ward","Railway Ward","Ruharo Ward","Ryamabengwa Ward","Southern Ward","Town Centre Ward","Town Ward","Walugogo Ward","Ward Ii","West Land Ward A","West Land Ward B","West Ward","Western Ward"],
  "Chahi": ["Muganza","Nyakabingo","Rutare"],
  "Chegere": ["Adem","Atigolwok","Chegere","Ilee","Kidilani","Ololango","Ongica"],
  "Chelekura": ["Adodoi","Akwamoru","Chelekura","Kalemen"],
  "Chema": ["Chebaser","Chema","Chemangang","Chemosong","Kabore","Kapkwai","Kwomo"],
  "Chepkwasta": ["Central","Chebinyiny","Chekwasta","Chemuron","Kapsabit","Kapsekek","Mokotu","Sungora","Titim","Torokyo"],
  "Chepsukunya Town Council": ["Cheptere Ward","Kapkwich Ward","Nasak Ward","Ngariamwet Ward","Tulwo Ward"],
  "Chepterech": ["Chepterech","Chesoyen","Kamoko","Kapsoyoy","Rorok"],
  "Chesower": ["Bisho","Chesower","Kapteka","Nyalit","Siit"],
  "Ciforo": ["Agojo","Loa","Mugi","Okangali","Opejo"],
  "Cyanika Town Council": ["Kinyababa Ward","Kirimbiro Ward","Rukoro Ward"],
  "Dabani": ["Busia","Buwumba","Buyengo","Dabani","Nangwe"],
  "Dadamu": ["Arivu","Ariwara","Luvu","Odravu","Oduluba","Tanganyika","Yapi"],
  "Dahami": ["Bugwagi","Bukiyi","Bumejji","Bumiliyu","Dahami","Kaduwa","Katulu","Nabudisiru"],
  "Ddwaniro (Kiboga)": ["Buyamba","Ddwaniro","Kakinzi","Kaleere/malemba","Kalokola","Katalama","Kayonza","Lwakalolo","Lwakonge"],
  "Dei": ["Dei","Gotrau","Hoima","Oguta"],
  "Diima": ["Diima","Okwece"],
  "Division A": ["Central","Katabi"],
  "Division B": ["Kigungu","Kiwafu"],
  "Dokolo": ["Abenyo","Acanpii","Adagmon","Alenga","Anangogwec","Awiri"],
  "Dokolo Town Council": ["Central Ward","Eastern Ward","Nothern Ward","Southern Ward","Western Ward"],
  "Drajini/arajim": ["Arubaku","Dondi","Mongoyo","Olivu","Paladru","Yaa"],
  "Drambu": ["Buramali","Gberemu","Oniba","Piago"],
  "Dranya": ["Alla","Aunga","Ginyako","Leiko","Nyangazia"],
  "Dufile": ["Akka","Amuri","Arra","Chinyi","Dufile (indridri)","Lebubu","Nzerea"],
  "Dzaipi": ["Adidi","Ajugopi","Logoangwa","Mgbere","Miniki"],
  "East Division (Kapchorwa)": ["Kanseera Ward","Kapchesiy Ward","Kapchesombe Ward","Kaplak Ward","Kasaana Ward","Kaweri Ward","Kawumulwa Ward","Kirwoko Ward","Kween Ward","Kwoti Ward","Kyaterekera Ward","Siron Ward","Teryet Ward"],
  "Eastern": ["Akisim Ward","Central Ward","Kengere Ward","Moruapesur Ward"],
  "Eastern Division (Bugiri)": ["Bukwali","Central Ward","Kagashe Ward","Kitumba","Kyamate Ward","Kyatoko Ward","Naluwerere Ward","Njara","Nkusi Ward","North C Ward","North East A Ward","North East B Ward","Northern B Ward","Nyakagongo","Park Ward","Rwentondo Ward","South East Ward"],
  "Elegu Town Council": ["Bibia Ward","Elegu Lorikwo Ward","Kaladima Ward"],
  "Elgon": ["Butandiga","Kikolo","Nakitali","Namasiya"],
  "Endiinzi Town Council": ["Endiinzi A Ward","Endiinzi B Ward","Kamaaya Ward","Kikoba Ward"],
  "Endinzi": ["Buhunga","Busheka","Kashoga","Nyabyondo","Rwambaga"],
  "Engaju": ["Engaaju","Kajumbura","Katongo"],
  "Engari (Kazo)": ["Bishozi","Engari","Kakindo","Kantaganya","Keichumu","Kyengando","Nsheshe"],
  "Erussi": ["Abongo","Pachaka","Padolo","Pajur","Payera"],
  "Etam": ["Abwockwar","Anamido","Awiodyek"],
  "Etam Town Council": ["Adum Ward","Alaro Ward","Arwot Ward","Chakwara Ward","Etam Ward"],
  "Ewafa": ["Alibabiti","Dilokata","Ewafa","Foligo","Malanga","Otubanga"],
  "Ewanga (Arua)": ["Dumunga","Ewanguru","Kiranga","Roga","Waka-Dinya"],
  "Gadumire": ["Bupyana","Butambala","Buyuge","Gadumire","Isalo","Panyolo","Tababa"],
  "Galiboleka": ["Bugarama","Nyakasozi","Nyankoma","Rutooma"],
  "Galiraya": ["Galiraya","Gwero-Namayuge","Kasokwe","Kirasa","Namalere","Ntimba"],
  "Gamogo": ["Chebalat","Kapnarbaba","Katongo","Loch","Sulu"],
  "Gayaza": ["Gayaza","Kasanje","Kiryajobyo","Kiyuni","Nkondo"],
  "Geregere": ["Baradanga","Latinling","Olupe","Tenge"],
  "Getom": ["Abela","Aboiboi","Abwanget","Ajesai","Angorom","Getom","Olupe"],
  "Gimara": ["Liwa","Lomunga","Maduga"],
  "Gogonyo": ["Ajepet","Angodi","Kachango","Okuoro","Okwii","Oluwa","Oukot"],
  "Goli-Goli": ["Goligoli","Majala","Nabulanghangha","Nangaiza","Yoyo"],
  "Goma Division": ["Bukerere Ward","Misindye Ward","Nantabulirwa Ward","Nyenje Ward","Seeta Ward"],
  "Gombe Division": ["Buwambo Ward","Gombe Ward","Jaggala Ward","Kiryamuli Ward","Matugga Ward","Migadde Ward","Mwererwe Ward","Nasse Ward","Ssanga Ward","Tikalu Ward","Wambale Ward"],
  "Gombe Town Council": ["Gombe Ward","Kayenje Ward","Ntolomwe Ward"],
  "Got Apwoyo": ["Bar Lyec","Obira","Paminolango","Tegot"],
  "Greek River": ["Alalam","Kapswama","Kere","Kiriki","Korite"],
  "Gumpi": ["Budola","Gumpi","Innula","Kimbaya","Kitukiro","Nabitula"],
  "Guru Guru": ["Amora","Ayila","Lamola","Odur","Opok","Otici"],
  "Guyaguya": ["Aakum","Adacar","Guyaguya","Orungo Town Board","Toibong"],
  "Gweri": ["Abelet","Dokolo","Gweri","Opucet"],
  "Hakibale": ["Kahangi","Kibasi","Kiburara","Kitule","Kyamuhoro","Kyarwagonya"],
  "Hamurwa": ["Igomanda","Kakore","Mpungu","Ruhonwa","Shebeya"],
  "Hamurwa Town Council": ["Hamurwa Ward","Kanyabitara Ward","Karukara Ward","Nangaro Ward"],
  "Hapuuyo": ["Iringa","Kijuma","Mukonda","Rucwamiigo"],
  "Hapuuyo Town Council": ["Karumaima Ward","Kitaleesa Ward","Muziizi Ward","Nyamugura Ward"],
  "Harugali": ["Bumate","Bupomboli","Kasulenge","Kihoko","Kirindi","Kitsolima","Nyalulu"],
  "Harugongo": ["Busaiga","Kyakaigo","Nyantaboma"],
  "Hima Town Council": ["Karungibati Ward","Kendahi Ward","Kisenyi Ward","Mowlem Ward","Town Zone Ward"],
  "Himutu": ["Kaiti","Kangalaba","Kanyenya","Namulo","Tindi","Wangale"],
  "Ibaare": ["Ibaare","Kainamo","Kyamugabo","Ryeishe"],
  "Ibanda-Kyanya Town Council": ["Ibanda Central Ward","Ibanda Ward","Kyanya Ward","Nyakalengijyo Ward"],
  "Ibuje": ["Aganga","Aketo","Alworoceng","Amii","Amilo","Tarogali"],
  "Ibuje Town Council": ["Aberidwogo Ward","Alenga Ward"],
  "Ibulanku": ["Buniantole","Butende","Ibaako","Ibulanku","Namiganda","Nawansega","Nsaale"],
  "Icheme": ["Aloni","Angom","Angweta","Aungu","Awio","Okwir","Omiri","Omolo","Orupo"],
  "Icheme Town Council": ["Eastern Ward","Western Ward"],
  "Igayaza Town Council": ["Buramagi Ward","Igayaza Ward","Kaboijana Ward","Rubazi Ward"],
  "Igombe": ["Bubenge","Igombe","Kikunyu","Walanga"],
  "Igorora Town Council": ["Igorora Ward","Ngango Ward"],
  "Ihandiro": ["Bubotyo","Buhatiro","Ihango","Kihoko","Kikyo"],
  "Ihunga": ["Butanda","Kitondo","Nyakibigi"],
  "Iki-Iki": ["Kadenghe"],
  "Iki-Iki Town Council": ["Buloki Ward","Iki-Iki Ward","Kaitangole Ward","Petete Ward"],
  "Ikumba": ["Kashasha/ikumba","Mushanje","Nyamabare","Nyaruhanga"],
  "Ikumbya": ["Bunafu","Ikumbya","Inuula","Nawaka","Ntayigirwa"],
  "Imanyiro": ["Bufulubi","Magada","Mayuge","Mbaale","Nkombe"],
  "Industrial Borough": ["Malukhu","Masaba","Namatala","South Central"],
  "Inomo": ["Agwiciri","Ajok","Aluka","Banya"],
  "Inomo Town Council": ["Eastern Ward","Western Ward"],
  "Iriiri": ["Iriiri","Namendera","Tepeth"],
  "Irongo": ["Irongo","Kalyowa","Kibinga","Kyanvuma","Nawanyago"],
  "Irundu": ["Budipa","Bukutula","Igalaza","Igaraza","Nkoone"],
  "Irundu Town Council": ["Bugulusi Ward","Irundu Ward","Kagwa Ward","Kanaku Ward"],
  "Isango": ["Harukungu","Kabafu","Kamukumbi","Kayembe","Kyempara"],
  "Ishaka Division": ["Buramba Ward","Kashenyi Ward","Town Ward","Ward  Iii","Ward  Iv"],
  "Ishongororo": ["Kashozi","Mushunga","Muziza"],
  "Ishongororo Town Council": ["Kakinga Ward","Nyantsimbo Ward"],
  "Isingiro Town Council": ["Kaharo Ward","Kamuri Ward","Kyabishaho Ward","Mabona Ward","Rwekubo Ward"],
  "Isunga": ["Isunga","Kahunde","Kicope","Kijonjomi"],
  "Itek": ["Ajia","Alebere","Olilo","Onywako","Tetyang"],
  "Itirikwa": ["Baratuku","Itirikwa","Kolididi","Mungula","Odu","Zoka"],
  "Itojo": ["Itojo","Ruhanga"],
  "Itula": ["Demgbele","Kali","Legu","Morobi","Waka"],
  "Ivukula": ["Budomero","Ivukula","Kamudoke","Kimenyulo","Kirongo","Kisewuzi","Mpande (kisewuzi)","Nabitula"],
  "Iwal": ["Abongoden","Acwao","Arumgai","Iwal","Ongica","Ongura"],
  "Iwemba": ["Bugeso","Buyala","Iwemba","Nabirere","Nambo"],
  "Iyolwa": ["Ojilai","Poyem"],
  "Iyolwa Town Council": ["Gule Ward","Iyolwa Ward","Nambogo Ward","Pabone Ward"],
  "Jaguzi": ["Bumba","Jaguzi","Kaaza","Masolya","Sagitu","Serinyabi"],
  "Jangokoro": ["Afuda","Congambe","Dindo","Jupadindo","Patek","Yada"],
  "Jewa Town Council": ["Jewa Ward","Kitagalu Ward","Nakyanikile Ward","Nalumoya Ward","Ndoko Ward"],
  "Jinja Central": ["Central Jinja East","Central Jinja West","Maggwa","Old Boma"],
  "Jupangira": ["Ayomu","Goli","Jupangira","Pawong"],
  "Kaabong East": ["Kalongor","Lokolia","Losogolo","Morulem"],
  "Kaabong Town Council": ["Biafra Ward","Campswahili Ward","Central Ward","Kapilani Bar East Ward","Kapilani Bar West Ward","Komuria East Ward","Komuria West Ward","Loputuk Ward","Pajar Ward"],
  "Kaabong West": ["Kaabong","Lokerui","Lokerui Centre","Lomeris","Lomoruitae"],
  "Kaasangombe": ["Bukuuku","Bulyake","Mpwedde","Nakaseeta","Sakabusolo"],
  "Kaato": ["Bukimanayi","Bumukari","Bunamungoma","Butuwa","Shiruku"],
  "Kaawach": ["Kaiku","Lomorimor","Loperot","Moru-A-Ajore","Naabore"],
  "Kabaale": ["Kabaale","Kigaaga","Mbegu","Nzorobi"],
  "Kabale Central": ["Butobere","Central","Kigongi Ward","Nyabikoni"],
  "Kabale Northern": ["Kijuguta","Lower Bugongi","Rutooma","Upper Bugongi"],
  "Kabale Southern": ["Karubanda","Kirigime","Mwanjari","Rushaki"],
  "Kabamba": ["Kabamba","Kinaga","Kiryanjagi","Mbogwa","Nyakasozi","Rusekere","Ruzaire"],
  "Kabambiro": ["Iruhura","Kabambiro","Kebisingo","Nyamashegwa"],
  "Kabango Town Council": ["Kabango Ward","Kapeeka Ward","Kinyara Sugar L.t.d.  Ward"],
  "Kabarwa": ["Akungur","Kabarwa","Kachabule","Kachede","Kakori","Kalou","Kamuno","Kodike","Kotiokot","Magara","Takaramian","Tokor"],
  "Kabasekende": ["Bukonda","Kabasekende","Nyamugura","Rwamagando"],
  "Kabei": ["Chemukang","Kabei","Kapseneton","Rorok"],
  "Kabelai": ["Gayaza","Kabelai","Kayoga"],
  "Kabende": ["Kyakabaseke","Kyamwirukya","Masongora","Ndaiga"],
  "Kaberamaido": ["Acanpi","Kaberamaido","Kamuk"],
  "Kaberamaido Town Council": ["Alem Ward","Ararak Ward","Majengo Ward"],
  "Kaberebere Town Council": ["Kaberebere East Ward","Kaberebere South Ward","Kaberebere West Ward"],
  "Kabeywa": ["Gubongoi","Kabeywa","Tangwen","Tarito","Yembek"],
  "Kabingo": ["Bitooma","Kagogo","Katembe","Kyarugaaju","Kyeirumba"],
  "Kabira (Kyotera)": ["Bisanje","Buharambo","Bwamijja","Kyanika","Ndolo","Njala","Nyabubare","Nyakatete","Rurehe North"],
  "Kabonera": ["Bisanje","Butale","Kakunyu","Kirimya","Kitanga","Kiziba","Kyamuyimbwa"],
  "Kabonero": ["Bukara","Kabonero","Nyarugongo"],
  "Kabuga Town Council": ["Businge Ward","Kabuga Ward","Kakinga Ward","Karokarungi Ward"],
  "Kabujogera Town Council": ["Kabujogera Ward","Kagazi Ward","Kantozi Ward","Kikondo Ward","Rwamasinde Ward"],
  "Kabulasoke": ["Bukandula","Bulwadda","Butiti","Kalwanga","Lugaaga","Matongo","Mawuki"],
  "Kabuna": ["Kabuna","Kaperi","Kotia","Mutukula"],
  "Kabura Town Council (Mbarara)": ["Kikonkoma Ward","Mwizi Ward","Ngoma Ward"],
  "Kabuyanda": ["Kabugu","Kagara","Kanywamaizi","Rwakakwenda"],
  "Kabuyanda Town Council": ["Central Ward","Iryango Ward","Kisyoro Ward","Northern Ward"],
  "Kabwangasi": ["Bulalaka","Doko","Kachuru","Kaloja","Maizimasa","Nasenyi","Putti"],
  "Kabwangasi Town Council": ["Kabwangasi Ward","Kasekinyi Ward","Morutome Ward"],
  "Kabweri": ["Kabweri","Kasecha","Komodo","Nyadera"],
  "Kabwohe Division": ["Kabwohe Ward","Kakunyu Ward","Kyagaju Ward","Nyanga Ward","Rushozi Ward","Rutooma Ward"],
  "Kabwoya": ["Bubogo","Igwanjura","Kaseeta","Kimbugu","Nkondo"],
  "Kacheera": ["Kajju","Kakiri","Katatenga","Kayonza","Lwanga","Lyakisana"],
  "Kacheri": ["Jie Lolelia","Kacheri","Lokwasinyon","Napeikar"],
  "Kacheri Town Council": ["Kalogwel Ward","Kokuwuam Ward","Lakoona Ward","Lokiding Ward","Lokoona Ward"],
  "Kachomo": ["Kodiri","Kotinyanga"],
  "Kachomo Town Council": ["Bulalaka Ward","Burweta Ward","Kachomo Ward","Kadenghe Ward"],
  "Kachonga": ["Chadongo","Namajji","Namawa","Namunasa"],
  "Kachumbala": ["Aputiput","Dadir","Kachaboi","Kachumbala","Kapaang","Mukura","Obur"],
  "Kachuru": ["Kachuru","Katubai","Kinakumi"],
  "Kadama": ["Dodoi","Pedulu"],
  "Kadama Town Council": ["Kadama Ward","Kawami Ward","Nabunyere Ward"],
  "Kadami": ["Agaria","Akadot","Alukat","Aojamorok","Goria","Kabukol","Kachaboi","Kadami","Kaderin","Komolo","Nyaguo","Odotoi"],
  "Kaderuna": ["Kaderuna","Kebula","Kiryolo","Naungholi"],
  "Kadimukoli": ["Kadimukoli","Kosiiti","Nyayewo","Sekulo"],
  "Kadokolene": ["Buchema","Kadokolene","Kateryo"],
  "Kadungulu": ["Iruko","Kabulabula","Kagwara"],
  "Kadungulu Town Council": ["Adukut Ward","Adwenyi Ward","Kadungulu Central Ward","Kateng Ward"],
  "Kafunjo-Mirama Town Council": ["Kafunjo Ward","Kigando Ward","Kyarwehunde Ward","Mirama Ward","Murambi Ward"],
  "Kagadi": ["Busirabo","Kanyangoma","Kenga","Kihayura"],
  "Kagadi Town Council": ["Kagadi Central Ward","Kibanga Ward","Kiraba Ward","Kitegwa Ward","Kyomukama Ward","Mambugu Ward"],
  "Kagamba (buyamba)": ["Kagamba","Kimuli","Lwabakooba"],
  "Kagango Division": ["Itendero Ward","Kanyinasheema Ward","Kihunda Ward","Kiziba Ward","Migina Ward","Ndeebo Ward","Rwenshama Ward"],
  "Kagarama": ["Kagarama","Kitura","Kyabinunga","Nyakigyera"],
  "Kagarama Town Council": ["Kagamba Ward","Kagarama Central Ward","Rutunguru Ward"],
  "Kagongi": ["Bwengure","Kibingo","Kyandahi","Ngango","Nsiika","Ntuura"],
  "Kagongo Division": ["Kagongo Ward","Kanyansheko Ward","Kashangura Ward","Kyaruhanga Ward","Kyeikucu Ward","Nyakatokye Ward","Rwenshuri Ward"],
  "Kagugu": ["Bunyamwera","Kaghughu","Kyebumba","Nkuranga"],
  "Kagulu (Buyende)": ["Bugiri","Bumogoli","Buyumba","Irwaniro","Iyingo","Kabukye","Kagulu","Kirimwa","Mulali","Nabweyo","Nsoomba"],
  "Kagumba": ["Kagumba","Kasolwe","Kibuye","Kiige"],
  "Kagumu": ["Kagumu","Kamolokini","Nabuli","Nakitende","Nakoma","Nankokoli"],
  "Kaharo": ["Bugarama","Burambira","Kaharo","Katenga","Kitohwa","Nyakasharara"],
  "Kahokya": ["Kahokya","Kalhamya","Kinyateke","Murambi","Rwabihungu"],
  "Kahoora Division": ["Central Ward","Northern Ward","Southern Ward","Western Ward"],
  "Kahunge": ["Kiyagaara","Kyakanyemera","Mpanga","Nyakahama"],
  "Kahunge Town Council": ["Kihura Ward","Rubaba Ward","Rugonjo Ward","Rwenkuba Ward"],
  "Kahungye": ["Buramba","Habuhuriro","Kahungye","Nyombe","Rubumba","Rwemihanga"],
  "Kajjansi Town Council": ["Bulwanyi Ward","Bweya Ward","Kitende Ward","Nakawuka Ward","Namulanda Ward","Nankonge Ward","Ngongolo Ward","Nkungulutale Ward","Nsangu Ward","Ssisa Ward","Wamala Ward"],
  "Kakabara": ["Ihunga","Kihaguzi","Kijaguzo","Kyarwehuta"],
  "Kakabara Town Council": ["Buraro Ward","Kakabara Ward","Kikyedo Ward","Kisiita Ward"],
  "Kakamar": ["Kakamar","Kite-Lore","Kotirae","Lomilimil (natingorok)","Morunyang"],
  "Kakamba": ["Burumba","Kakamba","Kashenyi","Ntenga","Rurongo"],
  "Kakanju": ["Kabare","Kakanju","Katunga","Kitojo","Rushinya"],
  "Kakiika": ["Bunutsya Ward","Kakiika Ward","Kakoma Ward","Nyarubanga Ward","Rwemigyina Ward"],
  "Kakindo": ["Kasenyi","Katatemwa","Kihuuna","Kikoora","Kisaigi"],
  "Kakindo Town Council (Kakumiro)": ["Kinena Ward","Kisaigi Ward","Kyangundu Ward","Kyangyenyi Ward","Majeru Ward","Nkwaki Ward","Rukunyu Ward","Rweibare Ward","Ryenjoki Ward"],
  "Kakindu": ["Kakindu Town","Mwera","Ngugulo","Nsambya","Vvumbe"],
  "Kakira Town Council": ["Chico Ward","Kabyaza Ward","Kakira Ward","Karongo Ward","Mawoito Ward","Mwiri Ward","Polota Ward","Wairaka Ward"],
  "Kakiri": ["Buwanuka","Kamuli","Kikandwa","Lubbe","Luwunga","Magoggo","Nampunge","Sentema"],
  "Kakiri Town Council": ["Bukalango Ward","Busujja Ward","Kakiri Ward","Kikubampanga Ward","Lugeye Ward","Nakyerongosa Ward"],
  "Kakoba": ["Kakoba Ward","Nyamityobora Ward"],
  "Kakoli": ["Kabyonga","Kakoli","Kavule","Nyanza"],
  "Kakomongole": ["Akuyam","Nabolis","Nadip","Namorotot","Okwapon","Tokora"],
  "Kakooge": ["Bamusuuta","Katuugo","Kyabutaika","Kyambogo","Kyankonwa","Kyeyindula"],
  "Kakooge Town Council": ["Kabaale Ward","Kakooge Central Ward","Kakooge North Ward","Kibira Ward"],
  "Kakoro": ["Kadokolene","Kadoto","Kakoro","Kasajja","Tekwana"],
  "Kakoro Town Council": ["Eastern Ward","Kaitisya Ward","Kasajja Ward","Northern Ward","Western Ward"],
  "Kakule": ["Kakule","Kaperi","Kasuleta","Lerya","Namusita"],
  "Kakumiro Town Council": ["Central Ward","Kabworo Ward","Kanyawawa Ward","Masonde Ward","Semwema Ward"],
  "Kakure (Kaberamaido)": ["Kakure","Opungure","Oyomai"],
  "Kakures": ["Aacha","Aaramor","Adodoi","Kakures","Kalemen","Kamuno","Kanyamutamu","Kituba","Kodokoto","Madang","Oderekai","Odokoto","Okaruka","Okonai","Okukunyai","Oluwa","Onyakelo","Ouriesik"],
  "Kakutu": ["Bumbante","Kakubeke","Kakutu","Lyama"],
  "Kakuuto": ["Bigada","Kakuuto","Katovu","Mayanja","Sango Bay"],
  "Kakwanga (Kaabong)": ["Kakwanga","Lomaler","Naesekapel"],
  "Kalagala": ["Busiika","Busoke","Ddegeya","Kalanamu","Kamira","Kayindu","Lunyolya","Vvumba"],
  "Kalait": ["Amoni","Angololo","Kalaiti","Kodike","Morukebu"],
  "Kalaki (Kaberamaido)": ["Kadinya","Kakere","Kalaki","Kamuda"],
  "Kalamba": ["Bweya(sseta)","Kabasanda","Kilokola","Kitimba","Nsozibiri"],
  "Kalangaalo": ["Bujaayu","Busembi","Kalama","Kalangaalo","Kikube","Kikuuta","Kiryokya","Kiteredde","Kiyoganyi","Kyamusisi","Mutettema"],
  "Kalangala Town Council": ["Kalangala A Ward","Kalangala B Ward"],
  "Kalapata": ["Kachemichem","Kalapata","Kurao","Meus","Moroto","Morunyang","Napetakori"],
  "Kaliiro": ["Kabatema","Kasambya","Kiyinda","Kyakuterekera"],
  "Kaliiro Town Council": ["Kaliiro Central Ward","Kaliiro Ward","Katale Ward"],
  "Kaliro Town Council": ["Budini Ward","Bukumankoola Ward","Buyunga Ward","Lumbuye Ward","Naigombwa Ward"],
  "Kalisizo": ["Kakoma","Kikungwe","Kyango","Matale","Miti"],
  "Kalisizo Town Council": ["Bulinda Ward","Kalagala Ward","Kalisizo Ward","Ninzi Ward"],
  "Kalonga": ["Budibaga","Busenya","Gogwa","Kabyuma","Kalonga","Kyabaduma"],
  "Kalongo": ["Bamugolodde","Kamirampango","Kigejjo","Kisuuma","Kisweera-Mayinda","Kiwambya","Mayirikiti"],
  "Kalongo Town Council": ["Akado Ward","Alupere Ward","Kubwor Ward","Oret Ward","Town Ward"],
  "Kalungi": ["Irima","Kazwaama","Kisenyi","Namungolo","Wanzogi"],
  "Kalungu": ["Bulawula","Bwasandeku","Kaliiro","Kasanje","Kibisi","Kitamba","Nabutongwa","Ntale","Villa-Maria"],
  "Kalungu Town Council": ["Kalungu Ward","Kikukumbi Ward","Kisaawa Ward","Lusaana Ward"],
  "Kalwana": ["Bweyongedde","Ddalamba","Kasaazi","Kikandwa","Kyabalanzi","Lwabaza","Mayirikiti","Nakateete"],
  "Kamaca": ["Alemen","Kamacha","Kamunyumbi","Katilekori","Ojie","Okemer","Olumot","Otiisa"],
  "Kambuga": ["Bugongi","Kiringa","Nyarugunda","Nyarutojo"],
  "Kambuga Town Council": ["Central Ward","Eastern Ward","Northern Ward","Southern Ward"],
  "Kamdini": ["Juma","Ocini","Pukica","Zambia"],
  "Kamdini Town Council": ["Eastern Ward","Western Ward"],
  "Kameke": ["Kameke","Kateki","Komolo B","Komolo Manga","Kwarikwari","Omuroka"],
  "Kameruka": ["Bupuchai","Kameruka","Lerya","Nabugalo","Nanzala"],
  "Kamet": ["Borowon","Kamet","Kapkumolon","Mukulei","Yemitek"],
  "Kamion": ["Kamion","Kokosowa","Nawadou"],
  "Kamira": ["Kabunyata","Kaswa","Kataggwe","Kitenderi","Mabuye","Mazzi","Nambere"],
  "Kammengo": ["Butoolo","Kammengo","Kanyike","Kyanja","Luwala","Lwaggwa/kibaanga","Musa","Muyira"],
  "Kamonkoli": ["Bunyolo","Jami"],
  "Kamonkoli Town Council": ["Kamonkoli North Ward","Kamonkoli South Ward"],
  "Kamor": ["Kangorok","Kapuyon","Naadoi"],
  "Kampala Central": ["Bukesa","Civic Centre","Industrial Area","Kagugube","Kamwokya I","Kamwokya Ii","Kisenyi I","Kisenyi Ii","Kisenyi Iii","Kololo I","Kololo Ii","Kololo Iii","Kololo Iv","Mengo","Nakasero I","Nakasero Ii","Nakasero Iii","Nakasero Iv","Nakivubo","Old Kampala"],
  "Kamu": ["Kamu","Kisenyi","Masaba","Masola","Somi"],
  "Kamubeizi": ["Kabeshekyere","Kamubeizi","Kyarugoza"],
  "Kamubeizi Town Council": ["Burambira Ward","Kamubeizi Ward","Katanzi Ward","Kibaale Ward","Kisharira Ward"],
  "Kamuda": ["Aminit","Kamuda","Odina","Olio"],
  "Kamuganguzi": ["Buranga","Kasheregyenyi","Katenga","Kicumbi","Kisaasa","Kyasano","Mayengo"],
  "Kamuge": ["Boliso Ii","Kagoli"],
  "Kamuge Town Council": ["Bukaduka Ward","Kalapata Ward","Kamuge Ward","Mpumwire Ward","Namugongo Ward"],
  "Kamukuzi": ["Kamukuzi Ward","Ruharo Ward"],
  "Kamuli": ["Kamuli","Kasambya","Kyoga","Lusaba","Manyogaseka"],
  "Kamuroza": ["Kamuroza","Kikomagwa","Kyakataba","Kyarwakya"],
  "Kamutur": ["Abilaep","Acomai","Aereere","Akakaat","Akou-Etom","Amujeju","Kamutur","Kasera","Kocus","Komongomeri","Tajar"],
  "Kamwenge": ["Businge","Ganyenda","Kiziba","Kyabandara","Nkongoro"],
  "Kamwenge Town Council": ["Kaburisoke  Ward","Kamwenge Ward","Kitonzi Ward","Masaka Ward","Rwemirama  Ward"],
  "Kamwezi": ["Kashekye","Kibanda","Kigara","Kyabuhangwa","Kyogo","Rwenyangye"],
  "Kanaba": ["Kagezi","Muhindura"],
  "Kanair": ["405 Brigade","Kadocha","Kalongolemuge","Potongor"],
  "Kanapa": ["Kacherede","Kanapa","Kangole","Kochopo","Kodukulu","Kongura","Obotia","Totolim"],
  "Kanara (Kamwenge)": ["Kajweka","Kanara","Katanga","Kekubo","Kigarama","Kimara","Rwangara","Rwenshama","Rwenyana"],
  "Kanara Town Council": ["Kanara Ward","Kanyansi Ward","Ntoroko Ward","Twanzane Ward"],
  "Kangai": ["Adwila","Angwenya","Ayuni","Chwagere"],
  "Kangai Town Council": ["Akurolango Ward","Angai Ward","Angwenya Ward","Ayuni Ward"],
  "Kanginima": ["Kanginima","Kasupete","Kitoika Wononi","Nalidi"],
  "Kango": ["Alube","Oliri","Omua","Paduba"],
  "Kangole": ["Kadacar","Kakurau","Kakutot","Kaleu","Kamailuk","Kangole","Kaparis","Kobaale","Koreng","Osanyuk"],
  "Kangole Town Council": ["Complex Ward","Lopida Ward","Nasike Ward","Senior Quarters Ward"],
  "Kangulumira": ["Kawoomya","Kikwanya","Seeta-Nyiize"],
  "Kangulumira Town Council": ["Kangulumira Ward","Kigayaza Ward","Nakatundu Ward"],
  "Kanoni (Kazo)": ["Bwagonga","Kitongore","Mbogo","Nyarubanga","Rwakahaya","Rwemengo"],
  "Kanoni Town Council": ["Kanoni Ward","Koome Ward","Wanjeyo Ward"],
  "Kanungu Town Council": ["Eastern Ward","Northern Ward","Southern Ward","Western Ward"],
  "Kanyabeebe": ["Kanyabebe","Kanyabeebe Central","Kashagali","Rubaale"],
  "Kanyabwanga": ["Bwera","Kanyabwanga","Kashongorero","Kati","Rucence"],
  "Kanyantorogo": ["Burema","Kihembe","Kishenyi","Nyamigoye"],
  "Kanyaryeru": ["Akaku","Kanyaryeru Res Sch","Kibega","Rwamuranda"],
  "Kanyegaramire": ["Byerwa","Kanyegaramire","Kyamugarra","Nyamicu"],
  "Kanyum (Butebo)": ["Ajuket","Akisim","Ariet","Asalo","Kabwele","Kacha","Kaduyon","Kajamaka","Kanyum","Kogil","Kokalen","Odotuno","Okeito","Olimai","Omurang"],
  "Kapaapi": ["Kapaapi","Kibengeya","Kyamukwenda"],
  "Kapedo (Kaabong)": ["Kalimon","Kapedo","Komolicher"],
  "Kapeeka": ["Kalagala","Kapeeka","Kisimula","Naluvule","Namusaale"],
  "Kapeke": ["Kagobe","Kasega","Kyayimba","Nyamiringa"],
  "Kapelebyong": ["Amaseniko","Amemia","Atiira","Kapelebyong","Nyada","Okoboi"],
  "Kapeta": ["Kokoria","Kopor","Lobanya","Losakucha","Lotanyat"],
  "Kapir": ["Agule","Ajesa","Akarukei","Atapar","Kapir","Koloin","Omiito","Omuriana"],
  "Kapkoros": ["Kapkoros","Kaproben","Kawimbi","Reberon","Rotyo","Senendet"],
  "Kapkwata": ["Cherakan","Kaperotwo","Kapkwata","Kapkworos","Kusurut","Kworus","Sismach"],
  "Kaproron": ["Chemwania","Kamwam","Rarawa"],
  "Kaproron Town Council": ["Chemwina East Ward","Kaplakatet Ward","Kaproron Ward","Kapsomo Ward","Kere Ward","Korosi Ward","Sundet Ward"],
  "Kapsarur": ["Chemweyet","Chepkuto","Cheptoror","Kapsarur","Kapta","Kiretei"],
  "Kapsinda": ["Cheptuya","Kapsabuko","Kiring","Kongowo","Sengwel","Tuyobei"],
  "Kaptanya": ["Kaptokwoi","Moron","Ngangata","Tumboboi"],
  "Kaptererwo": ["Chebinyiny","Kapkoloswo","Kapnandi","Kaptali","Kaptererwa","Kaptomologon"],
  "Kaptoyoy": ["Kapkoch","Kapteng","Kaptoyoy","Kerop","Ngoryemwo","Toswo"],
  "Kaptum": ["Aloman","Chebinyiny","Cheminy","Kaptum","Serere"],
  "Kapujan": ["Kapujan","Kokorio","Orimai"],
  "Kapunyasi": ["Buyeda","Kapunyasi","Nasuleta"],
  "Kapyanga": ["Bugiri A","Bugubo","Bugunga","Kiseitaka","Nakavule","Namukonge","Ndifakulya"],
  "Karago Town Council": ["Ibonde Ward","Karago Ward","Kitarasa Ward"],
  "Karama": ["Bucuhya","Kisindizi","Kitutu","Nkenda"],
  "Karambi (Kabarole)": ["Bikunya","Buhuna","Butebe","Gweri","Kamasasa","Karambi","Kisolholho","Kithuti","Rubingo"],
  "Karangura": ["Kamabale","Kibwa","Nyakitokoli"],
  "Karenga(napore) (Kaabong)": ["Kangole","Karenga","Loyoro/napore","Nakitoit"],
  "Karita": ["Abongai","Karita","Naporokocha"],
  "Karugutu": ["Busayiro","Itojo","Nyabikungu","Nyambigha"],
  "Karugutu Town Council": ["Ibanda Ward","Kacwamba Ward","Kaghorwe Ward","Karugutu Ward","Nyabuhuru Ward"],
  "Karujubu Division": ["Kibwona Ward","Kihuuba Ward","Kisiita Ward"],
  "Karuma Town Council": ["Central Ward","Northern Ward","Southern Ward"],
  "Karungu": ["Karungu","Kasharara","Katara","Rugongo"],
  "Karusandara": ["Kanamba","Karusandara","Kibuga","Kyalanga"],
  "Kasaali Town Council": ["Buziranduulu Ward","Gayaza Ward","Kigenya Ward","Kyakonda Ward","Nkenge Ward"],
  "Kasaana": ["Karugorora","Kasaana Central","Kasaana East","Kasaana West","Kyeihara","Rukondo"],
  "Kasagama": ["Buyanja","Kagara","Katebe","Kisaluwoko","Namutamba"],
  "Kasambira Town Council": ["Kasambira Ward"],
  "Kasambya (Kakumiro)": ["Butuuti","Kabbo","Kakayo","Kamusongole","Kihamba","Kihambya","Kikaada","Kirolero","Kiryangobe","Kiweeza","Kyakasa","Lwegula","Muyinayina","Nkiinga","Rwamalenge","Semuto"],
  "Kasambya Town Council": ["Kasambya Ward","Kirume Ward","Kisizire Ward","Lubona Ward","Nakasaga Ward"],
  "Kasangati Town Council": ["Bulamu Ward","Gayaza Ward","Kabubbu Ward","Katadde Ward","Kiteezi Ward","Masooli Ward","Nangabo Ward","Wampewo Ward","Wattuba Ward"],
  "Kasanje": ["Bulumbu","Jungo","Kasanje","Mako","Sokolo","Ssazi","Zziba"],
  "Kasankala": ["Kasankala","Kirangira","Kiyumbakimu","Kongota","Kyamakanaga"],
  "Kasasa": ["Kijonjo","Kimukunda","Kisuula","Mityebiri","Ssanje/kabano"],
  "Kasasira": ["Buchela","Bugiri","Moru"],
  "Kasasira Town Council": ["Kasasira Central Ward","Kasasira Ward","Kasasira West Ward","Nagongha Ward"],
  "Kasawo": ["Kakukuulu","Kasana","Kigogola","Namaliri"],
  "Kasawo Town Council": ["Kabimbiri","Kabimbiri B Ward","Kasawo Ward","Kasenge Ward","Kitale Ward","Kitovu"],
  "Kaseko": ["Cheberen","Kapnarkut Town Board","Kaseko","Mulungwa","Tambajja"],
  "Kasenda": ["Burambira","Isunga","Kyantambara","Nyabweya"],
  "Kasenda Town Council": ["Kabata Ward","Kasenda Ward","Rwankenzi Ward"],
  "Kasensero Town Council": ["Central A Ward","Central B Ward","Kagera A Ward","Kagera B Ward","Kimwanyi Ward"],
  "Kaserem": ["Cherubei","Kaptono","Ngesi","Sirimityo","Were"],
  "Kashambya": ["Buchundura","Kafunjo","Kitanga","Kitunga","Nyakashebeya","Rutengye"],
  "Kashare": ["Mirongo","Mitoozo","Nchune","Nyabisirira"],
  "Kashenshero": ["Bukari","Bukuba","Kirera","Kyanzire","Nyakatooma"],
  "Kashenshero Town Council": ["Kashenshero  Ward I","Kashenshero  Ward Ii","Kashenshero Central Ward","Nyarubira-Burera Ward"],
  "Kashenyi-Kajani Town Council": ["Butare Ward","Kashenyi Ward","Kibimba Ward","Ntungamo Ward"],
  "Kashongi": ["Byanamira","Kabushwere","Kashongi","Kitabo","Ntarama","Rwanyangwe","Rwenjubu"],
  "Kashozi Division": ["Karera North Ward","Karera South Ward","Kashozi Central Ward","Kashozi East Ward","Kashozi West Ward"],
  "Kashumba": ["Kankingi","Kasharira","Kashumba","Kigaragara","Murema","Rushwa"],
  "Kasilo Town Council": ["Kamod Ward","Kasilo Ward","Kololo Ward"],
  "Kasimbi": ["Kasozi","Kicunda","Kihebeba","Manyinya"],
  "Kasitu": ["Kasitu","Katwakali","Munguni","Ndalibana"],
  "Kasodo": ["Kainja","Kasodo","Nabitende","Najeneti","Nangodi"],
  "Kasokwe": ["Busanda","Butajjube","Buyodi","Bwayuya","Kasokwe"],
  "Kassanda": ["Binikira","Kamuli Njagala","Kitongo","Kyanika","Maggwa","Nabugondo","Namabaale","Namiringa","Namiringa (lwantale)"],
  "Kassanda Town Council": ["Busengejjo Ward","Central Ward","Jjemba Ward","Kitongo Ward","Kyedikyo Ward","Makonzi Ward","Mirembe-Kaweesa Ward","Namiringa Ward"],
  "Kasule": ["Bugogo","Karama","Kasule","Kibuuba","Ngangi"],
  "Katabi Town Council": ["Kabaale Ward","Kisubi Ward","Kitala Ward","Nalugala Ward","Nkumba Ward"],
  "Katabok": ["Dingdinga","Kapetawoi","Katabok","Motany"],
  "Katajula": ["Katajula","Matindi","Mukwana","Pagoya"],
  "Katakwi": ["Aliakamer","Alogook","Aparisa","Apolin","Katakwi","Ocorimongin Town Board","Olela","Osudan"],
  "Katakwi Town Council": ["Nothern Ward","Southern Ward","Western Ward"],
  "Katanda": ["Katanda","Kyankaranga","Mugyera","Munyonyi","Nyandongo","Ryamatumba"],
  "Kateebwa": ["Bughumba","Bunaiga","Butyoka","Kateebwa"],
  "Katenga": ["Bitooma","Igambiro","Kirembe","Rukararwe"],
  "Katerera": ["Katerera","Mwongyera","Nyamabare","Nyamirima"],
  "Katerera Town Council": ["Kacu Ward","Katerera Ward","Muyenga Ward","Nyakagyezi Ward"],
  "Kateta": ["Kamusala","Kanyangan","Kateta","Ojetenyang","Okodo","Omagara","Orupe","Owiny-Agule"],
  "Katete": ["Kayanja","Kishuro","Nyakishojwa","Nyarurambi"],
  "Kathile": ["Kathile","Lemugete","Lobatou","Lokarengak","Narengepak","Narionomoru","Narube","Teregu"],
  "Kathile South": ["Kamacharikol","Lois","Lokali","Nachukul","Nariamaoi"],
  "Katikamu": ["Bukeeka","Buyuki","Kikoma","Kyalugondo","Migadde","Musaale","Tweyanze"],
  "Katikara": ["Katikara","Kiryandongo","Kitaboona","Kyangota"],
  "Katikekile": ["Kakingol","Lia","Musas","Musupo","Narengenya"],
  "Katine": ["Katine","Merok","Ogwolo","Oimai","Ojama","Olwelai","Samuk"],
  "Katira": ["Bukoki","Buloki","Kadatumi","Katira","Kerekerene"],
  "Katooke": ["Bwahurro","Kijwiga","Kinogero","Kitonya","Kyakaboyo","Myeri","Rwamukora"],
  "Katooke Town Council": ["Iborooga Ward","Kakuba Ward","Katara Ward","Katooke Ward","Kyanyabongo Ward","Mwaro Ward"],
  "Katosi Town Council": ["Bunakijja Ward","Kalengera Ward","Katosi Ward","Lugazi Ward","Nsanja Ward"],
  "Katovu Town Council": ["Kakoma Ward","Katovu Ward","Ntuula Ward"],
  "Katrini": ["Anavu","Ocopi","Okavu","Olea","Olua","Onzoro"],
  "Katum": ["Agulugwette","Katum","Lalak"],
  "Katuna Town Council": ["Kacerere Ward","Kiniogo Ward","Kyonyo Ward","Mukarangye Ward","Nyinamuronzi Ward"],
  "Katunguru": ["Kashaka","Katunguru","Kazinga","Kishenyi"],
  "Katwe": ["Kenziga","Kinywamazzi","Lugusulu"],
  "Katwe/butego": ["Butego","Katwe"],
  "Kaukura": ["Adal","Aujabule","Kakurach","Katukei","Kaukura"],
  "Kawalakol (Kaabong)": ["Kawalakol","Kokoro","Lomanok","Lomej/natiira","Naoyagum","Naseperwae"],
  "Kawanda": ["Kasongi","Kawanda","Kyabi","Lutunku"],
  "Kawempe Division": ["Bwaise I","Bwaise Ii","Bwaise Iii","Kanyanya","Kawempe I","Kawempe Ii","Kazo-Angola","Kikaya","Komamboga","Kyebando","Makerere I","Makerere Ii","Makerere Iii","Mpererwe","Mulago I","Mulago Ii","Mulago Iii","Wandegeya"],
  "Kawolo Division": ["Bibbo Ward","Bulyanteete Ward","Busaabaga Ward","Butinindi Ward","Kigenda Ward","Kiteza Ward","Luwayo Ward","Sagazi Ward"],
  "Kawowo": ["Chekwatit","Kapchela","Kimawa","Kobil","Reberwo","Sanzara"],
  "Kayabwe Town Council": ["Busese Ward","Kayabwe Ward","Nabusanke Ward","Nakibanga Ward"],
  "Kayanja": ["Kasenyi","Kayanja","Kisojo","Wantema"],
  "Kayebe": ["Busooba","Butayunja","Kayebe","Kiryamenvu","Rwamaboga"],
  "Kayera": ["Kabuye","Kindeke","Kyamukweya"],
  "Kayonza (Kanungu)": ["Balisanga","Bujengwe","Kabasheshe","Kafumba","Kamusabi","Kanywero","Karangara","Kijubwe","Kitwe","Kyeshero","Mukono","Nakyesanja","Nakyessa","Namaliri","Namizo","Ruhega","Rutendere"],
  "Kayoro": ["Abur","Aburi","Kasipodo","Kayoro"],
  "Kayunga": ["Bubajjwe","Bukoloto","Bukuju","Busaale","Buyobe","Kiteredde","Nakaseeta","Nsotoka"],
  "Kayunga Town Council": ["Bukoloto Ward","Kayunga Central Ward","Namagabi Ward","Ntenjeru Ward","West/kibira Ward"],
  "Kazinga Town Council": ["Kazinga Ward","Rushayumbe Ward","Rutaraka Ward"],
  "Kazo (Kazo)": ["Kayanga","Mbaba","Ntambazi","Rwamuranga"],
  "Kazo Town Council (Kazo)": ["Byeshembe Ward","Gabarungi Ward","Kazo Ward","Obwengara Ward","Rwemirondo Ward","Rwempiri Ward"],
  "Kebisoni": ["Garubunda","Karuhembe","Kiigiro","Mabanga","Nyeibingo"],
  "Kebisoni Town Council": ["Central Ward","Eastern Ward","Northern Ward","Souhern Ward"],
  "Kei": ["Akaya","Akia","Ambala","Awoba","Bizee","Dukulia","Giro","Gobu","Kanabu","Machabo","Noki","Osukia","Palaja","Rodo","Udrubi"],
  "Keihangara": ["Keihangara","Rugaaga","Rwenshambya"],
  "Kenkebu": ["Bulyawita","Busiginyi","Kagoli","Katakopa","Kenkebu","Kitende","Molokochomo"],
  "Kenshunga": ["Nyakasharara","Rugongi"],
  "Kerwa": ["Kendra","Kerwa","Kopionga","Kupia","Limu","Lui","Mijikita","Osubira","Rodo","Tigawate","Wandi"],
  "Khabutoola": ["Bumufuni","Bunangabo","Busangayi","Khabutoola"],
  "Kibaale": ["Kasozi","Kibaale","Kiranga","Kisega","Namakoko","Nawangisa"],
  "Kibaale Town Council": ["Kabalega Ward","Kamurasi Ward","Maasaza Ward","Ruguuza Ward"],
  "Kibale": ["Agurur","Kibale"],
  "Kibale Town Council (Namutumba)": ["Agurur","Apuna Ward","Bugumba Ward","Mpulira Ward","Nabisoigi Central Ward","Nabisoigi Ward","Nakyeere Ward","Omaulon Ward","Omukulai Ward","Opogono Ward","Otamirio Ward","Otelepai Ward"],
  "Kibalinga": ["Kaabowa","Kabubbu","Kasaana","Kibalinga A","Kibalinga B","Kisombwa","Nkandwa","Ntungamo"],
  "Kibanda": ["Bbale","Kakinga","Kyabiwa","Kyalugaba","Magabi"],
  "Kibatsi": ["Nyamugoye","Rukarango","Rukoni"],
  "Kibibi": ["Katabira","Kibibi","Mabanda","Mitwetwe"],
  "Kibiga": ["Gogonya","Kajjere","Kibaale","Kibiga","Kizinga"],
  "Kibiito": ["Kabaale","Kasunganyanja","Mujunju"],
  "Kibiito Town Council": ["Central Ward","East Ward","South East Ward","South West Ward","West Ward"],
  "Kibijjo": ["Isunga","Karangara","Kibijjo","Kitutuma","Muziranduru","Sazike"],
  "Kibinge": ["Butayunja","Kiryasaaka","Kisojjo","Maleku","Mirambi"],
  "Kiboga Town Council": ["Bamusuuta Ward","Buzibweera Ward","Kiboga Town Ward","Kirulumba Ward"],
  "Kibuga": ["Karujanga","Kibuga","Kisibo","Rutare"],
  "Kibuku": ["Bumiza","Kanyolo","Minyani","Nadoto","Nalubembe"],
  "Kibuku Town Council": ["Bubera Ward","Kibuku Ward","Kobolwa Ward","Namawondo Ward"],
  "Kibuuku Town Council": ["Kibuuku East Ward","Kibuuku North Ward","Kibuuku South Ward","Kibuuku West Ward"],
  "Kicheche (Kamwenge)": ["Bwera","Kagazi","Kantozi","Kigoto","Ruhunga"],
  "Kichwabugingo": ["Chope Lwor","Karungu","Kichwabugingo","Nyinga"],
  "Kichwamba": ["Katara","Kichwamba","Kyambura","Nyakasozi","Rumuri"],
  "Kicucura": ["Bugwara","Kicucura","Kitemba","Kitooro","Kyabisulita","Kyamajegere"],
  "Kicuzi": ["Irimya","Kanywambogo","Kicuzi"],
  "Kicwamba": ["Bwanika","Kihondo","Mabaale"],
  "Kidaago": ["Kazigo","Kidaago","Nabitende","Naibiri"],
  "Kidera": ["Bulembo","Kasiira","Kisekye","Miseru","Ndudu"],
  "Kidera Town Council": ["Itamia Ward","Kabugudho Ward","Kidera Ward","Kitaidhumba Ward","Kitete Ward"],
  "Kidetok Town Council": ["Agonyo I Ward","Agonyo Ii  Ward","Central Ward","Kidetok Ward","Okolonga  Ward","Omolotok Ward"],
  "Kidongole": ["Chodong","Kadoa","Kalupo","Kanyamutamu","Kanyanga","Kidongole","Kidongole Town Board","Koboli","Kotolutu"],
  "Kifamba": ["Kabala","Kawunguli","Kifamba","Kisaasa"],
  "Kifampa": ["Kawuula","Kifampa","Kisozi","Mityegonga"],
  "Kigambo": ["Kigambo","Kyanyambali","Magoma"],
  "Kiganda": ["Kamusenene","Kasambya","Kawungera","Kayunga","Kigalama","Kinoni","Kyojjomanyi","Musozi","Nsozinga"],
  "Kiganda Town Council": ["Kalamba Ward","Kamusu Ward","Kasambya Ward","Kawungera Ward","Kigalama Ward","Kyakayanja Ward","Kyamusota Ward","Nakabimba Ward","Nakiduduma Ward","Nsozinga Ward"],
  "Kigandalo": ["Bugondo","Isenda","Kigandalo","Kigulu","Kioga (mayengo)","Maleka"],
  "Kigando (Kyankwanzi)": ["Bubanda","Dyangoma","Kacwamango","Kakindu","Kamucope","Kigabwa","Kigando","Kiyonga","Lusiba","Mbogobbiri","Mugolodde"],
  "Kiganja": ["Kibiro","Kiganja","Kiryandongo","Kyeramya"],
  "Kigaraale": ["Ikamiro","Kabaale","Kigaraale","Kigarale","Kikumiro","Kisengya","Mabuga","Nyaibanda"],
  "Kigarama": ["Bwayegamba","Katooma","Kigarama","Kyengando","Runyinya"],
  "Kigorobya": ["Kaarungu","Karungu","Kyabisagazi"],
  "Kigorobya Town Council": ["North East Ward","Northern Ward","South East Ward","South West Ward"],
  "Kigoyera": ["Igoma","Katambale","Kigoyera","Kitugutu","Mwokya"],
  "Kigulya Division": ["Bigando Ward","Isimba Ward","Kigulya Ward"],
  "Kiguma": ["Kiguma","Nyakitojo","Rwenkuba"],
  "Kigumba": ["Buhoomozi","Kigumba","Kiigya","Mpumwe"],
  "Kigumba Town Council": ["Ward A","Ward B","Ward C"],
  "Kigwera": ["Kigwera","Kirama","Kisanya","Ndandamire","Wanseko"],
  "Kihiihi": ["Kabuga","Kibimbiri","Rusoroza"],
  "Kihiihi Town Council": ["Bihomborwa Ward","Kihiihi Town Ward","Nyakatunguru Ward","Rwanga Ward"],
  "Kihungya": ["Garasoya","Kagera","Nyeramya","Waaki"],
  "Kihuura": ["Kawaruju","Kihuura","Kijweka","Kyankaramata","Matiri","Ngombe"],
  "Kijangi": ["Kigando","Kijangi","Nyakatete","Rwembuba"],
  "Kijjuna": ["Bucooco","Kalagala","Kijjuna","Kiryajoobyo","Kyamulinga","Lugingi"],
  "Kijomoro": ["Alivu","Ambidro","Kakwa"],
  "Kijongo (Hoima)": ["Birongo","Hanga","Kamwiri","Kigomba","Kijongo","Rwambu"],
  "Kijunjubwa": ["Kijunjubwa","Kyarutanga","Miduma"],
  "Kijunjubwa Town Council": ["Bukooba Ward","Kijunjubwa Ward","Nyamukongo Ward"],
  "Kijura Town Council": ["Kahuuna Ward","Kaisagara Ward","Kijura Ward","Kyererezi Ward"],
  "Kikagate": ["Kyezimbire","Ntundu","Nyabushenyi","Rwamwijuka"],
  "Kikagate Town Council": ["Katanga Ward","Kikagate Boarder Ward","Kikagate Ward","Kitezo Ward"],
  "Kikamulo": ["Kamuli (musale)","Kapeke","Kibosse","Luteete","Magoma","Wakayamba"],
  "Kikandwa": ["Bambula","Kikandwa","Kikunyu","Luwunga","Nakwaya","Namigavu","Namwene","Wattuba"],
  "Kikatsi": ["Embare","Kayonza","Keikoti"],
  "Kikholo Town Council": ["Bubuyera Ward","Bulobi Ward","Bunanyiri Ward","Bushunya Ward","Kikholo Ward","Nshitsubo Ward"],
  "Kiko Town Council": ["Kasiisi Ward","Kiko Ward","Kyanyawara Ward","Nyabubaale Ward"],
  "Kikobero": ["Gibinda","Kikobero","Namwenje","Ngwele","Simu/pondo"],
  "Kikoora": ["Kigoma","Kikoora","Nyakatooke","Nyamaligita"],
  "Kikwaya": ["Kamuli","Kikwaya","Kyakabangali","Kyakajumbi"],
  "Kikyenkye": ["Irwaniro","Kihani","Rwengwe"],
  "Kikyusa": ["Kibengo","Kireku","Kiziba","Kyampogola","Wabusana","Wankaanya"],
  "Kilembe": ["Bunyandiku","Kalibo","Kamusonge","Kibandama","Kirimo"],
  "Kimaanya/kyabakuza": ["Kimaanya","Kyabakuza"],
  "Kimaka /mpumudde": ["Kimaka","Lubaga","Mpumudde","Nalufenya"],
  "Kimaluli": ["Birari","Bukhinde","Bumatoola","Bunamukheya","Busike","Isunu"],
  "Kimengo": ["Kibangya","Kimengo"],
  "Kimenyedde": ["Bukasa","Kawongo","Kiwafu","Nanga"],
  "Kinaaba": ["Kamakoma","Kanyamatembe","Kiziba","Kyamukombe","Mukirwa"],
  "Kingo": ["Kagganda","Kasaana","Kisansala","Kiteredde","Nkoni","Ssenya"],
  "Kinoni (Kiruhura)": ["Bidduku","Bulyamusenyu","Kaitanturegye","Kasaana","Kyenshande","Macuncu"],
  "Kinoni Town Council": ["Kinoni A Ward","Kinoni B Ward","Nakalembe A Ward","Nakalembe B Ward"],
  "Kinuuka": ["Bwamulamira","Nakasozi","Wabusana"],
  "Kinyameseke Town Council": ["Central Ward","Kinyamaseke North Ward","Kinyamaseke South Ward","Mairukumi Ward","Musomoro Ward","Rwengaju Ward"],
  "Kinyarugonjo": ["Kinyarugonjo","Mburamaizi","Mutunguru","Rwina"],
  "Kinyogoga": ["Buwana","Kinyogoga","Rukono","Rwoma"],
  "Kira Division": ["Kimwanyi Ward","Kira Ward"],
  "Kirewa": ["Katandi","Kirewa","Senda","Tindo"],
  "Kirika": ["Buluya","Kirika","Mikombe","Saala"],
  "Kirima": ["Bushura","Kihanda","Rubimbwa","Rutugunda"],
  "Kiringente": ["Kavule","Kikondo","Kiringente","Kololo","Sekiwunga"],
  "Kiru Town Council": ["Kalakala Ward","Kiru Ward","Oyaro Ward"],
  "Kirugu": ["Kikumbo","Kirugu","Kyenzaza","Mirarikye"],
  "Kiruhura Town Council": ["Kashwa Ward","Kiruhura Ward","Nyakasharara Ward"],
  "Kiruli": ["Katuugo","Kibibira","Kiruli"],
  "Kirumba": ["Buyiisa","Byerima","Kabuwoko","Kizibira","Kyengeza","Lwamba"],
  "Kirumya": ["Bundibuturo","Bundikeki","Bundimulangya","Katumba","Nyankiro"],
  "Kirundo": ["Rutaka"],
  "Kiruuma": ["Kasolokamponye","Kijaagi","Kirwanyi","Kituule","Makuukuulu"],
  "Kiryandongo": ["Kibeka","Kikube","Kitwara","Kyembera"],
  "Kiryandongo Town Council": ["Northern Ward","Southern Ward"],
  "Kiryanga": ["Kicucura","Kikonda","Kiryanga","Kitooro"],
  "Kiryannongo": ["Bulagwe","Kiryannongo","Kisomesa","Natyole","Ncucwe"],
  "Kisala": ["Kasekka","Kikuubya","Kisala","Luwuuna","Nakivubo"],
  "Kisekka": ["Busubi","Kankamba","Kikenene","Kiwangala","Nakatete","Ngereko"],
  "Kisengwe": ["Kahungera","Kyamagwara","Kyebando","Kyemengo"],
  "Kisiita": ["Buhonda","Kyakapere","Kyakijuuto","Kyakuterekera","Kyobu","Mwitanzige","Nyamirama"],
  "Kisiita Town Council": ["Bwikaragye Ward","Kisiita Central Ward","Kyabaliitwa Ward","Nyabirungi Ward"],
  "Kisinda": ["Busulumba","Kibwiza","Kisinda","Lubulo","Mpambwa","Nawandyo"],
  "Kisinga": ["Kagando","Kajwenge","Nsenyi","Nyabirongo"],
  "Kisinga Town Council": ["Kagando Ward","Kinywankoko Ward","Nsenyi Ward","Nyabirongo Ward","Rwenguhyo Ward"],
  "Kisojo": ["Kikoda","Kitongole","Rweitengya"],
  "Kisojo Town Council": ["Bibuye Ward","Kigunda Ward","Kisojo Ward","Kyamitara Ward"],
  "Kisoko": ["Gwaragwara","Kisoko","Morikiswa","Pei-Pei"],
  "Kisomoro": ["Kahondo","Kicuucu","Kisomoro","Lyamabwa"],
  "Kisozi": ["Izaniro","Kakunyu","Kiyunga","Namaganda"],
  "Kisozi Town Council": ["East Ward","West Ward"],
  "Kisubba": ["Bubomboli","Busoru","Hakitara","Kaghema","Kisuba"],
  "Kisukuma": ["Bukona","Haibale","Kabatindule","Kisukuma","Ngaragi"],
  "Kitabona": ["Kabuye","Kayindiyindi","Kitabona","Sirimula"],
  "Kitabu": ["Kabimba","Kabirizi","Kinyaminagha","Kitabu","Mughete"],
  "Kitagata": ["Kashekuro","Kyeibanga East","Kyeibanga West"],
  "Kitagata Town Council": ["Buraro Ward","Kyarushakara Ward","Marembo Ward","Muhito North Ward","Muhito South Ward","Rutoma Ward"],
  "Kitaihuka": ["Kasozi","Kijegere","Kinunda","Kiriisa","Kitaihuka"],
  "Kitanda": ["Gayaaza","Luwoko","Makukuulu","Mitigyera","Ndeeba"],
  "Kitawoi": ["Kewakween","Kitawoi","Sumaton","Tabagon","Tarak","Terempoy"],
  "Kitayunjwa": ["Budhatemwa","Buganza","Butende","Kitayunjwa","Namaganda","Namisambya I","Nawango","Nawansaso"],
  "Kitega": ["Kijengi","Kisengya","Kitega","Rukukuru"],
  "Kitenga": ["Bugonzi","Gogonya","Kagoma","Muleete"],
  "Kiteny": ["Kiteny","Kwarayo","Ladotonen","Paluba"],
  "Kitgum Matidi": ["Lumule","Oryang B","Paibony"],
  "Kitgum Matidi Town Council": ["Ibakara Ward","Jerusalem","Jerusalem Ward","Pagwa Ward","Pakumu Ward","Parwech Ward"],
  "Kitholu": ["Kanyatsi","Kiraro","Kithobira","Kitholu","Kyabikere"],
  "Kitimbwa": ["Kitatya","Kyerima","Nakivubo","Namulaba","Nkokonjeru","Wabwoko"],
  "Kitimbwa Town Council": ["Kyerima Ward","Wabuyinja Ward","Wabwoko Ward"],
  "Kitoba": ["Birungu","Budaka","Bulyango","Kibanjwa","Kiragura","Kiryangobe"],
  "Kitswamba": ["Hima","Kihyo","Kitswamba","Rugendabara"],
  "Kitto": ["Bugambakimu","Kasiiso","Kitto","Kivumu"],
  "Kitumba": ["Bukora","Bushuro","Bwama Island","Kitumba","Mwendo"],
  "Kitumbi": ["Bulinimula","Kamusenene","Kitumbi","Kiziika","Mundadde"],
  "Kituntu": ["Bukemba","Kagenda","Kantiini","Kasozi","Luwunga","Migamba","Nkasi"],
  "Kitura": ["Bweeza","Kigando","Kitura","Mooya","Nyaburunga","Rwemamba"],
  "Kituti": ["Bubulanga","Bukatikoko","Katiryo","Kituti"],
  "Kitwe Town Council": ["Bakiharire Ward","Central Ward","Kabimbiri Ward","Kabobo Ward","Nshenyi Ward","Omukibare Ward"],
  "Kityerera": ["Bubinge","Bukalenzi","Kitovu","Ndaiga","Wandegeya"],
  "Kiwanyi": ["Irondo","Izirangobi","Kiwanyi","Mulama","Nabinyonyi","Namalemba","Nambula"],
  "Kiwoko Town Council": ["Kiwoko East Ward","Kiwoko South Ward","Kiwoko Ward","Kiwoko West Ward"],
  "Kiyanga": ["Iraramira","Kagati","Kashasha","Kiyanga","Rwoburunga"],
  "Kiyindi Town Council": ["Goli Ward","Kiyindi Ward","Zzinga Ward"],
  "Kiyombya": ["Kasura","Kiyombya","Nyakatonzi","Nyamiseke","Piida"],
  "Kiyuni": ["Katente","Kijumba"],
  "Kiziba": ["Lukerere","Mweruka","Ndagga","Rwensinga"],
  "Kiziba(masuliita)": ["Bbale","Kyengeza","Lugungude","Lwemwedde","Mmanze","Nakikungube","Tumbaali"],
  "Kizinda Town Council": ["Kigoma Ward","Kizinda Ward","Nyabubare Ward"],
  "Kiziranfumbi": ["Bulimya","Kidoma","Munteme"],
  "Kizuba": ["Igerera","Kizuba","Nakalokwe","Nawansagwa"],
  "Kobulubulu": ["Aboltok","Akwalakwala","Kabalkweru","Katinge"],
  "Kobwin": ["Aciisa","Akarukei","Katengeto","Kobuin","Kodike","Okapel","Omoo","Pokor","Tilling"],
  "Koch Goma Town Council": ["Gei Ward","Hima Ward","Ocaga Ward","Oterem Ward"],
  "Koch-Goma": ["Agonga","Amar","Coo-Rom","Goma Kal"],
  "Kocheka": ["Atiriri","Gagama","Kachage","Kakere","Kocheka","Kokolotum","Okobwa","Omoniek","Omonyono","Suula"],
  "Kochi": ["Gborogborch","Goboro","Kegburu","Kelurunga","Kena","Kochi","Lokpe","Lombe","Munduchaku","Nabara","Ombechi"],
  "Koena": ["Kachul","Kajamaka","Katekwan","Katekwan Town Board","Kawo","Koena","Kosire","Kotwongo","Oluwa"],
  "Kole Town Council": ["Eastern Ward","Western Ward"],
  "Kolir": ["Agor","Amuen","Kagoloto","Kanyipa","Kareu","Kasenyi","Kodiata","Kolir","Kopeta","Miroi","Oluwa","Omidil","Tukum"],
  "Komuge": ["Kadesok","Kakira","Kawo","Kokwakipi","Komuge","Koutulai","Manga","Omonyono","Ongaara"],
  "Kongorok": ["Anguruma","Kongorok","Nakonyen"],
  "Kongunga Town Council": ["Airogo Ward","Aputon Ward","Bungokho Ward","Kapuyan Ward","Komelekes Ward","Komuraikerei Ward","Kongoidi Ward","Kongunga Ward","Nalugai Ward","Olasai Ward","Otimonga Ward"],
  "Koome Islands": ["Bugombe","Busanga","Lwomolo","Mubembe"],
  "Koro": ["Ibakara","Kal","Labwoc","Lagara","Pageya"],
  "Kortek": ["Chemwaisus","Chesimat","Kapkokoyo","Kubobei"],
  "Kosike": ["Kalokwameri","Kothike","Nakayot"],
  "Kotido": ["Lologoka","Lopie/rom-Rom","Nangelekek"],
  "Kotomor": ["Apobo","Lukee","Ogong","Olyelo Widyel","Omatowee","Otek"],
  "Kucwiny": ["Got Aciku","Lee","Ndhethe","Osigumvure","Ramogi","Ratuk","Uduka"],
  "Kuju": ["Amilimil","Amusus","Angorom","Aojakitoi","Arapai","Atuba","Kuju","Obar"],
  "Kuluba": ["Ayipe","Kuluba","Monodu","Nyambiri","Nyoke","Oraba","Pamodo"],
  "Kululu": ["Ajuji","Akuuru","Aliapi","Dongoloto","Dradranga","Ewafa","Geya","Komgbe","Kulacha","Logbodo","Lomunga","Meroba","Ojinga","Omvuzoku","Yoyo"],
  "Kumi": ["Agolitom","Agule","Asinge","Kumi","Olupe","Omatenga","Oogoria"],
  "Kuru": ["Alinga","Gojuru","Imvenga","Libua","Mechu","Renda","Rogale"],
  "Kuru Town Council": ["Ambala Ward","Gojuru Ward","Mazanga Ward","Omba Ward","Rogale Ward"],
  "Kuushu Town Council": ["Bunamee Ward","Bunashiswa Ward","Ibaale Ward","Kitsawa Ward"],
  "Kuywee": ["Atut","Bombo","Kal-Agum","Labwordwong","Lamit","Paluti"],
  "Kwanyiy": ["Kamwesa","Kapkwaikoi","Kapkwoikoi","Kaplegep","Kutwech","Munda","Nyimei","Sumotwo"],
  "Kwapa": ["Asinge","Kwapa","Kwapa Town Board"],
  "Kwarikwar": ["Amus","Apujan","Kabwalin","Kachuru","Komolo","Kwarikwari","Nyakoi","Sapir"],
  "Kwera": ["Agoga","Anwangi","Apenyang","Otoro","Oyeng-Opere"],
  "Kwosir": ["Chepkube","Cheptandan","Cherangut","Kapngotiny","Kaworyo","Kwosir","Topot"],
  "Kyabakara": ["Kakari","Kyabakara","Ngoro","Nyabubare","Rugarama"],
  "Kyabarungira": ["Kabatunda","Karambi","Kirabaho","Kyabarungira","Rwesande"],
  "Kyabasaija": ["Gayaza","Kyandara","Lubaya","Mpaanga"],
  "Kyabigambire": ["Bulindi","Kibugubya","Kisabagwa"],
  "Kyabugimbi": ["Bijengye","Kajunju","Kyeigombe"],
  "Kyabugimbi Town Council": ["Katikamwe Ward","Kitwe Ward"],
  "Kyahenda": ["Kiyanja","Kyahenda"],
  "Kyakabadiima": ["Hamugyi","Kamuyange","Kanyabeebe","Kyakabadiima"],
  "Kyakatwire Town Council": ["Kangondo Ward","Kyakatwire Ward","Mwibaale Ward","Omwibaale Ward"],
  "Kyakazihire": ["Kacu","Kyakazihire","Maisuka","Rwamagando"],
  "Kyalulangira": ["Dyango","Kalungi","Kasula","Kizinga","Rwambajjo"],
  "Kyampangara (Kazo)": ["Akengyeya","Ibaare","Kyampangara","Mushabwa","Nyungu"],
  "Kyampisi": ["Bulijjo","Ddundu","Kabembe","Kyabakadde","Ntonto"],
  "Kyamuhunga": ["Kabingo","Kakoni","Kibazi","Kyamuhunga","Mashonga","Nshumi","Swazi"],
  "Kyamuhunga Town Council": ["Butare Ward","Kyamuhunga Ward","Mashonga Ward"],
  "Kyamukube Town Council": ["Kyamukube Ward","Mitandi Ward","Mutumba Ward","Nsuura Ward"],
  "Kyamulibwa": ["Bakijjulula","Busoga","Kabaale","Kigasa","Kitosi"],
  "Kyamulibwa Town Council": ["Bakaluba Ward","Central Ward","Kateregga Ward","Yakobo Ward","Zaake Ward"],
  "Kyamuswa": ["Buwanga","Buzingo"],
  "Kyamutunzi Town Council": ["Kakindo Ward","Katoogo Ward","Kihani Ward","Muzizi Ward"],
  "Kyanaisoke": ["Isunga","Kahunde","Kamuroza","Kyanaisoke"],
  "Kyanamira": ["Kanjobe","Katokye","Kigata","Kyanamira","Muyumbu","Nyabushabi","Nyakagyera"],
  "Kyanamukaka": ["Buyaga","Buyinja","Kamuzinda","Kyantale","Zzimwe"],
  "Kyangwali": ["Buhuka","Butoole","Kasonga","Kyangwali"],
  "Kyangyenyi": ["Kagongi","Kashanjure","Masyoro","Muzira"],
  "Kyankende": ["Diika","Kahara","Kyankende"],
  "Kyankwanzi": ["Kasejere","Lubiri","Mpango","Nabweyo"],
  "Kyankwanzi Town Council": ["Biroboka Ward","Gala Ward","Kibabi Ward","Kyankwanzi Ward","Lwebisanja Ward","Nteyera Ward","Rwengaju Ward"],
  "Kyarumba": ["Buthale","Kaghema","Kalonge","Kanyatsi","Kihungu"],
  "Kyarumba Town Council": ["Kabughabugha Ward","Kyarumba Ward","Nyakeya Ward"],
  "Kyarusozi": ["Barahiija","Binunda","Kaisamba","Kyanyinaibale","Kyongera","Nsinde"],
  "Kyarusozi Town Council": ["Binunda Ward","Buhaza Ward","Kihara Ward","Kyamugenyi Ward","Kyarusozi Ward","Nyakitojo Ward"],
  "Kyatega": ["Katamba","Kyatega","Nkomangani"],
  "Kyaterekera": ["Buswaka","Wangeyo"],
  "Kyaterekera Town Council": ["Buswaka Ward","Kyaterekera East Ward","Kyaterekera West Ward","Nyantonzi Ward"],
  "Kyatiri Town Council": ["Kyatiri East Ward","Kyatiri West Ward"],
  "Kyayi": ["Bugula","Buyanja","Kalyamawolu","Kasambya","Kyayi"],
  "Kyazanga": ["Bijaaba","Kakoma","Katuulo","Lyakibiriizi"],
  "Kyazanga Town Council": ["Central Ward","Kitooro Ward","Lwentale Ward","Nakateete Ward"],
  "Kyebando": ["Kirasa","Kisalizi","Kiyanja","Mutagata","Rusenke"],
  "Kyebe": ["Gwanda","Kanabulemu","Kibumba","Minziro"],
  "Kyeera": ["Kakoma","Lubaale","Makoole"],
  "Kyegegwa": ["Bulingo","Kabweza","Kibuye","Kihamba","Sweswe"],
  "Kyegegwa Town Council": ["Kibira Ward","Kyegegwa Ward","Nkaaka Ward","Nyamuhanami Ward"],
  "Kyegonza": ["Bukundugulu","Kisoga","Malele","Mamba","Mpunge","Nakijju","Namabeya","Nsambwe","Saali"],
  "Kyeizooba": ["Buyanja","Bwera","Kararo","Kitagata","Kitwe","Ntungamo","Nyamiyaga"],
  "Kyekumbya": ["Buninga","Kisweka","Kyekumbya","Ssinde"],
  "Kyembogo": ["Kasaba","Kyamugenyi","Mirambi","Mparo","Nyaburara"],
  "Kyengera Town Council": ["Buddo Ward","Kasenge Ward","Katereke Ward","Kikajjo Ward","Kisozi Ward","Kyengera Ward","Maya Ward","Nabbingo Ward","Nanziga Ward","Nsangi Ward"],
  "Kyenjojo Town Council": ["Bucuni Ward","Hakatoma Ward","Kasiina Ward","Kijuma Ward","Kirongo Ward","Misandika Ward","Ntooma Ward"],
  "Kyenzige": ["Kitema","Mpamba","Nyabuhike"],
  "Kyenzige Town Council": ["Kanyegaramire Ward","Kasokero Ward","Kigoye Ward","Kyenzige Ward","Mpamba Ward"],
  "Kyere": ["Abuket","Kakuja","Kamurojo","Kangodo","Kelim","Kyere","Olupe","Omagoro"],
  "Kyeshero": ["Bweronde","Kashenyi","Kyeshero","Rugando"],
  "Kyesiiga": ["Bbuliro","Bugere","Kitunga","Kyesiiga"],
  "Kyomya": ["Bulyankuyege","Kagogo","Kayunga","Kyanamuyonjo","Kyoomya"],
  "Kyondo": ["Buyagha","Ibimbo","Kanyatsi","Kasokero"],
  "Kyotera Town Council": ["Central Ward","Industrial Area Ward","Mitukula Ward"],
  "Labongo": ["Kasenyi","Kihaguzi","Kihonda","Labongo"],
  "Labongo-Amida": ["Akworo","Lukwor","Oryang A"],
  "Labongo-Amida West": ["Koch","Lamola","Okidi"],
  "Labongo-Layamo": ["Ocetoke","Pagen","Paibwor","Pamolo"],
  "Labor": ["Aarapoo","Aswii","Labor"],
  "Labora": ["Abigedi","Acoyo","Lapainat East","Lapainat West","Larwodo"],
  "Lagoro": ["Akuna","Buluzi","Laber","Labilo","Pawidi","Wigweng"],
  "Laguti": ["Kilim","Lajeng","Lapyem","Tumalyec"],
  "Lai-Mutto Town Council": ["Akwang Ward","Lai Ward","Mutto Ward","Wipolo Ward"],
  "Lakang": ["Atoro","Bana","Kololo","Lajalula"],
  "Lake Kabatoro Town Council": ["Kiganda Ward","Kyakitale Ward","Kyarukara Ward","Rwenjubu Ward","Top Hill Ward"],
  "Lake Katwe": ["Busunga","Hamukungu","Kabirizi","Kasenyi","Katunguru","Kikorongo","Mweya"],
  "Lakwana": ["Laneno-Ber","Lujorongole","Te-Opok"],
  "Lakwaya": ["Alwii","Idure","Loyoajonga","Lukwir"],
  "Lalano": ["Aloto","Balakwa","Lakwor","Lalano"],
  "Laliya": ["Agonga","Laliya","Lawiyadul","Obiya Laroo","Pageya Laroo","Twonkun"],
  "Lalle": ["Agama","Agora","Gwetom","Lalle"],
  "Lalogi": ["Gem","Idobo","Jaka","Laminonami","Minja"],
  "Lamiyo": ["Ojur","Otaka","Paicam","Polcani"],
  "Lamogi": ["Agwaryugi","Coke","Lacor","Obbo","Pagoro","Palema"],
  "Lamwo Town Council": ["Ateng Par Ward","Atiba Ward","Ocula Ward","Ogwech Ward","Olebi","Pakalabule","Pobel"],
  "Laperebong": ["Ligiligi","Nanangwe","Ngekidi","Orina"],
  "Lapono": ["Amyel","Kaket","Lira-Kaket","Ogole","Ongalo"],
  "Lapul": ["Alim","Koyo","Lalogi","Lukaci"],
  "Laroo": ["Agwee","Iriaga","Pece Prisons","Queens Avenue"],
  "Laropi": ["Gbalala","Idrimari","Laropi","Panyanga"],
  "Latanya": ["Amoko","Golo","Kino","Ngekidi"],
  "Layibi": ["Kirombe","Library","Patuda","Techo"],
  "Layima": ["Alii","Katatyer","Lujoro","Reckiceke"],
  "Lefori": ["Coloa","Ebwea","Gwere","Masaloa"],
  "Legenya": ["Bumaguze","Bumasifwa","Bumasobo","Bumuhune","Bunagami","Bunamudulo","Buwodero","Gabende","Gibumbuni"],
  "Lemusui": ["Akokor","Alapat","Katabok","Lokoma","Ulingiro"],
  "Lii": ["Langele","Lii","Lutuk","Orum"],
  "Lira": ["Amuca","Anai","Bar-Apwo","Omito"],
  "Lira Central": ["Bazaar","Ireda East","Ireda West","Sen. Quarters","Te-Obia"],
  "Lira Kato": ["Abilonino","Biwang","Lapono-Muk","Lira-Kato"],
  "Lira-Palwo": ["Biwang","Lanyirinyiri","Lapeta","Omongo"],
  "Lira-Palwo Town Council": ["Abone Gang Kal Ward","Bulotwomo Ward","Lapilyet Ward","Pyergweng Ward"],
  "Lobalangit (Kaabong)": ["Lobalangit","Lodapal","Longoletyaanga","Nakellio","Pire","Sarachom","Saracom"],
  "Lobongia": ["Lobongia","Lomusian","Longoromit","Pajar"],
  "Lobule": ["Ajipala","Aliribu","Lobule","Lurujo","Ombaci","Padrombu","Ponyura","Tukaliri","Yatua"],
  "Lodiko": ["Kajiir","Kangios","Kotome","Lopedo/teuso","Sakatan"],
  "Lodonga": ["Driwala","Nyori","Orogbo","Yumele"],
  "Lodonga Town Council": ["Galaba Ward","Limuru Ward","Luzira Ward","Mijale Ward","Rembeta Ward","Yiba Ward"],
  "Logiri": ["Anyavu","Chiaba","Jiki","Lazebu","Okavu","Oliba","Ozoo"],
  "Lokales": ["Arukanes","Chepkararat","Lokales","Moruakruk"],
  "Lokiteded Town Council": ["Apungure Ward","Detach Ward","Senior Quarters Ward"],
  "Lokitelaebu Town Council": ["Lokitalaebu East Ward","Lokitalaebu South Ward","Lokitalaebu Ward"],
  "Lokole": ["Aywee","Kiwaro","Luzira","Ngudi","Ngwero","Olung","Wiidwol"],
  "Lokopo": ["Akalale","Apeitolim","Kayepas","Longalom","Lorikitae"],
  "Lokori (Kaabong)": ["Kidepo","Lokori","Opotipot"],
  "Lokung": ["Licwa","Ngomoromo","Opee","Pangira","Pawor","Pawor West"],
  "Lokung East": ["Dibolyec","Gotkwar","Lalak","Lela Pwot","Limur","Parapono"],
  "Lokwakial": ["Kopusang","Lookorok","Yeele"],
  "Lolachat": ["Lorukumo","Lotaruk","Nakuri","Sakale"],
  "Lolelia": ["Kaimese","Lochokei","Lolelia","Loteteleit","Morukinei","Morunyang","Narogos"],
  "Lolelia South": ["Leeny","Lokiyekes","Muledo","Nakatapan"],
  "Loletio": ["Lodoket","Lomonia","Modokonyang","Naputir"],
  "Lolwe": ["Hama","Lolwe East","Lolwe West"],
  "Longaroe": ["Logoman","Lopuyo","Nakwaalet","Naponga"],
  "Lopei": ["Lokudumo","Lopeei","Nakwamoru"],
  "Loputuk": ["Acherer","Looi","Loputuk","Lotirir","Nachogorom","Nataparakwangan","Nawanatau"],
  "Loregae": ["Alamacar","Loregae","Nakaale","Nakale","Naturum"],
  "Loreng": ["Kobeyon","Loasam","Loreng","Nabulenger","Nathinyonoit"],
  "Lorengecora": ["Cholichol","Kokipurat","Lolet"],
  "Lorengedwat": ["Kamaturu","Narisae","Nathinyonoit"],
  "Lori": ["Kalamgba","Kandiya","Koloro","Limidia","Okoi","Ombachi","Yayari"],
  "Loro": ["Acanpii","Adigo","Agulurude","Alidi","Alutkot","Opelere"],
  "Loro Town Council": ["Central Ward","Eastern Ward","Western Ward"],
  "Loroo": ["Loborokocha","Loroo","Namosing"],
  "Losidok": ["Cheptapoyo","Lokoma","Losidok"],
  "Lotim": ["Kakutatom","Kaloboki","Kosui","Lotim","Morukori"],
  "Lotisan": ["Lokisilei","Loo-Arengak","Loregait","Mogoth"],
  "Lotome": ["Kalokengel East","Kalokengel West","Lomuno","Moruongor","Nariamaregae"],
  "Lotukei": ["Achangali","Aridai","Gangming","Orwamuge"],
  "Loyoro": ["Lokanayona","Lomerima","Toroi"],
  "Lubimbiri": ["Kafundezi","Kalokalungi","Kitonzi","Lubimbiri","Maaya"],
  "Lubya": ["Kirewe","Laboro","Lubya","Namiti"],
  "Ludara": ["Bamure","Chakulia","Gurepi","Kechi","Lima","Longira","Ludara","Nyajo","Podo"],
  "Lugusulu": ["Kabaarekeera","Kairasya","Mbuya","Mussi","Mwitsi"],
  "Lukaya Town Council": ["Bajja Ward","Central Ward","Kaliro Ward","Magezi Kizungu Ward"],
  "Lukhonge": ["Nabweye","Namawanga","Nambwa","Waninda"],
  "Lulena": ["Bukumbale","Bumanganga","Buyaya","Kibembe","Lulena","Luseke","Nalusala","Wakine"],
  "Lumino": ["Budimo","Hasyule","Lumino"],
  "Lumino-Majanji Town Council": ["Jinja Ward","Lumino Ward","Majanji A Ward","Majanji B Ward"],
  "Lungulu": ["Bajere","Lebngec","Lulyango","Nyamokino","Panokrac"],
  "Lunyiri": ["Koc","Lagile","Opok Rom","Rackoko"],
  "Lunyo": ["Busiabala","Lunyo","Nalwire","Nekuku"],
  "Lusha": ["Bumwambu","Bunabude","Gombe","Jewa","Kinganda"],
  "Luuka Town Council": ["Busimawu Ward","Busonga Ward","Kitwekyambogo Ward","Kiyunga Ward","Lwada Ward"],
  "Luweero  Town Council": ["Kasana P.w.d Ward","Kavule Ward","Kiwogozi Ward","Luwero Central Ward","Luwero South East Ward","Luwero West Ward"],
  "Luwero": ["Bwaziba","Bweyeyo","Kabakeddi","Kagugo","Kasaala","Katugo","Kigombe","Kikube","Nakikoota"],
  "Lwabenge": ["Bugomola","Bwesa","Kibisi","Kiragga"],
  "Lwaje": ["Ddembe","Kaserere","Lukalu","Lyabalume"],
  "Lwakhakha Town Council": ["Bukeemo Ward","Bukhoma Ward","Bukibayi Ward","Butemulani Ward","Buwuma Ward","Lwakhakha Ward"],
  "Lwamaggwa": ["Bugona","Kabusotta","Kakundi","Kibuuka","Kiweeka","Kyabigondo"],
  "Lwamata": ["Kasejjere","Kisagazi","Nsala"],
  "Lwamata Town Council": ["Katanzige Ward","Kawawa Ward","Kitagenda Ward","Lwamata Central Ward"],
  "Lwampanga": ["Kikoiro","Kisaalizi","Kiwembi","Lwampanga","Wajjala","Zengebe"],
  "Lwampanga Town Council": ["Lwampanga Ward","Mbaari Ward","Muwunami Ward","Zengebe Ward"],
  "Lwanda": ["Bitabago","Butiiti","Kanoni","Kasensero","Kiyovu"],
  "Lwanjusi": ["Asinge","Bufumbula","Kuruku","Lwanjusi","Puwa","Raraka"],
  "Lwankoni": ["Kayanja","Kibutamo","Kisunku","Lwankoni","Nabyajjwe"],
  "Lwasso": ["Bukikali","Buwangolo","Kihuno","Lwasso"],
  "Lwatama": ["Kiryolo","Lwatama","Namuyonga","Nanoko"],
  "Lwebitakuli": ["Kasambya","Lwebitakuli","Lwebitakuli Central","Lwembogo","Nankondo"],
  "Lwemiyaga": ["Kampala","Lwemibu","Lwensankala"],
  "Lwengo": ["Kalisizo","Kito","Kyawagonya","Mbirizi","Musubiro","Nakyenyi","Nkunyu"],
  "Lwengo Town Council": ["Central Ward","Church Ward","Kabalungi Ward","Lwengo Ward","Mulyazawo Ward"],
  "Lwongon": ["Aralam","Chekwir","Kapswama","Lwongon","Mokoyon","Ndilai","Tuyobei"],
  "Lyabaana": ["Liibu","Muwama","Samba","Ziru"],
  "Lyakajura": ["Kicwamba","Kyemamba","Lyakajura","Rweera"],
  "Lyama": ["Buyemba","Lyama","Nakisenye","Suni"],
  "Lyantonde": ["Biwolobo","Kalagala","Katovu","Kirowooza","Kyewanula"],
  "Lyantonde Town Council": ["Kaliiro Ward","Kooki Ward"],
  "Maanyi": ["Kasota","Kimuli","Kivuvvu","Misigi","Namutunku","Nfumbye","Sserinya"],
  "Maaru": ["Kanalobae","Loongor","Nakoreto","Nakwakwa","Rutom"],
  "Mabaale": ["Kaitemba","Kinyarugojo","Kiranzi","Kitemuzi","Mutunguru","Rwina"],
  "Mabere": ["Mabere","Mahinyi","Malomba","Nyakighoma"],
  "Mabindo": ["Kasaalu","Kikoma","Mabindo"],
  "Mabira Town Council": ["Haikona Ward","Kitaihuka Ward","Kyasigireki Ward","Mabira Ward"],
  "Mabono": ["Bunatondo","Kitsatsa","Mabono","Makukye","Rukuru","Ulukusi"],
  "Maddu": ["Ddegeya","Kigezi","Kigumba","Kitwe","Kyabagamba"],
  "Maddu Town Council": ["Maddu Ward A","Maddu Ward B","Maddu Ward C","Ntalagi Ward"],
  "Madi-Opei": ["Kal","Lawiye-Oduny","Okol","Pobura"],
  "Madudu": ["Kabulamuliro","Kakenzi","Kansambya","Kikoma","Naluwondwa"],
  "Maefe": ["Bukhonzo","Bumaefe","Matenge","Tembelela"],
  "Mafubira": ["Buwekula","Buwenda Tc","Mafubira","Namulesa","Wanyange"],
  "Mafudu": ["Bunashimolo","Bundege","Bungwanyi","Mafudu"],
  "Magada": ["Buyange","Kategere","Magada","Magada North","Magada South"],
  "Magale": ["Bukibeti","Bumulika","Busimaolya","Butsebeni","Maresi","Naluwande"],
  "Magale Town Council": ["Bukuto Ward","Busantsa Ward","Butinduyi Ward","Buwandyambi Ward","Buwesa Ward","Magale Ward","Mission Ward","Nambewo Ward"],
  "Magamaga": ["Gulotworo","Koya","Monyanga"],
  "Magamaga  Town Council": ["Bukoli Ward","Magamaga Ward","Wabulungu Ward","Wandago Ward"],
  "Magambo": ["Bugaya","Butoha","Magambo","Rubirizi","Rugazi"],
  "Magogo": ["Buteme","Kakira","Lwanyama","Magogo","Matumu","Nankandulo"],
  "Magola": ["Gule","Magola","Papol","Poyameri"],
  "Magoro": ["Angisa","Kamenu","Magoro","Omasia","Opeta"],
  "Magoro Town Council": ["Eastern Ward","Obwangor Ward"],
  "Mahango": ["Kyabwenge","Lhuhiri","Mahango","Nyamusule"],
  "Mahyoro (Kamwenge)": ["Bukurungu","Kanyabikyere","Kitonzi","Kyendagara","Mahyoro","Nyakasura","Nyakera"],
  "Mairirwe": ["Batahulira","Kayanja","Kyema","Mairirwe"],
  "Maizimasa": ["Kawojan","Komolo","Maizimasa","Sukusuku"],
  "Majanji": ["Dadira","Junge","Majanji","Nagabita"],
  "Makenya": ["Bukimiyu","Bumagira","Bumirumi","Bumufuni","Makenya"],
  "Makerere University": ["Muluka I","Muluka Ii","Muluka Iii","Muluka Iv"],
  "Makindye Division": ["Bukasa","Buziga","Ggaba","Kabalagala","Kansanga","Katwe I","Katwe Ii","Kibuli","Kibuye I","Kibuye Ii","Kisugu","Lukuli","Luwafu","Makindye I","Makindye Ii","Nsambya Central","Nsambya Estate","Nsambya Railways","Salaama","Wabigalo"],
  "Makokoto": ["Bbira","Bulyambidde","Kawasa","Kyabakade","Makokoto","Namakonkome"],
  "Makulubita": ["Kagogo","Kalasa","Kangave","Kanyanda","Kasozi","Makulubita","Mawale","Nsanvu","Waluleeta"],
  "Makuutu": ["Kasozi","Kigulamo","Makandwa","Makuutu"],
  "Malaba Town Council": ["Akolodong Ward","Amagoro Ward","Asinge Ward","Malaba Ward","Obore Ward"],
  "Malangala": ["Kanyanya","Kiwawu","Magonga"],
  "Malera": ["Abititi","Kachoc","Kachonga","Kanyanga","Kasechi","Kokwech","Malera","Okouba"],
  "Maliba": ["Bikone","Buhunga","Isule","Katebe","Kisanga","Mubuku","Nyabisusu","Nyangorongo"],
  "Malongo (Lwengo)": ["Bukatabira","Buluta","Bumwena","Kalagala","Katovu","Kigeye","Malongo","Namadhi","Namoni"],
  "Manafwa Town Council": ["Bubulo Ward","Bubwaya Ward","Bumwangu Ward","Mayenze Ward"],
  "Manibe": ["Eleku","Ewadri","Lufe","Odravu","Ombachi","Ombokoro","Oreku","Robu"],
  "Manyogaseka": ["Kawawa","Kiteredde","Kyabayima","Kyayi","Lutunku","Manyogaseka","Myaliro","Ndeeba"],
  "Maracha Town Council": ["Adongoro Ward","Ayiko Ward","Baria Ward","Bura Ward","Central Zone Ward","Odravu Ward","Okapi Ward","Ombia Ward"],
  "Masaba (Busia)": ["Buboolo","Bufupa","Bukinyale","Bumuluwe","Butangasi","Masaba","Mbehenyi","Zesui"],
  "Masafu": ["Buhatuba","Kubo","Masafu","Mawanga"],
  "Masafu Town Council": ["Butote Ward","Masafu Ward","Mawanga Ward"],
  "Masajja Division": ["Busabala Ward","Masajja Ward","Namasuba Ward"],
  "Masha": ["Kabaare","Nyakakoni","Nyamitsindo","Nyarubungo","Rukuuba","Rumuri","Rwenshebashebe"],
  "Masheruka": ["Kyabuharambo","Masheruka"],
  "Masheruka Town Council": ["Buringo Ward","Kabutsye Ward","Kanyeganyegye Ward","Mabare Ward","Nyakambu Ward"],
  "Masindi Port": ["Kaduku","Kitukuza","Waibango","Wakisanyi"],
  "Masinya": ["Bumunji","Busikho","Masinya"],
  "Masira": ["Dunga","Gabugoto","Ganzo","Kikobero","Kinyofu"],
  "Masodde-Kalagi Town Council": ["Kalagi Ward","Kigoma Ward","Masodde Ward","Vvumba Ward"],
  "Masuliita Town Council": ["Bbika Ward","Kanzize Ward","Katikamu Ward","Masuliita Ward"],
  "Matale": ["Kaisekenkere","Karangara","Kitaba","Kitengeto"],
  "Matany": ["Lokali","Lokupoi","Lokuwas","Morulinga","Nakicumet"],
  "Matany Town Council": ["Kololo Ward","Matany East Ward","Matany West Ward","Napeipelu Ward"],
  "Mateete": ["Kayunga","Mateete","Nakagongo"],
  "Mateete Town Council": ["Kasaana Ward","Kiwumulo Ward","Mateete Central Ward","Mateete West Ward"],
  "Mayanga": ["Katagata","Mayanga","Rwamujura","Rwanja East"],
  "Mayanza": ["Bukhofu","Bumwangu","Buwanyama","Namaloko"],
  "Mayirikiti Town Council": ["Central Ward","Kabazi Ward","Kayisolo Ward","Kiswera Ward"],
  "Mayuge Town Council": ["Ikulwe Ward","Kasugu Ward","Kavule Ward","Kyebando Ward"],
  "Maziba": ["Birambo","Kahondo","Karweru","Kavu","Nyanja","Rugarama"],
  "Mazimasa": ["Doho","Kapisa","Lubembe","Mazimasa","Muyago"],
  "Mazinga": ["Buggala","Butulume"],
  "Mazuba": ["Isita","Kagaire","Mazuba","Mpeizya","Nawanzali","Nsoola"],
  "Mbaare": ["Burigi","Kihanda","Kyabahesi","Nshororo","Nyamarungi","Ruteete"],
  "Mbatya": ["Budweya","Bulemba","Bunghuha","Busamba","Buthungereri"],
  "Mbirizi": ["Buseregenyu","Kigudde","Kisiita","Kyato","Mbiriizi"],
  "Mboira": ["Apodorwa","Kifuruta","Mboira","Nyakabale"],
  "Mbulamuti": ["Bugondha","Buluya","Kiyunga"],
  "Mbulamuti Town Council": ["Lugoloire Ward","Mbulamuti Ward"],
  "Mbunga": ["Bunyakalija","Kabwe","Kyangumirya","Mbunga","Nyakazinga"],
  "Mella": ["Apokor","Kinyii","Koitangiro","Mella"],
  "Mende": ["Baka","Bbanda","Kaliiti","Mende","Namusera"],
  "Merikit": ["Amurwo","Apokor","Kachinga","Maliri","Merikit"],
  "Metu": ["Ayipe","Ayiro","Erepi","Lea","Pameri","Pamujo"],
  "Midia": ["Asunga","Degiba","Dricile","Kingaba","Lurunu","Midia"],
  "Midigo": ["Kopua","Medenga","Migo","Mocha","Mulumbe"],
  "Midigo Town Council": ["Adronga Ward","Araa Ward","Kujua Ward","Otre Ward"],
  "Migamba": ["Kahungura","Kasabanwa","Kitembe","Migamba","Nsonga","Sooba"],
  "Migina (Kazo)": ["Akatongore","Kikoni","Migina"],
  "Migongwe": ["Kigorani","Kisoira","Kyankunyule","Migongwe"],
  "Migyera Town Council": ["Migyera Central Ward","Migyera East Ward","Migyera North Ward","Migyera West Ward"],
  "Miirya": ["Bigando","Isimba","Kiguulya"],
  "Mijwala": ["Kanoni","Kidokolo","Lwabaana","Nsoga"],
  "Minakulu": ["Adel","Kuluabura","Opuk"],
  "Minakulu Town Council": ["Aceno Ward","Adel Ward","Atego Ward","Atek Ward","Okule Ward","Omolo Ward"],
  "Mirambi": ["Kuka","Mirambi","Njanja"],
  "Mitete": ["Kasambya","Manyama","Miteete"],
  "Mitima": ["Kyebando","Lwentale","Mitima"],
  "Mitooma": ["Ijumo","Katunda","Mushunga","Nkinga","Nyakishojwa"],
  "Mitooma Town Council": ["Ward I","Ward Ii","Ward Iii","Ward Iv"],
  "Molo": ["Kidoko","Kipangor","Molo","Tuba"],
  "Moruita": ["Karinga","Komoret","Moruita"],
  "Morukakise": ["Akeit","Ariet","Kaler","Kamodokima","Kokodu","Morukakise","Olilim"],
  "Morukatipe": ["Angolol","Aputiri","Morukatipe","Nyalakot"],
  "Morulem": ["Adea","Akwangagwel","Angolebwal","Aremo","Katabok East","Katabok West"],
  "Morungatuny": ["Aboket","Aita","Corner Stone","Morungatuny","Ogangai","Ojukot","Omodoi"],
  "Morungole": ["Lokwakaramoe","Morungole","Usake"],
  "Moyo": ["Afoji","Eria","Logoba","Opi","Vura"],
  "Moyo Town Council": ["Besia Ward","Celecelea Ward","Central Ward","Elenderea Ward"],
  "Moyok": ["Kabelyo","Kapchesimet","Kaplekepsoi","Kapyatei","Moyok"],
  "Mpara": ["Kibaale","Kiryabyooma","Nyakatoma","Rwahunga"],
  "Mpara Town Council": ["Bugido Ward","Kisambya Ward","Mpara Ward","Musanju Ward","Nsondaitano Ward"],
  "Mparo Division": ["Bwikya Ward","Kicwamba Ward","Kyentale Ward","Nyakambugu Ward"],
  "Mparo Town Council": ["Central Ward","Kangodo Ward","Sindi Ward"],
  "Mpasaana": ["Binikira","Bujaaja","Mpasana","Rwamata"],
  "Mpatta": ["Kabanga","Kiyanja","Mpatta","Mubanda","Mugomba","Nakalanda","Ttaba"],
  "Mpeefu": ["Rubirizi","Rwabaranga"],
  "Mpeefu Ya Sande Town Council": ["Buligira Ward","Kurukuru Ward","Mpeefu Central Ward","Mugyenza Ward","Nyamukara Ward"],
  "Mpenja": ["Golola","Kakomo","Kanziira","Kiriri","Maseruka","Mpogo","Ngeribalya","Nkoma"],
  "Mpigi Town Council": ["Bumoozi Ward","Kafumu Ward","Kakoola Ward","Konkoma Ward","Kyali Ward","Lwanga Ward","Maziba Ward","Ward A","Ward B","Ward C","Ward D"],
  "Mpondwe/lhubiriha Town Council": ["Bwera Ward","Kabuyiri Ward","Kambukamabwe Ward","Kyambogho Ward","Mpondwe Ward","Nyabugando Ward","Nyakahya Ward","Nyamambuka Ward","Rusese Ward"],
  "Mpumudde": ["Buyaga","Mpumudde","Nsiika","Rwamabara"],
  "Mpunge": ["Lulagwe","Mbazi","Mpunge","Ngombere"],
  "Mpungu": ["Buremba","Mpungu","Muramba","Ngaara"],
  "Mpungwe": ["Buyere","Maina","Muggi","Wairama","Wamulongo"],
  "Mubuku Town Council": ["Kikura Ward","Kisojo Ward","Mubuku Central Ward"],
  "Muchwini": ["Akara","Pajong","Yepa"],
  "Muchwini East": ["Ogwapoke","Okol","Pubech"],
  "Muchwini West": ["Bura","Pachua","Pudo"],
  "Muduma": ["Bulerejje","Jjeza","Lugyo","Magala","Malima","Mbazzi","Tiribogo"],
  "Mugarama": ["Imara","Kezimbira","Kituuma","Mugarama"],
  "Mugiti": ["Bukaligwoko","Bunamwera","Mugiti","Nasenyi","Nyanza"],
  "Mugoye": ["Bbeta","Kagulube","Kayunga"],
  "Mugusu": ["Kiraaro","Kyezire","Nyabuswa"],
  "Mugusu Town Council": ["Bulinda Ward","Burungu Ward","Kibede Ward","Kiboha Ward","Kiseru Ward"],
  "Muhanga Town Council": ["Butare Ward","Highland Ward","Muhanga Ward","Nyakabungo Ward","Rutare Ward"],
  "Muhokya": ["Kahendero","Kibiri","Kirembe","Muhokya","Nyamirami"],
  "Muhorro": ["Kabuga","Kasoga","Kyesamire","Nyamacumu"],
  "Muhorro Town Council": ["Butumba Ward","Kapyemi Ward","Karuswiga Ward","Kisweeka Ward","Nyamiti Ward","Nyanseke Ward"],
  "Mukhuyu": ["Bunanyama","Buteteya","Butinduyi","Buwambwa","Mufutu"],
  "Muko": ["Butare","Ikamiro","Kaara","Kabere","Karengyere","Kyenyi","Nyarurambi"],
  "Mukongoro": ["Achunat","Kabura","Kaderin","Kajamaka","Kapuwai","Mukongoro","Ogosoi","Oidon","Ojinga","Okudu","Oladot","Oleico","Omerein","Osopotoit"],
  "Mukono Division": ["Ggulu Ward","Namumira/anthony Ward","Nsuube/kauga Ward","Ntawo Ward"],
  "Mukoto": ["Bufuma","Bunamulunyi","Luwa Town Board","Maalo","Makutano","Siakalo"],
  "Mukuju": ["Akoret","Akworot","Akworoto","Atiri","Kajarau","Mukuju"],
  "Mukungwe": ["Bugabira","Bulayi","Kalagala","Katwadde","Matanga","Samaliya"],
  "Mukura": ["Agogomit","Ajeluk","Akubui","Kees","Kumel","Madoch"],
  "Mukura Town Council": ["Adul Ward","Doyoro Ward","Mukura Ward","Okunguro Ward"],
  "Mulagi": ["Bumbiri","Kigando (masodde)","Kiteredde","Kiwaguzi","Luwawu"],
  "Mulanda": ["Chawolo","Korobudi","Mulanda","Pasindi"],
  "Munarya": ["Chebonet","Kakwateny","Munarya","Ngasire","Rakon"],
  "Munkunyu": ["Kabingo","Kacungiro","Kitsutsu","Nyakatonzi"],
  "Muntu": ["Abarler","Kabangala","Muntu","Nakatiti","Odiak"],
  "Muramba": ["Gisozi","Muramba","Sooko"],
  "Murora": ["Chahafi","Chibumba"],
  "Mutara": ["Bikungu","Bukongoro","Enshaka","Furuma","Kataho","Kyeibare","Mahwizi","Nyakihita","Ryakitanga"],
  "Muterere": ["Bululu","Kayogera","Kitumba"],
  "Muterere Towm Council": ["Busini Ward","Lyavala Ward","Mutanda Ward","Muterere East Ward","Nakasero Ward"],
  "Mutukula Town Council": ["Biwa Ward","Central Ward","Kasanvu Ward","Kozza Ward","Lwazi Ward"],
  "Mutumba": ["Buchimo","Lubango","Mwema"],
  "Mutumba Town Council": ["Bulule Ward","Hatumba Banja Ward","Lubira Ward","Mawa Ward","Mutumba North Ward","Mutumba South Ward"],
  "Mutunda": ["Kakwokwo","Kimogoro","Panyadoli"],
  "Mutushet": ["Kapkumolon","Kapnanunjiro","Kapterit","Kobelyo","Lwongon","Mutushet"],
  "Muwanga": ["Luswa","Muwanga","Nabwendo","Wabinyira"],
  "Muwangi": ["Bambala","Ddegeya","Kitwala","Muwangi"],
  "Muyembe": ["Bulako","Bumugoya","Bungwanyi","Buwagogo","Buyaka"],
  "Mwello": ["Agumit","Kisote","Mikiya","Mwello"],
  "Mwitanzige": ["Ijumangabo","Kyabusinge","Kyakuterekera","Mwitanzige","Rwamadongo"],
  "Mwizi (Mbarara)": ["Bushwere","Kigaaga","Rukarabo","Ryamiyonga"],
  "Myanzi": ["Kampiri","Kasaana","Kigalama","Myanzi"],
  "Myene": ["Acimi","Amwa","Myene","Oyoro","Zuma"],
  "Nabbongo": ["Bufukhula","Bufumbula","Bumasokho","Bunangaka","Buwakooli","Nabbongo"],
  "Nabiganda Town Council": ["Nabiganda Ward","Nakabi Ward","Nampologoma Ward","Namunswa Ward","Namuseru Ward","Nasemenye Ward"],
  "Nabigasa": ["Bethelehem","Kijejja","Kyansimbi","Nabigasa","Nakatoogo"],
  "Nabilatuk": ["Acegeretolim","Lokaala","Magoro","Moruangibuin","Nakobekobe","Natopojo"],
  "Nabingoola": ["Kabalungi","Kasasa","Kiteera","Kiyita"],
  "Nabingoola Town Council": ["Gwanika Ward","Kajumiro Ward","Kibaale Ward","Kitonzi Ward","Lwemivubo Ward","Nabingoola Ward"],
  "Nabiswa": ["Kabusule","Kajoko","Nabiswa","Nampiido"],
  "Nabiswera": ["Kalengede","Katuba","Kyamukonda","Kyangogolo","Mulonzi","Namaasa"],
  "Nabitanga": ["Ishara","Kabaale","Kirama","Kyambogo","Meeru","Nabitanga","Ntyazo"],
  "Nabitende": ["Bugono","Itanda","Kabira-Ituba","Kasambika","Nabitende","Naluko"],
  "Nabitsikhi": ["Bulutswala","Bumufuni","Bumusomi","Busanja","Buwasiba"],
  "Nabiwutulu": ["Dooba","Gabusogololo","Lugoba","Tunyi"],
  "Naboa": ["Bunyekero","Lupada","Naboa","Nangeye"],
  "Nabukalu": ["Bukubansiri","Butyabule","Isegero","Lwanika","Nkaiza","Wangobo"],
  "Nabukalu Town Council": ["Bubalya Ward","Bukyansiko Ward","Kalulu Ward","Kasita Ward","Luya Ward","Nabukalu Ward","Nakivamba Ward"],
  "Nabumali Town Council": ["Bukuwa Ward","Masikye Ward","Mungoma Ward","Nabumali Central Ward","Southern Ward","Wamwa Ward"],
  "Nabuyoga": ["Namwanga","Nyamalogo"],
  "Nabuyoga Town Council": ["Miganja Ward","Muwafu Ward","Nabuyoga Ward","Pawanga Ward"],
  "Nabwal": ["Amedek","Duol","Kodike","Nabwal","Naminit"],
  "Nabweru Division": ["Kawanda","Maganjo","Nakyesanja","Wamala"],
  "Nabweya": ["Bulobi","Bunakhayoti","Bunandutu","Bunatsumya","Bunyanga"],
  "Nabweyo": ["Budatu","Busini","Nabweyo"],
  "Nabwigulu": ["Nabirumba I","Nabirumba Ii","Nabwigulu","Namunyingi"],
  "Nadunget": ["Kaloe","Komaret","Kotaruk","Lokeriaut","Nadunget","Naitakwae","Nangorit"],
  "Nagojje": ["Kyajja","Nagojje","Nakibano","Waggala"],
  "Nagongera": ["Maundo","Namwaya","Okwira","Pokongo"],
  "Nagongera Town Council": ["Central Ward","Eastern Ward","Northern Ward","Southern Ward"],
  "Nairambi": ["Buwanga","Lukale","Luufu","Magyo","Namugombe"],
  "Najja": ["Busagazi","Gulama","Kisiimba","Kiyindi","Mawotto","Namatovu","Tukulu"],
  "Najjembe Division": ["Buvunya Ward","Buwoola Ward","Kabanga Ward","Kinoni Ward","Kitigoma Ward","Kizigo Ward","Nsakya Ward"],
  "Nakalama": ["Bukaye","Bukoona","Buseyi","Nakalama"],
  "Nakaloke": ["Kireka","Nambulu/kasanja","Namunsi"],
  "Nakaloke Town Council": ["Afya Ward","Fika Salama Ward","Kireka Ward","Mukunja Ward","Najja Ward","Nakaloke Ward","Rock Ward"],
  "Nakapelimoru": ["Kaileny","Longerep","Nakapelimoru Town Board","Nawii Iv","Thiwakol","Watakau","Watakau Central"],
  "Nakapiripirit Town Council": ["Katanga/township Ward","Lobulio/lomuu Ward","Lobuniet/lokona Ward"],
  "Nakaseke": ["Bulwadda","Kasagga","Kasambya","Kigegge","Kyamutakasa","Mifunya"],
  "Nakaseke Butalangu Town Counc": ["Bukoba Ward","Butalangu Ward","Bwetagiro Ward","Kyanya Ward"],
  "Nakaseke Town Council": ["Kivule Ward","Nakaseke Central Ward","Nakaseke East Ward","Nakaseke North Ward","Namirali Ward"],
  "Nakasenyi": ["Kabaale","Nakasenyi","Ntete"],
  "Nakasongola Town Council": ["Nakasongola Central Ward","Nakasongola East Ward","Nakasongola West Ward"],
  "Nakasozi": ["Bikko","Kaakibwa","Nakasengere","Nakasozi","Nakigga"],
  "Nakatsi": ["Bumukonya","Bumusenyi","Bunambatsu","Bushunya"],
  "Nakawa": ["Banda","Bugoloobi","Bukoto I","Bukoto Ii","Butabika","Itek","Kiswa","Kiwatule","Kyambogo","Kyanja","Luzira","Luzira Prisons","Mbuya I","Mbuya Ii","Mutungo","Nabisunsa","Naguru I","Naguru Ii","Nakawa","Nakawa Institutions","Ntinda","Upk","Upper Estate"],
  "Nakifuma-Naggalama Town Council": ["Bamusuuta-Rural Ward","Bandaali Ward","Bubiro Ward","Kigaga-Jomayi Ward","Makukuba Ward","Nabalanga Rural Ward","Naggalama A Ward","Naggalama B Ward","Nakanyonyi-Nabbale Ward","Nakifuma Ward","Nankulabye Ward"],
  "Nakigo": ["Bulubandi","Bunyama","Busowoobi","Kabira","Wairama"],
  "Nakisunga": ["Katente","Kiyoola","Kyabalogo","Kyetume","Namayiba","Namuyenje","Seeta-Nazigo","Wankoba"],
  "Nakitoma": ["Bujjabe","Kasozi","Kigweri","Njeru"],
  "Nalondo": ["Bumulekhwa","Butsema","Nalondo Butta","Wanga"],
  "Nalubwoyo": ["Agwenonywal","Alwala","Amolatar","Nalubwoyo","Ocamolum"],
  "Nalusala": ["Bugainza","Bugwagi","Bukirya","Bumausi","Bumongoti","Nabubolo","Nakibuyi"],
  "Nalutuntu": ["Gambwa","Kyakatebe","Kyanamugera","Nalutuntu"],
  "Nalwanza": ["Bumakhwa","Bumakita","Bumusi","Bumusi Upper","Bunango","Buwagiyu"],
  "Nam-Okora": ["Diete","Pugoda East","Pugoda West"],
  "Nam-Okora North": ["Kalabong","Onyala","Pagwok","Palabolo"],
  "Nama": ["Buliika","Kasenge","Katoogo","Mpoma","Namawojjolo","Namubiru"],
  "Namabasa": ["Bwana","Doko","Kolonyi","Namabasa","Salem"],
  "Namabya": ["Bumusomi","Buwasunguyi","Masaaka","Namunyali"],
  "Namaguli": ["Bugobbiro","Bulujewa","Kyesha","Nabweya"],
  "Namalemba": ["Idinda","Minani","Namalemba","Namunyumya"],
  "Namalu": ["Kokuwuam","Lokatapan","Namatata"],
  "Namanyonyi": ["Aisa","Nabweya","Namagumba","Nkoma"],
  "Namasagali": ["Bwiiza","Kasozi","Kisaikye","Namasagali"],
  "Namasale": ["Adagani","Aguludia","Bangladesh","Burakwana","Gozwe","Izigwe","Kikondo","Nabweyo","Olyaka"],
  "Namasale Town Council": ["Aweipeko Ward","Central Ward","Kayago Ward","Wabinua Ward"],
  "Namataba Town Council": ["Namagunga Annex Ward","Namagunga Ward","Namataba  A Ward","Namataba B Ward","Namataba Ward"],
  "Namayemba Town Council": ["Bukonde Ward","Gulimwoyo Ward","Isagaza Ward","Kafufu Ward","Kasule Ward","Namabugo Ward"],
  "Namayingo Town Council": ["Budidi Ward","Bulamba Ward","Namayingo Central Ward","Nambugu Ward","Nasinu Ward"],
  "Namayumba": ["Bbembe","Bukondo","Kanziro","Kitayita","Kyasa","Nakedde"],
  "Namayumba Town Council": ["Kyampisi Ward","Kyanuna Ward","Luguzi Ward","Luttisi Ward"],
  "Nambale (Iganga)": ["Bumboi","Bumutoto","Mooni","Muyanda","Mwira","Namalogo","Nambale","Nasuti"],
  "Nambieso": ["Acaba","Acwao","Anwangi","Aornga","Etekiber","Ojokdot"],
  "Namboko": ["Bumoyayo","Bumulika","Busukuya","Buwambingwa","Buwasiba","Buwasiba A"],
  "Namisindwa Town Council": ["Bumurundi Ward","Buwandyambi Ward","Buwasiba Ward","Buyaka Ward","Kimundu Ward","Namisindwa Ward"],
  "Namisuni": ["Gamatimbei","Kisekye","Lusaso","Nambekye","Namezi","Namisuni","Namudongo"],
  "Namitsa": ["Bukuto","Bulako","Bumululu Town Board","Butselitsi","Buwambwa A","Buwesa","Namitsa"],
  "Namokora Town Council": ["Central Ward","Katubbu Ward","Ladwoggi Ward","Wigweng Ward"],
  "Namugabwe": ["Bukahengere","Bumateba","Bumirisa","Buwangolo","Nabana","Namugabwe"],
  "Namuganga": ["Kayini","Kitale","Kituula","Namanoga","Namuganga"],
  "Namugondi Town Council": ["Buhoya Ward","Buhumi Ward","Bulumbi Ward","Namugondi Ward"],
  "Namugongo": ["Bugoda","Bugonza","Butege","Igulamubiri","Kanakamba","Nabikooli","Namukooge","Natwana"],
  "Namugongo Division": ["Kireka Ward","Kyaliwajjala Ward"],
  "Namungalwe": ["Bulumwaki","Mwendanfuko","Namungalwe","Namunkanaga","Namunkesu","Namunsaala","Nawansega"],
  "Namungo": ["Kasangula","Kisaana","Kiteete","Mpirigwa","Mugulu","Namungo"],
  "Namutumba": ["Ituba","Kigalama","Nakyeere","Namato","Nawampandu"],
  "Namutumba Town Council": ["Namutumba Central Ward","Namutumba North Ward","Namutumba South Ward"],
  "Namwendwa": ["Bugondha","Bulange","Bulogo","Isingo","Kinu","Kyeeya","Makoka","Ndalike"],
  "Namwendwa Town Council": ["Buluuya Ward","Bulyango Ward","Busejja Ward","Busimba Ward","Mission Ward"],
  "Namwiwa": ["Kiganda","Kiwanabuzi","Namwiwa","Saaka"],
  "Namwiwa Town Council": ["Bukaire Ward","Bulari Ward","Bunswezya Ward","Busereka Ward","Kanabugo Ward","Namwiwa Ward","Wangobo Ward"],
  "Nandere": ["Bulabya","Buluba","Katyaime","Mavungo","Nandere"],
  "Nangako Town Council": ["Khama Ward","Mukini Ward","Munkaga Ward","Mutsitsi Ward","Nangako Ward"],
  "Nangalwe": ["Bugobero","Bumufuni Ii","Nangalwe","Nekina"],
  "Nangoma": ["Bukwale","Lukunyu","Mizinda","Nangoma"],
  "Nangonde": ["Buwalira","Iwungiro","Kisega","Lwatama","Namakoko","Nangonde"],
  "Nankodo": ["Bukenye","Bwikomba","Kapyani","Nankodo"],
  "Nankoma": ["Isegero","Matovu","Namakoko","Nsono"],
  "Nankoma Town Council": ["Itakaibolu Ward","Masita Ward","Nakasita Ward","Namuntenga Ward","Nankoma Central Ward","Nankoma East Ward","Nawanago Ward","Nawango Ward"],
  "Nansana Division": ["Kazo Ward","Nabweru North Ward","Nabweru South Ward","Nansana 7/8 Ochieng Ward","Nansana East Ward","Nansana West Ward"],
  "Nansanga": ["Idudi A","Idudi B","Nansanga A","Nansanga B"],
  "Nansololo": ["Bulike","Buluya","Muhira","Nansololo","Nantamali"],
  "Napak Town Council": ["Kapopwa Ward","Lorengecore Ward"],
  "Napumpum": ["Itakwara","Lolito","Napupum Town Board"],
  "Narweyo": ["Buruuko","Karuuko","Kijwenge","Kyabeya","Masaka"],
  "Natirae": ["Angaro","Korinyang","Moru-Angamion","Namerisiya","Natirae"],
  "Nauyo Town Council": ["Bukasakya Ward","Kijja Ward","Napooli Central Ward","Napooli Lower Ward","Napooli Upper Ward","Wakhwaba Central Ward","Wakhwaba Lower Ward","Wakhwaba Upper Ward"],
  "Nawaikoke": ["Buhangala","Bupeni","Kyambaya","Namawa","Nsamule"],
  "Nawaikoke Town Council": ["Bugwabi Ward","Musiha Ward","Mwangha Ward","Nawaikoke Ward","Nombe Ward","Walyabira Ward"],
  "Nawaikona": ["Bukonte","Bulongo","Kivule","Nawaikona"],
  "Nawampiti": ["Bugomba","Buyoola","Nakiswiga","Nawampiti","Nawankompe"],
  "Nawandala": ["Bugongo","Kiwanyi","Kyendabawala","Namusiisi","Nawangaiza"],
  "Nawanjofu": ["Bingo","Bubbinge","Bugalo","Masanghe"],
  "Nawanyago": ["Bupadhengo","Nawantumbi","Nawanyago"],
  "Nawanyago Town Council": ["Bupadhengo Urban Ward","Nawantumbi Urban Ward","Nawanyago East Ward","Nawanyago West Ward"],
  "Nawanyingi": ["Bunyiro","Magogo","Nawanyingi"],
  "Naweyo": ["Kachekere","Kachonga","Kaiti","Nambale","Nasinyi","Naweyo"],
  "Nazigo": ["Bukamba","Katikanyonyi","Kimanya","Kirindi","Natteta","Nazigo","Nsiima"],
  "Nazigo Town Council": ["Kimanya Ward","Natteta Ward","Nazigo Ward"],
  "Ndagwe": ["Makondo","Mpumudde","Nanywa","Ndagwe"],
  "Ndaiga": ["Kamina","Kitebere","Ndaiga","Nyamasoga"],
  "Ndeija (Mbarara)": ["Kibare","Kongoro","Ndeija-Mulago","Nyakaikara","Rwensinga"],
  "Ndejje Division": ["Mutungo Ward","Ndejje Ward","Seguku Ward"],
  "Ndhew": ["Abar East","Abar West","Adolo","Oweko"],
  "Ndolwa": ["Butongole","Nabigaga","Nawantale/nabigaga","Ndolwa","Wesunire"],
  "Ndugutu": ["Butama","Kasanzi"],
  "Nebbi": ["Kalowang","Koch","Koch Upper","Omyer"],
  "Ngai": ["Acut","Akuca","Aramita","Kulakula","Okomo","Omach"],
  "Ngamba": ["Burambagira","Butolya","Kikyo","Ngamba"],
  "Ngandho": ["Buyamba","Gwase","Kirimbi","Nabisiki","Ngandho","Wandago"],
  "Ngando": ["Bukesa","Butende","Kasozi","Lugali"],
  "Ngarama": ["Burungamo","Kabaare","Kagaaga","Ngarama"],
  "Ngariam": ["Acanga","Adipala","Akisim","Amoru","Apeleun","Bisina","Kaikamosing","Nyero","Oedepus","Okuso","Olupe","Olupe Town Board","Osep","Osobut"],
  "Ngenge": ["Kabachiria","Kapkwot","Sikwo","Sosho"],
  "Ngetta": ["Akwiaworo","Anyangapuc","Anyomorem","Atego","Cura","Telela"],
  "Ngite": ["Kaleyaleya","Kanyangoma","Masule","Ngite"],
  "Ngogwe": ["Dungi","Kikwayi","Kiringo","Lubongo","Namulesa","Ndolwa"],
  "Ngoleriet": ["Kautakou","Nagule-Angolol","Naitakwae","Narengemoru","Nawaikorot"],
  "Ngoma (Nakaseke)": ["Kashenyi","Katuugo","Kigweri","Kiteyongera","Kizinga","Kyalusebeka","Mugyera","Mukoni","Ngoma","Nyakariro","Ruhara"],
  "Ngoma Town Council": ["Ngoma Central Ward","Ngoma East Ward","Ngoma North Ward","Ngoma West Ward"],
  "Ngora": ["Apama","Kalengo","Moruirion","Nyamongo","Oteteen","Tididiek"],
  "Ngora Town Council": ["Eastern Ward","Northern Ward","Southern Ward","Western Ward"],
  "Ngwedo": ["Avogera","Mubako","Muvule","Ngwedo","Nile"],
  "Njeru Division": ["Njeru East Ward","Njeru North Ward","Njeru South Ward","Njeru West Ward"],
  "Nkaakwa": ["Isunga","Kaingani","Lyaruhinda","Nkaakwa"],
  "Nkandwa (Kiboga)": ["Bugomolwa","Degeya","Kabuwuka","Kalyango","Kasoolo","Kiryankozi","Nakalama","Nkandwa","Ntiba"],
  "Nkanga": ["Birimbi","Bubare","Kanyegyero","Nyamirembe"],
  "Nkanja": ["Bujubuli","Kakoni","Kyabulikuya","Kyamagabu"],
  "Nkokonjeru Town Council": ["Bukasa Ward","Mulajje Ward","Nkokonjeru Ward"],
  "Nkoma": ["Bisozi","Kaberebere","Kidunduma","Mabale","Nkoma"],
  "Nkoma-Katalyeba Town Council": ["Buregyeya Ward","Kinyonza Ward","Mahane Ward","Nkoma Ward"],
  "Nkondo": ["Immeri","Iringa","Kigingi","Ndulya"],
  "Nkooko": ["Kamusenene","Kitegula","Kyabakamba","Lubumbo","Nsaana","Rutooma"],
  "Nkozi": ["Bukunge","Golo","Mugge","Nindye"],
  "Nkungu (Kazo)": ["Kagaramira","Kagira","Kajuzya","Kataraza","Nkungu","Nshunga"],
  "Nombe": ["Kyabandara","Musandama","Nombe","Nyakatoke","Nyamisingiri"],
  "North Division (Kisoro)": ["Amejei Ward","Bazaar Ward","Boma North","Boma South","Kabata Ward","Kamonyi Ward","Kapisinyang Ward","Kotyang Central Ward","Lochoto Ward","Logwangaita Ward","Mireriae Ward","Nayese Ward","Nyagashinge Ward","Okouba Ward","Ombaci Ward","Omolokonyo","Teremunga Ward","Triangle Ward"],
  "Northern": ["Camp Swahili Ward","Kichinjanji Ward","Madera Ward","Pioneer Ward"],
  "Northern Borough": ["Iu-Iu","Nabuyonga","Namakwekwe","Nkoma","North Central"],
  "Northern Division (Iganga)": ["Bugumba Ward","Buwanume Ward","Igamba Ward","Kamuli-Sabawali Ward","Kasoigo Ward","Mutukula Ward","Muwebwa Ward","Namisambya Ii Ward","Nkatu Ward","Nkono Ward"],
  "Nsambya": ["Kalagi","Katuugo","Kigabwa","Kigando","Kikonda","Kiyigikwa","Kyakabuga","Kyamusakazi","Mbaali","Mbogobbiri"],
  "Nsiika Town Council": ["Kicuzi Ward","Kyajura Ward","Nsiika Ward","Rugaba Ward"],
  "Nsinze": ["Bubago","Bunyagwe","Buwongo","Isegero","Nsinze"],
  "Ntandi Town Council": ["Bundimasoli Ward","Kahumbu Ward","Kirambi Ward","Mpulya Ward","Ntandi Ward","Nyabugesera Ward"],
  "Ntara (Kamwenge)": ["Kabale","Kichwamba","Kitonzi","Ntara","Nyakacwamba","Rugarama"],
  "Ntenjeru-Kisoga Town Council": ["Bugoye Ward","Kisoga Ward","Maziba Ward","Mpumu Ward","Ntenjeru-Ntanzi Ward","Ssaayi Ward","Terere Ward"],
  "Ntotoro": ["Bugando","Buhundu","Kanyansiri","Kinyankende","Ntotoro","Nyasoro"],
  "Ntunda": ["Katete","Kyabazaala","Namayuba","Ntunda"],
  "Ntungamo": ["Butare","Kahunga","Kikoni","Nyarubaare","Ruhoko"],
  "Ntungu": ["Ishingisha","Kimbugu","Ntungu","Omukakoreijo"],
  "Ntuusi Town Council": ["Bwogero Ward","Kamizire Ward","Kanoni Ward","Kashozikamwe Ward"],
  "Ntwetwe Town Council": ["Kigoma Ward","Kisojo Ward","Lwanjale Ward","Ndibata Ward","Ntuuti Ward","Ntwetwe Central Ward","Ntwetwe Upper Ward"],
  "Nwoya Town Council": ["Akago Ward","Ceke Ward","Labyei Ward","Ongom Ward"],
  "Nyabbani (Kamwenge)": ["Kamayenje","Nganiko","Nyarurambi","Rwenjaza","Rwenkubebe"],
  "Nyabihoko": ["Kanyampumo","Kiyaga","Nkongoro","Rukanga"],
  "Nyabirongo": ["Kaswa","Kijebere","Kisangi","Kyakasana","Nsanja","Nyabirongo"],
  "Nyabubare": ["Kahungye","Kigoma","Nkanga","Nyabubare","Nyarugote"],
  "Nyabuharwa": ["Kabirizi","Kaigoro","Kigando","Kinyantale","Mbale","Mugoma","Nyabuharwa","Nyakarongo"],
  "Nyabuhikye": ["Bwahwa","Kyentama","Rugoba"],
  "Nyabushenyi": ["Ihema","Kinoni","Mukinga","Nyabushenyi"],
  "Nyabutanzi": ["Kihura","Kimanya","Kyamasega","Nyabutanzi"],
  "Nyabwishenya": ["Nteko","Nyarutembe"],
  "Nyadri": ["Baria","Kimuru","Nyoroo","Pabura West","Pobura"],
  "Nyadri South": ["Midria","Miridri","Olevu","Robu"],
  "Nyahuka  Town Council": ["Bhamba Ward","Bundikahungu Ward","Bundikuyali Ward","Bundimulinga Ward","Kahungu Ward","Kasiri Ward","Nyahuka Ward","Simbya Nkuru Ward"],
  "Nyakabande": ["Gasiza","Gisorora","Rwingwe"],
  "Nyakabingo": ["Bukumbia","Kibalya","Kyambogho","Kyapa","Nyakabingo I"],
  "Nyakabirizi Division": ["Kibaare Ward","Mazinga Ward","Ntungamo Ward","Rwenjeru Ward","Ward I"],
  "Nyakagyeme": ["Kabwoma","Kahoko","Kigaaga","Kitimba","Masya","Nyakinengo","Rushasha"],
  "Nyakarongo": ["Katalemwa","Katikengeyo","Kisungu","Maberenga","Nyakarongo"],
  "Nyakashaka Town Council": ["Nyakashaka Ward","Nyakitoko Ward","Rwemoma Ward"],
  "Nyakashashara": ["Bijubwe","Kyakabunga","Nyakahita","Rurambira"],
  "Nyakatonzi": ["Kamaruli","Kisasa","Muruti","Nyamugasani"],
  "Nyakayojo": ["Bugashe Ward","Katojo Ward","Kichwamba Ward","Nyarubungo Ii Ward","Rukindo Ward","Rwakishakizi Ward"],
  "Nyakaziba Town Council": ["Kangarama Ward","Kitookye Ward","Nyakaziba Ward"],
  "Nyakinama": ["Chihe","Mbuga","Rwaramba"],
  "Nyakinoni": ["Kanyambeho","Karubeizi","Nyakikoni","Samaria"],
  "Nyakishana": ["Kabegaramire","Katinda","Kiramira","Rukondo","Rushayo","Rwanyamabare"],
  "Nyakishenyi": ["Bikongozo","Kacence","Kafunjo","Kahoko","Katonya","Murama","Ngoma","Nyarugando","Rwanyundo"],
  "Nyakisi": ["Enjeru","Kabatooro","Kafunda","Kagorra","Nyakisi","Rubango"],
  "Nyakitunda": ["Bugongi","Kihiihi","Nyakarambi"],
  "Nyakiyumbu": ["Bukangara","Kaghorwe","Katholu/katojo","Kayanja","Lyakirema","Muhindi","Nyakiyumbu"],
  "Nyakizinga": ["Kikani","Murambi","Muti","Nyakizinga","Rubirizi"],
  "Nyakwae": ["Kathebakume","Kobulin","Okimia","Opopongo","Oretha","Pupukamuya","Rogom"],
  "Nyakyera": ["Kataraka","Kiyoora","Ngoma","Ngomba"],
  "Nyakyera Town Council": ["Kagorora Ward","Kibingo Ward","Kiziiba Ward","Ngomba Ward"],
  "Nyamahasa": ["Alero","Laboke","Nanda","Nyamahasa"],
  "Nyamarebe": ["Bihanga","Kanyarugiri","Kyengando","Nyakabungo","Rushango","Ryabiju"],
  "Nyamarunda": ["Bujogoro","Kibogo","Kyanyi","Nyamarunda"],
  "Nyamarwa": ["Igoza","Kamondo","Kyakatwanga","Nyamarwa"],
  "Nyamirama": ["Kigarama","Mashaku","Ntungwa","Nyakashure","Nyarurambi","Rushaka"],
  "Nyamitanga": ["Katete Ward","Ruti Ward"],
  "Nyamukana Town Council": ["Buhanama Ward","Nyongozi Ward"],
  "Nyamunuka Town Council": ["Itereero Ward","Kakiika Ward","Katoomi Ward","Kyabashenyi Ward","Kyaruhuga Ward","Nyamunuka Central Ward"],
  "Nyamuyanja": ["Ibumba","Katanoga","Kigyendwa","Nyamuyanja"],
  "Nyamwamba Division": ["Kanyangeya Ward","Kihara Ward","Kisanga Ward","Nyakasanga I Ward","Nyakasanga Ii Ward","Nyakasanga Iii Ward","Rukooki Ward","Scheme Ward"],
  "Nyamweeru": ["Bigungiro","Bwayu","Kaceenaga","Kyokyezo","Nangara","Nyamweru"],
  "Nyanga": ["Bukorwe","Kamahe","Nkunda","Nyanga"],
  "Nyangahya Division": ["Kikwanana Ward","Kiryanga Ward"],
  "Nyangole": ["Achilet","Iyikango","Iyokango","Nyakesi","Nyangole"],
  "Nyankwanzi": ["Kaitanyana","Kamazima","Kibale","Kisansa","Nyamyezi"],
  "Nyantonzi": ["Kajura","Kasenene","Kimanya","Nyantonzi","Rwempisi"],
  "Nyantungo": ["Buraro","Ihamba","Kanyandahi","Kibira","Kyamutasa","Mabaale","Mabwonwa","Ntuntu","Ruhoko"],
  "Nyapea": ["Abeju","Mundhel","Ombila","Osoye","Oyeyo"],
  "Nyaravur": ["Angal Lower","Angal Upper","Mbaro East","Mbaro West","Pamora Lower"],
  "Nyarubuye": ["Busengo","Karambi"],
  "Nyarushanje": ["Bunono","Burora","Bwanga","Ibanda","Ihunga","Kisiizi","Ndago","Nyabushenyi","Ruyonza"],
  "Nyarusiza": ["Gasovu","Gitenderi","Mabungo","Rukongi"],
  "Nyarutuntu": ["Karambi","Kizaara","Nyaburiza"],
  "Nyendo/senyange": ["Nyendo","Senyange"],
  "Nyenga Division": ["Buziika (b)","Kabizzi","Namabu","Nyenga","Ssunga","Tongolo"],
  "Nyero": ["Aguurut","Ariet","Kalapata","Kodike","Moruikara","Moruita","Nyero","Olilim","Omatakiria"],
  "Nyimbwa": ["Bajjo","Buvuma","Kalule","Kiyanda","Nakatonya","Ssambwe"],
  "Nyondo": ["Bubetsye","Bufukhula","Nabumali","Nyondo"],
  "Nyundo": ["Bubuye","Nyundo"],
  "Obalanga": ["Alupe","Alwenya","Labira","Obalanga","Opot"],
  "Obiba": ["Ayiko","Baranya","Draju","Lamila","Lega","Nigo","Nyogo","Obica","Rikabu"],
  "Oboliso": ["Kinomu","Nyakoi","Oboliso","Oboliso Komolo","Omotoi"],
  "Oboliso I": ["Boliso","Boliso  I","Limoto","Ogoria"],
  "Obongi Town Council": ["Kilaaming Ward","Lionga Ward","Ngungu Ward","Rooma Ward","Yakinemiji Ward"],
  "Obutet": ["Amoni","Gogonyo","Obutete","Opeta"],
  "Ocelakur (Kaberamaido)": ["Ipenet","Ocelakur","Sangai"],
  "Ochero": ["Anyalam","Kagaa","Swagere"],
  "Ochero Town Council": ["Kagaa Ward","Okeratok Ward","Omodoi Ward"],
  "Ocokican": ["Abaango","Ocokican","Ocomai","Omodoi"],
  "Oculoi": ["Abari","Adamasiko","Ajonyi","Oculoi","Ojom"],
  "Odek": ["Akoyo","Dino","Lamola","Olam","Opong","Palaro"],
  "Odravu": ["Arumadri","Bangatuti","Bijo","Chema","Ibabiri","Ludara","Machule","Moju","Moli","Mugoju","Olukenga","Onoko","Rimbe","Wolo"],
  "Odravu West": ["Abara","Aji","Ambelechu","Aniti","Aranga","Ayuri","Godria","Ikufe","Lui","Nyoko","Oluba","Otakua","Pakayo"],
  "Odupi": ["Azaapi","Imvepi","Lugbari","Okavu","Ombokoro","Orivu","Otumbari"],
  "Odwarat": ["Agu","Angod","Kopege","Ngora","Odwarat","Omaditok"],
  "Offaka (Arua)": ["Adraa","Elibu","Ocebu","Oribu"],
  "Ofua": ["Bacere","Ilinyi","Ofua Central","Opi","Subbe","Tianyu"],
  "Ogili": ["Akworo","Apyeta","Lugwar","Ogili"],
  "Ogoko (Arua)": ["Ayavu","Enyio","Olali","Pamvara","Yachi"],
  "Ogolai": ["Abeko","Akore","Ococia","Odepe","Ogolai"],
  "Ogom": ["Gulnam","Kiteny","Ogom","Otong","Owelle"],
  "Ogooma": ["Aligoi","Atekwa","Kamenya","Komolo","Odipai","Ogooma","Okanyapurio","Ominai"],
  "Ogor": ["Anyalima","Atangwata","Oluro","Omwonylee"],
  "Ogur": ["Adwoa","Akangi","Akano","Akor","Aler","Alwala","Apoka","Bungmiciri","Ogur","Okwaloamara"],
  "Ogwette": ["Acan Pii","Ajur","Alir","Amunga","Atira","Ogwete"],
  "Ogwolo (Kaberamaido)": ["Angolitok","Kaberpila","Ogwolo"],
  "Ojwina": ["Alito Camp","Bar-Ogole","Blue Corner","Ipito-Aweno","Jinja Camp","Kakoge","Ober","Obutowello","Odokomit"],
  "Okile": ["Murem","Ogak","Ogerai","Okile"],
  "Okokoro Town Council": ["Dranzipi Ward","Lamila Ward","Poo Ward"],
  "Okollo (Arua)": ["Ajibu","Baito","Okollo","Onyomu"],
  "Okore": ["Adugulu","Aminit","Keelim","Okore","Opiananya","Orimon","Pakwi","Rwatama"],
  "Okulonyo": ["Angerepo","Okocho","Okuliak","Okulonyo","Omukuny"],
  "Okungur": ["Agonga","Airabet","Akodokodoi","Amootom","Aridai","Odiding"],
  "Okwalongwen": ["Abalang","Adagnyeko","Akwanga","Aluti","Okwalongwen"],
  "Okwang": ["Abongower","Arwotngo","Olworngu","Opejal"],
  "Okwerodot": ["Abong Jok","Abongo Jok","Adel-Logo","Ayamo","Ayara","Lelakot","Lwala","Obutu","Okwerodot"],
  "Okwongodul": ["Ageni","Aneralibi","Anyacoto","Apenyoweo","Okwongodul"],
  "Oleba": ["Adakada","Azipi","Bango","Central","Ewazoku","Nyatika","Robu","Tabia","Wodu"],
  "Oli River": ["Kenya","Pangisa","Tanganyika"],
  "Olilim": ["Alula","Anepkide","Angetta","Gotojwang","Olilim"],
  "Olok": ["Apapa","Ngalwe","Odwarat","Olok"],
  "Olufe": ["Kamaka","Kimiru","Mundru","Otravu"],
  "Oluko": ["Ambeko","Anipi","Bunyu","Nyio","Ombokoro","Onzivu","Turu","Wandi","Yabiavoko"],
  "Oluvu": ["Gbulukua","Godria","Michu","Motino","Nyamio","Ombachi"],
  "Olwa": ["Agwanjua","Awelu","Ayola","Jalam","Olwa"],
  "Omel": ["Apem","Boke","Bulkur","Kuru","Lakwela","Ogwari"],
  "Omiya Pacwa": ["Laita","Lakwa","Lojim","Lomoi"],
  "Omiya-Anyima": ["Melong","Ogili","Panyum","Panyum Melong","Panyum Pela","Pella"],
  "Omiya-Anyima West": ["Akobi","Palameny","Palwo","Para"],
  "Omodoi": ["Adungulu","Akoboi","Aparisa","Atirir","Omodoi"],
  "Omoro": ["Abukamola","Baropiro","Baya","Oculokori","Omarari"],
  "Omoro Town Council": ["Lagude Ward","Laminlyeka Ward","Opit Central Ward","Parwech Ward"],
  "Omot": ["Atece","Awonodwe","Barima","Opari"],
  "Omugo": ["Angazi","Anyufira","Bura","Duku","Ndaapi","Obi","Owayi","Yiddu"],
  "Ongako": ["Kal","Lwala","Olabo","Onyona"],
  "Ongino": ["Aakum","Akolitorom","Ceele","Kabwangasi","Kachaboi","Kachelakweny","Kapasak","Kapolin","Kareu","Morupeded","Ongino","Oseera"],
  "Ongongoja": ["Aketa","Aketa Town Board","Akomotukoi","Milmil","Oburatum","Obwobwo","Okuda","Ongatunyo","Ongongoja"],
  "Ongongora": ["Dokolo","Ocakai","Oelai","Ogongora","Olele","Onyeba"],
  "Opali": ["Acan Oryema","Adonyimo","Agweng","Akuriluba","Opali","Otira"],
  "Opara": ["Lalem","Lulai","Omee","Palukere","Pawel","Pukumu"],
  "Opopongo": ["Katala","Kopua","Nuthu","Opopongo"],
  "Opot Town Council": ["Agule Ward","Kakoda Ward","Kalengo Ward","Kalina Ward","Nyaguo Ward","Okito Ward","Opot Ward","Oswara Ward"],
  "Opwateta": ["Kadesok","Kapuwai","Okaracha","Opwateta"],
  "Orapwoyo": ["Binya","Dawa","Laminobong","Lukwor","Ogwari","Oryang"],
  "Oriamo": ["Abalang","Apele","Ongolangol","Oriamo","Oryamo"],
  "Orom": ["Gule","Karakelet","Lolia","Lolwa","Lunganyura"],
  "Orom East": ["Akurumo","Katwotwo","Okuti"],
  "Orum": ["Abongorwot","Alangi","Anepmoroto","Ating"],
  "Orungo": ["Adakun","Amecha","Moruinera","Omoratok","Orungo","Owangai"],
  "Osia": ["Kagwara","Katerema","Osia","Umeme"],
  "Osukuru": ["Abwanget","Amagoro","Osukuru","Ticaf"],
  "Otce": ["Alimo","Ebeso","Eremi","Pajakiri","Pamoyi"],
  "Otuboi (Kaberamaido)": ["Amoru","Kaberkole","Kadie","Lwala","Opiltok"],
  "Otuboi Town Council (Kaberamaido)": ["Abermunyu Ward","Abia Ward","Central Ward","Kadie Ward"],
  "Otuke Town Council": ["Alai Ward","Barodugu Ward","Oget Ward","Olec Ward"],
  "Otwal": ["Acokara","Ader","Amukugungu","Anyomolyec","Okii","Wanglobo"],
  "Ovujo Town Council": ["Otravu Ward","Ovujo Central Ward","Ovujo South Ward"],
  "Owalo": ["Kiteny","Lugore","Pokogali"],
  "Owoo": ["Kulukeno","Oitino","Pabwo","Paminano","Pugwinyi"],
  "Oyam Town Council": ["Eastern Ward","Western Ward"],
  "Pabbo": ["Gaya","Labala","Pabbo Kal","Palwong","Parubanga"],
  "Pabbo Town Council": ["Layik Ward","Luzira Ward","Pabbo Central Ward"],
  "Pachara": ["Alere","Jihwa","Marindi","Omi","Unna"],
  "Pachwa": ["Igayaza","Kyabasara","Kyakabanda","Pachwa"],
  "Pader": ["Kilak Corner","Ogwil","Ongany","Tyer"],
  "Pader Town Council": ["Acoro Ward","Lagwai Ward","Luna Ward"],
  "Padibe East": ["Alaa","Lawok","Panyinga","Wangtit"],
  "Padibe Town Council": ["Atwol Ward","Gangdyang Ward","Kamama Ward","Kuluyee Ward","Mura Ward"],
  "Padibe West": ["Lagwel","Madi Agweng","Madi-Kiloch"],
  "Padwot": ["Mvura","Mvura West","Olago","Olago North"],
  "Pager Division": ["Green Land Ward","Pager Ward A","Pager Ward B","Pongdwongo Ward"],
  "Paibona": ["Acutomer Gem","Ayeri","Bolipii","Tugu"],
  "Paicho": ["Atoo Hill","Kal-Alii","Kal-Alii B","Kal-Umu","Kalumu","Laban","Laminto","Pagik"],
  "Paidha": ["Amei","Cana","Kaya","Otheko"],
  "Paidha Town Council": ["Central Ward","Dwonga Ward","Nyibola Ward","Omua  Ward","Oturgang Ward","Zingili Ward"],
  "Paimol": ["Mutto","Ngora","Pacabol","Taa"],
  "Paiula": ["Lamogi","Ogago","Paiula","Palwo"],
  "Pajule": ["Amoko","Oryang","Otok","Palenga"],
  "Pajule Town Council": ["Awalmon Ward","Gwili Ward","Latuturu Ward","Pagol Ward"],
  "Pajulu": ["Adalafu","Alivu","Driwala","Etori","Komite","Nyaracu","Orugbo","Pokea","Yivu"],
  "Pajwenda Town Council": ["Amor Ward","Bira Ward","Pajwenda Ward","Panyirenja Ward"],
  "Pakanyi": ["Kyakamese","Kyakamese Central","Kyakamese East","Kyakamese West","Kyangamyoyo"],
  "Pakele": ["Boroli","Fuda","Ibibiaworo","Lewa","Meliaderi","Melijo","Pereci"],
  "Pakele Town Council": ["Ataboo Ward","Central Ward","Nyivura Ward","Pereci Ward"],
  "Pakwach": ["Atyak","Mukale","Olyejo","Paroketo"],
  "Pakwach Town Council": ["Amor  East Ward","Amor  West Ward","Povungu Central Ward","Povungu East Ward","Povungu West Ward"],
  "Palabek Abera": ["Abera","Cubu","Pawena"],
  "Palabek Nyimur": ["Aywee","Burpong","Kadomera","Padwat","Paracelle","Pece","Warigo"],
  "Palabek-Gem": ["Anaka","Gem","Lagura","Moroto","Patanga","Patanga East"],
  "Palabek-Kal": ["Ayuu Alali","Kal","Labigiryang","Lamwo"],
  "Palam": ["Acanga","Ngariam","Odoot","Okwamomwar","Olilim","Palam"],
  "Palaro": ["Awich","Labworomor","Labworumor","Mede","Ocetoaka","Ongedo","Oroko"],
  "Palenga Town Council": ["Gudu Ward","Ibar Ward","Iraa Ward","Oduku Ward","Odyak Ward"],
  "Pallisa": ["Akadot","Kaboloi","Kagoli"],
  "Pallisa Town Council": ["East  Ward","Hospital Ward","Kagwese Ward","Kaucho Ward","West Ward"],
  "Paloga": ["Bungu","Paloga","Pawaja"],
  "Palorinya": ["Paalujo","Palorinya","Ubbi","Yenga"],
  "Paminyai": ["Got Ringo","Lalar","Langol","Pangur"],
  "Pandwong Division": ["Alango Ward","Guu Ward A","Guu Ward B","Pandwong Ward"],
  "Panyangara": ["Lodera","Rikitae","Rikitae East","Rikitae West"],
  "Panyango": ["Andibo","Pacego","Pacer","Padoch","Pakia","Pamitu","Pumvuga"],
  "Panyimur": ["Amoropii","Boro","Ganda","Kivuje","Lwala","Marama","Nyakagei","Nyakiro"],
  "Panyimur Town Council": ["Angumu Ward","Central Ward","Ganda Ward","Nyakagei Ward"],
  "Parabongo": ["Pabala","Pacer","Pakor","Parumu"],
  "Paranga": ["Ajikoro","Anguruma","Etoko","Obi","Retriko"],
  "Parombo": ["Ossi Central","Ossi East","Ossi West","Padel North","Padel South","Padel West"],
  "Parombo Town Council": ["Nyarugalo Ward","Parwo East Ward","Parwo West Ward"],
  "Patiko": ["Kal","Pawel"],
  "Patongo": ["Kal","Lakwa","Lukwangole","Odongkiwinyo"],
  "Patongo Town Council": ["Akomo Ward","Forest Ward","Oporot Ward","Pece Ward"],
  "Pawor (Arua)": ["Ndavu","Olyevu","Panduku","Parabok"],
  "Paya": ["Barinyanga","Nawire","Paya","Sere"],
  "Pece": ["Labourline","Pawel","Tegwana","Vanguard"],
  "Petete": ["Kachabali","Kachocha","Kapunyasi","Manyowe","Petete","Sidanyi"],
  "Petta": ["Mbula","Pakoi","Petta","Ramogi"],
  "Pingire": ["Akumoi","Odapakol","Okidi","Pingire"],
  "Pogo": ["Ceri","Ogwera","Olinga","Otorokume"],
  "Pokworo": ["Janamorwinyo","Lobodegi","Oceke","Owoi","Pokwero","Pokwero East"],
  "Porogali": ["Alima","Awee","Dure","Lamin Nyim","Latayi","Latigi"],
  "Poron": ["Kaeselem","Kumuturunyo","Poron"],
  "Potika": ["Ajukuku","Aringa","Pawach","Potika"],
  "Pukony": ["Laban","Oguru","Otege","Wilul"],
  "Pukor": ["Kal Angore","Kineni","Olam","Pukor"],
  "Puranga": ["Agwel","Apwor","Laminajiko","Laminocwida","Odum","Oret"],
  "Purongo": ["Pabit","Paromo","Patira","Pawatomero"],
  "Purongo Town Council": ["Bunga Ward","Kibar Ward","Lawora Ward","Tangi Ward"],
  "Puti-Puti": ["Budabula","Mpongi","Nagule","Puti-Puti"],
  "Putti": ["Buloki","Nabiku","Nabitende","Putti","Tiira"],
  "Ragem": ["Nyakumba","Ragem Lower","Ragem Upper"],
  "Railways": ["Ayago","Baronger","Railway Quarters","Te-Mogo"],
  "Rakai Town Council": ["Katuntu Ward","Kibona Ward"],
  "Rengen": ["Kodokei","Kotyang","Lokadeli","Lokorein","Moruitit","Rengen Town Board"],
  "Rhino Camp (Arua)": ["Anipi","Awuvu","Bandili","Eramva","Gbulukuatuni","Manago"],
  "Rigbo (Arua)": ["Aliba","Kwili","Luba","Ocea","Odoi","Odubu"],
  "Riwo": ["Aralam","Chepsoykei","Kapkware","Riwo"],
  "Romogi": ["Baringa","Bidibidi","Chabili","Eyete","Locomgbo","Onoko","Swinga"],
  "Rubaare": ["Kagugu","Nyanga","Nyarwanya","Omungyenyi"],
  "Rubaare Town Council": ["Akatojo Ward","Kagango Ward","Kyabukuju Ward","Nyamurindira","Rukiiri","Rweimiriro Ward"],
  "Rubaga Division": ["Busega","Kabowa","Kasubi","Lubya","Lungujja","Mutundwe","Najjanankumbi I","Najjanankumbi Ii","Nakulabye","Namirembe","Nateete","Ndeeba","Rubaga"],
  "Rubanda Town Council": ["Kigyeyo Ward","Nyakabungo Ward","Nyaruhanga Ward","Nyarurambi Ward"],
  "Rubaya (Kabale)": ["Bunenero","Buramba","Butenga","Itara","Karujanga","Kibuga","Kitooma","Musamba","Ruburara","Ruhunga","Rushozi","Rwanyena"],
  "Rubengye": ["Nyakahita","Rubengye"],
  "Rubindi": ["Bitsya","Kabare","Kariro","Karwesanga(rugaaga)","Nyamiriro","Rwamuhiigi"],
  "Rubindi-Ruhumba Town Council": ["Kabare Ward","Karuhama Ward","Rubindi Central Ward"],
  "Rubirizi Town Council": ["Kabete Ward","Kasarara Ward","Ndekye Ward","Nyakasharu Ward"],
  "Rubona Town Council": ["Central Ward","Southern Ward","Western Ward"],
  "Rubongi": ["Kidera","Panyangasi","Rubongi"],
  "Ruborogota": ["Karama","Kyamusoni","Nshenyi","Ruborogota","Rwangunga"],
  "Rubuguri Town Council": ["Kashija Ward","Nombe Ward","Nyabaremura Ward","Rushaga Ward"],
  "Rugaaga": ["Kabaare","Kashojwa","Kiryaburo","Kyampango","Kyarubambura","Nyabubaare","Rwangabo"],
  "Rugando (Mbarara)": ["Kitunguru","Mirama","Nyabikungu","Nyakabaare","Nyarubungo"],
  "Rugarama (Ntungamo)": ["Kagongi","Katungamo","Ngomba","Nyakabungo","Nyakarama North","Nyakarama South","Nyakashoga","Rugarama"],
  "Rugarama North": ["Kajumbajumba","Kakanena","Kamahuri","Kyafoora"],
  "Rugashari": ["Buhumuliro","Bweranyange","Izahuura","Kanaaba","Kibaanda","Ndeeba","Rugashari","Yorudan"],
  "Rugendabara-Kikongo Town Council": ["Burambira Ward","Kihogo Ward","Kikongo Ward","Kyangwale Ward","Rugendabara Ward"],
  "Rugombe Town Council": ["Butara Ward","Kisangi Ward","Mihondo Ward","Nyamabuga Ward","Rugombe Ward"],
  "Rugyeyo": ["Kashojwa","Katungu","Kayungwe","Kitojo","Mishenyi","Nyarurambi"],
  "Ruhaama": ["Igurwa","Katojo","Ruhaama","Rwamwire","Rwengoma"],
  "Ruhaama East": ["Kahenda","Kishami","Kishami A","Kishami B","Mitooma","Rwemiriro"],
  "Ruhiira Town Council": ["Migyera Ward","Nyakamuri Ward","Ruhiira Northern Ward","Ruhira Central Ward"],
  "Ruhija": ["Buhumuriro","Kashekyera","Kitojo","Kiyebe","Ntungamo"],
  "Ruhinda": ["Burombe","Kicwamba","Ndere","Nyakitabire","Nyarwimuka","Rwamugoma"],
  "Ruhumuro": ["Bugaara","Burungira","Nyeibingo","Ruhumuro"],
  "Rukiri": ["Bwenda","Katembe","Kigunga","Mabona","Mpasha","Nyarukiika"],
  "Rukoki": ["Bughalitsa","Buhaghura","Kigoro I"],
  "Rukoni East": ["Kanyerere","Kihanga","Kyamwasha","Kyamwasha A","Kyamwasha B","Nyakibaare"],
  "Rukoni West": ["Nyakabaare","Rukoni"],
  "Rupa": ["Kapwaata","Lobuneit","Nakadeli","Nakiloro","Pupu","Rupa"],
  "Rurehe": ["Rurehe South","Rutooma","Rwanja West","Ryengyerero"],
  "Rushango Town Council": ["Itabyama Ward","Rushango Ward"],
  "Rushasha": ["Ihunga","Mirambiro","Rushasha","Rwantaha"],
  "Rushere Town Council": ["Akatongore Ward","Mugore Ward","Nshwerenkye Ward","Nswereempango Ward","Rushere Ward"],
  "Ruteete (Kabarole)": ["Kinyarwanda","Kyamukoka","Nyakasheema","Rubona","Rurama","Ruteete","Rwaihamba"],
  "Rutenga": ["Katojo","Mafuga","Muramba"],
  "Rutookye Town Council": ["Central Ward","Kibare Ward","Nyakatsiro Ward","Sanga Ward"],
  "Rutoto": ["Bururuma","Kashenyi","Ndangaro","Nyabubare","Rwemitagu"],
  "Ruyanga": ["Kajaho","Katojo","Nshungezi","Rutooma","Ruyanga"],
  "Ruyonza": ["Karwenyi","Katiirwe","Kijongobya","Kiremba","Kishagazi"],
  "Rwabyata": ["Kansira","Kikooge","Nakayonza","Nalukonge","Namiika"],
  "Rwamabondo Town Council": ["Ibaare Ward","Kibaruko Ward","Rwamabondo Ward"],
  "Rwamucucu": ["Burime","Ibumba","Kitojo","Noozi","Nyakagabagaba","Nyarurambi"],
  "Rwanjogyera": ["Mpikye","Rukungiri","Rutunga","Rwakasasira","Rwanjogyera"],
  "Rwanyamahembe": ["Kakyerere","Katyazo","Mabira","Rwebishekye"],
  "Rwashamaire Town Council": ["Central Ward","Kakiika Ward","Omukimwani Ward","Western Ward"],
  "Rwebisengo": ["Harukoba","Kiranga","Majumba","Makondo","Mukimba"],
  "Rwebisengo Town Council": ["Rwebishengo East Ward","Rwebishengo North Ward","Rwebishengo South Ward","Rwebishengo West Ward"],
  "Rweibogo-Kibingo Town Council (Mbarara)": ["Kibingo Ward","Rweibogo Ward"],
  "Rweikiniro": ["Kabungo","Kayenje","Kitashekwa","Murambi","Rushebeya"],
  "Rwemikoma (Kazo)": ["Bugarihe","Kijuma","Rwemikoma"],
  "Rwengaju": ["Bwabya","Kicuna","Kidubuli"],
  "Rwengwe": ["Bwoga","Kyeyare","Nyakishojwa","Rwengwe"],
  "Rwenkobwa Town Council": ["Karemba Ward","Mirambi Ward"],
  "Rwenshande": ["Akabaare","Ifura","Kanyanya"],
  "Rwentobo-Rwahi Town Council": ["Kaina Ward","Katooma Ward","Kiyanja Ward","Kyobwe Ward"],
  "Rwentuha": ["Kabaraba","Kyarujumba","Kyeshombire","Ngangi","Ruhangire","Rwentuha"],
  "Rwentuha Town Council": ["Kitwe Ward","Rutooma Ward","Rwentuha Ward"],
  "Rwerere Town Council": ["Bigaga Ward","Kagugu Ward","Rusoroza Ward"],
  "Rwetamu": ["Akajumbura","Bugweiraro","Kanitsya","Rwetamu"],
  "Rwetango": ["Rwenfunjo","Rwenyanga","Rwetango"],
  "Rwimi": ["Kadindimo","Kaina","Kajumiro","Kakooga"],
  "Rwimi Town Council": ["Nyabwina Ward","Rwimi Central Ward","Rwimi East Ward","Rwimi West Ward"],
  "Rwoho Town Council": ["Kirera Ward","Kirungu Ward","Kitojo Ward","Mushasha Ward","Nyakigufu Ward","Rwoho Ward"],
  "Ryakarimira Town Council": ["Ahamuhambo Ward","Kacerere Ward","Rukore Ward"],
  "Ryeru": ["Buzenga","Mubanda","Mugogo","Mushumba","Ndangara","Ndekye","Nyakiyanja"],
  "Sanga": ["Nombe I","Rwabarata","Rwamuhuku"],
  "Sanga Town Council": ["Ekizimbi Ward","Nkongoro Ward","Nombe Ward","Sanga Ward"],
  "Sangar (Kaabong)": ["Kocholo","Kumet","Lokial","Nakitemyet (lotwal)","Sangar"],
  "Semuto": ["Kikandwa","Kikyusa","Kirema","Kisega","Migingye","Segalye"],
  "Semuto Town Council": ["Health Centre Ward","Katale Ward","Lule Ward","Posta Ward","Transformer Ward"],
  "Senendet": ["Chemwabit","Kapkomboloy","Kapkomol","Rwanda"],
  "Serere Town Council": ["Kakus Ward","Okulonyo Ward","Osuguro Ward"],
  "Serere/olio": ["Akoboi","Kakus","Oburin","Odungura","Okulonyo","Osuguro"],
  "Sheema Central Division": ["Kitojo Ward","Kyabandara Ward","Nyakashambya Ward","Nyarweshama Ward","Rwamujojo Ward"],
  "Shuuku": ["Kishabya","Kyempitsi East","Kyempitsi West","Rwabuza"],
  "Sibanga": ["Bulako","Bumasari","Bumatoola","Bunamukheya","Busangai","Buwasyeba","Mulukhu","Nabitawa","Namikelo","Syeba"],
  "Sidok (kopoth)": ["Kasimeri","Locherep","Longaro"],
  "Sigulu Islands": ["Bumalenge","Nampongwe","Rabachi","Sigulu Manga","Sigulu Mukani"],
  "Sikuda": ["Buchicha","Sikuda"],
  "Simu": ["Bukibologoto","Kidega","Kikuyu","Savannah","Simu"],
  "Sindila": ["Bunyangule","Kakuka","Nyankonda"],
  "Sipi": ["Chepterit","Gamatui"],
  "Sipi Town Council": ["Chekwanda Ward","Kapkwirwok Town Ward","Kapkwirwok Ward"],
  "Sironko Town Council": ["Central Ward","Industrial Ward","Kibira  Ward","Mahempe Ward","Southern Ward"],
  "Sisiyi": ["Bumugusha","Gibuzale","Kibanda","Kisubi","Luzzi","Mabono"],
  "Sisuni": ["Bumagambo","Kibukwa","Makenya","Sisuni"],
  "Soni": ["Chawolo","Mifumi","Nagoke","Soni"],
  "Sopsop": ["Nabowa","Namwendia","Per - Per","Sop-Sop"],
  "Soroti": ["Acetgwen","Opuyo"],
  "Sotti": ["Bunabahala","Bunambozo","Marama","Sotti"],
  "South Division (Kisoro)": ["Abele Ward","Abubur Ward","Apa Ward","Aputon Ward","Aterai Ward","Boma Ward","Busaale Ward","Busamba Ward","Campswahili Chin","Campswahili Juu","Gasiza Ward","Gayaza Ward","Hospital Ward","Kadokini Ward","Kanyum Ward","Kapadakook Central Ward","Kapadakook Ward","Kattabalanga Ward","Kelim Ward","Kirungi Ward","Kisekende Ward","Lwabagabo Ward","Mengo Ward","Nakaal Ward","Nyangilia Ward","Olungia Ward","Otipe Ward","Tank Ward"],
  "Southern Division (Kabarole)": ["Bazaar","Busota Ward","Kamuli-Namwenda Ward","Kanyinya Ward","Kasusu","Kigaaga Ward","Kijanju","Mandwa Ward","Mulamba Ward","Nakulyaku Ward","Ndorero Ward","Rwakabengo Ward"],
  "Ssekanyonyi": ["Bukooba","Kagerekamu","Kasikombe","Magala"],
  "Ssekanyonyi Town Council": ["Bulyankuyege Ward","Kabbega Ward","Kyetume Ward","Ssekanyonyi Ward"],
  "Ssembabule Town Council": ["Dispensary Ward","Market Ward","Parish Ward"],
  "Ssi": ["Bbinga","Kimera","Koba","Lugala","Lugoba","Muvo","Namukuma","Zitwe"],
  "Suam": ["Chepkusawar","Kabyoyon","Kapkweno","Kwirwot","Matimbei"],
  "Sundet": ["Kapterit","Kubobey","Nyilit","Sundet"],
  "Tademeri": ["Nalugondo","Naluli","Namukalo","Tademeri"],
  "Tapac": ["Katikekile","Kodonyo","Loyaraboth","Nakwanga","Natumukale","Tapach"],
  "Tara": ["Anyivu","Offude","Pajama","Vurra","Wanguru","Yiddu"],
  "Te-Boke": ["Agong","Barodilo","Ilee","Ololango","Teboke"],
  "Te-Nam": ["Aringa","Barwech","Lakoga","Tee-Okutu"],
  "Thatha Division": ["Forest Ward","Namrwodho Ward","Thatha Ward"],
  "Tiira Town Council": ["Abochet Ward","Ajuket Ward","Tiira Ward"],
  "Timu": ["Kapalu","Loitanit","Lokinene"],
  "Tirinyi": ["Kalampete","Kataka","Kotolo","Saala"],
  "Tirinyi Town Council": ["Bugwere Ward","Bukatikoko Ward","Kitantalo Ward","Kiyalyo Ward","Kujji Ward","Tirinyi Ward"],
  "Tisai": ["Acera","Aderun","Aguya","Akide","Asinge","Tisai Island"],
  "Tokwe": ["Buhanda","Bundinyama","Bunyaruta","Hakitengya","Mataisa"],
  "Toroma": ["Akurao","Apuuton","Ominya","Toroma"],
  "Toroma Town Council": ["Atorom Obongut Ward","Northern Ward","Southern Ward"],
  "Tororo Eastern": ["Amagoro A","Amagoro B","Kasoli","Nyangole"],
  "Tororo Western": ["Agururu A","Agururu B","Bison/maguria","Central"],
  "Tsekululu": ["Bunabitu","Bunambale","Bunamwandu","Bunasambi","Busulwa"],
  "Ttaba-Bbinzi": ["Bbinzi/ttaba","Katikampanda","Kubamitwe","Ngomanene"],
  "Ttamu Division": ["Busubizi Ward","Kabule Ward","Kabuwambo Ward","South Ward","Ttamu Ward","Ttanda Ward"],
  "Tubur": ["Achuna","Aparisa","Obulei","Ogolai","Palaet"],
  "Tubur Town Council": ["Awasi Ward","Central Ward","Orieta Ward"],
  "Tuikat": ["Chepkutus","Kere","Moigut","Sosur","Tolil","Tuikat","Yatui"],
  "Tulel": ["Burkeywo","Chebinyiny","Kabokwo","Mayak","Tulel"],
  "Ukusijoni": ["Ayiri","Gulinya","Kiraba","Maaji","Payaru"],
  "Uleppi (Arua)": ["Arara","Katiyi","Lawura"],
  "Unyama": ["Angaya","Oding","Pakwelo","Unyama"],
  "Uriama": ["Akinio","Ejoni","Katiku","Maraju","Otumbari"],
  "Usuk": ["Abwokodia","Abyelut","Cheleuko","Okoritok","Ongema"],
  "Usuk Town Council": ["Central Ward","Northern Ward","Southern Ward"],
  "Vurra": ["Ajono","Anzuu","Ayavu","Eruba","Ezuku","Kuluva","Nyio","Opia","Ringili","Tilevu"],
  "Wabinyonyi": ["Kageri","Kamuniina","Kiwongoire","Kyamuyingo","Sasiira","Sikye","Wabigalo","Wampiti"],
  "Wadelai": ["Mutir","Ojigo","Ongwelle","Pakwinyo","Pumit"],
  "Waibuga": ["Busiiro","Butimbwa","Itakaibolu","Lwaki","Walibo"],
  "Wairasa": ["Busuyi","Iguluibi","Misoli","Wandago"],
  "Wakisi Division": ["Kalagala","Kkonko","Malindi","Nakalanga","Naminya","Wakisi"],
  "Wakiso": ["Bukasa","Buloba","Kyebando","Lukwanga","Nakabugo","Naluvule","Sumbwe"],
  "Wakiso Town Council": ["Gombe Ward","Kasengejje Ward","Kavumba Ward","Kisimbiri Ward","Mpunga Ward","Namusera Ward"],
  "Wakyato": ["Kalagala","Kirinda","Kisoga","Mijumwa","Nakonge"],
  "Walukuba/masese": ["Masese","Walukuba East","Walukuba West"],
  "Wanale": ["Bubetsye","Bunatsoma","Bushiuyo","Khaukha","Nabanyole"],
  "Wanale Borough": ["Boma","Busamaga East","Busamaga West","Mooni","Mukhubu"],
  "Wandi": ["Kobbe","Luro","Osubira","Wandi","Wangoro","Wogo"],
  "Wankole": ["Lulyambuzi","Luzinga","Wankole"],
  "Warr": ["Affere","Juloka","Ngira","Omua Lower","Pagei","Pakia"],
  "Wattuba": ["Kiduumi","Kikolimbo","Kisoroza","Kisozi","Lwansama","Nabulembeko"],
  "Wattuba Town Council": ["Kalukwajju Ward","Kiyombya Ward","Nakitembe Ward","Wattuba Ward"],
  "Wera": ["Ajota","Angole","Aten","Olianai","Opiriai","Osekai","Wera"],
  "West Division (Kapchorwa)": ["Basar Ward","Biwanga Ward","Kabat Ward","Kapenguria Ward","Kapkwingi Ward","Kapleko Ward","Kapnyikew Ward","Kapteret Ward","Kaptul Ward","Kasenyi/caltex Ward","Katogo Ward","Kayinja Ward","Kululu Ward","Kutung Ward","Lokore Ward","Mijunwa Ward","Nabikakala Ward","Nakayima Ward","Nangayom Ward","Rom Rom Ward","Tegeres Ward","Tongwo Ward","Tuban Ward","Um-Um Ward","Wum-Wum Ward"],
  "Western": ["Nakatunya Ward","Oderai/majengo Ward","Pamba Ward","Senior Quarters Ward"],
  "Western  Division": ["Kagote","Kibimba","Nyabukara","Rwengoma"],
  "Western Division (Bugiri)": ["Amunupi Ward","Bwole Ward","Godia Ward","Isoko Ward","Kahunga Ward","Karangaro Ward","Kinyasano Ward","Kitimba Ward","Muko Ward","Ndifakulya A Ward","North A Ward","North B Ward","Northern A Ward","South West Ward"],
  "Weswa": ["Bubukanza","Bunandutu","Bunatsabwana","Bungoolo","Bushaburiri","Butoto","Buwesonga","Buweswa","Nambewo","Shibanga"],
  "Willa": ["Abwanget","Akisim","Akum","Alere","Wila"],
  "Wiodyek": ["Abutoadi","Abwocolil","Adola","Amokogee","Rao"],
  "Wobulenzi Town Council": ["Bukalasa Ward","Bukolwa Ward","Katikamu Ward","Wobulenzi Central Ward","Wobulenzi East Ward","Wobulenzi West Ward"],
  "Wol": ["Kimiya","Lokabar","Lugung","Lugungu","Mura","Ogole","Rogo"],
  "Wol Town Council": ["Guda Ward","Kico Ward","Lubanya Ward","Panyagol Ward"],
  "Yivu": ["Amanipi","Ambala","Edre","Loinya","Okuvu","Omba","Ombia","Ombia-Bura"],
  "Yumbe Town Council": ["Amanyiri Ward","Ariguyi Ward","Arunga Ward","Bilewu Ward","Charanga Ward","Lukutua Ward"],
  "Zesui": ["Bukibooli","Bumumulo","Majenga","Nabodi","Shimuma"],
  "Zeu": ["Kigezi","Lendu","Lorr Central","Omoyo","Papoga"],
  "Zigoti Town Council": ["Nabattu Ward","Zigoti Ward"],
  "Zirobwe": ["Bubuubi","Bukimu","Kabulanaka","Kakakala","Kyetume","Nakigoza","Nambi","Ngalonkalu"],
  "Zombo Town Council": ["Abira East Ward","Abira West Ward","Palei West Ward"]
};

// ... (imports and constants remain the same)

const StaffEntryModal = ({ isOpen, onClose, staffData, onSave }) => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    gender: "",
    nin: "",
    hire_date: "",
    monthly_salary: "",
    employment_status: "",
    district: "",
    subcounty: "",
    parish: "",
    village: "",
  });

  const [validation, setValidation] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  // Initialize form data ONLY when modal opens (not on every staffData change)
  useEffect(() => {
    // Only reset form when modal opens
    if (isOpen) {
      if (staffData) {
        setFormData({
          first_name: staffData.first_name || "",
          last_name: staffData.last_name || "",
          gender: staffData.gender || "",
          nin: staffData.nin || "",
          hire_date: staffData.hire_date || staffData.date_hired || "",
          monthly_salary: staffData.monthly_salary || staffData.salary || "",
          employment_status: staffData.employment_status || "Full-time",
          district: staffData.district || "",
          subcounty: staffData.subcounty || staffData.sub_county || "",
          parish: staffData.parish || "",
          village: staffData.village || "",
        });
      } else {
        setFormData({
          first_name: "",
          last_name: "",
          gender: "",
          nin: "",
          hire_date: "",
          monthly_salary: "",
          employment_status: "Full-time",
          district: "",
          subcounty: "",
          parish: "",
          village: "",
        });
      }
      setValidation({});
    }
  }, [isOpen]); // Only depend on isOpen, not staffData

  const validateField = (fieldName, value) => {
    switch (fieldName) {
      case "first_name":
      case "last_name":
        return value && String(value).trim().length >= 2;
      case "gender":
        return value !== "";
      case "nin":
        const ninPattern = /^(CM|CF)[A-Za-z0-9]{12}$/;
        return ninPattern.test(String(value).toUpperCase());
      case "hire_date":
        return value && new Date(value) <= new Date();
      case "monthly_salary":
        // Convert to string first to handle both string and number values
        const salaryStr = String(value || "");
        const salaryNum = parseFloat(salaryStr.replace(/,/g, ""));
        return value && !isNaN(salaryNum) && salaryNum > 0;
      case "employment_status":
        return value !== "";
      case "district":
      case "subcounty":
      case "parish":
      case "village":
        return value && String(value).trim().length >= 2;
      default:
        return true;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    if (name === "monthly_salary") {
      // Format salary with commas
      processedValue = value.replace(/,/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    // Validate field
    setValidation((prev) => ({
      ...prev,
      [name]: validateField(name, processedValue),
    }));
  };

  const handleSubmit = async (e) => {
    console.log("=== handleSubmit START ===");
    e.preventDefault();
    setIsSubmitting(true);
    console.log("isSubmitting set to true");

    // Validate all fields
    const newValidation = {};
    Object.keys(formData).forEach((key) => {
      newValidation[key] = validateField(key, formData[key]);
    });
    setValidation(newValidation);

    // Check if all validations pass
    const isValid = Object.values(newValidation).every((v) => v === true);
    console.log("Validation result:", isValid);
    console.log("Validation details:", newValidation);

    if (!isValid) {
      console.log("Validation failed, resetting isSubmitting");
      setIsSubmitting(false);
      return;
    }

    try {
      // Prepare data for submission
      const submitData = {
        ...formData,
        monthly_salary: parseFloat(String(formData.monthly_salary || "").replace(/,/g, "")),
        nin: String(formData.nin || "").toUpperCase(),
      };

      console.log("Calling onSave with data:", submitData);
      if (onSave) {
        await onSave(submitData);
        console.log("onSave completed successfully");
      }

      console.log("Calling onClose");
      onClose();
    } catch (error) {
      console.error("!!! Error submitting form:", error);
      alert(`Error submitting form: ${error.message}`);
    } finally {
      console.log("finally block - setting isSubmitting to false");
      setIsSubmitting(false);
      console.log("=== handleSubmit END ===");
    }
  };

  if (!isOpen) return null;

  // Uniform input styles
  const inputStyles = {
    base: {
      width: "100%",
      padding: "12px",
      border: "1px solid #D1D5DB",
      borderRadius: "0px",
      outline: "none",
      backgroundColor: "#FFFFFF",
      fontSize: "14px",
      fontFamily: "inherit",
    },
    focus: {
      border: "1px solid #795548",
      boxShadow: "0 0 0 2px rgba(121, 85, 72, 0.1)",
    },
    valid: {
      border: "1px solid #10B981",
    },
    invalid: {
      border: "1px solid #EF4444",
    }
  };

  // Common placeholder class for all inputs
  const placeholderClass = "placeholder:text-gray-400 placeholder:italic";

  const labelStyles = {
    display: "block",
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
    marginBottom: "6px",
    fontFamily: "inherit",
  };

  const errorStyles = {
    fontSize: "12px",
    color: "#EF4444",
    marginTop: "4px",
    fontFamily: "inherit",
  };

  const getInputStyle = (fieldName) => {
    const baseStyle = { ...inputStyles.base };
    
    if (validation[fieldName] === true) {
      return { ...baseStyle, ...inputStyles.valid };
    } else if (validation[fieldName] === false) {
      return { ...baseStyle, ...inputStyles.invalid };
    }
    
    return baseStyle;
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      backdropFilter: "blur(4px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 50,
      padding: "16px",
      overflowY: "auto"
    }}>
      <div style={{
        backgroundColor: "#FFFFFF",
        borderRadius: "12px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        width: "100%",
        maxWidth: "800px", // Increased width for side-by-side layout
        maxHeight: "90vh",
        height: "85vh", // Slightly taller to accommodate more content
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }}>
        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 24px",
          borderBottom: "1px solid #E5E7EB"
        }}>
          <h2 style={{
            fontSize: "20px",
            fontWeight: "600",
            color: "#1F2937",
            margin: 0,
            fontFamily: "inherit"
          }}>
            {staffData ? "Edit Staff" : "Staff Entry"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "8px",
              borderRadius: "50%",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#6B7280"
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = "#F3F4F6"}
            onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{
          flex: 1,
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          overflowY: "auto"
        }}>
          {/* Personal Information Section */}
          <div>
            <h3 style={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#1F2937",
              marginBottom: "16px",
              fontFamily: "inherit"
            }}>
              Personal Information
            </h3>

            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr", // 2-column layout
              gap: "16px"
            }}>
             {/* First Name */}
             <div>
               <label style={labelStyles}>First Name</label>
               <input
                 type="text"
                 name="first_name"
                 value={formData.first_name}
                 onChange={handleChange}
                 placeholder="Enter first name"
                 className={placeholderClass}
                 style={getInputStyle("first_name")}
                 onFocus={(e) => {
                   e.target.style.border = inputStyles.focus.border;
                   e.target.style.boxShadow = inputStyles.focus.boxShadow;
                 }}
                 onBlur={(e) => {
                   const style = getInputStyle("first_name");
                   e.target.style.border = style.border;
                   e.target.style.boxShadow = "none";
                 }}
               />
               {validation.first_name === false && (
                 <p style={errorStyles}>
                   First name must be at least 2 characters.
                 </p>
               )}
             </div>

             {/* Last Name */}
             <div>
               <label style={labelStyles}>Last Name</label>
               <input
                 type="text"
                 name="last_name"
                 value={formData.last_name}
                 onChange={handleChange}
                 placeholder="Enter last name"
                 className={placeholderClass}
                 style={getInputStyle("last_name")}
                 onFocus={(e) => {
                   e.target.style.border = inputStyles.focus.border;
                   e.target.style.boxShadow = inputStyles.focus.boxShadow;
                 }}
                 onBlur={(e) => {
                   const style = getInputStyle("last_name");
                   e.target.style.border = style.border;
                   e.target.style.boxShadow = "none";
                 }}
               />
               {validation.last_name === false && (
                 <p style={errorStyles}>
                   Last name must be at least 2 characters.
                 </p>
               )}
             </div>

             {/* Gender */}
             <div>
               <label style={labelStyles}>Gender</label>
               <select
                 name="gender"
                 value={formData.gender}
                 onChange={(e) => {
                   const selectedGender = e.target.value;

                   // Set NIN prefix based on gender
                   let ninPrefix = "";
                   let newNin = formData.nin;

                   if (selectedGender === "Male") {
                     ninPrefix = "CM";
                   } else if (selectedGender === "Female") {
                     ninPrefix = "CF";
                   }

                   // Update NIN with appropriate prefix
                   if (ninPrefix) {
                     // If NIN is empty or only has old prefix, set to new prefix
                     if (!newNin || newNin.length <= 2 || newNin.startsWith("CM") || newNin.startsWith("CF")) {
                       // Keep any digits after the prefix (if any)
                       const existingDigits = newNin.length > 2 ? newNin.substring(2) : "";
                       newNin = ninPrefix + existingDigits;
                     } else {
                       // If NIN doesn't start with CM or CF, prepend the prefix
                       newNin = ninPrefix + newNin;
                     }
                   }

                   setFormData((prev) => ({
                     ...prev,
                     gender: selectedGender,
                     nin: newNin,
                   }));

                   setValidation((prev) => ({
                     ...prev,
                     gender: validateField("gender", selectedGender),
                     nin: validateField("nin", newNin),
                   }));
                 }}
                 style={getInputStyle("gender")}
                 onFocus={(e) => {
                   e.target.style.border = inputStyles.focus.border;
                   e.target.style.boxShadow = inputStyles.focus.boxShadow;
                 }}
                 onBlur={(e) => {
                   const style = getInputStyle("gender");
                   e.target.style.border = style.border;
                   e.target.style.boxShadow = "none";
                 }}
               >
                 <option value="">Select gender</option>
                 <option value="Male">Male</option>
                 <option value="Female">Female</option>
               </select>
               {validation.gender === false && (
                 <p style={errorStyles}>
                   Please select a gender.
                 </p>
               )}
             </div>

             {/* NIN */}
             <div>
               <label style={labelStyles}>NIN</label>
               <input
                 type="text"
                 name="nin"
                 value={formData.nin}
                 onChange={handleChange}
                 placeholder={
                   formData.gender === "Male"
                     ? "ENTER NIN (E.G. CMXXXXXXXXXXXX)"
                     : formData.gender === "Female"
                     ? "ENTER NIN (E.G. CFXXXXXXXXXXXX)"
                     : "Select gender first"
                 }
                 className={placeholderClass}
                 style={{
                   ...getInputStyle("nin"),
                   textTransform: "uppercase"
                 }}
                 onFocus={(e) => {
                   e.target.style.border = inputStyles.focus.border;
                   e.target.style.boxShadow = inputStyles.focus.boxShadow;
                 }}
                 onBlur={(e) => {
                   const style = getInputStyle("nin");
                   e.target.style.border = style.border;
                   e.target.style.boxShadow = "none";
                 }}
               />
               {validation.nin === false && (
                 <p style={errorStyles}>
                   NIN must be 14 characters, start with CM or CF, and only contain letters/numbers.
                 </p>
               )}
             </div>

             {/* Hire Date */}
             <div>
               <label style={labelStyles}>Hire Date</label>
               <input
                 type="date"
                 name="hire_date"
                 max={today}
                 value={formData.hire_date}
                 onChange={handleChange}
                 style={getInputStyle("hire_date")}
                 onFocus={(e) => {
                   e.target.style.border = inputStyles.focus.border;
                   e.target.style.boxShadow = inputStyles.focus.boxShadow;
                 }}
                 onBlur={(e) => {
                   const style = getInputStyle("hire_date");
                   e.target.style.border = style.border;
                   e.target.style.boxShadow = "none";
                 }}
               />
               {validation.hire_date === false && (
                 <p style={errorStyles}>
                   Hire date cannot be in the future.
                 </p>
               )}
             </div>

             {/* Monthly Salary */}
             <div>
               <label style={labelStyles}>Monthly Salary (UGX)</label>
               <input
                 name="monthly_salary"
                 type="text"
                 value={formData.monthly_salary}
                 onChange={handleChange}
                 placeholder="e.g., 500,000"
                 className={placeholderClass}
                 style={getInputStyle("monthly_salary")}
                 onFocus={(e) => {
                   e.target.style.border = inputStyles.focus.border;
                   e.target.style.boxShadow = inputStyles.focus.boxShadow;
                 }}
                 onBlur={(e) => {
                   const style = getInputStyle("monthly_salary");
                   e.target.style.border = style.border;
                   e.target.style.boxShadow = "none";
                 }}
               />
               {validation.monthly_salary === false && (
                 <p style={errorStyles}>
                   Monthly Salary is required and must be valid.
                 </p>
               )}
             </div>

             {/* Employment Status */}
             <div style={{ gridColumn: "span 2" }}>
               <label style={labelStyles}>Employment Status</label>
               <select
                 name="employment_status"
                 value={formData.employment_status}
                 onChange={handleChange}
                 style={getInputStyle("employment_status")}
                 onFocus={(e) => {
                   e.target.style.border = inputStyles.focus.border;
                   e.target.style.boxShadow = inputStyles.focus.boxShadow;
                 }}
                 onBlur={(e) => {
                   const style = getInputStyle("employment_status");
                   e.target.style.border = style.border;
                   e.target.style.boxShadow = "none";
                 }}
               >
                 <option value="">Select employment status</option>
                 <option value="Full-time">Full-time</option>
                 <option value="Part-time">Part-time</option>
                 <option value="Contract">Contract</option>
                 <option value="Temporary">Seasonal</option>
               </select>
               {validation.employment_status === false && (
                 <p style={errorStyles}>
                   Please select an employment status.
                 </p>
               )}
             </div>
            </div>
          </div>

          {/* Address Information Section - FULL WIDTH for location inputs */}
          <GeoapifyContext apiKey="14cedd3fa25d49deacc7da7d7f48b00e">
            <div>
              <h3 style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "#1F2937",
                marginBottom: "16px",
                fontFamily: "inherit"
              }}>
                Address Information
              </h3>

              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr", // 2-column layout for address fields
                gap: "16px"
              }}>
                {/* District */}
                <div>
                  <label style={labelStyles}>District</label>
                  <div style={{
                    position: "relative",
                    width: "100%"
                  }}>
                    <CustomAutocomplete
                      options={Object.keys(LOCATION_DATA)}
                      value={formData.district}
                      onChange={(e) => {
                        const districtName = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          district: districtName,
                          subcounty: "",
                          parish: "",
                        }));
                        setValidation((prev) => ({
                          ...prev,
                          district: validateField("district", districtName),
                        }));
                      }}
                      placeholder="Search for district..."
                      className={placeholderClass}
                      style={getInputStyle("district")}
                      onFocus={(e) => {
                        e.target.style.border = inputStyles.focus.border;
                        e.target.style.boxShadow = inputStyles.focus.boxShadow;
                      }}
                      onBlur={(e) => {
                        const style = getInputStyle("district");
                        e.target.style.border = style.border;
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>
                  {validation.district === false && (
                    <p style={errorStyles}>
                      District is required.
                    </p>
                  )}
                </div>

                {/* Subcounty */}
                <div>
                  <label style={labelStyles}>Subcounty</label>
                  <div style={{
                    position: "relative",
                    width: "100%"
                  }}>
                    <CustomAutocomplete
                      options={formData.district && LOCATION_DATA[formData.district] ? LOCATION_DATA[formData.district] : []}
                      value={formData.subcounty}
                      onChange={(e) => {
                        const subcountyName = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          subcounty: subcountyName,
                          parish: "",
                        }));
                        setValidation((prev) => ({
                          ...prev,
                          subcounty: validateField("subcounty", subcountyName),
                        }));
                      }}
                      placeholder={
                        formData.district
                          ? "Search for subcounty..."
                          : "Select district first"
                      }
                      disabled={!formData.district}
                      className={placeholderClass}
                      style={getInputStyle("subcounty")}
                      onFocus={(e) => {
                        e.target.style.border = inputStyles.focus.border;
                        e.target.style.boxShadow = inputStyles.focus.boxShadow;
                      }}
                      onBlur={(e) => {
                        const style = getInputStyle("subcounty");
                        e.target.style.border = style.border;
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>
                  {validation.subcounty === false && (
                    <p style={errorStyles}>
                      Subcounty is required.
                    </p>
                  )}
                </div>

                {/* Parish */}
                <div>
                  <label style={labelStyles}>Parish</label>
                  <div style={{
                    position: "relative",
                    width: "100%"
                  }}>
                    <CustomAutocomplete
                      options={formData.subcounty && PARISHES_BY_SUB_COUNTY[formData.subcounty] ? PARISHES_BY_SUB_COUNTY[formData.subcounty] : []}
                      value={formData.parish}
                      onChange={(e) => {
                        const parishName = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          parish: parishName,
                        }));
                        setValidation((prev) => ({
                          ...prev,
                          parish: validateField("parish", parishName),
                        }));
                      }}
                      placeholder={
                        formData.subcounty
                          ? "Search for parish..."
                          : "Select subcounty first"
                      }
                      disabled={!formData.subcounty}
                      className={placeholderClass}
                      style={getInputStyle("parish")}
                      onFocus={(e) => {
                        e.target.style.border = inputStyles.focus.border;
                        e.target.style.boxShadow = inputStyles.focus.boxShadow;
                      }}
                      onBlur={(e) => {
                        const style = getInputStyle("parish");
                        e.target.style.border = style.border;
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>
                  {validation.parish === false && (
                    <p style={errorStyles}>
                      Parish is required.
                    </p>
                  )}
                </div>

                {/* Village */}
                <div>
                  <label style={labelStyles}>Village</label>
                  <div style={{
                    position: "relative",
                    width: "100%"
                  }}>
                    <input
                      name="village"
                      value={formData.village}
                      onChange={handleChange}
                      placeholder="e.g., Kisaasi"
                      required
                      className={placeholderClass}
                      style={{
                        ...getInputStyle("village"),
                        position: "relative",
                        zIndex: 1
                      }}
                      onFocus={(e) => {
                        e.target.style.border = inputStyles.focus.border;
                        e.target.style.boxShadow = inputStyles.focus.boxShadow;
                      }}
                      onBlur={(e) => {
                        const style = getInputStyle("village");
                        e.target.style.border = style.border;
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>
                  {validation.village === false && (
                    <p style={errorStyles}>
                      This field is required — must be at least 2 characters.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </GeoapifyContext>
        </form>

        {/* Buttons - Fixed at bottom outside scrollable area */}
        <div style={{
          display: "flex",
          justifyContent: "flex-end",
          padding: "20px 24px",
          borderTop: "1px solid #E5E7EB",
          gap: "12px",
          backgroundColor: "#FFFFFF"
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              backgroundColor: "#F3F4F6",
              color: "#374151",
              border: "none",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              fontFamily: "inherit"
            }}
            disabled={isSubmitting}
            onMouseEnter={(e) => e.target.style.backgroundColor = "#E5E7EB"}
            onMouseLeave={(e) => e.target.style.backgroundColor = "#F3F4F6"}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              backgroundColor: "#8B4513",
              color: "#FFFFFF",
              border: "none",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              fontFamily: "inherit",
              opacity: isSubmitting ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) e.target.style.backgroundColor = "#783A1E";
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) e.target.style.backgroundColor = "#8B4513";
            }}
          >
            {isSubmitting ? "Saving..." : staffData ? "Save Changes" : "Record Staff"}
          </button>
        </div>
      </div>
    </div>
  );
};




const TABLE_HEADERS = [
  { key: "staff_id", label: "Staff Id", type: "string" },
  { key: "first_name", label: "First Name", type: "string" },
  { key: "last_name", label: "Last Name", type: "string" },
  { key: "gender", label: "Gender", type: "string" },
  { key: "nin", label: "NIN", type: "string" },
  { key: "district", label: "District", type: "string" },
  { key: "hire_date", label: "Hire Date", type: "date" },
  { key: "salary", label: "Monthly Salary (UGX)", type: "number" },
  { key: "actions", label: "Actions", type: "actions" },
];

// FIXED: Added salary field to initial mock data
const INITIAL_STAFF_DATA = [
  {
    id: 1,
    staff_id: "RF001",
    first_name: "Billy",
    last_name: "Banks",
    gender: "Male",
    nin: "CM004GDT777G88",
    district: "Wakiso",
    date_hired: "2023-06-15",
    salary: 500000,
  },
  {
    id: 2,
    staff_id: "RF002",
    first_name: "Ivan",
    last_name: "Koreta",
    gender: "Male",
    nin: "CM00566674632A",
    district: "Wakiso",
    date_hired: "2024-11-20",
    salary: 450000,
  },
  {
    id: 3,
    staff_id: "RF003",
    first_name: "Jackson",
    last_name: "Ssemengo",
    gender: "Male",
    nin: "CM004673H7645F",
    district: "Wakiso",
    date_hired: "2024-05-07",
    salary: 600000,
  },
  {
    id: 4,
    staff_id: "RF004",
    first_name: "Justine",
    last_name: "Natasha",
    gender: "Female",
    nin: "CF003674F7894A",
    district: "Wakiso",
    date_hired: "2024-10-16",
    salary: 550000,
  },
  {
    id: 5,
    staff_id: "RF005",
    first_name: "Agnes",
    last_name: "Nalubega",
    gender: "Female",
    nin: "CF003675N876B",
    district: "Mpigi",
    date_hired: "2023-03-22",
    salary: 480000,
  },
  {
    id: 6,
    staff_id: "RF006",
    first_name: "Peter",
    last_name: "Mwesigye",
    gender: "Male",
    nin: "CM004678P1234C",
    district: "Mbarara",
    date_hired: "2024-01-10",
    salary: 520000,
  },
];


function StaffPage() {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterGender, setFilterGender] = useState('');
    const [filterSalary, setFilterSalary] = useState('');
    const navigate = useNavigate();

  const [sortConfig, setSortConfig] = useState({
    key: "date_hired",
    direction: "descending",
  });
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [staffToEdit, setStaffToEdit] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showBulkStaffModal, setShowBulkStaffModal] = useState(false);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(STAFF_API_ENDPOINT);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      let normalized = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : [];

      console.log("Raw API Response:", data);
      console.log("Normalized data:", normalized);
      console.log("Sample API staff record:", normalized[0]);

      // Map monthly_salary from API to salary for frontend
      const finalStaffList = normalized.map((staff) => ({
        ...staff,
        salary: staff.monthly_salary || staff.salary || 0,
        hire_date: staff.hire_date || staff.date_hired,
      }));

      console.log("Final staff list with salary mapping:", finalStaffList);

      console.log("Final staff data from API:", finalStaffList);
      setStaff(finalStaffList);
    } catch (err) {
      console.error("API Error:", err);
      setError("Could not load data from API. Please check your connection and try again.");
      setStaff([]);
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    console.log("Initial staff load");
    fetchStaff();
  }, [fetchStaff]);

  const filteredStaff = useMemo(() => {
    let current = staff;
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      current = current.filter(
        (su) =>
          su.first_name?.toLowerCase().includes(s) ||
          su.last_name?.toLowerCase().includes(s) ||
          su.staff_id?.toLowerCase().includes(s)
      );
    }
    if (filterGender) {
      current = current.filter(
        (su) => su.gender?.toLowerCase() === filterGender.toLowerCase()
      );
    }
    return current;
  }, [staff, searchTerm, filterGender]);

  const sortedStaff = useMemo(() => {
    const base = Array.isArray(filteredStaff) ? filteredStaff : [];
    const items = [...base];
    if (sortConfig.key) {
      items.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        const headerType = TABLE_HEADERS.find(
          (h) => h.key === sortConfig.key
        )?.type;
        if (headerType === "date") {
          const aDate = new Date(
            a.hire_date || a.date_hired || a[sortConfig.key] || 0
          );
          const bDate = new Date(
            b.hire_date || b.date_hired || b[sortConfig.key] || 0
          );
          return sortConfig.direction === "ascending"
            ? aDate - bDate
            : bDate - aDate;
        }
        if (headerType === "number") {
          const aNum = Number(aVal) || 0;
          const bNum = Number(bVal) || 0;
          return sortConfig.direction === "ascending"
            ? aNum - bNum
            : bNum - aNum;
        }
        if (aVal < bVal) return sortConfig.direction === "ascending" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [filteredStaff, sortConfig]);

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending")
      direction = "descending";
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "ascending" ? (
      <ArrowUp className="w-3 h-3 ml-1" />
    ) : (
      <ArrowDown className="w-3 h-3 ml-1" />
    );
  };

  const handleNewStaff = () => {
    setStaffToEdit(null);
    setIsStaffModalOpen(true);
  };

  const handleExportToExcel = () => {
    try {
      // Prepare data for export - exclude actions column
      const exportData = sortedStaff.map((staffMember) => ({
        "Staff ID": staffMember.staff_id || "N/A",
        "First Name": staffMember.first_name || "N/A",
        "Last Name": staffMember.last_name || "N/A",
        "Gender": staffMember.gender || "-",
        "NIN": staffMember.nin || "-",
        "District": staffMember.district || "-",
        "Sub County": staffMember.sub_county || "-",
        "Parish": staffMember.parish || "-",
        "Village": staffMember.village || "-",
        "Employment Status": staffMember.employment_type || "-",
        "Hire Date": staffMember.hire_date || staffMember.date_hired || "-",
        "Monthly Salary (UGX)":
          staffMember.monthly_salary && staffMember.monthly_salary > 0
            ? staffMember.monthly_salary.toLocaleString('en-US')
            : staffMember.salary && staffMember.salary > 0
            ? staffMember.salary.toLocaleString('en-US')
            : "-",
      }));

      // Create a new workbook
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Staff Records");

      // Auto-size columns
      const maxWidth = 30;
      const colWidths = Object.keys(exportData[0] || {}).map((key) => ({
        wch: Math.min(
          Math.max(
            key.length,
            ...exportData.map((row) => String(row[key] || "").length)
          ),
          maxWidth
        ),
      }));
      worksheet["!cols"] = colWidths;

      // Generate filename with current date
      const date = new Date().toISOString().split("T")[0];
      const filename = `Staff_Records_${date}.xlsx`;

      // Write the file
      XLSX.writeFile(workbook, filename);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      alert("Failed to export to Excel. Please try again.");
    }
  };

  const handleEditStaff = (staffMember) => {
    // convert to modal shape when opening
    setStaffToEdit({
      ...staffMember,
      hire_date: staffMember.hire_date || staffMember.date_hired || "",
    });
    setIsStaffModalOpen(true);
  };

  const handleSaveStaff = async (savedStaffData) => {
    console.log("=== handleSaveStaff START ===");
    console.log("handleSaveStaff called with:", savedStaffData);
    if (!savedStaffData) {
      console.log("No savedStaffData, returning early");
      return;
    }

    // Validate and prepare data for API
    // Convert salary from formatted string (e.g., "7,000,000") to number (e.g., 7000000)
    const salaryValue =
      typeof savedStaffData.monthly_salary === "string"
        ? parseFloat(savedStaffData.monthly_salary.replace(/,/g, ""))
        : savedStaffData.monthly_salary || 0;

    const apiData = {
      first_name: savedStaffData.first_name?.trim() || "",
      last_name: savedStaffData.last_name?.trim() || "",
      nin: savedStaffData.nin?.trim().toUpperCase() || "", // Convert to uppercase for API
      district: savedStaffData.district?.trim() || "",
      sub_county: (
        savedStaffData.subcounty ||
        savedStaffData.sub_county ||
        ""
      ).trim(),
      parish: savedStaffData.parish?.trim() || "",
      village: savedStaffData.village?.trim() || "",
      gender: savedStaffData.gender?.trim() || "",
      date_hired: savedStaffData.hire_date || savedStaffData.date_hired || "",
      employment_type: savedStaffData.employment_status || "Full-time", // Use exact value from form
      monthly_salary: salaryValue, // Backend expects monthly_salary field name
      is_active: true,
    };

    // Validate required fields
    const requiredFields = [
      "first_name",
      "last_name",
      "nin",
      "district",
      "sub_county",
      "parish",
      "village",
      "gender",
      "date_hired",
      "employment_type",
      "monthly_salary",
    ];
    const missingFields = requiredFields.filter((field) => {
      const value = apiData[field];
      return (
        value === null ||
        value === undefined ||
        value === "" ||
        (typeof value === "number" && isNaN(value))
      );
    });

    if (missingFields.length > 0) {
      console.error("Missing required fields:", missingFields);
      alert(
        `Missing required fields:\n${missingFields
          .map((f) => `• ${f.replace(/_/g, " ")}`)
          .join("\n")}`
      );
      console.log("Returning due to missing fields");
      return;
    }

    // Validate NIN pattern (alphanumeric only, no symbols)
    const ninPattern = /^(CM|CF)[A-Za-z0-9]{12}$/;
    if (!ninPattern.test(savedStaffData.nin?.trim() || "")) {
      console.error("Invalid NIN format:", savedStaffData.nin);
      alert(
        "Invalid NIN format\n\nNational ID must start with CM or CF and be exactly 14 alphanumeric characters."
      );
      console.log("Returning due to invalid NIN");
      return;
    }

    console.log("Sending to API:", JSON.stringify(apiData, null, 2));

    try {
      if (staffToEdit) {
        // Update existing staff via PUT request
        console.log("Updating existing staff via API");
        console.log("Staff ID:", staffToEdit.staff_id);
        console.log("API URL:", `${STAFF_API_ENDPOINT}${staffToEdit.staff_id}/`);

        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          console.log("!!! REQUEST TIMEOUT - Aborting after 10 seconds");
          controller.abort();
        }, 30000); // 30 second timeout

        console.log(">>> Sending PUT request...");
        const startTime = Date.now();

        const response = await fetch(
          `${STAFF_API_ENDPOINT}${staffToEdit.staff_id}/`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(apiData),
            signal: controller.signal,
          }
        ).finally(() => {
          clearTimeout(timeoutId);
          const elapsed = Date.now() - startTime;
          console.log(`<<< Request completed in ${elapsed}ms`);
        });

        console.log("API Response Status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("API Error Response Status:", response.status);
          console.error("API Error Response Body:", errorText);
          console.error("Payload sent:", JSON.stringify(apiData, null, 2));
          console.error(
            "Response Content-Type:",
            response.headers.get("content-type")
          );

          try {
            const errorJson = JSON.parse(errorText);
            console.error("API Error Details:", errorJson);
            const errorMsg = Object.entries(errorJson)
              .map(
                ([key, val]) =>
                  `${key}: ${Array.isArray(val) ? val.join(", ") : val}`
              )
              .join("\n");
            alert(`Failed to update staff:\n\n${errorMsg}`);
          } catch (parseError) {
            console.error("Failed to parse error as JSON:", parseError);
            // If it's not JSON, show the raw error (probably HTML)
            const shortError = errorText.substring(0, 500);
            alert(
              `Failed to update staff\n\nServer Error ${response.status}:\n${shortError}`
            );
          }
          throw new Error(`API Error: ${response.status}`);
        }

        const updatedStaff = await response.json();
        console.log("Staff updated successfully:", updatedStaff);

        // FIXED: Update local state - ensure salary is properly preserved
        const staffWithSalary = {
          ...updatedStaff,
          salary: updatedStaff.monthly_salary || savedStaffData.salary, // Use API's monthly_salary or form data
          hire_date: updatedStaff.hire_date || updatedStaff.date_hired,
          date_hired: updatedStaff.hire_date || updatedStaff.date_hired,
        };

        // Update local state
        const index = staff.findIndex(
          (s) => s.id === staffToEdit.id || s.staff_id === staffToEdit.staff_id
        );
        if (index > -1) {
          const updatedStaffList = [...staff];
          updatedStaffList[index] = { ...staffWithSalary };
          setStaff(updatedStaffList);
        }

        // Close modal first
        setIsStaffModalOpen(false);
        setStaffToEdit(null);

        // Refresh data from API to ensure we have latest data
        fetchStaff();

        // Then show success message
        setTimeout(() => {
          setShowSuccessMessage(true);
          setTimeout(() => {
            setShowSuccessMessage(false);
          }, 3000);
        }, 100);
      } else {
        // Add new staff via POST request
        console.log("Creating new staff via API");

        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(STAFF_API_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(apiData),
          signal: controller.signal,
        }).finally(() => clearTimeout(timeoutId));

        console.log("API Response Status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("API Error Response Status:", response.status);
          console.error("API Error Response Body:", errorText);
          console.error("Payload sent:", JSON.stringify(apiData, null, 2));
          console.error(
            "Response Content-Type:",
            response.headers.get("content-type")
          );

          try {
            const errorJson = JSON.parse(errorText);
            console.error("API Error Details:", errorJson);
            const errorMsg = Object.entries(errorJson)
              .map(
                ([key, val]) =>
                  `${key}: ${Array.isArray(val) ? val.join(", ") : val}`
              )
              .join("\n");
            alert(`Failed to create staff:\n\n${errorMsg}`);
          } catch (parseError) {
            console.error("Failed to parse error as JSON:", parseError);
            // If it's not JSON, show the raw error (probably HTML)
            const shortError = errorText.substring(0, 500);
            alert(
              `Failed to create staff\n\nServer Error ${response.status}:\n${shortError}`
            );
          }
          throw new Error(`API Error: ${response.status}`);
        }

        const newStaff = await response.json();
        console.log("Staff created successfully:", newStaff);

        // FIXED: Update local state with API-generated data, ensuring salary is included
        const newStaffWithSalary = {
          ...newStaff,
          salary: newStaff.monthly_salary || savedStaffData.salary, // Use API's monthly_salary or form data
          hire_date: newStaff.hire_date || newStaff.date_hired,
          date_hired: newStaff.hire_date || newStaff.date_hired,
        };

        // Update local state - add to beginning
        const updatedStaffList = [newStaffWithSalary, ...staff];
        setStaff(updatedStaffList);

        // Close modal first
        setIsStaffModalOpen(false);
        setStaffToEdit(null);

        // Refresh data from API to ensure we have latest data
        fetchStaff();

        // Then show success message
        setTimeout(() => {
          setShowSuccessMessage(true);
          setTimeout(() => {
            setShowSuccessMessage(false);
          }, 3000);
        }, 100);
      }
    } catch (error) {
      console.error("!!! CATCH BLOCK - Failed to save staff to API:", error);
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);

      // Check if it's a timeout error (AbortError)
      if (error.name === 'AbortError') {
        console.log("Error type: AbortError (timeout)");
        alert(
          "Request Timeout\n\nThe server took too long to respond (>30 seconds).\n\nPlease check:\n• Your internet connection\n• The server at http://142.93.94.236:8000 is running\n• Try again in a moment"
        );
      }
      // Check if it's a network error
      else if (
        error.message.includes("fetch") ||
        error.message.includes("Network") ||
        error.message.includes("Failed to fetch")
      ) {
        console.log("Error type: Network error");
        alert(
          "Network Error\n\nCould not connect to the server. Please check:\n• Your internet connection\n• The server is running at http://142.93.94.236:8000\n• CORS is properly configured on the server"
        );
      } else {
        console.log("Error type: Other error");
        alert(
          `Failed to save to database\n\nError: ${error.message}`
        );
      }

      // Re-throw the error so handleSubmit knows about it
      console.log("Re-throwing error to handleSubmit");
      throw error;
    } finally {
      console.log("=== handleSaveStaff END ===");
    }
  };

  const handleDeleteStaff = async () => {
    if (!staffToDelete) return;
    setDeleting(true);
    try {
      // Delete from API
      const response = await fetch(
        `${STAFF_API_ENDPOINT}${staffToDelete.staff_id}/`,
        {
          method: "DELETE",
        }
      );

      if (response.ok || response.status === 404) {
        console.log("Staff deleted successfully from API");

        // Update state using findIndex for consistency
        const stateIndex = staff.findIndex(
          (s) =>
            s.id === staffToDelete.id || s.staff_id === staffToDelete.staff_id
        );
        if (stateIndex > -1) {
          const updatedStaffList = [...staff];
          updatedStaffList.splice(stateIndex, 1);
          setStaff(updatedStaffList);
        }

        setShowDeleteModal(false);
        setStaffToDelete(null);

        // Refresh data from API to ensure we have latest data
        fetchStaff();
      } else {
        throw new Error(`API Error: ${response.status}`);
      }
    } catch (err) {
      console.error("Failed to delete from API:", err);
      setError("Failed to delete staff from database. Please try again.");
      setShowDeleteModal(false);
      setStaffToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const renderTableContent = () => {
    // Add debug logging to see what data we have
    console.log("Rendering staff data:", sortedStaff);

    if (loading) {
      return (
        <tr className="h-24">
          <td
            colSpan={TABLE_HEADERS.length}
            className="text-center py-6 text-gray-600"
          >
            <Loader2 className="w-6 h-6 animate-spin inline-block mr-2 text-accent-btn" />
            Loading staff records...
          </td>
        </tr>
      );
    }

    if (error && staff.length === 0) {
      return (
        <tr className="h-24">
          <td
            colSpan={TABLE_HEADERS.length}
            className="text-center py-6 text-red-600 font-medium"
          >
            {error}
          </td>
        </tr>
      );
    }

    if (sortedStaff.length === 0) {
      return (
        <tr className="h-24">
          <td
            colSpan={TABLE_HEADERS.length}
            className="text-center py-6 text-gray-500 italic"
          >
            No staff records found matching your criteria.
          </td>
        </tr>
      );
    }

    return sortedStaff.map((staffMember, index) => {
      // Debug each staff member's salary
      console.log(
        `Staff ${staffMember.first_name} salary data:`,
        {
          salary: staffMember.salary,
          monthly_salary: staffMember.monthly_salary,
          monthly_salary_type: typeof staffMember.monthly_salary,
          monthly_salary_value: staffMember.monthly_salary,
          condition_check: staffMember.monthly_salary && staffMember.monthly_salary > 0
        }
      );

      return (
        <tr
          key={staffMember.id || index}
          className="border-b transition-colors duration-150 hover:bg-gray-50"
        >
          <td className="px-6 py-3 text-left font-medium text-gray-800">
            {staffMember.staff_id || "N/A"}
          </td>
          <td className="px-6 py-3 text-left text-gray-600">
            {staffMember.first_name || "N/A"}
          </td>
          <td className="px-6 py-3 text-left text-gray-600">
            {staffMember.last_name || "N/A"}
          </td>
          <td className="px-6 py-3 text-left text-gray-600">
            {staffMember.gender || "-"}
          </td>
          <td className="px-6 py-3 text-left text-gray-600">
            {staffMember.nin || "-"}
          </td>
          <td className="px-6 py-3 text-left text-gray-600">
            {staffMember.district || "-"}
          </td>
          <td className="px-6 py-3 text-left text-gray-600">
            {staffMember.hire_date || staffMember.date_hired || "N/A"}
          </td>
          <td className="px-6 py-3 text-right text-gray-600">
            {staffMember.monthly_salary && staffMember.monthly_salary > 0
              ? Number(staffMember.monthly_salary).toLocaleString()
              : "No salary"}
          </td>
          <td className="px-6 py-3 text-center">
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => handleEditStaff(staffMember)}
                className="text-gray-500 hover:text-blue-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
                title="Edit Staff Member"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setStaffToDelete(staffMember);
                  setShowDeleteModal(true);
                }}
                className="text-error hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors"
                title="Delete Staff Member"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </td>
        </tr>
      );
    });
  };

  // Calculate KPI metrics
  const kpis = useMemo(() => {
    if (!staff || staff.length === 0) {
      return {
        totalStaff: 0,
        maleStaff: 0,
        femaleStaff: 0,
        recentHires: 0,
      };
    }

    const totalStaff = staff.length;
    const maleStaff = staff.filter((s) => s.gender === "Male").length;
    const femaleStaff = staff.filter((s) => s.gender === "Female").length;

    // Count staff hired in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentHires = staff.filter((s) => {
      const hireDate = new Date(s.hire_date || s.date_hired);
      return hireDate >= thirtyDaysAgo;
    }).length;

    return {
      totalStaff,
      maleStaff,
      femaleStaff,
      recentHires,
    };
  }, [staff]);

  const KPICards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3
            className="text-xs font-medium tracking-wide uppercase"
            style={{ color: "#666" }}
          >
            Total Staff
          </h3>
          <Users size={20} style={{ color: "#8B5A3C" }} />
        </div>
        {loading ? (
          <div className="flex items-center gap-2 mt-2">
            <Loader2
              className="w-6 h-6 animate-spin"
              style={{ color: "#8B5A3C" }}
            />
            <span className="text-sm" style={{ color: "#888" }}>
              Loading...
            </span>
          </div>
        ) : (
          <div className="mt-2">
            <div className="flex flex-col gap-1">
              <p className="text-3xl font-bold" style={{ color: "#3D2817" }}>
                {kpis.totalStaff}
              </p>
            </div>
            <div className="mt-3 text-xs">
              <p style={{ color: "#666" }}>Active employees</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3
            className="text-xs font-medium tracking-wide uppercase"
            style={{ color: "#666" }}
          >
            Male Staff
          </h3>
          <UserCheck size={20} style={{ color: "#8B5A3C" }} />
        </div>
        {loading ? (
          <div className="flex items-center gap-2 mt-2">
            <Loader2
              className="w-6 h-6 animate-spin"
              style={{ color: "#8B5A3C" }}
            />
            <span className="text-sm" style={{ color: "#888" }}>
              Loading...
            </span>
          </div>
        ) : (
          <div className="mt-2">
            <div className="flex flex-col gap-1">
              <p className="text-3xl font-bold" style={{ color: "#3D2817" }}>
                {kpis.maleStaff}
              </p>
            </div>
            <div className="mt-3 text-xs">
              <p style={{ color: "#666" }}>
                {kpis.totalStaff > 0
                  ? `${((kpis.maleStaff / kpis.totalStaff) * 100).toFixed(
                      0
                    )}% of staff`
                  : "0% of staff"}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3
            className="text-xs font-medium tracking-wide uppercase"
            style={{ color: "#666" }}
          >
            Female Staff
          </h3>
          <UserX size={20} style={{ color: "#8B5A3C" }} />
        </div>
        {loading ? (
          <div className="flex items-center gap-2 mt-2">
            <Loader2
              className="w-6 h-6 animate-spin"
              style={{ color: "#8B5A3C" }}
            />
            <span className="text-sm" style={{ color: "#888" }}>
              Loading...
            </span>
          </div>
        ) : (
          <div className="mt-2">
            <div className="flex flex-col gap-1">
              <p className="text-3xl font-bold" style={{ color: "#3D2817" }}>
                {kpis.femaleStaff}
              </p>
            </div>
            <div className="mt-3 text-xs">
              <p style={{ color: "#666" }}>
                {kpis.totalStaff > 0
                  ? `${((kpis.femaleStaff / kpis.totalStaff) * 100).toFixed(
                      0
                    )}% of staff`
                  : "0% of staff"}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3
            className="text-xs font-medium tracking-wide uppercase"
            style={{ color: "#666" }}
          >
            Recent Hires
          </h3>
          <TrendingUp size={20} style={{ color: "#8B5A3C" }} />
        </div>
        {loading ? (
          <div className="flex items-center gap-2 mt-2">
            <Loader2
              className="w-6 h-6 animate-spin"
              style={{ color: "#8B5A3C" }}
            />
            <span className="text-sm" style={{ color: "#888" }}>
              Loading...
            </span>
          </div>
        ) : (
          <div className="mt-2">
            <div className="flex flex-col gap-1">
              <p className="text-3xl font-bold" style={{ color: "#3D2817" }}>
                {kpis.recentHires}
              </p>
            </div>
            <div className="mt-3 text-xs">
              <p style={{ color: "#666" }}>Last 30 days</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <SideNav>
      <main className="p-4 sm:p-6 md:p-8 pt-0">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#4A3423] mb-6">
          Staff Management Overview
        </h2>

        {/* Success Message Banner */}
        {showSuccessMessage && (
          <div
            className="mb-6 p-4 rounded-lg shadow-lg border-l-4 animate-fade-in"
            style={{
              backgroundColor: "#D4EDDA",
              borderColor: "#28A745",
              color: "#155724",
            }}
          >
            <div className="flex items-center">
              <svg
                className="w-6 h-6 mr-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-semibold text-base">
                Staff record saved successfully
              </span>
            </div>
          </div>
        )}

        <KPICards />

        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
          <div className="hidden md:block"></div>
          <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
            <button
              onClick={handleNewStaff}
              className="py-2 px-4 shadow-xl rounded-xl flex items-center font-semibold text-white hover:shadow-2xl transition-all duration-200"
              style={{ backgroundColor: "#8B4513" }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Record New Staff
            </button>
            <button
              onClick={() => setShowBulkStaffModal(true)}
              className="py-2 px-4 shadow-xl rounded-xl flex items-center font-semibold text-white hover:shadow-2xl transition-all duration-200"
              style={{ backgroundColor: "#702A0B" }}
            >
              <Users className="w-4 h-4 mr-2" />
              Bulk Staff Entry
            </button>
            <button
              onClick={handleExportToExcel}
              className="py-2 px-4 shadow-xl rounded-xl font-semibold hover:shadow-2xl transition-all duration-200"
              style={{
                backgroundColor: "#efebe9",
                color: "#783A1E",
                border: "none",
              }}
            >
              Export to Excel
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 items-stretch sm:items-center p-4 rounded-lg bg-white shadow-md">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by staff name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg outline-none placeholder:text-gray-400 placeholder:italic"
            />
          </div>

                    <div className="relative w-full sm:w-48">
                        <select value={filterGender} onChange={(e) => setFilterGender(e.target.value)} className="appearance-none w-full pr-8 pl-3 py-2 border border-gray-300 rounded-lg bg-white outline-none">
                            <option value="">Filter by Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                        <ChevronsDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    </div>

                    <div className="relative w-full sm:w-48">
                        <select value={filterSalary} onChange={(e) => setFilterSalary(e.target.value)} className="appearance-none w-full pr-8 pl-3 py-2 border border-gray-300 rounded-lg bg-white outline-none">
                            <option value="">Filter by Salary</option>
                            <option value="low">Low (&lt; 100k)</option>
                            <option value="medium">Medium (100k - 300k)</option>
                            <option value="high">High (≥ 300k)</option>
                        </select>
                        <ChevronsDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    </div>

          <button
            onClick={() => fetchStaff()}
            disabled={loading}
            className="py-2 px-4 shadow-xl rounded-xl flex items-center justify-center disabled:opacity-50"
            style={{
              backgroundColor: CoffeeColors.ACTIVE_LINK_BG,
              color: CoffeeColors.ACTIVE_LINK_TEXT,
              border: "none",
            }}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />{" "}
            Refresh Data
          </button>
        </div>

        <div className="mt-8">
          <div className="w-full bg-white shadow-xl rounded-2xl overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead
                className="sticky top-0 z-10"
                style={{
                  backgroundColor: CoffeeColors.ACTIVE_LINK_BG,
                  color: CoffeeColors.DARK_BROWN,
                }}
              >
                <tr>
                  {TABLE_HEADERS.map((header) => (
                    <th
                      key={header.key}
                      className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider ${
                        header.type === "actions"
                          ? ""
                          : "cursor-pointer hover:bg-accent-btn/90"
                      } transition-colors duration-150`}
                      onClick={
                        header.type === "actions"
                          ? undefined
                          : () => requestSort(header.key)
                      }
                      scope="col"
                    >
                      <div
                        className={`flex items-center ${
                          header.type === "number"
                            ? "justify-end"
                            : header.type === "actions"
                            ? "justify-center"
                            : "justify-start"
                        }`}
                      >
                        {header.label}
                        {header.type !== "actions" && getSortIcon(header.key)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {renderTableContent()}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <StaffEntryModal
        isOpen={isStaffModalOpen}
        onClose={() => {
          setIsStaffModalOpen(false);
          setStaffToEdit(null);
        }}
        staffData={staffToEdit}
        onSave={handleSaveStaff}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && staffToDelete && (
        <div
          className="fixed inset-0 flex justify-center items-center transition-all duration-300 backdrop-blur-sm"
          style={{
            background:
              "linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(75, 52, 35, 0.5) 100%)",
            zIndex: 1000,
          }}
          onClick={() => {
            setShowDeleteModal(false);
            setStaffToDelete(null);
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md m-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#4A3423]">
                Confirm Delete
              </h3>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setStaffToDelete(null);
                }}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete staff member:{" "}
              <strong>
                {staffToDelete.first_name} {staffToDelete.last_name}
              </strong>
              ?
              <br />
              <span className="text-sm text-gray-500">
                This action cannot be undone.
              </span>
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setStaffToDelete(null);
                }}
                className="px-6 py-2.5 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-200"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteStaff}
                disabled={deleting}
                className="px-6 py-2.5 rounded-xl font-semibold text-white transition-all duration-200 flex items-center"
                style={{
                  background:
                    "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
                }}
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Staff Spreadsheet Modal */}
      <BulkStaffSpreadsheet
        isOpen={showBulkStaffModal}
        onClose={() => setShowBulkStaffModal(false)}
        onSaveSuccess={() => {
          fetchStaff();
          setShowSuccessMessage(true);
          setTimeout(() => setShowSuccessMessage(false), 3000);
        }}
      />
    </SideNav>
  );
}

export default StaffPage;
