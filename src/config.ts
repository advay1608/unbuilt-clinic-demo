// Everything the clinic would change lives here. Values marked EDIT are placeholders to confirm with
// Dr. Manisha before the site goes live. Any value can also be set from the link, e.g.
//   ?phone=98XXXXXXXX&address=...&area=College%20Road
// With no phone set, the booking form shows a preview of the WhatsApp message instead of opening WhatsApp.

export type Clinic = {
  name: string; short: string; dr: string; first: string; qual: string;
  area: string; city: string; address: string; phone: string;
  hours: { days: string; time: string }[]; closed: number[]; maps: string;
};

const defaults: Clinic = {
  name: 'Dr. Manisha Ahiwalay’s Homeopathy Clinic',
  short: 'Dr. Manisha Ahiwalay',
  dr: 'Dr. Manisha Ahiwalay',
  first: 'Manisha',
  qual: 'BHMS · Homeopathic Physician',                         // EDIT: confirm degree and registration
  area: 'Nashik',                                              // EDIT: locality, e.g. College Road
  city: 'Nashik',
  address: 'Clinic address, Nashik, Maharashtra',              // EDIT
  phone: '',                                                   // EDIT: clinic WhatsApp number
  hours: [                                                     // EDIT
    { days: 'Monday to Saturday', time: '10:00 am – 1:30 pm · 5:30 pm – 8:30 pm' },
    { days: 'Sunday', time: 'Online consultations by appointment' },
  ],
  closed: [0],
  maps: 'https://www.google.com/maps/search/Dr.+Manisha+Ahiwalay+homeopathy+Nashik',
};

function fromLink(): Clinic {
  const p = new URLSearchParams(location.search);
  const c = { ...defaults };
  const s = (k: string) => p.get(k)?.trim() || '';
  if (s('area')) c.area = s('area');
  if (s('address')) c.address = s('address');
  if (s('qual')) c.qual = s('qual');
  if (s('maps')) c.maps = s('maps');
  const ph = s('phone').replace(/\D/g, '').slice(-10);
  if (/^[6-9]\d{9}$/.test(ph)) c.phone = ph;
  return c;
}

export const CLINIC = fromLink();

export type Concern = { id: string; label: string; items: string[]; approach: string; follow: string; glyph: string };

// "What brings you in?" Wording describes how consultations work, not promised outcomes.
export const CONCERNS: Concern[] = [
  { id: 'skin', label: 'Skin & hair', glyph: 'Sk', items: ['Eczema and dermatitis', 'Acne and pigmentation', 'Psoriasis', 'Hair fall and dandruff'], approach: 'We look at when flare-ups happen, what triggers them, your diet, stress and family history, then choose a remedy for you as a whole person, not just the rash.', follow: 'Every 3 – 4 weeks' },
  { id: 'allergy', label: 'Allergies', glyph: 'Al', items: ['Allergic rhinitis and sneezing', 'Recurring cold and cough', 'Dust and seasonal allergies', 'Hives'], approach: 'We map your triggers and seasons over a few visits and adjust the remedy as the pattern becomes clear. Useful for people tired of the same cold every month.', follow: 'Every 2 – 4 weeks' },
  { id: 'children', label: 'Children', glyph: 'Ch', items: ['Frequent colds and tonsillitis', 'Low appetite', 'Teething troubles', 'Exam stress and sleep'], approach: 'Gentle, sweet-tasting globules that children take easily. Parents get clear instructions and can message for follow-ups.', follow: 'Every 2 – 3 weeks' },
  { id: 'women', label: 'Women’s health', glyph: 'Wo', items: ['Irregular or painful periods', 'PCOS support', 'Menopause symptoms', 'Hormonal acne'], approach: 'A private, unhurried consultation covering your cycle, mood, sleep and energy. Works alongside your gynaecologist’s care.', follow: 'Every 4 weeks' },
  { id: 'digestion', label: 'Digestion', glyph: 'Di', items: ['Acidity and gas', 'IBS', 'Constipation', 'Food sensitivities'], approach: 'We go through your eating patterns, stress and sleep in detail, then combine a remedy with simple diet and routine changes.', follow: 'Every 3 – 4 weeks' },
  { id: 'mind', label: 'Stress & sleep', glyph: 'Mi', items: ['Anxiety and overthinking', 'Trouble sleeping', 'Low energy', 'Headaches and migraine'], approach: 'Time to talk properly about what is going on. Homeopathy here is supportive care and never a replacement for psychiatric treatment where it is needed.', follow: 'Every 2 – 4 weeks' },
  { id: 'joints', label: 'Joints & pain', glyph: 'Jo', items: ['Knee and back pain', 'Arthritis', 'Cervical spondylosis', 'Heel pain'], approach: 'Supportive treatment for long-standing pain, alongside physiotherapy or your orthopaedic doctor’s advice.', follow: 'Every 3 – 4 weeks' },
];

export const CONSULTS = [
  { t: 'In-clinic consultation', d: 'A detailed first visit in Nashik, with time to understand your whole history.', k: 'Clinic' },
  { t: 'Online video consultation', d: 'Consult from anywhere in India. Remedies are couriered to your door.', k: 'Online' },
  { t: 'Child & family care', d: 'One doctor who knows the whole family’s health history.', k: 'Family' },
  { t: 'Chronic care plans', d: 'For long-standing skin, allergy and digestive problems, with planned follow-ups.', k: 'Plan' },
  { t: 'Follow-ups on WhatsApp', d: 'Share progress and photos between visits. Quick questions get quick answers.', k: 'Chat' },
  { t: 'Remedies dispensed here', d: 'Prepared at the clinic, with clear dosage written down for you.', k: 'Rx' },
];

export const FAQ = [
  { q: 'Can I take homeopathy with my regular medicines?', a: 'Yes. Homeopathic remedies are usually taken alongside your current treatment. Never stop a medicine your doctor prescribed without asking them first.' },
  { q: 'Why is the first consultation so long?', a: 'Homeopathy looks at the whole person: your symptoms, sleep, appetite, stress, habits and family history. That takes 45 to 60 minutes the first time. Follow-ups are shorter.' },
  { q: 'How soon will I see a difference?', a: 'It depends on the problem and how long you have had it. Recent complaints often change quickly; long-standing ones take a few months of follow-ups. You’ll get an honest estimate at your first visit.' },
  { q: 'Is it safe for children and during pregnancy?', a: 'Remedies are given in very small doses and children take them easily. In pregnancy, tell the doctor at booking so the plan takes it into account, and keep your gynaecologist informed.' },
  { q: 'Do you offer online consultations?', a: 'Yes, by video call. Remedies are couriered anywhere in India, and follow-ups can be online too.' },
  { q: 'What should I bring?', a: 'Any recent reports, a list of medicines you take, and notes on when your symptoms started and what makes them better or worse.' },
];
