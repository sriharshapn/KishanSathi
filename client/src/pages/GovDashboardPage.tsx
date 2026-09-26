import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import type { Language, NavigationPage } from '../types';
import { 
  Network, 
  AlertTriangle, 
  Globe, 
  Users,
  Sprout,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
  Radio,
  Search,
  Layers,
  ArrowUpRight,
  Activity,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Sparkles,
  X
} from 'lucide-react';
import { apiUrl } from '../utils/api';

interface GovDashboardPageProps {
  language?: Language;
  onNavigate: (page: NavigationPage) => void;
}

interface StateNode {
  state: string;
  code: string;
  hub: string;
  agency: string;
  dominant_crops: string[];
  ndvi_mean: number;
  health_status: string;
  latency_ms: number;
  sync_interval: string;
  verified_parcels: number;
  active_growers: number;
  data_contracts: number;
  protocol_version: string;
  security: string;
  status: string;
  disease_alerts: number;
  last_sync: string;
}

interface DiseaseAlert {
  id: string;
  pathogen: string;
  crop: string;
  originDistrict: string;
  originState: string;
  destinationDistrict: string;
  destinationState: string;
  severity: 'high' | 'moderate' | 'mild';
  vectorType: string;
  vectorDistanceKm: number;
  containmentRadiusKm: number;
  verifiedReports: number;
  recommendedAdvisory: string;
  status: string;
  timestamp: string;
}

const DEFAULT_STATE_NODES: StateNode[] = [
  {
    state: 'Karnataka',
    code: 'IN-KA',
    hub: 'Bengaluru - Yeshwanthpur Agmarknet Terminal Hub',
    agency: 'Karnataka State Department of Agriculture (KSDA)',
    dominant_crops: ['Tomato', 'Maize', 'Ragi', 'Chilli'],
    ndvi_mean: 0.68,
    health_status: 'Optimal',
    latency_ms: 14,
    sync_interval: '15 min',
    verified_parcels: 62450,
    active_growers: 138200,
    data_contracts: 14,
    protocol_version: 'ETSI NGSI-LD v2.1.1',
    security: 'X.509 Mutual TLS & Sovereign Enclave',
    status: 'synced',
    disease_alerts: 4,
    last_sync: new Date().toISOString()
  },
  {
    state: 'Maharashtra',
    code: 'IN-MH',
    hub: 'Nashik - Lasalgaon National Onion Hub',
    agency: 'Maharashtra State Agricultural Marketing Board (MSAMB)',
    dominant_crops: ['Onion', 'Soybean', 'Cotton', 'Grapes'],
    ndvi_mean: 0.61,
    health_status: 'Favorable',
    latency_ms: 18,
    sync_interval: '15 min',
    verified_parcels: 78100,
    active_growers: 154300,
    data_contracts: 16,
    protocol_version: 'ETSI NGSI-LD v2.1.1',
    security: 'X.509 Mutual TLS & Sovereign Enclave',
    status: 'synced',
    disease_alerts: 3,
    last_sync: new Date().toISOString()
  },
  {
    state: 'Punjab',
    code: 'IN-PB',
    hub: 'Ludhiana - Khanna Grain Terminal Hub',
    agency: 'Punjab Mandi Board (PMB)',
    dominant_crops: ['Wheat', 'Basmati Paddy', 'Mustard', 'Maize'],
    ndvi_mean: 0.74,
    health_status: 'Optimal',
    latency_ms: 24,
    sync_interval: '15 min',
    verified_parcels: 51200,
    active_growers: 98400,
    data_contracts: 12,
    protocol_version: 'ETSI NGSI-LD v2.1.1',
    security: 'X.509 Mutual TLS & Sovereign Enclave',
    status: 'synced',
    disease_alerts: 5,
    last_sync: new Date().toISOString()
  },
  {
    state: 'Tamil Nadu',
    code: 'IN-TN',
    hub: 'Thanjavur - Cauvery Delta Agri Node',
    agency: 'Tamil Nadu Agricultural University (TNAU) & Agri Marketing',
    dominant_crops: ['Paddy', 'Banana', 'Coconut', 'Turmeric'],
    ndvi_mean: 0.69,
    health_status: 'Optimal',
    latency_ms: 21,
    sync_interval: '15 min',
    verified_parcels: 46900,
    active_growers: 104500,
    data_contracts: 11,
    protocol_version: 'ETSI NGSI-LD v2.1.1',
    security: 'X.509 Mutual TLS & Sovereign Enclave',
    status: 'synced',
    disease_alerts: 4,
    last_sync: new Date().toISOString()
  },
  {
    state: 'Andhra Pradesh',
    code: 'IN-AP',
    hub: 'Guntur - Asia Spice Terminal & Chilli Yard',
    agency: 'AP Rythu Bharosa Kendras (RBK) & Dept of Agriculture',
    dominant_crops: ['Chilli', 'Cotton', 'Groundnut', 'Tobacco'],
    ndvi_mean: 0.63,
    health_status: 'Favorable',
    latency_ms: 17,
    sync_interval: '15 min',
    verified_parcels: 58300,
    active_growers: 118900,
    data_contracts: 13,
    protocol_version: 'ETSI NGSI-LD v2.1.1',
    security: 'X.509 Mutual TLS & Sovereign Enclave',
    status: 'synced',
    disease_alerts: 6,
    last_sync: new Date().toISOString()
  },
  {
    state: 'Uttar Pradesh',
    code: 'IN-UP',
    hub: 'Agra - Khandauli Cold Belt & Potato Exchange',
    agency: 'UP Rajya Krishi Utpadan Mandi Parishad',
    dominant_crops: ['Potato', 'Wheat', 'Sugarcane', 'Mustard'],
    ndvi_mean: 0.65,
    health_status: 'Favorable',
    latency_ms: 22,
    sync_interval: '15 min',
    verified_parcels: 84600,
    active_growers: 182100,
    data_contracts: 15,
    protocol_version: 'ETSI NGSI-LD v2.1.1',
    security: 'X.509 Mutual TLS & Sovereign Enclave',
    status: 'synced',
    disease_alerts: 5,
    last_sync: new Date().toISOString()
  },
  {
    state: 'Gujarat',
    code: 'IN-GJ',
    hub: 'Rajkot - Saurashtra Groundnut & Cotton APMC',
    agency: 'Gujarat State Agricultural Marketing Board (GSAMB)',
    dominant_crops: ['Groundnut', 'Cotton', 'Cumin', 'Castor'],
    ndvi_mean: 0.56,
    health_status: 'Under Watch',
    latency_ms: 19,
    sync_interval: '15 min',
    verified_parcels: 41800,
    active_growers: 86400,
    data_contracts: 10,
    protocol_version: 'ETSI NGSI-LD v2.1.1',
    security: 'X.509 Mutual TLS & Sovereign Enclave',
    status: 'synced',
    disease_alerts: 2,
    last_sync: new Date().toISOString()
  },
  {
    state: 'Madhya Pradesh',
    code: 'IN-MP',
    hub: 'Indore - Malwa Soybean & Wheat Terminal',
    agency: 'Madhya Pradesh Mandi Board (Sauda Patrak Network)',
    dominant_crops: ['Soybean', 'Wheat', 'Garlic', 'Gram'],
    ndvi_mean: 0.62,
    health_status: 'Favorable',
    latency_ms: 23,
    sync_interval: '15 min',
    verified_parcels: 67200,
    active_growers: 129700,
    data_contracts: 12,
    protocol_version: 'ETSI NGSI-LD v2.1.1',
    security: 'X.509 Mutual TLS & Sovereign Enclave',
    status: 'synced',
    disease_alerts: 3,
    last_sync: new Date().toISOString()
  },
  {
    state: 'Rajasthan',
    code: 'IN-RJ',
    hub: 'Kota - Hadoti Coriander & Mustard Yard',
    agency: 'Rajasthan State Agricultural Marketing Board (RSAMB)',
    dominant_crops: ['Mustard', 'Bajra', 'Coriander', 'Wheat'],
    ndvi_mean: 0.53,
    health_status: 'Under Watch',
    latency_ms: 26,
    sync_interval: '15 min',
    verified_parcels: 39500,
    active_growers: 74600,
    data_contracts: 9,
    protocol_version: 'ETSI NGSI-LD v2.1.1',
    security: 'X.509 Mutual TLS & Sovereign Enclave',
    status: 'synced',
    disease_alerts: 2,
    last_sync: new Date().toISOString()
  },
  {
    state: 'Haryana',
    code: 'IN-HR',
    hub: 'Karnal - National Rice Research Corridor Node',
    agency: 'Haryana State Agricultural Marketing Board (HSAMB)',
    dominant_crops: ['Basmati Paddy', 'Wheat', 'Mustard', 'Sugarcane'],
    ndvi_mean: 0.72,
    health_status: 'Optimal',
    latency_ms: 20,
    sync_interval: '15 min',
    verified_parcels: 44800,
    active_growers: 89300,
    data_contracts: 11,
    protocol_version: 'ETSI NGSI-LD v2.1.1',
    security: 'X.509 Mutual TLS & Sovereign Enclave',
    status: 'synced',
    disease_alerts: 4,
    last_sync: new Date().toISOString()
  }
];

