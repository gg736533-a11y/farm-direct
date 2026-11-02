import React, { useMemo, useState } from 'react';
import { MapPin, LocateFixed, Sprout, Landmark, CheckCircle2, AlertCircle, BookOpen, Droplets, CalendarDays, Users, ExternalLink, Search } from 'lucide-react';

const schemes = [
  { id:'pmkisan', name:'PM-KISAN Samman Nidhi', group:'Income support', audience:'farmer', crops:['all'], purpose:'Income support for eligible landholding farmer families.', benefits:'₹6,000 per year in three instalments, subject to scheme rules.', eligibility:['Eligible landholding farmer family','Land records and e-KYC must meet current requirements'], excludes:'Certain institutional landholders and specified higher-income / government-service categories are excluded under scheme rules.', url:'https://pmkisan.gov.in/' },
  { id:'pmfby', name:'Pradhan Mantri Fasal Bima Yojana (PMFBY)', group:'Crop insurance', audience:'farmer', crops:['rice','maize','groundnut','cotton','millet','sugarcane','pulses'], purpose:'Crop insurance against notified natural risks for notified crops and areas.', benefits:'Financial risk protection for insured, eligible crops; premium and claim rules depend on notification.', eligibility:['Crop and village/area must be notified for the season','Enrollment within the official deadline','Land/cultivation and crop details must be documented'], excludes:'Not every crop or location is notified every season. Check the current state/season notification.', url:'https://pmfby.gov.in/' },
  { id:'kcc', name:'Kisan Credit Card (KCC)', group:'Agricultural credit', audience:'farmer', crops:['all'], purpose:'Short-term credit for eligible cultivation and allied farming needs.', benefits:'Access to sanctioned agricultural credit subject to lender appraisal and current rules.', eligibility:['Eligible farmers, tenant farmers or eligible farmer groups as accepted by the lender','KYC and cultivation/land or tenancy documents as required'], excludes:'Credit limit, interest concessions and approval are decided by the bank under applicable rules.', url:'https://www.myscheme.gov.in/' },
  { id:'soil', name:'Soil Health Card Scheme', group:'Soil testing', audience:'farmer', crops:['all'], purpose:'Soil testing and nutrient-management guidance.', benefits:'Helps choose balanced fertiliser use based on soil test results.', eligibility:['Farmers can contact the local soil testing laboratory or agriculture department','Availability and process vary by location'], excludes:'A card is not a guaranteed subsidy or cash benefit.', url:'https://soilhealth.dac.gov.in/' },
  { id:'pmksy', name:'Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)', group:'Irrigation', audience:'farmer', crops:['rice','sugarcane','banana','vegetables','groundnut','cotton','maize'], purpose:'Improve irrigation access and water-use efficiency through applicable components.', benefits:'Potential support for eligible irrigation/water-saving activities under local components.', eligibility:['Component and application window must be active in the state/district','Farm and equipment/activity must meet the component guidelines'], excludes:'Support and subsidy levels vary by component and state; verify before purchasing equipment.', url:'https://pmksy.gov.in/' },
  { id:'tnhort', name:'State agriculture / horticulture assistance', group:'Seeds, plants & horticulture', audience:'farmer', crops:['vegetables','banana','mango','flowers','pulses','all'], purpose:'State and district programs may support seeds, seedlings, horticulture, protected cultivation or farm inputs.', benefits:'Possible input or infrastructure assistance where a current component is available.', eligibility:['Depends on the current Tamil Nadu department notification','Crop, district, farmer category and approved cost norms may matter'], excludes:'This is a discovery category, not a promise that a specific subsidy is open.', url:'https://www.tn.gov.in/' },
  { id:'consumer', name:'Consumer benefits (indirect)', group:'Consumer information', audience:'consumer', crops:['all'], purpose:'FarmDirect helps consumers discover local farmers and product origin; government farmer schemes generally pay or support eligible farmers, not marketplace consumers.', benefits:'Potential indirect benefit through a more resilient local supply chain and clearer product provenance; no direct consumer payment is implied.', eligibility:['Browse local products and check farmer/product details on FarmDirect'], excludes:'Do not treat farmer-only schemes as consumer entitlements.', url:'https://www.myscheme.gov.in/' }
];

