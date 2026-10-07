export interface Service {
  name: string;
  price: number;
  description?: string;
  duration?: string;
  pendingConfirmation?: boolean;
}

export interface GalleryItem {
  id: string;
  imageUrl: string;
  title?: string;
  category?: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date?: string;
}

export interface OpeningHour {
  day: string;
  time: string;
}

export interface Address {
  street: string;
  block: string;
  lot: string;
  neighborhood: string;
  city: string;
  state?: string;
}

export interface SalonColors {
  black: string;
  blackSecondary: string;
  pink: string;
  pinkLight: string;
  roseGold: string;
  white: string;
  grayLight: string;
}

export const salonConfig = {
  name: "Bianca Alves Salão de Beleza",
  shortName: "Bianca Alves",
  logoInitials: "BA",
  logoPath: "/logo.jpeg",

  whatsappDisplay: "(62) 99545-3266",
  whatsappNumber: "5562995453266",

  address: {
    street: "Rua Guarujá",
    block: "Quadra 29",
    lot: "Lote 25",
    neighborhood: "Jardim Ipanema",
    city: "Trindade",
    state: "GO",
  } as Address,

  colors: {
    black: "#050505",
    blackSecondary: "#141414",
    pink: "#E88AA2",
    pinkLight: "#F4C2CD",
    roseGold: "#B76E79",
    white: "#FFFFFF",
    grayLight: "#F5F5F5",
  } as SalonColors,

  heroTitle: "Realce sua beleza e cuide de você",
  heroSubtitle: "Cuidados capilares com atendimento personalizado em Trindade.",

  aboutTitle: "Sobre a Bianca Alves",
  aboutText:
    "Na Bianca Alves Salão de Beleza, cada atendimento é pensado para valorizar a beleza e o estilo de cada cliente. Conheça nossos serviços, consulte os preços e fale conosco pelo WhatsApp para verificar os horários disponíveis.",
  // Foto principal da Bianca / salão (arquivo encontrado em public/Imagens/)
  aboutImageUrl: "/Imagens/bianca-principal.jpg.jpg",

  // Foto de destaque do Hero (parallax) - mesma imagem, para não duplicar arquivo
  heroImageUrl: "/Imagens/bianca-principal.jpg.jpg",

  // Instagram oficial
  instagramUsername: "studio_bianca_aaalves",
  instagramUrl: "https://www.instagram.com/studio_bianca_aaalves",

  googleReviewUrl: "",

  openingHours: [] as OpeningHour[],

  gallery: [] as GalleryItem[],

  reviews: [] as Review[],

  paymentMethods: [] as string[],

  schedulingPolicy: "",
  delayPolicy: "",
  cancellationPolicy: "",

  domain: "",

  services: [
    { name: "Progressiva com formol", price: 100 },
    { name: "Progressiva sem formol", price: 100 },
    { name: "Botox capilar", price: 80 },
    { name: "Escova", price: 40 },
    { name: "Hidratação", price: 30 },
    {
      name: "Coloração",
      price: 30,
      description: "",
    },
    { name: "Hidratação e escova", price: 50 },
    { name: "Coloração e escova", price: 50 },
  ] as Service[],
};

export const formatCurrency = (value: number): string =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });

export const formatAddress = (address: Address): string =>
  `${address.street}, ${address.block}, ${address.lot} - ${address.neighborhood}, ${address.city}${address.state ? ` - ${address.state}` : ""}`;

export const encodeAddressForMaps = (address: Address): string =>
  encodeURIComponent(formatAddress(address));

export const getGoogleMapsUrl = (address: Address): string =>
  `https://www.google.com/maps/search/?api=1&query=${encodeAddressForMaps(address)}`;

const DEFAULT_WHATSAPP_MESSAGE =
  "Olá, Bianca! Tudo bem? Vi o trabalho do salão e gostaria de saber mais sobre os serviços e horários disponíveis para agendar meu atendimento. 😊";

export const getWhatsAppUrl = (
  number: string,
  message: string = encodeURIComponent(DEFAULT_WHATSAPP_MESSAGE)
): string => `https://wa.me/${number}?text=${message}`;

export const getServiceBookingMessage = (service: Service): string => {
  const priceText = formatCurrency(service.price);
  const message = `Olá, Bianca! Tudo bem? Vi o trabalho do salão pelo site e gostaria de agendar o serviço ${service.name}, no valor anunciado de ${priceText}. Pode me informar quais horários estão disponíveis? 😊`;
  return encodeURIComponent(message);
};
