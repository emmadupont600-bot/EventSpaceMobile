export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      promo_codes: {
        Row: {
          active: boolean
          code: string
          discount_type: string
          discount_value: number
          use_count: number
        }
      }
      venue_blocked_dates: {
        Row: {
          id: number
          venue_id: number
          blocked_date: string
          reason: string | null
        }
      }
      users: {
        Row: {
          id: string
          has_onboarded: boolean
          preferred_currency: string
        }
      }
      venues: {
        Row: {
          id: number
          currency: string
        }
      }
      reservations: {
        Row: {
          id: number
          currency: string | null
          promo_code: string | null
          discount_amount: number | null
        }
      }
    }
  }
}