const DEFAULT_DISEASE_ALERTS: DiseaseAlert[] = [
  {
    id: 'ALERT-IN-PB-HR-01',
    pathogen: 'Yellow Rust (Puccinia striiformis)',
    crop: 'Wheat (PBW-550, HD-2967)',
    originDistrict: 'Hoshiarpur',
    originState: 'Punjab',
    destinationDistrict: 'Yamunanagar',
    destinationState: 'Haryana',
    severity: 'high',
    vectorType: 'Airborne windward fungal urediniospores',
    vectorDistanceKm: 145,
    containmentRadiusKm: 35,
    verifiedReports: 28,
    recommendedAdvisory: 'Foliar prophylactic spray of Propiconazole 25% EC @ 0.1% (1ml/L) along western border acreage before dew set.',
    status: 'Quarantine Protocol Active',
    timestamp: new Date().toISOString()
  },
  {
    id: 'ALERT-IN-KA-AP-02',
    pathogen: 'Fall Armyworm (Spodoptera frugiperda)',
    crop: 'Maize (Kaveri 50, Pioneer 3302)',
    originDistrict: 'Ballari',
    originState: 'Karnataka',
    destinationDistrict: 'Kurnool',
    destinationState: 'Andhra Pradesh',
    severity: 'moderate',
    vectorType: 'Adult nocturnal moth migration vector',
    vectorDistanceKm: 112,
    containmentRadiusKm: 25,
    verifiedReports: 19,
    recommendedAdvisory: 'Install pheromone funnel traps @ 5 per acre; foliar application of Emamectin benzoate 5% SG @ 0.4g/L in whorls.',
    status: 'Surveillance Active',
    timestamp: new Date().toISOString()
  },
  {
    id: 'ALERT-IN-MH-GJ-03',
    pathogen: 'Late Blight (Phytophthora infestans)',
    crop: 'Potato & Tomato',
    originDistrict: 'Nashik',
    originState: 'Maharashtra',
    destinationDistrict: 'Valsad',
    destinationState: 'Gujarat',
    severity: 'high',
    vectorType: 'High relative humidity (>90%) fog transmission',
    vectorDistanceKm: 138,
    containmentRadiusKm: 30,
    verifiedReports: 23,
    recommendedAdvisory: 'Cymoxanil 8% + Mancozeb 64% WP @ 1.5g/L preventive barrier spray; ensure field drainage.',
    status: 'Early Warning Broadcast',
    timestamp: new Date().toISOString()
  },
  {
    id: 'ALERT-IN-AP-TS-04',
    pathogen: 'Chilli Leaf Curl & Thrips Parvispinus',
    crop: 'Chilli (Teja & Byadgi varieties)',
    originDistrict: 'Guntur',
    originState: 'Andhra Pradesh',
    destinationDistrict: 'Khammam',
    destinationState: 'Telangana',
    severity: 'moderate',
    vectorType: 'Wind-assisted sucking pest dispersal',
    vectorDistanceKm: 88,
    containmentRadiusKm: 20,
    verifiedReports: 16,
    recommendedAdvisory: 'Blue & yellow sticky traps @ 30/acre; Neem oil 10,000 ppm @ 2ml/L + Diafenthiuron 50% WP @ 1.25g/L.',
    status: 'Advisory Dispatched',
    timestamp: new Date().toISOString()
  },
  {
    id: 'ALERT-IN-TN-PY-05',
    pathogen: 'Blast of Paddy (Magnaporthe oryzae)',
    crop: 'Paddy (CR-1009, ADT-45)',
    originDistrict: 'Thanjavur',
    originState: 'Tamil Nadu',
    destinationDistrict: 'Karaikal',
    destinationState: 'Puducherry',
    severity: 'high',
    vectorType: 'Cloudburst dew & canopy droplet dispersion',
    vectorDistanceKm: 65,
    containmentRadiusKm: 25,
    verifiedReports: 21,
    recommendedAdvisory: 'Prophylactic Tricyclazole 75% WP @ 0.6g/L at late tillering stage; avoid excessive nitrogen top-dressing.',
    status: 'Containment Enforced',
    timestamp: new Date().toISOString()
  }
];

