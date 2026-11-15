export type ProductKind = 'laptop' | 'headphones' | 'smartphone' | 'smartwatch' | 'camera' | 'speaker';

export type ProductColor = {
  id: string;
  name: string;
  hex: string;
};

export type ProductSpec = {
  label: string;
  value: string;
};

export type Product = {
  id: ProductKind;
  slug: string;
  brand: string;
  name: string;
  shortName: string;
  category: string;
  tagline: string;
  description: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  images: string[];
  colors: ProductColor[];
  specs: ProductSpec[];
};

export type CartItem = {
  productId: ProductKind;
  colorId: string;
  quantity: number;
};

export type CameraPhase =
  | 'CAMERA_OFF'
  | 'LOADING_MODEL'
  | 'REQUESTING_PERMISSION'
  | 'CALIBRATING'
  | 'STOREFRONT_IDLE'
  | 'STOREFRONT_ACTIVE'
  | 'DETAIL_GALLERY'
  | 'NAVIGATION_TRANSITION'
  | 'ERROR';

export type GestureName =
  | 'NONE'
  | 'OPEN_PALM'
  | 'FIST'
  | 'OK_SIGN'
  | 'VICTORY'
  | 'SWIPE_LEFT'
  | 'SWIPE_RIGHT'
  | 'POINTING'
  | 'SWIPE_DOWN';

export type GestureUiState = {
  phase: CameraPhase;
  enabled: boolean;
  controlActive: boolean;
  handsDetected: number;
  currentGesture: GestureName;
  gestureLabel: string;
  lastAction: string;
  stability: number;
  message: string;
  error: string | null;
};
