import React from 'react';
import { useCommonTranslation, useDashboardTranslation, useAnalysisTranslation } from '../../i18n/hooks/useTranslation';
import { useLanguage } from '../../i18n/context/LanguageProvider';

export const I18nExample: React.FC = () => {
  const { t: tCommon } = useCommonTranslation();
  const { t: tDashboard } = useDashboardTranslation();
  const { t: tAnalysis } = useAnalysisTranslation();
  const { currentLanguage, isRTL } = useLanguage();

  return (
    <div className={`p-6 bg-white rounded-lg shadow ${isRTL ? 'rtl-layout' : ''}`}>
      <h2 className={`text-xl font-bold mb-4 ${isRTL ? 'hebrew-content' : ''}`}>
        I18n System Demo
      </h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Current Language: {currentLanguage}</h3>
          <p>RTL: {isRTL ? 'Yes' : 'No'}</p>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">Common Translations:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Loading: {tCommon('common.loading')}</li>
            <li>Error: {tCommon('common.error')}</li>
            <li>Success: {tCommon('common.success')}</li>
            <li>Save: {tCommon('common.save')}</li>
          </ul>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">Dashboard Translations:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Title: {tDashboard('dashboard.title')}</li>
            <li>Recent Activity: {tDashboard('dashboard.recent_activity')}</li>
            <li>Total Customers: {tDashboard('dashboard.stats.total_customers')}</li>
          </ul>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">Analysis Translations:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Title: {String(tAnalysis('analysis.title'))}</li>
            <li>Results: {String(tAnalysis('analysis.results'))}</li>
            <li>Score Breakdown: {String(tAnalysis('analysis.score_breakdown'))}</li>
            <li>Excellent: {String(tAnalysis('analysis.excellent'))}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
