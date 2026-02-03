export interface Tour {
  id: string
  name: string
  description: string
  image: string
  price: number
  duration: string
  locations: Location[]
  dates: TourDate[]
}

export interface Location {
  id: string
  name: string
  description: string
}

export interface TourDate {
  id: string
  date: string
  times: TimeSlot[]
}

export interface TimeSlot {
  id: string
  time: string
  capacity: number
  tickets: {
    adult: { tickets: number; price: number }
    child: { tickets: number; price: number }
    infant: { tickets: number; price: number }
    youth: { tickets: number; price: number }
    studentEU: { tickets: number; price: number }
  }
}

export interface Booking {
  id: string
  tourName: string
  date: string
  time: string
  status: 'pending' | 'confirmed' | 'cancelled'
  createdAt: string
  customerEmail: string
  quantity: number
}

export interface ContactRequest {
  id: string
  name: string
  email: string
  message: string
  status: 'new' | 'in-progress' | 'resolved'
  createdAt: string
}

export interface Notice {
  id: string
  title: string
  content: string
  isActive: boolean
  createdAt: string
}

export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'manager' | 'user'
  createdAt: string
}

export const mockTours: Tour[] = [
  {
    id: '1',
    name: 'Colosseum Classic Tour',
    description: 'Experience the grandeur of ancient Rome with guided tour of the iconic Colosseum.',
    image: 'https://images.unsplash.com/photo-1552832860-cfb67165eaf0?w=500&h=500&fit=crop',
    price: 45,
    duration: '2 hours',
    locations: [
      { id: '1', name: 'Colosseum', description: 'Ancient amphitheater' },
      { id: '2', name: 'Roman Forum', description: 'Historic ruins' },
    ],
    dates: [],
  },
  {
    id: '2',
    name: 'Vatican Museum Adventure',
    description: 'Explore the magnificent Vatican Museums and Sistine Chapel.',
    image: 'https://images.unsplash.com/photo-1552832860-cfb67165eaf0?w=500&h=500&fit=crop',
    price: 65,
    duration: '3 hours',
    locations: [
      { id: '3', name: 'Vatican Museums', description: 'Art and history' },
      { id: '4', name: 'Sistine Chapel', description: 'Michelangelo masterpiece' },
    ],
    dates: [],
  },
  {
    id: '3',
    name: 'Trevi Fountain Evening',
    description: 'Witness the stunning Trevi Fountain illuminated at night.',
    image: 'https://images.unsplash.com/photo-1552832860-cfb67165eaf0?w=500&h=500&fit=crop',
    price: 35,
    duration: '1.5 hours',
    locations: [
      { id: '5', name: 'Trevi Fountain', description: 'Iconic fountain' },
      { id: '6', name: 'Historic Streets', description: 'Medieval alleys' },
    ],
    dates: [],
  },
  {
    id: '4',
    name: 'Spanish Steps Exploration',
    description: 'Discover the charming Spanish Steps and surrounding neighborhoods.',
    image: 'https://images.unsplash.com/photo-1552832860-cfb67165eaf0?w=500&h=500&fit=crop',
    price: 40,
    duration: '2 hours',
    locations: [
      { id: '7', name: 'Spanish Steps', description: 'Famous staircase' },
      { id: '8', name: 'Local Markets', description: 'Shopping area' },
    ],
    dates: [],
  },
  {
    id: '5',
    name: 'Ancient Rome Walking Tour',
    description: 'Deep dive into ancient Roman history and architecture.',
    image: 'https://images.unsplash.com/photo-1552832860-cfb67165eaf0?w=500&h=500&fit=crop',
    price: 50,
    duration: '2.5 hours',
    locations: [
      { id: '9', name: 'Pantheon', description: 'Ancient temple' },
      { id: '10', name: 'Capitoline Museum', description: 'Art museum' },
    ],
    dates: [],
  },
  {
    id: '6',
    name: 'Renaissance Art Tour',
    description: 'Explore the masterpieces of Renaissance art throughout Rome.',
    image: 'https://images.unsplash.com/photo-1552832860-cfb67165eaf0?w=500&h=500&fit=crop',
    price: 55,
    duration: '3 hours',
    locations: [
      { id: '11', name: 'Galleria Borghese', description: 'Art gallery' },
      { id: '12', name: 'Roman Palaces', description: 'Historic residences' },
    ],
    dates: [],
  },
]