const cropGuides = {
 rice:{name:'Rice / Paddy', soil:'Clay or alluvial soil with reliable water management', season:'Season varies by region; in Tamil Nadu, follow the local samba/kuruvai/navarai calendar.', seed:'Choose a locally recommended, certified variety suited to season, duration and water availability.', steps:['Test soil and prepare a level field with suitable drainage and bunds.','Select certified seed and use the recommended seed treatment from the agriculture department.','Establish seedlings or direct-sow using the locally recommended method and spacing.','Maintain water carefully; avoid unnecessary continuous flooding where alternate methods are advised.','Apply fertiliser based on soil test and crop stage; monitor weeds, pests and diseases regularly.','Harvest when grains reach recommended maturity and dry safely before storage.'], water:'High and carefully managed water need; method and season strongly affect use.', duration:'Usually around 100–150 days depending on variety.'},
 groundnut:{name:'Groundnut', soil:'Well-drained sandy loam or red loam; avoid waterlogging', season:'Choose sowing window based on local rainfall and irrigation availability.', seed:'Use certified, healthy seed of a variety recommended for your district.', steps:['Prepare a fine, well-drained seedbed and confirm soil pH/nutrients.','Treat seed only with products and rates recommended by an agricultural officer.','Sow at locally recommended spacing and depth when soil moisture is adequate.','Keep the field weed-free during early growth and use soil-test-based nutrients.','Monitor leaf spots, pests and moisture stress; use integrated pest management.','Harvest when pods mature, dry them properly and store in a dry, ventilated place.'], water:'Moderate; critical during flowering, pegging and pod development.', duration:'About 90–130 days depending on variety.'},
 tomato:{name:'Tomato', soil:'Well-drained loamy soil rich in organic matter', season:'Use a locally recommended season; protect plants from extreme heat and heavy rain.', seed:'Choose certified seed or healthy seedlings of a variety suited to your region and disease pressure.', steps:['Prepare raised beds and add well-decomposed organic matter based on soil advice.','Raise healthy seedlings in a clean nursery and transplant at the recommended age.','Provide spacing, staking and mulch where suitable; avoid damaging roots.','Water consistently without waterlogging; prefer drip irrigation if available.','Inspect weekly for fruit borer, wilt and leaf diseases; use integrated pest management.','Harvest at the maturity stage required for local sale and handle fruit gently.'], water:'Regular, even moisture; avoid both drought stress and waterlogging.', duration:'First harvest often begins around 60–90 days after transplanting, varying by variety.'},
 banana:{name:'Banana', soil:'Deep, fertile, well-drained loam with reliable water', season:'Planting time depends on variety, district and irrigation; seek local advice.', seed:'Use disease-free, true-to-type tissue-culture plants or healthy suckers from a reliable source.', steps:['Prepare pits and improve soil with well-decomposed organic matter as locally advised.','Plant healthy material at recommended spacing for the selected variety.','Irrigate regularly and ensure drainage; banana is sensitive to water stress and waterlogging.','Apply nutrients in split doses based on soil test and local package of practices.','Remove unwanted suckers, support bunches when needed and monitor pests/diseases.','Harvest bunches at market-appropriate maturity and handle without bruising.'], water:'High and regular; drip irrigation can improve water-use efficiency.', duration:'Often 9–15 months to harvest, depending on cultivar and conditions.'},
 maize:{name:'Maize', soil:'Well-drained loamy soil; avoid waterlogged fields', season:'Sowing windows depend on monsoon and irrigation in your district.', seed:'Use certified seed of a hybrid/variety recommended for your district and intended use.', steps:['Prepare a well-drained field and use soil-test results for nutrient planning.','Sow at recommended spacing and depth with adequate moisture.','Thin or gap-fill early if plant stand is poor.','Apply nutrients at recommended stages; protect the crop from weeds early.','Monitor fall armyworm and other pests; follow integrated pest management advice.','Harvest when cobs/grain reach maturity and dry to safe storage moisture.'], water:'Moderate; flowering and grain filling are sensitive to moisture stress.', duration:'Usually around 80–120 days depending on variety.'},
 millet:{name:'Millets (sorghum / pearl millet)', soil:'Often suited to well-drained soils and lower-rainfall conditions; crop-specific choice matters.', season:'Select the locally recommended millet and sowing season for your district.', seed:'Choose certified seed of a locally recommended variety.', steps:['Prepare a fine seedbed with good drainage.','Sow at recommended spacing and seed rate for the chosen millet.','Control weeds during early establishment.','Use soil-test-based nutrients and conserve soil moisture with suitable practices.','Monitor locally common pests and diseases.','Harvest at maturity and dry grain before storage.'], water:'Generally lower than paddy, but establishment and flowering still need moisture.', duration:'Often 75–120 days depending on millet and variety.'},
 pulses:{name:'Pulses (black gram / green gram / pigeon pea)', soil:'Well-drained soil; crop and variety should match soil and rainfall.', season:'Use district-specific sowing advice; avoid waterlogging.', seed:'Use certified seed and recommended seed treatment/inoculation guidance from local experts.', steps:['Prepare a well-drained field and select a variety suited to season and duration.','Sow at recommended spacing with adequate soil moisture.','Avoid excess nitrogen and follow nutrient advice for the selected pulse.','Keep weeds under control during early growth.','Monitor pod borers, diseases and moisture stress; use integrated management.','Harvest when pods mature and dry safely to reduce storage losses.'], water:'Usually moderate to low; sensitive to waterlogging.', duration:'About 60–180 days depending on pulse species.'}
};

