
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { 
  CameraAngle, 
  ProductCategory, 
  FramingMode, 
  ProductGender, 
  PredefinedModel, 
  ModelPose, 
  ModelDna, 
  BodyMeasurements, 
  SceneMode 
} from './types';
import { 
  generateProductImage, 
  blobToBase64, 
  generateAdvancedConcept, 
  analyzeModelDna, 
  analyzeProductFidelity, 
  generateEditorConcept,
  generateCreativePose,
  optimizePrompt
} from './services/geminiService';
import { Button } from './components/Button';
import { ApiKeySelector } from './components/ApiKeySelector';
import { 
  RefreshCw, 
  Plus, 
  Trash2, 
  ChevronDown, 
  Sparkles, 
  Wand2, 
  Camera, 
  Download, 
  Maximize2, 
  Settings2, 
  Image as ImageIcon, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Sliders,
  Crop,
  UserX,
  Scissors, 
  Layout, 
  RotateCcw, 
  Palette, 
  Edit3, 
  X, 
  Info, 
  Layers, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Eye, 
  EyeOff,
  Loader2,
  Box,
  Shirt,
  Footprints,
  Watch,
  Briefcase,
  Smartphone,
  Sparkle,
  Zap
} from 'lucide-react';

const PREDEFINED_MODELS: PredefinedModel[] = [
  {
    id: 'model-clara',
    name: 'Clara',
    gender: ProductGender.FEMALE,
    thumbnail: 'models/Clara.jpg',
    dna: {
      ethnicity: 'Northern European (Caucasian)',
      age: '21',
      hairstyle: 'Soft golden blonde hair with natural highlights and messy-chic fringe bangs',
      facialFeatures: 'Soulful crystal blue eyes, porcelain skin with delicate freckles, natural healthy glow',
      height: 178,
      weight: 56,
      measurements: { bust: 88, waist: 60, hip: 90, wrist: 14, ankle: 19, headWidth: 14, headHeight: 21 }
    },
    promptHint: '21-year-old Northern European female model. DNA: Soft golden blonde hair, blue eyes. Body: Seductive hourglass figure, 9-head fashion proportions, long slender legs. Height: 178cm. Measurements: 88-60-90.'
  },
  {
    id: 'model-james',
    name: 'James',
    gender: ProductGender.MALE,
    thumbnail: 'models/James.jpg', 
    dna: {
      ethnicity: 'Western / Mediterranean (Caucasian)',
      age: '38',
      hairstyle: 'Voluminous medium-length wavy dark brown hair, natural texture and flow',
      facialFeatures: 'Deep-set intense hazel eyes, sharp chiseled jawline with subtle stubble, masculine and refined features',
      height: 188,
      weight: 82,
      measurements: { bust: 108, waist: 82, hip: 100, wrist: 17, ankle: 23, headWidth: 16, headHeight: 24 }
    },
    promptHint: '38-year-old Western/Mediterranean male model. DNA: Wavy dark brown hair, hazel eyes. Body: Highly muscular and athletic build, broad shoulders, 9-head fashion proportions. Height: 188cm. Measurements: 108-82-100.'
  },
  {
    id: 'model-trung-quan',
    name: 'Alex',
    gender: ProductGender.MALE,
    thumbnail: 'models/TrungQuan-1.jpg',
    dna: {
      ethnicity: 'Vietnamese (Southeast Asian)',
      age: '26',
      hairstyle: 'Modern textured spiky dark hair with a clean fade and sharp contours',
      facialFeatures: 'Highly defined masculine jawline, intense dark brown eyes, high cheekbones, flawless sun-kissed tan skin, authoritative yet refined expression',
      height: 185,
      weight: 78,
      measurements: { bust: 104, waist: 80, hip: 98, wrist: 16, ankle: 22, headWidth: 15, headHeight: 23 }
    },
    promptHint: '26-year-old Vietnamese male model. DNA: Modern spiky dark hair, sharp masculine jawline, intense dark eyes. Body: Chiseled authoritative V-taper physique, broad powerful shoulders, 9-head fashion proportions. Height: 185cm. Measurements: 104-80-98.'
  },
  {
    id: 'model-ngan-vu',
    name: 'Sarah',
    gender: ProductGender.FEMALE,
    thumbnail: 'models/NganVu.jpg',
    profileImage: 'models/NganVu-profile.png',
    dna: {
      ethnicity: 'Vietnamese (Southeast Asian)',
      age: '24',
      hairstyle: 'Long voluminous wavy jet-black hair',
      facialFeatures: 'Captivating large eyes, soft greyish-brown contacts, V-shaped face, warm beige skin',
      height: 175,
      weight: 54,
      measurements: { bust: 90, waist: 62, hip: 92, wrist: 14, ankle: 20, headWidth: 14, headHeight: 21 }
    },
    promptHint: '24-year-old Vietnamese female model. DNA: Long wavy black hair, large eyes. Body: Statuesque and graceful hourglass silhouette, refined slim waist, 9-head fashion proportions. Height: 175cm. Measurements: 90-62-92.',
  },
  {
    id: 'model-quynh-chi',
    name: 'Chloe',
    gender: ProductGender.FEMALE,
    thumbnail: 'models/QuynhChi.jpg',
    profileImage: 'models/QuynhChi-Profile.png',
    dna: {
      ethnicity: 'Vietnamese (Southeast Asian)',
      age: '22',
      hairstyle: 'Elegant messy bun with loose, soft wavy strands framing the face, dark espresso brown hair',
      facialFeatures: 'Captivating large brown eyes, flawless porcelain skin with a natural glow, gentle and sophisticated expression, soft coral lips',
      height: 172,
      weight: 50,
      measurements: { bust: 88, waist: 60, hip: 90, wrist: 13, ankle: 18, headWidth: 13, headHeight: 20 }
    },
    promptHint: '22-year-old Vietnamese female model with a gentle and sophisticated aura. DNA: Elegant messy bun with loose strands, large brown eyes, porcelain skin. Body: Statuesque and graceful hourglass silhouette, refined slim waist, 9-head fashion proportions. Height: 172cm. Measurements: 88-60-90.'
  },
  {
    id: 'model-alessandro',
    name: 'Alessandro',
    gender: ProductGender.MALE,
    thumbnail: 'models/Alessandro.jpg',
    dna: {
      ethnicity: 'Mediterranean / Southern European (Caucasian)',
      age: '30',
      hairstyle: 'Short textured dark brown hair with a modern fade and clean styling',
      facialFeatures: 'Sharp masculine jawline, well-groomed thick beard, intense dark brown eyes, authoritative and refined look',
      height: 188,
      weight: 84,
      measurements: { bust: 110, waist: 82, hip: 102, wrist: 17, ankle: 23, headWidth: 16, headHeight: 24 }
    },
    promptHint: '30-year-old Mediterranean male model. DNA: Short textured dark hair, groomed beard, sharp jawline. Body: Chiseled authoritative V-taper physique, broad powerful shoulders, 9-head fashion proportions. Height: 188cm. Measurements: 110-82-102.'
  }
];

const ASPECT_RATIOS = ["1:1", "3:4", "4:3", "9:16", "16:9"];
const CAMERA_ANGLES = Object.values(CameraAngle);
const CATEGORIES = Object.values(ProductCategory);
const FRAMING_MODES = Object.values(FramingMode);
const RESOLUTIONS: ('1K' | '2K' | '4K')[] = ['1K', '2K', '4K'];

const CREATIVE_VIBES = [
  { id: 'Natural', label: 'NATURAL' },
  { id: 'Minimalism', label: 'MINIMAL' },
  { id: 'Luxury', label: 'LUXURY' },
  { id: 'Vintage', label: 'VINTAGE' },
  { id: 'Sport', label: 'SPORT' },
  { id: 'Streetwear', label: 'STREET' },
  { id: 'Studio', label: 'STUDIO' },
  { id: 'OldMoney', label: 'OLD MONEY' },
  { id: 'Cinematic', label: 'CINEMATIC' }
];

const POSE_OPTIONS = [
  { value: ModelPose.AUTO, label: 'Auto (Follow Source)' },
  { value: ModelPose.STANDING, label: 'Standing' },
  { value: ModelPose.SITTING, label: 'Sitting' },
  { value: ModelPose.MOVING, label: 'Motion' },
  { value: ModelPose.LEANING, label: 'Leaning' },
  { value: ModelPose.RECLINING, label: 'Lying' },
  { value: ModelPose.CANDID, label: 'Natural' },
  { value: ModelPose.OVER_SHOULDER, label: 'Over Shoulder' },
  { value: ModelPose.ZERO_GRAVITY, label: 'Zero G' },
  { value: ModelPose.CREATIVE, label: 'Creative' },
  { value: ModelPose.REFERENCE, label: 'Reference' }
];

const POSE_SUGGESTIONS = [
  { 
    value: ModelPose.AUTO, 
    label: "Auto (Tự động dáng)", 
    subLabel: "AI tự động tính toán dáng phù hợp bối cảnh",
    promptHint: "",
    iconName: "Sparkles"
  },
  { 
    value: ModelPose.STANDING, 
    label: "Đứng thanh lịch (Standing)", 
    subLabel: "Dáng đứng thả lỏng cơ thể lệch hông tự nhiên",
    promptHint: "Đứng thanh lịch dồn trọng tâm một bên chân",
    iconName: "User"
  },
  { 
    value: ModelPose.SITTING, 
    label: "Ngồi tự nhiên (Sitting)", 
    subLabel: "Ngồi thoải mái tương tác bối cảnh xung quanh",
    promptHint: "Ngồi tự nhiên tương tác với bối cảnh",
    iconName: "Box"
  },
  { 
    value: ModelPose.MOVING, 
    label: "Bước đi chuyển động (Walking)", 
    subLabel: "Cử động bước đi tự nhiên, tóc vạt áo bay nhẹ",
    promptHint: "Sải bước đi tự nhiên chuyển động",
    iconName: "Footprints"
  },
  { 
    value: ModelPose.LEANING, 
    label: "Tựa bối cảnh (Leaning)", 
    subLabel: "Tựa vai, chống tay lên tường, lan can hoặc xe cổ",
    promptHint: "Tựa vai, chống tay lên bối cảnh",
    iconName: "Layers"
  },
  { 
    value: ModelPose.RECLINING, 
    label: "Nằm thảnh thơi (Lying)", 
    subLabel: "Nằm dài thư giãn trên sofa, thảm cỏ, thảm nằm",
    promptHint: "Nằm tạo dáng thảnh thơi thư giãn",
    iconName: "Sliders"
  },
  { 
    value: ModelPose.OVER_SHOULDER, 
    label: "Ngoảnh đầu quyến rũ (Over Shoulder)", 
    subLabel: "Xoay người nhẹ, quay khuôn mặt nhìn camera",
    promptHint: "Ngoảnh đầu nhẹ nhìn qua vai về phía máy ảnh",
    iconName: "RotateCcw"
  },
  { 
    value: ModelPose.ZERO_GRAVITY, 
    label: "Bay bổng siêu thực (Zero G)", 
    subLabel: "Tạo dáng không trọng lực nghệ thuật bay bổng",
    promptHint: "Tạo dáng bay bổng không trọng lực siêu thực",
    iconName: "Zap"
  }
];

const renderPoseIcon = (iconName: string) => {
  switch (iconName) {
    case 'Sparkles': return <Sparkles className="w-4 h-4" />;
    case 'User': return <User className="w-4 h-4" />;
    case 'Box': return <Box className="w-4 h-4" />;
    case 'Footprints': return <Footprints className="w-4 h-4" />;
    case 'Layers': return <Layers className="w-4 h-4" />;
    case 'Sliders': return <Sliders className="w-4 h-4" />;
    case 'RotateCcw': return <RotateCcw className="w-4 h-4" />;
    case 'Zap': return <Zap className="w-4 h-4" />;
    default: return <User className="w-4 h-4" />;
  }
};

const CAMERA_ANGLE_OPTIONS = [
  { value: CameraAngle.AUTO, label: 'Tự động' },
  { value: CameraAngle.FRONT, label: 'Trực diện' },
  { value: CameraAngle.BACK, label: 'Phía sau' },
  { value: CameraAngle.SIDE_PROFILE, label: 'Góc nghiêng' },
  { value: CameraAngle.TOP_DOWN, label: 'Từ trên xuống' },
  { value: CameraAngle.LOW_ANGLE, label: 'Góc thấp' },
  { value: CameraAngle.HIGH_ANGLE, label: 'Góc cao' },
  { value: CameraAngle.CREATIVE, label: 'Sáng tạo' }
];