export const mockBookings: Booking[] = [
  {
    id: 'B001',
    tourName: 'Colosseum Classic Tour',
    date: '2024-02-15',
    time: '09:00 AM',
    status: 'confirmed',
    createdAt: '2024-02-10',
    customerEmail: 'john@example.com',
    quantity: 4,
  },
  {
    id: 'B002',
    tourName: 'Vatican Museum Adventure',
    date: '2024-02-16',
    time: '10:00 AM',
    status: 'pending',
    createdAt: '2024-02-11',
    customerEmail: 'jane@example.com',
    quantity: 2,
  },
  {
    id: 'B003',
    tourName: 'Trevi Fountain Evening',
    date: '2024-02-17',
    time: '05:00 PM',
    status: 'confirmed',
    createdAt: '2024-02-12',
    customerEmail: 'bob@example.com',
    quantity: 3,
  },
  {
    id: 'B004',
    tourName: 'Spanish Steps Exploration',
    date: '2024-02-18',
    time: '02:00 PM',
    status: 'pending',
    createdAt: '2024-02-13',
    customerEmail: 'alice@example.com',
    quantity: 6,
  },
  {
    id: 'B005',
    tourName: 'Colosseum Classic Tour',
    date: '2024-02-19',
    time: '11:00 AM',
    status: 'confirmed',
    createdAt: '2024-02-14',
    customerEmail: 'charlie@example.com',
    quantity: 2,
  },
]

export const mockContactRequests: ContactRequest[] = [
  {
    id: 'C001',
    name: 'Marco Rossi',
    email: 'marco@example.com',
    message: 'I would like information about group bookings for 50 people.',
    status: 'in-progress',
    createdAt: '2024-02-12',
  },
  {
    id: 'C002',
    name: 'Sophie Martin',
    email: 'sophie@example.com',
    message: 'Are there any discounts for early bookings?',
    status: 'new',
    createdAt: '2024-02-13',
  },
  {
    id: 'C003',
    name: 'Antonio Bianchi',
    email: 'antonio@example.com',
    message: 'Need wheelchair accessible tour information.',
    status: 'resolved',
    createdAt: '2024-02-11',
  },
  {
    id: 'C004',
    name: 'Lisa Müller',
    email: 'lisa@example.com',
    message: 'Can I reschedule my booking?',
    status: 'new',
    createdAt: '2024-02-14',
  },
]

export const mockNotices: Notice[] = [
  {
    id: 'N001',
    title: 'February Holiday Hours',
    content: 'We will be operating with extended hours during the February holiday period. Tours will run from 9 AM to 7 PM.',
    isActive: true,
    createdAt: '2024-02-01',
  },
  {
    id: 'N002',
    title: 'New Spanish Steps Tour',
    content: 'Introducing our brand new Spanish Steps Exploration tour. Book now and get 15% off!',
    isActive: false,
    createdAt: '2024-01-28',
  },
  {
    id: 'N003',
    title: 'Maintenance Notice',
    content: 'The Colosseum tour will be temporarily unavailable from Feb 20-22 for maintenance.',
    isActive: false,
    createdAt: '2024-01-25',
  },
]

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    name: 'Manager User',
    email: 'manager@example.com',
    role: 'manager',
    createdAt: '2024-01-05',
  },
  {
    id: '3',
    name: 'Support User',
    email: 'support@example.com',
    role: 'user',
    createdAt: '2024-01-10',
  },
  {
    id: '4',
    name: 'Content Manager',
    email: 'content@example.com',
    role: 'manager',
    createdAt: '2024-01-15',
  },
  {
    id: '5',
    name: 'Team Lead',
    email: 'teamlead@example.com',
    role: 'admin',
    createdAt: '2024-01-20',
  },
]
