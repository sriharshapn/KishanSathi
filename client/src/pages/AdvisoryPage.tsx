import React, { useState } from 'react';
import type { Language, NavigationPage, AdvisoryResult } from '../types';
import { 
  Sprout, 
  Droplets, 
  AlertTriangle, 
  Calendar, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  RefreshCw, 
  Award,
  Sun,
  MapPin,
  CheckCircle2,
  History,
  PhoneCall,
  X,
  Copy,
  Check,
  LocateFixed
} from 'lucide-react';

export const STATE_DISTRICTS: Record<string, string[]> = {
  'Karnataka': [
    'Ballari', 'Kolar', 'Chikkaballapur', 'Bengaluru Urban', 'Bengaluru Rural',
    'Belagavi', 'Mysuru', 'Davanagere', 'Dharwad', 'Mandya', 'Hassan',
    'Shivamogga', 'Haveri', 'Tumakuru', 'Bagalkote', 'Vijayapura',
    'Kalaburagi', 'Raichur', 'Koppal', 'Yadgir', 'Chitradurga', 'Gadag',
    'Udupi', 'Dakshina Kannada', 'Uttara Kannada', 'Kodagu', 'Chamarajanagar',
    'Ramanagara', 'Chikkamagaluru', 'Bidar', 'Vijayanagara'
  ],
  'Maharashtra': [
    'Nashik', 'Pune', 'Ahmednagar', 'Solapur', 'Kolhapur', 'Satara', 'Sangli',
    'Jalgaon', 'Dhule', 'Chhatrapati Sambhajinagar', 'Jalna', 'Parbhani',
    'Beed', 'Nanded', 'Dharashiv', 'Latur', 'Buldhana', 'Akola', 'Washim',
    'Amravati', 'Yavatmal', 'Wardha', 'Nagpur', 'Bhandara', 'Gondia',
    'Chandrapur', 'Gadchiroli', 'Nandurbar', 'Raigad', 'Ratnagiri', 'Sindhudurg', 'Thane', 'Palghar'
  ],
  'Punjab': [
    'Ludhiana', 'Jalandhar', 'Amritsar', 'Patiala', 'Bathinda', 'Sangrur',
    'Firozpur', 'Fazilka', 'Gurdaspur', 'Hoshiarpur', 'Kapurthala', 'Mansa',
    'Moga', 'Muktsar', 'Shaheed Bhagat Singh Nagar', 'Rupnagar', 'SAS Nagar (Mohali)',
    'Tarn Taran', 'Barnala', 'Fatehgarh Sahib', 'Faridkot', 'Malerkotla', 'Pathankot'
  ],
  'Tamil Nadu': [
    'Thanjavur', 'Tiruvarur', 'Nagapattinam', 'Madurai', 'Coimbatore',
    'Tiruchirappalli', 'Salem', 'Erode', 'Tirunelveli', 'Dindigul', 'Theni',
    'Virudhunagar', 'Cuddalore', 'Villupuram', 'Vellore', 'Tiruvannamalai',
    'Kanchipuram', 'Tiruvallur', 'Dharmapuri', 'Krishnagiri', 'Namakkal',
    'Karur', 'Perambalur', 'Pudukkottai', 'Sivaganga', 'Ramanathapuram',
    'Thoothukudi', 'Kanyakumari', 'Tiruppur', 'Ranipet', 'Tenkasi', 'Mayiladuthurai'
  ],
  'Andhra Pradesh': [
    'Guntur', 'Kurnool', 'Krishna', 'West Godavari', 'East Godavari',
    'Anantapur', 'Chittoor', 'YSR Kadapa', 'Prakasam', 'SPSR Nellore',
    'Visakhapatnam', 'Vizianagaram', 'Srikakulam', 'Bapatla', 'Palnadu',
    'Nandyal', 'Eluru', 'Kakinada', 'Konaseema', 'Anakapalli', 'Alluri Sitharama Raju',
    'Parvathipuram Manyam', 'Sri Sathya Sai', 'Annamayya', 'Tirupati'
  ],
  'Telangana': [
    'Warangal', 'Karimnagar', 'Nalgonda', 'Khammam', 'Nizamabad',
    'Mahabubnagar', 'Medak', 'Rangareddy', 'Adilabad', 'Sangareddy',
    'Siddipet', 'Suryapet', 'Jagtial', 'Peddapalli', 'Kamareddy',
    'Mancherial', 'Nirmal', 'Kumuram Bheem Asifabad', 'Bhadradri Kothagudem',
    'Mahabubabad', 'Jangaon', 'Jayashankar Bhupalpally', 'Jogulamba Gadwal',
    'Wanaparthy', 'Nagarkurnool', 'Narayanpet', 'Vikarabad', 'Medchal Malkajgiri', 'Hyderabad'
  ],
  'Uttar Pradesh': [
    'Agra', 'Aligarh', 'Mathura', 'Meerut', 'Muzaffarnagar', 'Saharanpur',
    'Bareilly', 'Moradabad', 'Kanpur Nagar', 'Lucknow', 'Varanasi',
    'Prayagraj', 'Gorakhpur', 'Jhansi', 'Barabanki', 'Ayodhya', 'Basti',
    'Hardoi', 'Lakhimpur Kheri', 'Sitapur', 'Bulandshahr', 'Firozabad',
    'Mainpuri', 'Etah', 'Badaun', 'Shahjahanpur', 'Pilibhit', 'Rampur',
    'Bijnor', 'Amroha', 'Sambhal', 'Hathras', 'Kasganj', 'Farrukhabad',
    'Kannauj', 'Etawah', 'Auraiya', 'Kanpur Dehat', 'Unnao', 'Rae Bareli',
    'Amethi', 'Sultanpur', 'Fatehpur', 'Pratapgarh', 'Kaushambi', 'Banda',
    'Hamirpur', 'Mahoba', 'Chitrakoot', 'Jalaun', 'Lalitpur', 'Mirzapur',
    'Sonbhadra', 'Bhadohi', 'Jaunpur', 'Ghazipur', 'Chandauli', 'Ballia',
    'Mau', 'Azamgarh', 'Deoria', 'Kushinagar', 'Maharajganj', 'Siddharthnagar',
    'Sant Kabir Nagar', 'Gonda', 'Balrampur', 'Shravasti', 'Bahraich'
  ],
  'Rajasthan': [
    'Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Sri Ganganagar', 'Hanumangarh',
    'Alwar', 'Bharatpur', 'Ajmer', 'Udaipur', 'Sikar', 'Jhunjhunu', 'Nagaur',
    'Pali', 'Barmer', 'Jalore', 'Bhilwara', 'Chittorgarh', 'Tonk',
    'Sawai Madhopur', 'Bundi', 'Baran', 'Jhalawar', 'Churu', 'Dausa',
    'Dholpur', 'Karauli', 'Rajsamand', 'Banswara', 'Dungarpur', 'Pratapgarh', 'Sirohi', 'Jaisalmer'
  ],
  'Gujarat': [
    'Rajkot', 'Surat', 'Ahmedabad', 'Vadodara', 'Bhavnagar', 'Jamnagar',
    'Junagadh', 'Amreli', 'Mehsana', 'Banaskantha', 'Sabarkantha', 'Patan',
    'Kheda', 'Anand', 'Bharuch', 'Navsari', 'Valsad', 'Surendranagar',
    'Morbi', 'Gir Somnath', 'Devbhumi Dwarka', 'Porbandar', 'Kutch',
    'Gandhinagar', 'Aravalli', 'Mahisagar', 'Panchmahal', 'Dahod',
    'Chhota Udaipur', 'Narmada', 'Tapi', 'Dang', 'Botad'
  ],
  'Madhya Pradesh': [
    'Indore', 'Ujjain', 'Bhopal', 'Jabalpur', 'Gwalior', 'Sagar', 'Dewas',
    'Dhar', 'Khargone', 'Khandwa', 'Ratlam', 'Mandsaur', 'Neemuch',
    'Narmadapuram', 'Sehore', 'Raisen', 'Harda', 'Vidisha', 'Chhindwara',
    'Narsinghpur', 'Rewa', 'Satna', 'Seoni', 'Balaghat', 'Betul', 'Burhanpur',
    'Barwani', 'Alirajpur', 'Jhabua', 'Agar Malwa', 'Shajapur', 'Rajgarh',
    'Guna', 'Ashoknagar', 'Shivpuri', 'Sheopur', 'Morena', 'Bhind', 'Datia'
  ],
  'Haryana': [
    'Karnal', 'Kurukshetra', 'Ambala', 'Yamunanagar', 'Panipat', 'Sonipat',
    'Rohtak', 'Hisar', 'Sirsa', 'Fatehabad', 'Jind', 'Kaithal', 'Bhiwani',
    'Charkhi Dadri', 'Mahendragarh', 'Rewari', 'Jhajjar', 'Gurugram',
    'Faridabad', 'Palwal', 'Nuh', 'Panchkula'
  ]
};