const FRAMING_OPTIONS = [
  { value: FramingMode.AUTO, label: 'Tự động' },
  { value: FramingMode.FULL_BODY, label: 'Toàn thân' },
  { value: FramingMode.UPPER_BODY, label: 'Bán thân trên' },
  { value: FramingMode.LOWER_BODY, label: 'Bán thân dưới' },
  { value: FramingMode.PORTRAIT, label: 'Chân dung' },
  { value: FramingMode.CLOSE_UP, label: 'Cận cảnh' },
  { value: FramingMode.PRODUCT_FOCUS, label: 'Đặc tả' }
];

type LogoPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

const LOGO_POSITIONS: { value: LogoPosition; label: string }[] = [
  { value: 'top-left', label: 'Top - Left' },
  { value: 'top-center', label: 'Top - Center' },
  { value: 'top-right', label: 'Top - Right' },
  { value: 'bottom-left', label: 'Bottom - Left' },
  { value: 'bottom-center', label: 'Bottom - Center' },
  { value: 'bottom-right', label: 'Bottom - Right' },
];

const getLogoSvg = (color: string) => `<svg width="100%" height="100%" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M85.998 70.0039H88L95.1309 96.752C96.732 96.9136 98.3561 97 100 97C101.642 97 103.264 96.9151 104.863 96.7539L112 70H122L121.998 70.0039H124L140 130H130L122.639 102.404C119.395 103.782 116.002 104.872 112.492 105.645L106 130H94L87.5039 105.645C83.9938 104.872 80.6015 103.78 77.3574 102.402L70 130H60L76 70H86L85.998 70.0039ZM102.141 106.959C101.43 106.985 100.717 107 100 107C99.2814 107 98.5659 106.985 97.8535 106.959L99.998 115L102.141 106.959ZM115.48 94.4375C117.034 93.9076 118.551 93.2997 120.029 92.6191L117.998 85L115.48 94.4375ZM79.9648 92.6172C81.4431 93.298 82.9604 93.9054 84.5137 94.4355L81.998 85L79.9648 92.6172Z" fill="${color}"/>
</svg>`;

