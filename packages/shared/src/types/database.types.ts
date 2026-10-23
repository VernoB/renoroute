export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      assessments: {
        Row: {
          ai_cost_usd: number | null;
          completed_at: string | null;
          created_at: string;
          error_code: string | null;
          home_id: string;
          id: string;
          input_snapshot: Json | null;
          locale: Database['public']['Enums']['app_locale'];
          model_info: Json | null;
          owner_id: string;
          status: Database['public']['Enums']['assessment_status'];
          submitted_at: string | null;
          transcript: string | null;
          voice_note_path: string | null;
        };
        ComputedFields: never;
        Insert: {
          ai_cost_usd?: number | null;
          completed_at?: string | null;
          created_at?: string;
          error_code?: string | null;
          home_id: string;
          id?: string;
          input_snapshot?: Json | null;
          locale?: Database['public']['Enums']['app_locale'];
          model_info?: Json | null;
          owner_id: string;
          status?: Database['public']['Enums']['assessment_status'];
          submitted_at?: string | null;
          transcript?: string | null;
          voice_note_path?: string | null;
        };
        Update: {
          ai_cost_usd?: number | null;
          completed_at?: string | null;
          created_at?: string;
          error_code?: string | null;
          home_id?: string;
          id?: string;
          input_snapshot?: Json | null;
          locale?: Database['public']['Enums']['app_locale'];
          model_info?: Json | null;
          owner_id?: string;
          status?: Database['public']['Enums']['assessment_status'];
          submitted_at?: string | null;
          transcript?: string | null;
          voice_note_path?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'assessments_home_id_fkey';
            columns: ['home_id'];
            isOneToOne: false;
            referencedRelation: 'homes';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'assessments_owner_id_fkey';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      audit_log: {
        Row: {
          action: string;
          actor_id: string | null;
          created_at: string;
          entity: string | null;
          entity_id: string | null;
          id: number;
          metadata: NonNullable<Json>;
        };
        ComputedFields: never;
        Insert: {
          action: string;
          actor_id?: string | null;
          created_at?: string;
          entity?: string | null;
          entity_id?: string | null;
          id?: never;
          metadata?: NonNullable<Json>;
        };
        Update: {
          action?: string;
          actor_id?: string | null;
          created_at?: string;
          entity?: string | null;
          entity_id?: string | null;
          id?: never;
          metadata?: NonNullable<Json>;
        };
        Relationships: [];
      };
      contractors: {
        Row: {
          business_name: string;
          contact_email: string;
          contact_phone: string | null;
          created_at: string;
          id: string;
          insurance_verified_at: string | null;
          languages: Database['public']['Enums']['app_locale'][];
          licence_notes: string | null;
          measures: Database['public']['Enums']['measure_code'][];
          profile_id: string | null;
          service_fsas: string[];
          status: Database['public']['Enums']['contractor_status'];
          stripe_customer_id: string | null;
          subscription_status: string | null;
          updated_at: string;
          website_url: string | null;
        };
        ComputedFields: never;
        Insert: {
          business_name: string;
          contact_email: string;
          contact_phone?: string | null;
          created_at?: string;
          id?: string;
          insurance_verified_at?: string | null;
          languages?: Database['public']['Enums']['app_locale'][];
          licence_notes?: string | null;
          measures?: Database['public']['Enums']['measure_code'][];
          profile_id?: string | null;
          service_fsas?: string[];
          status?: Database['public']['Enums']['contractor_status'];
          stripe_customer_id?: string | null;
          subscription_status?: string | null;
          updated_at?: string;
          website_url?: string | null;
        };
        Update: {
          business_name?: string;
          contact_email?: string;
          contact_phone?: string | null;
          created_at?: string;
          id?: string;
          insurance_verified_at?: string | null;
          languages?: Database['public']['Enums']['app_locale'][];
          licence_notes?: string | null;
          measures?: Database['public']['Enums']['measure_code'][];
          profile_id?: string | null;
          service_fsas?: string[];
          status?: Database['public']['Enums']['contractor_status'];
          stripe_customer_id?: string | null;
          subscription_status?: string | null;
          updated_at?: string;
          website_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'contractors_profile_id_fkey';
            columns: ['profile_id'];
            isOneToOne: true;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      energy_prices: {
        Row: {
          created_at: string;
          effective_from: string | null;
          fuel: Database['public']['Enums']['energy_fuel'];
          id: string;
          is_published: boolean;
          price_cad: number | null;
          source_url: string | null;
          unit: string | null;
          updated_at: string;
          verified_at: string | null;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          effective_from?: string | null;
          fuel: Database['public']['Enums']['energy_fuel'];
          id?: string;
          is_published?: boolean;
          price_cad?: number | null;
          source_url?: string | null;
          unit?: string | null;
          updated_at?: string;
          verified_at?: string | null;
        };
        Update: {
          created_at?: string;
          effective_from?: string | null;
          fuel?: Database['public']['Enums']['energy_fuel'];
          id?: string;
          is_published?: boolean;
          price_cad?: number | null;
          source_url?: string | null;
          unit?: string | null;
          updated_at?: string;
          verified_at?: string | null;
        };
        Relationships: [];
      };
      home_photos: {
        Row: {
          ai_analyzed_at: string | null;
          ai_observations: Json | null;
          bytes: number | null;
          category: Database['public']['Enums']['photo_category'];
          created_at: string;
          exif_stripped: boolean;
          height: number | null;
          home_id: string;
          id: string;
          owner_id: string;
          storage_path: string;
          width: number | null;
        };
        ComputedFields: never;
        Insert: {
          ai_analyzed_at?: string | null;
          ai_observations?: Json | null;
          bytes?: number | null;
          category: Database['public']['Enums']['photo_category'];
          created_at?: string;
          exif_stripped?: boolean;
          height?: number | null;
          home_id: string;
          id?: string;
          owner_id: string;
          storage_path: string;
          width?: number | null;
        };
        Update: {
          ai_analyzed_at?: string | null;
          ai_observations?: Json | null;
          bytes?: number | null;
          category?: Database['public']['Enums']['photo_category'];
          created_at?: string;
          exif_stripped?: boolean;
          height?: number | null;
          home_id?: string;
          id?: string;
          owner_id?: string;
          storage_path?: string;
          width?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'home_photos_home_id_fkey';
            columns: ['home_id'];
            isOneToOne: false;
            referencedRelation: 'homes';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'home_photos_owner_id_fkey';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      homes: {
        Row: {
          annual_electricity_kwh: number | null;
          annual_energy_cost_cad: number | null;
          annual_oil_litres: number | null;
          created_at: string;
          electric_utility: Database['public']['Enums']['electric_utility'];
          energy_advisor_status: Database['public']['Enums']['energy_advisor_status'];
          floor_area_sqft: number | null;
          has_basement: boolean | null;
          heating_primary: Database['public']['Enums']['heating_system'];
          heating_secondary: Database['public']['Enums']['heating_system'] | null;
          home_type: Database['public']['Enums']['home_type'] | null;
          household_income_band: Database['public']['Enums']['income_band'] | null;
          id: string;
          label: string;
          municipality: string | null;
          notes: string | null;
          occupants: number | null;
          owner_id: string;
          owner_occupied: boolean | null;
          postal_code_fsa: string | null;
          pre_evaluation_date: string | null;
          province: string;
          storeys: number | null;
          updated_at: string;
          water_heater: string | null;
          year_built: number | null;
        };
        ComputedFields: never;
        Insert: {
          annual_electricity_kwh?: number | null;
          annual_energy_cost_cad?: number | null;
          annual_oil_litres?: number | null;
          created_at?: string;
          electric_utility?: Database['public']['Enums']['electric_utility'];
          energy_advisor_status?: Database['public']['Enums']['energy_advisor_status'];
          floor_area_sqft?: number | null;
          has_basement?: boolean | null;
          heating_primary?: Database['public']['Enums']['heating_system'];
          heating_secondary?: Database['public']['Enums']['heating_system'] | null;
          home_type?: Database['public']['Enums']['home_type'] | null;
          household_income_band?: Database['public']['Enums']['income_band'] | null;
          id?: string;
          label?: string;
          municipality?: string | null;
          notes?: string | null;
          occupants?: number | null;
          owner_id: string;
          owner_occupied?: boolean | null;
          postal_code_fsa?: string | null;
          pre_evaluation_date?: string | null;
          province?: string;
          storeys?: number | null;
          updated_at?: string;
          water_heater?: string | null;
          year_built?: number | null;
        };
        Update: {
          annual_electricity_kwh?: number | null;
          annual_energy_cost_cad?: number | null;
          annual_oil_litres?: number | null;
          created_at?: string;
          electric_utility?: Database['public']['Enums']['electric_utility'];
          energy_advisor_status?: Database['public']['Enums']['energy_advisor_status'];
          floor_area_sqft?: number | null;
          has_basement?: boolean | null;
          heating_primary?: Database['public']['Enums']['heating_system'];
          heating_secondary?: Database['public']['Enums']['heating_system'] | null;
          home_type?: Database['public']['Enums']['home_type'] | null;
          household_income_band?: Database['public']['Enums']['income_band'] | null;
          id?: string;
          label?: string;
          municipality?: string | null;
          notes?: string | null;
          occupants?: number | null;
          owner_id?: string;
          owner_occupied?: boolean | null;
          postal_code_fsa?: string | null;
          pre_evaluation_date?: string | null;
          province?: string;
          storeys?: number | null;
          updated_at?: string;
          water_heater?: string | null;
          year_built?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'homes_owner_id_fkey';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      leads: {
        Row: {
          consent_share_at: string;
          contractor_id: string | null;
          created_at: string;
          homeowner_id: string;
          id: string;
          plan_id: string;
          plan_item_ids: string[];
          referral_fee_cad: number | null;
          shared_payload: Json | null;
          status: Database['public']['Enums']['lead_status'];
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          consent_share_at: string;
          contractor_id?: string | null;
          created_at?: string;
          homeowner_id: string;
          id?: string;
          plan_id: string;
          plan_item_ids?: string[];
          referral_fee_cad?: number | null;
          shared_payload?: Json | null;
          status?: Database['public']['Enums']['lead_status'];
          updated_at?: string;
        };
        Update: {
          consent_share_at?: string;
          contractor_id?: string | null;
          created_at?: string;
          homeowner_id?: string;
          id?: string;
          plan_id?: string;
          plan_item_ids?: string[];
          referral_fee_cad?: number | null;
          shared_payload?: Json | null;
          status?: Database['public']['Enums']['lead_status'];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'leads_contractor_id_fkey';
            columns: ['contractor_id'];
            isOneToOne: false;
            referencedRelation: 'contractors';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'leads_homeowner_id_fkey';
            columns: ['homeowner_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'leads_plan_id_fkey';
            columns: ['plan_id'];
            isOneToOne: false;
            referencedRelation: 'plans';
            referencedColumns: ['id'];
          },
        ];
      };
      measure_benchmarks: {
        Row: {
          assumptions: NonNullable<Json>;
          cost_high_cad: number;
          cost_low_cad: number;
          cost_unit: string;
          id: string;
          is_active: boolean;
          last_verified_at: string;
          measure: Database['public']['Enums']['measure_code'];
          province: string;
          savings_pct_high: number | null;
          savings_pct_low: number | null;
          source_url: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          assumptions?: NonNullable<Json>;
          cost_high_cad: number;
          cost_low_cad: number;
          cost_unit?: string;
          id?: string;
          is_active?: boolean;
          last_verified_at: string;
          measure: Database['public']['Enums']['measure_code'];
          province?: string;
          savings_pct_high?: number | null;
          savings_pct_low?: number | null;
          source_url: string;
          updated_at?: string;
        };
        Update: {
          assumptions?: NonNullable<Json>;
          cost_high_cad?: number;
          cost_low_cad?: number;
          cost_unit?: string;
          id?: string;
          is_active?: boolean;
          last_verified_at?: string;
          measure?: Database['public']['Enums']['measure_code'];
          province?: string;
          savings_pct_high?: number | null;
          savings_pct_low?: number | null;
          source_url?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          amount_cents: number;
          created_at: string;
          currency: string;
          id: string;
          owner_id: string | null;
          plan_id: string | null;
          product_code: string;
          status: Database['public']['Enums']['payment_status'];
          stripe_checkout_session_id: string | null;
          stripe_event_last_id: string | null;
          stripe_payment_intent_id: string | null;
          tax_cents: number;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          amount_cents: number;
          created_at?: string;
          currency?: string;
          id?: string;
          owner_id?: string | null;
          plan_id?: string | null;
          product_code: string;
          status?: Database['public']['Enums']['payment_status'];
          stripe_checkout_session_id?: string | null;
          stripe_event_last_id?: string | null;
          stripe_payment_intent_id?: string | null;
          tax_cents?: number;
          updated_at?: string;
        };
        Update: {
          amount_cents?: number;
          created_at?: string;
          currency?: string;
          id?: string;
          owner_id?: string | null;
          plan_id?: string | null;
          product_code?: string;
          status?: Database['public']['Enums']['payment_status'];
          stripe_checkout_session_id?: string | null;
          stripe_event_last_id?: string | null;
          stripe_payment_intent_id?: string | null;
          tax_cents?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'payments_owner_id_fkey';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payments_plan_id_fkey';
            columns: ['plan_id'];
            isOneToOne: false;
            referencedRelation: 'plans';
            referencedColumns: ['id'];
          },
        ];
      };
      plan_items: {
        Row: {
          confidence: string | null;
          cost_high_cad: number | null;
          cost_low_cad: number | null;
          created_at: string;
          id: string;
          matched_rebates: NonNullable<Json>;
          measure: Database['public']['Enums']['measure_code'];
          owner_id: string;
          plan_id: string;
          priority: number;
          rationale_en: string | null;
          rationale_fr: string | null;
          savings_high_cad: number | null;
          savings_kwh_high: number | null;
          savings_kwh_low: number | null;
          savings_low_cad: number | null;
          status: Database['public']['Enums']['item_status'];
          status_updated_at: string | null;
          title_en: string;
          title_fr: string;
        };
        ComputedFields: never;
        Insert: {
          confidence?: string | null;
          cost_high_cad?: number | null;
          cost_low_cad?: number | null;
          created_at?: string;
          id?: string;
          matched_rebates?: NonNullable<Json>;
          measure: Database['public']['Enums']['measure_code'];
          owner_id: string;
          plan_id: string;
          priority: number;
          rationale_en?: string | null;
          rationale_fr?: string | null;
          savings_high_cad?: number | null;
          savings_kwh_high?: number | null;
          savings_kwh_low?: number | null;
          savings_low_cad?: number | null;
          status?: Database['public']['Enums']['item_status'];
          status_updated_at?: string | null;
          title_en: string;
          title_fr: string;
        };
        Update: {
          confidence?: string | null;
          cost_high_cad?: number | null;
          cost_low_cad?: number | null;
          created_at?: string;
          id?: string;
          matched_rebates?: NonNullable<Json>;
          measure?: Database['public']['Enums']['measure_code'];
          owner_id?: string;
          plan_id?: string;
          priority?: number;
          rationale_en?: string | null;
          rationale_fr?: string | null;
          savings_high_cad?: number | null;
          savings_kwh_high?: number | null;
          savings_kwh_low?: number | null;
          savings_low_cad?: number | null;
          status?: Database['public']['Enums']['item_status'];
          status_updated_at?: string | null;
          title_en?: string;
          title_fr?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'plan_items_owner_id_fkey';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'plan_items_plan_id_fkey';
            columns: ['plan_id'];
            isOneToOne: false;
            referencedRelation: 'plans';
            referencedColumns: ['id'];
          },
        ];
      };
      plans: {
        Row: {
          annual_savings_high_cad: number | null;
          annual_savings_low_cad: number | null;
          assessment_id: string;
          content: NonNullable<Json>;
          created_at: string;
          disclaimer_version: string;
          home_id: string;
          id: string;
          locale: Database['public']['Enums']['app_locale'];
          owner_id: string;
          product_code: string | null;
          rebate_snapshot: NonNullable<Json>;
          rebates_high_cad: number | null;
          rebates_low_cad: number | null;
          schema_version: number;
          status: Database['public']['Enums']['plan_status'];
          summary_en: string | null;
          summary_fr: string | null;
          total_cost_high_cad: number | null;
          total_cost_low_cad: number | null;
          unlocked_at: string | null;
        };
        ComputedFields: never;
        Insert: {
          annual_savings_high_cad?: number | null;
          annual_savings_low_cad?: number | null;
          assessment_id: string;
          content: NonNullable<Json>;
          created_at?: string;
          disclaimer_version: string;
          home_id: string;
          id?: string;
          locale: Database['public']['Enums']['app_locale'];
          owner_id: string;
          product_code?: string | null;
          rebate_snapshot: NonNullable<Json>;
          rebates_high_cad?: number | null;
          rebates_low_cad?: number | null;
          schema_version?: number;
          status?: Database['public']['Enums']['plan_status'];
          summary_en?: string | null;
          summary_fr?: string | null;
          total_cost_high_cad?: number | null;
          total_cost_low_cad?: number | null;
          unlocked_at?: string | null;
        };
        Update: {
          annual_savings_high_cad?: number | null;
          annual_savings_low_cad?: number | null;
          assessment_id?: string;
          content?: NonNullable<Json>;
          created_at?: string;
          disclaimer_version?: string;
          home_id?: string;
          id?: string;
          locale?: Database['public']['Enums']['app_locale'];
          owner_id?: string;
          product_code?: string | null;
          rebate_snapshot?: NonNullable<Json>;
          rebates_high_cad?: number | null;
          rebates_low_cad?: number | null;
          schema_version?: number;
          status?: Database['public']['Enums']['plan_status'];
          summary_en?: string | null;
          summary_fr?: string | null;
          total_cost_high_cad?: number | null;
          total_cost_low_cad?: number | null;
          unlocked_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'plans_assessment_id_fkey';
            columns: ['assessment_id'];
            isOneToOne: true;
            referencedRelation: 'assessments';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'plans_home_id_fkey';
            columns: ['home_id'];
            isOneToOne: false;
            referencedRelation: 'homes';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'plans_owner_id_fkey';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          consent_ai_at: string | null;
          consent_marketing: boolean;
          consent_terms_at: string | null;
          consent_terms_version: string | null;
          created_at: string;
          full_name: string | null;
          id: string;
          phone: string | null;
          postal_code_fsa: string | null;
          preferred_locale: Database['public']['Enums']['app_locale'];
          role: Database['public']['Enums']['user_role'];
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          consent_ai_at?: string | null;
          consent_marketing?: boolean;
          consent_terms_at?: string | null;
          consent_terms_version?: string | null;
          created_at?: string;
          full_name?: string | null;
          id: string;
          phone?: string | null;
          postal_code_fsa?: string | null;
          preferred_locale?: Database['public']['Enums']['app_locale'];
          role?: Database['public']['Enums']['user_role'];
          updated_at?: string;
        };
        Update: {
          consent_ai_at?: string | null;
          consent_marketing?: boolean;
          consent_terms_at?: string | null;
          consent_terms_version?: string | null;
          created_at?: string;
          full_name?: string | null;
          id?: string;
          phone?: string | null;
          postal_code_fsa?: string | null;
          preferred_locale?: Database['public']['Enums']['app_locale'];
          role?: Database['public']['Enums']['user_role'];
          updated_at?: string;
        };
        Relationships: [];
      };
      rebate_checklist_items: {
        Row: {
          created_at: string;
          id: string;
          is_published: boolean;
          kind: Database['public']['Enums']['rebate_checklist_kind'];
          label_en: string;
          label_fr: string;
          program_id: string;
          sort_order: number;
          source_url: string | null;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          id?: string;
          is_published?: boolean;
          kind: Database['public']['Enums']['rebate_checklist_kind'];
          label_en: string;
          label_fr: string;
          program_id: string;
          sort_order?: number;
          source_url?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_published?: boolean;
          kind?: Database['public']['Enums']['rebate_checklist_kind'];
          label_en?: string;
          label_fr?: string;
          program_id?: string;
          sort_order?: number;
          source_url?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'rebate_checklist_items_program_id_fkey';
            columns: ['program_id'];
            isOneToOne: false;
            referencedRelation: 'rebate_programs';
            referencedColumns: ['id'];
          },
        ];
      };
      rebate_programs: {
        Row: {
          administrator: string;
          applies_to_utilities: Database['public']['Enums']['electric_utility'][] | null;
          closes_on: string | null;
          completion_window_months: number | null;
          created_at: string;
          id: string;
          income_max_cad: number | null;
          internal_notes: string | null;
          is_published: boolean;
          jurisdiction: string;
          last_verified_at: string;
          name_en: string;
          name_fr: string;
          official_url: string | null;
          opens_on: string | null;
          pre_evaluation_fee_cad: number | null;
          pre_evaluation_fee_note: string | null;
          requires_pre_evaluation: boolean;
          slug: string;
          source_url: string;
          status: Database['public']['Enums']['program_status'];
          summary_en: string | null;
          summary_fr: string | null;
          updated_at: string;
          verified_by: string | null;
          waitlist_note_en: string | null;
          waitlist_note_fr: string | null;
        };
        ComputedFields: never;
        Insert: {
          administrator: string;
          applies_to_utilities?: Database['public']['Enums']['electric_utility'][] | null;
          closes_on?: string | null;
          completion_window_months?: number | null;
          created_at?: string;
          id?: string;
          income_max_cad?: number | null;
          internal_notes?: string | null;
          is_published?: boolean;
          jurisdiction?: string;
          last_verified_at: string;
          name_en: string;
          name_fr: string;
          official_url?: string | null;
          opens_on?: string | null;
          pre_evaluation_fee_cad?: number | null;
          pre_evaluation_fee_note?: string | null;
          requires_pre_evaluation?: boolean;
          slug: string;
          source_url: string;
          status: Database['public']['Enums']['program_status'];
          summary_en?: string | null;
          summary_fr?: string | null;
          updated_at?: string;
          verified_by?: string | null;
          waitlist_note_en?: string | null;
          waitlist_note_fr?: string | null;
        };
        Update: {
          administrator?: string;
          applies_to_utilities?: Database['public']['Enums']['electric_utility'][] | null;
          closes_on?: string | null;
          completion_window_months?: number | null;
          created_at?: string;
          id?: string;
          income_max_cad?: number | null;
          internal_notes?: string | null;
          is_published?: boolean;
          jurisdiction?: string;
          last_verified_at?: string;
          name_en?: string;
          name_fr?: string;
          official_url?: string | null;
          opens_on?: string | null;
          pre_evaluation_fee_cad?: number | null;
          pre_evaluation_fee_note?: string | null;
          requires_pre_evaluation?: boolean;
          slug?: string;
          source_url?: string;
          status?: Database['public']['Enums']['program_status'];
          summary_en?: string | null;
          summary_fr?: string | null;
          updated_at?: string;
          verified_by?: string | null;
          waitlist_note_en?: string | null;
          waitlist_note_fr?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'rebate_programs_verified_by_fkey';
            columns: ['verified_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      rebate_rules: {
        Row: {
          amount_max_cad: number | null;
          amount_min_cad: number | null;
          amount_type: Database['public']['Enums']['amount_type'];
          conditions: NonNullable<Json>;
          created_at: string;
          eligibility_notes_en: string | null;
          eligibility_notes_fr: string | null;
          id: string;
          is_active: boolean;
          last_verified_at: string;
          max_units: number | null;
          measure: Database['public']['Enums']['measure_code'];
          program_id: string;
          source_url: string;
          unit_label_en: string | null;
          unit_label_fr: string | null;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          amount_max_cad?: number | null;
          amount_min_cad?: number | null;
          amount_type: Database['public']['Enums']['amount_type'];
          conditions?: NonNullable<Json>;
          created_at?: string;
          eligibility_notes_en?: string | null;
          eligibility_notes_fr?: string | null;
          id?: string;
          is_active?: boolean;
          last_verified_at: string;
          max_units?: number | null;
          measure: Database['public']['Enums']['measure_code'];
          program_id: string;
          source_url: string;
          unit_label_en?: string | null;
          unit_label_fr?: string | null;
          updated_at?: string;
        };
        Update: {
          amount_max_cad?: number | null;
          amount_min_cad?: number | null;
          amount_type?: Database['public']['Enums']['amount_type'];
          conditions?: NonNullable<Json>;
          created_at?: string;
          eligibility_notes_en?: string | null;
          eligibility_notes_fr?: string | null;
          id?: string;
          is_active?: boolean;
          last_verified_at?: string;
          max_units?: number | null;
          measure?: Database['public']['Enums']['measure_code'];
          program_id?: string;
          source_url?: string;
          unit_label_en?: string | null;
          unit_label_fr?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'rebate_rules_program_id_fkey';
            columns: ['program_id'];
            isOneToOne: false;
            referencedRelation: 'rebate_programs';
            referencedColumns: ['id'];
          },
        ];
      };
      waitlist: {
        Row: {
          consent_marketing: boolean;
          consent_text_version: string;
          converted_profile_id: string | null;
          created_at: string;
          email: string;
          heat: string | null;
          id: string;
          intent: string;
          locale: Database['public']['Enums']['app_locale'];
          price_variant: number;
          town: string | null;
          unsubscribed_at: string | null;
          utm_campaign: string | null;
          utm_content: string | null;
          utm_source: string | null;
        };
        ComputedFields: never;
        Insert: {
          consent_marketing: boolean;
          consent_text_version: string;
          converted_profile_id?: string | null;
          created_at?: string;
          email: string;
          heat?: string | null;
          id?: string;
          intent: string;
          locale?: Database['public']['Enums']['app_locale'];
          price_variant: number;
          town?: string | null;
          unsubscribed_at?: string | null;
          utm_campaign?: string | null;
          utm_content?: string | null;
          utm_source?: string | null;
        };
        Update: {
          consent_marketing?: boolean;
          consent_text_version?: string;
          converted_profile_id?: string | null;
          created_at?: string;
          email?: string;
          heat?: string | null;
          id?: string;
          intent?: string;
          locale?: Database['public']['Enums']['app_locale'];
          price_variant?: number;
          town?: string | null;
          unsubscribed_at?: string | null;
          utm_campaign?: string | null;
          utm_content?: string | null;
          utm_source?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'waitlist_converted_profile_id_fkey';
            columns: ['converted_profile_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
      recent_action_count: {
        Args: { p_action: string; p_actor: string; p_window: string };
        Returns: number;
      };
    };
    Enums: {
      amount_type:
        'fixed' | 'per_unit' | 'range' | 'percent' | 'loan' | 'financing' | 'rental' | 'fee';
      app_locale: 'fr' | 'en';
      assessment_status: 'draft' | 'submitted' | 'processing' | 'completed' | 'failed';
      contractor_status: 'pending' | 'vetted' | 'suspended';
      electric_utility:
        | 'nb_power'
        | 'saint_john_energy'
        | 'energie_edmundston'
        | 'perth_andover'
        | 'other'
        | 'unknown';
      energy_advisor_status:
        | 'none'
        | 'contacted'
        | 'pre_evaluation_booked'
        | 'pre_evaluation_done'
        | 'post_evaluation_done';
      energy_fuel: 'electricity' | 'heating_oil' | 'propane' | 'wood_pellets' | 'natural_gas';
      heating_system:
        | 'electric_baseboard'
        | 'electric_furnace'
        | 'oil_furnace'
        | 'oil_boiler'
        | 'propane'
        | 'natural_gas'
        | 'wood_stove'
        | 'pellet_stove'
        | 'mini_split_heat_pump'
        | 'central_heat_pump'
        | 'geothermal'
        | 'other'
        | 'unknown';
      home_type:
        'detached' | 'semi_detached' | 'row_house' | 'mobile_home' | 'cottage' | 'duplex' | 'other';
      income_band:
        'under_70k' | 'from_70k_to_100k' | 'from_100k_to_150k' | 'over_150k' | 'prefer_not_to_say';
      item_status: 'todo' | 'in_progress' | 'done' | 'skipped';
      lead_status: 'requested' | 'sent' | 'accepted' | 'declined' | 'won' | 'lost' | 'cancelled';
      measure_code:
        | 'pre_evaluation'
        | 'air_sealing'
        | 'attic_insulation'
        | 'wall_insulation'
        | 'basement_insulation'
        | 'windows'
        | 'doors'
        | 'mini_split_heat_pump'
        | 'central_heat_pump'
        | 'heat_pump_water_heater'
        | 'smart_thermostat'
        | 'ventilation_hrv'
        | 'solar_pv'
        | 'other'
        | 'ground_source_heat_pump'
        | 'electrical_panel_upgrade'
        | 'drain_water_heat_recovery';
      payment_status: 'pending' | 'succeeded' | 'failed' | 'refunded';
      photo_category:
        | 'exterior'
        | 'window'
        | 'door'
        | 'attic'
        | 'basement'
        | 'heating_equipment'
        | 'water_heater'
        | 'electrical_panel'
        | 'energy_bill'
        | 'room'
        | 'other';
      plan_status: 'preview' | 'unlocked' | 'archived';
      program_status: 'open' | 'waitlist' | 'full' | 'announced' | 'paused' | 'closed';
      rebate_checklist_kind: 'document' | 'invoice' | 'model_number' | 'deadline' | 'reminder';
      user_role: 'homeowner' | 'contractor' | 'admin';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema['CompositeTypes'] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      amount_type: ['fixed', 'per_unit', 'range', 'percent', 'loan', 'financing', 'rental', 'fee'],
      app_locale: ['fr', 'en'],
      assessment_status: ['draft', 'submitted', 'processing', 'completed', 'failed'],
      contractor_status: ['pending', 'vetted', 'suspended'],
      electric_utility: [
        'nb_power',
        'saint_john_energy',
        'energie_edmundston',
        'perth_andover',
        'other',
        'unknown',
      ],
      energy_advisor_status: [
        'none',
        'contacted',
        'pre_evaluation_booked',
        'pre_evaluation_done',
        'post_evaluation_done',
      ],
      energy_fuel: ['electricity', 'heating_oil', 'propane', 'wood_pellets', 'natural_gas'],
      heating_system: [
        'electric_baseboard',
        'electric_furnace',
        'oil_furnace',
        'oil_boiler',
        'propane',
        'natural_gas',
        'wood_stove',
        'pellet_stove',
        'mini_split_heat_pump',
        'central_heat_pump',
        'geothermal',
        'other',
        'unknown',
      ],
      home_type: [
        'detached',
        'semi_detached',
        'row_house',
        'mobile_home',
        'cottage',
        'duplex',
        'other',
      ],
      income_band: [
        'under_70k',
        'from_70k_to_100k',
        'from_100k_to_150k',
        'over_150k',
        'prefer_not_to_say',
      ],
      item_status: ['todo', 'in_progress', 'done', 'skipped'],
      lead_status: ['requested', 'sent', 'accepted', 'declined', 'won', 'lost', 'cancelled'],
      measure_code: [
        'pre_evaluation',
        'air_sealing',
        'attic_insulation',
        'wall_insulation',
        'basement_insulation',
        'windows',
        'doors',
        'mini_split_heat_pump',
        'central_heat_pump',
        'heat_pump_water_heater',
        'smart_thermostat',
        'ventilation_hrv',
        'solar_pv',
        'other',
        'ground_source_heat_pump',
        'electrical_panel_upgrade',
        'drain_water_heat_recovery',
      ],
      payment_status: ['pending', 'succeeded', 'failed', 'refunded'],
      photo_category: [
        'exterior',
        'window',
        'door',
        'attic',
        'basement',
        'heating_equipment',
        'water_heater',
        'electrical_panel',
        'energy_bill',
        'room',
        'other',
      ],
      plan_status: ['preview', 'unlocked', 'archived'],
      program_status: ['open', 'waitlist', 'full', 'announced', 'paused', 'closed'],
      rebate_checklist_kind: ['document', 'invoice', 'model_number', 'deadline', 'reminder'],
      user_role: ['homeowner', 'contractor', 'admin'],
    },
  },
} as const;