export interface DistrictCentroid {
  district: string;
  state: string;
  lat: number;
  lon: number;
}

export const DISTRICT_CENTROIDS: DistrictCentroid[] = [
  // Karnataka
  { district: 'Ballari', state: 'Karnataka', lat: 15.1394, lon: 76.9214 },
  { district: 'Bengaluru Urban', state: 'Karnataka', lat: 12.9716, lon: 77.5946 },
  { district: 'Kolar', state: 'Karnataka', lat: 13.1378, lon: 78.1291 },
  { district: 'Belagavi', state: 'Karnataka', lat: 15.8497, lon: 74.4977 },
  { district: 'Mysuru', state: 'Karnataka', lat: 12.2958, lon: 76.6394 },
  { district: 'Davanagere', state: 'Karnataka', lat: 14.4644, lon: 75.9218 },
  { district: 'Dharwad', state: 'Karnataka', lat: 15.4589, lon: 75.0078 },
  { district: 'Kalaburagi', state: 'Karnataka', lat: 17.3297, lon: 76.8343 },
  { district: 'Shivamogga', state: 'Karnataka', lat: 13.9299, lon: 75.5681 },
  { district: 'Raichur', state: 'Karnataka', lat: 16.2120, lon: 77.3439 },
  { district: 'Tumakuru', state: 'Karnataka', lat: 13.3409, lon: 77.1010 },
  // Maharashtra
  { district: 'Nashik', state: 'Maharashtra', lat: 19.9975, lon: 73.7898 },
  { district: 'Pune', state: 'Maharashtra', lat: 18.5204, lon: 73.8567 },
  { district: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lon: 79.0882 },
  { district: 'Chhatrapati Sambhajinagar', state: 'Maharashtra', lat: 19.8762, lon: 75.3433 },
  { district: 'Ahmednagar', state: 'Maharashtra', lat: 19.0952, lon: 74.7480 },
  { district: 'Solapur', state: 'Maharashtra', lat: 17.6599, lon: 75.9064 },
  { district: 'Kolhapur', state: 'Maharashtra', lat: 16.7050, lon: 74.2433 },
  { district: 'Wardha', state: 'Maharashtra', lat: 20.7453, lon: 78.6022 },
  { district: 'Amravati', state: 'Maharashtra', lat: 20.9320, lon: 77.7523 },
  { district: 'Jalgaon', state: 'Maharashtra', lat: 21.0077, lon: 75.5626 },
  // Punjab
  { district: 'Ludhiana', state: 'Punjab', lat: 30.9010, lon: 75.8573 },
  { district: 'Amritsar', state: 'Punjab', lat: 31.6340, lon: 74.8723 },
  { district: 'Jalandhar', state: 'Punjab', lat: 31.3260, lon: 75.5762 },
  { district: 'Patiala', state: 'Punjab', lat: 30.3398, lon: 76.3869 },
  { district: 'Bathinda', state: 'Punjab', lat: 30.2110, lon: 74.9455 },
  // Tamil Nadu
  { district: 'Thanjavur', state: 'Tamil Nadu', lat: 10.7870, lon: 79.1378 },
  { district: 'Madurai', state: 'Tamil Nadu', lat: 9.9252, lon: 78.1198 },
  { district: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0168, lon: 76.9558 },
  { district: 'Tiruchirappalli', state: 'Tamil Nadu', lat: 10.7905, lon: 78.7047 },
  { district: 'Salem', state: 'Tamil Nadu', lat: 11.6643, lon: 78.1460 },
  // Andhra Pradesh
  { district: 'Guntur', state: 'Andhra Pradesh', lat: 16.3067, lon: 80.4365 },
  { district: 'Kurnool', state: 'Andhra Pradesh', lat: 15.8281, lon: 78.0373 },
  { district: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.6868, lon: 83.2185 },
  { district: 'Tirupati', state: 'Andhra Pradesh', lat: 13.6288, lon: 79.4192 },
  { district: 'Anantapur', state: 'Andhra Pradesh', lat: 14.6819, lon: 77.6006 },
  // Telangana
  { district: 'Warangal', state: 'Telangana', lat: 17.9689, lon: 79.5941 },
  { district: 'Hyderabad', state: 'Telangana', lat: 17.3850, lon: 78.4867 },
  { district: 'Karimnagar', state: 'Telangana', lat: 18.4386, lon: 79.1288 },
  { district: 'Nizamabad', state: 'Telangana', lat: 18.6725, lon: 78.0941 },
  // Uttar Pradesh
  { district: 'Agra', state: 'Uttar Pradesh', lat: 27.1767, lon: 78.0081 },
  { district: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lon: 80.9462 },
  { district: 'Kanpur Nagar', state: 'Uttar Pradesh', lat: 26.4499, lon: 80.3319 },
  { district: 'Varanasi', state: 'Uttar Pradesh', lat: 25.3176, lon: 82.9739 },
  { district: 'Prayagraj', state: 'Uttar Pradesh', lat: 25.4358, lon: 81.8463 },
  { district: 'Meerut', state: 'Uttar Pradesh', lat: 28.9845, lon: 77.7064 },
  // Rajasthan
  { district: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lon: 75.7873 },
  { district: 'Jodhpur', state: 'Rajasthan', lat: 26.2389, lon: 73.0243 },
  { district: 'Kota', state: 'Rajasthan', lat: 25.2138, lon: 75.8648 },
  { district: 'Bikaner', state: 'Rajasthan', lat: 28.0229, lon: 73.3119 },
  { district: 'Udaipur', state: 'Rajasthan', lat: 24.5854, lon: 73.7125 },
  // Gujarat
  { district: 'Rajkot', state: 'Gujarat', lat: 22.3039, lon: 70.8022 },
  { district: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lon: 72.5714 },
  { district: 'Surat', state: 'Gujarat', lat: 21.1702, lon: 72.8311 },
  { district: 'Vadodara', state: 'Gujarat', lat: 22.3072, lon: 73.1812 },
  // Madhya Pradesh
  { district: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lon: 75.8577 },
  { district: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lon: 77.4126 },
  { district: 'Jabalpur', state: 'Madhya Pradesh', lat: 23.1815, lon: 79.9864 },
  { district: 'Gwalior', state: 'Madhya Pradesh', lat: 26.2183, lon: 78.1828 },
  // Haryana
  { district: 'Karnal', state: 'Haryana', lat: 29.6857, lon: 76.9905 },
  { district: 'Hisar', state: 'Haryana', lat: 29.1492, lon: 75.7217 },
  { district: 'Ambala', state: 'Haryana', lat: 30.3782, lon: 76.7767 },
  { district: 'Rohtak', state: 'Haryana', lat: 28.8955, lon: 76.6066 }
];

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

