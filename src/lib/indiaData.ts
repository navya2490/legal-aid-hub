export const INDIAN_STATES = [
  // 28 States
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  // 8 Union Territories
  "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi",
  "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
] as const;

export type IndianState = (typeof INDIAN_STATES)[number];

export const INDIAN_CITIES: Record<string, string[]> = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Tirupati", "Nellore", "Kurnool", "Kakinada", "Rajahmundry"],
  "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat", "Tawang", "Ziro"],
  "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tezpur"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga", "Purnia"],
  "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg", "Rajnandgaon"],
  "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar", "Junagadh"],
  "Haryana": ["Gurugram", "Faridabad", "Panipat", "Ambala", "Karnal", "Hisar", "Rohtak", "Sonipat"],
  "Himachal Pradesh": ["Shimla", "Dharamshala", "Mandi", "Solan", "Kullu", "Kangra"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Hazaribagh", "Deoghar"],
  "Karnataka": ["Bengaluru", "Mysuru", "Mangaluru", "Hubballi", "Belagavi", "Davanagere", "Ballari", "Shivamogga"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Kannur", "Palakkad"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Dewas", "Satna"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Thane", "Solapur", "Kolhapur", "Navi Mumbai"],
  "Manipur": ["Imphal", "Thoubal", "Bishnupur", "Churachandpur", "Kakching"],
  "Meghalaya": ["Shillong", "Tura", "Jowai", "Nongstoin", "Williamnagar"],
  "Mizoram": ["Aizawl", "Lunglei", "Champhai", "Serchhip", "Kolasib"],
  "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", "Balasore"],
  "Punjab": ["Chandigarh", "Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner", "Alwar", "Bharatpur"],
  "Sikkim": ["Gangtok", "Namchi", "Gyalshing", "Mangan", "Rangpo"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Erode", "Vellore"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Mahbubnagar", "Secunderabad"],
  "Tripura": ["Agartala", "Udaipur", "Dharmanagar", "Kailashahar", "Ambassa"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Noida", "Ghaziabad", "Prayagraj", "Meerut", "Bareilly"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Rishikesh", "Haldwani", "Roorkee", "Nainital"],
  "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri", "Bardhaman", "Kharagpur"],
  // Union Territories
  "Andaman and Nicobar Islands": ["Port Blair", "Diglipur", "Rangat"],
  "Chandigarh": ["Chandigarh"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Silvassa", "Daman", "Diu"],
  "Delhi": ["New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi", "Central Delhi", "Dwarka", "Rohini"],
  "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Udhampur"],
  "Ladakh": ["Leh", "Kargil"],
  "Lakshadweep": ["Kavaratti", "Agatti", "Minicoy"],
  "Puducherry": ["Puducherry", "Karaikal", "Mahe", "Yanam"],
};

export const PHONE_CODE = "+91";

export const INDIAN_LEGAL_CATEGORIES = [
  "Criminal Law (IPC, CrPC)",
  "Civil Litigation (CPC)",
  "Family Law (Hindu Marriage Act, Muslim Personal Law)",
  "Property & Real Estate (Transfer of Property Act)",
  "Consumer Protection (Consumer Protection Act, 2019)",
  "Labour & Employment (Industrial Disputes Act, Labour Laws)",
  "Corporate & Business (Companies Act, 2013)",
  "Taxation (Income Tax, GST)",
  "Constitutional Law (Writ Petitions)",
  "Intellectual Property (Patents, Trademarks, Copyright)",
  "Cyber Law (IT Act, 2000)",
  "Motor Vehicle Accidents (Motor Vehicles Act)",
  "Banking & Finance",
  "Arbitration & Mediation",
] as const;

export type IndianLegalCategory = (typeof INDIAN_LEGAL_CATEGORIES)[number];

export function getCitiesByState(stateName: string): string[] {
  return INDIAN_CITIES[stateName] ?? [];
}