export const GovDashboardPage: React.FC<GovDashboardPageProps> = ({ onNavigate }) => {
  const [nodes, setNodes] = useState<StateNode[]>(DEFAULT_STATE_NODES);
  const [diseaseAlerts, setDiseaseAlerts] = useState<DiseaseAlert[]>(DEFAULT_DISEASE_ALERTS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'optimal' | 'watch'>('all');
  const [selectedTab, setSelectedTab] = useState<'topology' | 'surveillance'>('topology');
  const [selectedNodeModal, setSelectedNodeModal] = useState<StateNode | null>(null);

  // Tab 1 (State Nodes) Carousel & Mouse-Glide State
  // Tab 1 (State Nodes) Carousel State
  const [nodeViewLayout, setNodeViewLayout] = useState<'carousel' | 'grid'>('carousel');
  const [activeNodeIndex, setActiveNodeIndex] = useState(0);
  const nodeCarouselRef = useRef<HTMLDivElement>(null);
  const isNodeDraggingRef = useRef(false);
  const nodeDragStartXRef = useRef(0);
  const nodeDragStartScrollRef = useRef(0);
  const nodeHasDraggedRef = useRef(false);

  // Tab 2 (Disease Corridors) Carousel State
  const [alertViewLayout, setAlertViewLayout] = useState<'carousel' | 'grid'>('carousel');
  const [activeAlertIndex, setActiveAlertIndex] = useState(0);
  const alertCarouselRef = useRef<HTMLDivElement>(null);
  const isAlertDraggingRef = useRef(false);
  const alertDragStartXRef = useRef(0);
  const alertDragStartScrollRef = useRef(0);
  const alertHasDraggedRef = useRef(false);

  // Drag and 2-finger wheel handlers for State Nodes (Mandi Terminal Cards)
  const handleNodeContainerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = nodeCarouselRef.current;
    if (!el || !isNodeDraggingRef.current) return;
    if (e.buttons === 0) {
      isNodeDraggingRef.current = false;
      return;
    }
    const dx = e.clientX - nodeDragStartXRef.current;
    if (Math.abs(dx) > 3) {
      nodeHasDraggedRef.current = true;
    }
    el.scrollLeft = nodeDragStartScrollRef.current - dx;
  };

  const handleNodeMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!nodeCarouselRef.current) return;
    // Supports right-click drag (e.button === 2) and standard drag (e.button === 0)
    isNodeDraggingRef.current = true;
    nodeHasDraggedRef.current = false;
    nodeDragStartXRef.current = e.clientX;
    nodeDragStartScrollRef.current = nodeCarouselRef.current.scrollLeft;
  };

  const handleNodeMouseUp = () => {
    isNodeDraggingRef.current = false;
    setTimeout(() => {
      nodeHasDraggedRef.current = false;
    }, 80);
  };

  const handleNodeWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = nodeCarouselRef.current;
    if (!el) return;
    // 2-finger gesture on trackpad or mouse wheel horizontal/vertical scroll
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      el.scrollLeft += e.deltaX;
    } else if (Math.abs(e.deltaY) > 0) {
      el.scrollLeft += e.deltaY;
    }
  };

  const handleNodeTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!nodeCarouselRef.current || e.touches.length === 0) return;
    isNodeDraggingRef.current = true;
    nodeHasDraggedRef.current = false;
    nodeDragStartXRef.current = e.touches[0].clientX;
    nodeDragStartScrollRef.current = nodeCarouselRef.current.scrollLeft;
  };

  const handleNodeTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const el = nodeCarouselRef.current;
    if (!el || !isNodeDraggingRef.current || e.touches.length === 0) return;
    const dx = e.touches[0].clientX - nodeDragStartXRef.current;
    if (Math.abs(dx) > 3) nodeHasDraggedRef.current = true;
    el.scrollLeft = nodeDragStartScrollRef.current - dx;
  };

  const handleNodeTouchEnd = () => {
    isNodeDraggingRef.current = false;
    setTimeout(() => {
      nodeHasDraggedRef.current = false;
    }, 80);
  };

  const handleNodeScroll = () => {
    if (!nodeCarouselRef.current) return;
    const scrollLeft = nodeCarouselRef.current.scrollLeft;
    const cardWidth = 380;
    const idx = Math.round(scrollLeft / cardWidth);
    setActiveNodeIndex(Math.max(0, Math.min(idx, nodes.length - 1)));
  };

  const scrollNodePrev = () => {
    if (nodeCarouselRef.current) {
      const cardWidth = nodeCarouselRef.current.clientWidth > 768 ? 390 : 330;
      nodeCarouselRef.current.scrollBy({ left: -cardWidth, behavior: 'smooth' });
    }
  };

  const scrollNodeNext = () => {
    if (nodeCarouselRef.current) {
      const cardWidth = nodeCarouselRef.current.clientWidth > 768 ? 390 : 330;
      nodeCarouselRef.current.scrollBy({ left: cardWidth, behavior: 'smooth' });
    }
  };

  // Drag and 2-finger wheel handlers for Disease Corridors
  const handleAlertContainerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = alertCarouselRef.current;
    if (!el || !isAlertDraggingRef.current) return;
    if (e.buttons === 0) {
      isAlertDraggingRef.current = false;
      return;
    }
    const dx = e.clientX - alertDragStartXRef.current;
    if (Math.abs(dx) > 3) {
      alertHasDraggedRef.current = true;
    }
    el.scrollLeft = alertDragStartScrollRef.current - dx;
  };

  const handleAlertMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!alertCarouselRef.current) return;
    isAlertDraggingRef.current = true;
    alertHasDraggedRef.current = false;
    alertDragStartXRef.current = e.clientX;
    alertDragStartScrollRef.current = alertCarouselRef.current.scrollLeft;
  };

  const handleAlertMouseUp = () => {
    isAlertDraggingRef.current = false;
    setTimeout(() => {
      alertHasDraggedRef.current = false;
    }, 80);
  };

  const handleAlertWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = alertCarouselRef.current;
    if (!el) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      el.scrollLeft += e.deltaX;
    } else if (Math.abs(e.deltaY) > 0) {
      el.scrollLeft += e.deltaY;
    }
  };

  const handleAlertTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!alertCarouselRef.current || e.touches.length === 0) return;
    isAlertDraggingRef.current = true;
    alertHasDraggedRef.current = false;
    alertDragStartXRef.current = e.touches[0].clientX;
    alertDragStartScrollRef.current = alertCarouselRef.current.scrollLeft;
  };

  const handleAlertTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const el = alertCarouselRef.current;
    if (!el || !isAlertDraggingRef.current || e.touches.length === 0) return;
    const dx = e.touches[0].clientX - alertDragStartXRef.current;
    if (Math.abs(dx) > 3) alertHasDraggedRef.current = true;
    el.scrollLeft = alertDragStartScrollRef.current - dx;
  };

  const handleAlertTouchEnd = () => {
    isAlertDraggingRef.current = false;
    setTimeout(() => {
      alertHasDraggedRef.current = false;
    }, 80);
  };

  const handleAlertScroll = () => {
    if (!alertCarouselRef.current) return;
    const scrollLeft = alertCarouselRef.current.scrollLeft;
    const cardWidth = 440;
    const idx = Math.round(scrollLeft / cardWidth);
    setActiveAlertIndex(Math.max(0, Math.min(idx, diseaseAlerts.length - 1)));
  };

  const scrollAlertPrev = () => {
    if (alertCarouselRef.current) {
      const cardWidth = alertCarouselRef.current.clientWidth > 768 ? 440 : 350;
      alertCarouselRef.current.scrollBy({ left: -cardWidth, behavior: 'smooth' });
    }
  };

  const scrollAlertNext = () => {
    if (alertCarouselRef.current) {
      const cardWidth = alertCarouselRef.current.clientWidth > 768 ? 440 : 350;
      alertCarouselRef.current.scrollBy({ left: cardWidth, behavior: 'smooth' });
    }
  };

  // Card spotlight glow effect
  const handleCardMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--spotlight-x', `${x}px`);
    card.style.setProperty('--spotlight-y', `${y}px`);
    card.style.setProperty('--spotlight-opacity', '1');
  }, []);

  const handleCardMouseLeave = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.setProperty('--spotlight-opacity', '0');
  }, []);

  useEffect(() => {
    async function loadGovData() {
      setLoading(true);
      try {
        const res = await fetch(apiUrl('/gov/dashboard'));
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            if (json.state_nodes && json.state_nodes.length > 0) {
              setNodes(json.state_nodes);
            }
            if (json.disease_alerts && json.disease_alerts.length > 0) {
              setDiseaseAlerts(json.disease_alerts);
            }
          }
        }
      } catch (err) {
        console.warn('Network notice: using synchronized local state node dataset', err);
      } finally {
        setLoading(false);
      }
    }
    loadGovData();
  }, []);

  // Filtered nodes
  const filteredNodes = useMemo(() => {
    return nodes.filter(n => {
      const matchesSearch = 
        n.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.hub.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.dominant_crops.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
      
      if (statusFilter === 'optimal') return matchesSearch && n.health_status === 'Optimal';
      if (statusFilter === 'watch') return matchesSearch && n.health_status === 'Under Watch';
      return matchesSearch;
    });
  }, [nodes, searchQuery, statusFilter]);

  const totalGrowers = useMemo(() => nodes.reduce((acc, n) => acc + n.active_growers, 0), [nodes]);
  const totalParcels = useMemo(() => nodes.reduce((acc, n) => acc + n.verified_parcels, 0), [nodes]);
  const totalContracts = useMemo(() => nodes.reduce((acc, n) => acc + n.data_contracts, 0), [nodes]);
  const avgNdvi = useMemo(() => {
    return (nodes.reduce((acc, n) => acc + n.ndvi_mean, 0) / nodes.length).toFixed(3);
  }, [nodes]);

  return (
    <div className="max-w-[1440px] mx-auto px-3 sm:px-6 py-8 md:py-12 space-y-8 font-['Open_Sans',sans-serif] text-[#022113]">
      
      {/* ── 1. HERO BANNER: BEHANCE DOUBLE-CARD ARCHITECTURE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Card: Crisp White Card */}
        <div className="lg:col-span-8 bg-white rounded-[2.5rem] p-8 sm:p-10 border border-[#022113]/8 shadow-xl hover:shadow-2xl transition-all space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F0F2EB] border border-[#022113]/8 text-xs font-['Montserrat',sans-serif] font-bold uppercase tracking-wider text-[#546C18]">
              {loading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#546C18]" />
              ) : (
                <Network className="w-3.5 h-3.5 text-[#546C18]" />
              )}
              <span>Digital Public Good (DPG) • Interoperable National Mesh</span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-black text-[#022113] font-['Montserrat',sans-serif] tracking-tight">
              Inter-State <span className="text-[#546C18]">Agro-Data Mesh</span>
            </h1>
            
            <p className="text-[#4A5568] text-xs sm:text-base leading-relaxed font-normal max-w-2xl">
              India's sovereign, federated network enabling state agriculture departments to securely interchange Sentinel-2 NDVI vegetative canopy models, terminal APMC price telemetry, and cross-border pathogen warnings under open ETSI NGSI-LD protocols.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[#022113]/8">
            <div className="flex items-center gap-1.5 text-xs font-bold font-['Montserrat',sans-serif] text-[#546C18] uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-[#546C18]" />
              <span>ETSI GS CIM 009 v1.4.1</span>
            </div>
            <span className="text-[#718096]">•</span>
            <div className="flex items-center gap-1.5 text-xs font-bold font-['Montserrat',sans-serif] text-[#546C18] uppercase tracking-wider">
              <Layers className="w-4 h-4 text-[#546C18]" />
              <span>Smart Data Models Initiative</span>
            </div>
            <span className="text-[#718096]">•</span>
            <div className="flex items-center gap-1.5 text-xs font-bold font-['Montserrat',sans-serif] text-[#546C18] uppercase tracking-wider">
              <Radio className="w-4 h-4 text-[#546C18]" />
              <span>10 Synchronized State Nodes</span>
            </div>
          </div>
        </div>

        {/* Right Card: Rich Olive Card */}
        <div className="lg:col-span-4 bg-[#546C18] text-white rounded-[2.5rem] p-8 shadow-xl hover:shadow-2xl transition-all flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold font-['Montserrat',sans-serif] uppercase tracking-wider px-3 py-1 rounded-full bg-[#DFEB38] text-[#022113]">
                Federated Core v2.1
              </span>
              <span className="text-xs font-mono text-white/80 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#DFEB38] animate-ping" />
                <span>Live State Handshake</span>
              </span>
            </div>
            <h3 className="text-xl font-bold font-['Montserrat',sans-serif] text-white pt-2">
              Sovereign Interoperability
            </h3>
            <p className="text-xs text-white/85 leading-relaxed font-normal">
              State governments retain 100% cryptographic sovereignty over their agricultural registries while broadcasting real-time early warnings across district corridors.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 border border-white/15 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider font-['Montserrat',sans-serif] text-[#DFEB38]">
                Mesh Network Throughput
              </span>
              <span className="text-xs font-mono text-white/70">24/7 Monitored</span>
            </div>
            <span className="text-2xl font-black font-['Montserrat',sans-serif] text-white block">
              284,000+ Queries / hr
            </span>
            <span className="text-[11px] text-white/80 block">
              Average edge latency: 18.2ms across Indian agricultural zones
            </span>
          </div>
        </div>
      </div>


      {/* ── 2. NATIONAL OVERVIEW KPI METRICS ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-[2.2rem] border border-[#022113]/8 p-6 sm:p-7 shadow-xl hover:shadow-2xl transition-all">
          <span className="block text-[11px] uppercase font-bold tracking-wider font-['Montserrat',sans-serif] text-[#546C18]">
            Connected Farmers
          </span>
          <div className="flex items-center gap-2.5 mt-2">
            <Users className="w-5 h-5 text-[#546C18]" />
            <span className="text-xl sm:text-3xl font-black text-[#022113] font-['Montserrat',sans-serif]">
              {totalGrowers.toLocaleString()}
            </span>
          </div>
          <span className="text-[11px] text-[#022113]/60 mt-1.5 block font-normal">
            Across 10 active federated states
          </span>
        </div>

        <div className="bg-white rounded-[2.2rem] border border-[#022113]/8 p-6 sm:p-7 shadow-xl hover:shadow-2xl transition-all">
          <span className="block text-[11px] uppercase font-bold tracking-wider font-['Montserrat',sans-serif] text-[#546C18]">
            Verified AgriParcels
          </span>
          <div className="flex items-center gap-2.5 mt-2">
            <Sprout className="w-5 h-5 text-[#546C18]" />
            <span className="text-xl sm:text-3xl font-black text-[#022113] font-['Montserrat',sans-serif]">
              {totalParcels.toLocaleString()}
            </span>
          </div>
          <span className="text-[11px] text-[#022113]/60 mt-1.5 block font-normal">
            Cadastral georeferenced plots
          </span>
        </div>

        <div className="bg-white rounded-[2.2rem] border border-[#022113]/8 p-6 sm:p-7 shadow-xl hover:shadow-2xl transition-all">
          <span className="block text-[11px] uppercase font-bold tracking-wider font-['Montserrat',sans-serif] text-[#546C18]">
            Cross-Border Pathogen Alerts
          </span>
          <div className="flex items-center gap-2.5 mt-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span className="text-xl sm:text-3xl font-black text-[#022113] font-['Montserrat',sans-serif]">
              {diseaseAlerts.length} Active Corridors
            </span>
          </div>
          <span className="text-[11px] text-[#022113]/60 mt-1.5 block font-normal">
            ICAR coordinated quarantine
          </span>
        </div>

        <div className="bg-[#546C18] text-white rounded-[2.2rem] p-6 sm:p-7 shadow-xl hover:shadow-2xl transition-all">
          <span className="block text-[11px] uppercase font-bold tracking-wider font-['Montserrat',sans-serif] text-[#DFEB38]">
            National Mean Canopy NDVI
          </span>
          <div className="flex items-center gap-2.5 mt-2">
            <Globe className="w-5 h-5 text-[#DFEB38]" />
            <span className="text-xl sm:text-3xl font-black text-[#DFEB38] font-['Montserrat',sans-serif]">
              {avgNdvi}
            </span>
          </div>
          <span className="text-[11px] text-white/80 mt-1.5 block font-normal">
            Healthy vegetative vigor
          </span>
        </div>
      </div>


      {/* ── 3. NAVIGATION TAB BAR & CONTROLS ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedTab('topology')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold font-['Montserrat',sans-serif] uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              selectedTab === 'topology'
                ? 'bg-[#546C18] text-[#DFEB38] shadow-md'
                : 'bg-[#F0F4EC] text-[#022113] hover:bg-[#E2ECE3] border border-[#E5EAD7]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>1. Federated State Topology</span>
          </button>

          <button
            onClick={() => setSelectedTab('surveillance')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold font-['Montserrat',sans-serif] uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              selectedTab === 'surveillance'
                ? 'bg-[#546C18] text-[#DFEB38] shadow-md'
                : 'bg-[#F0F4EC] text-[#022113] hover:bg-[#E2ECE3] border border-[#E5EAD7]'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>2. Pathogen Surveillance ({diseaseAlerts.length})</span>
          </button>
        </div>
      </div>


      {/* ── 4. TAB 1: FEDERATED TOPOLOGY & STATE NODES ── */}
      {selectedTab === 'topology' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white rounded-[2rem] p-4 sm:p-6 border border-[#022113]/8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#022113]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search state, APMC terminal hub, or crop..."
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#F8FAF6] border border-[#022113]/10 text-xs font-semibold text-[#022113] placeholder-[#022113]/40 outline-none focus:border-[#546C18] transition-all"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-[#022113]/60 uppercase tracking-wider font-['Montserrat',sans-serif] mr-1 flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3" />
                <span>Filter:</span>
              </span>
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-full text-xs font-bold font-['Montserrat',sans-serif] transition-all cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-[#546C18] text-[#DFEB38]'
                    : 'bg-[#F0F2EB] text-[#022113] hover:bg-[#E2ECE3]'
                }`}
              >
                All Nodes ({nodes.length})
              </button>
              <button
                onClick={() => setStatusFilter('optimal')}
                className={`px-3 py-1 rounded-full text-xs font-bold font-['Montserrat',sans-serif] transition-all cursor-pointer ${
                  statusFilter === 'optimal'
                    ? 'bg-[#546C18] text-[#DFEB38]'
                    : 'bg-[#F0F2EB] text-[#022113] hover:bg-[#E2ECE3]'
                }`}
              >
                Optimal Only
              </button>
              <button
                onClick={() => setStatusFilter('watch')}
                className={`px-3 py-1 rounded-full text-xs font-bold font-['Montserrat',sans-serif] transition-all cursor-pointer ${
                  statusFilter === 'watch'
                    ? 'bg-[#546C18] text-[#DFEB38]'
                    : 'bg-[#F0F2EB] text-[#022113] hover:bg-[#E2ECE3]'
                }`}
              >
                Under Watch
              </button>
            </div>
              {/* Carousel / Grid Toggle and Navigation Controls */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-[#F0F2EB] p-1 rounded-full border border-[#022113]/5">
                  <button
                    onClick={() => setNodeViewLayout('carousel')}
                    title="Spotlight Carousel"
                    className={`px-3 py-1 rounded-full text-xs font-bold font-['Montserrat',sans-serif] flex items-center gap-1.5 transition-all cursor-pointer ${
                      nodeViewLayout === 'carousel'
                        ? 'bg-[#546C18] text-[#DFEB38] shadow-xs'
                        : 'text-[#022113]/70 hover:text-[#022113]'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Carousel</span>
                  </button>
                  <button
                    onClick={() => setNodeViewLayout('grid')}
                    title="Grid View"
                    className={`px-3 py-1 rounded-full text-xs font-bold font-['Montserrat',sans-serif] flex items-center gap-1.5 transition-all cursor-pointer ${
                      nodeViewLayout === 'grid'
                        ? 'bg-[#546C18] text-[#DFEB38] shadow-xs'
                        : 'text-[#022113]/70 hover:text-[#022113]'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Grid</span>
                  </button>
                </div>

                {nodeViewLayout === 'carousel' && (
                  <div className="flex items-center gap-1 ml-1">
                    <button
                      onClick={scrollNodePrev}
                      className="w-8 h-8 rounded-full bg-[#F0F2EB] hover:bg-[#DFEB38] text-[#022113] flex items-center justify-center transition-all cursor-pointer shadow-xs border border-[#022113]/5"
                      title="Previous Node"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={scrollNodeNext}
                      className="w-8 h-8 rounded-full bg-[#F0F2EB] hover:bg-[#DFEB38] text-[#022113] flex items-center justify-center transition-all cursor-pointer shadow-xs border border-[#022113]/5"
                      title="Next Node"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

          {/* State Nodes View */}
          {nodeViewLayout === 'carousel' ? (
            <div className="space-y-4">
              <div
                ref={nodeCarouselRef}
                onMouseMove={handleNodeContainerMouseMove}
                onMouseDown={handleNodeMouseDown}
                onMouseUp={handleNodeMouseUp}
                onMouseLeave={handleNodeMouseUp}
                onContextMenu={(e) => e.preventDefault()}
                onWheel={handleNodeWheel}
                onTouchStart={handleNodeTouchStart}
                onTouchMove={handleNodeTouchMove}
                onTouchEnd={handleNodeTouchEnd}
                onScroll={handleNodeScroll}
                className="flex gap-5 overflow-x-auto pb-4 pt-1 px-1 select-none cursor-grab active:cursor-grabbing scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:none overscroll-x-contain"
              >
                {filteredNodes.map((node) => (
                  <div
                    key={node.code}
                    onClick={() => {
                      if (!nodeHasDraggedRef.current) setSelectedNodeModal(node);
                    }}
                    onMouseMove={handleCardMouseMove}
                    onMouseLeave={handleCardMouseLeave}
                    style={{
                      '--spotlight-x': '50%',
                      '--spotlight-y': '50%',
                      '--spotlight-opacity': '0',
                    } as React.CSSProperties}
                    className="group relative bg-white rounded-[2.2rem] p-6 border-2 border-[#022113]/8 hover:border-[#546C18]/40 shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between w-[320px] sm:w-[350px] md:w-[370px] h-[340px] shrink-0 overflow-hidden font-['Open_Sans',sans-serif]"
                  >
                    {/* Spotlight Glow Overlay */}
                    <div 
                      className="pointer-events-none absolute -inset-px rounded-[2.2rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{
                        background: 'radial-gradient(350px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), rgba(223, 235, 56, 0.18), transparent 70%)'
                      }}
                    />

                    <div className="space-y-3 relative z-10">
                      <div className="flex items-start justify-between h-[52px]">
                        <div className="min-w-0 pr-2">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#F0F2EB] text-[#546C18] border border-[#022113]/5">
                            {node.code}
                          </span>
                          <h3 className="text-xl font-bold font-['Montserrat',sans-serif] text-[#022113] mt-1 group-hover:text-[#546C18] transition-colors truncate">
                            {node.state}
                          </h3>
                        </div>
                        <span className="w-8 h-8 rounded-full bg-[#F0F2EB] group-hover:bg-[#DFEB38] text-[#022113] flex items-center justify-center transition-all shrink-0">
                          <ArrowUpRight className="w-4 h-4" />
                        </span>
                      </div>

                      <div className="h-[36px] flex items-center">
                        <p className="text-xs text-[#022113]/70 font-medium line-clamp-2">
                          {node.hub}
                        </p>
                      </div>

                      <div className="h-[110px] p-3 rounded-2xl bg-[#F8FAF6] border border-[#022113]/5 flex flex-col justify-between text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase text-[#022113]/50 font-['Montserrat',sans-serif]">
                            Dominant Crops:
                          </span>
                          <span className="font-semibold text-[#022113] truncate max-w-[170px] text-right">
                            {node.dominant_crops.slice(0, 2).join(', ')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase text-[#022113]/50 font-['Montserrat',sans-serif]">
                            Sentinel-2 NDVI:
                          </span>
                          <span className="font-mono font-bold text-[#546C18]">
                            {node.ndvi_mean}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase text-[#022113]/50 font-['Montserrat',sans-serif]">
                            Agency:
                          </span>
                          <span className="text-[11px] text-[#022113]/70 truncate max-w-[160px] text-right">
                            {node.agency.split('(')[0]}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#022113]/8 flex items-center justify-between text-xs h-[42px] relative z-10">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-[11px] font-mono text-[#022113]/70">{node.latency_ms}ms ping</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-['Montserrat',sans-serif] uppercase tracking-wider ${
                        node.health_status === 'Optimal'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {node.health_status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Carousel Footer Indicator Bar */}
              <div className="flex items-center justify-between px-2 pt-1 text-xs text-[#022113]/60">
                <span className="font-medium flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#546C18] animate-pulse" />
                  <span>Right-click & drag or use 2 fingers to scroll terminal cards</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-bold text-[#022113]">
                    {Math.min(activeNodeIndex + 1, filteredNodes.length)} / {filteredNodes.length} Nodes
                  </span>
                  <div className="flex items-center gap-1">
                    {filteredNodes.slice(0, 10).map((_, i) => (
                      <span
                        key={i}
                        className={`inline-block h-1.5 rounded-full transition-all duration-300 ${
                          i === activeNodeIndex ? 'w-5 bg-[#546C18]' : 'w-1.5 bg-[#022113]/15'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredNodes.map((node) => (
                <div
                  key={node.code}
                  onClick={() => setSelectedNodeModal(node)}
                  onMouseMove={handleCardMouseMove}
                  onMouseLeave={handleCardMouseLeave}
                  style={{
                    '--spotlight-x': '50%',
                    '--spotlight-y': '50%',
                    '--spotlight-opacity': '0',
                  } as React.CSSProperties}
                  className="group relative bg-white rounded-[2.2rem] p-6 border-2 border-[#022113]/8 hover:border-[#546C18]/40 shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between h-[340px] overflow-hidden font-['Open_Sans',sans-serif]"
                >
                  <div 
                    className="pointer-events-none absolute -inset-px rounded-[2.2rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      background: 'radial-gradient(350px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), rgba(223, 235, 56, 0.18), transparent 70%)'
                    }}
                  />
                  <div className="space-y-3 relative z-10">
                    <div className="flex items-start justify-between h-[52px]">
                      <div className="min-w-0 pr-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#F0F2EB] text-[#546C18] border border-[#022113]/5">
                          {node.code}
                        </span>
                        <h3 className="text-xl font-bold font-['Montserrat',sans-serif] text-[#022113] mt-1 group-hover:text-[#546C18] transition-colors truncate">
                          {node.state}
                        </h3>
                      </div>
                      <span className="w-8 h-8 rounded-full bg-[#F0F2EB] group-hover:bg-[#DFEB38] text-[#022113] flex items-center justify-center transition-all shrink-0">
                        <ArrowUpRight className="w-4 h-4" />
                      </span>
                    </div>

                    <div className="h-[36px] flex items-center">
                      <p className="text-xs text-[#022113]/70 font-medium line-clamp-2">
                        {node.hub}
                      </p>
                    </div>

                    <div className="h-[110px] p-3 rounded-2xl bg-[#F8FAF6] border border-[#022113]/5 flex flex-col justify-between text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-[#022113]/50 font-['Montserrat',sans-serif]">
                          Dominant Crops:
                        </span>
                        <span className="font-semibold text-[#022113] truncate max-w-[170px] text-right">
                          {node.dominant_crops.slice(0, 2).join(', ')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-[#022113]/50 font-['Montserrat',sans-serif]">
                          Sentinel-2 NDVI:
                        </span>
                        <span className="font-mono font-bold text-[#546C18]">
                          {node.ndvi_mean}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-[#022113]/50 font-['Montserrat',sans-serif]">
                          Agency:
                        </span>
                        <span className="text-[11px] text-[#022113]/70 truncate max-w-[160px] text-right">
                          {node.agency.split('(')[0]}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#022113]/8 flex items-center justify-between text-xs h-[42px] relative z-10">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-[11px] font-mono text-[#022113]/70">{node.latency_ms}ms ping</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-['Montserrat',sans-serif] uppercase tracking-wider ${
                      node.health_status === 'Optimal'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {node.health_status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Detailed State Table */}
          <div className="bg-white rounded-[2.5rem] border border-[#022113]/8 p-6 sm:p-8 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#022113]/8">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider font-['Montserrat',sans-serif] text-[#022113]">
                  Participating State Agriculture Departments
                </h3>
                <p className="text-xs text-[#022113]/60 mt-0.5">
                  Synchronizing every 15 minutes with ICAR, DMI Agmarknet, and Copernicus Sentinel-2
                </p>
              </div>
              <span className="text-xs font-mono text-[#546C18] font-bold bg-[#F0F2EB] px-3 py-1 rounded-full border border-[#022113]/5">
                Total Contracts: {totalContracts}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#022113]/8 text-[10px] font-bold uppercase tracking-wider font-['Montserrat',sans-serif] text-[#022113]/60">
                    <th className="py-3 px-3">State Node</th>
                    <th className="py-3 px-3">Primary APMC Hub</th>
                    <th className="py-3 px-3">Dominant Crops</th>
                    <th className="py-3 px-3">Sentinel NDVI</th>
                    <th className="py-3 px-3">Health Status</th>
                    <th className="py-3 px-3">Registered Parcels</th>
                    <th className="py-3 px-3">Active Growers</th>
                    <th className="py-3 px-3">Edge Latency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#022113]/5">
                  {filteredNodes.map((row) => (
                    <tr 
                      key={row.code} 
                      onClick={() => setSelectedNodeModal(row)}
                      className="hover:bg-[#F8FAF6] transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-3 font-bold text-[#022113] font-['Montserrat',sans-serif] flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#546C18]" />
                        <span>{row.state}</span>
                        <span className="text-[10px] font-mono text-[#022113]/40">({row.code})</span>
                      </td>
                      <td className="py-3 px-3 text-[#022113]/70 font-medium max-w-xs truncate">{row.hub}</td>
                      <td className="py-3 px-3 text-[#022113]/70">{row.dominant_crops.join(', ')}</td>
                      <td className="py-3 px-3 font-mono font-bold text-[#546C18]">{row.ndvi_mean}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-['Montserrat',sans-serif] uppercase tracking-wider ${
                          row.health_status === 'Optimal'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {row.health_status}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[#022113]/80">{row.verified_parcels.toLocaleString()}</td>
                      <td className="py-3 px-3 font-mono text-[#022113]/80">{row.active_growers.toLocaleString()}</td>
                      <td className="py-3 px-3 font-mono text-emerald-700 font-bold">{row.latency_ms}ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}


      {/* ── 5. TAB 2: CROSS-BORDER EPIDEMIOLOGICAL SURVEILLANCE ── */}
      {selectedTab === 'surveillance' && (
        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-[#022113]/8 p-8 sm:p-10 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#022113]/8">
              <div>
                <h3 className="text-base font-bold uppercase tracking-wider font-['Montserrat',sans-serif] text-[#022113]">
                  Coordinated Inter-State Pathogen Early Warning Corridors
                </h3>
                <p className="text-xs text-[#022113]/70 mt-1">
                  Cross-state alerts dispatched via automated vector forecasting, micro-climate humidity thresholds, and Gemini Diagnostic scans.
                </p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="px-3 py-1 rounded-full text-xs font-bold font-['Montserrat',sans-serif] uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200">
                  {diseaseAlerts.length} Active Corridors Under ICAR Watch
                </span>

                {/* Carousel / Grid Toggle and Navigation Controls */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-[#F0F2EB] p-1 rounded-full border border-[#022113]/5">
                    <button
                      onClick={() => setAlertViewLayout('carousel')}
                      title="Spotlight Carousel"
                      className={`px-3 py-1 rounded-full text-xs font-bold font-['Montserrat',sans-serif] flex items-center gap-1.5 transition-all cursor-pointer ${
                        alertViewLayout === 'carousel'
                          ? 'bg-[#546C18] text-[#DFEB38] shadow-xs'
                          : 'text-[#022113]/70 hover:text-[#022113]'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Carousel</span>
                    </button>
                    <button
                      onClick={() => setAlertViewLayout('grid')}
                      title="Grid View"
                      className={`px-3 py-1 rounded-full text-xs font-bold font-['Montserrat',sans-serif] flex items-center gap-1.5 transition-all cursor-pointer ${
                        alertViewLayout === 'grid'
                          ? 'bg-[#546C18] text-[#DFEB38] shadow-xs'
                          : 'text-[#022113]/70 hover:text-[#022113]'
                      }`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>Grid</span>
                    </button>
                  </div>

                  {alertViewLayout === 'carousel' && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={scrollAlertPrev}
                        className="w-8 h-8 rounded-full bg-[#F0F2EB] hover:bg-[#DFEB38] text-[#022113] flex items-center justify-center transition-all cursor-pointer shadow-xs border border-[#022113]/5"
                        title="Previous Corridor"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={scrollAlertNext}
                        className="w-8 h-8 rounded-full bg-[#F0F2EB] hover:bg-[#DFEB38] text-[#022113] flex items-center justify-center transition-all cursor-pointer shadow-xs border border-[#022113]/5"
                        title="Next Corridor"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Disease Alerts View */}
            {alertViewLayout === 'carousel' ? (
              <div className="space-y-4">
                <div 
                  ref={alertCarouselRef}
                  onMouseMove={handleAlertContainerMouseMove}
                  onMouseDown={handleAlertMouseDown}
                  onMouseUp={handleAlertMouseUp}
                  onMouseLeave={handleAlertMouseUp}
                  onContextMenu={(e) => e.preventDefault()}
                  onWheel={handleAlertWheel}
                  onTouchStart={handleAlertTouchStart}
                  onTouchMove={handleAlertTouchMove}
                  onTouchEnd={handleAlertTouchEnd}
                  onScroll={handleAlertScroll}
                  className="flex gap-6 overflow-x-auto pb-4 pt-1 px-1 select-none cursor-grab active:cursor-grabbing scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:none overscroll-x-contain"
                >
                  {diseaseAlerts.map((alert) => (
                    <div 
                      key={alert.id}
                      onMouseMove={handleCardMouseMove}
                      onMouseLeave={handleCardMouseLeave}
                      style={{
                        '--spotlight-x': '50%',
                        '--spotlight-y': '50%',
                        '--spotlight-opacity': '0',
                      } as React.CSSProperties}
                      className="group relative p-6 rounded-[2.2rem] bg-[#F8FAF6] border-2 border-[#022113]/8 hover:border-[#546C18]/40 transition-all shadow-sm hover:shadow-xl flex flex-col justify-between w-[360px] sm:w-[420px] md:w-[460px] h-[430px] shrink-0 overflow-hidden font-['Open_Sans',sans-serif]"
                    >
                      {/* Spotlight Glow Overlay */}
                      <div 
                        className="pointer-events-none absolute -inset-px rounded-[2.2rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        style={{
                          background: 'radial-gradient(400px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), rgba(84, 108, 24, 0.14), transparent 70%)'
                        }}
                      />

                      <div className="space-y-3 relative z-10">
                        <div className="flex items-start justify-between gap-3 h-[68px]">
                          <div className="min-w-0 pr-2">
                            <span className="text-[10px] font-mono font-bold text-[#546C18] block">{alert.id}</span>
                            <h4 className="text-lg font-bold text-[#022113] font-['Montserrat',sans-serif] mt-0.5 truncate">
                              {alert.pathogen}
                            </h4>
                            <span className="text-xs font-semibold text-[#546C18] truncate block">Host Crop: {alert.crop}</span>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold font-['Montserrat',sans-serif] uppercase tracking-wider shrink-0 ${
                            alert.severity === 'high'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {alert.severity} Risk
                          </span>
                        </div>

                        {/* Vector Trajectory Corridor */}
                        <div className="p-3.5 rounded-2xl bg-white border border-[#022113]/5 flex flex-col justify-between h-[76px]">
                          <div className="flex items-center justify-between text-xs font-bold font-['Montserrat',sans-serif]">
                            <span className="text-[#022113] truncate max-w-[140px]">{alert.originDistrict}, {alert.originState}</span>
                            <span className="text-[#546C18] flex items-center gap-1 font-mono text-[11px] shrink-0 px-1">
                              <span>→</span>
                              <span>{alert.vectorDistanceKm} km</span>
                              <span>→</span>
                            </span>
                            <span className="text-[#022113] truncate max-w-[140px] text-right">{alert.destinationDistrict}, {alert.destinationState}</span>
                          </div>
                          <div className="text-[11px] text-[#022113]/60 flex items-center justify-between pt-1 border-t border-[#022113]/5">
                            <span className="truncate max-w-[190px]">Vector: {alert.vectorType}</span>
                            <span className="font-mono shrink-0">Radius: {alert.containmentRadiusKm} km</span>
                          </div>
                        </div>

                        {/* ICAR Prophylactic Prescription */}
                        <div className="text-xs space-y-1 h-[120px] flex flex-col">
                          <span className="text-[10px] font-bold uppercase text-[#546C18] font-['Montserrat',sans-serif] block h-[18px]">
                            ICAR Prophylactic Prescription:
                          </span>
                          <div className="h-[96px] overflow-hidden bg-white p-3 rounded-xl border border-[#022113]/5">
                            <p className="text-[#022113]/80 leading-relaxed font-normal text-xs line-clamp-3">
                              {alert.recommendedAdvisory}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#022113]/8 flex items-center justify-between text-xs h-[46px] relative z-10">
                        <span className="text-xs font-mono text-[#022113]/60">
                          {alert.verifiedReports} Field Scans Verified
                        </span>
                        <button
                          onClick={() => {
                            if (!alertHasDraggedRef.current) {
                              onNavigate('diagnose');
                            }
                          }}
                          className="px-4 py-2 rounded-full bg-[#DFEB38] text-[#022113] font-bold text-xs font-['Montserrat',sans-serif] uppercase tracking-wider hover:bg-[#d0df2a] transition-all flex items-center gap-1 cursor-pointer shadow-xs shrink-0"
                        >
                          <span>Run Leaf Diagnosis</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Carousel Footer Indicator Bar */}
                <div className="flex items-center justify-between px-2 pt-1 text-xs text-[#022113]/60">
                  <span className="font-medium flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    <span>Right-click & drag or use 2 fingers to scroll pathogen corridors</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-[#022113]">
                      {Math.min(activeAlertIndex + 1, diseaseAlerts.length)} / {diseaseAlerts.length} Corridors
                    </span>
                    <div className="flex items-center gap-1">
                      {diseaseAlerts.map((_, i) => (
                        <span
                          key={i}
                          className={`inline-block h-1.5 rounded-full transition-all duration-300 ${
                            i === activeAlertIndex ? 'w-5 bg-[#546C18]' : 'w-1.5 bg-[#022113]/15'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {diseaseAlerts.map((alert) => (
                  <div 
                    key={alert.id}
                    onMouseMove={handleCardMouseMove}
                    onMouseLeave={handleCardMouseLeave}
                    style={{
                      '--spotlight-x': '50%',
                      '--spotlight-y': '50%',
                      '--spotlight-opacity': '0',
                    } as React.CSSProperties}
                    className="group relative p-6 rounded-[2.2rem] bg-[#F8FAF6] border-2 border-[#022113]/8 hover:border-[#546C18]/40 transition-all shadow-sm hover:shadow-xl flex flex-col justify-between h-[430px] overflow-hidden font-['Open_Sans',sans-serif]"
                  >
                    <div 
                      className="pointer-events-none absolute -inset-px rounded-[2.2rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{
                        background: 'radial-gradient(400px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), rgba(84, 108, 24, 0.14), transparent 70%)'
                      }}
                    />

                    <div className="space-y-3 relative z-10">
                      <div className="flex items-start justify-between gap-3 h-[68px]">
                        <div className="min-w-0 pr-2">
                          <span className="text-[10px] font-mono font-bold text-[#546C18] block">{alert.id}</span>
                          <h4 className="text-lg font-bold text-[#022113] font-['Montserrat',sans-serif] mt-0.5 truncate">
                            {alert.pathogen}
                          </h4>
                          <span className="text-xs font-semibold text-[#546C18] truncate block">Host Crop: {alert.crop}</span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold font-['Montserrat',sans-serif] uppercase tracking-wider shrink-0 ${
                          alert.severity === 'high'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {alert.severity} Risk
                        </span>
                      </div>

                      {/* Vector Trajectory Corridor */}
                      <div className="p-3.5 rounded-2xl bg-white border border-[#022113]/5 flex flex-col justify-between h-[76px]">
                        <div className="flex items-center justify-between text-xs font-bold font-['Montserrat',sans-serif]">
                          <span className="text-[#022113] truncate max-w-[140px]">{alert.originDistrict}, {alert.originState}</span>
                          <span className="text-[#546C18] flex items-center gap-1 font-mono text-[11px] shrink-0 px-1">
                            <span>→</span>
                            <span>{alert.vectorDistanceKm} km</span>
                            <span>→</span>
                          </span>
                          <span className="text-[#022113] truncate max-w-[140px] text-right">{alert.destinationDistrict}, {alert.destinationState}</span>
                        </div>
                        <div className="text-[11px] text-[#022113]/60 flex items-center justify-between pt-1 border-t border-[#022113]/5">
                          <span className="truncate max-w-[190px]">Vector: {alert.vectorType}</span>
                          <span className="font-mono shrink-0">Radius: {alert.containmentRadiusKm} km</span>
                        </div>
                      </div>

                      {/* ICAR Prophylactic Prescription */}
                      <div className="text-xs space-y-1 h-[120px] flex flex-col">
                        <span className="text-[10px] font-bold uppercase text-[#546C18] font-['Montserrat',sans-serif] block h-[18px]">
                          ICAR Prophylactic Prescription:
                        </span>
                        <div className="h-[96px] overflow-hidden bg-white p-3 rounded-xl border border-[#022113]/5">
                          <p className="text-[#022113]/80 leading-relaxed font-normal text-xs line-clamp-3">
                            {alert.recommendedAdvisory}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#022113]/8 flex items-center justify-between text-xs h-[46px] relative z-10">
                      <span className="text-xs font-mono text-[#022113]/60">
                        {alert.verifiedReports} Field Scans Verified
                      </span>
                      <button
                        onClick={() => onNavigate('diagnose')}
                        className="px-4 py-2 rounded-full bg-[#DFEB38] text-[#022113] font-bold text-xs font-['Montserrat',sans-serif] uppercase tracking-wider hover:bg-[#d0df2a] transition-all flex items-center gap-1 cursor-pointer shadow-xs shrink-0"
                      >
                        <span>Run Leaf Diagnosis</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}


      {/* ── 6. STATE NODE INSPECTION MODAL ── */}
      {selectedNodeModal && (
        <div 
          className="fixed inset-0 z-50 bg-[#022113]/50 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedNodeModal(null)}
        >
          <div 
            className="bg-white rounded-[2.5rem] max-w-xl w-full p-8 shadow-2xl border border-[#022113]/10 space-y-6 animate-in fade-in zoom-in-95 cursor-default relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#F0F2EB] text-[#546C18]">
                  {selectedNodeModal.code} Node
                </span>
                <h3 className="text-2xl font-black font-['Montserrat',sans-serif] text-[#022113] mt-1">
                  {selectedNodeModal.state} Agricultural Telemetry
                </h3>
                <p className="text-xs text-[#022113]/70 mt-0.5">
                  {selectedNodeModal.agency}
                </p>
              </div>

              <button
                onClick={() => setSelectedNodeModal(null)}
                className="w-8 h-8 rounded-full bg-[#F0F2EB] text-[#022113] flex items-center justify-center font-bold text-xs hover:bg-[#E2ECE3] transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-[#F8FAF6] p-3.5 rounded-2xl border border-[#022113]/5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#022113]/50 font-['Montserrat',sans-serif] block">
                  APMC Terminal Hub
                </span>
                <span className="font-bold text-[#022113] mt-1 block">
                  {selectedNodeModal.hub}
                </span>
              </div>

              <div className="bg-[#F8FAF6] p-3.5 rounded-2xl border border-[#022113]/5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#022113]/50 font-['Montserrat',sans-serif] block">
                  Sentinel-2 NDVI Canopy
                </span>
                <span className="font-bold text-[#546C18] mt-1 block font-mono text-sm">
                  {selectedNodeModal.ndvi_mean} ({selectedNodeModal.health_status})
                </span>
              </div>

              <div className="bg-[#F8FAF6] p-3.5 rounded-2xl border border-[#022113]/5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#022113]/50 font-['Montserrat',sans-serif] block">
                  Registered Parcels
                </span>
                <span className="font-bold text-[#022113] mt-1 block font-mono">
                  {selectedNodeModal.verified_parcels.toLocaleString()}
                </span>
              </div>

              <div className="bg-[#F8FAF6] p-3.5 rounded-2xl border border-[#022113]/5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#022113]/50 font-['Montserrat',sans-serif] block">
                  Edge Response Latency
                </span>
                <span className="font-bold text-emerald-700 mt-1 block font-mono">
                  {selectedNodeModal.latency_ms} ms ping
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#022113] text-white space-y-1 text-xs">
              <span className="text-[10px] uppercase font-bold text-[#DFEB38] font-['Montserrat',sans-serif] block">
                Security & Consensus
              </span>
              <p className="text-white/80 font-mono text-[11px]">
                {selectedNodeModal.security} • {selectedNodeModal.protocol_version}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-[#022113]/60 font-mono">
                Sync frequency: {selectedNodeModal.sync_interval}
              </span>
              <button
                onClick={() => setSelectedNodeModal(null)}
                className="px-6 py-2.5 rounded-full bg-[#DFEB38] text-[#022113] font-bold text-xs font-['Montserrat',sans-serif] uppercase tracking-wider hover:bg-[#d0df2a] transition-all cursor-pointer shadow-md"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default GovDashboardPage;
