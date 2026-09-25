export interface DistrictCentroid {
  district: string;
  state: string;
  lat: number;
  lon: number;
}

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
  { district: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.6868, lon: 83.2185 },
  { district: 'Kurnool', state: 'Andhra Pradesh', lat: 15.8281, lon: 78.0373 },
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

export function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

export function getLocationCoordinates(state: string, district?: string): { lat: number; lon: number } {
  if (district) {
    const directMatch = DISTRICT_CENTROIDS.find(
      c => c.state.toLowerCase() === state.toLowerCase() && 
           c.district.toLowerCase() === district.toLowerCase()
    );
    if (directMatch) return { lat: directMatch.lat, lon: directMatch.lon };

    const partialMatch = DISTRICT_CENTROIDS.find(
      c => c.state.toLowerCase() === state.toLowerCase() && 
           (c.district.toLowerCase().includes(district.toLowerCase()) || district.toLowerCase().includes(c.district.toLowerCase()))
    );
    if (partialMatch) return { lat: partialMatch.lat, lon: partialMatch.lon };
  }

  const stateMatch = DISTRICT_CENTROIDS.find(c => c.state.toLowerCase() === state.toLowerCase());
  if (stateMatch) return { lat: stateMatch.lat, lon: stateMatch.lon };

  return { lat: 15.14, lon: 76.92 }; // Default to Ballari, KA
}