const Toast = ({ message, visible }: { message: string; visible: boolean }) => (
  <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-xl text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-4 transition-all duration-500 z-[100] border border-white/10 ${visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95 pointer-events-none'}`}>
    <div className="relative flex items-center justify-center">
      <div className="w-3 h-3 rounded-full bg-brand-400 animate-ping absolute" />
      <div className="w-3 h-3 rounded-full bg-brand-400 relative" />
    </div>
    <span className="text-sm font-bold tracking-tight">{message}</span>
  </div>
);

const getModelGradient = (id: string) => {
  switch (id) {
    case 'model-clara': return 'from-brand-400 to-indigo-600';
    case 'model-trung-quan': return 'from-emerald-400 to-teal-600';
    case 'model-ngan-vu': return 'from-orange-400 to-rose-500';
    case 'model-quynh-chi': return 'from-pink-400 to-purple-600';
    default: return 'from-slate-400 to-slate-600';
  }
};

export function App() {
  const [apiKeyReady, setApiKeyReady] = useState(false);

  // Persistence Logic
  const [productImages, setProductImages] = useState<string[]>([]);
  const [productSignature, setProductSignature] = useState(() => localStorage.getItem('rendr_productSignature') || ''); 
  const [selectedAngle, setSelectedAngle] = useState<CameraAngle>(() => (localStorage.getItem('rendr_selectedAngle') as CameraAngle) || CameraAngle.AUTO);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>(() => (localStorage.getItem('rendr_selectedCategory') as ProductCategory) || ProductCategory.GENERAL);
  const [detectedCategory, setDetectedCategory] = useState<string>(() => localStorage.getItem('rendr_detectedCategory') || 'Apparel');
  const [selectedFraming, setSelectedFraming] = useState<FramingMode>(() => (localStorage.getItem('rendr_selectedFraming') as FramingMode) || FramingMode.AUTO);
  const [hasTextSpace, setHasTextSpace] = useState<boolean>(() => localStorage.getItem('rendr_hasTextSpace') === 'true');
  const [selectedPose, setSelectedPose] = useState<ModelPose>(() => (localStorage.getItem('rendr_selectedPose') as ModelPose) || ModelPose.AUTO);
  const [customPose, setCustomPose] = useState(() => localStorage.getItem('rendr_customPose') || '');
  
  const filteredSuggestions = useMemo(() => {
    if (!customPose || customPose.trim() === '') {
      return POSE_SUGGESTIONS;
    }
    const query = customPose.toLowerCase().trim();
    
    // Check if the input exactly matches an option or a part of it (selected from list)
    const isExactPreset = POSE_SUGGESTIONS.some(
      sug => sug.promptHint.toLowerCase() === query || 
             sug.label.toLowerCase().includes(query) ||
             sug.subLabel.toLowerCase().includes(query)
    );
    if (isExactPreset) {
      return POSE_SUGGESTIONS;
    }

    const filtered = POSE_SUGGESTIONS.filter(
      sug => sug.label.toLowerCase().includes(query) || 
             sug.subLabel.toLowerCase().includes(query)
    );
    return filtered.length > 0 ? filtered : POSE_SUGGESTIONS;
  }, [customPose]);
  
  const [fineJewelry, setFineJewelry] = useState(() => localStorage.getItem('rendr_fineJewelry') === 'true');
  const [accessoryStyling, setAccessoryStyling] = useState(() => localStorage.getItem('rendr_accessoryStyling') === 'true');
  const [hairstyle, setHairstyle] = useState(() => localStorage.getItem('rendr_hairstyle') === 'true');
  const [makeup, setMakeup] = useState(() => localStorage.getItem('rendr_makeup') === 'true');
  const [lighting, setLighting] = useState(() => localStorage.getItem('rendr_lighting') === 'true');
  const [faceDiversity, setFaceDiversity] = useState(() => localStorage.getItem('rendr_faceDiversity') === 'true');

  const [sceneMode, setSceneMode] = useState<SceneMode>(() => {
    const saved = localStorage.getItem('rendr_sceneMode');
    if (saved === 'editor') return 'still-life';
    return (saved as SceneMode) || 'still-life';
  });
  const [isEditorMode, setIsEditorMode] = useState(() => localStorage.getItem('rendr_isEditorMode') === 'true');
  const [creativityLevel, setCreativityLevel] = useState(() => 100); 
  const [isRatioResPanelOpen, setIsRatioResPanelOpen] = useState(false);
  const [isCameraFramingPanelOpen, setIsCameraFramingPanelOpen] = useState(false);
  const [sendModelPic, setSendModelPic] = useState(() => {
    const saved = localStorage.getItem('rendr_sendModelPic');
    return saved !== 'false';
  });
  const [userIdea, setUserIdea] = useState(() => localStorage.getItem('rendr_userIdea') || '');
  const [ideaRefinement, setIdeaRefinement] = useState(() => localStorage.getItem('rendr_ideaRefinement') || '');
  const [selectedVibe, setSelectedVibe] = useState(() => {
    const saved = localStorage.getItem('rendr_selectedVibe');
    const validVibes = ['Natural', 'Sport', 'Streetwear', 'Studio', 'OldMoney', 'Cinematic'];
    return (saved && validVibes.includes(saved)) ? saved : 'Natural';
  });
  const [lastExpandedVibe, setLastExpandedVibe] = useState(() => localStorage.getItem('rendr_lastExpandedVibe') || '');
  const [isVibeSelectorOpen, setIsVibeSelectorOpen] = useState(false);
  const [isPoseSelectorOpen, setIsPoseSelectorOpen] = useState(false);
  
  const [modelImage, setModelImage] = useState<string | null>(null);
  const [customModelDna, setCustomModelDna] = useState<ModelDna | null>(null);
  const [selectedLibraryModel, setSelectedLibraryModel] = useState<PredefinedModel | null>(() => {
    const savedId = localStorage.getItem('rendr_selectedLibraryModelId');
    return savedId ? PREDEFINED_MODELS.find(m => m.id === savedId) || null : null;
  });
  const [customBackgroundImage, setCustomBackgroundImage] = useState<string | null>(null);

  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [lastPrompt, setLastPrompt] = useState<string>("");
  const [compositePreviewUrl, setCompositePreviewUrl] = useState<string | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isExpandingIdea, setIsExpandingIdea] = useState(false);
  const [isAnalyzingFidelity, setIsAnalyzingFidelity] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("Processing");
  
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);

  const [aspectRatio, setAspectRatio] = useState<string>(() => localStorage.getItem('rendr_aspectRatio') || "1:1");
  const [selectedResolution, setSelectedResolution] = useState<'1K' | '2K' | '4K'>(() => (localStorage.getItem('rendr_selectedResolution') as '1K' | '2K' | '4K') || '1K');

  const [showBranding, setShowBranding] = useState(() => localStorage.getItem('rendr_showBranding') === 'true');
  const [logoColor, setLogoColor] = useState(() => localStorage.getItem('rendr_logoColor') || '#D4BE8D');
  const [logoPosition, setLogoPosition] = useState<LogoPosition>(() => (localStorage.getItem('rendr_logoPosition') as LogoPosition) || 'top-left');
  const [customLogoImage, setCustomLogoImage] = useState<string | null>(null);
  const [selectedDefaultLogo, setSelectedDefaultLogo] = useState<string | null>(() => localStorage.getItem('rendr_selectedDefaultLogo') || 'm');

  const [customModelAge, setCustomModelAge] = useState('');
  const [customModelStyle, setCustomModelStyle] = useState('Natural');
  const [activeMobileTab, setActiveMobileTab] = useState<'settings' | 'preview'>('settings');
  const [activeModelTab, setActiveModelTab] = useState<'library' | 'upload'>('library');
  const [isGeneratingPose, setIsGeneratingPose] = useState(false);

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    product: true,
    scene: true,
    concept: true,
    layout: false,
    branding: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('rendr_productSignature', productSignature);
    localStorage.setItem('rendr_selectedAngle', selectedAngle);
    localStorage.setItem('rendr_selectedCategory', selectedCategory);
    localStorage.setItem('rendr_detectedCategory', detectedCategory);
    localStorage.setItem('rendr_selectedFraming', selectedFraming);
    localStorage.setItem('rendr_hasTextSpace', String(hasTextSpace));
    localStorage.setItem('rendr_selectedPose', selectedPose);
    localStorage.setItem('rendr_customPose', customPose);
    localStorage.setItem('rendr_sceneMode', sceneMode);
    localStorage.setItem('rendr_isEditorMode', String(isEditorMode));
    localStorage.setItem('rendr_userIdea', userIdea);
    localStorage.setItem('rendr_ideaRefinement', ideaRefinement);
    localStorage.setItem('rendr_selectedVibe', selectedVibe);
    localStorage.setItem('rendr_lastExpandedVibe', lastExpandedVibe);
    localStorage.setItem('rendr_selectedLibraryModelId', selectedLibraryModel?.id || '');
    localStorage.setItem('rendr_aspectRatio', aspectRatio);
    localStorage.setItem('rendr_selectedResolution', selectedResolution);
    localStorage.setItem('rendr_showBranding', String(showBranding));
    localStorage.setItem('rendr_logoColor', logoColor);
    localStorage.setItem('rendr_logoPosition', logoPosition);
    localStorage.setItem('rendr_selectedDefaultLogo', selectedDefaultLogo || '');
    localStorage.setItem('rendr_creativityLevel', String(creativityLevel));
    localStorage.setItem('rendr_fineJewelry', String(fineJewelry));
    localStorage.setItem('rendr_accessoryStyling', String(accessoryStyling));
    localStorage.setItem('rendr_hairstyle', String(hairstyle));
    localStorage.setItem('rendr_makeup', String(makeup));
    localStorage.setItem('rendr_lighting', String(lighting));
    localStorage.setItem('rendr_faceDiversity', String(faceDiversity));
    localStorage.setItem('rendr_sendModelPic', String(sendModelPic));
  }, [
    productSignature, selectedAngle, selectedCategory, selectedFraming, 
    selectedPose, customPose, sceneMode, isEditorMode, userIdea, ideaRefinement, selectedVibe, 
    selectedLibraryModel, aspectRatio, selectedResolution, showBranding, 
    logoColor, logoPosition, selectedDefaultLogo, creativityLevel,
    fineJewelry, accessoryStyling, hairstyle, makeup, lighting, faceDiversity, sendModelPic, hasTextSpace
  ]);

  const handleResetWorkspace = () => {
    // Reset all states to default
    setProductImages([]);
    setProductSignature('');
    setSelectedAngle(CameraAngle.AUTO);
    setSelectedCategory(ProductCategory.GENERAL);
    setDetectedCategory('Apparel');
    setSelectedFraming(FramingMode.AUTO);
    setHasTextSpace(false);
    setSelectedPose(ModelPose.AUTO);
    setCustomPose("");
    setSceneMode('still-life');
    setUserIdea('');
    setIdeaRefinement('');
    setSelectedVibe('Natural');
    setLastExpandedVibe('');
    setIsVibeSelectorOpen(false);
    setIsPoseSelectorOpen(false);
    setModelImage(null);
    setCustomModelDna(null);
    setSelectedLibraryModel(null);
    setCustomBackgroundImage(null);
    setGeneratedImage(null);
    setCompositePreviewUrl(null);
    setAspectRatio("1:1");
    setSelectedResolution('1K');
    setShowBranding(false);
    setLogoColor('#D4BE8D');
    setLogoPosition('top-left');
    setSelectedDefaultLogo('m');
    setCustomLogoImage(null);
    setCustomModelAge('');
    setCustomModelStyle('Natural');
    setFineJewelry(false);
    setAccessoryStyling(false);
    setHairstyle(false);
    setMakeup(false);
    setLighting(false);
    setFaceDiversity(false);
    
    // Explicitly clear localStorage for rendr_ keys
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('rendr_')) {
        localStorage.removeItem(key);
      }
    });

    setIsResetConfirmOpen(false);
    triggerToast("🧹 Workspace cleared!");
  };

  const handleGeneratePose = async () => {
    if (isGeneratingPose) return;
    
    setIsGeneratingPose(true);
    try {
      const creativePose = await generateCreativePose(
        selectedCategory === ProductCategory.GENERAL ? (detectedCategory as any || ProductCategory.GENERAL) : selectedCategory,
        selectedVibe,
        selectedLibraryModel ? selectedLibraryModel.gender : ProductGender.UNISEX,
        userIdea,
        customPose
      );
      
      if (creativePose) {
        setCustomPose(creativePose);
        triggerToast("✨ AI generated a creative pose!");
      } else {
        triggerToast("❌ Failed to generate pose.");
      }
    } catch (error) {
      console.error("Error in handleGeneratePose:", error);
      triggerToast("❌ An error occurred.");
    } finally {
      setIsGeneratingPose(false);
    }
  };

  const [isHoveringBackgroundArea, setIsHoveringBackgroundArea] = useState(false);
  const [isDraggingOverProduct, setIsDraggingOverProduct] = useState(false);
  const [isDraggingOverBackground, setIsDraggingOverBackground] = useState(false);

  const productInputRef = useRef<HTMLInputElement>(null);
  const modelInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  
  const cameraFramingPanelRef = useRef<HTMLDivElement>(null);
  const ratioResPanelRef = useRef<HTMLDivElement>(null);
  
  const currentLogoUri = useMemo(() => {
    if (customLogoImage) return customLogoImage;
    if (selectedDefaultLogo === 'm') {
      const svg = getLogoSvg(logoColor);
      return `data:image/svg+xml;base64,${btoa(svg)}`;
    }
    return null;
  }, [selectedDefaultLogo, logoColor, customLogoImage]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const parseErrorMessage = (err: any): string => {
    const errorStr = err.message || JSON.stringify(err);
    console.error("FULL ERROR DETAILS:", err); // Log full error to console for dev
    
    if (errorStr.includes('503') || errorStr.includes('overloaded') || errorStr.includes('UNAVAILABLE')) {
      return "System overloaded (503). Please try again later.";
    }
    if (errorStr.includes('500') || errorStr.includes('INTERNAL')) {
      return "Gemini API Internal Error (500). Retrying automatically...";
    }
    if (errorStr.includes('429')) {
      return "Too many requests (429). Please wait a moment.";
    }
    if (errorStr.includes('SAFETY')) {
      return "Content blocked by safety filters. Please check description.";
    }
    if (errorStr.includes('API_KEY')) {
      return "API Key error. Please check configuration.";
    }
    // Return the actual error message for "Unknown" cases to help debug
    return `Error: ${errorStr.substring(0, 100)}...`; 
  };

  const processFile = async (file: File, type: 'product' | 'background' | 'model' | 'logo') => {
    const b64 = await blobToBase64(file);
    if (type === 'product') {
      setProductImages(prev => {
        if (prev.length < 3) {
          triggerToast("📋 Product image uploaded!");
          return [...prev, b64];
        }
        triggerToast("⚠️ Max 3 product images!");
        return prev;
      });
      setGeneratedImage(null);
    } else if (type === 'background') {
      setCustomBackgroundImage(b64);
      triggerToast(isEditorMode ? "🖼️ Source image uploaded!" : "📸 Reference background uploaded!");
    } else if (type === 'model') {
      setModelImage(b64);
      setSelectedLibraryModel(null);
      setSceneMode('model');
      setIsModelModalOpen(true);
      triggerToast("📸 Image uploaded. Please analyze DNA.");
    } else if (type === 'logo') {
      setCustomLogoImage(`data:${file.type};base64,${b64}`);
      setSelectedDefaultLogo(null);
      triggerToast("🏷️ Brand logo uploaded!");
    }
  };

  useEffect(() => {
    const handlePaste = async (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            if (isHoveringBackgroundArea) processFile(blob, 'background');
            else processFile(blob, 'product');
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isHoveringBackgroundArea]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        cameraFramingPanelRef.current && 
        !cameraFramingPanelRef.current.contains(event.target as Node)
      ) {
        setIsCameraFramingPanelOpen(false);
      }
      if (
        ratioResPanelRef.current && 
        !ratioResPanelRef.current.contains(event.target as Node)
      ) {
        setIsRatioResPanelOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDrop = (e: React.DragEvent, type: 'product' | 'background') => {
    e.preventDefault();
    if (type === 'product') setIsDraggingOverProduct(false);
    else setIsDraggingOverBackground(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) processFile(files[0], type);
  };

  const compositeImage = useCallback((
    srcImage: string, 
    targetRatio: string, 
    showBrandingActive: boolean,
    currentLogoUri: string | null,
    currentLogoPosition: LogoPosition,
    currentLogoColor: string,
    isCustomLogo: boolean,
    baseDimension: number = 1024
  ): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(srcImage);
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
         const [wRatio, hRatio] = targetRatio.split(':').map(Number);
         let canvasWidth, canvasHeight;
         const ratioValue = wRatio / hRatio;
         if (ratioValue > 1) {
             canvasWidth = baseDimension;
             canvasHeight = Math.round(baseDimension / ratioValue);
         } else {
             canvasHeight = baseDimension;
             canvasWidth = Math.round(baseDimension * ratioValue);
         }
         canvas.width = canvasWidth;
         canvas.height = canvasHeight;
         const imgRatio = img.width / img.height;
         const canvasRatio = canvas.width / canvas.height;
         let renderW, renderH, offsetX, offsetY;
         if (canvasRatio > imgRatio) {
             renderW = canvas.width;
             renderH = canvas.width / imgRatio;
             offsetX = 0;
             offsetY = (canvas.height - renderH) / 2;
         } else {
             renderH = canvas.height;
             renderW = canvas.height * imgRatio;
             offsetY = 0;
             offsetX = (canvas.width - renderW) / 2;
         }
         ctx.fillStyle = '#FFFFFF';
         ctx.fillRect(0,0, canvas.width, canvas.height);
         ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
         if (showBrandingActive && currentLogoUri) {
            const logoImg = new Image();
            logoImg.onload = () => {
                const minDim = Math.min(canvas.width, canvas.height);
                const logoWidth = minDim * 0.18; 
                const logoHeight = (logoImg.height / logoImg.width) * logoWidth;
                const padding = minDim * 0.05;
                let lx = 0; let ly = 0;
                switch(currentLogoPosition) {
                  case 'top-left': lx = padding; ly = padding; break;
                  case 'top-center': lx = (canvas.width - logoWidth) / 2; ly = padding; break;
                  case 'top-right': lx = canvas.width - logoWidth - padding; ly = padding; break;
                  case 'bottom-left': lx = padding; ly = canvas.height - logoHeight - padding; break;
                  case 'bottom-center': lx = (canvas.width - logoWidth) / 2; ly = canvas.height - logoHeight - padding; break;
                  case 'bottom-right': lx = canvas.width - logoWidth - padding; ly = canvas.height - logoHeight - padding; break;
                }
                if (isCustomLogo) {
                  const offscreen = document.createElement('canvas');
                  offscreen.width = logoWidth; offscreen.height = logoHeight;
                  const octx = offscreen.getContext('2d');
                  if (octx) {
                    octx.drawImage(logoImg, 0, 0, logoWidth, logoHeight);
                    octx.globalCompositeOperation = 'source-in';
                    octx.fillStyle = currentLogoColor;
                    octx.fillRect(0, 0, logoWidth, logoHeight);
                    ctx.drawImage(offscreen, lx, ly);
                  } else ctx.drawImage(logoImg, lx, ly, logoWidth, logoHeight);
                } else ctx.drawImage(logoImg, lx, ly, logoWidth, logoHeight);
                resolve(canvas.toDataURL('image/png', 0.9));
            };
            logoImg.src = currentLogoUri;
         } else resolve(canvas.toDataURL('image/png', 0.9));
      };
      img.src = srcImage;
    });
  }, []);

  useEffect(() => {
    if (generatedImage) {
        const dim = selectedResolution === '4K' ? 4096 : selectedResolution === '2K' ? 2048 : 1024;
        compositeImage(generatedImage, aspectRatio, showBranding, currentLogoUri, logoPosition, logoColor, !!customLogoImage, dim)
          .then(url => setCompositePreviewUrl(url));
    } else setCompositePreviewUrl(null);
  }, [generatedImage, aspectRatio, showBranding, currentLogoUri, logoPosition, logoColor, customLogoImage, compositeImage, selectedResolution]);

  // Smart Sync for Pose, Framing, and Camera Angle
  useEffect(() => {
    // If Pose is REFERENCE, Angle and Framing should ideally be AUTO to match the reference
    if (selectedPose === ModelPose.REFERENCE) {
      if (selectedAngle !== CameraAngle.AUTO) {
        setSelectedAngle(CameraAngle.AUTO);
        triggerToast("🔄 Camera Angle set to Auto to match Reference.");
      }
      if (selectedFraming !== FramingMode.AUTO) {
        setSelectedFraming(FramingMode.AUTO);
        triggerToast("🔄 Framing set to Auto to match Reference.");
      }
    }

    // If Portrait or Close Up is selected, some poses are less ideal
    if (selectedFraming === FramingMode.PORTRAIT || selectedFraming === FramingMode.CLOSE_UP) {
      if (selectedPose === ModelPose.MOVING || selectedPose === ModelPose.ZERO_GRAVITY) {
        setSelectedPose(ModelPose.AUTO);
        triggerToast("🔄 Pose adjusted for tight framing.");
      }
    }

    // If Top Down is selected, most poses don't make sense
    if (selectedAngle === CameraAngle.TOP_DOWN) {
      if (selectedPose !== ModelPose.AUTO && selectedPose !== ModelPose.REFERENCE) {
        setSelectedPose(ModelPose.AUTO);
        triggerToast("🔄 Pose set to Auto for Top-Down view.");
      }
    }
  }, [selectedPose, selectedFraming, selectedAngle]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'product' | 'background' | 'model' | 'logo') => {
    const files = event.target.files;
    if (files && files[0]) processFile(files[0], type);
    event.target.value = '';
  };

  const removeProductImage = (index: number) => {
    setProductImages(prev => prev.filter((_, i) => i !== index));
    setGeneratedImage(null);
  };

  const handleExpandIdea = async () => {
    if (isExpandingIdea) return;
    setIsExpandingIdea(true);
    triggerToast(`✨ AI Art Director designing [${selectedVibe}] concept...`);
    try {
      let expanded = "";
      if (isEditorMode) {
        if (!customBackgroundImage) {
          triggerToast("⚠️ Please upload source image first.");
          return;
        }
        let modelHint = undefined;
        if (sceneMode === 'model' && selectedLibraryModel) {
          modelHint = selectedLibraryModel.promptHint;
        }
        const effectiveCategory = selectedCategory === ProductCategory.GENERAL ? detectedCategory : selectedCategory;
        expanded = await generateEditorConcept(userIdea, customBackgroundImage, effectiveCategory as any, productImages, modelHint, sceneMode, selectedVibe, ideaRefinement, selectedFraming, selectedAngle, hasTextSpace, aspectRatio);
      } else {
        const effectiveCategory = selectedCategory === ProductCategory.GENERAL ? detectedCategory : selectedCategory;
        expanded = await generateAdvancedConcept(userIdea, effectiveCategory as any, productImages, customBackgroundImage, selectedVibe, sceneMode, ideaRefinement, selectedFraming, selectedAngle, hasTextSpace, aspectRatio);
      }
      
      if (expanded && expanded.length > 20) {
        setUserIdea(expanded);
        setIdeaRefinement('');
        setLastExpandedVibe(selectedVibe);
        triggerToast("✅ Idea expanded into a detailed professional brief!");
      } else {
        throw new Error("Invalid expansion");
      }
    } catch (err) { triggerToast("❌ System busy. Please try again."); }
    finally { setIsExpandingIdea(false); }
  };

  const handleAnalyzeFidelity = async () => {
    if (isAnalyzingFidelity || productImages.length === 0) {
      if (productImages.length === 0) triggerToast("⚠️ Please upload product images first.");
      return;
    }
    setIsAnalyzingFidelity(true);
    triggerToast("🔍 Analyzing proportions & design...");
    try {
      const analysis = await analyzeProductFidelity(productImages, selectedCategory, productSignature);
      if (selectedCategory === ProductCategory.GENERAL) {
        setDetectedCategory(analysis.detectedCategory);
      }
      // Clean up old analysis if exists
      const cleanSignature = productSignature.split('[PRODUCT FIDELITY ANALYSIS]')[0].trim();
      setProductSignature(`${cleanSignature}\n\n[PRODUCT FIDELITY ANALYSIS]:\n- BRAND/MODEL: ${analysis.brandModel}\n- CATEGORY: ${analysis.detectedCategory}\n- DESIGN: ${analysis.designAnalysis}\n- PROPORTIONS: ${analysis.measurementProportions}`);
      triggerToast(`✅ Analysis complete. Category: ${analysis.detectedCategory}`);
    } catch (err) { triggerToast("❌ Analysis error. Please try again."); }
    finally { setIsAnalyzingFidelity(false); }
  };

  const hasFidelityAnalysis = useMemo(() => productSignature.includes('[PRODUCT FIDELITY ANALYSIS]'), [productSignature]);

  const filteredModels = PREDEFINED_MODELS;

  useEffect(() => {
    if (selectedCategory === ProductCategory.SENSITIVE_APPAREL) {
      setSendModelPic(false); // Safeguard: auto-turn off 'send pic model' as safe baseline
      triggerToast("🔒 Sensitive items: 'send pic model' set to OFF by default. Switch on if needed.");
    }
  }, [selectedCategory]);

  const handleGenerate = async () => {
    if (productImages.length === 0 && !isEditorMode) {
      triggerToast("⚠️ Upload at least 1 product image!");
      return;
    }
    setIsGenerating(true);
    setActiveMobileTab('preview');
    let currentDna: ModelDna | undefined;
    if (sceneMode === 'model') {
      if (selectedLibraryModel) currentDna = selectedLibraryModel.dna;
      else if (modelImage) currentDna = customModelDna || undefined;
    }
    
    let finalIdea = `Style: ${selectedVibe}. ${userIdea}`;
    
    try {
      if (isEditorMode) {
        if (!customBackgroundImage) {
          triggerToast("⚠️ Please upload a source image for Editor mode!");
          setIsGenerating(false);
          return;
        }
        setLoadingStatus("Analyzing Source...");
        let modelHint = undefined;
        if (sceneMode === 'model' && selectedLibraryModel) {
          modelHint = selectedLibraryModel.promptHint;
        }
        const effectiveCategory = selectedCategory === ProductCategory.GENERAL ? detectedCategory : selectedCategory;
        finalIdea = await generateEditorConcept(userIdea, customBackgroundImage, effectiveCategory as any, productImages, modelHint, sceneMode, selectedVibe, ideaRefinement, selectedFraming, selectedAngle, hasTextSpace, aspectRatio);
      } else if (selectedLibraryModel && sceneMode === 'model') {
        finalIdea = `${finalIdea}. Model DNA Preservation: ${selectedLibraryModel.promptHint}`;
        if (selectedLibraryModel.specialStyle) finalIdea = `${finalIdea}. MANDATORY CHARACTER STYLE: ${selectedLibraryModel.specialStyle}`;
      }

      // Step: Prompt Optimization & Conflict Resolution
      const isBriefAlreadyDetailed = userIdea.trim().length > 250;
      if (!isBriefAlreadyDetailed && !isEditorMode) {
        setLoadingStatus("Optimizing Prompt...");
        const effectiveCategory = selectedCategory === ProductCategory.GENERAL ? detectedCategory : selectedCategory;
        finalIdea = await optimizePrompt(finalIdea, effectiveCategory as any, sceneMode, selectedVibe);
      }

      let modelData = null;
      let modelProfileData = null;
      if (sceneMode === 'model') {
        const shouldSendModel = sendModelPic;
        if (shouldSendModel) {
          if (selectedLibraryModel) {
            const response = await fetch(selectedLibraryModel.thumbnail);
            const blob = await response.blob();
            modelData = await blobToBase64(blob);

            if (selectedLibraryModel.profileImage) {
              try {
                const pResponse = await fetch(selectedLibraryModel.profileImage);
                const pBlob = await pResponse.blob();
                modelProfileData = await blobToBase64(pBlob);
              } catch (profileErr) {
                console.warn("Failed to fetch model profile image", profileErr);
              }
            }
          } else if (modelImage) modelData = modelImage;
        }
      }
      const result = await generateProductImage(
        productImages, modelData, selectedAngle, finalIdea, aspectRatio, customBackgroundImage, 
        selectedCategory === ProductCategory.GENERAL ? detectedCategory as any : selectedCategory, 
        selectedFraming,
        (status) => setLoadingStatus(status), selectedResolution, undefined, sceneMode,
        selectedLibraryModel ? selectedLibraryModel.gender : ProductGender.UNISEX,
        creativityLevel, selectedPose, currentDna, undefined, 
        productSignature,
        false,
        selectedVibe,
        Math.floor(Math.random() * 1000000),
        {
          fineJewelry,
          accessoryStyling,
          hairstyle,
          makeup,
          lighting,
          faceDiversity
        },
        isEditorMode ? customBackgroundImage : null,
        customPose,
        undefined,
        modelProfileData,
        hasTextSpace
      );
      setGeneratedImage(result.image);
      setLastPrompt(result.prompt);
      triggerToast(`✨ Studio composition complete!`);
    } catch (err: any) {
      if (err.message?.includes("Requested entity was not found.")) {
        setApiKeyReady(false);
        if (window.aistudio) window.aistudio.openSelectKey();
      }
      triggerToast(`❌ ${parseErrorMessage(err)}`);
    } finally {
      setIsGenerating(false);
      setLoadingStatus("Processing");
    }
  };

  const handleSendToEditor = () => {
    if (!generatedImage) return;
    // Strip data URL prefix if present to maintain consistency with customBackgroundImage state
    const base64Part = generatedImage.includes(',') ? generatedImage.split(',')[1] : generatedImage;
    setCustomBackgroundImage(base64Part);
    setIsEditorMode(true);
    setActiveMobileTab('settings');
    triggerToast("📸 Image moved to Editor mode!");
  };

  const handleDownloadDraft = () => {
    if (!compositePreviewUrl && !generatedImage) return;
    const link = document.createElement('a');
    link.download = `rendr-lab-result-${Date.now()}.png`;
    link.href = compositePreviewUrl || generatedImage!;
    link.click();
    triggerToast("📂 Result downloaded!");
  };

  const handleUpscaleTo4K = async () => {
    if (!generatedImage || productImages.length === 0) return;
    setIsGenerating(true);
    try {
      setLoadingStatus("Refining 4K Master...");
      let currentDna: ModelDna | undefined;
      if (sceneMode === 'model') {
        if (selectedLibraryModel) currentDna = selectedLibraryModel.dna;
        else if (modelImage) currentDna = customModelDna || undefined;
      }
      let modelData = null;
      let modelProfileData = null;
      if (sceneMode === 'model') {
        const shouldSendModel = sendModelPic;
        if (shouldSendModel) {
          if (selectedLibraryModel) {
            const response = await fetch(selectedLibraryModel.thumbnail);
            const blob = await response.blob();
            modelData = await blobToBase64(blob);

            if (selectedLibraryModel.profileImage) {
              try {
                const pResponse = await fetch(selectedLibraryModel.profileImage);
                const pBlob = await pResponse.blob();
                modelProfileData = await blobToBase64(pBlob);
              } catch (profileErr) {
                console.warn("Failed to fetch model profile image for upscale", profileErr);
              }
            }
          } else if (modelImage) modelData = modelImage;
        }
      }
      const effectiveCategory = selectedCategory === ProductCategory.GENERAL ? detectedCategory : selectedCategory;
      const result = await generateProductImage(
        productImages, modelData, selectedAngle, userIdea, aspectRatio, customBackgroundImage, effectiveCategory as any, selectedFraming,
        (status) => setLoadingStatus(status), '4K', lastPrompt, sceneMode,
        selectedLibraryModel ? selectedLibraryModel.gender : ProductGender.UNISEX,
        creativityLevel, selectedPose, currentDna, generatedImage, 
        productSignature,
        false,
        selectedVibe,
        undefined,
        {
          fineJewelry,
          accessoryStyling,
          hairstyle,
          makeup,
          lighting,
          faceDiversity
        },
        null,
        customPose,
        undefined,
        modelProfileData,
        hasTextSpace
      );
      const highResComposite = await compositeImage(result.image, aspectRatio, showBranding, currentLogoUri, logoPosition, logoColor, !!customLogoImage, 4096);
      const link = document.createElement('a');
      link.download = `rendr-lab-master-4k-${Date.now()}.png`;
      link.href = highResComposite;
      link.click();
      triggerToast("🚀 4K Master upscale success!");
    } catch (err: any) { triggerToast(`❌ Upscale error: ${parseErrorMessage(err)}`); }
    finally { setIsGenerating(false); setLoadingStatus("Processing"); }
  };

  const handleModeSwitch = useCallback((mode: SceneMode) => {
    setSceneMode(mode);
    
    // Auto reset framing mode based on scene mode compatibility
    if (mode === 'still-life') {
      if (![FramingMode.AUTO, FramingMode.CLOSE_UP, FramingMode.PRODUCT_FOCUS].includes(selectedFraming)) {
        setSelectedFraming(FramingMode.AUTO);
      }
    } else if (mode === 'ghost') {
      if (selectedFraming === FramingMode.PORTRAIT) {
        setSelectedFraming(FramingMode.AUTO);
      }
    }

    // Clear and set default idea based on mode
    let defaultIdea = "";
    if (mode === 'still-life') {
      defaultIdea = "A high-end product photography scene with elegant lighting and a minimalist background.";
    } else if (mode === 'ghost') {
      defaultIdea = "A professional ghost mannequin shot showing the 3D structure and interior lining of the garment.";
    } else if (mode === 'model') {
      defaultIdea = "A high-fashion editorial scene with a professional model in a stylish environment.";
    }
    setUserIdea(defaultIdea);

    if (mode === 'model') {
      setIsModelModalOpen(true);
    } else { 
      setSelectedLibraryModel(null); 
      setModelImage(null); 
    }
  }, [selectedCategory, selectedFraming]);

  const currentSceneModeDisplay = useMemo(() => {
    if (sceneMode === 'model') return selectedLibraryModel ? `${selectedLibraryModel.name}` : "CUSTOM MODEL";
    if (sceneMode === 'ghost') return "GHOST MANNEQUIN";
    return "STILL LIFE";
  }, [sceneMode, selectedLibraryModel]);

  if (!apiKeyReady) return <ApiKeySelector onKeySelected={() => setApiKeyReady(true)} />;

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      <Toast message={toastMessage} visible={showToast} />
      
      {/* Mobile Tab Switcher */}
      <div className="lg:hidden sticky top-0 flex border-b border-slate-200 bg-white/80 backdrop-blur-xl z-30">
        <button 
          onClick={() => setActiveMobileTab('settings')}
          className={`flex-1 py-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative ${activeMobileTab === 'settings' ? 'text-brand-600' : 'text-slate-400'}`}
        >
          Configuration
          {activeMobileTab === 'settings' && <div className="absolute bottom-0 inset-x-0 h-1 bg-brand-600 rounded-t-full" />}
        </button>
        <button 
          onClick={() => setActiveMobileTab('preview')}
          className={`flex-1 py-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative ${activeMobileTab === 'preview' ? 'text-brand-600' : 'text-slate-400'}`}
        >
          Results
          {activeMobileTab === 'preview' && <div className="absolute bottom-0 inset-x-0 h-1 bg-brand-600 rounded-t-full" />}
        </button>
      </div>

      {viewingImage && (
        <div className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-4 lg:p-12 animate-in fade-in duration-500" onClick={() => setViewingImage(null)}>
          <img src={viewingImage} alt="Preview" className="max-w-full max-h-full object-contain rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/10" />
          <button className="absolute top-8 right-8 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all backdrop-blur-md">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      )}

      {isModelModalOpen && (
        <div className="fixed inset-0 z-[300] bg-slate-900/40 backdrop-blur-sm flex items-end lg:items-center justify-center p-0 lg:p-4 animate-in fade-in duration-200" onClick={() => setIsModelModalOpen(false)}>
          <div className="bg-white rounded-t-[2rem] lg:rounded-[2.5rem] w-full max-w-4xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom lg:zoom-in-95 duration-300 flex flex-col h-[90vh] lg:h-auto lg:max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header with Tabs */}
            <div className="bg-white border-b border-slate-100">
              <div className="p-6 lg:p-8 pb-0 flex items-center justify-between">
                <div>
                  <h2 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
                    Select Model
                  </h2>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">
                    {activeModelTab === 'library' ? 'Choose from our library' : 'Analyze your own model DNA'}
                  </p>
                </div>
                <button onClick={() => setIsModelModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="px-6 lg:px-8 mt-6 flex gap-8">
                <button 
                  onClick={() => setActiveModelTab('library')}
                  className={`pb-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative flex items-center gap-2 ${activeModelTab === 'library' ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  Model Library
                  {activeModelTab === 'library' && <div className="absolute bottom-0 inset-x-0 h-1 bg-brand-600 rounded-full" />}
                </button>
                <button 
                  onClick={() => setActiveModelTab('upload')}
                  className={`pb-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative flex items-center gap-2 ${activeModelTab === 'upload' ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Upload Custom
                  {activeModelTab === 'upload' && <div className="absolute bottom-0 inset-x-0 h-1 bg-brand-600 rounded-full" />}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col">
              {/* Library Tab Content */}
              {activeModelTab === 'library' && (
                <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in slide-in-from-left-4 duration-300">
                  <div className="p-4 lg:p-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-6 overflow-y-auto custom-scrollbar">
                    {filteredModels.length === 0 ? (
                      <div className="col-span-full py-20 text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <User className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No library models available</p>
                        <p className="text-slate-300 text-[9px] mt-1">Try uploading a custom model instead</p>
                      </div>
                    ) : (
                      filteredModels.map(model => (
                        <button 
                          key={model.id} 
                          onClick={() => { 
                            setSelectedLibraryModel(model); 
                            setSceneMode('model'); 
                            setModelImage(null); 
                            setIsModelModalOpen(false); 
                            triggerToast(`🎭 Selected: ${model.name}`); 
                          }} 
                          className={`group relative w-full rounded-2xl lg:rounded-3xl overflow-hidden border-4 transition-all hover:scale-[1.03] ${selectedLibraryModel?.id === model.id ? 'border-brand-600 shadow-xl' : 'border-transparent shadow-md'}`}
                        >
                          <div className="pb-[133.33%]" />
                          <img 
                            src={model.thumbnail} 
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                            alt={model.name} 
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                          <div className="absolute bottom-0 inset-x-0 p-3 lg:p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                            <span className="block text-white font-black text-[10px] lg:text-[11px] uppercase tracking-widest leading-tight">{model.name}</span>
                            <span className="block text-white/70 text-[9px] lg:text-[10px] font-bold uppercase tracking-tighter mt-0.5">
                              {model.dna.height}cm • {model.dna.weight}kg
                            </span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Upload Tab Content */}
              {activeModelTab === 'upload' && (
                <div className="flex-1 bg-slate-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="p-6 lg:p-8 space-y-6 overflow-y-auto custom-scrollbar">
                    {selectedCategory === ProductCategory.SENSITIVE_APPAREL ? (
                      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                        {/* Column 1: Image Upload (Compact) */}
                        <div className="lg:w-1/3 space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">1. Portrait Photo</label>
                          <div onClick={() => modelInputRef.current?.click()} className={`aspect-[4/3] w-full rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-2 hover:border-brand-400 group relative overflow-hidden ${modelImage ? 'border-brand-400 bg-white' : 'border-slate-300 bg-slate-100'}`}>
                            {modelImage ? (
                              <img src={`data:image/jpeg;base64,${modelImage}`} className="absolute inset-0 w-full h-full object-cover" />
                            ) : (
                              <>
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform"><svg className="w-5 h-5 text-slate-400 group-hover:text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Upload</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Column 2: Inputs & Analysis */}
                        <div className="flex-1 space-y-6">
                          <div className="space-y-4">
                             <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">2. Age</label>
                                <select 
                                  value={customModelAge}
                                  onChange={(e) => setCustomModelAge(e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:border-brand-400 transition-all"
                                >
                                  <option value="18-19">18 - 19</option>
                                  <option value="20-21">20 - 21</option>
                                  <option value="22-23">22 - 23</option>
                                  <option value="24-25">24 - 25</option>
                                  <option value="26-27">26 - 27</option>
                                </select>
                             </div>
                          </div>

                          <button 
                            disabled={!modelImage || loadingStatus.includes("DNA")}
                            onClick={() => {
                                if (modelImage) {
                                   setLoadingStatus("Analyzing DNA..."); // Set loading status
                                   triggerToast("🧬 Analyzing DNA & Celebrity Blend...");
                                   // Force "Natural" style for Lingerie
                                   analyzeModelDna(modelImage, customModelAge, "Natural").then(dna => {
                                     setCustomModelDna(dna);
                                     setSceneMode('model');
                                     setSelectedLibraryModel(null);
                                     setIsModelModalOpen(false);
                                     setLoadingStatus("Processing"); // Reset loading status
                                     triggerToast("✅ DNA extraction successful!");
                                   }).catch(() => {
                                     setLoadingStatus("Processing"); // Reset loading status
                                     triggerToast("❌ DNA analysis error");
                                   });
                                }
                            }}
                            className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2 ${modelImage && !loadingStatus.includes("DNA") ? 'bg-brand-600 text-white hover:bg-brand-700 hover:shadow-brand-500/30' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                          >
                            {loadingStatus.includes("DNA") ? (
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <Zap className="w-4 h-4" />
                            )}
                            Analyze DNA
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                        {/* Column 1: Image Upload (Compact) */}
                        <div className="lg:w-1/3 space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">1. Portrait Photo</label>
                          <div onClick={() => modelInputRef.current?.click()} className={`aspect-[4/3] w-full rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-2 hover:border-brand-400 group relative overflow-hidden ${modelImage ? 'border-brand-400 bg-white' : 'border-slate-300 bg-slate-100'}`}>
                            {modelImage ? (
                              <img src={`data:image/jpeg;base64,${modelImage}`} className="absolute inset-0 w-full h-full object-cover" />
                            ) : (
                              <>
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform"><svg className="w-5 h-5 text-slate-400 group-hover:text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Upload</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Column 2: Inputs & Analysis */}
                        <div className="flex-1 space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">2. Age</label>
                              <select 
                                value={customModelAge}
                                onChange={(e) => setCustomModelAge(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:border-brand-400 transition-all"
                              >
                                <option value="18-19">18 - 19</option>
                                <option value="20-21">20 - 21</option>
                                <option value="22-23">22 - 23</option>
                                <option value="24-25">24 - 25</option>
                                <option value="26-27">26 - 27</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">3. Style</label>
                              <select 
                                value={customModelStyle}
                                onChange={(e) => setCustomModelStyle(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:border-brand-400 transition-all"
                              >
                                <option value="Natural">Natural</option>
                                <option value="Editorial">Editorial</option>
                                <option value="Commercial">Commercial</option>
                                <option value="Street">Street</option>
                              </select>
                            </div>
                          </div>

                          <button 
                            disabled={!modelImage || loadingStatus.includes("DNA")}
                            onClick={() => {
                                if (modelImage) {
                                   setLoadingStatus("Analyzing DNA..."); // Set loading status
                                   triggerToast("🧬 Analyzing DNA & Celebrity Blend...");
                                   analyzeModelDna(modelImage, customModelAge, customModelStyle).then(dna => {
                                     setCustomModelDna(dna);
                                     setSceneMode('model');
                                     setSelectedLibraryModel(null);
                                     setIsModelModalOpen(false);
                                     setLoadingStatus("Processing"); // Reset loading status
                                     triggerToast("✅ DNA extraction successful!");
                                   }).catch(() => {
                                     setLoadingStatus("Processing"); // Reset loading status
                                     triggerToast("❌ DNA analysis error");
                                   });
                                }
                            }}
                            className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2 ${modelImage && !loadingStatus.includes("DNA") ? 'bg-brand-600 text-white hover:bg-brand-700 hover:shadow-brand-500/30' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                          >
                            {loadingStatus.includes("DNA") ? (
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <Zap className="w-4 h-4" />
                            )}
                            Analyze DNA
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {customModelDna && (
                <div className="px-6 lg:px-8 pb-6">
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/>
                      <span className="text-[11px] font-black text-emerald-600 uppercase">DNA Ready</span>
                    </div>
                    <p className="text-[11px] text-emerald-700 font-medium line-clamp-2">{customModelDna.celebrityBlend}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-[400] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setIsResetConfirmOpen(false)}>
          <div className="bg-white rounded-[2rem] max-w-sm w-full p-8 shadow-2xl animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-xl font-black text-slate-900 text-center mb-2 tracking-tight">Clear Workspace?</h3>
            <p className="text-slate-500 text-center text-sm mb-8 leading-relaxed">All images and settings will be permanently deleted.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsResetConfirmOpen(false)}
                className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleResetWorkspace}
                className="flex-1 py-3 rounded-xl font-black bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/20 transition-all text-sm"
              >
                Confirm Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {isPromptModalOpen && (
        <div className="fixed inset-0 z-[400] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setIsPromptModalOpen(false)}>
          <div className="bg-white rounded-[2rem] max-w-2xl w-full p-8 shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Generation Prompt</h3>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">The exact instructions used by AI</p>
                </div>
              </div>
              <button onClick={() => setIsPromptModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50 rounded-3xl p-6 border border-slate-100">
              <p className="text-slate-700 text-sm font-medium leading-relaxed whitespace-pre-wrap">
                {lastPrompt || "No prompt available."}
              </p>
            </div>

            <div className="mt-8 flex gap-3">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(lastPrompt);
                  triggerToast("📋 Prompt copied to clipboard!");
                }}
                className="flex-1 py-4 rounded-2xl font-black bg-brand-600 text-white hover:bg-brand-700 shadow-lg shadow-brand-500/20 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Copy Prompt
              </button>
              <button 
                onClick={() => setIsPromptModalOpen(false)}
                className="px-8 py-4 rounded-2xl font-black bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all text-xs uppercase tracking-widest"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <aside className={`w-full lg:w-[420px] flex-shrink-0 border-b lg:border-b-0 lg:border-r border-slate-200 bg-white flex flex-col shadow-[20px_0_40px_rgba(0,0,0,0.02)] z-10 overflow-hidden flex-1 lg:flex-none lg:h-full relative ${activeMobileTab === 'settings' ? 'flex' : 'hidden lg:flex'}`}>
        <div className="p-6 lg:p-8 pb-4 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-950 rounded-2xl flex items-center justify-center shadow-2xl shadow-slate-200 rotate-3 hover:rotate-0 transition-transform duration-500">
                <span className="text-white font-black text-xl font-display">R</span>
              </div>
              <div>
                <h1 className="font-black text-slate-950 tracking-tight text-xl font-display leading-none">RENDR LAB</h1>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">AI Concept Studio</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsResetConfirmOpen(true)}
                className="p-2.5 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-rose-500 group border border-transparent hover:border-rose-100"
                title="Reset Workspace"
              >
                <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-all duration-700" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8 space-y-10 lg:space-y-12">
            <section className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-brand-500 rounded-full shadow-[0_0_8px_rgba(var(--brand-500),0.5)]" />
                  <label className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Product & Scale</label>
                </div>
                {productImages.length > 0 && (
                  <button onClick={() => setProductImages([])} className="text-[12px] text-rose-500 font-black uppercase tracking-widest hover:underline flex items-center gap-1">
                    <Trash2 className="w-3 h-3" />
                    Clear All
                  </button>
                )}
              </div>

              <div className="relative group">
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value as ProductCategory)} className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-5 py-4 text-xs font-black text-slate-900 outline-none focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-50 transition-all appearance-none cursor-pointer">
                  <option value={ProductCategory.GENERAL}>General Product (Auto-Detect)</option>
                  <option value={ProductCategory.TOPS}>Tops (T-shirt, Shirt, Blouse)</option>
                  <option value={ProductCategory.BOTTOMS}>Bottoms (Pants, Skirt, Shorts)</option>
                  <option value={ProductCategory.DRESSES}>Dresses</option>
                  <option value={ProductCategory.OUTERWEAR}>Outerwear (Jacket, Coat)</option>
                  <option value={ProductCategory.SHOES}>Shoes</option>
                  <option value={ProductCategory.SOCKS}>Socks</option>
                  <option value={ProductCategory.ACCESSORIES}>Accessories (Watch, Glasses, Jewelry)</option>
                  <option value={ProductCategory.BAGS}>Bags</option>
                  <option value={ProductCategory.SENSITIVE_APPAREL}>Lingerie, Sleepwear, Bikini</option>
                  <option value={ProductCategory.DIGITAL_MOCKUP}>{ProductCategory.DIGITAL_MOCKUP}</option>
                  <option value={ProductCategory.PRINT_MOCKUP}>{ProductCategory.PRINT_MOCKUP}</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-brand-500 transition-colors">
                  <ChevronDown className="w-4 h-4" strokeWidth={3} />
                </div>
              </div>

              <div className={`grid grid-cols-3 gap-4 p-2 rounded-3xl bg-slate-50/50 border border-slate-100 transition-all ${isDraggingOverProduct ? 'ring-4 ring-brand-100 border-brand-200 bg-white' : ''}`} onDragOver={(e) => { e.preventDefault(); setIsDraggingOverProduct(true); }} onDragLeave={() => setIsDraggingOverProduct(false)} onDrop={(e) => handleDrop(e, 'product')}>
                {[0, 1, 2].map((idx) => (
                  <div key={idx} onClick={() => !productImages[idx] && productInputRef.current?.click()} className={`group relative aspect-square rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden ${productImages[idx] ? 'border-brand-200 bg-white shadow-sm' : 'border-slate-200 bg-white/50 hover:border-brand-400 hover:bg-white'}`}>
                    {productImages[idx] ? (
                      <>
                        <img src={`data:image/jpeg;base64,${productImages[idx]}`} className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                          <button onClick={(e) => { e.stopPropagation(); removeProductImage(idx); }} className="bg-brand-50 p-2.5 rounded-full text-rose-600 shadow-xl border border-brand-100 hover:bg-rose-50 transition-all">
                            <X className="w-4 h-4" strokeWidth={3} />
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-brand-50 transition-colors">
                          <Plus className="w-4 h-4 text-slate-400 group-hover:text-brand-500" strokeWidth={3} />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Image {idx + 1}</span>
                      </div>
                    )}
                  </div>
                ))}
                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'product')} ref={productInputRef} className="hidden" />
                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'model')} ref={modelInputRef} className="hidden" />
              </div>

              {selectedCategory !== ProductCategory.DIGITAL_MOCKUP && selectedCategory !== ProductCategory.PRINT_MOCKUP && (
                <>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <Info className="w-3 h-3 text-slate-400" />
                        <span className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Product Description</span>
                      </div>
                      <button 
                        onClick={handleAnalyzeFidelity}
                        disabled={isAnalyzingFidelity}
                        className="text-[12px] font-black text-brand-600 uppercase tracking-widest hover:text-brand-700 disabled:opacity-50 flex items-center gap-1.5 transition-colors"
                      >
                        {isAnalyzingFidelity ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <Zap className="w-3 h-3" />
                        )}
                        {isAnalyzingFidelity ? 'Analyzing...' : 'Analyze Scale'}
                      </button>
                    </div>
                    <textarea 
                      value={productSignature}
                      onChange={(e) => setProductSignature(e.target.value)}
                      placeholder="Ex: Yellow M logo, cream sole, round laces, suede..."
                      className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-5 py-4 text-[14px] font-medium placeholder:text-slate-300 outline-none focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-50 transition-all h-28 resize-none shadow-inner"
                    />
                    {/* Scale Locked removed based on user request */}
                  </div>
                </>
              )}
            </section>

            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-brand-500 rounded-full shadow-[0_0_8px_rgba(var(--brand-500),0.5)]" />
                  <label className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Scene Mode</label>
                </div>
                {sceneMode === 'model' && (
                  <button 
                    type="button"
                    onClick={() => setSendModelPic(!sendModelPic)} 
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all text-[10px] font-black uppercase tracking-wider ${sendModelPic ? 'bg-brand-50 border-brand-200 text-brand-600' : 'bg-transparent border-slate-150 text-slate-400 hover:border-slate-300'}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${sendModelPic ? 'bg-brand-500 animate-pulse' : 'bg-slate-300'}`} />
                    send pic model
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-3 p-1 bg-slate-50/70 border border-slate-100/80 rounded-[1.25rem] gap-1">
                {(['still-life', 'ghost', 'model'] as SceneMode[]).map(mode => (
                  <button 
                    key={mode} 
                    onClick={() => handleModeSwitch(mode)} 
                    className={`flex flex-col items-center py-2.5 rounded-xl transition-all gap-1.5 duration-200 ${
                      sceneMode === mode 
                        ? 'bg-white text-brand-600 shadow-sm ring-1 ring-slate-100 font-extrabold scale-[1.01]' 
                        : 'text-slate-400 hover:text-slate-700 hover:bg-white/40'
                    }`}
                  >
                    {mode === 'still-life' ? <Box className="w-3.5 h-3.5" /> : mode === 'ghost' ? <Scissors className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                      {mode === 'still-life' ? 'Still Life' : mode === 'ghost' ? 'Ghost' : 'Model'}
                    </span>
                  </button>
                ))}
              </div>

              {(sceneMode === 'model' && (selectedLibraryModel || modelImage)) && (
                <div className="space-y-4">
                  <div className="p-5 bg-brand-50/50 border border-brand-100 rounded-[2rem] animate-in fade-in slide-in-from-top-2 duration-500">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-xl border-2 border-white overflow-hidden ring-1 ring-brand-100">
                          {selectedLibraryModel ? <img src={selectedLibraryModel.thumbnail} className="w-full h-full object-cover" /> : <img src={`data:image/jpeg;base64,${modelImage}`} className="w-full h-full object-cover" />}
                        </div>
                        <div>
                          <span className="block text-[11px] font-black text-brand-600 uppercase tracking-widest leading-none mb-1.5">{selectedLibraryModel ? selectedLibraryModel.name : 'Custom Model'}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
                            <span className="text-[11px] font-black text-brand-400 uppercase tracking-tighter">
                              {(selectedLibraryModel?.dna || customModelDna)?.height}cm • {(selectedLibraryModel?.dna || customModelDna)?.weight}kg • {(selectedLibraryModel?.dna || customModelDna)?.measurements.bust}-{(selectedLibraryModel?.dna || customModelDna)?.measurements.waist}-{(selectedLibraryModel?.dna || customModelDna)?.measurements.hip}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => setIsModelModalOpen(true)} className="p-2.5 bg-brand-50 border border-brand-200 rounded-xl text-brand-600 hover:bg-brand-600 hover:text-white transition-all shadow-sm">
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Compact Model Options moved below the model card */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'fineJewelry', label: 'Jewelry', icon: <Sparkle className="w-4 h-4" />, state: fineJewelry, setter: setFineJewelry },
                      { id: 'accessoryStyling', label: 'Accs', icon: <Briefcase className="w-4 h-4" />, state: accessoryStyling, setter: setAccessoryStyling },
                      { id: 'hairstyle', label: 'Hair', icon: <Scissors className="w-4 h-4" />, state: hairstyle, setter: setHairstyle },
                      { id: 'makeup', label: 'Makeup', icon: <Sparkles className="w-4 h-4" />, state: makeup, setter: setMakeup },
                      { id: 'lighting', label: 'Light', icon: <Zap className="w-4 h-4" />, state: lighting, setter: setLighting },
                      { id: 'faceDiversity', label: 'Diversity', icon: <User className="w-4 h-4" />, state: faceDiversity, setter: setFaceDiversity }
                    ].map(opt => (
                      <button 
                        key={opt.id}
                        onClick={() => opt.setter(!opt.state)}
                        className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border transition-all ${opt.state ? 'bg-brand-50 border-brand-200 shadow-sm ring-1 ring-brand-100' : 'bg-white border-slate-100 opacity-60 hover:opacity-100 hover:border-slate-200'}`}
                      >
                        <div className={`${opt.state ? 'text-brand-600' : 'text-slate-400'}`}>{opt.icon}</div>
                        <span className={`text-[9px] font-black uppercase tracking-tighter text-center leading-tight ${opt.state ? 'text-brand-600' : 'text-slate-500'}`}>{opt.label}</span>
                      </button>
                    ))}
                  </div>


                </div>
              )}
            </section>

            <section className="space-y-6">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${isEditorMode ? 'bg-amber-500 animate-pulse' : 'bg-brand-500'}`} />
                  <label className="text-[11px] font-black text-slate-950 uppercase tracking-[0.2em]">
                    {isEditorMode ? 'Editor Mode' : 'Studio Concept'}
                  </label>
                </div>
                <button 
                  onClick={() => setIsEditorMode(!isEditorMode)}
                  className={`flex items-center px-4 py-2 rounded-2xl transition-all border ${isEditorMode ? 'bg-amber-100 border-amber-200 text-amber-700 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'}`}
                >
                  <span className="text-[12px] font-black uppercase tracking-widest">{isEditorMode ? 'Exit Editor' : 'Enter Editor'}</span>
                </button>
              </div>
              
              <div className={`bg-slate-50 border rounded-3xl p-6 space-y-6 transition-all ${isEditorMode ? 'border-amber-200 ring-8 ring-amber-50/50' : 'border-slate-100'}`}>
                {isEditorMode && (
                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3 animate-in zoom-in-95 duration-300">
                    <div className="w-10 h-10 rounded-xl bg-white border border-amber-200 overflow-hidden flex-shrink-0 shadow-sm">
                      {customBackgroundImage ? (
                        <img src={`data:image/jpeg;base64,${customBackgroundImage}`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-amber-300">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="block text-[10px] font-black text-amber-800 uppercase tracking-widest mb-1">Refining Image</span>
                      <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                        AI will maintain the concept and background. You can change hairstyle, jewelry, or describe specific edits.
                      </p>
                    </div>
                  </div>
                )}
                  <div className="space-y-4">
                    <button 
                      type="button"
                      onClick={() => {
                        setIsVibeSelectorOpen(!isVibeSelectorOpen);
                        setIsPoseSelectorOpen(false);
                        setIsRatioResPanelOpen(false);
                        setIsCameraFramingPanelOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-4 bg-white border border-slate-100 rounded-[1.5rem] hover:border-brand-200 transition-all group shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-500">
                          <Palette className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col items-start">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] leading-none mb-1.5">Selected Vibe</span>
                          <span className="text-[13px] font-black text-slate-900 uppercase tracking-widest">
                            {CREATIVE_VIBES.find(v => v.id === selectedVibe)?.label || selectedVibe}
                          </span>
                        </div>
                      </div>
                      <div className={`p-2 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-500 transition-all ${isVibeSelectorOpen ? 'rotate-180' : ''}`}>
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </button>

                    {isVibeSelectorOpen && (
                      <div className="grid grid-cols-3 gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        {CREATIVE_VIBES.map((vibe) => (
                          <button 
                            key={vibe.id} 
                            onClick={() => {
                              setSelectedVibe(vibe.id);
                              setIsVibeSelectorOpen(false);
                            }} 
                            className={`px-1.5 py-2.5 rounded-xl border transition-all text-center flex items-center justify-center duration-200 ${
                              selectedVibe === vibe.id 
                                ? 'bg-brand-600 border-brand-600 text-white shadow-[0_4px_12px_rgba(79,70,229,0.25)] scale-[1.02]' 
                                : 'border-transparent text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-white'
                            }`}
                          >
                            <span className="text-[10px] font-black uppercase tracking-wider">{vibe.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {userIdea.length > 100 && lastExpandedVibe && lastExpandedVibe !== selectedVibe && (
                    <div className="p-3 bg-brand-50 border border-brand-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
                      <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-brand-500 shadow-sm">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest leading-tight">
                        Vibe changed. Re-expand to update the detailed brief.
                      </span>
                    </div>
                  )}

                <div className="flex flex-col gap-5">
                  <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-3 h-3 text-slate-400" />
                      <span className="text-[12px] font-black text-slate-400 uppercase tracking-widest">
                        {isEditorMode ? 'Source Image (To Edit)' : 'Reference Background'}
                      </span>
                    </div>
                    {customBackgroundImage && (
                      <button onClick={() => setCustomBackgroundImage(null)} className="text-[12px] text-rose-500 font-black uppercase tracking-widest hover:underline flex items-center gap-1">
                        <X className="w-3 h-3" />
                        Delete
                      </button>
                    )}
                  </div>
                  <div onMouseEnter={() => setIsHoveringBackgroundArea(true)} onMouseLeave={() => setIsHoveringBackgroundArea(false)} onClick={() => bgInputRef.current?.click()} className={`aspect-video rounded-3xl border-2 border-dashed transition-all cursor-pointer flex items-center justify-center overflow-hidden relative group ${customBackgroundImage ? 'border-brand-400 bg-white shadow-sm' : 'border-slate-200 bg-white/50 hover:border-brand-400 hover:bg-white'}`}>
                    {customBackgroundImage ? (
                      <img src={`data:image/jpeg;base64,${customBackgroundImage}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-center p-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-brand-50 transition-colors">
                          <Plus className="w-5 h-5 text-slate-400 group-hover:text-brand-500" />
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">{isEditorMode ? 'Upload Source' : 'Upload Reference'}</span>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'background')} ref={bgInputRef} className="hidden" />
                  </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3 h-3 text-slate-400" />
                      <span className="text-[12px] font-black text-slate-400 uppercase tracking-widest">
                          {isEditorMode ? 'Editing Instructions' : 'Idea Description'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="relative group">
                      <input 
                        type="text"
                        value={ideaRefinement}
                        onChange={(e) => setIdeaRefinement(e.target.value)}
                        placeholder="Add refinement keywords or requests..."
                        className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-5 py-3 text-[11px] font-bold text-slate-900 outline-none focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-50 transition-all pr-12"
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <div className="p-1.5 rounded-lg bg-brand-50 text-brand-500">
                          <Wand2 className="w-3 h-3" />
                        </div>
                      </div>
                    </div>

                    <textarea 
                      value={userIdea} 
                      onChange={(e) => setUserIdea(e.target.value)} 
                      placeholder={isEditorMode ? 'Describe what to change (Ex: "Replace shoes with product image, keep model and background")...' : 'Ex: Golden afternoon in Paris, vintage style...'} 
                      className="w-full bg-white border border-slate-100 rounded-3xl px-6 py-5 text-[14px] font-medium placeholder:text-slate-300 outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-50 transition-all h-32 resize-none shadow-inner" 
                    />
                  </div>
                </div>

                <button 
                  onClick={handleExpandIdea} 
                  disabled={isExpandingIdea} 
                  className="w-full py-4 text-[13px] font-black text-brand-600 uppercase tracking-[0.2em] hover:bg-brand-50 rounded-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 border border-brand-100"
                >
                  {isExpandingIdea ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Designing Idea...
                    </>
                  ) : (
                    <>
                      <span>Expand Idea</span>
                      <Sparkles className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </section>

            {sceneMode === 'model' && (
              <section className="space-y-8 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 px-1">
                  <div className="w-1.5 h-1.5 bg-brand-500 rounded-full shadow-[0_0_8px_rgba(var(--brand-500),0.5)]" />
                  <label className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Model Settings</label>
                </div>
                
                <div className="space-y-8">
                  <div className="space-y-4">
                    {/* Model Pose combobox container */}
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] block ml-1 mb-2">
                        Tạo dáng người mẫu (Model Pose)
                      </span>
                      <div className="relative" id="pose-combobox-root">
                        <div className="relative flex items-center bg-white border border-slate-100 rounded-2xl hover:border-brand-200 focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-50 transition-all shadow-sm">
                          <div className="pl-4 text-brand-500 shrink-0">
                            {renderPoseIcon(
                              POSE_SUGGESTIONS.find(p => p.value === selectedPose)?.iconName || 'User'
                            )}
                          </div>
                          
                          <input 
                            type="text"
                            value={customPose}
                            onChange={(e) => {
                              setCustomPose(e.target.value);
                              if (selectedPose !== ModelPose.CREATIVE) {
                                setSelectedPose(ModelPose.CREATIVE);
                              }
                            }}
                            onFocus={() => {
                              setIsPoseSelectorOpen(true);
                              setIsVibeSelectorOpen(false);
                              setIsRatioResPanelOpen(false);
                              setIsCameraFramingPanelOpen(false);
                            }}
                            placeholder="Tự động (Để AI tự quyết định hợp bối cảnh)..."
                            className="w-full bg-transparent pl-3 pr-24 py-4 text-[12px] font-medium text-slate-950 outline-none placeholder:text-slate-400"
                          />
                          
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            <button
                              type="button"
                              onClick={handleGeneratePose}
                              disabled={isGeneratingPose}
                              className="p-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-500 transition-colors disabled:opacity-50"
                              title="AI Tối ưu hóa / Sáng tạo thêm dáng"
                            >
                              {isGeneratingPose ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Wand2 className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {customPose && (
                              <button
                                type="button"
                                onClick={() => {
                                  setCustomPose("");
                                  setSelectedPose(ModelPose.AUTO);
                                  triggerToast("🔮 Đặt lại về tự động!");
                                }}
                                className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                setIsPoseSelectorOpen(!isPoseSelectorOpen);
                                setIsVibeSelectorOpen(false);
                                setIsRatioResPanelOpen(false);
                                setIsCameraFramingPanelOpen(false);
                              }}
                              className={`p-2 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-all ${isPoseSelectorOpen ? 'rotate-180 text-brand-500 bg-brand-50/30' : ''}`}
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {isPoseSelectorOpen && (
                          <>
                            <div 
                              className="fixed inset-0 z-40" 
                              onClick={() => setIsPoseSelectorOpen(false)} 
                            />
                            
                            <div className="absolute left-0 right-0 bottom-full mb-2 bg-white/95 backdrop-blur-md border border-slate-100/90 rounded-[24px] shadow-[0_24px_60px_-15px_rgba(0,0,0,0.15)] z-50 p-2.5 max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200/80 animate-in fade-in slide-in-from-top-2 duration-200">
                              <div className="px-3 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1.5 flex items-center justify-between">
                                <span>Gợi ý tạo dáng chụp ảnh thời trang</span>
                                {filteredSuggestions.length < POSE_SUGGESTIONS.length && (
                                  <span className="text-[8px] bg-brand-50 text-brand-600 px-1.5 py-0.5 rounded-md font-bold normal-case">Đang lọc</span>
                                )}
                              </div>
                              
                              {filteredSuggestions.map((sug) => {
                                const isSelected = selectedPose === sug.value;
                                return (
                                  <button
                                    key={sug.value}
                                    type="button"
                                    onClick={() => {
                                      setSelectedPose(sug.value);
                                      setCustomPose(sug.promptHint);
                                      setIsPoseSelectorOpen(false);
                                      if (sug.promptHint) {
                                        triggerToast(`✨ Chọn dáng: ${sug.label.split(' (')[0]}`);
                                      } else {
                                        triggerToast("✨ Đã kích hoạt tạo dáng bối cảnh tự động!");
                                      }
                                    }}
                                    className={`w-full flex items-start gap-3.5 p-2.5 rounded-2xl text-left border transition-all mb-1 ${
                                      isSelected 
                                        ? 'bg-brand-50/70 border-brand-100 text-brand-950 shadow-sm' 
                                        : 'hover:bg-slate-50 border-transparent text-slate-700 hover:text-slate-950'
                                    }`}
                                  >
                                    <div className={`p-2 rounded-xl mt-0.5 transition-colors ${isSelected ? 'bg-brand-100 text-brand-600' : 'bg-slate-50 text-slate-500'}`}>
                                      {renderPoseIcon(sug.iconName)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-[11.5px] font-bold tracking-tight flex items-center justify-between">
                                        <span>{sug.label}</span>
                                        {isSelected && <Check className="w-4 h-4 text-brand-500 shrink-0" />}
                                      </div>
                                      <div className={`text-[9.5px] font-medium leading-normal mt-0.5 ${isSelected ? 'text-brand-600/80' : 'text-slate-400'}`}>
                                        {sug.subLabel}
                                      </div>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </div>
                      
                      <p className="text-[9.5px] text-slate-400 font-bold uppercase tracking-widest ml-4 mt-2.5 leading-relaxed">
                        Nhập kiểu dáng mong muốn và nhấn bút thuật sĩ <Wand2 className="w-3.5 h-3.5 text-brand-500 inline-block align-middle mx-1 -mt-0.5" /> để AI tự nâng cấp và đề xuất tạo dáng độc bản.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            <section className="space-y-6 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-brand-500 rounded-full shadow-[0_0_8px_rgba(var(--brand-500),0.5)]" />
                  <label className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Branding</label>
                </div>
                <button 
                  onClick={() => setShowBranding(!showBranding)} 
                  className={`w-10 h-5 rounded-full transition-all relative ${showBranding ? 'bg-brand-500' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${showBranding ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              
              {showBranding && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="grid grid-cols-4 gap-3">
                    <button 
                      onClick={() => { setSelectedDefaultLogo('m'); setCustomLogoImage(null); }} 
                      className={`aspect-square rounded-2xl border-2 flex items-center justify-center transition-all ${selectedDefaultLogo === 'm' ? 'border-brand-500 bg-brand-50 shadow-sm' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}
                    >
                      <div className="w-full h-full p-3 flex items-center justify-center overflow-hidden" dangerouslySetInnerHTML={{ __html: getLogoSvg(logoColor) }} />
                    </button>
                    <button 
                      onClick={() => logoInputRef.current?.click()} 
                      className={`aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-all ${customLogoImage ? 'border-brand-500 bg-brand-50 shadow-sm' : 'border-slate-200 bg-slate-50 hover:border-brand-400'}`}
                    >
                      {customLogoImage ? (
                        <div className="w-full h-full p-3 flex items-center justify-center">
                          <img src={customLogoImage} className="max-w-full max-h-full object-contain" />
                        </div>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 text-slate-400" />
                          <span className="text-[9px] font-black uppercase text-slate-400">Upload</span>
                        </>
                      )}
                    </button>
                    <input type="file" accept="image/png,image/svg+xml" onChange={(e) => handleFileUpload(e, 'logo')} ref={logoInputRef} className="hidden" />
                  </div>

                  <div className="space-y-3">
                    <span className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Logo Position</span>
                    <div className="grid grid-cols-3 gap-2">
                      {LOGO_POSITIONS.map((pos) => (
                        <button 
                          key={pos.value} 
                          onClick={() => setLogoPosition(pos.value)} 
                          className={`py-2.5 rounded-xl border text-[9px] font-black uppercase transition-all ${logoPosition === pos.value ? 'border-brand-500 bg-brand-50 text-brand-600 shadow-sm' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'}`}
                        >
                          {pos.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <span className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Logo Color</span>
                    <div className="flex gap-3">
                      <div className="relative">
                        <input 
                          type="color" 
                          value={logoColor} 
                          onChange={(e) => setLogoColor(e.target.value)} 
                          className="w-12 h-12 rounded-xl cursor-pointer bg-slate-100 p-1 border-none outline-none" 
                        />
                      </div>
                      <input 
                        type="text" 
                        value={logoColor.toUpperCase()} 
                        onChange={(e) => setLogoColor(e.target.value)} 
                        className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-5 text-[11px] font-black outline-none focus:border-brand-400 focus:bg-white transition-all shadow-inner" 
                      />
                    </div>
                  </div>
                </div>
              )}
            </section>

        </div>

        {/* Stationary Bottom Bar of Sidebar (Desktop) */}
        <div className="hidden lg:block border-t border-slate-100 bg-white/95 backdrop-blur-md p-6 space-y-4 relative z-40 shadow-[0_-12px_40px_rgba(0,0,0,0.03)] flex-shrink-0">
          {/* Camera, Framing & Text Space Trigger: Text + Icon */}
          <div className="relative" ref={cameraFramingPanelRef}>
            <button
              type="button"
              onClick={() => {
                setIsCameraFramingPanelOpen(!isCameraFramingPanelOpen);
                setIsRatioResPanelOpen(false);
                setIsPoseSelectorOpen(false);
                setIsVibeSelectorOpen(false);
              }}
              className="w-full flex items-center justify-between text-slate-500 hover:text-slate-900 transition-colors uppercase py-1"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Camera className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-[10.5px] font-black tracking-wider truncate text-left">
                  GÓC: {CAMERA_ANGLE_OPTIONS.find(a => a.value === selectedAngle)?.label} • KHUNG: {FRAMING_OPTIONS.find(f => f.value === selectedFraming)?.label}{hasTextSpace ? ' • CHỨA CHỮ' : ''}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-300 ${isCameraFramingPanelOpen ? 'rotate-180' : ''}`} />
            </button>

            {isCameraFramingPanelOpen && (
              <div className="absolute bottom-full left-0 w-full mb-3 p-4 bg-white/98 backdrop-blur-xl border border-slate-100 rounded-3xl shadow-[0_25px_60px_-15px_rgba(15,23,42,0.15)] space-y-4 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* Camera Angle section */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-slate-400 ml-1">
                    <Camera className="w-3.5 h-3.5 text-brand-500/80" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] font-sans text-slate-400">Góc Chụp</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 bg-slate-50 border border-slate-100/80 p-1 rounded-xl">
                    {CAMERA_ANGLE_OPTIONS.map((angle) => (
                      <button 
                        key={angle.value} 
                        type="button"
                        onClick={() => {
                          setSelectedAngle(angle.value as CameraAngle);
                        }} 
                        className={`px-2 py-2 text-[10px] font-black tracking-wide rounded-xl border transition-all truncate text-left flex items-center justify-between duration-200 ${
                          selectedAngle === angle.value 
                            ? 'bg-brand-600 border-brand-600 text-white shadow-[0_4px_12px_rgba(79,70,229,0.25)] scale-[1.02]' 
                            : 'border-transparent text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-white hover:border-slate-200'
                        }`}
                      >
                        <span className="truncate">{angle.label}</span>
                        {selectedAngle === angle.value && <div className="w-1.5 h-1.5 rounded-full bg-white shrink-0 ml-1" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Framing section */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-slate-400 ml-1">
                    <Layout className="w-3.5 h-3.5 text-brand-500/85" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] font-sans text-slate-400">Khung Hình</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 bg-slate-50 border border-slate-100/80 p-1 rounded-xl">
                    {FRAMING_OPTIONS.filter((f) => {
                      if (sceneMode === 'still-life') {
                        return [FramingMode.AUTO, FramingMode.CLOSE_UP, FramingMode.PRODUCT_FOCUS].includes(f.value);
                      }
                      if (sceneMode === 'ghost') {
                        return f.value !== FramingMode.PORTRAIT;
                      }
                      return true;
                    }).map((framing) => (
                      <button 
                        key={framing.value} 
                        type="button"
                        onClick={() => {
                          setSelectedFraming(framing.value as FramingMode);
                        }} 
                        className={`px-2 py-2 text-[10px] font-black tracking-wide rounded-xl border transition-all truncate text-left flex items-center justify-between duration-200 ${
                          selectedFraming === framing.value 
                            ? 'bg-brand-600 border-brand-600 text-white shadow-[0_4px_12px_rgba(79,70,229,0.25)] scale-[1.02]' 
                            : 'border-transparent text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-white hover:border-slate-200'
                        }`}
                      >
                        <span className="truncate">{framing.label}</span>
                        {selectedFraming === framing.value && <div className="w-1.5 h-1.5 rounded-full bg-white shrink-0 ml-1" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text Space option */}
                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between ml-1">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Sliders className="w-3.5 h-3.5 text-brand-500/85" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] font-sans text-slate-400">Chừa chỗ viết chữ</span>
                    </div>
                    <span className="text-[8px] text-brand-600 font-extrabold bg-brand-50 px-1.5 py-0.5 rounded-md uppercase tracking-wider border border-brand-100/30">AI Auto-Layout</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 bg-slate-50 border border-slate-100/80 p-1 rounded-xl">
                    <button 
                      type="button"
                      onClick={() => setHasTextSpace(false)} 
                      className={`px-3 py-2 text-[10px] font-black rounded-xl border transition-all truncate text-left flex items-center justify-between duration-200 ${
                        !hasTextSpace 
                          ? 'bg-brand-600 border-brand-600 text-white shadow-[0_4px_12px_rgba(79,70,229,0.25)] scale-[1.02]' 
                          : 'border-transparent text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-white hover:border-slate-200'
                      }`}
                    >
                      <span>Mặc định</span>
                      {!hasTextSpace && <div className="w-1.5 h-1.5 rounded-full bg-white shrink-0 ml-1" />}
                    </button>
                    <button 
                      type="button"
                      onClick={() => setHasTextSpace(true)} 
                      className={`px-3 py-2 text-[10px] font-black rounded-xl border transition-all truncate text-left flex items-center justify-between duration-200 ${
                        hasTextSpace 
                          ? 'bg-brand-600 border-brand-600 text-white shadow-[0_4px_12px_rgba(79,70,229,0.25)] scale-[1.02]' 
                          : 'border-transparent text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-white hover:border-slate-200'
                      }`}
                    >
                      <span>Chừa chỗ trống</span>
                      {hasTextSpace && <div className="w-1.5 h-1.5 rounded-full bg-white shrink-0 ml-1" />}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Ratio, Resolution and Generate button group */}
          <div className="flex gap-3 items-stretch relative">
            {/* Left part: Ratio & Resolution Toggle Button */}
            <div className="relative shrink-0" ref={ratioResPanelRef}>
              <button
                type="button"
                onClick={() => {
                  setIsRatioResPanelOpen(!isRatioResPanelOpen);
                  setIsCameraFramingPanelOpen(false);
                  setIsPoseSelectorOpen(false);
                  setIsVibeSelectorOpen(false);
                }}
                className={`h-full flex flex-row items-center justify-center gap-2 px-3.5 py-2.5 bg-slate-50 border hover:bg-slate-100/80 hover:border-slate-300 transition-all rounded-2xl shrink-0 ${isRatioResPanelOpen ? 'bg-slate-100 border-slate-300 shadow-inner' : 'border-slate-200/80 shadow-sm'}`}
              >
                <Crop className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                <span className="text-[11px] font-black text-slate-800 tracking-wider uppercase whitespace-nowrap">
                  {selectedResolution} • {aspectRatio}
                </span>
                <ChevronDown className={`w-3 h-3 text-slate-400 shrink-0 transition-transform duration-300 ${isRatioResPanelOpen ? 'rotate-180' : ''}`} />
              </button>

              {isRatioResPanelOpen && (
                <div className="absolute bottom-full left-0 w-[280px] mb-3 p-4 bg-white border border-slate-100 rounded-3xl shadow-2xl space-y-4 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {/* Aspect Ratio section */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block ml-1 font-sans">Tỷ Lệ Khung Hình</span>
                    <div className="grid grid-cols-4 gap-1 bg-slate-50 border border-slate-100 p-0.5 rounded-xl">
                      {ASPECT_RATIOS.map((r) => (
                        <button 
                          key={r} 
                          type="button"
                          onClick={() => setAspectRatio(r)} 
                          className={`py-1.5 text-[10px] font-black rounded-lg transition-all duration-200 ${aspectRatio === r ? 'bg-brand-600 text-white shadow-md scale-[1.02]' : 'text-slate-500 hover:text-slate-800 hover:bg-white rounded-lg'}`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Resolution section */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block ml-1 font-sans">Độ Phân Giải</span>
                    <div className="grid grid-cols-3 gap-1 bg-slate-50 border border-slate-100 p-0.5 rounded-xl">
                      {RESOLUTIONS.map((res) => (
                        <button 
                          key={res} 
                          type="button"
                          onClick={() => setSelectedResolution(res)} 
                          className={`py-1.5 text-[10px] font-black rounded-lg transition-all duration-200 ${selectedResolution === res ? 'bg-brand-600 text-white shadow-md scale-[1.02]' : 'text-slate-500 hover:text-slate-800 hover:bg-white rounded-lg'}`}
                        >
                          {res}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right part: Shoot Model Generate Button */}
            <div className="flex-1">
              <Button 
                onClick={handleGenerate} 
                isLoading={isGenerating} 
                disabled={isGenerating || (productImages.length === 0 && !isEditorMode) || (isEditorMode && !customBackgroundImage)} 
                className="w-full h-full py-4 text-xs font-black uppercase tracking-[0.2em] shadow-xl rounded-2xl bg-brand-600 hover:bg-brand-700 shadow-brand-200/50 flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                    <span className="truncate">{loadingStatus || "Shooting..."}</span>
                  </>
                ) : (
                  <>
                    <span className="truncate">{isEditorMode ? "Edit Image" : (sceneMode === 'model' ? "Shoot Model" : "Shoot Studio")}</span>
                    <Zap className="w-4 h-4 shrink-0" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Sticky Generate Button */}
        <div className="lg:hidden fixed bottom-0 inset-x-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-100 z-20">
          <Button 
            onClick={handleGenerate} 
            isLoading={isGenerating} 
            disabled={isGenerating || (productImages.length === 0 && !isEditorMode) || (isEditorMode && !customBackgroundImage)} 
            className="w-full py-4 text-xs font-black uppercase tracking-[0.2em] shadow-xl rounded-2xl bg-brand-600 hover:bg-brand-700 shadow-brand-200 flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                {loadingStatus}
              </>
            ) : (
              <>
                {isEditorMode ? "Edit Image" : (sceneMode === 'model' ? "Shoot Model" : "Shoot Studio")}
                <Zap className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </aside>

      <main className={`flex-1 bg-slate-50 relative p-4 lg:p-8 overflow-y-auto flex-col items-center ${activeMobileTab === 'preview' ? 'flex' : 'hidden lg:flex'}`}>
        <div className="w-full max-w-7xl h-full flex flex-col items-center justify-center py-8 lg:py-0">
          {generatedImage ? (
            <div className="w-fit max-w-[95%] lg:max-w-[80%] mx-auto animate-in zoom-in-95 duration-500">
              <div className="relative group rounded-[1.5rem] lg:rounded-[2.5rem] overflow-hidden bg-white shadow-2xl ring-1 ring-slate-200 p-1.5 lg:p-2 transition-all hover:shadow-brand-200">
                <div className="rounded-[1.2rem] lg:rounded-[2rem] overflow-hidden bg-slate-50 flex items-center justify-center">
                  <img src={compositePreviewUrl || generatedImage} className="max-w-full max-h-[70vh] lg:max-h-[75vh] object-contain cursor-zoom-in" onClick={() => setViewingImage(compositePreviewUrl || generatedImage)} />
                </div>
                <div className="absolute top-4 lg:top-8 left-4 lg:left-8 flex items-center gap-2 bg-brand-600/90 backdrop-blur-md px-3 lg:px-4 py-1.5 lg:py-2 rounded-full shadow-lg border border-brand-400/30">
                  <div className="w-1.5 lg:w-2 h-1.5 lg:h-2 rounded-full bg-white animate-pulse" />
                  <span className="text-[10px] lg:text-[11px] font-black text-white uppercase tracking-widest">{currentSceneModeDisplay} • {selectedVibe} • {selectedResolution}</span>
                </div>
                <div className="absolute top-4 lg:top-8 right-4 lg:right-8 flex flex-col gap-2 lg:gap-3 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                  <button onClick={handleSendToEditor} className="bg-brand-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-xl lg:rounded-2xl shadow-2xl font-black text-[10px] lg:text-[12px] uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2">
                    <Edit3 className="w-3 h-3 lg:w-4 h-4" />
                    Edit this image
                  </button>
                  <button onClick={handleDownloadDraft} className="bg-white text-slate-900 border border-slate-200 px-4 lg:px-6 py-2 lg:py-3 rounded-xl lg:rounded-2xl shadow-xl font-black text-[10px] lg:text-[12px] uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2">
                    <Download className="w-3 h-3 lg:w-4 h-4" />
                    Download
                  </button>
                  <button onClick={() => setIsPromptModalOpen(true)} className="bg-white text-slate-900 border border-slate-200 px-4 lg:px-6 py-2 lg:py-3 rounded-xl lg:rounded-2xl shadow-xl font-black text-[10px] lg:text-[12px] uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2">
                    <Info className="w-3 h-3 lg:w-4 h-4" />
                    Show Prompt
                  </button>
                  {selectedResolution !== '4K' && (
                    <button onClick={handleUpscaleTo4K} className="bg-slate-900 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-xl lg:rounded-2xl shadow-2xl font-black text-[10px] lg:text-[12px] uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2">
                      <Zap className="w-3 h-3 lg:w-4 h-4" />
                      4K Master
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-6 lg:space-y-8 animate-in fade-in duration-1000">
              <div className="w-40 h-40 lg:w-56 lg:h-56 bg-white rounded-[2.5rem] lg:rounded-[3.5rem] shadow-2xl flex items-center justify-center mx-auto ring-1 ring-slate-100 rotate-2 group transition-all duration-500">
                <ImageIcon className="w-16 h-16 lg:w-20 lg:h-20 text-brand-500/10 group-hover:text-brand-500/20" strokeWidth={1} />
              </div>
              <div className="space-y-3 lg:space-y-4">
                <h3 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight font-display">RENDR LAB</h3>
                <p className="text-slate-400 text-xs lg:text-sm font-medium max-w-xs lg:max-w-md mx-auto leading-relaxed">
                  AI Product Photography System.<br/>
                  <span className="text-[10px] lg:text-[12px] font-black text-brand-500 uppercase tracking-widest mt-2 block animate-pulse">Mode: {selectedVibe} • Scene: {currentSceneModeDisplay}</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; } 
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } 
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
}
