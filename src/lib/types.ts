export interface Builder {
  id: string;
  name: string;
  initials: string;
  color: string;
  featured: boolean;
  phone: string;
  website: string;
  years: number;
  blurb: string;
  ad: string;
}

export interface Neighborhood {
  id: string;
  name: string;
  city: string;
  color: string;
  img: string;
  blurb: string;
  low: number;
  high: number;
}

export interface Home {
  id: string;
  name: string;
  builder: string; // builder id
  nb: string; // neighborhood id
  style: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  garage: number;
  checkins: number;
  rating: number;
  ratings: number;
  featured: boolean;
  x: number;
  y: number;
  blurb: string;
  features: string[];
  imgs: string[];
}

export interface Sponsor {
  id: string;
  name: string;
  tier: "platinum" | "gold" | "silver";
  color: string;
  cat: string;
}

export interface Faq {
  q: string;
  a: string;
}

export interface User {
  id: string;
  first: string;
  last: string;
  email: string;
  phone: string;
  zip: string;
  sms: boolean;
  checkins: number;
  date: string;
}

export interface Submission {
  id: string;
  builder: string;
  home: string;
  nb: string;
  style: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  status: "pending" | "approved" | "rejected";
  date: string;
  contact: string;
}

export interface NotificationItem {
  id: string;
  type: string;
  msg: string;
  audience: string;
  sent: string;
  count: number;
}

export interface Contest {
  target: number;
  prize: string;
}

export interface DB {
  contest: Contest;
  builders: Builder[];
  neighborhoods: Neighborhood[];
  homes: Home[];
  sponsors: Sponsor[];
  faqs: Faq[];
  users: User[];
  submissions: Submission[];
  notifications: NotificationItem[];
}
