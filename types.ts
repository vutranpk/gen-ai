
export enum CameraAngle {
  AUTO = 'Auto',
  FRONT = 'Front View',
  BACK = 'Back View',
  TOP_DOWN = 'Top-down',
  SIDE_PROFILE = 'Side Profile',
  LEFT_SIDE = 'Left Side',
  RIGHT_SIDE = 'Right Side',
  ISOMETRIC = 'Isometric',
  LOW_ANGLE = 'Low Angle',
  HIGH_ANGLE = 'High Angle',
  CREATIVE = 'Creative / Unique'
}

export enum ModelPose {
  AUTO = 'Auto',
  STANDING = 'Standing',
  SITTING = 'Sitting',
  MOVING = 'Moving',
  LEANING = 'Leaning',
  RECLINING = 'Reclining',
  CANDID = 'Candid',
  OVER_SHOULDER = 'Over Shoulder',
  ZERO_GRAVITY = 'Zero Gravity',
  CREATIVE = 'Creative / Unique',
  REFERENCE = 'Reference Image'
}

export enum ProductCategory {
  GENERAL = 'General Product',
  TOPS = 'Tops (T-shirt, Shirt, Blouse)',
  BOTTOMS = 'Bottoms (Pants, Skirt, Shorts)',
  DRESSES = 'Dresses',
  OUTERWEAR = 'Outerwear (Jacket, Coat)',
  SHOES = 'Shoes',
  SOCKS = 'Socks',
  ACCESSORIES = 'Accessories (Watch, Glasses, Jewelry)',
  BAGS = 'Bags',
  SENSITIVE_APPAREL = 'Lingerie, Sleepwear, Bikini',
  DIGITAL_MOCKUP = 'UX/UI, Digital Mockup (Phone, PC, Tablet)',
  PRINT_MOCKUP = 'Packaging, Print Mockup (Box, Bag, Stationery)'
}

export enum ProductGender {
  MALE = 'Male',
  FEMALE = 'Female',
  UNISEX = 'Unisex'
}

export enum FramingMode {
  AUTO = 'Auto',
  FULL_BODY = 'Full Body',
  WIDE_SHOT = 'Wide Shot',
  UPPER_BODY = 'Upper Body',
  LOWER_BODY = 'Lower Body',
  PORTRAIT = 'Portrait',
  CLOSE_UP = 'Close-up',
  PRODUCT_FOCUS = 'Product Focus'
}

export type SceneMode = 'still-life' | 'ghost' | 'model';

export interface BodyMeasurements {
  bust: number;
  waist: number;
  hip: number;
  wrist?: number; // cm
  ankle?: number; // cm
  headWidth?: number; // cm
  headHeight?: number; // cm
}

export interface ModelDna {
  ethnicity: string;
  age: string;
  hairstyle: string;
  facialFeatures: string;
  height: number; // cm
  weight: number; // kg
  measurements: BodyMeasurements;
  celebrityBlend?: string; // New field for celebrity blending
  promptDna?: string; // New field for detailed prompt DNA
  stableFeatures?: string; // Locked visual anchors like bangs, face shape, etc.
  makeupStyle?: string; // Locked makeup style
  hairLength?: string; // Locked hair length (e.g., long, short, shoulder-length)
  lightingStyle?: string; // Locked lighting style (e.g., soft, high-key, cinematic)
  jewelryStyle?: string; // Locked jewelry style
}

export interface PredefinedModel {
  id: string;
  name: string;
  gender: ProductGender;
  thumbnail: string;
  profileImage?: string; // New field for reference profile image (multi-angle)
  dna: ModelDna;
  promptHint: string;
  specialStyle?: string;
}

export interface ProductSettings {
  angle: CameraAngle;
  category: ProductCategory;
  framing: FramingMode;
  backgroundDescription: string;
  title: string;
  subtitle: string;
  titleColor: string;
  subtitleColor: string;
  titlePosition: 'top' | 'bottom' | 'center';
}

export interface HistoryItem {
  id: string;
  url: string;
  timestamp: number;
  metadata: {
    vibe: string;
    sceneMode: string;
  };
}
