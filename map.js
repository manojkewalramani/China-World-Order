// ===== CCD Interactive World Map =====
(function () {
    const mapEl = document.getElementById('ccdMap');
    const tooltip = document.getElementById('ccdTooltip');
    if (!mapEl) return;
    if (!window.d3 || !window.topojson) {
        mapEl.innerHTML = '<p style="color:#a02a15;text-align:center;padding:40px;font-size:0.9rem;">Map libraries failed to load. Check that <code>vendor/d3.min.js</code> and <code>vendor/topojson-client.min.js</code> are present.</p>';
        return;
    }

    // ISO-3 country code -> bilateral CCD metadata
    const BILATERAL = {
        KEN: { name: 'Kenya', year: '2017 / upgraded 2023', link: 'https://www.fmprc.gov.cn/eng/xw/zyxw/202310/t20231018_11162798.html', source: 'FMPRC' },
        MOZ: { name: 'Mozambique', year: '2023', link: 'http://en.people.cn/n3/2023/0918/c90000-20073948.html', source: "People's Daily" },
        KHM: { name: 'Cambodia', year: '2023', link: 'http://english.scio.gov.cn/pressroom/2023-02/11/content_85101148.htm', source: 'SCIO' },
        MYS: { name: 'Malaysia', year: '2023', link: 'https://www.kln.gov.my/web/chn_beijing/news-from-mission/-/asset_publisher/xdFx/blog/joint-statement-between-malaysia-and-china-on-building-a-community-with-a-shared-future', source: 'Malaysia MFA' },
        BRA: { name: 'Brazil', year: '2024', link: 'http://en.cidca.gov.cn/2024-11/21/c_1041317.htm', source: 'CIDCA' },
        SRB: { name: 'Serbia', year: '2024', link: 'https://www.mfa.gov.rs/en/press-service/statements/joint-statement-republic-serbia-and-peoples-republic-china-building-community', source: 'MFA Serbia' },
        ZAF: { name: 'South Africa', year: '2024', link: 'https://www.thepresidency.gov.za/joint-statement-peoples-republic-china-and-republic-south-africa', source: 'SA Presidency' },
        VNM: { name: 'Vietnam', year: '2023', link: 'https://en.baochinhphu.vn/joint-statement-on-further-deepening-and-elevating-comprehensive-strategic-cooperative-partnership-building-viet-nam-china-community-with-shared-future-111231213155430345.htm', source: 'Vietnam Gov.' },
        THA: { name: 'Thailand', year: '2022', link: 'https://www.gov.cn/xinwen/2022-11/20/content_5727893.htm', source: 'GOV.CN' },
        KGZ: { name: 'Kyrgyzstan', year: '2024', link: 'https://www.fmprc.gov.cn/eng/xw/zyxw/202402/t20240207_11240758.html', source: 'FMPRC' },
        UZB: { name: 'Uzbekistan', year: '2024', link: 'https://www.gov.cn/yaowen/liebiao/202401/content_6928120.htm', source: 'GOV.CN' },
        TKM: { name: 'Turkmenistan', year: '2023', link: 'https://www.newscentralasia.net/2023/01/07/china-turkmenistan-relations-elevated-to-comprehensive-strategic-partnership/', source: 'News Central Asia' },
        IDN: { name: 'Indonesia', year: '2024', link: 'https://www.fmprc.gov.cn/eng/xw/zyxw/202411/t20241110_11523888.html', source: 'FMPRC' },
        MMR: { name: 'Myanmar', year: '2020', link: 'http://www.china-embassy.org/eng/zgyw/202001/t20200118_3155573.htm', source: 'China Embassy' },
        LAO: { name: 'Laos', year: '2019', link: 'https://www.fmprc.gov.cn/eng/xw/zyxw/201904/t20190430_7811091.html', source: 'FMPRC' },
        PAK: { name: 'Pakistan', year: '2024', link: 'http://cpec.gov.pk/news/289', source: 'CPEC Authority' },
        NPL: { name: 'Nepal', year: '2019', link: 'https://www.fmprc.gov.cn/eng/xw/zyxw/201910/t20191013_7821115.html', source: 'FMPRC' },
        TJK: { name: 'Tajikistan', year: '2024', link: 'https://www.gov.cn/yaowen/liebiao/202405/content_6952482.htm', source: 'GOV.CN' },
        MNG: { name: 'Mongolia', year: '2024', link: 'https://www.mfa.gov.mn/en/news/103156', source: 'Mongolia MFA' },
        LKA: { name: 'Sri Lanka', year: '2025', link: 'https://www.fmprc.gov.cn/eng/xw/zyxw/202501/t20250115_11528998.html', source: 'FMPRC' },
        MDV: { name: 'Maldives', year: '2024', link: 'https://www.chinadaily.com.cn/a/202401/11/WS659f8a4ca3105f21a507a9d1.html', source: 'China Daily' },
        CUB: { name: 'Cuba', year: '2022', link: 'https://cubaminrex.cu/en/joint-statement-cuba-china', source: 'Cuba MINREX' },
        TLS: { name: 'Timor-Leste', year: '2024', link: 'https://www.gov.cn/yaowen/liebiao/202407/content_6964902.htm', source: 'GOV.CN' },
        ZMB: { name: 'Zambia', year: '2024', link: 'https://www.gov.cn/yaowen/liebiao/202409/content_6974442.htm', source: 'GOV.CN' },
    };

    // Regional groupings — country ISO-3 lists (member states)
    const REGIONAL_GROUPS = {
        'China–Africa': ['DZA','AGO','BEN','BWA','BFA','BDI','CMR','CPV','CAF','TCD','COM','COG','COD','CIV','DJI','EGY','GNQ','ERI','SWZ','ETH','GAB','GMB','GHA','GIN','GNB','KEN','LSO','LBR','LBY','MDG','MWI','MLI','MRT','MAR','MOZ','NAM','NER','NGA','RWA','STP','SEN','SYC','SLE','SOM','ZAF','SSD','SDN','TGO','TUN','UGA','TZA','ZMB','ZWE'],
        'China–Arab States': ['DZA','BHR','COM','DJI','EGY','IRQ','JOR','KWT','LBN','LBY','MRT','MAR','OMN','PSE','QAT','SAU','SOM','SDN','SYR','TUN','ARE','YEM'],
        'China–Latin America &amp; Caribbean': ['ARG','BOL','BRA','CHL','COL','CRI','CUB','DOM','ECU','SLV','GTM','GUY','HTI','HND','JAM','MEX','NIC','PAN','PRY','PER','SUR','TTO','URY','VEN','BLZ','BHS','BRB'],
        'China–Pacific Islands': ['FJI','PNG','SLB','VUT','WSM','TON','KIR','FSM','NIU','COK'],
        'China–ASEAN': ['BRN','KHM','IDN','LAO','MYS','MMR','PHL','SGP','THA','VNM'],
        'Lancang–Mekong': ['KHM','LAO','MMR','THA','VNM'],
        'China–Central Asia': ['KAZ','KGZ','TJK','TKM','UZB'],
    };

    // Build set of regional member ISO codes
    const regionalSet = new Set();
    Object.values(REGIONAL_GROUPS).forEach(arr => arr.forEach(c => regionalSet.add(c)));

    // Map each ISO to the list of regional groups it belongs to
    const isoToRegions = {};
    for (const [group, arr] of Object.entries(REGIONAL_GROUPS)) {
        arr.forEach(iso => {
            (isoToRegions[iso] = isoToRegions[iso] || []).push(group);
        });
    }

    // ----- Setup SVG -----
    const width = mapEl.clientWidth || 1000;
    const height = Math.round(width * 0.55);

    const svg = d3.select(mapEl)
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .attr('class', 'ccd-svg');

    const projection = d3.geoNaturalEarth1()
        .scale(width / 6.3)
        .translate([width / 2, height / 1.85]);

    const path = d3.geoPath(projection);
    const g = svg.append('g');

    // Zoom support
    svg.call(d3.zoom().scaleExtent([1, 5]).on('zoom', (e) => {
        g.attr('transform', e.transform);
    }));

    // ----- Load world TopoJSON (vendored locally) -----
    const WORLD_URL = 'vendor/countries-110m.json';
    // world-atlas uses ISO numeric codes; map to ISO-3
    const NUM_TO_A3_URL = 'https://cdn.jsdelivr.net/npm/country-iso@0.1.0/data.json';

    // Manual lookup table for numeric -> A3 (small, reliable, no extra fetch)
    const NUM_TO_A3 = {"004":"AFG","008":"ALB","012":"DZA","016":"ASM","020":"AND","024":"AGO","660":"AIA","010":"ATA","028":"ATG","032":"ARG","051":"ARM","533":"ABW","036":"AUS","040":"AUT","031":"AZE","044":"BHS","048":"BHR","050":"BGD","052":"BRB","112":"BLR","056":"BEL","084":"BLZ","204":"BEN","060":"BMU","064":"BTN","068":"BOL","070":"BIH","072":"BWA","074":"BVT","076":"BRA","086":"IOT","096":"BRN","100":"BGR","854":"BFA","108":"BDI","132":"CPV","116":"KHM","120":"CMR","124":"CAN","136":"CYM","140":"CAF","148":"TCD","152":"CHL","156":"CHN","162":"CXR","166":"CCK","170":"COL","174":"COM","178":"COG","180":"COD","184":"COK","188":"CRI","384":"CIV","191":"HRV","192":"CUB","531":"CUW","196":"CYP","203":"CZE","208":"DNK","262":"DJI","212":"DMA","214":"DOM","218":"ECU","818":"EGY","222":"SLV","226":"GNQ","232":"ERI","233":"EST","748":"SWZ","231":"ETH","238":"FLK","234":"FRO","242":"FJI","246":"FIN","250":"FRA","254":"GUF","258":"PYF","260":"ATF","266":"GAB","270":"GMB","268":"GEO","276":"DEU","288":"GHA","292":"GIB","300":"GRC","304":"GRL","308":"GRD","312":"GLP","316":"GUM","320":"GTM","831":"GGY","324":"GIN","624":"GNB","328":"GUY","332":"HTI","334":"HMD","336":"VAT","340":"HND","344":"HKG","348":"HUN","352":"ISL","356":"IND","360":"IDN","364":"IRN","368":"IRQ","372":"IRL","833":"IMN","376":"ISR","380":"ITA","388":"JAM","392":"JPN","832":"JEY","400":"JOR","398":"KAZ","404":"KEN","296":"KIR","408":"PRK","410":"KOR","414":"KWT","417":"KGZ","418":"LAO","428":"LVA","422":"LBN","426":"LSO","430":"LBR","434":"LBY","438":"LIE","440":"LTU","442":"LUX","446":"MAC","807":"MKD","450":"MDG","454":"MWI","458":"MYS","462":"MDV","466":"MLI","470":"MLT","584":"MHL","474":"MTQ","478":"MRT","480":"MUS","175":"MYT","484":"MEX","583":"FSM","498":"MDA","492":"MCO","496":"MNG","499":"MNE","500":"MSR","504":"MAR","508":"MOZ","104":"MMR","516":"NAM","520":"NRU","524":"NPL","528":"NLD","540":"NCL","554":"NZL","558":"NIC","562":"NER","566":"NGA","570":"NIU","574":"NFK","580":"MNP","578":"NOR","512":"OMN","586":"PAK","585":"PLW","275":"PSE","591":"PAN","598":"PNG","600":"PRY","604":"PER","608":"PHL","612":"PCN","616":"POL","620":"PRT","630":"PRI","634":"QAT","638":"REU","642":"ROU","643":"RUS","646":"RWA","652":"BLM","654":"SHN","659":"KNA","662":"LCA","663":"MAF","666":"SPM","670":"VCT","882":"WSM","674":"SMR","678":"STP","682":"SAU","686":"SEN","688":"SRB","690":"SYC","694":"SLE","702":"SGP","534":"SXM","703":"SVK","705":"SVN","090":"SLB","706":"SOM","710":"ZAF","239":"SGS","728":"SSD","724":"ESP","144":"LKA","729":"SDN","740":"SUR","744":"SJM","752":"SWE","756":"CHE","760":"SYR","158":"TWN","762":"TJK","834":"TZA","764":"THA","626":"TLS","768":"TGO","772":"TKL","776":"TON","780":"TTO","788":"TUN","792":"TUR","795":"TKM","796":"TCA","798":"TUV","800":"UGA","804":"UKR","784":"ARE","826":"GBR","840":"USA","581":"UMI","858":"URY","860":"UZB","548":"VUT","862":"VEN","704":"VNM","092":"VGB","850":"VIR","876":"WLF","732":"ESH","887":"YEM","894":"ZMB","716":"ZWE"};

    // India's claimed northern boundary per the GoI 1:40,000,000 map — traces
    // the Hindu Kush → Karakoram → Kunlun line across J&K + Aksai Chin. Drawn
    // as a visible stroke on top of the overlay so Aksai Chin's northern edge
    // (otherwise invisible, since both Aksai Chin and Xinjiang render in the
    // neutral base colour) is properly marked.
    const INDIA_CLAIM_LINE = {
        type: 'Feature',
        properties: { name: 'India northern claim (GoI)' },
        geometry: {
            type: 'LineString',
            coordinates: [
                // Hindu Kush / Wakhan / Pak-Afghan-China triborder
                [73.20, 35.10], [73.60, 35.80], [74.20, 36.50], [74.70, 36.80], [75.10, 37.05],
                // Karakoram range heading E
                [75.90, 36.75], [76.60, 36.40], [77.10, 36.00], [77.55, 35.55],
                // Kunlun range across northern Aksai Chin
                [78.10, 35.55], [78.80, 35.60], [79.50, 35.50], [80.05, 35.25],
                // Eastern edge of Aksai Chin (India-Tibet LAC per GoI)
                [80.30, 34.75], [80.05, 34.25], [79.45, 33.95]
            ]
        }
    };

    // GeoJSON overlay reflecting India's official political map (Government of India
    // 1:40,000,000 world map). A single continuous polygon covers the full claim:
    // all of Jammu & Kashmir (including PoK + Gilgit-Baltistan) + Aksai Chin.
    // Southern edges extend slightly into current Indian territory to mask the
    // underlying world-atlas LoC / LAC strokes. Outer northern edge aligns with
    // Pakistan's Pak-Afghan-China border (Wakhan, Hindu Kush, Karakoram) and
    // China's Xinjiang border (Kunlun range), so those strokes remain visible as
    // India's northern boundary under the GoI map.
    const INDIA_OVERLAYS = {
        type: 'FeatureCollection',
        features: [
            {
                type: 'Feature',
                properties: { name: 'J&K + Gilgit-Baltistan + Aksai Chin (per GoI)' },
                geometry: {
                    type: 'Polygon',
                    coordinates: [[
                        // SW corner (near Jammu LoC, extended south into Indian Punjab)
                        [74.30, 32.45],
                        // Western edge — AJK border with Pakistan Punjab, going N
                        [74.00, 33.30], [73.65, 34.00], [73.30, 34.65], [73.20, 35.10],
                        // Northern edge — Hindu Kush / Wakhan / Pak-Afghan-China triborder
                        [73.60, 35.80], [74.20, 36.50], [74.70, 36.80], [75.10, 37.05],
                        // Karakoram range heading E
                        [75.90, 36.75], [76.60, 36.40], [77.10, 36.00], [77.55, 35.55],
                        // Kunlun range across Aksai Chin to Tibet border
                        [78.10, 35.55], [78.80, 35.60], [79.50, 35.50], [80.05, 35.25],
                        // Eastern edge of Aksai Chin (India-Tibet LAC per GoI)
                        [80.30, 34.75], [80.05, 34.25], [79.45, 33.95],
                        // Southern edge pushed ~0.3° south into Ladakh to mask LAC stroke
                        [78.70, 33.75], [78.00, 33.90], [77.30, 33.95], [76.70, 33.90],
                        // LoC area — pushed south to mask India-Pakistan stroke
                        [76.20, 33.25], [75.55, 32.75], [74.90, 32.45], [74.30, 32.45]
                    ]]
                }
            }
        ]
    };

    d3.json(WORLD_URL).then((world) => {
        const countries = topojson.feature(world, world.objects.countries).features;

        g.selectAll('path.country')
            .data(countries)
            .enter().append('path')
            .attr('class', (d) => {
                const iso = NUM_TO_A3[String(d.id).padStart(3, '0')] || '';
                const bi = !!BILATERAL[iso];
                const re = regionalSet.has(iso);
                if (bi && re) return 'country ccd-country--both';
                if (bi) return 'country ccd-country--bilateral';
                if (re) return 'country ccd-country--regional';
                return 'country';
            })
            .attr('d', path)
            .attr('data-iso', (d) => NUM_TO_A3[String(d.id).padStart(3, '0')] || '')
            .on('mousemove', function (event, d) {
                const iso = NUM_TO_A3[String(d.id).padStart(3, '0')] || '';
                const bi = BILATERAL[iso];
                const regions = isoToRegions[iso] || [];
                if (!bi && regions.length === 0) { tooltip.classList.remove('show'); return; }

                let html = '';
                if (bi) {
                    html += `<div class="tt-name">${bi.name}</div>`;
                    html += `<div class="tt-meta">Bilateral CCD &middot; ${bi.year}</div>`;
                    html += `<div class="tt-src">Source: ${bi.source}</div>`;
                } else {
                    // regional-only: look up country name from feature properties
                    const name = (d.properties && d.properties.name) || iso;
                    html += `<div class="tt-name">${name}</div>`;
                    html += `<div class="tt-meta">Regional CCD member</div>`;
                }
                if (regions.length) {
                    html += `<div class="tt-regions">${regions.map(r => `<span>${r}</span>`).join('')}</div>`;
                }
                if (bi) html += `<div class="tt-cta">Click to open source &rarr;</div>`;

                tooltip.innerHTML = html;
                tooltip.classList.add('show');
                const rect = mapEl.getBoundingClientRect();
                const x = event.clientX - rect.left + 14;
                const y = event.clientY - rect.top + 14;
                tooltip.style.left = x + 'px';
                tooltip.style.top = y + 'px';
            })
            .on('mouseleave', () => tooltip.classList.remove('show'))
            .on('click', function (event, d) {
                const iso = NUM_TO_A3[String(d.id).padStart(3, '0')] || '';
                const bi = BILATERAL[iso];
                if (bi && bi.link) {
                    window.open(bi.link, '_blank', 'noopener');
                }
            });

        // Overlay India's official boundary claims on top, rendered as neutral (India fill)
        g.append('g')
            .attr('class', 'india-overlay')
            .selectAll('path')
            .data(INDIA_OVERLAYS.features)
            .enter().append('path')
            .attr('d', path)
            .attr('class', 'country ccd-india-claimed');

        // Draw the northern claim line (Hindu Kush → Karakoram → Kunlun) as a
        // visible stroke on top of the overlay, so Aksai Chin's northern edge
        // is properly marked per the GoI map.
        g.append('path')
            .datum(INDIA_CLAIM_LINE)
            .attr('d', path)
            .attr('class', 'ccd-india-claim-line');
    }).catch((err) => {
        console.error('Failed to load world map', err);
        mapEl.innerHTML = '<p style="color:#a02a15;text-align:center;padding:40px;font-size:0.9rem;">Map data failed to load: ' + (err && err.message ? err.message : 'unknown error') + '. Check that <code>vendor/countries-110m.json</code> is present and served correctly.</p>';
    });
})();