const cropOptions = [ ['rice','Rice / Paddy'], ['groundnut','Groundnut'], ['tomato','Tomato'], ['banana','Banana'], ['maize','Maize'], ['millet','Millets'], ['pulses','Pulses'] ];

function scoreScheme(s, role, crop, district, state) {
 let score = 0; const reasons = [];
 if (s.audience === role || s.audience === 'both') { score += 3; reasons.push(role === 'farmer' ? 'Designed for farmers' : 'Consumer-facing information'); }
 if (s.crops.includes('all') || s.crops.includes(crop) || (crop === 'tomato' && s.crops.includes('vegetables'))) { score += 2; reasons.push('Relevant to selected crop or general farm needs'); }
 if (state.trim()) { score += 1; reasons.push(`Location entered: ${state.trim()}`); }
 if (district.trim()) { score += 1; reasons.push(`District entered: ${district.trim()}`); }
 return { ...s, score, reasons };
}

export default function AgricultureAdvisorPage() {
 const [role, setRole] = useState('farmer');
 const [state, setState] = useState('Tamil Nadu');
 const [district, setDistrict] = useState('');
 const [crop, setCrop] = useState('rice');
 const [farmSize, setFarmSize] = useState('');
 const [purpose, setPurpose] = useState('all');
 const [gps, setGps] = useState(null);
 const [gpsStatus, setGpsStatus] = useState('');
 const [gpsLoading, setGpsLoading] = useState(false);
 const [selectedGuide, setSelectedGuide] = useState('rice');
 const [query, setQuery] = useState('');

 const locate = () => {
   if (!navigator.geolocation) { setGpsStatus('This browser does not support GPS location. Enter your state and district manually.'); return; }
   setGpsLoading(true); setGpsStatus('Requesting location permission…');
   navigator.geolocation.getCurrentPosition(async (pos) => {
     const point = { lat: pos.coords.latitude, lon: pos.coords.longitude };
     setGps(point); setGpsStatus('GPS coordinates captured. Looking up area name…');
     try {
       const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${point.lat}&lon=${point.lon}`);
       if (response.ok) {
         const data = await response.json(); const a = data.address || {};
         const foundState = a.state || ''; const foundDistrict = a.state_district || a.county || a.city_district || a.city || a.town || '';
         if (foundState) setState(foundState); if (foundDistrict) setDistrict(foundDistrict);
         setGpsStatus(`Location detected${foundDistrict || foundState ? `: ${[foundDistrict, foundState].filter(Boolean).join(', ')}` : ''}. Check the fields before using recommendations.`);
       } else setGpsStatus('GPS coordinates captured. Enter or confirm your district and state manually.');
     } catch { setGpsStatus('GPS coordinates captured; area lookup unavailable. Enter your district and state manually.'); }
     setGpsLoading(false);
   }, (error) => { setGpsLoading(false); setGpsStatus(error.code === 1 ? 'Location permission was denied. Enter your state and district manually.' : 'Could not get GPS location. Check device location settings or enter your location manually.'); }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 300000 });
 };

 const recommendations = useMemo(() => schemes
   .filter(s => purpose === 'all' || s.group.toLowerCase().includes(purpose))
   .filter(s => role === 'farmer' ? s.audience !== 'consumer' : s.audience === 'consumer')
   .filter(s => !query || `${s.name} ${s.group} ${s.purpose} ${s.benefits}`.toLowerCase().includes(query.toLowerCase()))
   .map(s => scoreScheme(s, role, crop, district, state)).sort((a,b) => b.score-a.score), [role, crop, district, state, purpose, query]);
 const guide = cropGuides[selectedGuide];
 const schemeTitle = role === 'farmer' ? 'Scheme discovery & eligibility assistant' : 'Consumer benefits & scheme information';

 return <div className="min-h-screen bg-[#FAF8F5] pb-16">
   <section className="bg-gradient-to-br from-forest-950 via-forest-900 to-emerald-800 text-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
     <p className="text-sm uppercase tracking-[0.2em] text-emerald-200 font-bold">FarmDirect • Agriculture intelligence</p>
     <h1 className="mt-3 text-3xl md:text-5xl font-extrabold tracking-tight">Location-aware Farm Advisor</h1>
     <p className="mt-4 max-w-3xl text-emerald-50/90 text-base md:text-lg">Set your location, explore agriculture schemes that may fit your crop and profile, and follow a practical crop cultivation guide.</p>
     <div className="mt-6 flex flex-wrap gap-2 text-sm"><span className="rounded-full bg-white/10 px-3 py-1.5">GPS location</span><span className="rounded-full bg-white/10 px-3 py-1.5">Scheme matching</span><span className="rounded-full bg-white/10 px-3 py-1.5">Crop growth guide</span></div>
    </div>
   </section>
   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-5 space-y-8">
    <section className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-5 md:p-7">
     <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
      <div><h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><MapPin className="text-emerald-700"/> Your location & farming profile</h2><p className="text-sm text-slate-600 mt-1">GPS is optional. You can enter the area manually; location is used in this page to tailor suggestions.</p></div>
      <button onClick={locate} disabled={gpsLoading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 disabled:opacity-60 text-white font-semibold px-4 py-2.5"><LocateFixed size={18}/>{gpsLoading ? 'Detecting…' : 'Use my GPS location'}</button>
     </div>
     {gpsStatus && <p className="mt-3 text-sm text-emerald-800 bg-emerald-50 rounded-lg p-3" role="status">{gpsStatus}</p>}
     {gps && <p className="mt-2 text-xs text-slate-500">Coordinates: {gps.lat.toFixed(5)}, {gps.lon.toFixed(5)}</p>}
     <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
      <label className="text-sm font-semibold text-slate-700">I am a<select value={role} onChange={e=>setRole(e.target.value)} className="mt-1 block w-full rounded-xl border border-slate-300 p-3 bg-white"><option value="farmer">Farmer / grower</option><option value="consumer">Consumer / buyer</option></select></label>
      <label className="text-sm font-semibold text-slate-700">State<input value={state} onChange={e=>setState(e.target.value)} placeholder="e.g. Tamil Nadu" className="mt-1 block w-full rounded-xl border border-slate-300 p-3"/></label>
      <label className="text-sm font-semibold text-slate-700">District<input value={district} onChange={e=>setDistrict(e.target.value)} placeholder="e.g. Salem" className="mt-1 block w-full rounded-xl border border-slate-300 p-3"/></label>
      <label className="text-sm font-semibold text-slate-700">Main crop<select value={crop} onChange={e=>setCrop(e.target.value)} className="mt-1 block w-full rounded-xl border border-slate-300 p-3 bg-white">{cropOptions.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
     </div>
     {role === 'farmer' && <label className="block mt-4 max-w-xs text-sm font-semibold text-slate-700">Farm size (acres, optional)<input type="number" min="0" value={farmSize} onChange={e=>setFarmSize(e.target.value)} placeholder="e.g. 2.5" className="mt-1 block w-full rounded-xl border border-slate-300 p-3"/><span className="block text-xs text-slate-500 mt-1">Used only as context; scheme eligibility may require official land records.</span></label>}
    </section>

    <section className="space-y-4">
     <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3"><div><p className="text-sm uppercase tracking-widest text-emerald-700 font-bold">Smart matching</p><h2 className="text-2xl font-extrabold text-slate-900">{schemeTitle}</h2><p className="text-slate-600 mt-1">Rule-based recommendations use your role, crop and entered location. This is a guidance tool, not an official eligibility decision.</p></div>
      <div className="flex flex-col sm:flex-row gap-2"><div className="relative"><Search className="absolute left-3 top-3 text-slate-400" size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search schemes" className="rounded-xl border border-slate-300 pl-9 pr-3 py-2.5 w-full sm:w-52"/></div><select value={purpose} onChange={e=>setPurpose(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2.5 bg-white"><option value="all">All categories</option><option value="insurance">Crop insurance</option><option value="credit">Credit</option><option value="soil">Soil testing</option><option value="irrigation">Irrigation</option><option value="seeds">Seeds & horticulture</option></select></div>
     </div>
     {role === 'consumer' && <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">Most government agriculture schemes are designed for eligible farmers, not consumers directly. FarmDirect displays consumer-relevant information separately so farmer-only benefits are not presented as consumer entitlements.</div>}
     <div className="grid lg:grid-cols-2 gap-4">
      {recommendations.map(s=><article key={s.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col">
       <div className="flex items-start justify-between gap-3"><div><span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full"><Landmark size={13}/>{s.group}</span><h3 className="mt-3 text-lg font-bold text-slate-900">{s.name}</h3></div><CheckCircle2 className="text-emerald-700 shrink-0"/></div>
       <p className="text-sm text-slate-600 mt-2">{s.purpose}</p><p className="text-sm mt-3"><strong className="text-slate-800">Possible benefit: </strong><span className="text-slate-600">{s.benefits}</span></p>
       <div className="mt-4"><h4 className="text-sm font-bold text-slate-800">Eligibility checklist to verify</h4><ul className="mt-2 space-y-1.5">{s.eligibility.map(item=><li key={item} className="flex gap-2 text-sm text-slate-600"><CheckCircle2 size={15} className="text-emerald-700 shrink-0 mt-0.5"/>{item}</li>)}</ul></div>
       <p className="mt-3 text-xs text-amber-800 bg-amber-50 rounded-lg p-3"><AlertCircle size={14} className="inline mr-1"/>{s.excludes}</p>
       <div className="mt-auto pt-4 flex items-center justify-between gap-3"><span className="text-xs text-slate-500">Match context: {state || 'state not entered'}{district ? ` • ${district}` : ''} • {cropOptions.find(x=>x[0]===crop)?.[1]}</span><a href={s.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-bold text-emerald-800 hover:underline whitespace-nowrap">Official portal <ExternalLink size={14}/></a></div>
      </article>)}
     </div>
     {recommendations.length===0 && <div className="bg-white rounded-xl p-8 text-center text-slate-600">No matching items. Try a different search or category.</div>}
     <p className="text-xs text-slate-500">Scheme names and portals are provided as a starting point. Benefits, deadlines, notified crops, documents and exclusions can change. Confirm the current notification with the official portal or local agriculture office before applying.</p>
    </section>

    <section className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-5 md:p-7">
     <div className="flex items-start gap-3"><div className="rounded-xl bg-emerald-100 p-3 text-emerald-800"><Sprout size={24}/></div><div><p className="text-sm uppercase tracking-widest text-emerald-700 font-bold">Cultivation planner</p><h2 className="text-2xl font-extrabold text-slate-900">Seed & crop growth recommendations</h2><p className="text-slate-600 mt-1">Choose a crop to view a step-by-step growing guide, water needs and typical duration.</p></div></div>
     <div className="mt-5 grid md:grid-cols-[260px_1fr] gap-6">
      <div><label className="text-sm font-semibold text-slate-700">Select crop<select value={selectedGuide} onChange={e=>setSelectedGuide(e.target.value)} className="mt-1 block w-full rounded-xl border border-slate-300 p-3 bg-white">{cropOptions.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
       <div className="mt-4 rounded-xl bg-emerald-50 p-4"><p className="text-sm font-bold text-emerald-900 flex gap-2 items-center"><Droplets size={17}/> Water needs</p><p className="text-sm text-emerald-900 mt-2">{guide.water}</p><p className="text-sm font-bold text-emerald-900 flex gap-2 items-center mt-4"><CalendarDays size={17}/> Typical duration</p><p className="text-sm text-emerald-900 mt-2">{guide.duration}</p></div>
      </div>
      <div><h3 className="text-xl font-bold text-slate-900">{guide.name}</h3><p className="text-sm text-slate-600 mt-2"><strong>Suitable soil:</strong> {guide.soil}</p><p className="text-sm text-slate-600 mt-2"><strong>Seed selection:</strong> {guide.seed}</p><h4 className="mt-5 font-bold text-slate-900 flex items-center gap-2"><BookOpen size={18} className="text-emerald-700"/> Cultivation steps</h4><ol className="mt-3 space-y-3">{guide.steps.map((step,i)=><li key={step} className="flex gap-3 text-sm text-slate-700"><span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold shrink-0">{i+1}</span><span className="pt-1">{step}</span></li>)}</ol></div>
     </div>
     <div className="mt-6 rounded-xl bg-amber-50 border border-amber-100 p-4 text-sm text-amber-900"><AlertCircle size={16} className="inline mr-1"/>This guide provides general educational advice. Variety, sowing dates, seed rate, fertiliser doses and pest-control measures must be chosen for the local climate and soil test. Ask your district agriculture / Krishi Vigyan Kendra expert for exact recommendations.</div>
    </section>
    <section className="rounded-2xl bg-slate-900 text-white p-5 md:p-7"><div className="flex gap-3 items-start"><Users className="text-emerald-300 mt-1"/><div><h2 className="text-lg font-bold">How this helps farmers and consumers</h2><p className="text-sm text-slate-300 mt-2">Farmers get a shortlist of schemes to verify, crop-specific growing steps and official links. Consumers can understand how farmer support programs work and distinguish direct consumer benefits from farmer-only support. Location permission is optional and is requested only when you press the GPS button.</p></div></div></section>
   </div>
 </div>;
}
