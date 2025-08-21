// Define all possible translation keys with namespaces
export type TranslationNamespaces = 
  | 'common'
  | 'dashboard' 
  | 'customers'
  | 'analysis'
  | 'upload'
  | 'configuration';

// Type-safe key definitions per namespace
export interface TranslationKeys {
  common: {
    // Navigation
    'nav.dashboard': string;
    'nav.customers': string;
    'nav.analysis': string;
    'nav.upload': string;
    'nav.configuration': string;
    'nav.batch_processing': string;
    'nav.folders': string;
    'nav.notifications': string;
    'nav.debug': string;
    
    // Common UI
    'common.loading': string;
    'common.error': string;
    'common.success': string;
    'common.warning': string;
    'common.info': string;
    'common.save': string;
    'common.cancel': string;
    'common.delete': string;
    'common.edit': string;
    'common.view': string;
    'common.view_details': string;
    'common.actions': string;
    'common.submit': string;
    'common.select': string;
    'common.refresh': string;
    'common.stop': string;
    'common.test': string;
    'common.create': string;
    'common.update': string;
    'common.language_toggle': string;
    
    // Status
    'status.online': string;
    'status.offline': string;
    'status.pending': string;
    'status.running': string;
    'status.completed': string;
    'status.failed': string;
    'status.cancelled': string;
    'status.retrying': string;
    'status.skipped': string;
    'status.discovered': string;
    'status.queued': string;
    'status.processing': string;
    'status.active': string;
    'status.inactive': string;
    'status.idle': string;
    
    // Form Labels
    'form.name': string;
    'form.phone': string;
    'form.email': string;
    'form.status': string;
    'form.date': string;
    'form.score': string;
    'form.overall': string;
    'form.details': string;
    'form.upload_action': string;
    'form.download': string;
    'form.created_at': string;
    'form.last_analysis': string;
    
    // Error Messages
    'errors.something_went_wrong': string;
    'errors.try_again': string;
    'errors.contact_support': string;
    'errors.file_too_large': string;
    'errors.invalid_file_type': string;
    'errors.network_error': string;
    'errors.server_error': string;
    'errors.error_occurred': string;
    'errors.connection_failed': string;
    'errors.timeout_error': string;
    'errors.unknown_error': string;
  };
  
  dashboard: {
    'dashboard.title': string;
    'dashboard.recent_activity': string;
    'dashboard.score_distribution': string;
    'dashboard.stats_overview': string;
    'dashboard.stats.total_customers': string;
    'dashboard.stats.total_analyses': string;
    'dashboard.stats.average_score': string;
    'dashboard.stats.high_priority': string;
    'dashboard.no_recent_activity': string;
  };
  
  customers: {
    'customers.title': string;
    'customers.list': string;
    'customers.add': string;
    'customers.search': string;
    'customers.filter': string;
    'customers.no_customers': string;
    'customers.details.name': string;
    'customers.details.phone': string;
    'customers.details.email': string;
    'customers.search_customers': string;
    'customers.filter_customers': string;
    'customers.all_status': string;
  };
  
  analysis: {
    'analysis.title': string;
    'analysis.results': string;
    'analysis.score_breakdown': string;
    'analysis.hebrew_insights': string;
    'analysis.transcript': string;
    'analysis.category_scores': string;
    'analysis.overall_score': string;
    'analysis.recent_analyses': string;
    'analysis.no_analyses': string;
    'analysis.enhanced': string;
    'analysis.enhanced_not_available': string;
    'analysis.enhanced_not_available_desc': string;
    'analysis.version': string;
    'analysis.sentiment': string;
    'analysis.conversation_flow': string;
    'analysis.speaker_analysis': string;
    'analysis.objection_analysis': string;
    'analysis.context_insights': string;
    'analysis.confidence': string;
    'analysis.overall_sentiment': string;
    'analysis.sentiment_changes': string;
    'analysis.sentiment_summary': string;
    'analysis.positive_sentiment_summary': string;
    'analysis.negative_sentiment_summary': string;
    'analysis.neutral_sentiment_summary': string;
    'analysis.conversation_phases': string;
    'analysis.total_duration': string;
    'analysis.phases': string;
    'analysis.of_conversation': string;
    'analysis.key_events': string;
    'analysis.conversation_summary': string;
    'analysis.total_phases': string;
    'analysis.avg_phase_duration': string;
    'analysis.total_events': string;
    'analysis.customer_analysis': string;
    'analysis.engagement_level': string;
    'analysis.customer_objections': string;
    'analysis.buying_signals': string;
    'analysis.agent_analysis': string;
    'analysis.effectiveness_level': string;
    'analysis.effective_techniques': string;
    'analysis.areas_for_improvement': string;
    'analysis.interaction_summary': string;
    'analysis.customer_engagement': string;
    'analysis.agent_effectiveness': string;
    'analysis.objections_raised': string;
    'analysis.strength': string;
    'analysis.suggested_response': string;
    'analysis.key_insights': string;
    'analysis.recommendations': string;
    'analysis.risk_factors': string;
    'analysis.opportunities': string;
    'analysis.high': string;
    'analysis.medium': string;
    'analysis.low': string;
    'analysis.excellent': string;
    'analysis.good': string;
    'analysis.fair': string;
    'analysis.poor': string;
  };
  
  upload: {
    'upload.title': string;
    'upload.description': string;
    'upload.select_file': string;
    'upload.drag_drop': string;
    'upload.file_types': string;
    'upload.max_size': string;
    'upload.customer_information': string;
    'upload.progress': string;
    'upload.success': string;
    'upload.error': string;
  };
  
  configuration: {
    'config.title': string;
    'config.description': string;
    'config.help': string;
    'config.scoring_weights': string;
    'config.hebrew_phrases': string;
    'config.weights.urgency': string;
    'config.weights.budget': string;
    'config.weights.interest': string;
    'config.weights.engagement': string;
    'config.urgency_weight_help': string;
    'config.budget_weight_help': string;
    'config.interest_weight_help': string;
    'config.engagement_weight_help': string;
    'config.phrase_help_1': string;
    'config.phrase_help_2': string;
    'config.phrase_help_3': string;
    'config.phrase_help_4': string;
  };
}

// Utility type to get keys for a specific namespace
export type KeysForNamespace<T extends TranslationNamespaces> = keyof TranslationKeys[T];

// Language codes
export type LanguageCode = 'he' | 'en';

// RTL languages
export const RTL_LANGUAGES: LanguageCode[] = ['he'];

// Score categories
export type ScoreCategory = 'high' | 'good' | 'medium' | 'low';

// Score labels mapping
export interface ScoreLabels {
  high: string;
  good: string;
  medium: string;
  low: string;
}

// Category names mapping
export interface CategoryNames {
  urgency: string;
  budget: string;
  interest: string;
  engagement: string;
}

// Category descriptions mapping
export interface CategoryDescriptions {
  urgency: string;
  budget: string;
  interest: string;
  engagement: string;
}