interface AdvisoryPageProps {
  language: Language;
  onNavigate: (page: NavigationPage) => void;
}

export const AdvisoryPage: React.FC<AdvisoryPageProps> = ({ language, onNavigate }) => {
  const [state, setState] = useState('Karnataka');
  const [district, setDistrict] = useState('Ballari');
  const [crop, setCrop] = useState('Tomato');
  const [soilType, setSoilType] = useState('Loamy');
  const [season, setSeason] = useState('Kharif 2026');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AdvisoryResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // GPS Geolocation state
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsMessage, setGpsMessage] = useState<string | null>(null);

  // History & IVR Telephony
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [ivrOpen, setIvrOpen] = useState(false);
  const [ivrData, setIvrData] = useState<any>(null);
  const [ivrLoading, setIvrLoading] = useState(false);
  const [copiedIvr, setCopiedIvr] = useState(false);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch('/api/advisory/history');
      const data = await res.json();
      if (data.success && Array.isArray(data.history)) {
        setHistoryItems(data.history);
      }
    } catch (err) {
      console.warn('Failed to load advisory history', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleOpenHistory = () => {
    setHistoryOpen(true);
    fetchHistory();
  };

  const handleLoadFromHistory = (item: any) => {
    if (item.advisory) {
      setResult(item.advisory);
      if (item.state) setState(item.state);
      if (item.district) setDistrict(item.district);
      if (item.crop) setCrop(item.crop);
      if (item.soil_type) setSoilType(item.soil_type);
      if (item.season) setSeason(item.season);
      setGpsMessage(null);
    }
    setHistoryOpen(false);
  };

  const handleOpenIvr = async () => {
    setIvrOpen(true);
    setIvrLoading(true);
    try {
      const res = await fetch(`/api/ivr/advisory?state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}&language=${language}`);
      const data = await res.json();
      if (data.success) {
        setIvrData(data);
      }
    } catch (err) {
      console.warn('Failed to load IVR data', err);
    } finally {
      setIvrLoading(false);
    }
  };

  const handleCopyIvr = () => {
    if (ivrData?.ivr_script) {
      navigator.clipboard.writeText(ivrData.ivr_script);
      setCopiedIvr(true);
      setTimeout(() => setCopiedIvr(false), 2000);
    }
  };

  const handleStateChange = (newState: string) => {
    setState(newState);
    const validDistricts = STATE_DISTRICTS[newState] || [];
    if (!validDistricts.includes(district)) {
      setDistrict(validDistricts[0] || '');
    }
    setGpsMessage(null);
  };

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setGpsLoading(true);
    setGpsMessage(null);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        let matchedState = '';
        let matchedDistrict = '';

        // 1. Try free reverse geocoding
        try {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
          );
          if (response.ok) {
            const data = await response.json();
            const foundState = Object.keys(STATE_DISTRICTS).find(s => 
              data.principalSubdivision && data.principalSubdivision.toLowerCase().includes(s.toLowerCase())
            );
            if (foundState) {
              matchedState = foundState;
              const districtList = STATE_DISTRICTS[foundState];
              const foundDistrict = districtList.find(d => 
                (data.city && data.city.toLowerCase().includes(d.toLowerCase())) ||
                (data.locality && data.locality.toLowerCase().includes(d.toLowerCase()))
              );
              if (foundDistrict) {
                matchedDistrict = foundDistrict;
              }
            }
          }
        } catch (err) {
          console.warn('Online reverse geocoding fallback to centroid mapping:', err);
        }

        // 2. If reverse geocoding was inconclusive or offline, use nearest centroid
        if (!matchedState || !matchedDistrict) {
          let minDist = Infinity;
          for (const c of DISTRICT_CENTROIDS) {
            const dist = getDistanceKm(lat, lon, c.lat, c.lon);
            if (dist < minDist) {
              minDist = dist;
              matchedState = c.state;
              matchedDistrict = c.district;
            }
          }
        }

        if (matchedState && matchedDistrict) {
          setState(matchedState);
          setDistrict(matchedDistrict);
          setGpsMessage(`GPS Locked: ${matchedDistrict}, ${matchedState} (${lat.toFixed(3)}°N, ${lon.toFixed(3)}°E)`);
          // Automatically recompute advisory with new GPS location!
          handleGenerate(matchedState, matchedDistrict);
        } else {
          setError('Could not pinpoint nearest agricultural district for your GPS coordinates.');
        }
        setGpsLoading(false);
      },
      (err) => {
        setGpsLoading(false);
        let errMsg = 'Failed to acquire GPS location.';
        if (err.code === 1) errMsg = 'Location permission was denied. Please allow location access in your browser.';
        else if (err.code === 2) errMsg = 'GPS position unavailable. Please choose your state & district manually.';
        else if (err.code === 3) errMsg = 'GPS request timed out. Please try again or select manually.';
        setError(errMsg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleGenerate = async (overrideState?: string, overrideDistrict?: string) => {
    const targetState = overrideState || state;
    const targetDistrict = overrideDistrict || district;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/advisory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: targetState, district: targetDistrict, crop, soilType, season, language })
      });
      const data = await res.json();
      if (data.success && data.advisory) {
        setResult(data.advisory);
      } else {
        setError(data.error || 'Failed to generate advisory.');
      }
    } catch (err: any) {
      setError('Network error: Unable to reach AgriMate AI service.');
    } finally {
      setLoading(false);
    }
  };

  // Run on first load if no result
  React.useEffect(() => {
    handleGenerate();
  }, []);

  const getRegenColor = (score: string) => {
    switch (score?.toUpperCase()) {
      case 'A': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'B': return 'bg-green-100 text-green-800 border-green-300';
      case 'C': return 'bg-amber-100 text-amber-800 border-amber-300';
      default: return 'bg-stone-100 text-stone-800 border-stone-300';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#123826] to-[#1B4D35] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-[#A5D6A7]">
            <Sparkles className="w-3.5 h-3.5 text-[#E8A238]" />
            <span>Gemini 2.0 Flash • Precision Agro-Advisory Engine</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black font-['Syne',sans-serif] tracking-tight">
            AI Regenerative Crop Advisory
          </h1>
          <p className="text-emerald-100/80 text-sm sm:text-base leading-relaxed">
            Real-time, hyper-local guidance harmonizing satellite NDVI vegetative health, 7-day micro-weather forecasts, and soil health chemistry for Indian growers.
          </p>
        </div>
        <div className="absolute right-[-20px] bottom-[-20px] opacity-10 text-9xl pointer-events-none select-none">
          🌱
        </div>
      </div>

      {/* Field Configuration Bar */}
      <div className="bg-white rounded-2xl border border-[#CCE0D0] p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-2 border-b border-[#E2ECE3]">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#2E7D32]" />
            <h2 className="text-xs uppercase tracking-wider font-extrabold text-[#123826]">
              Configure Field & Agro-Climatic Parameters
            </h2>
          </div>

          <button
            type="button"
            onClick={handleUseGps}
            disabled={gpsLoading}
            className="px-3 py-1.5 rounded-xl bg-[#EBF5ED] hover:bg-[#D4EAD9] border border-[#CCE0D0] text-[#123826] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 self-start sm:self-auto shadow-2xs"
            title="Detect your current location and auto-populate State and District"
          >
            {gpsLoading ? (
              <RefreshCw className="w-3.5 h-3.5 text-[#2E7D32] animate-spin" />
            ) : (
              <LocateFixed className="w-3.5 h-3.5 text-[#2E7D32]" />
            )}
            <span>{gpsLoading ? 'Acquiring GPS...' : 'Use My GPS'}</span>
          </button>
        </div>

        {/* GPS Locked Status Notice */}
        {gpsMessage && (
          <div className="mb-4 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center justify-between gap-2 animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span>{gpsMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setGpsMessage(null)}
              className="text-emerald-700 hover:text-emerald-900 text-[11px] font-bold underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          <div>
            <label className="block text-[11px] font-bold text-stone-600 mb-1">State</label>
            <select
              value={state}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full bg-[#F7FBF8] border border-[#CCE0D0] rounded-xl px-3 py-2 text-xs font-semibold text-[#123826] focus:outline-none focus:border-[#2E7D32]"
            >
              {Object.keys(STATE_DISTRICTS).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold text-stone-600">District / Region</label>
              <span className="text-[10px] text-[#2E7D32] font-semibold">in {state}</span>
            </div>
            <select
              value={district}
              onChange={(e) => {
                setDistrict(e.target.value);
                setGpsMessage(null);
              }}
              className="w-full bg-[#F7FBF8] border border-[#CCE0D0] rounded-xl px-3 py-2 text-xs font-semibold text-[#123826] focus:outline-none focus:border-[#2E7D32]"
            >
              {(STATE_DISTRICTS[state] || [district]).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-stone-600 mb-1">Current / Prior Crop</label>
            <input
              type="text"
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              placeholder="e.g. Tomato, Cotton"
              className="w-full bg-[#F7FBF8] border border-[#CCE0D0] rounded-xl px-3 py-2 text-xs font-semibold text-[#123826] focus:outline-none focus:border-[#2E7D32]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-stone-600 mb-1">Soil Type</label>
            <select
              value={soilType}
              onChange={(e) => setSoilType(e.target.value)}
              className="w-full bg-[#F7FBF8] border border-[#CCE0D0] rounded-xl px-3 py-2 text-xs font-semibold text-[#123826] focus:outline-none focus:border-[#2E7D32]"
            >
              <option value="Loamy">Mixed Loamy Soil</option>
              <option value="Black Cotton">Black Cotton Soil (Regur)</option>
              <option value="Red Soil">Red Sandy Soil</option>
              <option value="Alluvial">Alluvial River Basin</option>
              <option value="Laterite">Laterite Soil</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-stone-600 mb-1">Season</label>
            <select
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className="w-full bg-[#F7FBF8] border border-[#CCE0D0] rounded-xl px-3 py-2 text-xs font-semibold text-[#123826] focus:outline-none focus:border-[#2E7D32]"
            >
              <option value="Kharif 2026">Kharif Season (Monsoon)</option>
              <option value="Rabi 2026-27">Rabi Season (Winter)</option>
              <option value="Zaid 2026">Zaid Season (Summer)</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E2ECE3]">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
            <span>Digital Public Good standard • Zero vendor lock-in</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleUseGps}
              disabled={gpsLoading}
              className="px-3.5 py-2 rounded-xl bg-[#F7FBF8] border border-[#CCE0D0] hover:bg-[#EBF5ED] text-[#123826] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
            >
              <LocateFixed className="w-3.5 h-3.5 text-[#2E7D32]" />
              <span>{gpsLoading ? 'Detecting...' : 'Use My GPS'}</span>
            </button>
            <button
              type="button"
              onClick={handleOpenHistory}
              className="px-3.5 py-2 rounded-xl bg-white border border-[#CCE0D0] hover:bg-[#F7FBF8] text-[#123826] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <History className="w-3.5 h-3.5 text-[#2E7D32]" />
              <span>Advisory History</span>
            </button>
            <button
              type="button"
              onClick={handleOpenIvr}
              className="px-3.5 py-2 rounded-xl bg-[#EBF5ED] border border-[#CCE0D0] hover:bg-[#D4EAD9] text-[#123826] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#2E7D32]" />
              <span>Kisan Call Centre IVR</span>
            </button>
            <button
              onClick={() => handleGenerate()}
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-[#123826] hover:bg-[#1B4D35] text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Computing Advisory...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-[#E8A238]" />
                  <span>Generate Advisory</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Active Field Geolocation Tag */}
          <div className="flex items-center justify-between flex-wrap gap-2 px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D32]"></span>
              <span className="text-xs font-bold text-[#123826]">
                Target Region: <span className="font-extrabold text-[#2E7D32]">{district}, {state}</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#F7FBF8] border border-[#CCE0D0] text-stone-600">
                {crop} • {soilType} • {season}
              </span>
            </div>
            {gpsMessage && (
              <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                <LocateFixed className="w-3 h-3 text-emerald-600" />
                <span>GPS Location Active</span>
              </span>
            )}
          </div>

          {/* Telemetry Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-[#CCE0D0] shadow-xs flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EBF5ED] text-[#2E7D32] flex items-center justify-center shrink-0">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-500">7-Day Microclimate</span>
                <p className="text-xs font-semibold text-[#123826] mt-0.5 leading-snug">
                  {result.weather_summary}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#CCE0D0] shadow-xs flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFF8E7] text-[#E8A238] flex items-center justify-center shrink-0">
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-500">Sentinel-2 NDVI Score</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-base font-black text-[#123826] font-mono">
                    {result.ndvi_score}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Vegetative Canopy
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#CCE0D0] shadow-xs flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-500">Regenerative Target</span>
                <p className="text-xs font-semibold text-[#123826] mt-0.5 leading-snug">
                  Soil organic carbon build-up + 25% lower nitrogen runoff
                </p>
              </div>
            </div>
          </div>

          {/* Current Field Assessment */}
          <div className="p-5 rounded-2xl bg-[#F7FBF8] border border-[#CCE0D0]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#123826] mb-1.5 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
              <span>Current Field Health Assessment</span>
            </h3>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
              {result.current_field_assessment}
            </p>
          </div>

          {/* 3 Regenerative Crop Recommendations */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-black text-[#123826] font-['Syne',sans-serif]">
                  Regenerative Crop Recommendations
                </h3>
                <p className="text-xs text-stone-500">
                  Ranked by agro-climatic suitability, soil enrichment potential, and market viability.
                </p>
              </div>
              <button
                onClick={() => onNavigate('dashboard')}
                className="text-xs font-bold text-[#2E7D32] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Check Mandi Rates</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {result.crop_recommendations.map((rec: any, idx: number) => (
                <div 
                  key={idx} 
                  className="bg-white rounded-2xl border border-[#CCE0D0] p-5 shadow-xs hover:shadow-md hover:border-[#2E7D32] transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl p-2 rounded-xl bg-[#F7FBF8] border border-[#E2ECE3]">
                          {rec.icon || '🌾'}
                        </span>
                        <div>
                          <h4 className="text-sm font-black text-[#123826]">{rec.crop}</h4>
                          <span className="text-[11px] text-stone-500 font-medium">{rec.variety}</span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRegenColor(rec.regenerative_score)}`}>
                        Regen {rec.regenerative_score}
                      </span>
                    </div>

                    {/* Suitability Score Bar */}
                    <div>
                      <div className="flex justify-between text-[11px] font-bold text-stone-600 mb-1">
                        <span>Suitability Match</span>
                        <span className="font-mono text-[#2E7D32]">{rec.suitability_score}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#EBF5ED] overflow-hidden">
                        <div 
                          className="h-full bg-[#2E7D32] rounded-full transition-all" 
                          style={{ width: `${rec.suitability_score}%` }} 
                        />
                      </div>
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed bg-[#F7FBF8] p-2.5 rounded-xl border border-[#E2ECE3]">
                      {rec.reason}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E2ECE3] grid grid-cols-3 gap-2 text-center">
                    <div>
                      <span className="block text-[9px] uppercase font-bold text-stone-400">Water</span>
                      <span className="text-[11px] font-bold text-[#123826] capitalize">{rec.water_need}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase font-bold text-stone-400">Yield</span>
                      <span className="text-[11px] font-bold text-[#123826] font-mono">{rec.expected_yield_qtl_per_ha} q/ha</span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase font-bold text-stone-400">APMC Est.</span>
                      <span className="text-[11px] font-bold text-[#2E7D32] font-mono">₹{rec.market_price_inr_per_qtl}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Irrigation & Pest Alert Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200">
              <div className="flex items-center gap-2 mb-2 text-blue-900">
                <Droplets className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider">7-Day Irrigation Schedule</h4>
              </div>
              <p className="text-xs sm:text-sm text-blue-950 leading-relaxed">
                {result.irrigation_advice}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200">
              <div className="flex items-center gap-2 mb-2 text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Pest & Pathogen Early Warning</h4>
              </div>
              <p className="text-xs sm:text-sm text-amber-950 leading-relaxed">
                {result.pest_disease_warning}
              </p>
            </div>
          </div>

          {/* Farming Calendar Milestones */}
          {result.farming_calendar && result.farming_calendar.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#CCE0D0] p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#E2ECE3]">
                <Calendar className="w-4 h-4 text-[#2E7D32]" />
                <h3 className="text-xs uppercase tracking-wider font-extrabold text-[#123826]">
                  Seasonal Execution Calendar
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {result.farming_calendar.map((item: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#F7FBF8] border border-[#E2ECE3] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-base">{item.icon || '🌱'}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBF5ED] text-[#2E7D32]">
                        Day +{item.days_from_now}
                      </span>
                    </div>
                    <strong className="text-xs text-[#123826] block font-bold">{item.milestone}</strong>
                    <p className="text-[11px] text-stone-600 leading-snug">{item.action}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* History Modal */}
      {historyOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#CCE0D0] max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2ECE3]">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[#2E7D32]" />
                <h3 className="font-black text-sm text-[#123826]">Past Advisory Consultations</h3>
              </div>
              <button 
                onClick={() => setHistoryOpen(false)}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 flex-1 pr-1">
              {historyLoading ? (
                <div className="py-12 text-center text-xs text-stone-500">Loading history records...</div>
              ) : historyItems.length === 0 ? (
                <div className="py-12 text-center text-xs text-stone-500">No past advisories found in database.</div>
              ) : (
                historyItems.map((item) => (
                  <div key={item.id} className="p-4 rounded-2xl bg-[#FBFDF9] border border-[#CCE0D0] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-[#123826]">{item.district}, {item.state}</span>
                        <span className="text-[10px] bg-[#EBF5ED] text-[#2E7D32] px-2 py-0.5 rounded-full font-bold">
                          {item.season}
                        </span>
                      </div>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>

                    <div className="text-[11px] text-stone-600 flex flex-wrap gap-x-4 gap-y-1">
                      <span>Crop: <strong>{item.crop || 'Open field'}</strong></span>
                      <span>Soil: <strong>{item.soil_type || 'Loamy'}</strong></span>
                      <span>NDVI: <strong>{item.ndvi_score ? Number(item.ndvi_score).toFixed(2) : '0.62'}</strong></span>
                    </div>

                    {item.advisory?.crop_recommendations && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {item.advisory.crop_recommendations.map((c: any, i: number) => (
                          <span key={i} className="text-[10px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md font-medium">
                            {c.icon || '🌾'} {c.crop} ({c.regenerative_score})
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => handleLoadFromHistory(item)}
                        className="px-3 py-1 bg-[#123826] text-white rounded-lg text-xs font-bold hover:bg-[#1B4D35] cursor-pointer transition-colors"
                      >
                        Load Into Advisory Console
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* IVR Voice Telephony Modal */}
      {ivrOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#CCE0D0] max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2ECE3]">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-[#2E7D32]" />
                <div>
                  <h3 className="font-black text-sm text-[#123826]">Kisan Call Centre (1800-180-1551)</h3>
                  <p className="text-[11px] text-stone-500">Automated IVR Telephony Speech Engine</p>
                </div>
              </div>
              <button 
                onClick={() => setIvrOpen(false)}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {ivrLoading ? (
              <div className="py-12 text-center text-xs text-stone-500">Synthesizing telephony voice script...</div>
            ) : ivrData ? (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-[#0A1F14] text-[#A5D6A7] font-mono text-xs leading-relaxed border border-[#16422D]">
                  <p className="text-[10px] text-stone-400 mb-1 uppercase tracking-wider font-bold">Generated Voice Script ({ivrData.language.toUpperCase()}):</p>
                  <p className="whitespace-pre-wrap">{ivrData.ivr_script}</p>
                </div>

                <div className="space-y-1 text-[11px] text-stone-500">
                  <p><strong>Provider:</strong> {ivrData.telephony_provider}</p>
                  <p><strong>Encoding:</strong> {ivrData.audio_format}</p>
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-[#E2ECE3]">
                  <button
                    onClick={handleCopyIvr}
                    className="px-3.5 py-1.5 rounded-xl bg-[#123826] text-white text-xs font-bold hover:bg-[#1B4D35] flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                  >
                    {copiedIvr ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedIvr ? 'Copied Script' : 'Copy Audio Script'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-stone-500">Failed to generate IVR script.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
